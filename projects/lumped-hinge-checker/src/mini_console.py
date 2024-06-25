from dataclasses import dataclass

# 이전에 정의했던 함수를 import 합니다.
from Request import *

# 종료를 위한 시스템 함수를 import 합니다.
import sys


#class Product: 
#    name: str = None
#    desc: str = None
#    loc:  str = None
#    val:  float = None

# API 요청을 위한 기본 정보들을 정의 합니다.
endpoint = 'https://moa-engineers.midasit.com/civil'
dbname = 'IEHP'
target = '/db/' + dbname
url = endpoint + target
# Civil NX로부터 얻어온 API Key를 미리 입력 해줍니다.
mapiKey = 'eyJ1ciI6Imdvc3Jhazc2IiwicGciOiJjaXZpbCIsImNuIjoiWldnSElzS05UUSJ9.f5f88ed1925a61b9fa39a6adf02829ba6818f472ba744fb11b56760f19c1356d'

def main():

  data = get(url=url, mapiKey=mapiKey)

  # bb = len(data[dbname])

  alist = getData(data)


  aa = 1


main()