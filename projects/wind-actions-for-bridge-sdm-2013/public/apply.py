from py_base import MidasAPI, Product, requests_json, get_g_values
import json

def do_apply(
    lcname,
    target_elements,
    direction,
    wind_pressure,
    force_coefficient,
    structural_factor,
    use_additional,
    additional_i_end,
    additional_j_end,
    use_additional_j_end,
):
    # 요청 URL 설정
    # base_url = "https://moa-engineers.midasit.com:443/civil"
    unit_data = "/db/unit"  # 단위
    bmld_data = "/db/bmld"  # 빔 하중

    # 요청 헤더
    # headers = {
    #     "MAPI-Key": "eyJ1ciI6InNreTgxMTAwNSIsInBnIjoiY2l2aWwiLCJjbiI6ImctbUhQOGdsUmcifQ.ac6b72f795a02e816ffbdd7e7f457ea1cdc70be8024a358264c93eba9fd3ec37"
    # }

    ############################################################################################################
    # UNIT API 요청 URL 설정 (GET : 먼저 사용자 단위를 가져옵니다.)
    # request_unit = base_url + unit_data
    # get_unit = requests.get(request_unit, headers=headers)
    civil = MidasAPI(Product.CIVIL, "KR")
    initial_unit_data = civil.db_read("UNIT")

    # 현재 사용자 단위 가져오기
    # initial_unit_data = get_unit.json()
    # print("현재 사용자 단위:", initial_unit_data)

    # 현재의 FORCE와 DIST 단위 저장
    # current_force_unit = initial_unit_data["UNIT"]["1"]["FORCE"]
    # current_dist_unit = initial_unit_data["UNIT"]["1"]["DIST"]
    # current_heat_unit = initial_unit_data["UNIT"]["1"]["HEAT"]
    # current_temper_unit = initial_unit_data["UNIT"]["1"]["TEMPER"]

    current_force_unit = initial_unit_data[1]["FORCE"]
    current_dist_unit = initial_unit_data[1]["DIST"]
    current_heat_unit = initial_unit_data[1]["HEAT"]
    current_temper_unit = initial_unit_data[1]["TEMPER"]

    # 단위를 변경하기 위한 데이터 생성
    # unit_body = {
    #     "Assign": {
    #         "1": {
    #             "FORCE": "KN",
    #             "DIST": "M",
    #             "HEAT": current_heat_unit,
    #             "TEMPER": current_temper_unit,
    #         }
    #     }
    # }

    # 단위 변경을 위한 PUT 요청
    # put_unit = requests.put(request_unit, headers=headers, json=unit_body)

    updated_unit_data = civil.db_update(
        "unit",
        {
            "1": {
                "FORCE": "KN",
                "DIST": "M",
                "HEAT": current_heat_unit,
                "TEMPER": current_temper_unit,
            }
        },
    )


    ############################################################################################################


    bmld_body = civil.db_read("BMLD")

    # BMLD 아이템 생성 및 추가 함수
    def add_bmld_item(bmld_body, element_id, new_item):
        # element_id를 문자열로 변환
        element_id_int = int(element_id)

        # bmld_body에 element_id가 존재하는지 확인
        if element_id_int in bmld_body:
            # 기존 ITEMS 리스트 가져오기
            items = bmld_body[element_id_int].get("ITEMS", [])
            # 기존 아이템들의 ID 리스트 생성
            existing_ids = [item.get("ID", 0) for item in items]
            # 최대 ID 찾기
            max_id = max(existing_ids) if existing_ids else 0
            # 새로운 아이템의 ID 설정
            new_item["ID"] = max_id + 1
            # 새로운 아이템 추가
            items.append(new_item)
            # 업데이트된 ITEMS 리스트를 할당
            bmld_body[element_id_int]["ITEMS"] = items
        else:
            # element_id가 없을 경우 새로운 항목 생성
            new_item["ID"] = 1
            bmld_body[element_id_int] = {"ITEMS": [new_item]}

        return bmld_body
    

    # 각 요소에 대해 BMLD 아이템 생성 및 추가
    pressure = wind_pressure * force_coefficient * structural_factor
    if direction.endswith("-"):
        pressure = -pressure
    direction_axis = direction[:2]  # 'LY' 또는 'LZ'

    # print("boolean", use_additional, use_additional_j_end)

    for elem_id in target_elements:
        new_item = {
            # 'ID'는 함수 내에서 설정됩니다.
            "LCNAME": lcname,
            "GROUP_NAME": "",
            "CMD": "BEAM",
            "TYPE": "PRESSURE",
            "DIRECTION": direction_axis,
            "USE_PROJECTION": False,
            "USE_ECCEN": False,
            "D": [0, 1, 0, 0],
            "P": [pressure, pressure, 0, 0],
            "USE_ADDITIONAL": use_additional,
            "ADDITIONAL_I_END": additional_i_end,
            "ADDITIONAL_J_END": additional_j_end,
            "USE_ADDITIONAL_J_END": use_additional_j_end,
        }
        add_bmld_item(bmld_body, elem_id, new_item)

    response_put = civil.db_update("bmld", bmld_body)

    ############################################################################################################
    # UNIT API 요청 URL 설정 (PUT : 사용자 단위를 원래대로 되돌립니다.)
    # unit_body_restore = {"Assign": initial_unit_data["UNIT"]}
    unit_body_restore = {"Assign": initial_unit_data}

    # UNIT API 요청 URL 설정 (PUT : 사용자 단위를 원래대로 되돌립니다.)
    # put_unit = requests.put(request_unit, headers=headers, json=unit_body_restore)
    reverted_unit_data = civil.db_update("unit", initial_unit_data)


    # BMLD 응답 데이터 반환
    return response_put


if __name__ == "__main__":
    # example usage

    lcname = "Wx"  # 정적 하중 케이스 이름
    target_elements = [7, 8, 9]  # 요소 ID 목록
    direction = "LY+"  # LY+, LY-, LZ+, LZ- 중 하나
    wind_pressure = 3.09  # wind pressure value
    force_coefficient = 1.0
    structural_factor = 1.0
    use_additional = False  # Use of Height of restraint (parapet or barrier)
    additional_i_end = 0  #  Height I-End
    additional_j_end = 0  # Height J-End
    use_additional_j_end = False  # Check of height J-End

    # do_apply 함수 호출
    result = do_apply(
        lcname,
        target_elements,
        direction,
        wind_pressure,
        force_coefficient,
        structural_factor,
        use_additional,
        additional_i_end,
        additional_j_end,
        use_additional_j_end,
    )
    print("result:", result)
