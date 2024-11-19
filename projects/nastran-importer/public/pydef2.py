from pyscript import Element
from js import XMLHttpRequest
import json
from pyNastran.bdf.bdf import BDF
import os
# 주소창에 있는 End point와 MAPI-Key를 가져오기 위한 함수
from py_base import get_g_values

targetnode = '/db/node'
targetelem = '/db/elem'

def getHeaders(mapiKey):
    return {
        'MAPI-Key': mapiKey,
        'Content-Type': 'application/json'
    }

def getBody(id, x, y, z):
    return {
        "Assign": {
          id: { "X": x, "Y": y, "Z": z }
        }
    }    

def post(url, headers, jsonObj):
    xhr = XMLHttpRequest.new()
    xhr.open("POST", url, False)
    for key, value in headers.items():
        xhr.setRequestHeader(key, value)
    xhr.send(json.dumps(jsonObj))
    json.loads(xhr.responseText)

def post_nodes(url,mapkey,dic):
    headers=getHeaders(mapkey)
    js_dic = {'Assign': {nid:{'X':loc[0],'Y':loc[1],'Z':loc[2]} for nid,loc in dic.items()}}
    xhr = XMLHttpRequest.new()
    xhr.open("POST", url, False)
    for key, value in headers.items():
        xhr.setRequestHeader(key, value)
    xhr.send(json.dumps(js_dic))
    return json.loads(xhr.responseText)

def read_nastran(bdf_file):
    model = BDF()
    model.read_bdf(bdf_file)
    os.remove(bdf_file)
    return model
 
def import_nodes(model):
    node_dic = {nid:node.xyz for nid,node in sorted(model.nodes.items())}		    
    url = 'https://' + json.loads(get_g_values())["g_base_uri"] + '/civil' + targetnode
    mapiKey = json.loads(get_g_values())["g_mapi_key"]
    post_nodes(url, mapiKey, node_dic)
    return len(model.nodes)

def post_elems(url,mapkey,dic):
    headers=getHeaders(mapkey)
    js_dic = {'Assign': dic}
    xhr = XMLHttpRequest.new()
    xhr.open("POST", url, False)
    for key, value in headers.items():
        xhr.setRequestHeader(key, value)
    xhr.send(json.dumps(js_dic))
    return json.loads(xhr.responseText)

def import_elements(model):
    url = 'https://' + json.loads(get_g_values())["g_base_uri"] + '/civil' + targetelem
    mapiKey = json.loads(get_g_values())["g_mapi_key"]

    elem_dic = dict()
    counter = 0
    for eid,element in sorted(model.elements.items()):
        nids=[0,0,0,0,0,0,0,0]
        counter+=1
        if element.type == 'CBAR':
            nids[0:2]=element.nodes[0:2]
            elem_dic[eid]={'TYPE':'BEAM','SECT':1,'MATL':1,'ANGLE':0,'STYPE':0,'NODE':nids}
        elif element.type == 'CQUAD4':
            nids[0:4]=element.nodes[0:4]
            elem_dic[eid]={'TYPE':'PLATE','SECT':1,'MATL':1,'ANGLE':0,'STYPE':1,'NODE':nids}
        elif element.type == 'CQUAD8':
            nids[0:4]=element.nodes[0:4]
            elem_dic[eid]={'TYPE':'PLATE','SECT':1,'MATL':1,'ANGLE':0,'STYPE':1,'NODE':nids}
        elif element.type == 'CTRIA3':
            nids[0:3]=element.nodes[0:3]
            elem_dic[eid]={'TYPE':'PLATE','SECT':1,'MATL':1,'ANGLE':0,'STYPE':1,'NODE':nids}
        elif element.type == 'CTRIA6':
            nids[0:3]=element.nodes[0:3]
            elem_dic[eid]={'TYPE':'PLATE','SECT':1,'MATL':1,'ANGLE':0,'STYPE':1,'NODE':nids}
        elif element.type == 'CHEXA':
            nids[0:8]=element.nodes[0:8]
            elem_dic[eid]={'TYPE':'SOLID','SECT':0,'MATL':1,'NODE':nids}
        elif element.type == 'CTETRA':
            nids[0:4]=element.nodes[0:4]
            elem_dic[eid]={'TYPE':'SOLID','SECT':0,'MATL':1,'NODE':nids}
        elif element.type == 'CPENTA':
            nids[0:6]=element.nodes[0:6]
            elem_dic[eid]={'TYPE':'SOLID','SECT':0,'MATL':1,'NODE':nids}   
        if(counter%10011==0):
            res=post_elems(url, mapiKey, elem_dic)
            elem_dic=dict() 
    res=post_elems(url, mapiKey, elem_dic)
    return len(model.elements)


def process_file_content(file_content, file_name):
    Element("step-start").element.innerText = f'Start Processing... {file_name}'

    # 파일 내용을 처리하는 코드
    f = open('testfile.txt', 'w')
    f.write(file_content)
    f.close()
    model = read_nastran('testfile.txt')
    Element("step-convert").element.innerText = 'Copyright (c) 2011-2024 Steven Doyle. All rights reserved.'
    n=import_nodes(model)
    m=import_elements(model)
    Element("step-send-to-civil").element.innerText = 'Civil NX Updated...'

    #print(file_content)  # PyScript 콘솔에 출력
    Element("fileContent").element.innerText = f"Nodes:{n} Elements:{m}"  # 화면에 출력
    Element("step-end").element.innerText = 'Process Completed!'
