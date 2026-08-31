### do not delete this import scripts ###
import json
from py_base import set_g_values, get_g_values, requests_json, MidasAPI, Product
from py_api_db import *  ## get all function
### do not delete this import scripts ###

"""<py-script> 진입점.

py-script 는 **전역 네임스페이스에서 실행**되므로, 여기서 import 한 이름이 곧
`pyscript.interpreter.globals` 다. TS 브리지(utils_pyscript)가 `IEHP` 를,
브라우저 콘솔이 `LOADED` / `STIFFNESS` 를 여기서 집어 간다.

  py_slots.py      레코드 모양 상수와 슬롯 규칙
  py_loaded.py     Loaded  - 마지막 조회 결과
  py_stiffness.py  InitStiffness - 탭2 x축용 초기강성 K0
  py_iehp.py       IEHP - 조회/저장 본체
"""

from py_slots import (HINGE_TYPE, COMPONENT_COUNT,
                      ALL_Histroy_PND, ALL_History_Prop_Name, ALL_History_Prop_ExtraField,
                      FORCE_FIELDS, MOMENT_FIELDS, DISP_FIELDS, ROTN_FIELDS, STIFF_FIELDS,
                      pointSlots, stiffSlots, pointFields, slotAt)
from py_loaded import Loaded, LOADED
from py_stiffness import InitStiffness, STIFFNESS
from py_iehp import IEHP
