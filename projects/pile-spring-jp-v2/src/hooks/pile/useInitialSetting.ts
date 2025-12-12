/**
 * @fileoverview 말뚝 기본 테이블 관리를 위한 커스텀 훅
 * 말뚝 기본 데이터의 테이블 표시와 편집 기능을 담당합니다.
 */

import { useEffect, useMemo } from "react";

import { usePileDomain } from "./usePileDomain";
import { PileInitSet } from "../../types/typePileDomain";

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
  const totalLength = useMemo(() => {
    return currentPile.sections
      .filter((section) => section.checked)
      .reduce((acc, curr) => acc + curr.length, 0);
  }, [currentPile.sections]);

  // 말뚝 전체 길이 업데이트
  useEffect(() => {
    updateCurrentPileInitSet({ pileLength: totalLength });
  }, [totalLength]);

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
