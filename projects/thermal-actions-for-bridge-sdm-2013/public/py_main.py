### do not delete this import scripts ###
import json
from py_base import set_g_values, get_g_values, requests_json, MidasAPI, Product
from py_base_sub import HelloWorld, ApiGet
### do not delete this import scripts ###
import numpy as np

'''==============================Unifrom Temperature Calculation=============================='''

def uniform_bridge_temperature(
        super_type: int,
        struct_type: str
    )-> dict:
    
    '''
    아래 표를 이용해서 상부 형식과 구조 형식을 받아서, Te,min과 Te,max를 반환한다.

    Structures Design Manual for Highways and Railways 2013 Edition (SDM2013)
    Table 3.17 - Uniform Bridge Temperature(with Climate Change Effects)
    ------------------------------------------------------------------------
    | Superstructure Type |   Normal Structures    |  Minor Structures     |
    | (see Figure 3.2     |------------------------|-----------------------|
    | for classification) | Te,min °C  | Te,max °C | Te,min °C | Te,max °C |
    ------------------------------------------------------------------------
    |          1          |     0      |     55    |     0     |     53    |
    ------------------------------------------------------------------------
    |          2          |     0      |     48    |     0     |     46    |
    ------------------------------------------------------------------------
    |          3          |     0      |     45    |     0     |     43    |
    ------------------------------------------------------------------------
    
    Args:
        super_type (int): Superstructure Type
        struct_type (str): Strcutre Type
    
    Returns:
        dict: Te_min, Te_max
    '''
    
    # Table Data
    uniform_br_temp = {
        1: {
            "Normal": {
                "Te_min": 0,
                "Te_max": 55
            },
            "Minor": {
                "Te_min": 0,
                "Te_max": 53
            }
        },
        2: {
            "Normal": {
                "Te_min": 0,
                "Te_max": 48
            },
            "Minor": {
                "Te_min": 0,
                "Te_max": 46
            }
        },
        3: {
            "Normal": {
                "Te_min": 0,
                "Te_max": 45
            },
            "Minor": {
                "Te_min": 0,
                "Te_max": 43
            }
        }
    }

    return uniform_br_temp[super_type][struct_type]

def adjustment_temperature_for_surfacing(
        super_type: int,
        deck_surf_type: str,
        deck_surf_thick: float,
        adj_option: bool
    )-> dict:
    
    '''
    아래 표를 이용해서 상부 형식, 데크 표면 형식을 받아서, 최소 및 최대 교량 온도에 대한 조정 값을 반환한다.

    1. deck_surf_type 이 "thickness"가 아닌 경우,
        데크 표면 형식에 따라 조정 값을 반환한다.

    2. deck_surf_type 이 "thickness"인 경우,
        데크 표면 두께를 받아서 조정 값을 반환한다.
        200mm 넘어가는 경우, 200mm의 값을 반환한다.

        2.1 adj_option = True 이면,
            데크 표면 두께에 따라 보간하여 조정 값을 반환한다.
            보간은 Unsurfaced Trafficked or Waterproofed를 0mm으로 보고, 40mm, 100mm, 200mm에 대해 보간한다.
            *Note에 (1) Surfacing depths include waterproofing으로 참조로 0mm == waterproofing이라고 가정한다.

        2.2 adj_option = False 이면,
            입력된 데크 표면 두께보다 큰 두께에 대한 조정 값을 반환한다.

    Structures Design Manual for Highways and Railways 2013 Edition (SDM2013)
    Table 3.18 - Adjustment to Uniform Bridge Temperature for Deck Surfacing
    -------------------------------------------------------------------------------
    |     Deck Surface      |  Additional To Minimum   |  Additional To Maximum   |   
    |                       |      Uniform Bridge      |      Unifrom Bridge      |
    |                       |      Temperature °C      |      Temperature °C      |
    |                       |--------------------------|--------------------------|
    |                       | Type 1 | Type 2 | Type 3 | Type 1 | Type 2 | Type 3 |
    -------------------------------------------------------------------------------
    | Unsurfaced Plain      |    0   |   -3   |   -1   |   +4   |    0   |    0   |
    -------------------------------------------------------------------------------
    | Unsurfaced Trafficked |    0   |   -3   |   -1   |   +2   |   +4   |   +2   |
    | or Waterproofed       |        |        |        |        |        |        |
    -------------------------------------------------------------------------------
    | 40 mm Surfacing       |    0   |   -2   |   -1   |    0   |   +2   |   +1   |
    -------------------------------------------------------------------------------
    | 100 mm Surfacing(1)   |   N/A  |    0   |    0   |   N/A  |    0   |    0   |
    -------------------------------------------------------------------------------
    | 200 mm Surfacing(1)   |   N/A  |   +3   |   +1   |   N/A  |   -4   |   -2   |
    -------------------------------------------------------------------------------
    Notes: (1) Surfacing depths include waterproofing
            (2) N/A = not applicable
    
    Args:
        super_type (int): Superstructure Type
        deck_surf_type (str): Deck Surface Type
        deck_surf_thick (float): Deck Surface Thickness
        adj_option (bool): Adjustment Option
        
    Returns:
        dict: Tadj_min, Tadj_max
    '''

    # Table Data for Unsufaced Plain
    adj_plain = {
        1: {
            "Tadj_min": 0,
            "Tadj_max": 4
        },
        2: {
            "Tadj_min": -3,
            "Tadj_max": 0
        },
        3: {
            "Tadj_min": -1,
            "Tadj_max": 0
        }
    }

    # Table Data for Unsufaced Trafficked or Waterproofed
    adj_trafficked_waterproofed = {
        1: {
            "Tadj_min": 0,
            "Tadj_max": 2
        },
        2: {
            "Tadj_min": -3,
            "Tadj_max": 4
        },
        3: {
            "Tadj_min": -1,
            "Tadj_max": 2
        }
    }

    # Table Data for Deck Surface Thickness
    adj_thickness = {
        1: {
            0: {
                "Tadj_min": 0,
                "Tadj_max": 2
            },
            40: {
                "Tadj_min": 0,
                "Tadj_max": 0
            },
            100: {
                "Tadj_min": 0,
                "Tadj_max": 0
            },
            200: {
                "Tadj_min": 0,
                "Tadj_max": 0
            }
        },
        2: {
            0: {
                "Tadj_min": -3,
                "Tadj_max": 4
            },
            40: {
                "Tadj_min": -2,
                "Tadj_max": 2
            },
            100: {
                "Tadj_min": 0,
                "Tadj_max": 0
            },
            200: {
                "Tadj_min": 3,
                "Tadj_max": -4
            }
        },
        3: {
            0: {
                "Tadj_min": -1,
                "Tadj_max": 2
            },
            40: {
                "Tadj_min": -1,
                "Tadj_max": 1
            },
            100: {
                "Tadj_min": 0,
                "Tadj_max": 0
            },
            200: {
                "Tadj_min": 1,
                "Tadj_max": -2
            }
        }
    }

    # 형식과 옵션에 따라 조정값 반환
    if deck_surf_type == "plain":
        adj_temp =  adj_plain[super_type]
    elif deck_surf_type == "trafficked" or deck_surf_type == "waterproofed":
        adj_temp =  adj_trafficked_waterproofed[super_type]
    elif deck_surf_type == "thickness":
        # 상부 형식에 따른 데이터 추출하고 두께에 따라 정렬한다.
        adj_type = adj_thickness[super_type]
        sorted_keys = sorted(adj_type.keys())

        # 입력 두께가 범위 밖인 경우, 최소/최대 경계값 반환
        if deck_surf_thick <= sorted_keys[0]:
            # 0mm 보다 작거나 같다.
            adj_temp = adj_type[sorted_keys[0]]
        elif deck_surf_thick >= sorted_keys[-1]:
            # 200mm 보다 크거나 작다.
            adj_temp = adj_type[sorted_keys[-1]]        
        else:
            # 0~200 사이일 경우
            # 선형 보간
            if adj_option:
                for i in range(len(sorted_keys)-1):
                    lower_key = sorted_keys[i]
                    upper_key = sorted_keys[i+1]
                    
                    if lower_key <= deck_surf_thick <= upper_key:
                        #보간 비율
                        ratio = (deck_surf_thick - lower_key) / (upper_key - lower_key)
                        
                        # Tadj_min과 Tadj_max 보간 값 계산
                        Tadj_min = (1-ratio) * adj_type[lower_key]["Tadj_min"] + ratio * adj_type[upper_key]["Tadj_min"]
                        Tadj_max = (1-ratio) * adj_type[lower_key]["Tadj_max"] + ratio * adj_type[upper_key]["Tadj_max"]
                        
                        adj_temp = { "Tadj_min": Tadj_min, "Tadj_max": Tadj_max }
            # 천장법
            else:
                for key in sorted_keys:
                    if key >= deck_surf_thick:
                        adj_temp = adj_type[key]
                        break

    return adj_temp

def adjustment_temperature_for_height(
    height_sea_level:float
    )-> dict:
    
    '''
    해발고도를 받아서, 조정값을 반환한다.
    
    Structures Design Manual for Highways and Railways 2013 Edition (SDM2013)
    3.5.2 Uniform Temperature Componets
    3.5.2.(5) The values of uniform temperature given in Table 3.17 shall be adjusted for height
    above mean sea level by subtracting 0.5℃ per 100 m height for minimum uniform temperatures and
    1.0℃ per 100 m height for maximum uniform temperatures.
    
    Args:
        height_sea_level (float): Height above sea level
        
    Returns:
        dict: Tadj_min, Tadj_max
    '''
    
    # 100m당 감소 비율 정의
    min_temp_decrement_per_100m = 0.5
    max_temp_decrement_per_100m = 1.0
    
    # 높이에 따른 감소량 계산
    Tadj_min = - (height_sea_level / 100) * min_temp_decrement_per_100m
    Tadj_max = - (height_sea_level / 100) * max_temp_decrement_per_100m
    
    return {"Tadj_min": Tadj_min, "Tadj_max": Tadj_max}
    
def calc_final_temperatures(
        uni_temps: dict,
        adj_type_temps: dict,
        adj_height_temps: dict,
    )->dict:

    '''
    uniform_bridge_temperature, adjustment_temperature_for_surfacing, adjustment_temperature_for_height
    위 세개로 부터 나온 값으로부터 최종 온도값을 계산한다.
    
    Structures Design Manual for Highways and Railways 2013 Edition (SDM2013)
    3.5.2 Uniform Temperature Componets
    3.5.2.(6) The initial bridge temperature T0 at the time the structure is effectively restrained upon 
    completion of construction shall be taken as 30ºC for calculating contraction down to 
    the minimum uniform bridge temperature component and 10ºC for calculating 
    expansion up to the maximum uniform bridge temperature component. Values given in 
    Clause A.1(3) NOTE of BS EN 1991-1-5 and Clause NA.2.21 of the UK NA to BS EN 
    1991-1-5 shall not be used.

    유의할 부분!!!!
    이는 Civil의 기준온도가 0라는 가정하의 계산되는 것이므로,
    Initial Temperature 가 0도가 아닐 경우, 다시 보정해야 한다. 이건 API로 보내기 전에 처리!
    
    Args:
        uni_temps (dict): uniform_bridge_temperature
        adj_type_temps (dict): adjustment_temperature_for_surfacing
        adj_height_temps (dict): adjustment_temperature_for_height
        
    Returns:
        dict: Texp, Tcon
    '''
    
    # 기준 온도 정의
    initial_max_temp = 10
    initial_min_temp = 30

    # 기준 온도로부터 최종 온도 변화량 계산
    final_expansion_temp = (uni_temps["Te_max"] + adj_type_temps["Tadj_max"] + adj_height_temps["Tadj_max"]) - initial_max_temp
    final_contraction_temp = (uni_temps["Te_min"] + adj_type_temps["Tadj_min"] + adj_height_temps["Tadj_min"]) - initial_min_temp
    
    result = {
        "Texp": final_expansion_temp,
        "Tcon": final_contraction_temp
    }

    return result

def create_etmp_json(
        final_temp: dict,
        lcname_to_apply: list
    )-> dict:
    
    '''
    # 최종온도와 적용할 LCNAME을 받아서, ETMP JSON을 생성하고, 요청한다.
    # 중요한 건 역시 프로그램의 Initial Temperature가 0이라면 보정해서 넣어야 한다.
    
    Args:
        final_temp (dict): final_expansion_temp, final_contraction_temp
        lcname_to_apply (list): LCNAME to apply
    
    Returns:
        dict: message
    '''
    
    # API 이용하자
    civil = MidasAPI(Product.CIVIL, "KR")
    
    # 현재 선택된 요소 가져오기
    res_select = civil.view_select_get()
    elem_list = res_select["ELEM_LIST"]
    
    # 선택된 요소가 없다면, 에러 메시지 반환
    if len(elem_list) == 0:
        message = {
            "error": {
                "message": "No element selected."
            }
        }
        return message

    # 단위를 가져와서 셀시우스인지 확인하자.
    # 만약 셀시우스가 아니라면, 셀시우스로 변경하자.
    res_unit = civil.db_read("UNIT")
    unit_temp = res_unit[1]["TEMPER"]
    
    if unit_temp != "C":
        json_unit = {
            1: {
                "TEMPER": "C"
            }
        }
        
        civil.db_update("UNIT", json_unit)
    
    # 프로그램의 적용되어 있는 초기 온도를 가져오자.
    res_styp = civil.db_read("STYP")
    initial_temp = res_styp[1]["TEMP"]
    
    # 초기 온도에 계산 최종 온도값을 더하자!!!!!!!! 중요!!!!!!
    max_temp = initial_temp + final_temp["Texp"]
    min_temp = initial_temp + final_temp["Tcon"]
    
    # 선택된 요소에 온도하중을 줘야 한다.
    # 온도하중이 들어가 있는 요소가 있는지 확인하자.
    res_etmp = civil.db_read("ETMP")
    
    # 25-03-20 홍콩 교통부 요청 - 덮어 씌우는 동작이 됐으면 좋겠다.
    # 이번에 다시 확인해 본 결과 PUT동작으로 정상동작이 되는 것을 확인.
    # 처음부터 잘못 파악한 원인
    # 예를 들어 ELEMENT, LCNAME이 일치한다. 여기는 ID=1이다.
    # 이 곳에 PUT으로 같은 ELEMENT, LCNAME, ID=2로 요청하면, ID=1이 ID=2가 되면서 더해지는 동작을 한다.
    # 따라서, ELEMENT, LCNAME이 일치하면, ID=1로 요청해야 한다. 내가 잘못 만들었음
    #
    # 로직은 다음과 같이 다시 짠다.
    # 선택한 요소를 DO LOOP를 돌린다.
    # 선택한 요소는 온도하중을 가지고 있나?
    # 아니오 -> ID=1로 요청 (res_etmp 의 데이터가 없다)
    # 예 -> LCNAME이 일치하는가? (res_etmp 의 데이터가 있다.)
    # 아니오 -> MAX ID + 1
    # 예 -> ID 그대로 가져오기

    # 파일의 데이터 상태와 선택된 요소를 비교해서 어떤 동작을 할지 결정하자.
    case = 0
    if "error" in res_etmp:
        # 파일에 온도하중이 존재하지 않을 때,
        case = 1
        print("해석파일 내에 온도하중 없음")
    else:
        exist_keys_set = set(res_etmp.keys())
        select_keys_set = set(elem_list)

        print("exist_keys", res_etmp.keys())
        print("select_keys", elem_list)

        if select_keys_set.issubset(exist_keys_set):
            # 선택한 요소가 모두 온도하중을 가지고 있을 때,
            case = 2
            print("선택한 요소 모두 온도하중 있음")
        elif exist_keys_set.isdisjoint(select_keys_set):
            # 선택한 요소 모두 온도하중이 없을 때,
            case = 3
            print("선택한 요소 모두 온도하중 없음")
        else:
            # 선택한 요소 중 일부만 온도하중을 가지고 있을 때,
            case = 4
            print("선택한 요소 일부 온도하중 있음")

    # Request를 보낼 객체
    json_etmp = {}
    middle_result_print = []

    # 경우에 따른 json_etmp 생성
    if case == 1 or case == 3:
        # 1 또는 3은 선택한 요소가 온도하중이 없으므로 각각 ID 1, 2로 온도하중을 부여
        for elem_id in elem_list:
            json_etmp[elem_id] = {
                "ITEMS":[
                    {
                        "ID": 1,
                        "LCNAME": lcname_to_apply[0],
                        "TEMP": max_temp
                    },
                    {
                        "ID": 2,
                        "LCNAME": lcname_to_apply[1],
                        "TEMP": min_temp
                    }
                ]
            }
        print("1 또는 3 번 케이스, 모두 ID:1, ID:2로 온도하중 부여")
    elif case == 2 or case == 4:
        # 선택한 요소 모두 또는 일부 온도하중이 있으므로, 선택된 로드케이스가 일치하는지 안하는지 일단 판단해야함.
        # 일치하면 ID를 그대로 가져오고, 일치하지 않으면 MAX ID + 1로 가져온다.
        for elem_id in elem_list:
            # 선택한 요소가 온도하중을 가지고 있을 때,
            if elem_id in res_etmp:
                items = res_etmp[elem_id]["ITEMS"]
                print("items", items)
                target_id_max = next((item["ID"] for item in items if item["LCNAME"]==lcname_to_apply[0]), None)
                print("target_id_max", target_id_max)
                target_id_min = next((item["ID"] for item in items if item["LCNAME"]==lcname_to_apply[1]), None)
                print("target_id_min", target_id_min)
                max_id = max(map(lambda x: x["ID"], res_etmp[elem_id]["ITEMS"]))
                print("max_id", max_id)
                # 하중케이스가 max는 일치하지 않고, min은 일치할 때
                if target_id_max is None and target_id_min is not None:
                    json_etmp[elem_id] = {
                        "ITEMS": [
                            {
                                "ID": max_id + 1,
                                "LCNAME": lcname_to_apply[0],
                                "TEMP": max_temp
                            },
                            {
                                "ID": target_id_min,
                                "LCNAME": lcname_to_apply[1],
                                "TEMP": min_temp
                            }
                        ]
                    }
                    middle_result_print.append([elem_id, max_id + 1, target_id_min, "max is not match, min is match"])
                # 하중케이스가 max는 일치하고, min은 일치하지 않을 때
                elif target_id_max is not None and target_id_min is None:
                    json_etmp[elem_id] = {
                        "ITEMS": [
                            {
                                "ID": target_id_max,
                                "LCNAME": lcname_to_apply[0],
                                "TEMP": max_temp
                            },
                            {
                                "ID": max_id + 1,
                                "LCNAME": lcname_to_apply[1],
                                "TEMP": min_temp
                            }
                        ]
                    }
                    middle_result_print.append([elem_id, target_id_max, max_id + 1, "max is match, min is not match"])
                # 하중케이스가  max, min 둘 다 일치하지 않을 때
                elif target_id_max is None and target_id_min is None:
                    json_etmp[elem_id] = {
                        "ITEMS": [
                            {
                                "ID": max_id + 1,
                                "LCNAME": lcname_to_apply[0],
                                "TEMP": max_temp
                            },
                            {
                                "ID": max_id + 2,
                                "LCNAME": lcname_to_apply[1],
                                "TEMP": min_temp
                            }
                        ]
                    }
                    middle_result_print.append([elem_id, max_id + 1, max_id + 2, "max is not match, min is not match"])
                # 하중케이스가  max, min 둘 다 일치할 때
                elif target_id_max is not None and target_id_min is not None:
                    json_etmp[elem_id] = {
                        "ITEMS": [
                            {
                                "ID": target_id_max,
                                "LCNAME": lcname_to_apply[0],
                                "TEMP": max_temp
                            },
                            {
                                "ID": target_id_min,
                                "LCNAME": lcname_to_apply[1],
                                "TEMP": min_temp
                            }
                        ]
                    }
                    middle_result_print.append([elem_id, target_id_max, target_id_min, "max is match, min is match"])

            # 선택한 요소가 온도하중을 가지고 있지 않을 때,
            else:
                json_etmp[elem_id] = {
                    "ITEMS":[
                        {
                            "ID": 1,
                            "LCNAME": lcname_to_apply[0],
                            "TEMP": max_temp
                        },
                        {
                            "ID": 2,
                            "LCNAME": lcname_to_apply[1],
                            "TEMP": min_temp
                        }
                    ]
                }
                middle_result_print.append([elem_id, 1, 2, "no load case"])
        print("2 또는 4 번 케이스, ID 부여")
        print("elem_id, max_id, min_id")
        print(middle_result_print)

    # # 온도하중이 없다면, 선택된 요소에 온도하중을 ID를 1과 2로 주면 된다.
    # if "error" in res_etmp:
    #     json_etmp = {}
    #     for elem_id in elem_list:
    #         json_etmp[elem_id] = {
    #             "ITEMS":[
    #                 {
    #                     "ID": 1,
    #                     "LCNAME": lcname_to_apply[0],
    #                     "TEMP": max_temp
    #                 },
    #                 {
    #                     "ID": 2,
    #                     "LCNAME": lcname_to_apply[1],
    #                     "TEMP": min_temp
    #                 }
    #             ]
    #         }
    # # 온도하중이 있다면, 선택된 요소와의 교집합이 있는지 확인하고,
    # # 교집합이 없다면 선택된 요소에 온도하중을 ID 1,2 로 해서 주면 된다.
    # # 교집합이 있다면, 선택된 요소가 가지고 있는 최대 ID 번호를 확인하고, 그 다음 ID로 온도하중을 주면 된다.
    # else:
    #     # 온도하중이 들어가있는 요소 리스트 생성
    #     etmp_list = res_etmp.keys()

    #     # 온도하중이 들어가 있는 요소와 선택한 요소의 교집합을 구하자.
    #     common_elem = list(set(etmp_list) & set(elem_list))
        
    #     # 중복되는 요소에 온도하중이 들어가 있는 LCNAME 리스트 생성
    #     lcnames_list = [[item["LCNAME"] for item in res_etmp[elem_id]["ITEMS"]] for elem_id in common_elem]
        
    #     # 같은 요소에 같은 하중 케이스로 온도하중을 PUT으로 입력하면 값을 더해주는 동작이 되므로!
    #     # 같은 요소와 같은 하중 케이스를 가지고 있으면 에러 메시지를 반환하자.
    #     error_elem = []
    #     for index, lcnames in enumerate(lcnames_list):
    #         if any(item in lcname_to_apply for item in lcnames):
    #             error_elem.append(common_elem[index])
        
    #     if len(error_elem) > 0:
    #         print(error_elem)
    #         print(res_etmp)
    #         for elem_id in elem_list:
    #             items = res_etmp["ETMP"]["1"]["ITEMS"]
    #             target_id_max = next((item["ID"] for item in items if item["LCNAME"]==lcname_to_apply[0]), None)
    #             target_id_min = next((item["ID"] for item in items if item["LCNAME"]==lcname_to_apply[1]), None)
    #             json_etmp[elem_id] = {
    #                 "ITEMS": [
    #                     {
    #                         "ID": target_id_max,
    #                         "LCNAME": lcname_to_apply[0],
    #                         "TEMP": max_temp
    #                     },
    #                     {
    #                         "ID": target_id_min,
    #                         "LCNAME": lcname_to_apply[1],
    #                         "TEMP": min_temp
    #                     }
    #                 ]
    #             }

    #         message = {
    #             "error": {
    #                 "message": "The selected element and load case already have a temperature load applied."
    #             }
    #         }
    #         return message
        
    #     # 교집합이 없다면, 선택된 요소에 온도하중을 ID:1로 해서 주면 된다.
    #     json_etmp = {}
    #     if len(common_elem) == 0:
    #         for elem_id in elem_list:
    #             json_etmp[elem_id] = {
    #                 "ITEMS":[
    #                     {
    #                         "ID": 1,
    #                         "LCNAME": lcname_to_apply[0],
    #                         "TEMP": max_temp
    #                     },
    #                     {
    #                         "ID": 2,
    #                         "LCNAME": lcname_to_apply[1],
    #                         "TEMP": min_temp
    #                     }
    #                 ]
    #             }
    #     else:
    #     # 교집합이 있다면, 선택된 요소가 가지고 있는 최대 ID 번호를 확인하고, 그 다음 ID로 온도하중을 주면 된다.
    #         for elem_id in elem_list:
    #             if elem_id in common_elem:
    #                 max_id = max(map(lambda x: x["ID"], res_etmp[elem_id]["ITEMS"]))
    #                 json_etmp[elem_id] = {
    #                     "ITEMS":[
    #                         {
    #                             "ID": max_id + 1,
    #                             "LCNAME": lcname_to_apply[0],
    #                             "TEMP": max_temp
    #                         },
    #                         {
    #                             "ID": max_id + 2,
    #                             "LCNAME": lcname_to_apply[1],
    #                             "TEMP": min_temp
    #                         }
    #                     ]
    #                 }
    #             else:
    #                 json_etmp[elem_id] = {
    #                     "ITEMS":[
    #                         {
    #                             "ID": 1,
    #                             "LCNAME": lcname_to_apply[0],
    #                             "TEMP": max_temp
    #                         },
    #                         {
    #                             "ID": 2,
    #                             "LCNAME": lcname_to_apply[1],
    #                             "TEMP": min_temp
    #                         }
    #                     ]
    #                 }

    # 온도하중을 적용하자!
    res_etmp = civil.db_update("ETMP", json_etmp)
    print(res_etmp)
    if "ETMP" in res_etmp:
        message = {
            "success": {
                "message": "Temperature load successfully applied."
            }
        }
    else:
        message = {
            "error": {
                "message": "Failed to apply temperature load."
            }
        }
    
    return message

def assign_uniform_temperature(
        uni_json_input: str
    )-> str:

    '''
    uniform temperature 메인 함수
    Web에서 받은 JSON을 파싱해서 입력값을 만들고, 계산하고,
    최종결과를 Web으로 반환한다.
    
    args:
        uni_json_input (str): JSON Input form Web
        
    returns:
        str: JSON Output for Web
    '''

    json_input = json.loads(uni_json_input)

    super_type = json_input['super_type']
    struct_type = json_input['struct_type']
    deck_surf_type = json_input['deck_surf_type']
    deck_surf_thick = json_input['deck_surf_thick']
    height_sea_level = json_input['height_sea_level']
    adj_option = json_input['adj_option']
    lcname_to_apply = json_input['lcname_to_apply']

    uni_temps = uniform_bridge_temperature(super_type, struct_type)
    adj_type_temps = adjustment_temperature_for_surfacing(super_type, deck_surf_type, deck_surf_thick, adj_option)
    adj_height_temps = adjustment_temperature_for_height(height_sea_level)

    final_temp = calc_final_temperatures(uni_temps, adj_type_temps, adj_height_temps)

    res_create_etmp = create_etmp_json(final_temp, lcname_to_apply)

    if "error" in res_create_etmp:
        result = res_create_etmp
    else:
        details = {
            "input" :{
                "super_type": super_type,
                "struct_type": struct_type,
                "deck_surf_type": deck_surf_type,
                "deck_surf_thick": deck_surf_thick,
                "height_sea_level": height_sea_level,
                "odj_option": adj_option,
                "lcname_to_apply": lcname_to_apply
            },
            "output": {
                "uni_temps": uni_temps,
                "adj_type_temps": adj_type_temps,
                "adj_height_temps": adj_height_temps,
                "final_temp": final_temp,                
            }
        }
        res_create_etmp.update(details)
        result = res_create_etmp
    print(result)
    
    return json.dumps(result)

def print_result_uniform(
        uni_json_input: str
    )-> str:

    '''
    uniform temperature 메인 함수
    Web에서 받은 JSON을 파싱해서 입력값을 만들고, 계산하고,
    최종결과를 Web으로 반환한다.
    
    args:
        uni_json_input (str): JSON Input form Web
        
    returns:
        str: JSON Output for Web
    '''

    json_input = json.loads(uni_json_input)

    super_type = json_input['super_type']
    struct_type = json_input['struct_type']
    deck_surf_type = json_input['deck_surf_type']
    deck_surf_thick = json_input['deck_surf_thick']
    height_sea_level = json_input['height_sea_level']
    adj_option = json_input['adj_option']

    uni_temps = uniform_bridge_temperature(super_type, struct_type)
    adj_type_temps = adjustment_temperature_for_surfacing(super_type, deck_surf_type, deck_surf_thick, adj_option)
    adj_height_temps = adjustment_temperature_for_height(height_sea_level)

    final_temp = calc_final_temperatures(uni_temps, adj_type_temps, adj_height_temps)

    details = {
        "output": {
            "uni_temps": uni_temps,
            "adj_type_temps": adj_type_temps,
            "adj_height_temps": adj_height_temps,
            "final_temp": final_temp,                
        }
    }
    
    return json.dumps(details)


'''==============================Temperature Difference Calculation=============================='''

def temperature_differences_data(
        super_type: int,
        deck_surf_type: str,
    )-> dict:

    '''
    아래 표에 따라, 상부 형식에 따른 데이터 그룹을 반환한다.
    
    Structures Design Manual for Highways and Railways 2013 Edition (SDM2013)
    Table 3.19 - Values of ΔT for Superstructure Type 1 
    --------------------------------------------------------------------------
    |                 |               Temperature Difference                 |
    |    Surfacing    |-------------------------------------------------------
    |    Thickness    |                  Heating                  | Cooling  |
    |                 |-------------------------------------------------------
    |                 |  ΔT1 °C  |  ΔT2 °C  |  ΔT3 °C  |  ΔT4 °C  |  ΔT1 °C  |
    --------------------------------------------------------------------------
    |   unsurfaced    |    39    |    21    |     8    |     4    |     5    |
    --------------------------------------------------------------------------
    |      20 mm      |    36    |    20    |    12    |     7    |     4    |
    --------------------------------------------------------------------------
    |      40 mm      |    33    |    19    |    11    |     6    |     3    |
    --------------------------------------------------------------------------

    Table 3.20 - Values of ΔT for Superstructure Type 2
    --------------------------------------------------------------------------
    |   Depth   |    Surfacing   |       Temperature Difference              |
    |    of     |    Thickness   |--------------------------------------------
    |   slab    |                |       Heating       |       Cooling       |
    |    m      |       mm       |--------------------------------------------
    |           |                |  ΔT1 °C  |  ΔT2 °C  |  ΔT1 °C  |  ΔT2 °C  |
    --------------------------------------------------------------------------
    |    0.2    |      U.P.      |    17    |     7    |     5    |     9    |
    |           |      U.T.      |    26    |    12    |     5    |     9    |
    |           |  waterproofed  |    30    |    14    |     5    |     9    |
    |           |       50       |    24    |    12    |     3    |     9    |
    |           |      100       |    19    |    11    |     1    |     9    |
    |           |      150       |    16    |    10    |     1    |     9    |
    |           |      200       |    13    |     9    |     1    |     9    |
    --------------------------------------------------------------------------
    |    0.3    |      U.P.      |    17    |     3    |     7    |     9    |
    |           |      U.T.      |    26    |     5    |     7    |     9    |
    |           |  waterproofed  |    30    |     7    |     7    |     9    |
    |           |       50       |    24    |     6    |     5    |     9    |
    |           |      100       |    19    |     5    |     4    |     9    |
    |           |      150       |    16    |     5    |     3    |    10    |
    |           |      200       |    13    |     5    |     2    |    11    |
    --------------------------------------------------------------------------
    Notes:
    (1) U.P. = unsurfaced plain
    (2) U.T. = unsurfaced trafficked

    Table 3.21 - Values of ΔT for Superstructure Type 3 
    ---------------------------------------------------------------------------------------------------------------------
    |   Depth   |    Surfacing   |                                Temperature Difference                                |
    |    of     |    Thickness   |---------------------------------------------------------------------------------------
    |   slab    |                |              Heating                |                     Cooling                    |
    |    m      |       mm       |---------------------------------------------------------------------------------------
    |           |                |   ΔT1 °C   |   ΔT2 °C   |   ΔT3 °C  |   ΔT1 °C   |   ΔT2 °C  |   ΔT3 °C  |   ΔT4 °C  |
    ---------------------------------------------------------------------------------------------------------------------
    |   ≤0.2    |      U.P.      |    13.3    |     6.6    |     -     |     5.5    |    2.1    |    0.1    |    1.0    |
    |           |      U.T.      |    19.3    |     7.4    |     -     |     5.5    |    2.1    |    0.1    |    1.0    |
    |           |  waterproofed  |    21.7    |     8.9    |     -     |     5.5    |    2.1    |    0.1    |    1.0    |
    |           |       50       |    16.2    |     5.0    |     -     |     3.1    |    1.6    |    0.2    |    0.7    |
    |           |      100       |    12.3    |     5.0    |     -     |     1.8    |    0.8    |    0.3    |    0.9    |
    |           |      150       |     9.5    |     4.0    |     -     |     1.0    |    0.3    |    0.3    |    0.8    |
    |           |      200       |     7.4    |     3.3    |     -     |     1.0    |    0.3    |    0.3    |    0.8    |
    ---------------------------------------------------------------------------------------------------------------------
    |    0.3    |      U.P.      |    16.1    |     5.3    |     -     |     6.7    |    3.1    |    0.2    |    1.3    |
    |           |      U.T.      |    23.6    |     7.8    |     -     |     6.7    |    3.1    |    0.2    |    1.3    |
    |           |  waterproofed  |    26.6    |     9.0    |     -     |     6.7    |    3.1    |    0.2    |    1.3    |
    |           |       50       |    20.2    |     7.1    |     -     |     4.4    |    2.0    |    0.3    |    1.3    |
    |           |      100       |    15.5    |     5.5    |     -     |     2.9    |    1.2    |    0.4    |    1.6    |
    |           |      150       |    12.0    |     4.2    |     -     |     1.8    |    0.6    |    0.7    |    1.9    |
    |           |      200       |     9.3    |     3.5    |     -     |     1.0    |    0.2    |    0.8    |    1.9    |
    ---------------------------------------------------------------------------------------------------------------------
    |    0.4    |      U.P.      |    17.2    |     5.2    |     -     |     7.6    |    3.5    |    0.3    |    1.8    |
    |           |      U.T.      |    25.2    |     8.1    |     -     |     7.6    |    3.5    |    0.3    |    1.8    |
    |           |  waterproofed  |    28.4    |     9.2    |     -     |     7.6    |    3.5    |    0.3    |    1.8    |
    |           |       50       |    21.8    |     7.3    |     -     |     5.3    |    2.2    |    0.5    |    2.1    |
    |           |      100       |    16.9    |     5.5    |     -     |     3.7    |    1.3    |    0.7    |    2.3    |
    |           |      150       |    13.1    |     4.5    |     -     |     2.5    |    0.8    |    0.9    |    2.5    |
    |           |      200       |    10.1    |     3.6    |     -     |     1.7    |    0.4    |    1.2    |    2.8    |
    ---------------------------------------------------------------------------------------------------------------------
    |    0.7    |      U.P.      |    17.7    |     6.2    |     -     |    10.6    |    4.3    |    0.9    |    3.7    |
    |           |      U.T.      |    25.9    |     9.1    |     -     |    10.6    |    4.3    |    0.9    |    3.7    |
    |           |  waterproofed  |    28.4    |    10.4    |     -     |    10.6    |    4.3    |    0.9    |    3.7    |
    |           |       50       |    21.8    |     8.2    |     -     |     8.6    |    3.2    |    1.2    |    4.1    |
    |           |      100       |    16.9    |     6.7    |     -     |     6.8    |    2.3    |    1.5    |    4.6    |
    |           |      150       |    13.1    |     5.3    |     -     |     5.3    |    1.7    |    1.7    |    5.0    |
    |           |      200       |    10.1    |     4.1    |     -     |     4.1    |    1.2    |    2.1    |    5.3    |
    ---------------------------------------------------------------------------------------------------------------------
    |    1.0    |      U.P.      |    18.0    |     6.3    |     -     |    13.5    |    4.7    |    1.7    |    6.0    |
    |           |      U.T.      |    26.2    |     9.4    |     -     |    13.5    |    4.7    |    1.7    |    6.0    |
    |           |  waterproofed  |    29.5    |    10.3    |     -     |    13.5    |    4.7    |    1.7    |    6.0    |
    |           |       50       |    23.1    |     8.3    |     -     |    11.1    |    3.7    |    1.9    |    6.3    |
    |           |      100       |    17.9    |     6.7    |    0.2    |     9.1    |    2.9    |    2.2    |    6.7    |
    |           |      150       |    13.8    |     5.1    |    0.2    |     7.4    |    2.2    |    2.4    |    6.9    |
    |           |      200       |    10.7    |     4.1    |    0.2    |     5.8    |    1.7    |    2.6    |    7.2    |
    ---------------------------------------------------------------------------------------------------------------------
    |   ≥3.0    |      U.P.      |    19.1    |     6.7    |    0.8    |    16.5    |    6.2    |    3.5    |    8.9    |
    |           |      U.T.      |    27.5    |     9.8    |    0.6    |    16.5    |    6.2    |    3.5    |    8.9    |
    |           |  waterproofed  |    30.9    |    11.1    |    0.5    |    16.5    |    6.2    |    3.5    |    8.9    |
    |           |       50       |    24.1    |     8.6    |    0.9    |    13.7    |    5.0    |    3.5    |    8.9    |
    |           |      100       |    18.7    |     7.0    |    0.9    |    11.3    |    4.1    |    3.5    |    8.9    |
    |           |      150       |    14.4    |     5.5    |    0.9    |     9.3    |    3.3    |    3.5    |    8.9    |
    |           |      200       |    11.2    |     4.4    |    0.8    |     7.6    |    2.6    |    3.5    |    8.9    |
    ---------------------------------------------------------------------------------------------------------------------
    Notes:
    (1) U.P. = unsurfaced plain
    (2) U.T. = unsurfaced trafficked
    
    Args:
        super_type (int): Superstructure Type
        deck_surf_type (str): Deck Surfacing Type
        
    Returns:
        dict: Data Group
    '''

    # Superstructure Type - 1
    data_type_1 = {
        0 : {"T1_h": 39, "T2_h": 21, "T3_h":  8, "T4_h": 4, "T1_c": -5},
        20: {"T1_h": 36, "T2_h": 20, "T3_h": 12, "T4_h": 7, "T1_c": -4},
        40: {"T1_h": 33, "T2_h": 19, "T3_h": 11, "T4_h": 6, "T1_c": -3}
    }

    # Superstructure Type - 2 && Deck Surfacing Type - plain
    data_type_21 = {
        200: {"T1_h": 17, "T2_h": 7, "T1_c": -5, "T2_c": -9},
        300: {"T1_h": 17, "T2_h": 3, "T1_c": -7, "T2_c": -9}
    }
    
    # Superstructure Type - 2 && Deck Surfacing Type - trafficked
    data_type_22 = {
        200: {"T1_h": 26, "T2_h": 12, "T1_c": -5, "T2_c": -9},
        300: {"T1_h": 26, "T2_h":  5, "T1_c": -7, "T2_c": -9}
    }

    # Superstructure Type - 2 && Deck Surfacing Type - waterproofed
    data_type_23 = {
        200: {"T1_h": 30, "T2_h": 14, "T1_c": -5, "T2_c": -9},
        300: {"T1_h": 30, "T2_h":  7, "T1_c": -7, "T2_c": -9}
    }

    # Superstructure Type - 2 && Deck Surfacing Type - Thickness
    data_type_24 = {
        200: {
            0  : {"T1_h": 30, "T2_h": 14, "T1_c": -5, "T2_c": -9},
            50 : {"T1_h": 24, "T2_h": 12, "T1_c": -3, "T2_c": -9},
            100: {"T1_h": 19, "T2_h": 11, "T1_c": -1, "T2_c": -9},
            150: {"T1_h": 16, "T2_h": 10, "T1_c": -1, "T2_c": -9},
            200: {"T1_h": 13, "T2_h":  9, "T1_c": -1, "T2_c": -9},
        },
        300: {
            0  : {"T1_h": 30, "T2_h": 7, "T1_c": -7, "T2_c":  -9},
            50 : {"T1_h": 24, "T2_h": 6, "T1_c": -5, "T2_c":  -9},
            100: {"T1_h": 19, "T2_h": 5, "T1_c": -4, "T2_c":  -9},
            150: {"T1_h": 16, "T2_h": 5, "T1_c": -3, "T2_c": -10},
            200: {"T1_h": 13, "T2_h": 5, "T1_c": -2, "T2_c": -11},
        }
    }

    # Superstructure Type - 3 && Deck Surfacing Type - plain
    data_type_31 = {
        200 : {"T1_h": 13.3, "T2_h": 6.6, "T3_h": 0.0, "T1_c":  -5.5, "T2_c": -2.1, "T3_c": -0.1, "T4_c": -1.0},
        300 : {"T1_h": 16.1, "T2_h": 5.3, "T3_h": 0.0, "T1_c":  -6.7, "T2_c": -3.1, "T3_c": -0.2, "T4_c": -1.3},
        400 : {"T1_h": 17.2, "T2_h": 5.2, "T3_h": 0.0, "T1_c":  -7.6, "T2_c": -3.5, "T3_c": -0.3, "T4_c": -1.8},
        700 : {"T1_h": 17.7, "T2_h": 6.2, "T3_h": 0.0, "T1_c": -10.6, "T2_c": -4.3, "T3_c": -0.9, "T4_c": -3.7},
        1000: {"T1_h": 18.0, "T2_h": 6.3, "T3_h": 0.0, "T1_c": -13.5, "T2_c": -4.7, "T3_c": -1.7, "T4_c": -6.0},
        3000: {"T1_h": 19.1, "T2_h": 6.7, "T3_h": 0.8, "T1_c": -16.5, "T2_c": -6.2, "T3_c": -3.5, "T4_c": -8.9}
    }

    # Superstructure Type - 2 && Deck Surfacing Type - trafficked
    data_type_32 = {
        200 : {"T1_h": 19.3, "T2_h": 7.4, "T3_h": 0.0, "T1_c":  -5.5, "T2_c": -2.1, "T3_c": -0.1, "T4_c": -1.0},
        300 : {"T1_h": 23.6, "T2_h": 7.8, "T3_h": 0.0, "T1_c":  -6.7, "T2_c": -3.1, "T3_c": -0.2, "T4_c": -1.3},
        400 : {"T1_h": 25.2, "T2_h": 8.1, "T3_h": 0.0, "T1_c":  -7.6, "T2_c": -3.5, "T3_c": -0.3, "T4_c": -1.8},
        700 : {"T1_h": 25.9, "T2_h": 9.1, "T3_h": 0.0, "T1_c": -10.6, "T2_c": -4.3, "T3_c": -0.9, "T4_c": -3.7},
        1000: {"T1_h": 26.2, "T2_h": 9.4, "T3_h": 0.0, "T1_c": -13.5, "T2_c": -4.7, "T3_c": -1.7, "T4_c": -6.0},
        3000: {"T1_h": 27.5, "T2_h": 9.8, "T3_h": 0.6, "T1_c": -16.5, "T2_c": -6.2, "T3_c": -3.5, "T4_c": -8.9}
    }
    # Superstructure Type - 2 && Deck Surfacing Type - waterproofed
    data_type_33 = {
        200 : {"T1_h": 21.7, "T2_h":  8.9, "T3_h": 0.0, "T1_c":  -5.5, "T2_c": -2.1, "T3_c": -0.1, "T4_c": -1.0},
        300 : {"T1_h": 26.6, "T2_h":  9.0, "T3_h": 0.0, "T1_c":  -6.7, "T2_c": -3.1, "T3_c": -0.2, "T4_c": -1.3},
        400 : {"T1_h": 28.4, "T2_h":  9.2, "T3_h": 0.0, "T1_c":  -7.6, "T2_c": -3.5, "T3_c": -0.3, "T4_c": -1.8},
        700 : {"T1_h": 28.4, "T2_h": 10.4, "T3_h": 0.0, "T1_c": -10.6, "T2_c": -4.3, "T3_c": -0.9, "T4_c": -3.7},
        1000: {"T1_h": 29.5, "T2_h": 10.3, "T3_h": 0.0, "T1_c": -13.5, "T2_c": -4.7, "T3_c": -1.7, "T4_c": -6.0},
        3000: {"T1_h": 30.9, "T2_h": 11.1, "T3_h": 0.5, "T1_c": -16.5, "T2_c": -6.2, "T3_c": -3.5, "T4_c": -8.9}
    }
    
    data_type_34 = {
        200: {
            0  : {"T1_h": 21.7, "T2_h": 8.9, "T3_h": 0.0, "T1_c": -5.5, "T2_c": -2.1, "T3_c": -0.1, "T4_c": -1.0},
            50 : {"T1_h": 16.2, "T2_h": 5.0, "T3_h": 0.0, "T1_c": -3.1, "T2_c": -1.6, "T3_c": -0.2, "T4_c": -0.7},
            100: {"T1_h": 12.3, "T2_h": 5.0, "T3_h": 0.0, "T1_c": -1.8, "T2_c": -0.8, "T3_c": -0.3, "T4_c": -0.9},
            150: {"T1_h":  9.5, "T2_h": 4.0, "T3_h": 0.0, "T1_c": -1.0, "T2_c": -0.3, "T3_c": -0.3, "T4_c": -0.8},
            200: {"T1_h":  7.4, "T2_h": 3.3, "T3_h": 0.0, "T1_c": -1.0, "T2_c": -0.3, "T3_c": -0.3, "T4_c": -0.8}
        },
        300: {
            0  : {"T1_h": 26.6, "T2_h": 9.0, "T3_h": 0.0, "T1_c": -6.7, "T2_c": -3.1, "T3_c": -0.2, "T4_c": -1.3},
            50 : {"T1_h": 20.2, "T2_h": 7.1, "T3_h": 0.0, "T1_c": -4.4, "T2_c": -2.0, "T3_c": -0.3, "T4_c": -1.3},
            100: {"T1_h": 15.5, "T2_h": 5.5, "T3_h": 0.0, "T1_c": -2.9, "T2_c": -1.2, "T3_c": -0.4, "T4_c": -1.6},
            150: {"T1_h": 12.0, "T2_h": 4.2, "T3_h": 0.0, "T1_c": -1.8, "T2_c": -0.6, "T3_c": -0.7, "T4_c": -1.9},
            200: {"T1_h":  9.3, "T2_h": 3.5, "T3_h": 0.0, "T1_c": -1.0, "T2_c": -0.2, "T3_c": -0.8, "T4_c": -1.9}
        },
        400: {
            0  : {"T1_h": 28.4, "T2_h": 9.2, "T3_h": 0.0, "T1_c": -7.6, "T2_c": -3.5, "T3_c": -0.3, "T4_c": -1.8},
            50 : {"T1_h": 21.8, "T2_h": 7.3, "T3_h": 0.0, "T1_c": -5.3, "T2_c": -2.2, "T3_c": -0.5, "T4_c": -2.1},
            100: {"T1_h": 16.9, "T2_h": 5.5, "T3_h": 0.0, "T1_c": -3.7, "T2_c": -1.3, "T3_c": -0.7, "T4_c": -2.3},
            150: {"T1_h": 13.1, "T2_h": 4.5, "T3_h": 0.0, "T1_c": -2.5, "T2_c": -0.8, "T3_c": -0.9, "T4_c": -2.5},
            200: {"T1_h": 10.1, "T2_h": 3.6, "T3_h": 0.0, "T1_c": -1.7, "T2_c": -0.4, "T3_c": -1.2, "T4_c": -2.8}
        },
        700: {
            0  : {"T1_h": 28.4, "T2_h": 10.4, "T3_h": 0.0, "T1_c": -10.6, "T2_c": -4.3, "T3_c": -0.9, "T4_c": -3.7},
            50 : {"T1_h": 21.8, "T2_h":  8.2, "T3_h": 0.0, "T1_c":  -8.6, "T2_c": -3.2, "T3_c": -1.2, "T4_c": -4.1},
            100: {"T1_h": 16.9, "T2_h":  6.7, "T3_h": 0.0, "T1_c":  -6.8, "T2_c": -2.3, "T3_c": -1.5, "T4_c": -4.6},
            150: {"T1_h": 13.1, "T2_h":  5.3, "T3_h": 0.0, "T1_c":  -5.3, "T2_c": -1.7, "T3_c": -1.7, "T4_c": -5.0},
            200: {"T1_h": 10.1, "T2_h":  4.1, "T3_h": 0.0, "T1_c":  -4.1, "T2_c": -1.2, "T3_c": -2.1, "T4_c": -5.3}
        },
        1000: {
            0  : {"T1_h": 29.5, "T2_h": 10.3, "T3_h": 0.0, "T1_c": -13.5, "T2_c": -4.7, "T3_c": -1.7, "T4_c": -6.0},
            50 : {"T1_h": 23.1, "T2_h":  8.3, "T3_h": 0.0, "T1_c": -11.1, "T2_c": -3.7, "T3_c": -1.9, "T4_c": -6.3},
            100: {"T1_h": 17.9, "T2_h":  6.7, "T3_h": 0.2, "T1_c":  -9.1, "T2_c": -2.9, "T3_c": -2.2, "T4_c": -6.7},
            150: {"T1_h": 13.8, "T2_h":  5.1, "T3_h": 0.2, "T1_c":  -7.4, "T2_c": -2.2, "T3_c": -2.4, "T4_c": -6.9},
            200: {"T1_h": 10.7, "T2_h":  4.1, "T3_h": 0.2, "T1_c":  -5.8, "T2_c": -1.7, "T3_c": -2.6, "T4_c": -7.2}
        },
        3000: {
            0  : {"T1_h": 30.9, "T2_h": 11.1, "T3_h": 0.5, "T1_c": -16.5, "T2_c": -6.2, "T3_c": -3.5, "T4_c": -8.9},
            50 : {"T1_h": 24.1, "T2_h":  8.6, "T3_h": 0.9, "T1_c": -13.7, "T2_c": -5.0, "T3_c": -3.5, "T4_c": -8.9},
            100: {"T1_h": 18.7, "T2_h":  7.0, "T3_h": 0.9, "T1_c": -11.3, "T2_c": -4.1, "T3_c": -3.5, "T4_c": -8.9},
            150: {"T1_h": 14.4, "T2_h":  5.5, "T3_h": 0.9, "T1_c":  -9.3, "T2_c": -3.3, "T3_c": -3.5, "T4_c": -8.9},
            200: {"T1_h": 11.2, "T2_h":  4.4, "T3_h": 0.8, "T1_c":  -7.6, "T2_c": -2.6, "T3_c": -3.5, "T4_c": -8.9}
        }
    }

    if super_type == 1:
        return data_type_1
    elif super_type == 2:
        if deck_surf_type == "plain":
            return data_type_21
        elif deck_surf_type == "trafficked":
            return data_type_22
        elif deck_surf_type == "waterproofed":
            return data_type_23
        elif deck_surf_type == "thickness":
            return data_type_24
    elif super_type == 3:
        if deck_surf_type == "plain":
            return data_type_31
        elif deck_surf_type == "trafficked":
            return data_type_32
        elif deck_surf_type == "waterproofed":
            return data_type_33
        elif deck_surf_type == "thickness":
            return data_type_34

def linear_interpolation(lower_value, upper_value, lower_key, upper_key, input_value):
    interpolated_value = {}
    for param in lower_value:
        lower_param_value = lower_value[param]
        upper_param_value = upper_value[param]
        interpolated_value[param] = lower_param_value + (upper_param_value - lower_param_value) * (
            (input_value - lower_key) / (upper_key - lower_key)
        )
    return interpolated_value

def merge_and_interpolate(A1, A2, B1, B2):
    # Merge A1 and B1 arrays and sort them in descending order
    C = sorted(set(A1 + B1), reverse=True)
    
    # Create new arrays for A2 and B2
    A2_new = [np.nan] * len(C)
    B2_new = [np.nan] * len(C)

    # Interpolate values for A2 and B2 arrays
    for index, c_val in enumerate(C):
        if c_val in A1:
            A2_new[index] = A2[A1.index(c_val)]
        if c_val in B1:
            B2_new[index] = B2[B1.index(c_val)]

    for index, val in enumerate(A2_new):
        if np.isnan(val):
            for i in range(index-1, -1, -1):
                if not np.isnan(A2_new[i]):
                    y0 = A2_new[i]
                    x0 = C[i]
                    break
            for i in range(index, len(A2_new)):
                if not np.isnan(A2_new[i]):
                    y1 = A2_new[i]
                    x1 = C[i]
                    break
            A2_new[index] = y0 + (y1 - y0) * (C[index] - x0) / (x1 - x0)
    for index, val in enumerate(B2_new):
        if np.isnan(val):
            for i in range(index-1, -1, -1):
                if not np.isnan(B2_new[i]):
                    y0 = B2_new[i]
                    x0 = C[i]
                    break
            for i in range(index, len(B2_new)):
                if not np.isnan(B2_new[i]):
                    y1 = B2_new[i]
                    x1 = C[i]
                    break
            B2_new[index] = y0 + (y1 - y0) * (C[index] - x0) / (x1 - x0)

    return C, A2_new, B2_new

def interpolate_temperature(
        super_type: int,
        deck_surf_type: str,
        deck_surf_thick: float,
        depth: float,
        diff_option: bool
    )-> dict:

    '''
    입력값에 맞춰 temperature_differences_data 에서 값을 가져온다.
    diff_option이 True일 경우, 보간을 하여 값을 가져온다.
    diff_option이 False일 경우, 테이블 값을 그대로 이용하여, 입력값보다 큰 값으로 찾아서 가져온다.
    
    Args:
        super_type (int): Superstructure Type
        deck_surf_type (str): Deck Surfacing Type
        deck_surf_thick (float): Deck Surfacing Thickness
        depth (float): Depth of the superstructure
        
    Returns:
        dict: Interpolated temperature data
    '''
    
    # Temperature data for superstructure type - 1
    if super_type == 1:
        temperature_data = temperature_differences_data(super_type, deck_surf_type)
        keys = [int(key) for key in temperature_data.keys()]
        max_thickness = max(keys)
        
        # Surfacing Type을 입력했을 경우
        if deck_surf_type == "plain" or deck_surf_type == "trafficked" or deck_surf_type == "waterproofed":
            diff_temperature_data = temperature_data[0]
        # Surfacing 두께를 입력 했을 경우
        elif deck_surf_type == "thickness":
            if deck_surf_thick >= max_thickness:
                diff_temperature_data = temperature_data[max_thickness]
            else:
                # diff_option이 True일 경우, 보간을 하여 값을 가져온다.
                if diff_option:
                    for i  in range(len(keys) - 1):
                        if keys[i] <= deck_surf_thick < keys[i+1]:
                            lower_key, upper_key = keys[i], keys[i+1]
                            lower_value, upper_value = temperature_data[lower_key], temperature_data[upper_key]
                            diff_temperature_data = linear_interpolation(lower_value, upper_value, lower_key, upper_key, deck_surf_thick)
                # diff_option이 false일 경우, 입력값보다 큰 값을 찾아서 가져온다.
                else:
                    for key in keys:
                        if key >= deck_surf_thick:
                            diff_temperature_data = temperature_data[key]
                            break

    elif super_type == 2 or super_type == 3:
        temperature_data = temperature_differences_data(super_type, deck_surf_type)
        
        # Surfacing Type을 입력했을 경우
        if deck_surf_type == "plain" or deck_surf_type == "trafficked" or deck_surf_type == "waterproofed":
            keys = sorted([int(key) for key in temperature_data.keys()])
            max_depth = max(keys)
            min_depth = min(keys)

            if depth >= max_depth:
                diff_temperature_data = temperature_data[max_depth]
            elif depth <= min_depth:
                diff_temperature_data = temperature_data[min_depth]
            else:
                # diff_option이 True일 경우, 보간을 하여 값을 가져온다.
                if diff_option:
                    for i  in range(len(keys) - 1):
                        if keys[i] <= depth < keys[i+1]:
                            lower_key, upper_key = keys[i], keys[i+1]
                            lower_value, upper_value = temperature_data[lower_key], temperature_data[upper_key]
                            diff_temperature_data = linear_interpolation(lower_value, upper_value, lower_key, upper_key, depth)
                # diff_option이 false일 경우, 입력값보다 큰 값을 찾아서 가져온다.
                else:
                    for key in keys:
                        if key >= depth:
                            diff_temperature_data = temperature_data[key]
                            break
                        
        # Surfacing 두께를 입력 했을 경우
        elif deck_surf_type == "thickness":
            keys = sorted([int(key) for key in temperature_data.keys()])
            max_depth = max(keys)
            min_depth = min(keys)
            
            if depth >= max_depth:
                temp_data = temperature_data[max_depth]
            elif depth <= min_depth:
                temp_data = temperature_data[min_depth]
            else:
                # diff_option이 True일 경우, 보간을 하여 값을 가져온다.
                if diff_option:
                    for i in range(len(keys) - 1):
                        if keys[i] < depth < keys[i+1]:
                            lower_key, upper_key = keys[i], keys[i+1]
                            lower_value, upper_value = temperature_data[lower_key], temperature_data[upper_key]
                            temp_data = {}
                            for param in lower_value.keys():
                                temp_data[param] = {}
                                for sub_param in lower_value[param].keys():
                                    lower_param_value = lower_value[param][sub_param]
                                    upper_param_value = upper_value[param][sub_param]
                                    temp_data[param][sub_param] = lower_param_value + (upper_param_value - lower_param_value) * (
                                        (depth - lower_key) / (upper_key - lower_key))
                # diff_option이 false일 경우, 입력값보다 큰 값을 찾아서 가져온다.
                else:
                    for key in keys:
                        if key >= depth:
                            temp_data = temperature_data[key]
                            break
        
            keys = sorted([int(key) for key in temp_data.keys()])
            max_thickness = max(keys)
            min_thickness = min(keys)
            
            if deck_surf_thick >= max_thickness:
                diff_temperature_data = temp_data[max_thickness]
            elif deck_surf_thick <= min_thickness:
                diff_temperature_data = temp_data[min_thickness]
            else:
                # diff_option이 false일 경우, 입력값보다 큰 값을 찾아서 가져온다.
                if diff_option:
                    for i in range(len(keys) - 1):
                        if keys[i] <= deck_surf_thick < keys[i+1]:
                            lower_key, upper_key = keys[i], keys[i+1]
                            lower_value, upper_value = temp_data[lower_key], temp_data[upper_key]
                            diff_temperature_data = linear_interpolation(lower_value, upper_value, lower_key, upper_key, deck_surf_thick)
                # diff_option이 false일 경우, 입력값보다 큰 값을 찾아서 가져온다.
                else:
                    for key in keys:
                        if key >= deck_surf_thick:
                            diff_temperature_data = temp_data[key]
                            break
    
    return diff_temperature_data

def calculate_section_height(
        unit_length: str,
        res_sect: dict,
        sect_id: list,
        sect_type: list,
        sect_shape:list
    )-> list:
    
    '''
    단면의 정보와 타입, 형상 정보를 입력받앗더 단면의 높이를 계산한다.
    
    Args:
        res_sect (dict): Section Information
        sect_type (list): Section Type
        sect_shape (list): Section Shape
        
    Returns:
        list: Section Height
    '''
    
    sect_height = []
    slab_height = []
    for index, id in enumerate(sect_id):
        if sect_type[index] == "SOD":
            if sect_shape[index] == "STLB":
                vSize = res_sect[id]["SECT_BEFORE"]["SECT_I"]["vSIZE"]
                height = vSize[6] + vSize[7] + vSize[8]
                sect_height.append(height)
            elif sect_shape[index] == "STLI":
                vSize = res_sect[id]["SECT_BEFORE"]["SECT_I"]["vSIZE"]
                height = vSize[4] + vSize[5] + vSize[6]
                sect_height.append(height)
        elif sect_type[index] == "DBUSER":
            vSize = res_sect[id]["SECT_BEFORE"]["SECT_I"]["vSIZE"]
            height = vSize[0]
            sect_height.append(height)
        elif sect_type[index] == "COMPOSITE":
            if sect_shape[index] == "B":
                vSize = res_sect[id]["SECT_BEFORE"]["SECT_I"]["vSIZE"]
                slab = res_sect[id]["SECT_AFTER"]["SLAB"]
                height = vSize[0] + vSize[6] + vSize[7] + slab[1] + slab[2]
                sect_height.append(height)
                slab_height.append(slab[1])
            elif sect_shape[index] == "I":
                vSize = res_sect[id]["SECT_BEFORE"]["SECT_I"]["vSIZE"]
                slab = res_sect[id]["SECT_AFTER"]["SLAB"]
                height = vSize[0] + vSize[3] + vSize[5] + slab[1] + slab[2]
                sect_height.append(height)
                slab_height.append(slab[1])
            elif sect_shape[index] == "Tub":
                vSize = res_sect[id]["SECT_BEFORE"]["SECT_I"]["vSIZE"]
                slab = res_sect[id]["SECT_AFTER"]["SLAB"]
                height = vSize[0] + vSize[6] + vSize[7] + slab[1] + slab[2]
                sect_height.append(height)
                slab_height.append(slab[1])
            elif sect_shape[index] == "GB":
                vSize = res_sect[id]["SECT_BEFORE"]["SECT_I"]["vSIZE"]
                slab = res_sect[id]["SECT_AFTER"]["SLAB"]
                height = vSize[6] + vSize[7] + vSize[8] + slab[1] + slab[2]
                sect_height.append(height)
                slab_height.append(slab[1])
            elif sect_shape[index] == "GI":
                vSize = res_sect[id]["SECT_BEFORE"]["SECT_I"]["vSIZE"]
                slab = res_sect[id]["SECT_AFTER"]["SLAB"]
                height = vSize[4] + vSize[5] + vSize[6] + slab[1] + slab[2]
                sect_height.append(height)
                slab_height.append(slab[1])
            elif sect_shape[index] == "GT":
                vSize = res_sect[id]["SECT_BEFORE"]["SECT_I"]["vSIZE"]
                slab = res_sect[id]["SECT_AFTER"]["SLAB"]
                height = vSize[6] + vSize[7] + vSize[8] + slab[1] + slab[2]
                sect_height.append(height)
                slab_height.append(slab[1])
        elif sect_type[index] == "PSC":
            if sect_shape[index] == "1CEL" or sect_shape[index] == "2CEL":
                vSize_A = res_sect[id]["SECT_BEFORE"]["SECT_I"]["vSIZE_PSC_A"]
                vSize_C = res_sect[id]["SECT_BEFORE"]["SECT_I"]["vSIZE_PSC_C"]
                h_outer = vSize_A[0] + vSize_A[1] + vSize_A[4]
                h_inner = vSize_C[0] + vSize_C[1] + vSize_C[4] + vSize_C[6] + vSize_C[9]
                height = max(h_outer, h_inner)
                sect_height.append(height)
            elif sect_shape[index] == "3CEL":
                vSize_A = res_sect[id]["SECT_BEFORE"]["SECT_I"]["vSIZE_PSC_A"]
                vSize_B = res_sect[id]["SECT_BEFORE"]["SECT_I"]["vSIZE_PSC_B"]
                h_outer = vSize_B[7] + vSize_B[8]
                h_inner = vSize_A[0] + vSize_A[1] + vSize_A[2] + vSize_A[3] + vSize_A[4]
                height = max(h_outer, h_inner)
                sect_height.append(height)
            elif sect_shape[index] == "NCEL":
                vSize_A = res_sect[id]["SECT_BEFORE"]["SECT_I"]["vSIZE_PSC_A"]
                height = vSize_A[0]
                sect_height.append(height)
            elif sect_shape[index] == "NCE2":
                vSize_A = res_sect[id]["SECT_BEFORE"]["SECT_I"]["vSIZE_PSC_A"]
                height = vSize_A[0] + vSize_A[1] + vSize_A[3] + vSize_A[4]
                sect_height.append(height)
            elif sect_shape[index] == "PSCM":
                psc_opt1 = res_sect[id]["SECT_BEFORE"]["PSC_OPT1"]
                psc_opt2 = res_sect[id]["SECT_BEFORE"]["PSC_OPT2"]
                vSize_A = res_sect[id]["SECT_BEFORE"]["SECT_I"]["vSIZE_PSC_A"]
                vSize_C = res_sect[id]["SECT_BEFORE"]["SECT_I"]["vSIZE_PSC_C"]
                if psc_opt1 == "NONE" and psc_opt2 == "NONE":
                    h_middle = vSize_A[0]
                    h_left = vSize_A[1]
                    h_right = vSize_C[0]
                elif psc_opt1 == "NONE" and psc_opt2 == "CIRCLE":
                    h_middle = vSize_A[0]
                    h_left = vSize_A[1]
                    h_right = vSize_C[0] + vSize_C[4] + vSize_C[8]
                elif psc_opt1 == "NONE" and psc_opt2 == "POLYGON":
                    h_middle = vSize_A[0]
                    h_left = vSize_A[1]
                    h_right = vSize_C[0] + vSize_C[1] + vSize_C[4] + vSize_C[5] + vSize_C[8]
                elif psc_opt1 == "CIRCLE" and psc_opt2 == "CIRCLE":
                    h_middle = vSize_A[0]
                    h_left = vSize_A[1] + vSize_A[5] + vSize_A[9]
                    h_right = vSize_C[0] + vSize_C[4] + vSize_C[8]
                elif psc_opt1 == "CIRCLE" and psc_opt2 == "NONE":
                    h_middle = vSize_A[0]
                    h_left = vSize_A[1] + vSize_A[5] + vSize_A[9]
                    h_right = vSize_C[0]
                elif psc_opt1 == "CIRCLE" and psc_opt2 == "POLYGON":
                    h_middle = vSize_A[0]
                    h_left = vSize_A[1] + vSize_A[5] + vSize_A[9]
                    h_right = vSize_C[0] + vSize_C[1] + vSize_C[4] + vSize_C[5] + vSize_C[8]
                elif psc_opt1 == "POLYGON" and psc_opt2 == "POLYGON":
                    h_middle = vSize_A[0]
                    h_left = vSize_A[1] + vSize_A[2] + vSize_A[5] + vSize_A[6] + vSize_A[9]
                    h_right = vSize_C[0] + vSize_C[1] + vSize_C[4] + vSize_C[5] + vSize_C[8]
                elif psc_opt1 == "POLYGON" and psc_opt2 == "NONE":
                    h_middle = vSize_A[0]
                    h_left = vSize_A[1] + vSize_A[2] + vSize_A[5] + vSize_A[6] + vSize_A[9]
                    h_right = vSize_C[0]
                elif psc_opt1 == "POLYGON" and psc_opt2 == "CIRCLE":
                    h_middle = vSize_A[0]
                    h_left = vSize_A[1] + vSize_A[2] + vSize_A[5] + vSize_A[6] + vSize_A[9]
                    h_right = vSize_C[0] + vSize_C[4] + vSize_C[8]
                height = max(h_middle, h_left, h_right)
                sect_height.append(height)
            elif sect_shape[index] == "PSCI":
                vSize_A = res_sect[id]["SECT_BEFORE"]["SECT_I"]["vSIZE_PSC_A"]
                vSize_C = res_sect[id]["SECT_BEFORE"]["SECT_I"]["vSIZE_PSC_C"]
                h_middle = vSize_A[0]
                h_left = vSize_A[1] + vSize_A[2] + vSize_A[5] + vSize_A[6] + vSize_A[9]
                h_right = vSize_C[0] + vSize_C[1] + vSize_C[4] + vSize_C[5] + vSize_C[8]
                height = max(h_middle, h_left, h_right)
                sect_height.append(height)
            elif sect_shape[index] == "PSCH":
                psc_opt1 = res_sect[id]["SECT_BEFORE"]["PSC_OPT1"]
                psc_opt2 = res_sect[id]["SECT_BEFORE"]["PSC_OPT2"]
                vSize_A = res_sect[id]["SECT_BEFORE"]["SECT_I"]["vSIZE_PSC_A"]
                vSize_C = res_sect[id]["SECT_BEFORE"]["SECT_I"]["vSIZE_PSC_C"]
                if psc_opt1 == "LEFT" and psc_opt2 == "POLYGON":
                    h_left = vSize_A[0] + vSize_A[1] + vSize_A[4]
                    h_right = vSize_C[0] + vSize_C[1] + vSize_C[4] + vSize_C[6] + vSize_C[9]
                elif psc_opt1 == "RIGHT" and psc_opt2 == "POLYGON":
                    h_left = vSize_C[0] + vSize_C[1] + vSize_C[4] + vSize_C[6] + vSize_C[9]
                    h_right = vSize_A[0] + vSize_A[1] + vSize_A[4]
                elif psc_opt1 == "LEFT" and psc_opt2 == "CIRCLE":
                    h_left = vSize_A[0] + vSize_A[1] + vSize_A[4]
                    h_right = vSize_C[0] + vSize_C[4] + vSize_C[9]
                elif psc_opt1 == "RIGHT" and psc_opt2 == "CIRCLE":
                    h_left = vSize_C[0] + vSize_C[4] + vSize_C[9]
                    h_right = vSize_A[0] + vSize_A[1] + vSize_A[4]
                elif psc_opt1 == "LEFT" and psc_opt2 == "NONE":
                    h_left = vSize_A[0] + vSize_A[1] + vSize_A[4]
                    h_right = vSize_C[0]
                elif psc_opt1 == "RIGHT" and psc_opt2 == "NONE":
                    h_left = vSize_C[0]
                    h_right = vSize_A[0] + vSize_A[1] + vSize_A[4]
                height = max(h_left, h_right)
                sect_height.append(height)
            elif sect_shape[index] == "PSCT":
                vSize_A = res_sect[id]["SECT_BEFORE"]["SECT_I"]["vSIZE_PSC_A"]
                vSize_C = res_sect[id]["SECT_BEFORE"]["SECT_I"]["vSIZE_PSC_C"]
                h_middle = vSize_A[0]
                h_left = vSize_A[1] + vSize_A[2] + vSize_A[3]
                h_right = vSize_C[0] + vSize_C[1] + vSize_C[2]
                height = max(h_left, h_right)
                sect_height.append(height)
            elif sect_shape[index] == "PSCB":
                psc_opt1 = res_sect[id]["SECT_BEFORE"]["PSC_OPT1"]
                psc_opt2 = res_sect[id]["SECT_BEFORE"]["PSC_OPT2"]
                vSize_A = res_sect[id]["SECT_BEFORE"]["SECT_I"]["vSIZE_PSC_A"]
                vSize_C = res_sect[id]["SECT_BEFORE"]["SECT_I"]["vSIZE_PSC_C"]
                if psc_opt1 == "HALF" and psc_opt2 == "LEFT":
                    height = vSize_A[2] + vSize_A[3] + vSize_A[4]
                elif psc_opt1 == "HALF" and psc_opt2 == "RIGHT":
                    height = vSize_C[0] + vSize_C[1] + vSize_C[2]
                elif psc_opt1 == "1CELL" and psc_opt2 == "CIRCLE":
                    h_left = vSize_A[2] + vSize_A[3] + vSize_A[4]
                    h_right = vSize_C[0] + vSize_C[1] + vSize_C[2]
                elif psc_opt1 == "1CELL" and psc_opt2 == "POLYGON":
                    h_left = vSize_A[2] + vSize_A[3] + vSize_A[4]
                    h_right = vSize_C[0] + vSize_C[1] + vSize_C[2]
                elif psc_opt1 == "2CELL":
                    h_left = vSize_A[2] + vSize_A[3] + vSize_A[4]
                    h_right = vSize_C[0] + vSize_C[1] + vSize_C[2]
                height = max(h_left, h_right)
                sect_height.append(height)
            elif sect_shape[index] == "VALU":
                Outer_Polygon = res_sect[id]["SECT_BEFORE"]["SECT_I"]["OUTER_POLYGON"]
                y_values = [vertex["Y"] for item in Outer_Polygon for vertex in item["VERTEX"]]
                max_y = max(y_values)
                min_y = min(y_values)
                height = max_y - min_y
                sect_height.append(height)
            elif sect_shape[index] == "CMPW":
                vSize_A = res_sect[id]["SECT_BEFORE"]["SECT_I"]["vSIZE_PSC_A"]
                height = vSize_A[0] + vSize_A[1] + vSize_A[2] + vSize_A[3] + vSize_A[4]
                sect_height.append(height)

    return sect_height, slab_height

def merge_height_widht_temp_data(height_temp, diff_temp, ref_height_width):
    # 높이 변화점 추출 및 정렬
    change_points = set()
    for start, end, _ in ref_height_width:
        change_points.add(start)
        change_points.add(end)
    all_heights = sorted(set(height_temp).union(change_points))
    
    # 폭 리스트 계산
    width_list = []
    for height in all_heights:
        for start, end, width in ref_height_width:
            if start <= height <= end:
                width_list.append(width)
                break
    
    # diff_temp 보간
    interpolated_diff_temp = np.interp(all_heights, height_temp, diff_temp)
    interpolated_diff_temp = interpolated_diff_temp.tolist()
    
    return all_heights, width_list, interpolated_diff_temp

def create_btmp_json(
        super_type: int,
        deck_surf_type: str,
        deck_surf_thick: float,
        diff_option: bool,
        lcname_to_apply: list
    )-> dict:

    '''
    최종 결정된 온도값과 상부타입, 적용할 LC명을 입력받아서 btmp_json을 생성한다.
    
    Args:
        super_type (int): Superstructure Type
        diff_temperature_data (dict): Differences Temperature Data
        deck_surf_type (str): Deck Surfacing Type
        deck_surf_thick (float): Deck Surfacing Thickness
        diff_option (bool): Option for Interpolation
        lcname_to_apply (list): List of LC Names to Apply
    
    Returns:
        dict: btmp_json
    '''
    
    # API 이용하자
    civil = MidasAPI(Product.CIVIL, "KR")
    
    # 현재 선택된 요소 가져오기
    res_select = civil.view_select_get()
    elem_list = res_select["ELEM_LIST"]
    
    # 선택된 요소가 없다면, 에러 메시지 반환
    if len(elem_list) == 0:
        message = {
            "error": {
                "message": "No element selected."
            }
        }
        return message

    # 선택된 요소의 단면이 입력 가능한지 체크하자!!!! 중요!!!!!
    # 모든 단면에 대해 대응하기 어렵다. 단면이 한두개도 아니고....휴..
    # Bean Section Temeperatures 기능을 이용해서 하중을 넣을건데
    # 기능 분기점으로 General 과 PSC/Composite이 있다.
    # 가장 큰 차이점은 General은 단면의 폭을 직접 입력해야하고, PSC/Composite은 자동적용이 된다는 점이다.
    # Superstructure Type이 2,3 이면 PSC/Composite에 속하므로 문제가 없다. 하중 높이만 제대로 산정해서 던져주면 그만.(사실 이것도 문제가 있긴 하다. 단면을 제한하는 거니까)
    # 다만, Superstucture Type이 1이면, Steel 을 얘기함으로..사실상 구현 가능한 단면을 특정하기 어렵다는거....아오..
    # 그래서, Superstructure Type이 1이면, General로 쓰고, 특정 단면만 되는걸로 하자-> Steel Girder, DB 중 몇개만    
    
    # 선택된 요소의 요소 정보 가져오기
    str_elem = ','.join([str(elem) for elem in elem_list])
    res_elem = civil.db_read_item("ELEM", str_elem)
    
    list_sect_id = []
    list_elem_type = []
    for _, elem in enumerate(elem_list):
        list_sect_id.append(res_elem[elem]['SECT'])
        list_elem_type.append(res_elem[elem]['TYPE'])
    
    # 선택된 요소가 BEAM 이 아닌 경우, 에러 메시지 반환
    if any(elem_type != "BEAM" for elem_type in list_elem_type):
        message = {
            "error": {
                "message": "Invalid element type. Only beam elements are allowed."
            }
        }
        return message
    
    # 선택된 요소의 단면 정보 가져오기
    # 필요한 단면 정보만 가져오기 위해, 유니크 리스트를 따로 제작
    uniq_list_sect = list(set(list_sect_id))
    
    # 단위를 하나만 적용할 수 있으므로, 길이 단위가 MM이 아니면 MM으로 변경하자.
    res_unit = civil.db_read("UNIT")
    unit_length = res_unit[1]["DIST"]
    if unit_length != "MM":
        json_unit = {
            1: {
                "DIST": "MM"
            }
        }
        
        civil.db_update("UNIT", json_unit)
    
    srt_sect = ','.join([str(sect) for sect in uniq_list_sect])
    res_sect = civil.db_read_item("SECT", srt_sect)
    
    # 단면의 타입과 현상 정보 가져오기
    list_sect_type = []
    list_sect_shape = []
    for _, sect in enumerate(list_sect_id):
        list_sect_type.append(res_sect[sect]['SECTTYPE'])
        list_sect_shape.append(res_sect[sect]['SECT_BEFORE']['SHAPE'])
    
    # 선택된 요소가 SuperStructure Type과 일치하지 않는 경우, 에러 메시지 반환
    if super_type == 1:
        allowed_sect_type = ['DBUSER']
        allowed_sect_shape = ['H', 'B']
        if any(item not in allowed_sect_type for item in list_sect_type):
            message = {
                "error": {
                    "message": "Invalid section type. Only SOD, DBUSER, VALUE sections are allowed."
                }
            }
            return message
        if any(item not in allowed_sect_shape for item in list_sect_shape):
            message = {
                "error": {
                    "message": "Invalid section shape. Only H, B shapes are allowed."
                }
            }
            return message
    
    elif super_type == 2:
        allowed_sect_type = ["COMPOSITE"]
        allowed_sect_shape = ["B", "I", "Tub", "GB", "GI", "GT"]
        if any(item not in allowed_sect_type for item in list_sect_type):
            message = {
                "error": {
                    "message": "Invalid section type. Only COMPOSITE sections are allowed."
                }
            }
            return message
        if any(item not in allowed_sect_shape for item in list_sect_shape):
            message = {
                "error": {
                    "message": "Invalid section shape. Only B, I, Tub, GB, GI, GT shapes are allowed."
                }
            }
            return message
    
    elif super_type == 3:
        allowed_sect_type = ["PSC"]
        allowed_sect_shape = ["1CEL", "2CEL", "3CEL", "NCEL", "NCE2", "PSCM", "PSCI", "PSCH", "PSCT", "PSCB", "VALU"]
        if any(item not in allowed_sect_type for item in list_sect_type):
            message = {
                "error": {
                    "message": "Invalid section type. Only PSC sections are allowed."
                }
            }
            return message
        if any(item not in allowed_sect_shape for item in list_sect_shape):
            message = {
                "error": {
                    "message": "Invalid section shape. Only 1CEL, 2CEL, 3CEL, NCEL, NCE2, PSCM, PSCI, PSCH, PSCT, PSCB, VALU shapes are allowed."
                }
            }
            return message

    # 각 단면의 높이를 구하자.
    list_sect_height, list_slab_height = calculate_section_height(unit_length, res_sect, list_sect_id, list_sect_type, list_sect_shape)
    
    list_diff_temp = []
    for _, height in enumerate(list_sect_height):
        diff_temperature_data = interpolate_temperature(super_type, deck_surf_type, deck_surf_thick, height, diff_option)
        list_diff_temp.append(diff_temperature_data)
    
    # 하중을 적용할 수 있는 높이의 제한이 있다.
    # 이를 넘어가는 높이의 단면이 하나라도 있으면 에러 메시지를 반환하자.
    if super_type == 1:
        # heating의 경우, h1 = 100, h2 = 200, h3 = 300 이므로, 단면의 높이가 600mm 이상이어야 한다.
        # cooling의 경우, h1 = 500 이므로, 단면의 높이가 500mm 이상이어야 한다.
        for index, height in enumerate(list_sect_height):
            if height < 600:
                message = {
                    "error" :{
                        "message": "Invalid section height. Only sections with a height of 600mm(h1 + h2 + h3) or more are allowed for Group 1."
                    }
                }
                return message
    elif super_type == 2:
        # heating과 cooling 모두, Slab 두께 + 400mm 이상이어야 한다.
        for index, height in enumerate(list_sect_height):
            limit = list_slab_height[index] + 400
            if height < limit:
                message = {
                    "error" :{
                        "message": "Invalid section height. Only sections with a height of Slab + 400 mm or more are allowed for Group 2."
                    }
                }
                return message
    elif super_type == 3:
        # cooling의 경우 어떤 두께가 와도 입력이 가능하고,
        # heating의 경우, 133.3333 mm 이상이어야 한다. 이보다 작아질 경우, h3가 0 이하가 된다.
        # 따라서 근사값으로 135mm로 설정
        for index, height in enumerate(list_sect_height):
            if height < 135:
                message = {
                    "error" :{
                        "message": "Invalid section height. Only sections with a height of 134 mm(h > 80/0.6) or more are allowed for Group 3."
                    }
                }
                return message
    
    # 단면에 관련한 많은 허들을 넘었다. 이제 온도하중을 적용해보자.
    
    # 단위를 가져와서 셀시우스인지 확인하자.
    # 만약 셀시우스가 아니라면, 셀시우스로 변경하자.
    unit_temp = res_unit[1]["TEMPER"]
    
    if unit_temp != "C":
        json_unit = {
            1: {
                "TEMPER": "C"
            }
        }
        
        civil.db_update("UNIT", json_unit)
        
    # 프로그램의 적용되어 있는 초기 온도를 가져오자.
    res_styp = civil.db_read("STYP")
    initial_temp = res_styp[1]["TEMP"]
    
    # 초기 온도에 계산 최종 온도값을 더하자!!!!!!!! 중요!!!!!!
    final_diff_temp = []
    for diff_temperature_data in list_diff_temp:
        final_diff_temp.append({key: value + initial_temp for key, value in diff_temperature_data.items()})
    
    # 우선 선택한 요소에 BTMP가 적용되어 있는지 확인해보자.
    res_btmp = civil.db_read("BTMP")
    start_items_id = []
    
    # BTMP가 적용된 요소가 없다면, 모든 요소의 아이템 id는 1로 시작하면 된다.
    if "error" in res_btmp:
        for elem_id in elem_list:
            start_items_id.append(1)
    # 선택한 요소 중에 BTMP가 적용된 요소가 있다면, 해당 요소의 아이템 최대 ID 값을 가져와서 1을 더해주고, 없다면 1로 시작
    else:
        for elem_id in elem_list:
            if elem_id in res_btmp.keys():
                max_id = max(item["ID"] for item in res_btmp[elem_id]["ITEMS"])
                start_items_id.append(max_id + 1)
            else:
                start_items_id.append(1)

    # 부동소수점 오류가 걱정되니까, 0이라고 판단하는 걸 1e-6로 하자
    epsilon = 1e-6
    
    # 이제 온도 하중을 적용해보자.
    json_btmp = {}
    if super_type == 1:
        for index, elem_id in enumerate(elem_list):
            # 폭이 자동 계산되지 않으므로, 높이, 폭, 온도를 입력할 수 있게 분할해서 리스트를 만든다.
            if list_sect_shape[index] == "H":
                vSize = res_sect[list_sect_id[index]]["SECT_BEFORE"]["SECT_I"]["vSIZE"]
                H = vSize[0]
                B1 = vSize[1]
                tw = vSize[2]
                tf1 = vSize[3]
                B2 = vSize[4]
                tf2 = vSize[5]
                
                if abs(tf2) < epsilon:
                    tf2 = tf1
                if abs(B2) < epsilon:
                    B2 = B1
                
                sect_height_width = [
                    [0, tf1, B1],
                    [tf1, H - tf2, tw],
                    [H - tf2, H, B2]
                ]
                height_temp_h = [0, 100, 300, 600, list_sect_height[index]]
                diff_temp_h = [final_diff_temp[index]["T1_h"], final_diff_temp[index]["T2_h"], final_diff_temp[index]["T3_h"], final_diff_temp[index]["T4_h"], 0]
                height_temp_c = [0, 500, list_sect_height[index]]
                diff_temp_c = [final_diff_temp[index]["T1_c"], 0, 0]
                
            elif list_sect_shape[index] == "B":
                vSize = res_sect[list_sect_id[index]]["SECT_BEFORE"]["SECT_I"]["vSIZE"]
                H = vSize[0]
                B = vSize[1]
                tw = vSize[2]
                tf1 = vSize[3]
                tf2 = vSize[5]
                
                if abs(tf2) < epsilon:
                    tf2 = tf1

                sect_height_width = [
                    [0, tf1, B],
                    [tf1, H - tf2, tw * 2],
                    [H - tf2, H, B]
                ]
                height_temp_h = [0, 100, 300, 600, list_sect_height[index]]
                diff_temp_h = [final_diff_temp[index]["T1_h"], final_diff_temp[index]["T2_h"], final_diff_temp[index]["T3_h"], final_diff_temp[index]["T4_h"], 0]
                height_temp_c = [0, 500, list_sect_height[index]]
                diff_temp_c = [final_diff_temp[index]["T1_c"], 0, 0]
            
            # 최종적인 데이터 셋
            final_height_h, final_width_h, final_diff_temp_h = merge_height_widht_temp_data(height_temp_h, diff_temp_h, sect_height_width)
            final_height_c, final_width_c, final_diff_temp_c = merge_height_widht_temp_data(height_temp_c, diff_temp_c, sect_height_width)
            
            # 기본 json 생성
            json_btmp[elem_id]= {
                "ITEMS": [
                    {
                        "ID": start_items_id[index],
                        "LCNAME": lcname_to_apply[0],
                        "DIR": "LZ",
                        "REF": "Top",
                        "NUM": 2,
                        "bPSC": False,
                        "vSECTTMP": []
                    },
                    {
                        "ID": start_items_id[index] + 1,
                        "LCNAME": lcname_to_apply[1],
                        "DIR": "LZ",
                        "REF": "Top",
                        "NUM": 2,
                        "bPSC": False,
                        "vSECTTMP": []
                    }
                ]
            }
            
            # 온도가 앞뒤가 0 이면 그 부분은 하지마~
            for i in range(len(final_height_h) - 1):
                if abs(final_diff_temp_h[i]) < epsilon and abs(final_diff_temp_h[i + 1]) < epsilon:
                    continue
                else:
                    json_btmp[elem_id]["ITEMS"][0]["vSECTTMP"].append({
                        "TYPE": "ELEMENT",
                        "VAL_B": final_width_h[i + 1],
                        "VAL_H1": final_height_h[i],
                        "VAL_H2": final_height_h[i + 1],
                        "VAL_T1": final_diff_temp_h[i],
                        "VAL_T2": final_diff_temp_h[i + 1]
                    })
            
            json_btmp[elem_id]["ITEMS"][0]["NUM"] = len(json_btmp[elem_id]["ITEMS"][0]["vSECTTMP"])
            
            for i in range(len(final_height_c) - 1):
                if abs(final_diff_temp_c[i]) < epsilon and abs(final_diff_temp_c[i + 1]) < epsilon:
                    continue
                else:
                    json_btmp[elem_id]["ITEMS"][1]["vSECTTMP"].append({
                        "TYPE": "ELEMENT",
                        "VAL_B": final_width_c[i + 1],
                        "VAL_H1": final_height_c[i],
                        "VAL_H2": final_height_c[i + 1],
                        "VAL_T1": final_diff_temp_c[i],
                        "VAL_T2": final_diff_temp_c[i + 1]
                    })
            
            json_btmp[elem_id]["ITEMS"][1]["NUM"] = len(json_btmp[elem_id]["ITEMS"][1]["vSECTTMP"])
            
    elif super_type == 2:
        h_heating = []
        h_cooling = []
        for index, elem_id in enumerate(elem_list):
            h_heating.append([0.75*list_slab_height[index], list_slab_height[index] + 400])
            h_cooling.append([0.6*list_slab_height[index], list_slab_height[index] + 400])
            json_btmp[elem_id] = {
                "ITEMS": [
                    {
                        "ID": start_items_id[index],
                        "LCNAME": lcname_to_apply[0],
                        "DIR": "LZ",
                        "REF": "Top",
                        "NUM": 2,
                        "bPSC": True,
                        "vSECTTMP": [
                            {
                                "TYPE": "ELEMENT",
                                "REF": 0,
                                "OPT_B": 0,
                                "OPT_H1": 3,
                                "VAL_H1": 0,
                                "OPT_H2": 3,
                                "VAL_H2": 0.75*list_slab_height[index],
                                "VAL_T1": final_diff_temp[index]["T1_h"],
                                "VAL_T2": final_diff_temp[index]["T2_h"]
                            },
                            {
                                "TYPE": "ELEMENT",
                                "REF": 0,
                                "OPT_B": 0,
                                "OPT_H1": 3,
                                "VAL_H1": 0.75*list_slab_height[index],
                                "OPT_H2": 3,
                                "VAL_H2": list_slab_height[index] + 400,
                                "VAL_T1": final_diff_temp[index]["T2_h"],
                                "VAL_T2": 0
                            }
                        ]
                    },
                    {
                        "ID": start_items_id[index] + 1,
                        "LCNAME": lcname_to_apply[1],
                        "DIR": "LZ",
                        "REF": "Top",
                        "NUM": 2,
                        "bPSC": True,
                        "vSECTTMP": [
                            {
                                "TYPE": "ELEMENT",
                                "REF": 0,
                                "OPT_B": 0,
                                "OPT_H1": 3,
                                "VAL_H1": 0,
                                "OPT_H2": 3,
                                "VAL_H2": 0.6*list_slab_height[index],
                                "VAL_T1": final_diff_temp[index]["T1_c"],
                                "VAL_T2": 0
                            },
                            {
                                "TYPE": "ELEMENT",
                                "REF": 0,
                                "OPT_B": 0,
                                "OPT_H1": 3,
                                "VAL_H1": list_slab_height[index],
                                "OPT_H2": 3,
                                "VAL_H2": list_slab_height[index] + 400,
                                "VAL_T1": 0,
                                "VAL_T2": final_diff_temp[index]["T2_c"]
                            }
                        ]
                    }
                ]
            }
    elif super_type == 3:
        h_heating = []
        h_cooling = []
        for index, elem_id in enumerate(elem_list):
            # 높이를 미리 구하자
            h1_h = min(0.4*list_sect_height[index], 150)
            h2_h = max(min(0.4*list_sect_height[index], 250), 80)
            h3_h = min((0.1*list_sect_height[index] + deck_surf_thick),(list_sect_height[index] - h1_h - h2_h))

            h1_c = min(0.2*list_sect_height[index], 250)
            h2_c = min(0.25*list_sect_height[index], 400)
            h3_c = min(0.15*list_sect_height[index], 400)
            h4_c = h1_c
            
            h_heating.append([h1_h, h2_h, h3_h])
            h_cooling.append([h1_c, h2_c, h3_c, h4_c])
            
            # Heating T3을 제외한 json을 생성
            json_btmp[elem_id] = {
                "ITEMS": [
                    {
                        "ID": start_items_id[index],
                        "LCNAME": lcname_to_apply[0],
                        "DIR": "LZ",
                        "REF": "Top",
                        "NUM": 2,
                        "bPSC": True,
                        "vSECTTMP": [
                            {
                                "TYPE": "ELEMENT",
                                "REF": 0,
                                "OPT_B": 0,
                                "OPT_H1": 3,
                                "VAL_H1": 0,
                                "OPT_H2": 3,
                                "VAL_H2": h1_h,
                                "VAL_T1": final_diff_temp[index]["T1_h"],
                                "VAL_T2": final_diff_temp[index]["T2_h"]
                            },
                            {
                                "TYPE": "ELEMENT",
                                "REF": 0,
                                "OPT_B": 0,
                                "OPT_H1": 3,
                                "VAL_H1": h1_h,
                                "OPT_H2": 3,
                                "VAL_H2": h1_h + h2_h,
                                "VAL_T1": final_diff_temp[index]["T2_h"],
                                "VAL_T2": 0
                            }
                        ]
                    },
                    {
                        "ID": start_items_id[index] + 1,
                        "LCNAME": lcname_to_apply[1],
                        "DIR": "LZ",
                        "REF": "Top",
                        "NUM": 4,
                        "bPSC": True,
                        "vSECTTMP": [
                            {
                                "TYPE": "ELEMENT",
                                "REF": 0,
                                "OPT_B": 0,
                                "OPT_H1": 3,
                                "VAL_H1": 0,
                                "OPT_H2": 3,
                                "VAL_H2": h1_c,
                                "VAL_T1": final_diff_temp[index]["T1_c"],
                                "VAL_T2": final_diff_temp[index]["T2_c"]
                            },
                            {
                                "TYPE": "ELEMENT",
                                "REF": 0,
                                "OPT_B": 0,
                                "OPT_H1": 3,
                                "VAL_H1": h1_c,
                                "OPT_H2": 3,
                                "VAL_H2": h1_c + h2_c,
                                "VAL_T1": final_diff_temp[index]["T2_c"],
                                "VAL_T2": 0
                            },
                            {
                                "TYPE": "ELEMENT",
                                "REF": 1,
                                "OPT_B": 0,
                                "OPT_H1": 3,
                                "VAL_H1": 0,
                                "OPT_H2": 3,
                                "VAL_H2": h4_c,
                                "VAL_T1": final_diff_temp[index]["T4_c"],
                                "VAL_T2": final_diff_temp[index]["T3_c"]
                            },
                            {
                                "TYPE": "ELEMENT",
                                "REF": 1,
                                "OPT_B": 0,
                                "OPT_H1": 3,
                                "VAL_H1": h4_c,
                                "OPT_H2": 3,
                                "VAL_H2": h4_c + h3_c,
                                "VAL_T1": final_diff_temp[index]["T3_c"],
                                "VAL_T2": final_diff_temp[index]["T3_c"]
                            },
                        ]
                    }
                ]
            }
            
            # Heating T3을 적용하는 경우, json 구조 추가
            if final_diff_temp[index]["T3_h"] > 0:
                json_btmp[elem_id]["ITEMS"][0]["NUM"] = 3
                json_btmp[elem_id]["ITEMS"][0]["vSECTTMP"].append(
                    {
                        "TYPE": "ELEMENT",
                        "REF": 1,
                        "OPT_B": 0,
                        "OPT_H1": 3,
                        "VAL_H1": 0,
                        "OPT_H2": 3,
                        "VAL_H2": h3_h,
                        "VAL_T1": final_diff_temp[index]["T3_h"],
                        "VAL_T2": 0
                    }
                )
    
    res_btmp = civil.db_update("BTMP", json_btmp)
    print(res_btmp)
    if "BTMP" in res_btmp:
        if super_type == 1:
            message = {
                "success": {
                    "message": "Temperature load successfully applied."
                },
                "output":{
                    "elem_list": elem_list,
                    "section_height": list_sect_height,
                    "section_type": list_sect_type,
                    "section_shape": list_sect_shape,
                    "final_height_h" : final_height_h,
                    "final_width_h" : final_width_h,
                    "final_diff_temp_h" : final_diff_temp_h,
                    "final_height_c" : final_height_c,
                    "final_width_c" : final_width_c,
                    "final_diff_temp_c" : final_diff_temp_c                
                }
            }
        elif super_type == 2:
            message = {
                "success": {
                    "message": "Temperature load successfully applied."
                },
                "output":{
                    "elem_list": elem_list,
                    "section_height": list_sect_height,
                    "section_type": list_sect_type,
                    "section_shape": list_sect_shape,
                    "slab_height": list_slab_height,
                    "final_diff_temp": final_diff_temp
                }
            }
        elif super_type == 3:
            message = {
                "success": {
                    "message": "Temperature load successfully applied."
                },
                "output":{
                    "elem_list": elem_list,
                    "section_height": list_sect_height,
                    "section_type": list_sect_type,
                    "section_shape": list_sect_shape,
                    "final_height_h" : h_heating,
                    "final_height_c" : h_cooling,
                    "final_diff_temp": final_diff_temp
                }
            }
    else:
        message = {
            "error": {
                "message": "Failed to apply temperature load."
            }
        }
    
    return message

def assign_temperature_difference(diff_json_input: str
    )-> str:
    
    diff_input = json.loads(diff_json_input)
    
    super_type = diff_input["super_type"]
    deck_surf_type = diff_input["deck_surf_type"]
    deck_surf_thick = diff_input["deck_surf_thick"]
    diff_option = diff_input["diff_option"]
    lcname_to_apply = diff_input["lcname_to_apply"]
    
    res_create_btmp = create_btmp_json(super_type, deck_surf_type, deck_surf_thick, diff_option, lcname_to_apply)
    
    if "error" in res_create_btmp:
        result = res_create_btmp
    else:
        details = {
            "input":{
                "super_type": super_type,
                "deck_surf_type": deck_surf_type,
                "deck_surf_thick": deck_surf_thick,
                "diff_option": diff_option,
                "lcname_to_apply": lcname_to_apply  
            }
        }
        res_create_btmp.update(details)
        result = res_create_btmp
    print(result)
    
    return json.dumps(result)

def print_result_differ(diff_json_input: str
    )-> str:

    '''
    최종 결정된 온도값과 상부타입, 적용할 LC명을 입력받아서 btmp_json을 생성한다.
    
    Args:
        super_type (int): Superstructure Type
        diff_temperature_data (dict): Differences Temperature Data
        deck_surf_type (str): Deck Surfacing Type
        deck_surf_thick (float): Deck Surfacing Thickness
        diff_option (bool): Option for Interpolation
    
    Returns:
        dict: btmp_json
    '''
    diff_input = json.loads(diff_json_input)
    
    super_type = diff_input["super_type"]
    deck_surf_type = diff_input["deck_surf_type"]
    deck_surf_thick = diff_input["deck_surf_thick"]
    diff_option = diff_input["diff_option"]
    sect_height = diff_input["sect_height"]
    
    diff_temperature_data = interpolate_temperature(super_type, deck_surf_type, deck_surf_thick, sect_height, diff_option)
    
    return json.dumps(diff_temperature_data)

'''==============================UI Tools=============================='''

def stldlist():
    # API 이용하자
    civil = MidasAPI(Product.CIVIL, "KR")
    
    res_stld = civil.db_read("STLD")
    if "error" in res_stld:
        message = {
            "error": {
                "message": "Failed to update the list of load cases."
            }
        }
    else:
        stld_list = []
        for _, value in enumerate(res_stld.keys()):
            name = res_stld[value]["NAME"]
            stld_list.append([name, name])
        message = {
            "success": {
                "message": "Successfully updated the list of load cases.",
                "stld_list": stld_list
            }
        }
        
    return json.dumps(message)