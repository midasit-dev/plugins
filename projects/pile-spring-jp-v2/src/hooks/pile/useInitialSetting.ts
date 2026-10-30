/**
 * @fileoverview 말뚝 기본 테이블 관리를 위한 커스텀 훅
 * 말뚝 기본 데이터의 테이블 표시와 편집 기능을 담당합니다.
 */

import { useEffect, useMemo } from "react";

import { usePileDomain } from "./usePileDomain";
import { PileInitSet } from "../../types/typePileDomain";
import { calcTotalPileLength } from "../../utils/calculators/pileLength";

export const usePileInitSet = () => {
  const { currentPile, updateCurrentPileInitSet } = usePileDomain();

  // 필드 변경 핸들러
  const handleChange =
    (field: keyof PileInitSet) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const value = e.target.value;

      // 숫자 필드인 경우 숫자로 변환
      if (field === "topLevel" || field === "pileLength") {
        const numValue = parseFloat(value);
        if (!isNaN(numValue)) {
          updateCurrentPileInitSet({ [field]: numValue });
        }
      } else {
        updateCurrentPileInitSet({ [field]: value });
      }
    };

  // 말뚝 전체 길이 계산
  const totalLength = useMemo(
    () => calcTotalPileLength(currentPile.sections),
    [currentPile.sections]
  );

  // 말뚝 전체 길이 업데이트 (저장된 값이 어긋나 있어도 맞춰지도록 현재 값과 비교)
  useEffect(() => {
    if (currentPile.initSet.pileLength !== totalLength) {
      updateCurrentPileInitSet({ pileLength: totalLength });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalLength, currentPile.initSet.pileLength]);

  return {
    values: currentPile.initSet,
    handlers: {
      handleNameChange: handleChange("pileName"),
      handleHeadConditionChange: handleChange("headCondition"),
      handleTopLevelChange: handleChange("topLevel"),
      handleConstructionMethodChange: handleChange("constructionMethod"),
      handleBottomConditionChange: handleChange("bottomCondition"),
      handlePileLengthChange: handleChange("pileLength"),
    },
  };
};
