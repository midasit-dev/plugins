import { useRecoilState, useRecoilValue } from "recoil";
import { pileSectionState, pileInitSetState } from "../states";
import { useEffect } from "react";

export const usePileInitSet = () => {
  const [pileInitSet, setPileInitSet] = useRecoilState(pileInitSetState);
  const pileSection = useRecoilValue(pileSectionState);

  // Event handlers
  const handleNameChange = (e: any) => {
    setPileInitSet({ ...pileInitSet, pileName: e.target.value });
  };

  const handleHeadConditionChange = (e: any) => {
    setPileInitSet({ ...pileInitSet, headCondition: e.target.value });
  };

  const handleTopLevelChange = (e: any) => {
    setPileInitSet({ ...pileInitSet, topLevel: e.target.value });
  };

  const handleConstructionMethodChange = (e: any) => {
    setPileInitSet({ ...pileInitSet, constructionMethod: e.target.value });
  };

  const handleBottomConditionChange = (e: any) => {
    setPileInitSet({ ...pileInitSet, bottomCondition: e.target.value });
  };

  // checked 가 true인 Pile Length의 모든 합을 setLengthValue에 저장
  useEffect(() => {
    const totalLength = pileSection
      .filter((pile) => pile.checked)
      .reduce((acc, curr) => acc + curr.length, 0);
    setPileInitSet({ ...pileInitSet, pileLength: totalLength });
  }, [pileSection]);

  return {
    values: {
      PileName: pileInitSet.pileName,
      PileLength: pileInitSet.pileLength,
      HeadCondition: pileInitSet.headCondition,
      TopLevel: pileInitSet.topLevel,
      ConstructionMethod: pileInitSet.constructionMethod,
      BottomCondition: pileInitSet.bottomCondition,
    },
    handlers: {
      handleNameChange,
      handleHeadConditionChange,
      handleTopLevelChange,
      handleConstructionMethodChange,
      handleBottomConditionChange,
    },
  };
};
