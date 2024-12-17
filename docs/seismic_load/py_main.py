### do not delete this import scripts ###
import json
from py_base import set_g_values, get_g_values, requests_json, MidasAPI, Product
from py_base_sub import HelloWorld, ApiGet
from MDReport import GenerateMDReport
### public 안의 base 폴더 안의 MDReport.py import 함.
### do not delete this import scripts ###

def GenerateReport():
  result = GenerateMDReport()
  
  return json.dumps(result)