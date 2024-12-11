'''
██████╗ ██╗   ██╗    ███╗   ███╗ █████╗ ██╗███╗   ██╗
██╔══██╗╚██╗ ██╔╝    ████╗ ████║██╔══██╗██║████╗  ██║
██████╔╝ ╚████╔╝     ██╔████╔██║███████║██║██╔██╗ ██║
██╔═══╝   ╚██╔╝      ██║╚██╔╝██║██╔══██║██║██║╚██╗██║
██║        ██║       ██║ ╚═╝ ██║██║  ██║██║██║ ╚████║
╚═╝        ╚═╝       ╚═╝     ╚═╝╚═╝  ╚═╝╚═╝╚═╝  ╚═══╝

@description This is a sample code for python script.
'''

# this is sample code for python script.
# if you want to use other python files, import here and functions export your javascript code.
import json
import math
from pyscript_engineers_web import set_g_values, get_g_values, requests_json
from pyscript_engineers_web import MidasAPI, Product
from decimal import Decimal
import numpy as np
import js

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


def py_db_get_maxid(item_name):
	civil = MidasAPI(Product.CIVIL, "KR")
	return json.dumps(civil.db_get_max_id(item_name))


# --------------------------------------------------------------------------------------------------------------------

# --------------------------------------------------------------------------------------------------------------------

def py_select_elem_list():
	civil = MidasAPI(Product.CIVIL)
	select = civil.view_select_get()
	if select == None:
		error_message = {"error" : "Cannot get selected elem list"}
		return json.dumps(error_message)
	nodes = select.get("ELEM_LIST")
	if nodes == None:
		error_message = {"error" : "Cannot get elem list"}
		return json.dumps(error_message)
	return json.dumps(nodes)

def post_tableload(payload):
	civil = MidasAPI(Product.CIVIL, "KR")
	# payload를 함수 인자로부터 받아서 처리
	response = civil.weightpost(payload)
	if not response or 'error' in response:
		return json.dumps({"error": "Failed to post table data"})
	return json.dumps(response)

# -----------------------

import json

def convert_weight(value, from_unit, to_unit='kN'):
	conversion_factors = {
		'kgf': 0.00980665,
		'tonf': 9.80665,
		'N': 0.001,
		'lbf': 0.00444822,
		'kips': 4.44822,
		'kN': 1
	}
	return value * conversion_factors[from_unit] / conversion_factors[to_unit]

def convert_length(value, from_unit, to_unit='m'):
	conversion_factors = {
		'mm': 0.001,
		'cm': 0.01,
		'in': 0.0254,
		'm': 1
	}
	return value * conversion_factors[from_unit] / conversion_factors[to_unit]

def transform_data(element_id, top, bottom, extWall, intStr):
	# 데이터베이스에서 필요한 데이터 가져오기
	elem_data_str = py_db_read("ELEM")
	node_data_str = py_db_read("NODE")
	sect_data_str = py_db_read("SECT")

	# 문자열을 파이썬 딕셔너리로 변환
	elem_data = json.loads(elem_data_str)
	node_data = json.loads(node_data_str)
	sect_data = json.loads(sect_data_str)

	# 엘리먼트 매핑 초기화
	element_mapping = {
		'top': top.split(','),
		'bottom': bottom.split(','),
		'extWall': extWall.split(','),
		'intStr': intStr.split(',')
	}

	# 필요한 엘리먼트 ID 리스트를 문자열로 변환
	all_elements = set()
	for key in element_mapping:
		all_elements.update(filter(None, (x.strip() for x in element_mapping[key])))

	# 엘리먼트 ID 리스트를 쉼표로 구분된 문자열로 변환
	elements_str = ",".join(sorted(all_elements))

	# payload 설정
	payload = {
		"Argument": {
			"TABLE_NAME": "ELEMNENTTABLE",
			"TABLE_TYPE": "ELEMENTWEIGHT",
			"NODE_ELEMS": {"TO": elements_str}
		}
	}

	# API를 호출하여 데이터 가져오기
	table_data_str = post_tableload(payload)
	try:
		table_data = json.loads(table_data_str)
	except json.JSONDecodeError:

		table_data = {}

	# 단위 확인 및 변환 필요 여부 결정
	force_unit = table_data['ELEMNENTTABLE'].get('FORCE', 'kN')
	dist_unit = table_data['ELEMNENTTABLE'].get('DIST', 'm')
	# print(force_unit,dist_unit )
	need_conversion = force_unit != 'kN' or dist_unit != 'm'

	# 요소 정보 변환
	transformed_data = {
		'ele_top_slb': {},
		'ele_bot_slb': {},
		'ele_outsid_wall': {},
		'ele_insid_wall': {}
	}

	weight_map = {}
	if 'ELEMNENTTABLE' in table_data and 'DATA' in table_data['ELEMNENTTABLE']:
		for row in table_data['ELEMNENTTABLE']['DATA']:
			elem_id = row[1]  # 엘리먼트 번호는 두 번째 열
			weight = float(row[-1])  # 총 무게는 마지막 열
			if need_conversion:
				weight = convert_weight(weight, force_unit)
			weight_map[elem_id] = weight

	for elem_id in all_elements:
		elem_id_str = str(elem_id)
		elem = elem_data.get(elem_id_str, {})
		start_node_id = elem.get('NODE', [None, None])[0]
		end_node_id = elem.get('NODE', [None, None])[1]
		
		start_node = node_data.get(str(start_node_id), {})
		end_node = node_data.get(str(end_node_id), {})
		
		sect_id = str(elem.get('SECT', ''))
		section = sect_data.get(sect_id, {})
		sect_name = section.get('SECT_NAME', '')
		thickness = section.get('SECT_BEFORE', {}).get('SECT_I', {}).get('vSIZE', [0])[0]
		
		if need_conversion:
			start_node = {k: convert_length(v, dist_unit) for k, v in start_node.items() if k in ['X', 'Y', 'Z']}
			end_node = {k: convert_length(v, dist_unit) for k, v in end_node.items() if k in ['X', 'Y', 'Z']}
			thickness = convert_length(thickness, dist_unit)
		else:
			start_node = {k: v for k, v in start_node.items() if k in ['X', 'Y', 'Z']}
			end_node = {k: v for k, v in end_node.items() if k in ['X', 'Y', 'Z']}
	
		weight = weight_map.get(elem_id, 0)
		
		element_info = {
			'start_node': {'x': start_node.get('X', 0), 'y': start_node.get('Y', 0), 'z': start_node.get('Z', 0)},
			'end_node': {'x': end_node.get('X', 0), 'y': end_node.get('Y', 0), 'z': end_node.get('Z', 0)},
			'weight': weight,
			'thickness': thickness
		}
		
		if elem_id in element_mapping['top']:
			transformed_data['ele_top_slb'][elem_id] = element_info
		elif elem_id in element_mapping['bottom']:
			transformed_data['ele_bot_slb'][elem_id] = element_info
		elif elem_id in element_mapping['extWall']:
			transformed_data['ele_outsid_wall'][elem_id] = element_info
		elif elem_id in element_mapping['intStr']:
			transformed_data['ele_insid_wall'][elem_id] = element_info

	# print(transformed_data)
	return json.dumps(transformed_data)

import json
import numpy as np

def defaulttransform_data():
	try:
		# 데이터베이스에서 필요한 데이터 가져오기
		elem_data_str = py_db_read("ELEM")
		node_data_str = py_db_read("NODE")
		sect_data_str = py_db_read("SECT")

		# 문자열을 파이썬 딕셔너리로 변환
		elem_data = json.loads(elem_data_str)
		node_data = json.loads(node_data_str)
		sect_data = json.loads(sect_data_str)

		# 엘리먼트 ID 리스트를 쉼표로 구분된 문자열로 변환
		if isinstance(elem_data, dict):
			elements_list = list(elem_data.keys())
		elif isinstance(elem_data, str):
			elements_list = elem_data.split(',')
		else:
			elements_list = list(map(str, elem_data))

		elements_str = ",".join(elements_list)


		# payload 설정
		payload = {
			"Argument": {
				"TABLE_NAME": "ELEMNENTTABLE",
				"TABLE_TYPE": "ELEMENTWEIGHT",
				"NODE_ELEMS": {"TO": elements_str}
			}
		}

		# API를 호출하여 데이터 가져오기
		table_data_str = post_tableload(payload)
		try:
			table_data = json.loads(table_data_str)
		except json.JSONDecodeError:
			print(f"JSON 디코딩 오류: {table_data_str}")
			table_data = {}

		# 단위 확인 및 변환 필요 여부 결정
		force_unit = table_data['ELEMNENTTABLE'].get('FORCE', 'kN')
		dist_unit = table_data['ELEMNENTTABLE'].get('DIST', 'm')
		need_conversion = force_unit != 'kN' or dist_unit != 'm'

		# 요소 정보 변환
		transformed_data = {
			'ele_top_slb': {},
			'ele_bot_slb': {},
			'ele_outsid_wall': {},
			'ele_insid_wall': {}
		}

		weight_map = {}
		if 'ELEMNENTTABLE' in table_data and 'DATA' in table_data['ELEMNENTTABLE']:
			for row in table_data['ELEMNENTTABLE']['DATA']:
				elem_id = row[1]  # 엘리먼트 번호는 두 번째 열
				weight = float(row[-1])  # 총 무게는 마지막 열
				if need_conversion:
					weight = convert_weight(weight, force_unit)
				weight_map[elem_id] = weight

		# 모든 요소의 z 좌표와 x 좌표 추출
		z_coords = []
		x_coords = []
		for elem_id in elements_str.split(','):
			elem = elem_data.get(elem_id, {})
			start_node_id = elem.get('NODE', [None, None])[0]
			end_node_id = elem.get('NODE', [None, None])[1]
			
			start_node = node_data.get(str(start_node_id), {})
			end_node = node_data.get(str(end_node_id), {})
			
			z_coords.extend([start_node.get('Z', 0), end_node.get('Z', 0)])
			x_coords.extend([start_node.get('X', 0), end_node.get('X', 0)])
		

		z_max = max(z_coords)
		z_min = min(z_coords)
		marginerange = 0.01

		# ele_top_slb 요소들을 먼저 식별
		ele_top_slb = {}
		for elem_id in elements_str.split(','):
			elem = elem_data.get(elem_id, {})
			start_node_id = elem.get('NODE', [None, None])[0]
			end_node_id = elem.get('NODE', [None, None])[1]
			
			start_node = node_data.get(str(start_node_id), {})
			end_node = node_data.get(str(end_node_id), {})
			
			if np.isclose(start_node.get('Z', 0), z_max, rtol=marginerange) and np.isclose(end_node.get('Z', 0), z_max, rtol=marginerange):
				ele_top_slb[elem_id] = {
					'start_node': start_node,
					'end_node': end_node
				}

		# ele_top_slb의 x 좌표 범위 계산
		top_slb_x_coords = []
		for elem in ele_top_slb.values():
			top_slb_x_coords.extend([elem['start_node'].get('X', 0), elem['end_node'].get('X', 0)])

		x_min_top_slb = min(top_slb_x_coords)
		x_max_top_slb = max(top_slb_x_coords)

		for elem_id in elements_str.split(','):
			elem = elem_data.get(elem_id, {})
			start_node_id = elem.get('NODE', [None, None])[0]
			end_node_id = elem.get('NODE', [None, None])[1]
			
			start_node = node_data.get(str(start_node_id), {})
			end_node = node_data.get(str(end_node_id), {})
			
			sect_id = str(elem.get('SECT', ''))
			section = sect_data.get(sect_id, {})
			thickness = section.get('SECT_BEFORE', {}).get('SECT_I', {}).get('vSIZE', [0])[0]
			
			if need_conversion:
				start_node = {k: convert_length(v, dist_unit) for k, v in start_node.items() if k in ['X', 'Y', 'Z']}
				end_node = {k: convert_length(v, dist_unit) for k, v in end_node.items() if k in ['X', 'Y', 'Z']}
				thickness = convert_length(thickness, dist_unit)
			else:
				start_node = {k: v for k, v in start_node.items() if k in ['X', 'Y', 'Z']}
				end_node = {k: v for k, v in end_node.items() if k in ['X', 'Y', 'Z']}
		
			weight = weight_map.get(elem_id, 0)
			
			element_info = {
				'start_node': {'x': start_node.get('X', 0), 'y': start_node.get('Y', 0), 'z': start_node.get('Z', 0)},
				'end_node': {'x': end_node.get('X', 0), 'y': end_node.get('Y', 0), 'z': end_node.get('Z', 0)},
				'weight': weight,
				'thickness': thickness
			}


			# 분류 로직
			if np.isclose(start_node['Z'], z_max, rtol=marginerange) and np.isclose(end_node['Z'], z_max, rtol=marginerange):
				transformed_data['ele_top_slb'][elem_id] = element_info
			elif np.isclose(start_node['Z'], z_min, rtol=marginerange) and np.isclose(end_node['Z'], z_min, rtol=marginerange):
				transformed_data['ele_bot_slb'][elem_id] = element_info
			elif np.isclose(start_node['X'], x_min_top_slb, rtol=marginerange) and np.isclose(end_node['X'], x_min_top_slb, rtol=marginerange):
				transformed_data['ele_outsid_wall'][elem_id] = element_info
			elif np.isclose(start_node['X'], x_max_top_slb, rtol=marginerange) and np.isclose(end_node['X'], x_max_top_slb, rtol=marginerange):
				transformed_data['ele_outsid_wall'][elem_id] = element_info
			else:
				transformed_data['ele_insid_wall'][elem_id] = element_info
	except Exception as e:
		# print(f"Error occurred: {e}. Processing without top slab.")
		# 상부 슬래브가 없는 경우의 처리
		transformed_data = {
			'ele_top_slb': {},
			'ele_bot_slb': {},
			'ele_outsid_wall': {},
			'ele_insid_wall': {}
		}

		z_coords = []
		x_coords = []
		for elem_id in elements_str.split(','):
			elem = elem_data.get(elem_id, {})
			start_node_id = elem.get('NODE', [None, None])[0]
			end_node_id = elem.get('NODE', [None, None])[1]
			
			start_node = node_data.get(str(start_node_id), {})
			end_node = node_data.get(str(end_node_id), {})
			
			z_coords.extend([start_node.get('Z', 0), end_node.get('Z', 0)])
			x_coords.extend([start_node.get('X', 0), end_node.get('X', 0)])

		z_min = min(z_coords)
		x_min = min(x_coords)
		x_max = max(x_coords)
		marginerange = 0.01

		for elem_id in elements_str.split(','):
			elem = elem_data.get(elem_id, {})
			start_node_id = elem.get('NODE', [None, None])[0]
			end_node_id = elem.get('NODE', [None, None])[1]
			
			start_node = node_data.get(str(start_node_id), {})
			end_node = node_data.get(str(end_node_id), {})
			
			sect_id = str(elem.get('SECT', ''))
			section = sect_data.get(sect_id, {})
			thickness = section.get('SECT_BEFORE', {}).get('SECT_I', {}).get('vSIZE', [0])[0]
			
			if need_conversion:
				start_node = {k: convert_length(v, dist_unit) for k, v in start_node.items() if k in ['X', 'Y', 'Z']}
				end_node = {k: convert_length(v, dist_unit) for k, v in end_node.items() if k in ['X', 'Y', 'Z']}
				thickness = convert_length(thickness, dist_unit)
			else:
				start_node = {k: v for k, v in start_node.items() if k in ['X', 'Y', 'Z']}
				end_node = {k: v for k, v in end_node.items() if k in ['X', 'Y', 'Z']}
		
			weight = weight_map.get(elem_id, 0)
			
			element_info = {
				'start_node': {'x': start_node.get('X', 0), 'y': start_node.get('Y', 0), 'z': start_node.get('Z', 0)},
				'end_node': {'x': end_node.get('X', 0), 'y': end_node.get('Y', 0), 'z': end_node.get('Z', 0)},
				'weight': weight,
				'thickness': thickness
			}

			if np.isclose(start_node['Z'], z_min, rtol=marginerange) and np.isclose(end_node['Z'], z_min, rtol=marginerange):
				transformed_data['ele_bot_slb'][elem_id] = element_info
			elif np.isclose(start_node['X'], x_min, rtol=marginerange) or np.isclose(end_node['X'], x_min, rtol=marginerange) or \
				np.isclose(start_node['X'], x_max, rtol=marginerange) or np.isclose(end_node['X'], x_max, rtol=marginerange):
				transformed_data['ele_outsid_wall'][elem_id] = element_info
			else:
				transformed_data['ele_insid_wall'][elem_id] = element_info



	return json.dumps(transformed_data)