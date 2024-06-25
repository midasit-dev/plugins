### do not delete this import scripts ###
import json
from py_base import set_g_values, get_g_values, requests_json, MidasAPI, Product
from py_base_sub import HelloWorld, ApiGet
### do not delete this import scripts ###

def post(id, x, y, z):
	civil = MidasAPI(Product.CIVIL, "KR")
	response = civil.db_create_item("NODE", id, {
		"X", float(x),
		"Y", float(y),
		"Z", float(z),
	})
	return json.dump(response)

def pust(id, x, y, z):
	civil = MidasAPI(Product.CIVIL, "KR")
	response = civil.db_update_item("NODE", id, {
		"X", float(x),
		"Y", float(y),
		"Z", float(z),
	})
	return json.dump(response)

def get(id, x, y, z):
	civil = MidasAPI(Product.CIVIL, "KR")
	response = civil.db_read("NODE")
	return json.dump(response)

def delete(id):
	civil = MidasAPI(Product.CIVIL, "KR")
	response = civil.db_delete("NODE", id)
	return json.dump(response)

def py_AutoSave():
	civil = MidasAPI(Product.CIVIL, "KR")
	response = civil.db_save()
	return json.dumps(response)

def main():
	print('write here ...')