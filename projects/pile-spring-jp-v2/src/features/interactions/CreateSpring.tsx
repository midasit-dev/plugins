/**
 * @fileoverview 汎用ばね支持 (Civil NX의 General Spring Support)를 제품에 생성합니다.
 * @description
 * 계산 결과(pileSpringCalcResultState)의 A-매트릭스들을 `importTypeState`에 따라
 * X/Z 축 순서로 조합한 뒤 `dbCreateItem("GSTP", ...)`을 통해 Civil NX 제품에
 * 상시(_N) / 지진시(_S) / 액상화(_SL) / 고유주기(_P) 4종 스프링을 등록합니다.
 */

import { useState } from "react";
import { Button } from "@midasit-dev/moaui";
import { useTranslation } from "react-i18next";
import { useRecoilValue } from "recoil";

import { CREATE_SPRING } from "../../constants/common/translations";
import { useNotification } from "../../hooks/common/useNotification";
import { projectData, importTypeState } from "../../states/stateCommon";
import { pileSpringCalcResultState } from "../../states/stateCalcResult";
import {
  dbCreateItem,
  dbUpdateItem,
  py_db_get_maxid,
} from "../../utils_pyscript";

// X/Z 매트릭스를 Civil NX 일반스프링 행렬 규약(상삼각 21개)으로 조합
// v1 규약 동일:
//   [Axx_x, Axx_z, Axa_x, Aya_z, Aaa_x, 1e12,
//    0, Axy_x, 0, Axa_x,
//    0, Axy_z, -Axa_z, 0, 0, Aya_z, -Aya_x,
//    0, 0, 0, 0]
// 여기서 xResult[i]와 zResult[i]가 각각 X/Z 방향 결과
// XResult, ZResult 는 [Axx, Axy, Axa, Ayy, Aya, Aaa]
const combineMatrix = (
  xResult: number[],
  zResult: number[]
): (number | string)[] => {
  return [
    xResult[0],
    zResult[0],
    xResult[3],
    zResult[5],
    xResult[5],
    1000000000000,
    0,
    xResult[1],
    0,
    xResult[2],
    0,
    zResult[1],
    -zResult[2],
    0,
    0,
    zResult[4],
    -xResult[4],
    0,
    0,
    0,
    0,
  ];
};

const SPRING_JSON_TEMPLATE = {
  MASS: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  DAMPING: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  OPT_STIFFNESS: true,
  OPT_MASS: false,
  OPT_DAMPING: false,
};

const UNIT_JSON = {
  FORCE: "KN",
  DIST: "M",
  HEAT: "KCAL",
  TEMPER: "C",
};

const isPyscriptReady = (): boolean => {
  try {
    return typeof pyscript !== "undefined" && !!pyscript?.interpreter;
  } catch {
    return false;
  }
};

const CreateSpring = () => {
  const { t } = useTranslation();
  const { showNotification } = useNotification();

  const project = useRecoilValue(projectData);
  const importType = useRecoilValue(importTypeState);
  const calcResult = useRecoilValue(pileSpringCalcResultState);
  const [loading, setLoading] = useState(false);

  const handleCreate = () => {
    if (loading) return;
    if (!calcResult.isCalculated) {
      showNotification(CREATE_SPRING.NOT_CALCULATED_ERROR, "warning");
      return;
    }
    if (!isPyscriptReady()) {
      showNotification(CREATE_SPRING.PYSCRIPT_NOT_READY_ERROR, "warning");
      return;
    }

    setLoading(true);
    try {
      const {
        matrixNormalX,
        matrixNormalZ,
        matrixSeismicX,
        matrixSeismicZ,
        matrixSeismicLiqX,
        matrixSeismicLiqZ,
        matrixPeriodX,
        matrixPeriodZ,
      } = calcResult;

      // Type1: X가 주축, Z가 부축 / Type2: 순서 반대
      const isType1 = importType === "Type1";

      const normalMatrix = isType1
        ? combineMatrix(matrixNormalX, matrixNormalZ)
        : combineMatrix(matrixNormalZ, matrixNormalX);
      const seismicMatrix = isType1
        ? combineMatrix(matrixSeismicX, matrixSeismicZ)
        : combineMatrix(matrixSeismicZ, matrixSeismicX);
      const seismicLiqMatrix = isType1
        ? combineMatrix(matrixSeismicLiqX, matrixSeismicLiqZ)
        : combineMatrix(matrixSeismicLiqZ, matrixSeismicLiqX);
      const periodMatrix = isType1
        ? combineMatrix(matrixPeriodX, matrixPeriodZ)
        : combineMatrix(matrixPeriodZ, matrixPeriodX);

      const baseName = project.projectName || "Pile_Spring";

      const normalJson = { NAME: `${baseName}_N`, SPRING: normalMatrix, ...SPRING_JSON_TEMPLATE };
      const seismicJson = { NAME: `${baseName}_S`, SPRING: seismicMatrix, ...SPRING_JSON_TEMPLATE };
      const seismicLiqJson = { NAME: `${baseName}_SL`, SPRING: seismicLiqMatrix, ...SPRING_JSON_TEMPLATE };
      const periodJson = { NAME: `${baseName}_P`, SPRING: periodMatrix, ...SPRING_JSON_TEMPLATE };

      // 단위계 설정 (KN, m)
      dbUpdateItem("UNIT", "1", UNIT_JSON);

      const maxId: number = py_db_get_maxid("GSTP");
      // v1 동작: 액상화 상태와 무관하게 항상 4개 (_N, _S, _SL, _P) 모두 생성
      const r1 = dbCreateItem("GSTP", String(maxId + 1), normalJson);
      const r2 = dbCreateItem("GSTP", String(maxId + 2), seismicJson);
      const r3 = dbCreateItem("GSTP", String(maxId + 3), seismicLiqJson);
      const r4 = dbCreateItem("GSTP", String(maxId + 4), periodJson);

      const allSuccess = [r1, r2, r3, r4].every((res) =>
        JSON.stringify(res).includes("GSTP")
      );

      if (allSuccess) {
        showNotification(CREATE_SPRING.SUCCESS_CREATE, "success");
      } else {
        showNotification(CREATE_SPRING.FAIL_CREATE, "error");
      }
    } catch (error) {
      console.error("[CreateSpring] failed", error);
      showNotification(CREATE_SPRING.FAIL_CREATE, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button variant="contained" onClick={handleCreate} disabled={loading}>
      {t(CREATE_SPRING.CREATE_SPRING_BUTTON)}
    </Button>
  );
};

export default CreateSpring;
