'''                                                                     
                                                      __             
 _____    __  __                ___ ___       __     /\_\     ___    
/\ '__`\ /\ \/\ \             /' __` __`\   /'__`\   \/\ \  /' _ `\  
\ \ \L\ \\ \ \_\ \            /\ \/\ \/\ \ /\ \L\.\_  \ \ \ /\ \/\ \ 
 \ \ ,__/ \/`____ \           \ \_\ \_\ \_\\ \__/.\_\  \ \_\\ \_\ \_\
  \ \ \/   `/___/> \  _______  \/_/\/_/\/_/ \/__/\/_/   \/_/ \/_/\/_/
   \ \_\      /\___/ /\______\                                       
    \/_/      \/__/  \/______/                                       

'''

# this is sample code for python script.
# if you want to use other python files, import here and functions export your javascript code.
import json , requests
from pyscript_engineers_web import set_g_values, get_g_values, requests_json
from pyscript_engineers_web import MidasAPI, Product

# Define global variables
base_url = None
mapi_key = None

def initialize_globals():
    global base_url, mapi_key
    values = json.loads(get_g_values())
    g_base_uri = values["g_base_uri"]
    g_base_port = values["g_base_port"]
    base_url = f'https://{g_base_uri}:{g_base_port}/civil'
initialize_globals()
def HelloWorld():
	return (f'Hello World! this message is from def HelloWorld of PythonCode.py')

def ApiGet():
	values = json.loads(get_g_values())
	base_uri = values["g_base_uri"]
	res = requests_json.get(url=f'https://{base_uri}/health', headers={
		'Content-Type': 'application/json'
	})
	return json.dumps(res)

# Basic CRUD Sample
def py_db_create(item_name, items):
	civil = MidasAPI(Product.CIVIL, "KR")
	return json.dumps(civil.db_create(item_name, json.loads(items)))

def py_db_create_item(item_name, item_id, item):
  civil = MidasAPI(Product.CIVIL, "KR")
  return json.dumps(civil.db_create_item(item_name, item_id, json.loads(item)))

def py_db_read(item_name):
	civil = MidasAPI(Product.CIVIL, "KR")
	return json.dumps(civil.db_read(item_name))

def py_db_read_item(item_name, item_id):
	civil = MidasAPI(Product.CIVIL, "KR")
	return json.dumps(civil.db_read_item(item_name, item_id))

def py_db_update(item_name, items):
	civil = MidasAPI(Product.CIVIL, "KR")
	return json.dumps(civil.db_update(item_name, json.loads(items)))

def py_db_update_item(item_name, item_id, item):
	civil = MidasAPI(Product.CIVIL, "KR")
	return json.dumps(civil.db_update_item(item_name, item_id, json.loads(item)))

def py_db_delete(item_name, item_id):
	civil = MidasAPI(Product.CIVIL, "KR")
	return json.dumps(civil.db_delete(item_name, item_id))

'''
                            __                         __                                
                     __    /\ \__                     /\ \                               
 __  __  __   _ __  /\_\   \ \ ,_\     __             \ \ \___       __    _ __     __   
/\ \/\ \/\ \ /\`'__\\/\ \   \ \ \/   /'__`\            \ \  _ `\   /'__`\ /\`'__\ /'__`\ 
\ \ \_/ \_/ \\ \ \/  \ \ \   \ \ \_ /\  __/             \ \ \ \ \ /\  __/ \ \ \/ /\  __/ 
 \ \___x___/' \ \_\   \ \_\   \ \__\\ \____\             \ \_\ \_\\ \____\ \ \_\ \ \____\
  \/__//__/    \/_/    \/_/    \/__/ \/____/  _______     \/_/\/_/ \/____/  \/_/  \/____/
                                             /\______\                                   
                                             \/______/                                   
'''
# ↓↓↓↓↓↓↓↓↓↓↓↓ write a main logic here ↓↓↓↓↓↓↓↓↓↓↓↓

# import matplotlib.pyplot as plt

# 입력
# '''
# name = input("Input Function Name :")#func name
# soilClass = input("Input sub soilClass:") #Site sub soil class name
# rf = float(input("Input return period factor:")) # return p factor
# hf=float(input("Input hazard factor:")) # hazard factor
# dist = float(input("Input the distance from Nearest major fault:")) # distance from nearest major fault
# df = float(input("Input design ductility factor :")) #ductility factor
# max_period = float(input("Input max_period(sec):")) #max_period


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

    return json.dumps({
		  "period": period,
			"value": value
		})
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
	aPeriod = inputs["period"] 																# Period
	aValue = inputs["value"] 																	# Spectral Data
	
	# do SPFC_UPDATE
	civilApp = MidasAPI(Product.CIVIL, "KR")
	ID = civilApp.db_get_next_id("SPFC")
	name = func_name 																					# func name
	aFUNC = to_aFUNC(aPeriod, aValue)
	GRAV = UNIT_GET()
	return SPFC_UPDATE(ID,name,GRAV, aFUNC)

# ==================================== API CALL ================================== #
# inputs = json.loads(NZ_input("A",1.3,0.08,2.0,1.5,6.0)) 	# Seismic Data, Maximum Period (sec)
# aPeriod = inputs["period"] 									# Period
# aValue = inputs["value"] 										# Spectral Data
# plot(aPeriod,aValue)																	# Plotting the Graph
# ID=civilApp.db_get_next_id("SPFC")
# name="RS01" 																					#func name
# aFUNC = to_aFUNC(aPeriod, aValue)
# GRAV = UNIT_GET()
# SPFC_UPDATE(ID,name,GRAV, aFUNC)
def MidasAPI_gen(method, command, body=None):
    # base_url = "https://moa-engineers.midasit.com:443/civil"
    # mapi_key = "eyJ1ciI6IklOMjQwNkVRQ0YiLCJwZyI6ImNpdmlsIiwiY24iOiJiUmFYcldHYVNBIn0.fe07df5455b5a464e915494756a490c4b3af771c5ff922470fb09274fd1c4379"
    # global base_url, mapi_key  # Ensure the function uses the global variables
    # print(f"mapi_key {mapi_key}")
    # print(f"Sending {method} request to {base_url + command} with body: {body} and mapi_key: {mapi_key}")  // com`ment out for security`
    url = base_url + command
    headers = {"Content-Type": "application/json", "MAPI-Key": mapi_key}
    try:
        response = requests.request(method, url, headers=headers, json=body)  
        response.raise_for_status()
        # print(f"{method} {command}: {response.status_code}") // com`ment out for security`
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"Error: {e}")
        return None
def calculate_initial_stiffness(func_items):
    if len(func_items) >= 2:
        x1, y1 = func_items[0]["X"], func_items[0]["Y"]
        x2, y2 = func_items[1]["X"], func_items[1]["Y"]
        if x2 - x1 != 0:
            return (y2 - y1) / (x2 - x1)
    return 0.0

# Function to get the direction label based on 'DV' or 'DIR' for multi-linear springs
def get_direction_label(item):
    # Check for DV first
    dv = item.get("DV", None)
    if dv:
        if dv == [1, 0, 0]:
            return "Dx"
        elif dv == [0, 1, 0]:
            return "Dy"
        elif dv == [0, 0, 1]:
            return "Dz"
    
    # Check for DIR if DV is not available
    dir_value = item.get("DIR", None)
    if dir_value is not None:
        if dir_value in [0, 1]:
            return "Dx"
        elif dir_value in [2, 3]:
            return "Dy"
        elif dir_value in [4, 5]:
            return "Dz"
    
    # Return unknown if neither DV nor DIR are recognized
    return "Unknown"

# Function to get the boundary groups in the final stage
def boundary_groups_in_final_stage():
    construction_stages = MidasAPI_gen("GET", "/db/STAG").get("STAG", {})
    if not construction_stages:
        print("No construction stages found.")
        return None

    activated_groups = []  # To keep track of activated groups

    for stage_id, stage_data in sorted(construction_stages.items(), key=lambda x: int(x[0])):
        # Get activated and deactivated groups for the stage
        activated_in_stage = [entry["BNGR_NAME"] for entry in stage_data.get("ACT_BNGR", [])]
        deactivated_in_stage = [entry for entry in stage_data.get("DACT_BNGR", [])]

        # Update activated groups: Add new ones and remove deactivated ones
        for group in activated_in_stage:
            if group not in activated_groups:
                activated_groups.append(group)

        for group in deactivated_in_stage:
            if group in activated_groups:
                activated_groups.remove(group)

    # print("\nFinal Active Groups After All Stages:", activated_groups) // com`ment out for security`
    return activated_groups

# Function to extract and process spring data from MIDAS
def process_spring_data():
    ns_data = MidasAPI_gen("GET", "/db/NSPR")
    ml_data = MidasAPI_gen("GET", "/db/MLFC")
    construction_stages = MidasAPI_gen("GET", "/db/STAG")

    if not ns_data or not ml_data:
        print("Failed to retrieve spring data or multi-linear function data.")
        return None, None

    # Check if construction stages exist
    if not construction_stages or "STAG" not in construction_stages or not construction_stages["STAG"]:
        print("No construction stages found. Processing all springs.")
        active_boundary_groups = None  # Process all springs if no construction stages
    else:
        active_boundary_groups = boundary_groups_in_final_stage()  # Use only active groups

    stiffness_data = {}
    for node_id, node_data in ns_data.get("NSPR", {}).items():
        node_stiffness = {}
        for item in node_data.get("ITEMS", []):
            spring_type = item.get("TYPE")
            
            # Check if the spring belongs to an active boundary group (if active groups exist)
            if active_boundary_groups is not None and item.get("GROUP_NAME") not in active_boundary_groups:
                continue

            if spring_type == "MULTI":
                # Determine direction using either 'DV' or 'DIR'
                direction_label = get_direction_label(item)

                # Skip if stiffness for this direction is already calculated
                if direction_label in node_stiffness:
                    print(f"Skipping duplicate stiffness calculation for Node {node_id} in direction {direction_label}")
                    continue

                func_id = str(item.get("FUNCTION"))
                func_items = ml_data["MLFC"].get(func_id, {}).get("ITEMS", [])
                initial_stiffness = calculate_initial_stiffness(func_items)
                node_stiffness[direction_label] = initial_stiffness
                # print(f"Node {node_id}_{direction_label} - Calculated Initial Stiffness: {initial_stiffness}") // com`ment out for security`
                
            elif spring_type == "LINEAR":
                sdr = item.get("SDR", [0, 0, 0, 0, 0, 0])
                if "Dx" not in node_stiffness and sdr[0] != 0:
                    node_stiffness["Dx"] = sdr[0]
                    # print(f"Node {node_id}_Dx - Existing Linear Stiffness: {sdr[0]}") // com`ment out for security`
                if "Dy" not in node_stiffness and sdr[1] != 0:
                    node_stiffness["Dy"] = sdr[1]
                    # print(f"Node {node_id}_Dy - Existing Linear Stiffness: {sdr[1]}") // com`ment out for security`
                if "Dz" not in node_stiffness and sdr[2] != 0:
                    node_stiffness["Dz"] = sdr[2]
                    # print(f"Node {node_id}_Dz - Existing Linear Stiffness: {sdr[2]}") // com`ment out for security`

        stiffness_data[int(node_id)] = node_stiffness  # Convert node_id to integer for consistency

    if not stiffness_data:
        print("No active boundary groups found. Exiting spring data processing.")
    else:
        print(f"Processed {len(stiffness_data)} springs.")

    return ns_data, ml_data, stiffness_data


# Function to get the next available spring ID
def get_next_spring_id(ns_data):
    max_id = 0
    for node_data in ns_data.get("NSPR", {}).values():
        for item in node_data.get("ITEMS", []):
            if item.get("ID") > max_id:
                max_id = item.get("ID")
    return max_id + 1

# Function to create a structural group for the given nodes
def create_structural_group(node_list, Structural_group_name):
    # Fetch existing group data
    existing_groups = MidasAPI_gen("GET", "/db/GRUP")
    
    if not existing_groups:
        print("Failed to retrieve existing group data.")
        return

    # Check if the structural group already exists in the data
    assign_key = None
    for key, group in existing_groups.get("GRUP", {}).items():
        if group.get("NAME") == Structural_group_name:
            assign_key = key
            break

    # If the group doesn't exist, find the next available key
    if assign_key is None:
        assign_keys = existing_groups.get("GRUP", {})
        if assign_keys:
            assign_key = str(max(int(k) for k in assign_keys.keys()) + 1)
        else:
            assign_key = "1"  # If no groups exist, start with "1"

    # Define the structural group with the correct key
    structural_group = {
        "Assign": {
            assign_key: {
                "NAME": Structural_group_name,
                "P_TYPE": 0,
                "N_LIST": node_list
            }
        }
    }

    # Send the updated structural group data to MIDAS
    response = MidasAPI_gen("PUT", "/db/GRUP", structural_group)
    if response:
        print(f"Structural group '{Structural_group_name}' created with nodes: {node_list}")
    else:
        print("Failed to create structural group.")


# Function to create a new set of linear springs using an existing boundary group
def create_new_springs(ns_data, stiffness_data, group_name):
    new_spring_data = {"Assign": {}}
    spring_id = get_next_spring_id(ns_data)
    minimal_stiffness = 0.001  # Use a negligible value for zero stiffness

    for node_id, stiffness in stiffness_data.items():
        dx_stiffness = stiffness.get("Dx", minimal_stiffness)
        dy_stiffness = stiffness.get("Dy", minimal_stiffness)
        dz_stiffness = stiffness.get("Dz", minimal_stiffness)

        new_spring_data["Assign"][str(node_id)] = {
            'ITEMS': [
                {
                    'ID': spring_id,
                    'TYPE': 'LINEAR',
                    'F_S': [False, False, False, False, False, False],
                    'SDR': [dx_stiffness, dy_stiffness, dz_stiffness, 0, 0, 0],
                    'DAMPING': False,
                    'Cr': [0, 0, 0, 0, 0, 0],
                    'GROUP_NAME': group_name,
                    'FormType': 0,
                    'EFFAREA': 0,
                    'DK': [0, 0, 0]
                }
            ]
        }
        # print(f"Created new spring at Node {node_id} with ID {spring_id}") // com`ment out for security`
        spring_id += 1

    MidasAPI_gen("PUT", "/db/NSPR", new_spring_data)

# Function to assign boundary group for response spectrum analysis
def assign_boundary_for_response_spectrum(group_name):
    # Fetch the current boundary change assignment data
    boundary_data = MidasAPI_gen("GET", "/db/BCCT").get("BCCT")
    
    # Find the boundary change assigned to the response spectrum (THRSEV)
    if boundary_data and "1" in boundary_data:
        data = boundary_data.get("1")  # Assuming we are working with the first boundary change
        
        # Highlight the boundary change entries where the TYPE is 'THRSEV' for Response Spectrum analysis
        highlighted_entries = [entry for entry in data['vLOADANAL'] if entry.get('TYPE') == 'THRSEV']
        
        # Get the BGCNAME of the boundary group used in the response spectrum analysis
        value = highlighted_entries[0].get('BGCNAME')
        
        if value == "UNCHANGED":
            print("No 'THRSEV' boundary group found in the current boundary change.")
            vBOUNDARY = data['vBOUNDARY']
            # Append 'RS Boundary' to the existing list
            vBOUNDARY.append({'BGCNAME': group_name, 'vBG': [group_name]})
        
        else:
            # Add the RS Boundary group to the 'vBOUNDARY' list if it doesn't exist
            for entry in data['vBOUNDARY']:
                if entry.get('BGCNAME') == value:
                    vBOUNDARY = data['vBOUNDARY']
                    # Append 'RS Boundary' to the existing list
                    vBOUNDARY.append({'BGCNAME': group_name, 'vBG': entry.get("vBG") + [group_name]})
        
        # Update the BGCNAME in 'vLOADANAL' for the THRSEV type to the new group
        for entry in data['vLOADANAL']:
            if entry.get('TYPE') == 'THRSEV' and entry.get('BGCNAME') == value:
                entry['BGCNAME'] = group_name

        # Send the updated boundary change assignment back to MIDAS
        BoundaryChangeAssignment = {
            "Assign": {
                "1": data  # Replace the existing assignment with the updated one
            }
        }
        
    else:
        print("No boundary change assignment found.")
        BoundaryChangeAssignment = {
            "Assign": {
                "1": {
                    'bSPT': False, 'bSPR': True, 'bGSPR': False, 'bCGLINK': False, 'bSSSF': False, 'bPSSF': False, 'bRLS': False,
                    'bCDOF': True,
                    'vBOUNDARY': [{'BGCNAME': group_name, 'vBG': [group_name]}],
                    'vLOADANAL': [
                        {'TYPE': 'MV', 'BGCNAME': 'UNCHANGED'},
                        {'TYPE': 'SM', 'BGCNAME': 'UNCHANGED'},
                        {'TYPE': 'THRSEV', 'BGCNAME': group_name},
                        {'TYPE': 'PO', 'BGCNAME': 'UNCHANGED'},
                        {'TYPE': 'THNS', 'BGCNAME': 'UNCHANGED'},
                        {'TYPE': 'ULAT', 'BGCNAME': 'UNCHANGED'}
                    ]
                }
            }
        }

    # Update the boundary change assignment in MIDAS
    MidasAPI_gen("PUT", "/db/BCCT", BoundaryChangeAssignment)
    # print(f"Boundary group '{group_name}' assigned for response spectrum analysis.") // com`ment out for security`

# Function to run the analysis
def run_analysis():
    Analysis = {}
    MidasAPI_gen("POST", "/doc/ANAL", Analysis)
    # print("Response spectrum analysis successfully initiated.")

# Function to extract displacement results based on the structural group and load case
def get_displacement_results(node_list, load_case_name):
    # Format the load case name as "RY(RS)"
    formatted_load_case_name = f"{load_case_name}(RS)"  # Add (RS) to the load case name

    displacements = {
        "Argument": {
            "TABLE_NAME": "DisplacementsGlobal",
            "TABLE_TYPE": "DISPLACEMENTG",
            "EXPORT_PATH": "C:\\MIDAS\\Result\\Output.JSON",
            "STYLES": {"FORMAT": "Scientific", "PLACE": 3},
            "COMPONENTS": ["Node", "Load", "DX", "DY", "DZ"],
            "NODE_ELEMS": {"KEYS": node_list},
            "LOAD_CASE_NAMES": [formatted_load_case_name],  # Use the formatted load case name
        }
    }
    results = MidasAPI_gen("POST", "/post/TABLE", displacements)
    # print("Displacement results successfully extracted.") // com`ment out for security`
    return results

# Function to create updated stiffness data after interpolation
def create_updated_stiffness_data(ns_data, ml_data, displacement_results):
    updated_stiffness_data = {}

    # Iterate over displacement results
    for result in displacement_results['DisplacementsGlobal']['DATA']:
        node_id = int(result[1])  # Node number
        dx_disp = float(result[3])  # Displacement in Dx
        dy_disp = float(result[4])  # Displacement in Dy
        dz_disp = float(result[5])  # Displacement in Dz

        # Check if the node exists in ns_data
        if str(node_id) in ns_data['NSPR']:
            # print(f"\nProcessing Node: {node_id}") // com`ment out for security`
            node_data = ns_data['NSPR'][str(node_id)]
            node_stiffness = {'Dx': None, 'Dy': None, 'Dz': None}
            
            for item in node_data['ITEMS']:
                spring_type = item.get('TYPE')
                
                # For multi-linear springs, update the stiffness based on the displacement
                if spring_type == 'MULTI':
                    direction_label = get_direction_label(item)
                    func_id = str(item['FUNCTION'])
                    func_items = ml_data['MLFC'][func_id]['ITEMS']
                    # print(f"Multi-linear spring found for Node {node_id} in direction {direction_label}") // com`ment out for security`

                    # Handle multi-linear spring stiffness update based on displacement
                    if direction_label == 'Dx' and dx_disp == 0:
                        # Use the first two points in the function if displacement is 0
                        new_stiffness = calculate_initial_stiffness(func_items)
                    elif direction_label == 'Dx':
                        new_stiffness = interpolate_stiffness_from_displacement(func_items, dx_disp)

                    elif direction_label == 'Dy' and dy_disp == 0:
                        new_stiffness = calculate_initial_stiffness(func_items)
                    elif direction_label == 'Dy':
                        new_stiffness = interpolate_stiffness_from_displacement(func_items, dy_disp)

                    elif direction_label == 'Dz' and dz_disp == 0:
                        new_stiffness = calculate_initial_stiffness(func_items)
                    elif direction_label == 'Dz':
                        new_stiffness = interpolate_stiffness_from_displacement(func_items, dz_disp)

                    node_stiffness[direction_label] = new_stiffness
                    # print(f"Updated Stiffness in {direction_label}: {new_stiffness}")// com`ment out for security`

                # For linear springs, retain the existing stiffness values and update in the correct direction
                elif spring_type == 'LINEAR':
                    sdr = item['SDR']
                    if sdr[0] != 0:  # Dx direction
                        node_stiffness['Dx'] = sdr[0]
                        # print(f"Linear spring found for Node {node_id} in direction Dx: {sdr[0]}") // com`ment out for security`
                    if sdr[1] != 0:  # Dy direction
                        node_stiffness['Dy'] = sdr[1]
                        # print(f"Linear spring found for Node {node_id} in direction Dy: {sdr[1]}") // com`ment out for security`
                    if sdr[2] != 0:  # Dz direction
                        node_stiffness['Dz'] = sdr[2]
                        # print(f"Linear spring found for Node {node_id} in direction Dz: {sdr[2]}") // com`ment out for security`

            # Ensure all directions are updated and not left as None
            node_stiffness['Dx'] = node_stiffness['Dx'] if node_stiffness['Dx'] is not None else 0
            node_stiffness['Dy'] = node_stiffness['Dy'] if node_stiffness['Dy'] is not None else 0
            node_stiffness['Dz'] = node_stiffness['Dz'] if node_stiffness['Dz'] is not None else 0

            # Store the updated stiffness data for the node
            updated_stiffness_data[node_id] = node_stiffness
            # print(f"Updated stiffness for Node {node_id}: {node_stiffness}") // com`ment out for security`
        else:
            print(f"Node {node_id} not found in spring data.")

    return updated_stiffness_data



# Function to calculate percentage difference between two sets of displacement values
def calculate_percentage_difference(previous_displacement_values, new_displacement_values):
    max_ratio_diff = 0

    for old, new in zip(previous_displacement_values, new_displacement_values):
        ratio_diff_dx = abs((new[0] - old[0]) / old[0]) if old[0] != 0 else 0
        ratio_diff_dy = abs((new[1] - old[1]) / old[1]) if old[1] != 0 else 0
        ratio_diff_dz = abs((new[2] - old[2]) / old[2]) if old[2] != 0 else 0
        
        # Get the maximum percentage difference among Dx, Dy, Dz
        ratio_diff = max(ratio_diff_dx, ratio_diff_dy, ratio_diff_dz)
        if ratio_diff > max_ratio_diff:
            max_ratio_diff = ratio_diff

    return max_ratio_diff

# Function to extract displacements for comparison
def extract_displacement_values(displacement_results):
    displacements = []
    for result in displacement_results['DisplacementsGlobal']['DATA']:
        dx_disp = float(result[3])  # Displacement in Dx
        dy_disp = float(result[4])  # Displacement in Dy
        dz_disp = float(result[5])  # Displacement in Dz
        displacements.append([dx_disp, dy_disp, dz_disp])
    return displacements


# Function to interpolate spring stiffness from displacement
def interpolate_stiffness_from_displacement(func_items, displacement):
    for i in range(1, len(func_items)):
        x1, y1 = func_items[i - 1]["X"], func_items[i - 1]["Y"]
        x2, y2 = func_items[i]["X"], func_items[i]["Y"]  # Corrected assignment
        if x1 <= displacement <= x2:  # Ensure the displacement is within the range
            # Linear interpolation formula between two points (x1, y1) and (x2, y2)
            interpolated_force = y1 + (displacement - x1) * (y2 - y1) / (x2 - x1)
            # print(f"Displacement: {displacement}, Interpolated between ({x1}, {y1}) and ({x2}, {y2}): {interpolated_force}") // com`ment out for security`
            # Calculate stiffness from (0,0) to the interpolated point
            interpolated_stiffness = interpolated_force / displacement if displacement != 0 else 0
            # print(f"Updated Stiffness: {interpolated_stiffness}") // com`ment out for security`
            return interpolated_stiffness
    # If the displacement is beyond the range, return the last point's stiffness
    return func_items[-1]["Y"] / displacement if displacement != 0 else 0


# Main iterative workflow
def iterative_response_spectrum(Boundary_group_name, load_case_name, threshold_percentage,global_key):
    # print(global_key)
    globals()['mapi_key'] = global_key  # Assign global_key to mapi_key
    # print(mapi_key)
    ns_data, ml_data, stiffness_data = process_spring_data()
    # create_structural_group(list(stiffness_data.keys()), Structural_group_name)
    node_list = list(stiffness_data.keys())
    create_new_springs(ns_data, stiffness_data, Boundary_group_name)
    assign_boundary_for_response_spectrum(Boundary_group_name)

    run_analysis()
    displacement_results = get_displacement_results(node_list, load_case_name)
    previous_displacement_values = extract_displacement_values(displacement_results)
    
    # Initialize result storage
    iteration_results = {}
    iteration_results[1] = stiffness_data  # Store initial stiffness data

    # Start iterating
    max_percentage_diff = 100  # Start with a large difference
    iteration = 2
    
    while max_percentage_diff > threshold_percentage:
        # print(f"Iteration {iteration}") // com`ment out for security`
        # Step 2: Update stiffness based on new displacements
        updated_stiffness = create_updated_stiffness_data(ns_data, ml_data, displacement_results)
        create_new_springs(ns_data, updated_stiffness, Boundary_group_name)
        
        # Store updated stiffness for this iteration
        iteration_results[iteration] = updated_stiffness
        
        # Step 3: Run analysis again and get new displacements
        run_analysis()
        displacement_results = get_displacement_results(node_list,load_case_name)
        new_displacement_values = extract_displacement_values(displacement_results)
        
        # Step 4: Calculate the maximum percentage difference
        max_percentage_diff = calculate_percentage_difference(previous_displacement_values, new_displacement_values)
        # print(f"Max Percentage Difference: {max_percentage_diff:.4f}") // com`ment out for security`
        
        previous_displacement_values = new_displacement_values
        iteration += 1

    print(f"Converged after {iteration - 1} iterations!")  # Print total iterations before convergence // com`ment out for security`
    return json.dumps(iteration_results)
