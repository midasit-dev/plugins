# -*- coding: utf-8 -*-
"""IEHP 레코드의 모양에 관한 상수와 슬롯 규칙.

이력모델 코드에서 절선 수와 prop 구조체 이름을 얻고, 데이터 점이 COMPONENTPROPS
의 몇 번째 슬롯에 들어가는지를 정한다. **읽기와 쓰기가 같은 규칙을 써야** 왕복이
맞으므로 pointSlots / stiffSlots 한 곳에만 둔다.
"""
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

