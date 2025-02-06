### do not delete this import scripts ###
import json
from py_base import set_g_values, get_g_values, requests_json, MidasAPI, Product
from py_api_db import * ## get all function
import copy
### do not delete this import scripts ###

HINGE_TYPE = {
  1: "DIST",
  2: "TRUSS",
  3: "SPR"
}

ALL_Histroy_PND = {
  "KIN": 3,
  "ORG": 3,
  "PKO": 3,
  "CLO": 2,
  "DEG": 3,
  "TAK": 3,
  "TTE": 4,
  "TAKS": 3,
  'MTK': 3,
  'MTT': 4,
  'NBI': 2,
  'EBI': 2,
  'ETR': 3,
  'ETE': 4,
  'SLBI': 2,
  'SLTR': 3,
  'SLBT': 2,
  'SLTT': 3,
  'SLBC': 2,
  'SLTC': 3,
}

ALL_History_Prop_Name = {
  'KIN': "KINEMA",
  'ORG': "ORIGIN",
  'PKO': "PEAK",
  'CLO': "CLOUGH",
  'DEG': "DEGRAD",
  'TAK': "TAKEDA",
  'TTE': "TAKEDA",
  'TAKS': "TAKEDA",
  'MTK': "TAKEDA",
  'MTT': "TAKTET",
  'NBI': "NORBIL",
  'EBI': "ELABIL",
  'ETR': "ELATRI",
  'ETE': "ELATET",
  'SLBI': "SLIP",
  'SLBT': "SLIP",
  'SLBC': "SLIP",
  'SLTR': "SLIP",
  'SLTT': "SLIP",
  'SLTC': "SLIP",
  'MLEL': "MULTLIN",
  'MLPK': "MULTLIN",
  'MLPT': "MULTLIN",
  'MLPP': "MULTLIN",
}

originIEHP = {}
class IEHP :
  def __init__(self, name) ->None:
    self.name = name

  def getDataIEHP(self, ElementValue, ComponentValue):
    result = py_db_read(self.name)
    global originIEHP
    originIEHP = json.loads(result)

    tableList = {}
    for key in originIEHP.keys():
      tableData =  self.setTableList(ElementValue, ComponentValue, key, originIEHP[key])
      if tableData :
        for tableType, data in tableData.items():
          if tableList.get(tableType):
            tableList[tableType].append(data)
          else :
            tableList[tableType] = [data]

    return json.dumps(tableList)

  def setTableList(self, ElementValue, ComponentValue, key, rawData):
    hingeType = HINGE_TYPE[ElementValue]

    if rawData.get("DEFINITION") != "SKEL": return {}
    if rawData.get("HINGE_TYPE") != hingeType: return {}
    if rawData.get("INTERACTION_TYPE") != "NONE": return {}
    if not rawData.get("COMPONENT_DIR")[ComponentValue] : return {}

    dataObject = rawData.get("ALL_PROP")[ComponentValue]
    NAME = list(dataObject.keys())[0]
    historyModel = rawData.get("HYSTERESIS_MODEL")[ComponentValue]
    
    setData = {
    "KEY": key,
    "NAME": rawData.get("NAME"),
    "MATERIAL_TYPE":  "S" if rawData.get("MATERIAL_TYPE") == "STEEL" else "RC",
    "HISTORY_MODEL": historyModel,
    }
    if NAME == "MULTLIN" : 
      setData["DATA"] = self.setMULTLINData(dataObject.get(NAME), rawData.get("MULT_DATA"))
      return { "3": setData }

    else :
      if dataObject.get(NAME).get("YIELDSTRENGTHOPT") != 0 : return {}

      tableType = dataObject.get(NAME).get("PALPHADELTA")
      setData["DATA"] = self.setOtherAllData(
        dataObject.get(NAME),
        historyModel,
        tableType,
        ComponentValue
        )
    
      if tableType == 0:
        return { "2": setData }
      else :
        return { "1": setData }

  def setMULTLINData(self, data, multData):
    multi_data = []

    if multData:
      for mul in multData:
        multi_data.append([mul.get("FORCE"), mul.get("DISP")])
    else :
      multi_data.append([0.0, 0.0])

    nType = data.get("nType")
    if nType != 1 and nType != 2:
      nType = 0
    
    return {
      "nType": nType,
      "dHysParam_Alpha1": data.get("dHysParam_Alpha1"),
      "dHysParam_Alpha2": data.get("dHysParam_Alpha2"),
      "dHysParam_Beta1": data.get("dHysParam_Beta1"),
      "dHysParam_Beta2": data.get("dHysParam_Beta2"),
      "dHysParam_Eta": data.get("dHysParam_Eta"),
      "PnD_Data": multi_data,
    }

  def setOtherAllData(self, data, historyModel, tableType, ComponentValue):
    pndData = data.get("COMPONENTPROPS")
    dataType = ALL_Histroy_PND[historyModel]
    pData = []
    dData = []
    aData = []
    # Force, Disp
    if ComponentValue < 3:
      if pndData.get("CRACKFORCE") and dataType != 2 : pData.append(pndData.get("CRACKFORCE"))
      if pndData.get("YIELDFORCE") : pData.append(pndData.get("YIELDFORCE"))
      if pndData.get("ULTIMATEFORCE") : pData.append(pndData.get("ULTIMATEFORCE"))
      if pndData.get("FRACTUREFORCE") : pData.append(pndData.get("FRACTUREFORCE"))
      
      if pndData.get("YIELDDISP1ST") and dataType != 2 : dData.append(pndData.get("YIELDDISP1ST"))
      if pndData.get("YIELDDISP2ND") : dData.append(pndData.get("YIELDDISP2ND"))
      if pndData.get("YIELDDISP3RD") : dData.append(pndData.get("YIELDDISP3RD"))
      if pndData.get("YIELDDISP4TH") : dData.append(pndData.get("YIELDDISP4TH"))
    # Moment, Rotn
    else :
      if pndData.get("CRACKMOMENT") and dataType != 2 : pData.append(pndData.get("CRACKMOMENT"))
      if pndData.get("YIELDMOMENT") : pData.append(pndData.get("YIELDMOMENT"))
      if pndData.get("ULTIMATEMOMENT") : pData.append(pndData.get("ULTIMATEMOMENT"))
      if pndData.get("FRACTUREMOMENT") : pData.append(pndData.get("FRACTUREMOMENT"))
      
      if pndData.get("YIELDROTN1ST") and dataType != 2 : dData.append(pndData.get("YIELDROTN1ST"))
      if pndData.get("YIELDROTN2ND") : dData.append(pndData.get("YIELDROTN2ND"))
      if pndData.get("YIELDROTN3RD") : dData.append(pndData.get("YIELDROTN3RD"))
      if pndData.get("YIELDROTN4TH") : dData.append(pndData.get("YIELDROTN4TH"))

    # stiff
    if pndData.get("STIFFRATIO1ST") and dataType != 2 : aData.append(pndData.get("STIFFRATIO1ST"))
    if pndData.get("STIFFRATIO2ND") : aData.append(pndData.get("STIFFRATIO2ND"))
    if pndData.get("STIFFRATIO3RD") : aData.append(pndData.get("STIFFRATIO3RD"))
    if pndData.get("STIFFRATIO4TH") : aData.append(pndData.get("STIFFRATIO4TH"))

    return {
      'SYMMETRIC': data.get("SYMMETRIC"),
      'INITSTIFFNESS': data.get("INITSTIFFNESS"),
      'BETA': data.get("UNLOADSTIFFCALCEXPO"),
      'ALPA': data.get("UNLOADSTIFFREDUFAC"),
      'GAMMA': data.get("PINCHINGRULEFAC"),
      'INIT_GAP': [data.get("INITGAPPOSITIVE"), data.get("INITGAPNEGATIVE")],
      'P_DATA': pData,
      'D_DATA': dData,
      'A_DATA': aData,
      'PND': dataType if tableType == 1 else dataType - 1
    }

  def UpdateIEHP(self, ElementValue, Component, obj):
    global originIEHP
    originArr = list(originIEHP.keys())
    changeObj = json.loads(obj)
    bAddKey = False
    for key in originArr :
      [selectData, addData] = self.FindTableList(key, changeObj, bAddKey)
      if addData.get("value") : bAddKey = True
      if selectData.get("value"):
        # update..
          originIEHP[selectData.get("targetKey")] = self.UpdateData(ElementValue, Component, selectData.get("tableType"), selectData.get("value"))

      if bAddKey and addData.get("value"):
        # add..
        nNextNum = int(originArr[-1]) + 1
        for idx, (tableType, value) in enumerate(zip(addData.get("tableType"), addData.get("value"))):
          originIEHP[f"{nNextNum + idx}"] = self.UpdateData(ElementValue, Component, tableType, value)
        
    for key in originIEHP.keys() :
        py_db_update_item(self.name, key, json.dumps(originIEHP[key]))

    return json.dumps(originIEHP)
    
  def FindTableList(self, key, obj, bAddKey) ->bool:  
    resultValue = {}
    addValue = {"tableType":[], "value":[]}
    for tableType in obj.keys():
      for data in obj[tableType] :
        targetKey = data.get("KEY")
        if not bAddKey and targetKey not in list(originIEHP.keys()) :
          addValue["tableType"].append(tableType)
          addValue["value"].append(data)
          continue
        
        if targetKey == key: 
          resultValue["targetKey"] = targetKey
          resultValue["tableType"] = tableType
          resultValue["value"] = data


    return [resultValue, addValue]

  def UpdateData(self,ElementValue, Component, tableType, value):
    global TEMPLATE
    newValue = copy.deepcopy(TEMPLATE)
    model = value.get("HISTORY_MODEL")
    modelPropName = ALL_History_Prop_Name[model]
    MATERIAL_TYPE =  "STEEL"  if value.get("MATERIAL_TYPE") == "S" else "RC"
    HYSTERESIS_MODEL = [ model if Component == idx else "KIN" for idx in range(0,6)]
    HYSTERESIS_MODEL.append("")
    HYSTERESIS_MODEL.append("")
    HYSTERESIS_MODEL.append("")
    DATA = value.get("DATA")

    newValue["NAME"] = value.get("NAME")
    newValue["HINGE_TYPE"] = HINGE_TYPE[ElementValue]
    newValue["MATERIAL_TYPE"] = MATERIAL_TYPE
    newValue["COMPONENT_DIR"] =  [ True if Component == idx else False for idx in range(0,6)]
    newValue["HYSTERESIS_MODEL"] = HYSTERESIS_MODEL
    newValue["ALL_PROP"][Component] = {modelPropName : {}}

    propData = newValue["ALL_PROP"][Component][modelPropName]
    if tableType == "1" or tableType == "2":
      propData = self.setOtherData(Component, tableType, propData, DATA)
    else :

      MUL_DATA = [ {"DISP" : pnd[1], "FORCE" : pnd[0] } for pnd in DATA.get("PnD_Data")]
      newValue["MULT_DATA"] = MUL_DATA
      self.setMultiData(propData, DATA)
    
    newValue["ALL_SUBPROP"] = copy.deepcopy(newValue["ALL_PROP"])

    return newValue

  def setOtherData(self, Component, tableType, propData, DATA, ):
      setData = propData
      setData["SYMMETRIC"] = DATA.get("SYMMETRIC")
      setData["YIELDSTRENGTHOPT"] = 0
      setData["DEFORMDEFINETYPE"] = 1
      setData["INITSTIFFNESS"] = DATA.get("INITSTIFFNESS")
      setData["PALPHADELTA"] = 1 if tableType == "1" else 0
      setData["COMPONENTPROPS"] = {"DEFORMCAPACITY": DEFAULT_DEFORM}

      # P or D
      FDList = [("CRACKFORCE", "YIELDDISP1ST"), ("YIELDFORCE", "YIELDDISP2ND"), ("ULTIMATEFORCE", "YIELDDISP3RD"), ("FRACTUREFORCE", "YIELDDISP4TH")]
      MRLIst = [("CRACKMOMENT", "YIELDROTN1ST"), ("YIELDMOMENT", "YIELDROTN2ND"), ("ULTIMATEMOMENT", "YIELDROTN3RD"), ("FRACTUREMOMENT", "YIELDROTN4TH")]
      nPnd = DATA.get("PND") if tableType == "1" else DATA.get("PND") + 1
      nCount = 0
      for idx, (force,disp) in enumerate(FDList) :
        if nPnd == 2 and idx == 0: continue
        if tableType == "1" and nPnd <= nCount : continue
        if tableType == "2" and nPnd <= nCount +1: continue

        setData["COMPONENTPROPS"][force] = DATA.get("P_DATA")[nCount] if Component < 3 else [1,1]
        if tableType == "1" : setData["COMPONENTPROPS"][disp] = DATA.get("D_DATA")[nCount] if Component < 3 else [0.1 * nCount, 0.1 * nCount]
        else : setData["COMPONENTPROPS"][disp] = [0.1 * nCount, 0.1 * nCount]
        nCount +=1

      nCount2 = 0
      for idx, (moment,rotn) in enumerate(MRLIst) :
        if nPnd == 2 and idx == 0: continue
        if tableType == "1" and nPnd <= nCount2 : continue
        if tableType == "2" and nPnd <= nCount2 +1: continue

        setData["COMPONENTPROPS"][moment] = [1,1] if Component < 3 else DATA.get("P_DATA")[nCount2] 
        if tableType == "1" :setData["COMPONENTPROPS"][rotn] = [0.1*nCount2, 0.1*nCount2] if Component < 3 else DATA.get("D_DATA")[nCount2]
        else :setData["COMPONENTPROPS"][rotn] = [0.1*nCount2, 0.1*nCount2]
        nCount2 +=1

      # stiff
      if tableType == "2":
        SFList = ["STIFFRATIO1ST", "STIFFRATIO2ND", "STIFFRATIO3RD", "STIFFRATIO4TH"]
        nCount3 = 0
        for idx, stiff in enumerate(SFList) :
          if nPnd == 2 and idx == 0: continue
          if tableType == "1" and nPnd <= nCount3 : continue
          if tableType == "2" and nPnd <= nCount3 +1: continue
          setData["COMPONENTPROPS"][stiff] = DATA.get("A_DATA")[nCount3]
          nCount3 +=1
      
      # others
      if DATA.get("BETA") :setData["UNLOADSTIFFCALCEXPO"] = DATA.get("BETA")
      if DATA.get("ALPA") :setData["UNLOADSTIFFREDUFAC"] = DATA.get("ALPA")
      if DATA.get("GAMMA") :setData["PINCHINGRULEFAC"] = DATA.get("GAMMA")
      if DATA.get("INIT_GAP") :
        setData["INITGAPPOSITIVE"] = DATA.get("INIT_GAP")[0]
        setData["INITGAPNEGATIVE"] = DATA.get("INIT_GAP")[1]

      return setData

  def setMultiData(self, propData, DATA):
      setData = propData
      setData["nMultiType"] = 0
      setData["nDeformDefineType"] = 1
      setData["dInitStiffP"] = 1
      setData["dInitStiffN"] = 1
      setData["dHysParam_Alpha1"] = DATA.get("dHysParam_Alpha1")
      setData["dHysParam_Alpha2"] = DATA.get("dHysParam_Alpha2")
      setData["dHysParam_Beta1"] = DATA.get("dHysParam_Beta1")
      setData["dHysParam_Beta2"] = DATA.get("dHysParam_Beta2")
      setData["dHysParam_Eta"] = DATA.get("dHysParam_Eta")
      setData["nType"] = DATA.get("nType")
      setData["dScaleF_Displ"] = 1
      setData["dScaleF_Force"] = 1
      setData["DEFORMCAPACITY"] = DEFAULT_DEFORM

      return setData

DEFAULT_DEFORM= [[ 0.5, 1,2, 4,8],[ 0.5,1, 2,4,8]]

TEMPLATE =  {
  "DESC": "",
  "DEFINITION": "SKEL",
  "INTERACTION_TYPE": "NONE",
  "LOCATION": "I",
  "USEIEHCLOCATION": "AUTO",
  "EXIST_IJ_PROP": [
      False,
      False,
      False,
      False,
      False,
      False,
      False
  ],
  "SECTION_NUM": [
      3,
      3,
      3,
      3,
      3,
      3
  ],
  "ALL_PROP": [
      {
          "KINEMA": {
              "SYMMETRIC": 0,
              "YIELDSTRENGTHOPT": 1,
              "DEFORMDEFINETYPE": 1,
              "INITSTIFFNESS": 1,
              "PALPHADELTA": 0,
              "COMPONENTPROPS": {
                  "CRACKFORCE": [
                      0.5,
                      0.5
                  ],
                  "CRACKMOMENT": [
                      0.5,
                      0.5
                  ],
                  "YIELDFORCE": [
                      1,
                      1
                  ],
                  "YIELDMOMENT": [
                      1,
                      1
                  ],
                  "ULTIMATEFORCE": [
                      1,
                      1
                  ],
                  "ULTIMATEMOMENT": [
                      1,
                      1
                  ],
                  "YIELDDISP1ST": [
                      0.1,
                      0.1
                  ],
                  "YIELDROTN1ST": [
                      0.1,
                      0.1
                  ],
                  "YIELDDISP2ND": [
                      0.2,
                      0.2
                  ],
                  "YIELDROTN2ND": [
                      0.2,
                      0.2
                  ],
                  "YIELDDISP3RD": [
                      0.3,
                      0.3
                  ],
                  "YIELDROTN3RD": [
                      0.3,
                      0.3
                  ],
                  "STIFFRATIO2ND": [
                      0.1,
                      0.1
                  ],
                  "STIFFRATIO1ST": [
                      0.5,
                      0.5
                  ],
                  "DEFORMCAPACITY": [
                      [
                          0.5,
                          1,
                          2,
                          4,
                          8
                      ],
                      [
                          0.5,
                          1,
                          2,
                          4,
                          8
                      ]
                  ]
              }
          }
      },
      {
          "KINEMA": {
              "SYMMETRIC": 0,
              "YIELDSTRENGTHOPT": 1,
              "DEFORMDEFINETYPE": 1,
              "INITSTIFFNESS": 1,
              "PALPHADELTA": 0,
              "COMPONENTPROPS": {
                  "CRACKFORCE": [
                      0.5,
                      0.5
                  ],
                  "CRACKMOMENT": [
                      0.5,
                      0.5
                  ],
                  "YIELDFORCE": [
                      1,
                      1
                  ],
                  "YIELDMOMENT": [
                      1,
                      1
                  ],
                  "ULTIMATEFORCE": [
                      1,
                      1
                  ],
                  "ULTIMATEMOMENT": [
                      1,
                      1
                  ],
                  "YIELDDISP1ST": [
                      0.1,
                      0.1
                  ],
                  "YIELDROTN1ST": [
                      0.1,
                      0.1
                  ],
                  "YIELDDISP2ND": [
                      0.2,
                      0.2
                  ],
                  "YIELDROTN2ND": [
                      0.2,
                      0.2
                  ],
                  "YIELDDISP3RD": [
                      0.3,
                      0.3
                  ],
                  "YIELDROTN3RD": [
                      0.3,
                      0.3
                  ],
                  "STIFFRATIO2ND": [
                      0.1,
                      0.1
                  ],
                  "STIFFRATIO1ST": [
                      0.5,
                      0.5
                  ],
                  "DEFORMCAPACITY": [
                      [
                          0.5,
                          1,
                          2,
                          4,
                          8
                      ],
                      [
                          0.5,
                          1,
                          2,
                          4,
                          8
                      ]
                  ]
              }
          }
      },
      {
          "KINEMA": {
              "SYMMETRIC": 0,
              "YIELDSTRENGTHOPT": 1,
              "DEFORMDEFINETYPE": 1,
              "INITSTIFFNESS": 1,
              "PALPHADELTA": 0,
              "COMPONENTPROPS": {
                  "CRACKFORCE": [
                      0.5,
                      0.5
                  ],
                  "CRACKMOMENT": [
                      0.5,
                      0.5
                  ],
                  "YIELDFORCE": [
                      1,
                      1
                  ],
                  "YIELDMOMENT": [
                      1,
                      1
                  ],
                  "ULTIMATEFORCE": [
                      1,
                      1
                  ],
                  "ULTIMATEMOMENT": [
                      1,
                      1
                  ],
                  "YIELDDISP1ST": [
                      0.1,
                      0.1
                  ],
                  "YIELDROTN1ST": [
                      0.1,
                      0.1
                  ],
                  "YIELDDISP2ND": [
                      0.2,
                      0.2
                  ],
                  "YIELDROTN2ND": [
                      0.2,
                      0.2
                  ],
                  "YIELDDISP3RD": [
                      0.3,
                      0.3
                  ],
                  "YIELDROTN3RD": [
                      0.3,
                      0.3
                  ],
                  "STIFFRATIO2ND": [
                      0.1,
                      0.1
                  ],
                  "STIFFRATIO1ST": [
                      0.5,
                      0.5
                  ],
                  "DEFORMCAPACITY": [
                      [
                          0.5,
                          1,
                          2,
                          4,
                          8
                      ],
                      [
                          0.5,
                          1,
                          2,
                          4,
                          8
                      ]
                  ]
              }
          }
      },
      {
          "KINEMA": {
              "SYMMETRIC": 0,
              "YIELDSTRENGTHOPT": 1,
              "DEFORMDEFINETYPE": 1,
              "INITSTIFFNESS": 1,
              "PALPHADELTA": 0,
              "COMPONENTPROPS": {
                  "CRACKFORCE": [
                      0.5,
                      0.5
                  ],
                  "CRACKMOMENT": [
                      0.5,
                      0.5
                  ],
                  "YIELDFORCE": [
                      1,
                      1
                  ],
                  "YIELDMOMENT": [
                      1,
                      1
                  ],
                  "ULTIMATEFORCE": [
                      1,
                      1
                  ],
                  "ULTIMATEMOMENT": [
                      1,
                      1
                  ],
                  "YIELDDISP1ST": [
                      0.1,
                      0.1
                  ],
                  "YIELDROTN1ST": [
                      0.1,
                      0.1
                  ],
                  "YIELDDISP2ND": [
                      0.2,
                      0.2
                  ],
                  "YIELDROTN2ND": [
                      0.2,
                      0.2
                  ],
                  "YIELDDISP3RD": [
                      0.3,
                      0.3
                  ],
                  "YIELDROTN3RD": [
                      0.3,
                      0.3
                  ],
                  "STIFFRATIO2ND": [
                      0.1,
                      0.1
                  ],
                  "STIFFRATIO1ST": [
                      0.5,
                      0.5
                  ],
                  "DEFORMCAPACITY": [
                      [
                          0.5,
                          1,
                          2,
                          4,
                          8
                      ],
                      [
                          0.5,
                          1,
                          2,
                          4,
                          8
                      ]
                  ]
              }
          }
      },
      {
          "KINEMA": {
              "SYMMETRIC": 0,
              "YIELDSTRENGTHOPT": 1,
              "DEFORMDEFINETYPE": 1,
              "INITSTIFFNESS": 1,
              "PALPHADELTA": 0,
              "COMPONENTPROPS": {
                  "CRACKFORCE": [
                      0.5,
                      0.5
                  ],
                  "CRACKMOMENT": [
                      0.5,
                      0.5
                  ],
                  "YIELDFORCE": [
                      1,
                      1
                  ],
                  "YIELDMOMENT": [
                      1,
                      1
                  ],
                  "ULTIMATEFORCE": [
                      1,
                      1
                  ],
                  "ULTIMATEMOMENT": [
                      1,
                      1
                  ],
                  "YIELDDISP1ST": [
                      0.1,
                      0.1
                  ],
                  "YIELDROTN1ST": [
                      0.1,
                      0.1
                  ],
                  "YIELDDISP2ND": [
                      0.2,
                      0.2
                  ],
                  "YIELDROTN2ND": [
                      0.2,
                      0.2
                  ],
                  "YIELDDISP3RD": [
                      0.3,
                      0.3
                  ],
                  "YIELDROTN3RD": [
                      0.3,
                      0.3
                  ],
                  "STIFFRATIO2ND": [
                      0.1,
                      0.1
                  ],
                  "STIFFRATIO1ST": [
                      0.5,
                      0.5
                  ],
                  "DEFORMCAPACITY": [
                      [
                          0.5,
                          1,
                          2,
                          4,
                          8
                      ],
                      [
                          0.5,
                          1,
                          2,
                          4,
                          8
                      ]
                  ]
              }
          }
      },
      {
          "KINEMA": {
              "SYMMETRIC": 0,
              "YIELDSTRENGTHOPT": 1,
              "DEFORMDEFINETYPE": 1,
              "INITSTIFFNESS": 1,
              "PALPHADELTA": 0,
              "COMPONENTPROPS": {
                  "CRACKFORCE": [
                      0.5,
                      0.5
                  ],
                  "CRACKMOMENT": [
                      0.5,
                      0.5
                  ],
                  "YIELDFORCE": [
                      1,
                      1
                  ],
                  "YIELDMOMENT": [
                      1,
                      1
                  ],
                  "ULTIMATEFORCE": [
                      1,
                      1
                  ],
                  "ULTIMATEMOMENT": [
                      1,
                      1
                  ],
                  "YIELDDISP1ST": [
                      0.1,
                      0.1
                  ],
                  "YIELDROTN1ST": [
                      0.1,
                      0.1
                  ],
                  "YIELDDISP2ND": [
                      0.2,
                      0.2
                  ],
                  "YIELDROTN2ND": [
                      0.2,
                      0.2
                  ],
                  "YIELDDISP3RD": [
                      0.3,
                      0.3
                  ],
                  "YIELDROTN3RD": [
                      0.3,
                      0.3
                  ],
                  "STIFFRATIO2ND": [
                      0.1,
                      0.1
                  ],
                  "STIFFRATIO1ST": [
                      0.5,
                      0.5
                  ],
                  "DEFORMCAPACITY": [
                      [
                          0.5,
                          1,
                          2,
                          4,
                          8
                      ],
                      [
                          0.5,
                          1,
                          2,
                          4,
                          8
                      ]
                  ]
              }
          }
      },
      {},
      {}
  ],
}


