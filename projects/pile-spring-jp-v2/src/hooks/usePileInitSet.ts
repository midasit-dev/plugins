import { useRecoilState, useRecoilValue } from "recoil";
import { pileSectionState, pileInitSetState } from "../states";
import { useEffect } from "react";

export const usePileInitSet = () => {
  const [pileInitSet, setPileInitSet] = useRecoilState(pileInitSetState);
  const pileSection = useRecoilValue(pileSectionState);

  const handleChange =
    (field: keyof typeof pileInitSet) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setPileInitSet((prev) => ({
        ...prev,
        [field]: e.target.value,
      }));
    };

  useEffect(() => {
    const totalLength = pileSection
      .filter((pile) => pile.checked)
      .reduce((acc, curr) => acc + curr.length, 0);

    setPileInitSet((prev) => ({
      ...prev,
      pileLength: totalLength,
    }));
  }, [pileSection]);

  return {
    values: pileInitSet,
    handlers: {
      handleNameChange: handleChange("pileName"),
      handleHeadConditionChange: handleChange("headCondition"),
      handleTopLevelChange: handleChange("topLevel"),
      handleConstructionMethodChange: handleChange("constructionMethod"),
      handleBottomConditionChange: handleChange("bottomCondition"),
    },
  };
};
