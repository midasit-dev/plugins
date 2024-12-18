import json
from ReportUtil import *

def GenerateMDReport():
  result_json = {"Test" : "11", "Test2" : {"Test3" : "22", "Test4" : "33"}}
  print('test')
  Test11 = find_data(result_json, "Test")

  RptUtil = CReportUtil("test.md", f"*Test 문구 : { Test11 }*")

  RptUtil.add_chapter("Test Chapter")
  RptUtil.add_paragraph("Test Paragraph")
  RptUtil.add_line(f"Test Line : { Test11 }")
  RptUtil.add_line("")
  
  RptUtil.add_chapter("Test Chapter2")
  
  return RptUtil.get_md_text()
