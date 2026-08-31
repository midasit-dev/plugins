### do not delete this import scripts ###
import json
from py_base import requests_json, MidasAPI, Product
from py_api_db import *  ## get all function
from py_slots import slotAt
### do not delete this import scripts ###


class InitStiffness :
  """비탄성 힌지의 초기강성 K0 판정.

  탭2(P-alpha)의 x 축은 표에 없는 값이다. alpha 는 **K0 에 대한 비율**이라
  실변위를 그리려면 K0 가 필요하다.

      phi1 = P1 / K0
      phi2 = phi1 + (P2 - P1) / (alpha1 * K0)

  판정 규약은 CIVIL 측 인계서(`IEHP 초기강성 인계서`)를 따른다. 정본은
  `AnalCtrl.cpp:43946` 의 솔버 입력 생성 코드다.

  **JSON 키는 대문자다.** 인계서 본문의 `InitStiffType` 등은 DTO 매크로의 설명
  문자열이고, 응답에 실리는 이름은 매크로의 두 번째 인자
  (`INITSTIFFTYPE` / `INITSTIFFNESS` / `INITSTIFFNESSDIST`)다.

  **슬롯을 값으로 판별하지 않는다.** 쓰이지 않는 K 슬롯에는 이전 값이나
  초기화 기본값 1.0 이 그대로 남는다. 1.0 이 "미설정"을 뜻하지 않으므로
  반드시 INITSTIFFTYPE + HINGE_TYPE 조합으로만 고른다.
  """

  # INITSTIFFTYPE 열거 (IehpPropDlg.cpp 라디오 순서)
  TYPE_6EIL, TYPE_3EIL, TYPE_2EIL = 0, 1, 2
  TYPE_USER = 3
  TYPE_ELASTIC = 4        # E * I - 요소에 묶여 있어 IEHP 만으로는 못 구한다
  TYPE_SKELETON = 5       # 골격곡선에서 산정

  # 요소의 재료·단면·길이가 있어야 하는 타입. IEHP 는 프로퍼티 단위라 알 수 없다.
  ELEMENT_DEPENDENT = (TYPE_6EIL, TYPE_3EIL, TYPE_2EIL, TYPE_ELASTIC)

  # 성분 0~2 는 힘/변위, 3~5 는 모멘트/회전각
  MOMENT_FROM = 3

  # 골격곡선(타입 5) 산정에 쓰는 (힘, 변위) 슬롯.
  #   3절선 계열은 1차 절점(균열점), 2절선 계열은 2차 절점(항복점)을 쓴다.
  #   SLIP 계열은 변위에서 초기 갭을 뺀다.
  SKELETON_SLOTS = {}
  for _m in ("KIN", "ORG", "PKO", "DEG", "TAK", "MTK", "TAKS",
             "ETR", "ETE", "TTE", "MTT", "SRCT") :
    SKELETON_SLOTS[_m] = ("CRACKFORCE", "YIELDDISP1ST",
                          "CRACKMOMENT", "YIELDROTN1ST", False)
  for _m in ("CLO", "NBI", "EBI") :
    SKELETON_SLOTS[_m] = ("YIELDFORCE", "YIELDDISP2ND",
                          "YIELDMOMENT", "YIELDROTN2ND", False)
  for _m in ("SLBI", "SLBT", "SLBC") :
    SKELETON_SLOTS[_m] = ("YIELDFORCE", "YIELDDISP2ND",
                          "YIELDMOMENT", "YIELDROTN2ND", True)
  for _m in ("SLTR", "SLTT", "SLTC") :
    SKELETON_SLOTS[_m] = ("CRACKFORCE", "YIELDDISP1ST",
                          "CRACKMOMENT", "YIELDROTN1ST", True)
  del _m

  # 인장 전용은 (-) 갭을, 압축 전용은 (+) 갭을 0 으로 둔다.
  NO_MINUS_GAP = ("SLBT", "SLTT")
  NO_PLUS_GAP = ("SLBC", "SLTC")

  # ---------------------------------------------------------------- 판정

  def resolve(self, prop, hingeType, component, historyModel) :
    """K0 를 [정(+), 부(-)] 로 돌려준다. 못 구하면 (None, 사유).

    인계서 2장의 순서를 그대로 따른다. **위에서부터 먼저 맞는 것 하나만** 쓴다.
    """
    if not isinstance(prop, dict) : return None, "NO_PROP"

    stiffType = prop.get("INITSTIFFTYPE")
    if stiffType is None : return None, "NO_INITSTIFFTYPE"

    # 1-2. 요소 의존 - 솔버가 계산하므로 IEHP 에 값이 존재한 적이 없다.
    if stiffType in self.ELEMENT_DEPENDENT :
      return None, "ELEMENT_DEPENDENT_%s" % stiffType

    # 3. 골격곡선. 분모 가드를 통과할 때만 쓰고, 아니면 아래 슬롯 규칙으로 폴백한다.
    if stiffType == self.TYPE_SKELETON :
      values = self.skeletonK0(prop, component, historyModel)
      if values is not None : return values, "SKELETON"

    # 4 (P-Delta 입력 모드)는 여기 없다. 그 모드의 K0 는 CIVIL 이 (힘, 변위)에서
    #   역산해 `INITSTIFFP` / `INITSTIFFN` 에 넣어 두던 값인데, 파생값이라 API 에서
    #   제거됐다. 애초에 이 함수는 `PALPHADELTA == 0`(탭2)인 행에서만 불리고
    #   (`py_iehp.toTableRow`), 탭1 은 D_DATA 가 이미 실변위라 K0 가 필요 없다.

    # 5-6. 분포 힌지는 전용 슬롯을, 그 밖은 공용 슬롯을 쓴다.
    #      HINGE_TYPE 이 아예 없을 수 있다 (Point Spring). 없으면 DIST 가 아니다.
    isDist = hingeType == "DIST"
    value = prop.get("INITSTIFFNESSDIST") if isDist else prop.get("INITSTIFFNESS")
    if not self.isPositive(value) :
      return None, "NO_INITSTIFFNESS_DIST" if isDist else "NO_INITSTIFFNESS"
    return [float(value), float(value)], "USER_DIST" if isDist else "USER"

  # 표에서 고를 수 있는 초기강성 타입.
  #

  def userSlot(self, hingeType) :
    """사용자 지정 초기강성이 들어가는 슬롯 이름.

    **힌지 타입만으로 정해진다.** INITSTIFFTYPE 과 무관한 이유는, 표에서 타입을
    User 로 바꾸면 그 슬롯에 값을 써야 하기 때문이다 - 읽을 당시의 타입으로
    슬롯을 정해 두면 타입을 바꾼 행에 쓸 자리가 없어진다.

    반대쪽 슬롯에는 이전 힌지 타입에서 쓰던 값이 남아 있으므로(인계서 6장)
    반드시 이쪽에만 써야 한다.
    """
    return "INITSTIFFNESSDIST" if hingeType == "DIST" else "INITSTIFFNESS"

  # ------------------------------------------------------------ 골격곡선

  def skeletonK0(self, prop, component, historyModel) :
    """타입 5 의 K0 = 기준 하중 / 기준 변위. 분모가 0 이하면 None (폴백)."""
    slots = self.SKELETON_SLOTS.get(historyModel)
    if slots is None : return None
    forceField, dispField, momentField, rotnField, useGap = slots

    cprops = prop.get("COMPONENTPROPS")
    if not isinstance(cprops, dict) : return None

    isForce = component < self.MOMENT_FROM
    force = cprops.get(forceField if isForce else momentField)
    disp = cprops.get(dispField if isForce else rotnField)

    gaps = self.slipGaps(prop, historyModel) if useGap else (0.0, 0.0)

    out = []
    for side in (0, 1) :
      numerator = slotAt(force, side)
      denominator = slotAt(disp, side)
      if not isinstance(numerator, (int, float)) : return None
      if not isinstance(denominator, (int, float)) : return None
      denominator = denominator - gaps[side]
      # 본체도 분모가 > 0 일 때만 이 식을 쓴다. 아니면 슬롯 규칙으로 폴백한다.
      if denominator <= 0 : return None
      out.append(float(numerator) / denominator)
    return out

  def slipGaps(self, prop, historyModel) :
    """SLIP 계열의 [정(+), 부(-)] 초기 갭.

    인장 전용(SLBT/SLTT)은 (-) 를, 압축 전용(SLBC/SLTC)은 (+) 를 0 으로 둔다.
    """
    plus = prop.get("INITGAPPOSITIVE")
    minus = prop.get("INITGAPNEGATIVE")
    plus = float(plus) if isinstance(plus, (int, float)) else 0.0
    minus = float(minus) if isinstance(minus, (int, float)) else 0.0
    if historyModel in self.NO_PLUS_GAP : plus = 0.0
    if historyModel in self.NO_MINUS_GAP : minus = 0.0
    return (plus, minus)

  @staticmethod
  def isPositive(value) :
    return isinstance(value, (int, float)) and value > 0


  # -------------------------------------------- 타입 4 (Elastic, 요소 의존)
  #
  # K0 = E * I. IEHP 는 프로퍼티 단위라 요소를 모르므로 표를 네 개 더 읽어야 한다.
  # 조회가 1초에서 3~5초로 늘어나서, **화면에 타입 4 가 하나라도 있을 때만** 읽는다.

  # 성분 -> 단면 2차모멘트 이름 (본체: j==4 ? Ryy : Rzz)
  INERTIA_OF_COMPONENT = {4: "Iyy", 5: "Izz"}

  def resetElements(self) :
    self.elementsOf = {}   # IEHP NAME -> [요소번호]
    self.elements = {}     # 요소번호 -> {MATL, SECT}
    self.elastOf = {}      # 재료번호 -> E
    self.inertiaOf = {}    # 단면번호 -> {"Iyy": ..., "Izz": ...}
    self.elementsLoaded = False
    self.elementsError = None

  async def loadElements(self) :
    """K0 = E*I 계산에 필요한 표를 한 번씩 읽어 색인한다.

    실패해도 예외를 올리지 않는다. K0 는 있으면 좋은 값이지 조회의 전제가 아니라,
    여기서 죽으면 그래프가 아니라 표 전체를 못 보게 된다.
    """
    if getattr(self, "elementsLoaded", False) : return self
    self.resetElements()
    try :
      self.elementsOf = self.indexAssignments(await py_db_read("IEHG"))
      self.elements   = self.indexElements(await py_db_read("ELEM"))
      self.elastOf    = self.indexMaterials(await py_db_read("MATL"))
      self.inertiaOf  = self.indexSections(await readSectionProperties())
      self.elementsLoaded = True
    except Exception as err :
      self.elementsError = "%s: %s" % (type(err).__name__, err)
      print("[IEHP] elastic stiffness unavailable - %s" % self.elementsError)
    return self

  @staticmethod
  def indexAssignments(raw) :
    """db/IEHG: 키가 **요소번호**, 값이 힌지 property 이름이다."""
    data = json.loads(raw) if isinstance(raw, str) else raw
    out = {}
    if not isinstance(data, dict) or data.get("error") : return out
    for elementNo, value in data.items() :
      if not isinstance(value, dict) : continue
      name = value.get("PROP_NAME")
      if not name : continue
      try : out.setdefault(name, []).append(int(elementNo))
      except (TypeError, ValueError) : continue
    return out

  @staticmethod
  def indexElements(raw) :
    data = json.loads(raw) if isinstance(raw, str) else raw
    out = {}
    if not isinstance(data, dict) or data.get("error") : return out
    for elementNo, value in data.items() :
      if isinstance(value, dict) :
        out[elementNo] = {"MATL": value.get("MATL"), "SECT": value.get("SECT")}
    return out

  @staticmethod
  def indexMaterials(raw) :
    """db/MATL: E 는 PARAM[0].ELAST. DB 재료(bELAST=false)여도 값은 실려 온다."""
    data = json.loads(raw) if isinstance(raw, str) else raw
    out = {}
    if not isinstance(data, dict) or data.get("error") : return out
    for matlNo, value in data.items() :
      if not isinstance(value, dict) : continue
      param = value.get("PARAM")
      if not isinstance(param, list) or not param : continue
      first = param[0]
      if not isinstance(first, dict) : continue
      elast = first.get("ELAST")
      if isinstance(elast, (int, float)) and elast > 0 : out[matlNo] = float(elast)
    return out

  @staticmethod
  def indexSections(raw) :
    """ope/SECTPROP: 단면별 HEAD/DATA 표. db/SECT 는 형상 치수만 주고 I 가 없다.

    값이 **소수 6자리 문자열**로 와서 아주 작은 단면은 유효숫자가 크게 깎인다.
    """
    data = json.loads(raw) if isinstance(raw, str) else raw
    out = {}
    if not isinstance(data, dict) : return out
    table = data.get("SECTPROP")
    if not isinstance(table, dict) : return out
    for sectNo, value in table.items() :
      if not isinstance(value, dict) : continue
      rows = value.get("DATA")
      if not isinstance(rows, list) : continue
      found = {}
      for row in rows :
        if not isinstance(row, list) or len(row) < 2 : continue
        if row[0] not in ("Iyy", "Izz") : continue
        try : found[row[0]] = float(row[1])
        except (TypeError, ValueError) : continue
      if found : out[sectNo] = found
    return out

  def elasticK0(self, name, component) :
    """타입 4 의 K0 = E * I. 못 구하면 (None, 사유).

    모멘트 성분에만 정의된다 - 본체도 `if(j<4) continue` 로 My/Mz 만 다룬다.
    """
    inertiaName = self.INERTIA_OF_COMPONENT.get(component)
    if inertiaName is None : return None, "NO_INERTIA_FOR_COMPONENT"

    elements = self.elementsOf.get(name) or []
    if not elements : return None, "NO_ELEMENT_ASSIGNED"

    # 한 property 가 여러 요소에 걸리면 요소마다 K0 가 다를 수 있다. 실모델은
    # 1:1 이지만 보장은 없으므로, 값이 갈리면 대표값을 쓰되 사유를 남긴다.
    values = []
    for elementNo in elements :
      element = self.elements.get(str(elementNo))
      if not element : continue
      elast = self.elastOf.get(str(element.get("MATL")))
      inertia = (self.inertiaOf.get(str(element.get("SECT"))) or {}).get(inertiaName)
      if not elast or not inertia : continue
      values.append(elast * inertia)

    if not values : return None, "NO_E_OR_I"
    if len(set(values)) > 1 : return values[0], "ELASTIC_AMBIGUOUS"
    return values[0], "ELASTIC"


async def readSectionProperties() :
  """GET /ope/SECTPROP - 계산된 단면 성능.

  db/SECT 는 형상 치수만 주고 단면 2차모멘트가 없다. py_api_db 의 db_* 래퍼는
  /db/ 전용이라 여기서 직접 부른다.
  """
  api = MidasAPI(Product.CIVIL, "KR")
  return await requests_json.get("%s/ope/SECTPROP" % api.base_url, api.headers)


STIFFNESS = InitStiffness()
STIFFNESS.resetElements()

