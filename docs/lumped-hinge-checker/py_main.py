### do not delete this import scripts ###
import json
from py_base import set_g_values, get_g_values, requests_json, MidasAPI, Product
from py_base_sub import HelloWorld, ApiGet
### do not delete this import scripts ###

def extract_member_type(text):
    first_underscore = text.find('_')
    last_underscore = text.rfind('_')
    
    if first_underscore != -1 and last_underscore != -1 and first_underscore < last_underscore:
        return text[first_underscore + 1:last_underscore]
    else:
        return None

def extract_member_no(text):
    # 마지막 "_"의 위치 찾기
    last_underscore_index = text.rfind('_')
    
    # 마지막 "_" 이후의 문자열 추출
    if last_underscore_index != -1:
        return text[last_underscore_index + 1:]
    else:
        return None

def convert_to_IJ(num):
    if num == 0:
        return 'I'
    elif num == 1:
        return 'J'
    else:
        raise ValueError("입력값은 0 또는 1이어야 합니다.")
    
def convert_to_plus_minus(num):
    if num == 0:
        return '+'
    elif num == 1:
        return '-'
    else:
        raise ValueError("입력값은 0 또는 1이어야 합니다.")

def sequence_id(data):
    for idx, item in enumerate(data):
        item['id'] = idx + 1
    return data

# GEN_API_URL = "https://api-beta.midasit.com:443/gen"
# MAPI_Key = "eyJ1ciI6ImNyZWNvbjMxIiwicGciOiJnZW4iLCJjbiI6IkRyeVdUWXJVVEEifQ.03138078f1851f14ba76b98bb5e748a0b97c565da781f5c56b6b5d86b4352b08"
# header = {"MAPI-Key": MAPI_Key}

def py_main():
    # iehp = requests.get(url=GEN_API_URL + "/db/IEHP", headers=header).json()
    # iehp_index_list = list(iehp["IEHP"].keys())
    civil = MidasAPI(Product.CIVIL, "KR")
    iehp = civil.db_read("IEHP")
    iehp_index_list = list(iehp.keys())
    print(iehp_index_list)
    iehp_len = len(iehp_index_list)

    row_fx = []
    row_fy = []
    row_fz = []
    row_mx = []
    row_my = []
    row_mz= []

    # 현재 API에서 BEAM인지 COLUMN인지 구분할 수 있는 데이터가 없어서, 자동으로 만들어진 Hinge의 경우에만 hinge name을 통해 유추하여 판단할 수 있음
    # IEHP가 현재 Assign Hinge Properties가 아닌 Inelastic Hinge Properties이고, 추후 API 수정 필요

    # beam , column index 번호 구분
    col_idx = []
    beam_idx = []
    for index in iehp_index_list :
        if extract_member_type(iehp[index]["NAME"]) == "CO" :
            col_idx.append(index)
        elif extract_member_type(iehp[index]["NAME"]) == "BE" :
            beam_idx.append(index)
        else :
            pass

    # 활성화된 Compoennt 별로 추리기
    fx_index = 0
    fy_index = 1
    fz_index = 2
    mx_index = 3
    my_index = 4
    mz_index = 5

    col_fx = []
    col_fy = []
    col_fz = []
    col_mx = []
    col_my = []
    col_mz = []
    beam_fx = []
    beam_fy = []
    beam_fz = []
    beam_mx = []
    beam_my = []
    beam_mz = []

    check_elem_no = []

    for idx in col_idx :
        for index, value in enumerate(iehp[idx]["COMPONENT_DIR"]) :
            if index == fx_index and value == True :
                col_fx.append(idx)
            elif index == fy_index and value == True :
                col_fy.append(idx)
            elif index == fz_index and value == True :
                col_fz.append(idx)
            elif index == mx_index and value == True :
                col_mx.append(idx)
            elif index == my_index and value == True :
                col_my.append(idx)
            elif index == mz_index and value == True :
                col_mz.append(idx)
            else :
                pass

    for idx in beam_idx :
        for index, value in enumerate(iehp[idx]["COMPONENT_DIR"]) :
            if index == fx_index and value == True :
                beam_fx.append(idx)
            elif index == fy_index and value == True :
                beam_fy.append(idx)
            elif index == fz_index and value == True :
                beam_fz.append(idx)
            elif index == mx_index and value == True :
                beam_mx.append(idx)
            elif index == my_index and value == True :
                beam_my.append(idx)
            elif index == mz_index and value == True :
                beam_mz.append(idx)
            else :
                pass

    # Hinge Location
    hinge_location = {
        0 : "I",
        1 : "J",
        2 : "I&J",
        3 : "Center"
    }

    # fx_strength
    id_counter = 1
    for idx in col_fx + beam_fx :
        # component = I&J 이면 두 번 출력
        if hinge_location[iehp[idx]["HINGE_LOCATION"][fx_index]] == "I&J" :
            for i in range(2) :
                # +,- 한 번씩 출력
                for j in range(2):
                    list_temp = []
                    name = iehp[idx]["NAME"]
                    ElemNo = extract_member_no(iehp[idx]["NAME"])
                    component = hinge_location[i]
                    ForceSign = convert_to_plus_minus(j)
                    strength = iehp[idx]["ALL_PROP"][fx_index]["FEMA"]["dYieldForce"][j]
                    if strength <= 0.01:
                        check = "CHECK"
                    else:
                        check = "-"
                    row = {
                        "id" : id_counter,
                        "Name" : name,
                        "ElemNo" : ElemNo,
                        "Component" : component,
                        "ForceSign" : ForceSign,
                        "Strength" : strength,
                        "Check" : check
                    }
                    row_fx.append(row)
                    id_counter += 1
        else :
            # +,- 한 번씩 출력
            for j in range(2):
                list_temp = []
                name = iehp[idx]["NAME"]
                ElemNo = extract_member_no(iehp[idx]["NAME"])
                component = hinge_location[iehp[idx]["HINGE_LOCATION"][fx_index]]
                ForceSign = convert_to_plus_minus(j)
                strength = iehp[idx]["ALL_PROP"][fx_index]["FEMA"]["dYieldForce"][j]
                if strength <= 0.01:
                    check = "CHECK"
                else:
                    check = "-"
                row = {
                    "id" : id_counter,
                    "Name" : name,
                    "ElemNo" : ElemNo,
                    "Component" : component,
                    "ForceSign" : ForceSign,
                    "Strength" : strength,
                    "Check" : check
                }
                row_fx.append(row)
                id_counter += 1

    # fy_strength
    id_counter = 1
    for idx in col_fy + beam_fy :
        # component = I&J 이면 두 번 출력
        if hinge_location[iehp[idx]["HINGE_LOCATION"][fy_index]] == "I&J" :
            for i in range(2) :
                # +,- 한 번씩 출력
                for j in range(2):
                    list_temp = []
                    name = iehp[idx]["NAME"]
                    ElemNo = extract_member_no(iehp[idx]["NAME"])
                    component = hinge_location[i]
                    ForceSign = convert_to_plus_minus(j)
                    strength = iehp[idx]["ALL_PROP"][fy_index]["FEMA"]["dYieldForce"][j]
                    if strength <= 0.01:
                        check = "CHECK"
                    else:
                        check = "-"
                    row = {
                        "id" : id_counter,
                        "Name" : name,
                        "ElemNo" : ElemNo,
                        "Component" : component,
                        "ForceSign" : ForceSign,
                        "Strength" : strength,
                        "Check" : check
                    }
                    row_fy.append(row)
                    id_counter += 1
        else :
            for j in range(2):
                list_temp = []
                name = iehp[idx]["NAME"]
                ElemNo = extract_member_no(iehp[idx]["NAME"])
                component = hinge_location[iehp[idx]["HINGE_LOCATION"][fy_index]]
                ForceSign = convert_to_plus_minus(j)
                strength = iehp[idx]["ALL_PROP"][fy_index]["FEMA"]["dYieldForce"][j]
                if strength <= 0.01:
                    check = "CHECK"
                else:
                    check = "-"
                row = {
                    "id" : id_counter,
                    "Name" : name,
                    "ElemNo" : ElemNo,
                    "Component" : component,
                    "ForceSign" : ForceSign,
                    "Strength" : strength,
                    "Check" : check
                }
                row_fy.append(row)
                id_counter += 1

    # fz_strength
    id_counter = 1
    for idx in col_fz + beam_fz :
        # component = I&J 이면 두 번 출력
        if hinge_location[iehp[idx]["HINGE_LOCATION"][fz_index]] == "I&J" :
            for i in range(2) :
                # +,- 한 번씩 출력
                for j in range(2):
                    list_temp = []
                    name = iehp[idx]["NAME"]
                    ElemNo = extract_member_no(iehp[idx]["NAME"])
                    component = hinge_location[i]
                    ForceSign = convert_to_plus_minus(j)
                    strength = iehp[idx]["ALL_PROP"][fz_index]["FEMA"]["dYieldForce"][j]
                    if strength <= 0.01:
                        check = "CHECK"
                    else:
                        check = "-"
                    row = {
                        "id" : id_counter,
                        "Name" : name,
                        "ElemNo" : ElemNo,
                        "Component" : component,
                        "ForceSign" : ForceSign,
                        "Strength" : strength,
                        "Check" : check
                    }
                    row_fz.append(row)
                    id_counter += 1
        else :
            for i in range(2) :
                # +,- 한 번씩 출력
                for j in range(2):
                    list_temp = []
                    name = iehp[idx]["NAME"]
                    ElemNo = extract_member_no(iehp[idx]["NAME"])
                    component = hinge_location[iehp[idx]["HINGE_LOCATION"][fz_index]]
                    ForceSign = convert_to_plus_minus(j)
                    strength = iehp[idx]["ALL_PROP"][fz_index]["FEMA"]["dYieldForce"][j]
                    if strength <= 0.01:
                        check = "CHECK"
                    else:
                        check = "-"
                    row = {
                        "id" : id_counter,
                        "Name" : name,
                        "ElemNo" : ElemNo,
                        "Component" : component,
                        "ForceSign" : ForceSign,
                        "Strength" : strength,
                        "Check" : check
                    }
                    row_fz.append(row)
                    id_counter += 1

    # mx_strength
    id_counter = 1
    for idx in col_mx + beam_mx :
        # +,- 한 번씩 출력
        # component = I&J 이면 두 번 출력
        if hinge_location[iehp[idx]["HINGE_LOCATION"][mx_index]] == "I&J" :
            for i in range(2) :
                for j in range(2):
                    list_temp = []
                    name = iehp[idx]["NAME"]
                    ElemNo = extract_member_no(iehp[idx]["NAME"])
                    component = hinge_location[i]
                    ForceSign = convert_to_plus_minus(j)
                    strength = iehp[idx]["ALL_PROP"][mx_index]["FEMA"]["dYieldMoment"][j]
                    if strength <= 0.01:
                        check = "CHECK"
                    else:
                        check = "-"
                    row = {
                        "id" : id_counter,
                        "Name" : name,
                        "ElemNo" : ElemNo,
                        "Component" : component,
                        "ForceSign" : ForceSign,
                        "Strength" : strength,
                        "Check" : check
                    }
                    row_mx.append(row)
                    id_counter += 1
        else :
            for j in range(2):
                list_temp = []
                name = iehp[idx]["NAME"]
                ElemNo = extract_member_no(iehp[idx]["NAME"])
                component = hinge_location[iehp[idx]["HINGE_LOCATION"][mx_index]]
                ForceSign = convert_to_plus_minus(j)
                strength = iehp[idx]["ALL_PROP"][mx_index]["FEMA"]["dYieldMoment"][j]
                if strength <= 0.01:
                    check = "CHECK"
                else:
                    check = "-"
                row = {
                    "id" : id_counter,
                    "Name" : name,
                    "ElemNo" : ElemNo,
                    "Component" : component,
                    "ForceSign" : ForceSign,
                    "Strength" : strength,
                    "Check" : check
                }
                row_mx.append(row)
                id_counter += 1

    # my_strength
    id_counter = 1
    for idx in col_my + beam_my :
        # component = I&J 이면 두 번 출력
        if hinge_location[iehp[idx]["HINGE_LOCATION"][my_index]] == "I&J" :
            for i in range(2) :
                # +,- 한 번씩 출력
                for j in range(2):
                    list_temp = []
                    name = iehp[idx]["NAME"]
                    ElemNo = extract_member_no(iehp[idx]["NAME"])
                    component = hinge_location[i]
                    ForceSign = convert_to_plus_minus(j)
                    strength = iehp[idx]["ALL_PROP"][my_index]["FEMA"]["dYieldMoment"][j]
                    if strength <= 0.01:
                        check = "CHECK"
                    else:
                        check = "-"
                    row = {
                        "id" : id_counter,
                        "Name" : name,
                        "ElemNo" : ElemNo,
                        "Component" : component,
                        "ForceSign" : ForceSign,
                        "Strength" : strength,
                        "Check" : check
                    }
                    row_my.append(row)
                    id_counter += 1
        else :
            # +,- 한 번씩 출력
                for j in range(2):
                    list_temp = []
                    name = iehp[idx]["NAME"]
                    ElemNo = extract_member_no(iehp[idx]["NAME"])
                    component = hinge_location[iehp[idx]["HINGE_LOCATION"][my_index]]
                    ForceSign = convert_to_plus_minus(j)
                    strength = iehp[idx]["ALL_PROP"][my_index]["FEMA"]["dYieldMoment"][j]
                    if strength <= 0.01:
                        check = "CHECK"
                    else:
                        check = "-"
                    row = {
                        "id" : id_counter,
                        "Name" : name,
                        "ElemNo" : ElemNo,
                        "Component" : component,
                        "ForceSign" : ForceSign,
                        "Strength" : strength,
                        "Check" : check
                    }
                    row_my.append(row)
                    id_counter += 1

    # mz_strength
    id_counter = 1
    for idx in col_mz + beam_mz :
        # component = I&J 이면 두 번 출력
        if hinge_location[iehp[idx]["HINGE_LOCATION"][mz_index]] == "I&J" :
            for i in range(2) :
                # +,- 한 번씩 출력
                for j in range(2):
                    list_temp = []
                    name = iehp[idx]["NAME"]
                    ElemNo = extract_member_no(iehp[idx]["NAME"])
                    component = hinge_location[i]
                    ForceSign = convert_to_plus_minus(j)
                    strength = iehp[idx]["ALL_PROP"][mz_index]["FEMA"]["dYieldMoment"][j]
                    if strength <= 0.01:
                        check = "CHECK"
                    else:
                        check = "-"
                    row = {
                        "id" : id_counter,
                        "Name" : name,
                        "ElemNo" : ElemNo,
                        "Component" : component,
                        "ForceSign" : ForceSign,
                        "Strength" : strength,
                        "Check" : check
                    }
                    row_mz.append(row)
                    id_counter += 1
        else :
            # +,- 한 번씩 출력
                for j in range(2):
                    list_temp = []
                    name = iehp[idx]["NAME"]
                    ElemNo = extract_member_no(iehp[idx]["NAME"])
                    component = hinge_location[iehp[idx]["HINGE_LOCATION"][mz_index]]
                    ForceSign = convert_to_plus_minus(j)
                    strength = iehp[idx]["ALL_PROP"][mz_index]["FEMA"]["dYieldMoment"][j]
                    if strength <= 0.01:
                        check = "CHECK"
                    else:
                        check = "-"
                    row = {
                        "id" : id_counter,
                        "Name" : name,
                        "ElemNo" : ElemNo,
                        "Component" : component,
                        "ForceSign" : ForceSign,
                        "Strength" : strength,
                        "Check" : check
                    }
                    row_mz.append(row)
                    id_counter += 1
    row_axial = row_fx
    row_shear = sequence_id(row_fy + row_fz)
    row_moment = sequence_id(row_mx + row_my + row_mz)
    all = {
        "axial": row_axial,
        "shear": row_shear,
        "moment": row_moment,
		}

    return json.dumps(all)

    # row_sum = row_fx + row_fy + row_fz + row_mx + row_my + row_mz
    # for i in range(len(row_sum)) :
    #     if row_sum[i]["Check"] == "CHECK" :
    #         check_elem_no.append(row_sum[i]["ElemNo"])
    #     else :
    #         pass

    # print(check_elem_no)
