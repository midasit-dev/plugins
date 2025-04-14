import { useRecoilState, useRecoilValue } from "recoil";
import {
  PileName,
  PileLength,
  HeadCondition,
  TopLevel,
  ConstructionMethod,
  BottomCondition,
  pileSectionState,
} from "../states";
import { useEffect } from "react";

export const usePileInitSet = () => {
  // Recoil states
  const [nameValue, setNameValue] = useRecoilState(PileName);
  const [lengthValue, setLengthValue] = useRecoilState(PileLength);
  const [headValue, setHeadValue] = useRecoilState(HeadCondition);
  const [topLevelValue, setTopLevelValue] = useRecoilState(TopLevel);
  const [constructionValue, setConstructionValue] =
    useRecoilState(ConstructionMethod);
  const [bottomValue, setBottomValue] = useRecoilState(BottomCondition);
  const pileSection = useRecoilValue(pileSectionState);

  // Event handlers
  const handleNameChange = (e: any) => {
    setNameValue(e.target.value);
  };

  // const handleLengthChange = (e: any) => {
  //   setLengthValue(e.target.value);
  // };

  const handleHeadConditionChange = (e: any) => {
    setHeadValue(e.target.value);
  };

  const handleTopLevelChange = (e: any) => {
    setTopLevelValue(e.target.value);
  };

  const handleConstructionMethodChange = (e: any) => {
    setConstructionValue(e.target.value);
  };

  const handleBottomConditionChange = (e: any) => {
    setBottomValue(e.target.value);
  };

  useEffect(() => {
    // checked 가 true인 Pile Length의 모든 합을 setLengthValue에 저장
    const totalLength = pileSection
      .filter((pile) => pile.checked)
      .reduce((acc, curr) => acc + parseFloat(curr.length), 0);
    setLengthValue(totalLength);
  }, [pileSection, setLengthValue]);

  return {
    values: {
      PileName: nameValue,
      PileLength: lengthValue,
      HeadCondition: headValue,
      TopLevel: topLevelValue,
      ConstructionMethod: constructionValue,
      BottomCondition: bottomValue,
    },
    handlers: {
      handleNameChange,
      // handleLengthChange,
      handleHeadConditionChange,
      handleTopLevelChange,
      handleConstructionMethodChange,
      handleBottomConditionChange,
    },
  };
};
