import json
from pyscript_engineers_web import MidasAPI, Product


#ch_T함수
def ch_T(max_period, period, soilClass):
    DATA = []  # {period, Result}를 저장할 리스트
    mp = max_period
    increment = mp * 1/100  # 증가량
    p = 0.0
    for _ in range(len(period)):  # 0부터 101까지 102개의 데이터 생성
        if soilClass == "A" or soilClass =="B":
            while p <= max_period:  # p가 mp 이하인 동안 반복
                if p > 3:
                    cht = 3.15 / (p ** 2)
                elif p > 1.5:
                    cht = 1.05 / p
                elif p >= 0.3:
                    cht = 1.6 * (0.5 / p) ** 0.75
                elif p > 0.1:
                    cht = 2.35
                else:
                    cht = 1
                DATA.append(cht)
                p += increment  # p 값을 증가

        elif soilClass == "C":
            while p <= mp:
                if p > 3:
                    cht = 3.96 / (p ** 2)
                elif p > 1.5:
                    cht = 1.32 / p
                elif p >= 0.3:
                    cht = 2 * (0.5 / p) ** 0.75
                elif p > 0.1:
                    cht = 2.93
                else:
                    cht = 1.33
                DATA.append(cht)
                p += increment
        elif soilClass == "D":
            while p <= mp:
                if p > 3:
                    cht = 6.42 / (p ** 2)
                elif p > 1.5:
                    cht = 2.14 / p
                elif p >= 0.56:
                    cht = 2.4 * (0.75 / p) ** 0.75
                elif p > 0.1:
                    cht = 3
                elif p > 0:
                    cht = 1.12 + 1.88 * (p / 0.1)
                else:
                    cht = 1.12
                DATA.append(cht)
                p += increment
        elif soilClass == "E":
            while p <= mp:
                if p > 3:
                    cht = 9.96 / (p ** 2)
                elif p > 1.5:
                    cht = 3.32 / p
                elif p >= 1.0:
                    cht = 3.0 / (p ** 0.75)
                elif p > 0.1:
                    cht = 3
                elif p > 0:
                    cht = 1.12 + 1.88 * (p / 0.1)
                else:
                    cht = 1.12
                DATA.append(cht)
                p += increment
    return DATA


def nTD(max_period, period, dist):
    DATA = []
    mp = max_period
    increment = mp * 1/100  # 증가량
    p = 0.0  # 초기 p 값 설정
    for _ in range(len(period)):
        # nmax 계산
        if p >= 5:
            nmax = 1.72
        elif p >= 4:
            nmax = 0.12 * p + 1.12
        elif p > 1.5:
            nmax = 0.24 * p + 0.64
        else:
            nmax = 1
        
        # nTD 계산
        if dist > 20:
            nTD = 1
        elif dist > 2:
            nTD = 1 + (nmax - 1) * (20 - dist) / 18
        else:
            nTD = nmax
        
        DATA.append(nTD)
        p += increment  # p 값을 증가시킴

    return DATA


def NZ_input(soilClass, rf, hf, dist, df, max_period):
    #period 초기값 및 p 값을 증가시키면서 max_period까지 누적
    p=0
    per_list=[]

    while p <= max_period:
        per_list.append(round(p,5))
        p+=max_period*0.01

    period=sorted(set(per_list))
    CHT= ch_T(max_period, period, soilClass)
    NTD = nTD(max_period, period, dist)

    NTCH=[a*b for a,b in zip(NTD,CHT)]
    value= [x*rf*hf/df for x in NTCH]
    return json.dumps({'period':period,'value':value})
#print(NZ_input("A",1.3,0.08,2.0,1.5,6.0))
    # ==================================== Convert Period, value to aFUNC ================================== #
def to_aFUNC(period, value):
    # 결과 출력
    #print(period)
    #print(value)
    aFUNC = []
    for i in range(len(period)):
        
        PERIOD = period[i]
        VALUE = value[i]
        aFUNC.append({"PERIOD":PERIOD, "VALUE":VALUE})

    
    return aFUNC

    # ==================================== Ploting the Graph (Preview)================================== #
# def plot(period,value):
#     civilApp = MidasAPI(Product.CIVIL, "KR")
#     plt.plot(period,value)
#     plt.title("NZS1170.5 (2004)")
#     plt.xlabel("Period(sec)")
#     plt.ylabel("Spectral Data(g)")

#     plt.grid(True)


#     plt.show()

# ==================================== Gravity Value by Unit ================================== #
def UNIT_GET():
    civilApp = MidasAPI(Product.CIVIL, "KR")
    unit = civilApp.db_read("UNIT")
    #유닛에 따른 GRAV 값을 지정합니다.
    dist_unit = unit[1]['DIST']
    GRAV_const = 9.806
    if dist_unit == "M":
        GRAV_const = 9.806
    elif dist_unit == "CM":
        GRAV_const = 980.6
    elif dist_unit == "MM":
        GRAV_const = 9806
    elif dist_unit == "IN":
        GRAV_const = 386.063
    else:
        GRAV_const = 32.1719
    return GRAV_const

# ==================================== RS 입력 ================================== #

def SPFC_UPDATE(ID,name,GRAV, aFUNC):
    civilApp = MidasAPI(Product.CIVIL, "KR")
    data = {
        "NAME": name,
        "iTYPE": 1,
        "iMETHOD": 0,
        "SCALE": 1,
        "GRAV": GRAV,
        "DRATIO": 0.05,
        "STR": {
            "SPEC_CODE": "USER"
        },
        "aFUNC": aFUNC
    }
    civilApp.db_update_item("SPFC", ID, data)
    
    result_message = {"success":"Updating SPFC is completed"}
    return json.dumps(result_message)
    
def main_NZS1170_5_2004(
  func_name: str,
  soilClass: str, 
  rf: float, 
  hf: float, 
  dist: float, 
  df: float, 
  max_period: float
):
  # for graph data
    inputs = json.loads(NZ_input(soilClass, rf, hf, dist, df, max_period)) 	# Seismic Data, Maximum Period (sec)
    aPeriod = inputs["period"]# Period
    aValue = inputs["value"] # Spectral Data

    # do SPFC_UPDATE
    civilApp = MidasAPI(Product.CIVIL, "KR")
    ID = civilApp.db_get_next_id("SPFC")
    name = func_name 	
																			# func name
    aFUNC = to_aFUNC(aPeriod, aValue)
    GRAV = UNIT_GET()
    return SPFC_UPDATE(ID,name,GRAV, aFUNC)

