import json
from pyscript_engineers_web import MidasAPI, Product

# ch_T 함수 개선
def ch_T(soilClass, max_period):
    DATA = []
    increment = max_period / 100
    p = 0.0
    while p <= max_period:
        if soilClass == "Ae":
            if p > 1.5:
                cht = 1.056 / (p ** 2)
            elif p > 0.1:
                cht = min(0.704 / p, 2.35)
            else:
                cht = 0.8 + 15.5 * p
        elif soilClass == "Be":
            if p > 1.5:
                cht = 1.32 / (p ** 2)
            elif p > 0.1:
                cht = min(0.88 / p, 2.94)
            else:
                cht = 1.0 + 19.4 * p
        elif soilClass == "Ce":
            if p > 1.5:
                cht = 1.874 / (p ** 2)
            elif p > 0.1:
                cht = min(1.25 / p, 3.68)
            else:
                cht = 1.3 + 23.8 * p
        elif soilClass == "De":
            if p > 1.5:
                cht = 2.97 / (p ** 2)
            elif p > 0.1:
                cht = min(1.98 / p, 3.68)
            else:
                cht = 1.1 + 25.8 * p
        elif soilClass == "Ee":
            if p > 1.5:
                cht = 4.62 / (p ** 2)
            elif p > 0.1:
                cht = min(3.08 / p, 3.68)
            else:
                cht = 1.1 + 25.8 * p
        else:
            raise ValueError("Invalid soilClass")
        DATA.append(cht)
        p += increment
    return DATA


# spectrum 값 계산 함수
def AS_input(soilClass, spectrum_type, kp, z, sp, mu, max_period):
    # spectrum_type을 대문자로 변환
    spectrum_type = spectrum_type.upper()
    
    # spectrum_type이 숫자일 경우, 문자열로 변환
    if spectrum_type == "1":
        spectrum_type = "HORIZONTAL"
    elif spectrum_type == "2":
        spectrum_type = "VERTICAL"

    p = 0
    per_list = []
    while p <= max_period:
        per_list.append(round(p, 5))
        p += max_period * 0.01

    period = sorted(set(per_list))
    CHT = ch_T(soilClass, max_period)

    if spectrum_type == "HORIZONTAL":
        value = [kp * z * cht * sp / mu for cht in CHT]
    elif spectrum_type == "VERTICAL":
        value = [0.5 * kp * z * cht * sp for cht in CHT]
    else:
        raise ValueError("Invalid spectrum type")

    return json.dumps({'period': period, 'value': value})

# aFUNC 데이터 생성
def to_aFUNC(period, value):
    aFUNC = []
    for i in range(len(period)):
        PERIOD = period[i]
        VALUE = value[i]
        aFUNC.append({"PERIOD":PERIOD, "VALUE":VALUE})
    return aFUNC

# MIDAS 단위 가져오기
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


# MIDAS DB 업데이트
def SPFC_UPDATE(ID, name, GRAV, aFUNC):
    civilApp = MidasAPI(Product.CIVIL, "KR")
    data = {
        "NAME": name,
        "iTYPE": 1,
        "iMETHOD": 0,
        "SCALE": 1,
        "GRAV": GRAV,
        "DRATIO": 0.05,
        "STR": {"SPEC_CODE": "USER"},
        "aFUNC": aFUNC
    }
    civilApp.db_update_item("SPFC", ID, data)
    return json.dumps({"success": "Updating SPFC is completed"})


# 전체 프로세스를 실행하는 메인 함수
def main_AS1170_4_2024(
    func_name: str,
    soilClass: str,
    spectrum_type: str,
    kp: float,
    z: float,
    sp: float,
    mu: float,
    max_period: float
):
    # for graph data
    inputs = json.loads(AS_input(
        soilClass, spectrum_type, kp, z, sp, mu, max_period
    ))      
    aPeriod = inputs["period"]
    aValue = inputs["value"]        
    
    civilApp = MidasAPI(Product.CIVIL, "KR")
    ID = civilApp.db_get_next_id("SPFC")
    name = func_name
    aFUNC = to_aFUNC(aPeriod, aValue)
    GRAV = UNIT_GET()
    result = SPFC_UPDATE(ID, name, GRAV, aFUNC) 
    return result


