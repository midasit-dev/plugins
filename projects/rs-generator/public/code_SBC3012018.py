# this is sample code for python script.
# if you want to use other python files, import here and functions export your javascript code.
import json
from pyscript_engineers_web import set_g_values, get_g_values, requests_json
from pyscript_engineers_web import MidasAPI, Product
import pandas as pd

def get_fa_value(site_class, ss):
    # Redefine the table data manually based on the user's provided structure, without Site Class 'F'
    fa_data = {
        'Site Class': ['A', 'B', 'C', 'D', 'E'],
        'Ss<=0.25': [0.8, 1.0, 1.2, 1.6, 2.5],
        'Ss=0.5': [0.8, 1.0, 1.2, 1.4, 1.7],
        'Ss=0.75': [0.8, 1.0, 1.1, 1.2, 1.2],
        'Ss=1.0': [0.8, 1.0, 1.0, 1.1, 0.9],
        'Ss>=1.25': [0.8, 1.0, 1.0, 1.0, 0.9]
    }

    # Create the DataFrame
    fa_table = pd.DataFrame(fa_data)

    # Convert numeric values to floats where applicable
    for column in fa_table.columns[1:]:
        fa_table[column] = pd.to_numeric(fa_table[column], errors='coerce')

    # Find the row for the Site Class
    row_fa = fa_table[fa_table['Site Class'] == site_class]

    # Interpolate if needed
    if ss <= 0.25:
        return row_fa['Ss<=0.25'].values[0]
    elif ss <= 0.5:
        fa_1 = row_fa['Ss<=0.25'].values[0]
        fa_2 = row_fa['Ss=0.5'].values[0]
        return fa_1 + (fa_2 - fa_1) * (ss - 0.25) / 0.25
    elif ss <= 0.75:
        fa_1 = row_fa['Ss=0.5'].values[0]
        fa_2 = row_fa['Ss=0.75'].values[0]
        return fa_1 + (fa_2 - fa_1) * (ss - 0.5) / 0.25
    elif ss <= 1.0:
        fa_1 = row_fa['Ss=0.75'].values[0]
        fa_2 = row_fa['Ss=1.0'].values[0]
        return fa_1 + (fa_2 - fa_1) * (ss - 0.75) / 0.25
    elif ss < 1.25:
        fa_1 = row_fa['Ss=1.0'].values[0]
        fa_2 = row_fa['Ss>=1.25'].values[0]
        return fa_1 + (fa_2 - fa_1) * (ss - 1.0) / 0.25
    elif ss >= 1.25:
        return row_fa['Ss>=1.25'].values[0] 
    else:
        return "Invalid Ss value"

def get_fv_value(site_class, s1):
    # Redefine the table data manually based on the user's provided structure, without Site Class 'F'
    fv_data = {
        'Site Class': ['A', 'B', 'C', 'D', 'E'],
        'S1<=0.1': [0.8, 1.0, 1.7, 2.4, 3.5],
        'S1=0.2': [0.8, 1.0, 1.6, 2.0, 3.2],
        'S1=0.3': [0.8, 1.0, 1.5, 1.8, 2.8],
        'S1=0.4': [0.8, 1.0, 1.4, 1.6, 2.4],
        'S1>=0.5': [0.8, 1.0, 1.3, 1.5, 2.4]
    }

    # Create the DataFrame
    fv_table = pd.DataFrame(fv_data)
    # Convert numeric values to floats where applicable
    for column in fv_table.columns[1:]:
        fv_table[column] = pd.to_numeric(fv_table[column], errors='coerce')

    # Find the row for the Site Class
    row_fv = fv_table[fv_table['Site Class'] == site_class]

    # Interpolate if needed
    if s1 <= 0.1:
        return row_fv['S1<=0.1'].values[0]
    elif s1 <= 0.2:
        return row_fv['S1<=0.1'].values[0] + (row_fv['S1=0.2'].values[0] - row_fv['S1=0.1'].values[0]) * (s1 - 0.1) / (0.2 - 0.1)
    elif s1 <= 0.3:
        return row_fv['S1=0.2'].values[0] + (row_fv['S1=0.3'].values[0] - row_fv['S1=0.2'].values[0]) * (s1 - 0.2) / (0.3 - 0.2)
    elif s1 <= 0.4:
        return row_fv['S1=0.3'].values[0] + (row_fv['S1=0.4'].values[0] - row_fv['S1=0.3'].values[0]) * (s1 - 0.3) / (0.4 - 0.3)
    elif s1 < 0.5:
        return row_fv['S1=0.4'].values[0] + (row_fv['S1>=0.5'].values[0] - row_fv['S1=0.4'].values[0]) * (s1 - 0.4) / (0.5 - 0.4)
    elif s1 >= 0.5:
        return row_fv['S1>=0.5'].values[0] 
    else:
        return "Invalid S1 value"


# ==================================== SBC 입력 ================================== #

def SBC_input(site_class, ss, s1, importance_factor, response_factor, TL, max_period):
    fa = get_fa_value(site_class, ss)
    fv = get_fv_value(site_class, s1)
    sds = ss * fa * 2 / 3
    sd1 = s1 * fv * 2 / 3
    Ts=sd1/sds
    T0=0.2*Ts
    p=0
    I=importance_factor
    R=response_factor
    per_list=[]
    while p<=max_period:
        per_list.append(round(p,5))
        p+=max_period*0.01
    period=sorted(set(per_list))
    value=[]
    for p in period:
        if p<T0:
            value.append(sds*(0.4+0.6*p/T0)*I/R)
        elif p>=T0 and p<Ts:
            value.append(sds*I/R)
        elif p>=Ts and p<=TL:
            value.append(sd1/p*I/R)
        else:
            value.append(sd1*TL/p**2*I/R)
    return json.dumps({'period':period,'value':value})

def to_aFUNC(period, value):
    aFUNC = []
    for i in range(len(period)):
        PERIOD = period[i]
        VALUE = value[i]
        aFUNC.append({"PERIOD":PERIOD, "VALUE":VALUE})
        # print(PERIOD)
    return aFUNC
        
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


def generate_description(
    standard: str,
    site_class: str,
    ss: float,
    s1: float,
    importance_factor: float,
    response_factor: float,
    TL: float,
    max_period: float
) -> str:
    fa = get_fa_value(site_class, ss)
    fv = get_fv_value(site_class, s1)
    sds = ss * fa * 2 / 3
    sd1 = s1 * fv * 2 / 3

    desc = f"{standard}, Site Class={site_class}, Ss={ss:.3f}, S1={s1:.3f}, Fa={fa:.2f}, Fv={fv:.2f}, "
    desc += f"Sds={sds:.3f}, Sd1={sd1:.3f}, I={importance_factor:.2f}, R={response_factor:.2f}, TL={TL:.2f}, Max Period={max_period:.2f}s"
    return desc


# ==================================== RS 입력 ================================== #

def SPFC_UPDATE(ID, name, GRAV, aFUNC, description):
    civilApp = MidasAPI(Product.CIVIL, "KR")
    data = {
        "NAME": name,
        "iTYPE": 1,
        "iMETHOD": 0,
        "SCALE": 1,
        "GRAV": GRAV,
        "DRATIO": 0.05,
        "DESC": description,
        "STR": {
            "SPEC_CODE": "USER"
        },
        "aFUNC": aFUNC
    }
    civilApp.db_update_item("SPFC", ID, data)
    return json.dumps({"success": "Updating SPFC is completed"})
    
def main_SBC_301_CR_2018(
    func_name: str,
    site_class: str, 
    ss: float, 
    s1: float, 
    importance_factor: float,
    response_factor: float,
    TL: float,
    max_period: float
):
    # 계산
    inputs = json.loads(SBC_input(site_class, ss, s1, importance_factor, response_factor, TL, max_period))
    aPeriod = inputs["period"]
    aValue = inputs["value"]
    aFUNC = to_aFUNC(aPeriod, aValue)
    GRAV = UNIT_GET()

    # DESC 생성
    description = generate_description(
        standard="SBC 301-CR:2018",
        site_class=site_class,
        ss=ss,
        s1=s1,
        importance_factor=importance_factor,
        response_factor=response_factor,
        TL=TL,
        max_period=max_period
    )

    # 업데이트
    civilApp = MidasAPI(Product.CIVIL, "KR")
    ID = civilApp.db_get_next_id("SPFC")
    return SPFC_UPDATE(ID, func_name, GRAV, aFUNC, description)

        




