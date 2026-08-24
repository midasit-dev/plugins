### do not delete this import scripts ###
import json
from py_base import set_g_values, get_g_values, requests_json, MidasAPI, Product
from py_api_db import * ## get all function
from py_template import (TEMPLATE, DEFAULT_DEFORM, DEFAULT_STIFFRATIO,
                         DEFAULT_FORCE, DEFAULT_CRACK, DEFAULT_DISP_2ND, DEFAULT_DISP_3RD)
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
  'TTE': "TAKTET",
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

# 스켈레톤 prop 구조체별로, 공통 필드(SYMMETRIC/INITSTIFFNESS/PALPHADELTA/COMPONENTPROPS 등)
# 외에 추가로 정의된 필드. DTO_IEHP.h 의 IEHP_PROP_* 구조체 정의 기준.
# 여기에 없는 필드를 실어 보내면 해당 모델에 존재하지 않는 필드가 되므로 기록하지 않는다.
ALL_History_Prop_ExtraField = {
  "KINEMA": (),
  "ORIGIN": (),
  "PEAK": (),
  "CLOUGH": ("UNLOADSTIFFCALCEXPO",),
  "DEGRAD": (),
  "TAKEDA": ("UNLOADSTIFFCALCEXPO", "UNLOADSTIFFREDUFAC", "PINCHINGRULEFAC"),
  "TAKTET": ("UNLOADSTIFFCALCEXPO", "UNLOADSTIFFREDUFAC"),
  "SRCTET": ("UNLOADSTIFFCALCEXPO",),
  "NORBIL": (),
  "ELABIL": (),
  "ELATRI": (),
  "ELATET": (),
  "SLIP": ("INITGAPPOSITIVE", "INITGAPNEGATIVE"),
}

# COMPONENTPROPS 의 절선 슬롯별 필드 이름. 인덱스 = 슬롯(0 균열, 1 항복, 2 종국, 3 파단).
FORCE_FIELDS  = ["CRACKFORCE",   "YIELDFORCE",   "ULTIMATEFORCE",  "FRACTUREFORCE"]
MOMENT_FIELDS = ["CRACKMOMENT",  "YIELDMOMENT",  "ULTIMATEMOMENT", "FRACTUREMOMENT"]
DISP_FIELDS   = ["YIELDDISP1ST", "YIELDDISP2ND", "YIELDDISP3RD",   "YIELDDISP4TH"]
ROTN_FIELDS   = ["YIELDROTN1ST", "YIELDROTN2ND", "YIELDROTN3RD",   "YIELDROTN4TH"]
STIFF_FIELDS  = ["STIFFRATIO1ST","STIFFRATIO2ND","STIFFRATIO3RD",  "STIFFRATIO4TH"]

def pointSlots(pnd, dataType):
  """PND 개의 데이터 점이 COMPONENTPROPS 의 몇 번째 절선 슬롯에 들어가는가.

  2절선(dataType == 2)은 균열점을 쓰지 않으므로 슬롯 1부터 시작한다.
  읽기(readSkeleton)와 쓰기(writeSkeleton)가 같은 규칙을 써야 왕복이 맞는다.

      탭1 2절선  dataType=2 pnd=2 -> [1, 2]
      탭1 3절선  dataType=3 pnd=3 -> [0, 1, 2]
      탭2 3절선  dataType=3 pnd=2 -> [0, 1]
      탭2 2절선  dataType=2 pnd=1 -> [1]
  """
  start = 1 if dataType == 2 else 0
  return list(range(start, start + pnd))

# 한 힌지가 갖는 성분 슬롯 수 (Fx, Fy, Fz, Mx, My, Mz)
COMPONENT_COUNT = 6

def slotAt(values, index):
  """리스트의 index 번째를 안전하게 꺼낸다. 없으면 None.

  서버 레코드가 성분 6칸을 항상 채워 준다는 보장이 없다. 그대로 인덱싱하면
  손상된 레코드 하나 때문에 조회 전체가 죽는다.
  """
  if not isinstance(values, list) : return None
  if index < 0 or index >= len(values) : return None
  return values[index]

def stiffSlots(dataType):
  """강성비가 들어가는 절선 슬롯.

  강성비는 점 **사이**의 기울기라 점보다 항상 하나 적다.
  탭2(P-alpha)는 PND 가 이미 (절선수 - 1)이라 점 슬롯과 결과가 같지만,
  탭1(P-D)은 점이 하나 더 많아 점 슬롯을 그대로 쓰면 한 칸이 넘친다.
  넘겨 보낸 값은 서버가 버리므로 저장할 때마다 원본과 달라 보였고,
  그 탓에 탭1 행이 편집 없이도 매번 재전송됐다.
  """
  return pointSlots(dataType - 1, dataType)

def pointFields(Component):
  """성분 0~2 는 힘·변위로, 3~5 는 모멘트·회전각으로 기록된다."""
  if Component < 3 : return FORCE_FIELDS, DISP_FIELDS
  return MOMENT_FIELDS, ROTN_FIELDS

class Loaded :
  """마지막 조회(loadHinges) 결과.

  저장(saveHinges)의 삭제 판정과 성분 가드가 전부 이 값을 기준으로 삼는다.
  브라우저 콘솔에서 LOADED.records / LOADED.keys 로 바로 들여다볼 수 있다.
  """
  def __init__(self) :
    self.records = {}      # 서버에서 읽은 IEHP 전체 {키: 레코드}
    self.keys = []         # 그중 필터를 통과해 화면에 나간 키. 삭제 판정의 유일한 기준
    self.element = None    # 조회에 쓴 요소 타입
    self.component = None  # 조회에 쓴 성분 (0-based)
    self.skipped = []      # 읽을 수 없어 건너뛴 레코드 [(키, 사유)]

  def reset(self, element, component) :
    self.records = {}
    self.keys = []
    self.skipped = []
    self.element = element
    self.component = component

  def skip(self, key, reason) :
    """읽을 수 없는 레코드를 기록하고 빈 행을 돌려준다.

    화면에 내보내지 않으므로(LOADED.keys 에 안 들어감) 저장 시 삭제 대상도 아니다.
    콘솔에서 LOADED.skipped 로 무엇이 왜 빠졌는지 확인할 수 있다.
    """
    self.skipped.append((key, reason))
    print("[IEHP] skip record %s - %s" % (key, reason))
    return {}

LOADED = Loaded()
class IEHP :
  """IEHP 테이블 조작. 상태는 갖지 않는다 - self.name(테이블 이름)뿐이고
  조회 결과는 모듈 전역 LOADED 에 있다. TS 브리지가 매 호출마다 새로 만든다."""
  def __init__(self, name) ->None:
    self.name = name

  async def loadHinges(self, ElementValue, ComponentValue):
    """서버 -> 표. IEHP 전체를 읽어 필터를 통과한 것만 탭별 행 목록으로 돌려준다."""
    # 무엇보다 먼저 이전 조회 결과를 버린다. 이 함수가 어디로 빠져나가든
    # 낡은 records/keys 가 남아 있으면 다음 저장이 그걸 기준으로 삼는다.
    LOADED.reset(ElementValue, ComponentValue)

    # 범위 밖 인자는 호출 쪽 실수다. 레코드 손상과 섞이지 않게 여기서 막는다.
    if ElementValue not in HINGE_TYPE : return json.dumps({})
    if not isinstance(ComponentValue, int) : return json.dumps({})
    if ComponentValue < 0 or ComponentValue >= COMPONENT_COUNT : return json.dumps({})

    result = await py_db_read(self.name)
    records = json.loads(result)
    if not isinstance(records, dict) or records.get("error"):
      return json.dumps({})
    LOADED.records = records

    tableList = {}
    for key in LOADED.records.keys():
      # toTableRow 가 예상 못 한 모양의 레코드에서 터져도 나머지는 살린다.
      # 건너뛴 레코드는 LOADED.keys 에 들어가지 않으므로 저장 시 삭제 대상도 아니다.
      try:
        tableData = self.toTableRow(ElementValue, ComponentValue, key, LOADED.records.get(key))
      except Exception as err:
        LOADED.skip(key, "%s: %s" % (type(err).__name__, err))
        continue
      if tableData :
        LOADED.keys.append(key)
        for tableType, data in tableData.items():
          if tableList.get(tableType):
            tableList[tableType].append(data)
          else :
            tableList[tableType] = [data]

    return json.dumps(tableList)

  def toTableRow(self, ElementValue, ComponentValue, key, rawData):
    """서버 레코드 1개 -> 표 행 1개. 필터를 통과하지 못하면 빈 dict.

    필터 탈락(이 성분/요소의 힌지가 아님)과 레코드 손상은 다르다. 앞은 조용히
    빈 dict, 뒤는 LOADED.skip 으로 사유를 남긴다. 둘 다 화면에 나가지 않으므로
    저장 시 삭제 대상이 되지도 않는다.
    """
    hingeType = HINGE_TYPE.get(ElementValue)
    if hingeType is None : return {}
    if not isinstance(rawData, dict) : return LOADED.skip(key, "record is not an object")

    if rawData.get("DEFINITION") != "SKEL": return {}
    if rawData.get("HINGE_TYPE") != hingeType: return {}
    if rawData.get("INTERACTION_TYPE") != "NONE": return {}

    # COMPONENT_DIR 자체가 없거나 짧은 것(손상)과, 값이 false 인 것(이 성분의
    # 힌지가 아님 = 정상 탈락)은 다르다. 뭉뚱그리면 손상이 조용히 묻힌다.
    componentDir = rawData.get("COMPONENT_DIR")
    if not isinstance(componentDir, list) or ComponentValue >= len(componentDir) :
      return LOADED.skip(key, "COMPONENT_DIR[%s] is missing" % ComponentValue)
    if not componentDir[ComponentValue] : return {}

    # 여기서부터는 COMPONENT_DIR 이 true 인 성분이다. 대응하는 ALL_PROP /
    # HYSTERESIS_MODEL 이 비어 있으면 필터 탈락이 아니라 레코드가 깨진 것이다.
    dataObject = slotAt(rawData.get("ALL_PROP"), ComponentValue)
    if not isinstance(dataObject, dict) or not dataObject :
      return LOADED.skip(key, "ALL_PROP[%s] is empty" % ComponentValue)

    NAME = list(dataObject.keys())[0]
    propData = dataObject.get(NAME)
    if not isinstance(propData, dict) :
      return LOADED.skip(key, "ALL_PROP[%s].%s is not an object" % (ComponentValue, NAME))

    historyModel = slotAt(rawData.get("HYSTERESIS_MODEL"), ComponentValue)
    if not historyModel :
      return LOADED.skip(key, "HYSTERESIS_MODEL[%s] is empty" % ComponentValue)

    # 저장 경로(buildRecord)가 이 코드로 prop 구조체 이름을 찾는다. 모르는 코드를
    # 화면에 내보내면 저장할 때 KeyError 로 저장 전체가 죽는다.
    if historyModel not in ALL_History_Prop_Name :
      return LOADED.skip(key, "unknown hysteresis model %s" % historyModel)

    # 구조체 이름과 모델 코드는 서로에게서 유도되므로 항상 일치해야 한다.
    # 어긋나면 조회는 A 형식으로 읽고 저장은 B 형식으로 쓰게 된다.
    if ALL_History_Prop_Name[historyModel] != NAME :
      return LOADED.skip(key, "model %s expects %s but ALL_PROP[%s] holds %s" % (
        historyModel, ALL_History_Prop_Name[historyModel], ComponentValue, NAME))

    setData = {
    "KEY": key,
    "NAME": rawData.get("NAME"),
    "MATERIAL_TYPE":  "S" if rawData.get("MATERIAL_TYPE") == "STEEL" else "RC",
    "HISTORY_MODEL": historyModel,
    }
    if NAME == "MULTLIN" : 
      setData["DATA"] = self.readMultilinear(propData, rawData.get("MULT_DATA"))
      return { "3": setData }

    else :
      # 스켈레톤 경로는 절선 수를 모델 코드에서 얻는다.
      if historyModel not in ALL_Histroy_PND :
        return LOADED.skip(key, "no linearity defined for %s" % historyModel)
      if propData.get("YIELDSTRENGTHOPT") != 0 : return {}

      tableType = propData.get("PALPHADELTA")
      DATA = self.readSkeleton(
        propData,
        historyModel,
        tableType,
        ComponentValue
        )

      # readSkeleton 은 값이 비면 거기서 수집을 멈춘다. 그래서 배열이 PND 보다
      # 짧아질 수 있는데, 저장 경로는 PND 개를 그대로 인덱싱한다. 그대로 두면
      # 레코드 하나 때문에 저장 전체가 IndexError 로 죽는다.
      # 탭1(P-D)은 힘·변위가, 탭2(P-alpha)는 힘·강성비가 입력이다.
      needed = ("P_DATA", "D_DATA") if tableType == 1 else ("P_DATA", "A_DATA")
      short = [f for f in needed if len(DATA.get(f) or []) != DATA.get("PND")]
      if short :
        return LOADED.skip(key, "%s shorter than PND=%s (%s)" % (
          "/".join(short), DATA.get("PND"),
          ", ".join("%s=%d" % (f, len(DATA.get(f) or [])) for f in needed)))

      setData["DATA"] = DATA
      if tableType == 0:
        return { "2": setData }
      else :
        return { "1": setData }

  def readMultilinear(self, data, multData):
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

  def readSkeleton(self, data, historyModel, tableType, ComponentValue):
    """서버 prop 구조체 -> 표 DATA. writeSkeleton 의 역방향이다."""
    pndData = data.get("COMPONENTPROPS")
    dataType = ALL_Histroy_PND[historyModel]
    nPnd = dataType if tableType == 1 else dataType - 1

    pointKeys, stepKeys = pointFields(ComponentValue)
    slots = pointSlots(nPnd, dataType)

    # 데이터 점이 들어 있는 슬롯만 읽는다. 그 밖의 자리에도 DTO required 를 채우느라
    # 값이 들어 있어(ULTIMATEMOMENT = [1,1] 같은 placeholder), 값의 유무로 세면
    # P_DATA 길이와 PND 가 어긋난다.
    def collect(keys):
      out = []
      for slot in slots:
        value = pndData.get(keys[slot])
        if value is None : break
        out.append(value)
      return out

    pData = collect(pointKeys)
    dData = collect(stepKeys)
    aData = collect(STIFF_FIELDS)

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
      'PND': nPnd
    }

  async def saveHinges(self, ElementValue, Component, obj):
    """표 -> 서버. 추가/삭제/변경된 행만 보낸다."""
    tableObj = json.loads(obj)
    allKeys = list(LOADED.records.keys())
    # 삭제 판정은 "화면에 보였던 키"에 대해서만 한다. 서버 전체를 기준으로 삼으면
    # 필터(HINGE_TYPE / COMPONENT_DIR / DEFINITION ...)에 걸러져 사용자가 본 적도 없는
    # 힌지까지 함께 지워진다.
    shownKeys = [k for k in LOADED.keys if k in allKeys]
    delKey = []
    updateKeyData = []
    addKeyData = []

    tableKeys = []
    if tableObj.get("1"):
      list(map(lambda x : tableKeys.append((x.get("KEY"), x, "1")), tableObj.get("1")))
    if tableObj.get("2"):
      list(map(lambda x : tableKeys.append((x.get("KEY"), x, "2")), tableObj.get("2")))
    if tableObj.get("3"):
      list(map(lambda x : tableKeys.append((x.get("KEY"), x, "3")), tableObj.get("3")))

    if not LOADED.records and not tableKeys : return json.dumps({"result" : "error"})

    # 드롭다운은 TableList 를 비우지 않는다. 조회 이후 요소/성분을 바꾸고 저장하면
    # 화면에 남아 있는 이전 성분의 행이 전부 새 성분 슬롯에 기록되어 기존 정의를 덮어쓴다.
    if LOADED.element is not None and (LOADED.element != ElementValue or LOADED.component != Component) :
      return json.dumps({"result" : "error", "message" : [
        "ELEMENT_COMPONENT_MISMATCH: table was loaded for element=%s component=%s but save targets element=%s component=%s. Request again before saving."
        % (LOADED.element, LOADED.component, ElementValue, Component)]})

    # dict 순서상 마지막 키가 최대값이라는 보장이 없다. 최대값 기준으로 잡아야
    # 기존 키와 충돌해 덮어쓰는 일이 없다.
    # 신규 키는 숨겨진 힌지와 충돌하지 않도록 화면 표시분이 아닌 전체 키 기준으로 잡는다.
    nextKey = max(map(int, allKeys))+1 if allKeys else 1
    keptKeys = []
    for chKey, data, tableType in tableKeys:
      if chKey == None :
        addKeyData.append({ "Key" :str(nextKey), "Data" : data, "Type" : tableType})
        nextKey+=1
      elif chKey in allKeys:
        updateKeyData.append({ "Key" :str(chKey), "Data" : data, "Type" : tableType})
        keptKeys.append(chKey)
    # 화면에 보였는데 테이블에서 사라진 행 = 사용자가 실제로 지운 행
    delKey = [k for k in shownKeys if k not in keptKeys]

    errors = []
    nUpdated = 0
    nSkipped = 0
    if delKey:
      errors += await self.deleteRecords(delKey)
    if updateKeyData:
      updErrors, nUpdated, nSkipped = await self.putChangedRecords(ElementValue, Component, updateKeyData)
      errors += updErrors
    if addKeyData:
      errors += await self.postNewRecords(ElementValue, Component, addKeyData)

    if errors:
      return json.dumps({"result":"error", "message": errors})

    return json.dumps({
      "result":"success",
      "deleted": len(delKey),
      "updated": nUpdated,
      "added": len(addKeyData),
      "skipped": nSkipped,
      })

  def checkResult(self, result):
    # py_db_* 는 JSON 문자열을 돌려준다. 실패 응답은 {"error": ...} 형태.
    try:
      parsed = json.loads(result)
    except Exception:
      return str(result)
    if isinstance(parsed, dict) and parsed.get("error") :
      return parsed.get("error")
    return None

  async def deleteRecords(self, delKey):
    # DELETE /db/IEHP (키 없음)은 테이블 전체를 지우므로 삭제만 키 단위로 호출한다
    errors = []
    for key in delKey:
      error = self.checkResult(await py_db_delete(self.name, key))
      if error : errors.append(error)
    return errors

  def isUnchanged(self, key, newValue):
    # 서버 상태와 한 글자도 다르지 않은 레코드는 보낼 이유가 없다.
    # ALL_SUBPROP 은 EXIST_IJ_PROP 이 전부 false 일 때 의도적으로 빼고 보내므로
    # (서버가 I단 값으로 채운다) 비교 대상에서 제외한다. 편집 대상도 아니다.
    origin = LOADED.records.get(key)
    if origin is None : return False
    a = dict((k, v) for k, v in newValue.items() if k != "ALL_SUBPROP")
    b = dict((k, v) for k, v in origin.items() if k != "ALL_SUBPROP")
    return a == b

  async def putChangedRecords(self, ElementValue, Component, updateKeyData):
    updateIEHP = {}
    skipped = 0
    if LOADED.records:
      for update in updateKeyData:
        key = update.get("Key")
        data = update.get("Data")
        type = update.get("Type")
        newValue = self.buildRecord(ElementValue, Component, type, data, key)
        # 바뀌지 않은 행까지 매번 재작성하면 UI 에 없는 탭(MULTLIN)까지 다시 쓰이고,
        # 한 셀만 고쳐도 전량이 buildRecord 왕복 무결성에 걸리게 된다.
        if self.isUnchanged(key, newValue) :
          skipped += 1
          continue
        updateIEHP[key] = newValue

    if not updateIEHP : return [], 0, skipped

    # PUT /db/IEHP 한 번으로 일괄 수정
    error = self.checkResult(await py_db_update(self.name, json.dumps(updateIEHP)))
    return ([error] if error else []), len(updateIEHP), skipped

  async def postNewRecords(self, ElementValue, Component, addKeyData):
    addIEHP = {}
    for add in addKeyData:
      key = add.get("Key")
      data = add.get("Data")
      type = add.get("Type")
      addIEHP[key] = self.buildRecord(ElementValue, Component, type, data)

    if not addIEHP : return []

    # POST /db/IEHP 한 번으로 일괄 생성
    error = self.checkResult(await py_db_create(self.name, json.dumps(addIEHP)))
    return [error] if error else []

  def buildRecord(self, ElementValue, Component, tableType, value, key = None):
    """표 행 1개 -> 서버 레코드 1개. key 가 None 이면 신규다."""
    model = value.get("HISTORY_MODEL")
    modelPropName = ALL_History_Prop_Name[model]
    DATA = value.get("DATA")

    # 기존 힌지는 원본 위에 현재 성분만 얹는다.
    # TEMPLATE 에서 새로 만들면 COMPONENT_DIR / HYSTERESIS_MODEL / ALL_PROP 이
    # 현재 성분만 남도록 덮여, 같은 힌지의 다른 성분 정의가 사라진다.
    origin = LOADED.records.get(key) if key is not None else None
    isNew = origin is None
    newValue = copy.deepcopy(TEMPLATE) if isNew else copy.deepcopy(origin)

    newValue["NAME"] = value.get("NAME")
    newValue["MATERIAL_TYPE"] = "STEEL" if value.get("MATERIAL_TYPE") == "S" else "RC"

    if isNew :
      newValue["HINGE_TYPE"] = HINGE_TYPE[ElementValue]
      # 슬롯 6~8 은 서버가 재조회 시 "" 로 정규화한다. "" 도 "KIN" 도 입력으로 허용된다.
      newValue["HYSTERESIS_MODEL"] = [ model if Component == idx else "KIN" for idx in range(0,6)] + ["", "", ""]
      newValue["COMPONENT_DIR"] = [ Component == idx for idx in range(0,6)]
    else :
      # 다른 성분의 값은 그대로 두고 현재 성분만 갱신한다.
      newValue["HYSTERESIS_MODEL"][Component] = model
      newValue["COMPONENT_DIR"][Component] = True

    # 모델이 그대로면 원본 prop 을 기반으로 삼아, 플러그인이 관리하지 않는
    # 필드(INITSTIFFTYPE 등)를 잃지 않는다. 모델이 바뀌었으면 새로 만든다.
    #
    # 여기 오는 레코드는 toTableRow 를 통과했으니 슬롯이 있는 것이 보장되지만,
    # 다른 슬롯 접근과 같은 규칙(slotAt)을 쓴다. 없으면 새로 만들면 되는 자리다.
    prevSlot = {} if isNew else slotAt(origin.get("ALL_PROP"), Component)
    prevProp = prevSlot.get(modelPropName) if isinstance(prevSlot, dict) else None
    propData = copy.deepcopy(prevProp) if isinstance(prevProp, dict) else {}
    newValue["ALL_PROP"][Component] = {modelPropName : propData}

    if tableType == "1" or tableType == "2":
      self.writeSkeleton(Component, tableType, propData, DATA, modelPropName)
    else :
      newValue["MULT_DATA"] = [ {"DISP" : pnd[1], "FORCE" : pnd[0] } for pnd in DATA.get("PnD_Data")]
      self.writeMultilinear(propData, DATA)

    # ALL_SUBPROP(J단)은 EXIST_IJ_PROP[i]가 true일 때만 의미가 있다.
    # 전부 false면 서버가 I단 값으로 채우므로 보내지 않는다.
    # true 인 슬롯이 있으면 J단은 편집 대상이 아니므로 원본을 그대로 둔다.
    if not any(newValue.get("EXIST_IJ_PROP") or []) :
      newValue.pop("ALL_SUBPROP", None)

    return newValue

  def writeSkeleton(self, Component, tableType, propData, DATA, modelPropName):
      """표 DATA -> 서버 prop 구조체. readSkeleton 의 역방향이다.

      **propData 를 제자리에서 고친다.** buildRecord 가 이미
      newValue["ALL_PROP"][Component] 에 꽂아 둔 그 dict 이므로 돌려줄 것이 없다.
      cprops 도 propData["COMPONENTPROPS"] 와 같은 객체다.
      """
      propData["SYMMETRIC"] = DATA.get("SYMMETRIC")
      propData["YIELDSTRENGTHOPT"] = 0
      propData["DEFORMDEFINETYPE"] = 1
      propData["INITSTIFFNESS"] = DATA.get("INITSTIFFNESS")
      propData["PALPHADELTA"] = 1 if tableType == "1" else 0

      # COMPONENTPROPS 는 원본을 기반으로 삼고 관리하는 필드만 덮어쓴다.
      #
      # 통째로 새로 만들면 이 탭이 쓰지 않는 자리가 사라진다. 예를 들어 4절선
      # 힌지를 탭2(P-alpha)로 저장하면 점이 3쌍이라 4번째 슬롯
      # (FRACTUREMOMENT / YIELDROTN4TH ...)을 아무도 쓰지 않는데, 그 자리를
      # 지워 보내면 서버가 초기화되지 않은 메모리를 돌려준다. 그러면 편집이
      # 없어도 원본과 달라 보여 그 행이 매번 재전송된다.
      #
      # 모델이 바뀌면 buildRecord 가 propData 를 빈 dict 로 시작하므로,
      # 여기로 옛 모델의 값이 딸려 오지는 않는다.
      cprops = propData.get("COMPONENTPROPS")
      if not isinstance(cprops, dict) : cprops = {}
      propData["COMPONENTPROPS"] = cprops
      cprops["DEFORMCAPACITY"] = copy.deepcopy(DEFAULT_DEFORM)

      # 데이터 점 기록
      #
      # 축이 세 개다.
      #   isPD    탭1(P-D)이면 변위가 입력, 탭2(P-alpha)면 강성비가 입력
      #   isForce 성분 0~2 는 힘/변위, 3~5 는 모멘트/회전각에 실제 값이 들어간다
      #   slot    절선 슬롯. pointSlots 가 PND 와 절선수로부터 정한다
      #
      # 서버는 힘·모멘트·변위·회전·강성비를 전부 required 로 요구하므로,
      # 그 모드에서 입력이 아닌 자리도 placeholder 로 채워야 한다.
      isPD = tableType == "1"
      dataType = DATA.get("PND") if isPD else DATA.get("PND") + 1
      isForce = Component < 3

      for i, slot in enumerate(pointSlots(DATA.get("PND"), dataType)) :
        point = DATA.get("P_DATA")[i]
        dummyPoint = list(DEFAULT_CRACK if slot == 0 else DEFAULT_FORCE)
        dummyStep = [round(0.1 * (slot + 1), 1), round(0.1 * (slot + 1), 1)]
        step = DATA.get("D_DATA")[i] if isPD else None

        cprops[FORCE_FIELDS[slot]]  = point if isForce else dummyPoint
        cprops[MOMENT_FIELDS[slot]] = dummyPoint if isForce else point

        cprops[DISP_FIELDS[slot]] = step if (isPD and isForce) else dummyStep
        cprops[ROTN_FIELDS[slot]] = step if (isPD and not isForce) else dummyStep

      # 강성비는 점보다 한 칸 적다. 탭2 는 A_DATA 가 입력이고, 탭1 은 입력이
      # 아니지만 STIFFRATIO2ND 가 서버 required 라 placeholder 로 채운다.
      for i, slot in enumerate(stiffSlots(dataType)) :
        cprops[STIFF_FIELDS[slot]] = DATA.get("A_DATA")[i] if not isPD else list(DEFAULT_STIFFRATIO)

      # others
      # FE는 BETA/ALPA/GAMMA/INIT_GAP을 모델과 무관하게 항상 실어 보내므로
      # (특히 INIT_GAP은 값이 비어도 [None, None] 이라 truthy) 여기서 걸러낸다.
      extraField = ALL_History_Prop_ExtraField.get(modelPropName, ())
      initGap = DATA.get("INIT_GAP") or [None, None]
      for field, value in (
        ("UNLOADSTIFFCALCEXPO", DATA.get("BETA")),
        ("UNLOADSTIFFREDUFAC", DATA.get("ALPA")),
        ("PINCHINGRULEFAC", DATA.get("GAMMA")),
        ("INITGAPPOSITIVE", initGap[0]),
        ("INITGAPNEGATIVE", initGap[1]),
      ):
        if field in extraField and value is not None:
          propData[field] = value

      # required 보정
      # 위 루프는 데이터 점이 있는 슬롯만 채운다. 그 밖의 자리에도 DTO 가 required 로
      # 요구하는 필드가 있어, 비워 두면 서버가 'Wrong Field' 로 거부한다.
      # 실제 모델의 레코드도 이 자리에 placeholder([1,1] / 0.1*n)를 담고 있으므로
      # 같은 값으로 채운다. 이미 실제 값이 들어간 필드는 건드리지 않는다.
      for field, fill in (
        ("YIELDFORCE",     DEFAULT_FORCE),
        ("YIELDMOMENT",    DEFAULT_FORCE),
        ("ULTIMATEFORCE",  DEFAULT_FORCE),
        ("ULTIMATEMOMENT", DEFAULT_FORCE),
        ("YIELDDISP2ND",   DEFAULT_DISP_2ND),
        ("YIELDROTN2ND",   DEFAULT_DISP_2ND),
        ("YIELDDISP3RD",   DEFAULT_DISP_3RD),
        ("YIELDROTN3RD",   DEFAULT_DISP_3RD),
        ("STIFFRATIO2ND",  DEFAULT_STIFFRATIO),
      ):
        if field not in cprops :
          cprops[field] = list(fill)

  def writeMultilinear(self, propData, DATA):
      """표 DATA -> MULTLIN prop 구조체. writeSkeleton 과 마찬가지로 제자리에서 고친다."""
      propData["nMultiType"] = 0
      propData["nDeformDefineType"] = 1
      propData["dInitStiffP"] = 1
      propData["dInitStiffN"] = 1
      propData["dHysParam_Alpha1"] = DATA.get("dHysParam_Alpha1")
      propData["dHysParam_Alpha2"] = DATA.get("dHysParam_Alpha2")
      propData["dHysParam_Beta1"] = DATA.get("dHysParam_Beta1")
      propData["dHysParam_Beta2"] = DATA.get("dHysParam_Beta2")
      propData["dHysParam_Eta"] = DATA.get("dHysParam_Eta")
      propData["nType"] = DATA.get("nType")
      propData["dScaleF_Displ"] = 1
      propData["dScaleF_Force"] = 1
      propData["DEFORMCAPACITY"] = DEFAULT_DEFORM

# 상수와 신규 레코드 템플릿은 py_template.py 에 있다.
# (TEMPLATE 리터럴만 500줄이 넘어 로직을 가렸다)
