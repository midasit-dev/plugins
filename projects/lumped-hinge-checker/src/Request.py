import requests

from dataclasses import dataclass

class IehpInfo: 
    name: str = None
    desc: str = None
    loc:  str = None
    val:  float = None


# header를 만들어주는 함수
def getHeaders(mapiKey):
  return {
    'MAPI-Key': mapiKey
  }

  # body를 만들어주는 함수
def getBody(id, x, y, z):
  return {
		"Assign": {
			id: { "X": x, "Y": y, "Z": z }
		}
	}

# response를 처리해주는 함수 (에러 처리 포함)
def responseHandler(response):
	if response.ok == False:
		print(f'Error: {response.status_code} / {response.text}')
		return {}
	else: 
		return response.json()

# 각 method별 함수들
  
def get(url, mapiKey):
  response = requests.get(
    url=url,
    headers=getHeaders(mapiKey)
  )
  
  return responseHandler(response)

def getData(data):
  dbname = 'IEHP'

  alist = []
  for key in data[dbname]:
    curdata = data[dbname][key]
    iehp_data = IehpInfo()

    iehp_data.name = curdata["NAME"]
    iehp_data.desc = curdata["DESC"]
    iehp_data.loc  = curdata["LOCATION"]
    #iehp_data.val  = curdata["???"]

    prop_size = len(curdata["ALL_PROP"])

    #for PropD in curdata["ALL_PROP"]:
    #  curKINEMA = PropD["KINEMA"]     
    
    alist.append(iehp_data)

  # val 를 기준으로 정렬
  sorted_data = sorted(alist, key=lambda IehpInfo: IehpInfo.val)

  return alist
     
