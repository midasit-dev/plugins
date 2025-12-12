/**
 * @fileoverview 말뚝 기본 치수 관리를 위한 커스텀 훅
 * 말뚝 기본 치수 데이터의 테이블 표시와 편집 기능을 담당합니다.
 */

import { ChangeEvent, useCallback } from "react";

import { usePileDomain } from "./usePileDomain";
import { PileBasicDim } from "../../types/typePileDomain";

type InputChangeEvent = ChangeEvent<HTMLInputElement>;

export const usePileBasicDim = () => {
  const { basicDim, updateBasicDim } = usePileDomain();

  // 입력값 변경 핸들러
  const handleChange = useCallback(
    (fieldName: keyof PileBasicDim) => (e: InputChangeEvent) => {
      const value = e.target.value;
      const numericValue = Number(value);

      updateBasicDim({
        [fieldName]: numericValue,
      });
    },
    [updateBasicDim]
  );

  return {
    values: basicDim,
    handleChange,
  };
};
