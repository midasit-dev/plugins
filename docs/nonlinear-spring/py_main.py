### do not delete this import scripts ###
import json
from py_base import set_g_values, get_g_values, requests_json, MidasAPI, Product
from py_base_sub import HelloWorld, ApiGet
from py_pycurve import create_pycurve
### do not delete this import scripts ###

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

def py_get_GRUP_list():
	civil = MidasAPI(Product.CIVIL, "KR")
	response = civil.db_read("GRUP")
	if "error" in response:
		return json.dumps(response)
	else:
		GroupList = {}
		for key in response:
			if 'E_LIST' in response[key]:
				GroupList[response[key]['NAME']] = response[key]['E_LIST']
			else:
				GroupList[response[key]['NAME']] = []
	
	return json.dumps(GroupList)

def py_get_ELEM_list(E_LIST):
	civil = MidasAPI(Product.CIVIL, "KR")
	## E_LIST = [[], [1,2,3], [3,4,5]]
	## E_LIST 에서 번호를 추출하여 ElementList 에 저장
	ElementList = []
	for E in E_LIST:
		for e in E:
			ElementList.append(e)
	ElementList = list(set(ElementList))
	ElementID = ','.join(map(str, ElementList))
	response = civil.db_read_item("ELEM",ElementID)
	if "error" in response:
		return json.dumps(response)
	else:
		## ElemetList = [{'NODE' : [1,2,3,4]}, {'NODE' : [5,6,7,8]}]
		ElementList = []
		TotalNode = []
		for STGroup in range(len(E_LIST)):
			NodeList = []
			for Element in E_LIST[STGroup]:
				NodeList.append(response[str(Element)]['NODE'][0])
				NodeList.append(response[str(Element)]['NODE'][1])
				TotalNode.append(response[str(Element)]['NODE'][0])
				TotalNode.append(response[str(Element)]['NODE'][1])
			NodeList = list(set(NodeList))
			ElementList.append({'NODE' : NodeList})
		TotalNode = list(set(TotalNode))
  
		## Node 정보 추출
		NodeID = ','.join(map(str, TotalNode))
		response = civil.db_read_item("NODE",NodeID)
		if "error" in response:
			return json.dumps(response)
		else:
			for i in range(len(ElementList)):
				CORD_Array = []
				for j in range(len(ElementList[i]['NODE'])):
					CORD_Array.append([response[str(ElementList[i]['NODE'][j])]['X'],response[str(ElementList[i]['NODE'][j])]['Z']])
				ElementList[i]['CORD'] = CORD_Array
	return json.dumps(ElementList)


def py_pycurve(BH_TableRows, LayerData, ElementStructList):
	result = create_pycurve((BH_TableRows), (LayerData), (ElementStructList))
	result = json.loads(result)
	civil = MidasAPI(Product.CIVIL, "KR")
	response = civil.db_get_max_id("MLFC")
	max_id = response + 1	
	Assign_MFLC_JSON = {}
	Assign_NSPR_JSON = {}
	for i in range(len(result)):
		data = result[i]
		item_array = []
		x_values = data['X']
		y_values = data['Y']
		for i in range(len(x_values)):
			item_array.append({
				"X" : x_values[i],
				"Y" : y_values[i]
			})

		Assign_MFLC_JSON[max_id] = {
			"NAME" : str("PY_" + str(data['NODE'])),
			"TYPE" : "FORCE",
			"SYMM" : False,
			"FUNC_ID" : 0,
			"ITEMS" : item_array
		}
		max_id = max_id + 1

	max_id = response + 1
	for i in range(len(result)):
		data = result[i]
		Assign_NSPR_JSON[data['NODE']] = {
			"ITEMS" : [
				{
					"ID" : 1,
					"TYPE" : "MULTI",
					"FormType" : 0,
					"EFFAREA" : 0,
					"DK" : [
						0,0,0
					],
					"DIR" : 0,
					"DV" : [
						0,0,0
					],
					"FUNCTION" : max_id
				}
			]
		}
		max_id = max_id + 1
	response = civil.db_create("MLFC", (Assign_MFLC_JSON))
	response_NSPR = civil.db_create("NSPR", (Assign_NSPR_JSON))
	print('response : ', response)
	print('response_NSPR : ', response_NSPR)
	return json.dumps(response)