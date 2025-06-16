import { useRecoilState, useRecoilValue } from "recoil";
import { pileSectionState, pileInitSetState } from "../states";
import { useEffect, useMemo } from "react";
import { PileInitSet } from "../states/statePileInitSet";

interface PileSection {
  checked: boolean;
  length: number;
}

export const usePileInitSet = () => {
  const [pileInitSet, setPileInitSet] = useRecoilState(pileInitSetState);
  const pileSection = useRecoilValue(pileSectionState);

  const handleChange =
    (field: keyof PileInitSet) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const value = e.target.value;

      // 숫자 필드인 경우 숫자로 변환
      if (field === "topLevel" || field === "pileLength") {
        const numValue = parseFloat(value);
        if (!isNaN(numValue)) {
          setPileInitSet((prev) => ({
            ...prev,
            [field]: numValue,
          }));
        }
      } else {
        setPileInitSet((prev) => ({
          ...prev,
          [field]: value,
        }));
      }
    };

  const totalLength = useMemo(() => {
    return pileSection
      .filter((pile: PileSection) => pile.checked)
      .reduce((acc, curr) => acc + curr.length, 0);
  }, [pileSection]);

  useEffect(() => {
    setPileInitSet((prev) => ({
      ...prev,
      pileLength: totalLength,
    }));
  }, [totalLength]);

  return {
    values: pileInitSet,
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
