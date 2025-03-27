import { useRecoilState } from "recoil";
import {
  PileName,
  PileLength,
  HeadCondition,
  TopLevel,
  ConstructionMethod,
  BottomCondition,
} from "../states";

export const usePileInitSet = () => {
  // Recoil states
  const [nameValue, setNameValue] = useRecoilState(PileName);
  const [lengthValue, setLengthValue] = useRecoilState(PileLength);
  const [headValue, setHeadValue] = useRecoilState(HeadCondition);
  const [topLevelValue, setTopLevelValue] = useRecoilState(TopLevel);
  const [constructionValue, setConstructionValue] =
    useRecoilState(ConstructionMethod);
  const [bottomValue, setBottomValue] = useRecoilState(BottomCondition);

  // Event handlers
  const handleNameChange = (e: any) => {
    setNameValue(e.target.value);
  };

  const handleLengthChange = (e: any) => {
    setLengthValue(e.target.value);
  };

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
      handleLengthChange,
      handleHeadConditionChange,
      handleTopLevelChange,
      handleConstructionMethodChange,
      handleBottomConditionChange,
    },
  };
};
