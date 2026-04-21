/**
 * @fileoverview 메인 계산기
 * @description
 * 계산 버튼 클릭 시:
 *   1) 지층 / 말뚝 데이터 유효성 검사
 *   2) v2 도메인 데이터 → py_main.py 호환 형식으로 변환 (말뚝별 topLevel 주입)
 *   3) Beta / AlphaHTheta / Kvalue / Kv / Matrix 순차 실행
 *   4) 결과를 Recoil 상태(pileSpringCalcResultState)에 저장
 */

import { useState } from "react";
import { Button } from "@midasit-dev/moaui";
import { useTranslation } from "react-i18next";
import { useRecoilValue, useSetRecoilState } from "recoil";

import { MAIN_CALCULATOR } from "../../constants/common/translations";
import { useNotification } from "../../hooks/common/useNotification";
import { pileDomainState } from "../../states/statePileDomain";
import { soilDomainState } from "../../states/stateSoilDomain";
import { pileSpringCalcResultState } from "../../states/stateCalcResult";
import { runPileSpringCalculation } from "../../utils/calculators/pileSpringCalculator";

const MainCalculation = () => {
  const { t } = useTranslation();
  const { showNotification } = useNotification();

  const pileDomain = useRecoilValue(pileDomainState);
  const soilDomain = useRecoilValue(soilDomainState);
  const setCalcResult = useSetRecoilState(pileSpringCalcResultState);
  const [isRunning, setIsRunning] = useState(false);

  // 계산 가능 여부 확인: 지층 필수값(ED, Vsi), 말뚝 존재 여부
  const validate = (): boolean => {
    if (pileDomain.pileDataList.length === 0) {
      showNotification(MAIN_CALCULATOR.NO_PILE_ERROR, "error");
      return false;
    }
    const hasInvalidLayer = soilDomain.soilLayers.some(
      (layer) => Number(layer.ED) === 0 || Number(layer.Vsi) === 0
    );
    if (hasInvalidLayer) {
      showNotification(MAIN_CALCULATOR.SOIL_DATA_ERROR, "error");
      return false;
    }
    return true;
  };

  const isPyscriptReady = (): boolean => {
    try {
      return typeof pyscript !== "undefined" && !!pyscript?.interpreter;
    } catch {
      return false;
    }
  };

  const handleCalculation = () => {
    if (isRunning) return;
    if (!validate()) return;
    if (!isPyscriptReady()) {
      showNotification(MAIN_CALCULATOR.PYSCRIPT_NOT_READY_ERROR, "warning");
      return;
    }

    setIsRunning(true);
    // 파이썬 호출은 동기 경로(pyscript interpreter 사용)지만 UI blocking 방지를 위해 microtask로 분리
    Promise.resolve()
      .then(() => {
        const result = runPileSpringCalculation({
          pileDataList: pileDomain.pileDataList,
          pileBasicDim: pileDomain.basicDim,
          soilBasic: soilDomain.basic,
          soilLayers: soilDomain.soilLayers,
        });
        setCalcResult(result);
        showNotification(MAIN_CALCULATOR.SUCCESS_CALCULATION, "success");
      })
      .catch((error) => {
        console.error("[MainCalculator] calculation failed", error);
        showNotification(MAIN_CALCULATOR.FAIL_CALCULATION, "error");
      })
      .finally(() => {
        setIsRunning(false);
      });
  };

  return (
    <Button
      variant="contained"
      onClick={handleCalculation}
      disabled={isRunning}
    >
      {t(MAIN_CALCULATOR.CALCULATE_BUTTON)}
    </Button>
  );
};

export default MainCalculation;
