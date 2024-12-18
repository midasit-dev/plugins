### do not delete this import scripts ###
import json
from py_base import set_g_values, get_g_values, requests_json, MidasAPI, Product
from py_base_sub import HelloWorld, ApiGet
import numpy as np
import math
from collections import Counter
### do not delete this import scripts ###


def py_select_node_list():
	civil = MidasAPI(Product.CIVIL)
	civil.db_update("UNIT", {
        "1": {
            "FORCE": "KN",
            "DIST": "M",
            "HEAT": "BTU",
            "TEMPER": "C"
        }
    })
	select = civil.view_select_get()
	if select == None:
			error_message = {"error" : "Cannot get selected element list"}
			return json.dumps(error_message)
	nodes = select.get("ELEM_LIST")
	if nodes == None:
			error_message = {"error" : "Cannot get element list"}
			return json.dumps(error_message)
	return json.dumps(nodes)

def py_set_structure_type():
	civil = MidasAPI(Product.CIVIL)
	civil.db_update("STYP", {
		"1": {
						"STYP": 1,
						"MASS": 1,
						"bMASSOFFSET": False,
						"bSELFWEIGHT": False,
						"GRAV": 9.806,
						"TEMP": 0,
						"bALIGNBEAM": False,
						"bALIGNSLAB": False,
						"bROTRIGID": False
				}
	})

def py_generate_nodes(element_list, Modulus, Poisson, BoundaryCondition):
	civil = MidasAPI(Product.CIVIL)
	element_list = json.loads(element_list)
	py_set_structure_type()

	## element 정보들을 읽어옴
	element_json = civil.db_read_item("ELEM", element_list)
	if "error" in element_json:
		return json.dumps(element_json)
	## element 정보들 중 Node 정보만 추출
	## element_node_json = {ElementID: [Node1, Node2], ElementID: [Node3, Node4], ...}
	element_node_json = {key: [element["NODE"][0], element["NODE"][1]] for key, element in element_json.items()}
	
	## NODE 들만 추출하여 하나의 배열 생성
	Node_List_Sum = [node for nodes in element_node_json.values() for node in nodes]
	Node_List = list(set(Node_List_Sum))

	## Node_List 에서 값이 1개인 Node만 추출
	node_counter = Counter(Node_List_Sum)
	End_Node_List = [node for node, count in node_counter.items() if count == 1]

	## Node_List 에 있는 Node 들의 좌표 추출
	## List를 ,로 구분하여 문자열로 변환
	Node_Coordinate = civil.db_read_item("NODE", ",".join(map(str, Node_List)))
	Node_Coordinate_json = {key: [coord["X"], coord["Z"]] for key, coord in Node_Coordinate.items()}
	max_ID = max_id = max(map(int, Node_Coordinate_json.keys()))
	
	## End_Node_List 에 있는 Node 들 중 X좌표가 가장 작은 Node를 시작 Node로 설정
	start_node = min(End_Node_List, key=lambda node: Node_Coordinate_json[str(node)][0])

	## element_node_json 에서 start_node를 시작으로, 연결된 node들을 순서대로 배열로 저장
	## element_node_json = {ElementID: [Node1, Node2], ElementID: [Node3, Node4], ...}
	## result = [start_node, Node1, Node2, Node3, ...]

	Oriented_Node_List = [start_node]
	remaining_elements = element_node_json.copy()
	while remaining_elements:
		for key, nodes in list(remaining_elements.items()):
			if nodes[0] == start_node:
					next_node = nodes[1]
			elif nodes[1] == start_node:
					next_node = nodes[0]
			else:
					continue
			Oriented_Node_List.append(next_node)
			start_node = next_node
			del remaining_elements[key]
			break

	## Oriented_Node_List 순서대로 Node 좌표 저장
	Oriented_Node_json = {node: Node_Coordinate_json[str(node)] for node in Oriented_Node_List}

	## 방향 벡터 계산
	node_key = Oriented_Node_json.keys()
	node_key = list(node_key)
 
	## 새로운 노드 생성
	new_node_cord = calculate_direction_vectors(Oriented_Node_json)

	assign_result, bnd_result, Node_Assign_Json = assign_new_nodes(new_node_cord, max_ID, civil)

	## Compression Only Elastic Link 계산
	Ks_Value, R_Value = calculate_elastic_link_properties(Oriented_Node_json, Modulus, Poisson)

	# Elastic Link 생성

	new_node_key = list(Node_Assign_Json.keys())
	Elnk_Assign_json = {}
	ELink_ID = 1
	for i in range(len(Oriented_Node_json)):
		Elnk_Assign_json[ELink_ID] = {"NODE": [node_key[i], new_node_key[i]], "LINK" : "COMP", "ANGLE" : 0, "SDR" : [Ks_Value[i], 0, 0, 0, 0, 0], "bSHEAR" : False, "DR": [0.5, 0.5]}
		ELink_ID += 1
	elastic_result = civil.db_create("ELNK", Elnk_Assign_json)

	## Boundary Condition 설정
	if BoundaryCondition == 'Hinge':
		startNode = node_key[0]
		endNode = node_key[-1]
		Bnd_Assign_Json = {}
		Bnd_Assign_Json[startNode] = {"ITEMS": [{"ID" : 1, "GROUP_NAME" : "", "CONSTRAINT" : "1110000"}]}
		Bnd_Assign_Json[endNode] = {"ITEMS": [{"ID" : 1, "GROUP_NAME" : "", "CONSTRAINT" : "1110000"}]}
		bnd_result = civil.db_create("CONS", Bnd_Assign_Json)

	else:
		startNode = node_key[0]
		endNode = node_key[-1]
  
		## startNode 의 벡터 계산
		vector_u = np.array([Oriented_Node_json[node_key[1]][0]-Oriented_Node_json[node_key[0]][0], Oriented_Node_json[node_key[1]][1]-Oriented_Node_json[node_key[0]][1]])
		## 크기 1인 벡터로 변환
		vector_u = vector_u / np.linalg.norm(vector_u)
		## startNode 에서 vector_u 방향으로 1만큼 이동한 좌표
		StartNode_Boundary_Point = Oriented_Node_json[node_key[0]] - vector_u

		vector_v = np.array([Oriented_Node_json[node_key[-2]][0]-Oriented_Node_json[node_key[-1]][0], Oriented_Node_json[node_key[-2]][1]-Oriented_Node_json[node_key[-1]][1]])
		vector_v = vector_v / np.linalg.norm(vector_v)
		EndNode_Boundary_Point = Oriented_Node_json[node_key[-1]] - vector_v
		
		## Node 생성
		StartNode_Boundary_Point_Cord = {"X": StartNode_Boundary_Point[0], "Y": 0, "Z": StartNode_Boundary_Point[1]}
		EndNode_Boundary_Point_Cord = {"X": EndNode_Boundary_Point[0], "Y": 0, "Z": EndNode_Boundary_Point[1]}
		print('maxID', max_ID)
		StartNode_Boundary_Point_ID = max_ID*2 + 1
		EndNode_Boundary_Point_ID = max_ID*2 + 2
		Node_Assign_Json = {}
		Node_Assign_Json[StartNode_Boundary_Point_ID] = StartNode_Boundary_Point_Cord
		Node_Assign_Json[EndNode_Boundary_Point_ID] = EndNode_Boundary_Point_Cord
		assign_result = civil.db_create("NODE", Node_Assign_Json)

		## Boundary Condition 생성
		Bnd_Assign_Json = {}
		Bnd_Assign_Json[StartNode_Boundary_Point_ID] = {"ITEMS": [{"ID" : 1, "GROUP_NAME" : "", "CONSTRAINT" : "1111110"}]}
		Bnd_Assign_Json[EndNode_Boundary_Point_ID] = {"ITEMS": [{"ID" : 1, "GROUP_NAME" : "", "CONSTRAINT" : "1111110"}]}
		bnd_result = civil.db_create("CONS", Bnd_Assign_Json)
  
		## Kv 값 계산
		## startNode 에 연결된 요소에서 i 단인지 j 단이지 확인
		for key in element_json:
			if element_json[key]["NODE"][0] == int(startNode) or element_json[key]["NODE"][1] == int(startNode):
				
				if element_json[key]["NODE"][0] == int(startNode):
					Start_Section_ID = element_json[key]["SECT"]
					Start_Position = "I"
				else:
					Start_Section_ID = element_json[key]["SECT"]
					Start_Position = "J"
				break
		for key in element_json:
			if element_json[key]["NODE"][0] == int(endNode) or element_json[key]["NODE"][1] == int(endNode):
				if element_json[key]["NODE"][0] == int(endNode):
					End_Section_ID = element_json[key]["SECT"]
					End_Position = "I"
				else:
					End_Section_ID = element_json[key]["SECT"]
					End_Position = "J"
				break
		
		## Start Point 의 Section 가져옴
		Sect_Get_Json = civil.db_read_item("SECT", Start_Section_ID)
		if "error" in Sect_Get_Json:
			return json.dumps("No Section Data")
		if "SECT_J" in Sect_Get_Json[str(Start_Section_ID)]["SECT_BEFORE"]:
			SECT = "SECT_" + Start_Position
			Start_Section_Width = Sect_Get_Json[str(Start_Section_ID)]["SECT_BEFORE"][SECT]["vSIZE"][0]
		else:
			Start_Section_Width = Sect_Get_Json[str(Start_Section_ID)]["SECT_BEFORE"]["SECT_I"]["vSIZE"][0]
		K_Start = float(Modulus) / ((1+float(Poisson)) * R_Value) / Start_Section_Width * 1000
		## End Point 의 Section 가져옴
		Sect_Get_Json = civil.db_read_item("SECT", End_Section_ID)
		if "error" in Sect_Get_Json:
			return json.dumps("No Section Data")
		if "SECT_J" in Sect_Get_Json[str(End_Section_ID)]["SECT_BEFORE"]:
			SECT = "SECT_" + End_Position
			End_Section_Width = Sect_Get_Json[str(End_Section_ID)]["SECT_BEFORE"][SECT]["vSIZE"][0]
		else:
			End_Section_Width = Sect_Get_Json[str(End_Section_ID)]["SECT_BEFORE"]["SECT_I"]["vSIZE"][0]
		K_End = float(Modulus) / ((1+float(Poisson)) * R_Value) / End_Section_Width * 1000
  
		## Elastic Link 생성
		Elnk_Assign_json = {}
		start_Link_ID = ELink_ID
		end_Link_ID = ELink_ID + 1
		Elnk_Assign_json[start_Link_ID] = {"NODE": [startNode, StartNode_Boundary_Point_ID], "LINK" : "COMP", "ANGLE" : 0, "SDR" : [K_Start, 0, 0, 0, 0, 0], "bSHEAR" : False, "DR": [0.5, 0.5]}
		Elnk_Assign_json[end_Link_ID] = {"NODE": [endNode, EndNode_Boundary_Point_ID], "LINK" : "COMP", "ANGLE" : 0, "SDR" : [K_End, 0, 0, 0, 0, 0], "bSHEAR" : False, "DR": [0.5, 0.5]}
		elastic_result = civil.db_create("ELNK", Elnk_Assign_json)
	

	return json.dumps("success")

## 방향 벡터를 계산하고, 새로운 노드 좌표를 반환
def calculate_direction_vectors(Oriented_Node_json):
	node_keys = list(Oriented_Node_json.keys())
	new_node_coords = []

	for i, key in enumerate(node_keys):
		current_coord = np.array(Oriented_Node_json[key])
		
		# Handle the start node
		if i == 0:
			next_coord = np.array(Oriented_Node_json[node_keys[i+1]])
			vector_u = next_coord - current_coord
			vector_v = np.array([-vector_u[1], vector_u[0]])
		
		# Handle the end node
		elif i == len(node_keys) - 1:
			prev_coord = np.array(Oriented_Node_json[node_keys[i-1]])
			vector_u = prev_coord - current_coord
			vector_v = np.array([vector_u[1], -vector_u[0]])
		
		# Handle the intermediate nodes
		else:
			prev_coord = np.array(Oriented_Node_json[node_keys[i-1]])
			next_coord = np.array(Oriented_Node_json[node_keys[i+1]])
			vector_u = prev_coord - current_coord
			vector_v = next_coord - current_coord
			vector_w = (vector_u / np.linalg.norm(vector_u) + vector_v / np.linalg.norm(vector_v)) / 2
			vector_w = -vector_w / np.linalg.norm(vector_w)
			vector_v = vector_w

		vector_v = vector_v / np.linalg.norm(vector_v)
		new_coord = current_coord + vector_v
		new_node_coords.append(new_coord)
	
	return new_node_coords

## Civil 에 노드 생성 및 경계조건 생성
def assign_new_nodes(new_node_coords, max_ID, civil):
	Node_Assign_Json = {max_ID + i + 1: {"X": coord[0], "Y": 0, "Z": coord[1]} for i, coord in enumerate(new_node_coords)}
	assign_result = civil.db_create("NODE", Node_Assign_Json)

	Bnd_Assign_Json = {key: {"ITEMS": [{"ID": 1, "GROUP_NAME": "", "CONSTRAINT": "1111110"}]} for key in Node_Assign_Json.keys()}
	bnd_result = civil.db_create("CONS", Bnd_Assign_Json)

	return assign_result, bnd_result, Node_Assign_Json

def calculate_elastic_link_properties(Oriented_Node_json, Modulus, Poisson):
	points = list(Oriented_Node_json.values())
	Area = 0
	for i in range(len(points)):
		x1, y1 = points[i % len(points)]
		x2, y2 = points[(i + 1) % len(points)]
		Area += x1 * y2 - x2 * y1
	Area = abs(Area) / 2

	R_Value = math.sqrt(Area / math.pi)

	Ks_Values = []
	node_keys = list(Oriented_Node_json.keys())
	for i, key in enumerate(node_keys):
		if i == 0:
			Length = np.linalg.norm(np.array(Oriented_Node_json[node_keys[i+1]]) - np.array(Oriented_Node_json[key])) / 2
		elif i == len(node_keys) - 1:
			Length = np.linalg.norm(np.array(Oriented_Node_json[node_keys[i-1]]) - np.array(Oriented_Node_json[key])) / 2
		else:
			Length1 = np.linalg.norm(np.array(Oriented_Node_json[node_keys[i-1]]) - np.array(Oriented_Node_json[key])) / 2
			Length2 = np.linalg.norm(np.array(Oriented_Node_json[node_keys[i+1]]) - np.array(Oriented_Node_json[key])) / 2
			Length = (Length1 + Length2)
		
		Ks = float(Modulus) / ((1 + float(Poisson)) * R_Value) / Length * 1000
		Ks_Values.append(Ks)
	
	return Ks_Values, R_Value
  
def assign_elastic_links(Oriented_Node_json, Node_Assign_Json, Ks_Values, civil):
	node_keys = list(Oriented_Node_json.keys())
	new_node_keys = list(Node_Assign_Json.keys())
	Elnk_Assign_json = {
		i + 1: {
			"NODE": [node_keys[i], new_node_keys[i]],
			"LINK": "COMP",
			"ANGLE": 0,
			"SDR": [Ks, 0, 0, 0, 0, 0],
			"bSHEAR": False,
			"DR": [0.5, 0.5]
		}
		for i, Ks in enumerate(Ks_Values)
	}

	return civil.db_create("ELNK", Elnk_Assign_json)