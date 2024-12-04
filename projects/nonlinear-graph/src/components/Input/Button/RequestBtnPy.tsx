import { Button, GuideBox } from "@midasit-dev/moaui";
import { dbRead } from "../../../utils_pyscript";
import { useTranslation } from "react-i18next";

interface Props {
  props: {
    ElementValue: number;
    ComponentValue: number;
  };
  propFuncs: {
    Get_UNIT: React.EffectCallback;
    setGetValue: React.Dispatch<React.SetStateAction<Array<object>>>;
  };
}

const RequestBtnPy: React.FC<Props> = ({ props, propFuncs }) => {
  const { ElementValue, ComponentValue } = props;
  const { Get_UNIT, setGetValue } = propFuncs;

  const { t: translate, i18n: internationalization } = useTranslation();
  const requestBtn = translate("requestBtn");
  const onClick = () => {
    setGetValue([]);
    if (pyscript && pyscript.interpreter) {
      Get_UNIT();
      Get_IEHP();
    }
  };

  const Get_IEHP = () => {
    const getData = dbRead("IEHP");
    const aGetDatatKey = Object.keys(getData);
    aGetDatatKey.forEach((key) => {
      const setData = findDataFunc(ElementValue, ComponentValue, getData[key]);
      if (Object.keys(setData).length !== 0) {
        setGetValue((GetValue) => [...GetValue, setData]);
      }
    });
  };

  return (
    <GuideBox horLeft margin={2}>
      <Button onClick={onClick}>{requestBtn}</Button>
    </GuideBox>
  );
};

const findDataFunc = (
  ElementValue: number,
  ComponentValue: number,
  rawData: any
) => {
  let hingeType = "";
  switch (ElementValue) {
    case 1: {
      hingeType = "DIST";
      break;
    }
    case 2: {
      hingeType = "TRUSS";
      break;
    }
    case 3: {
      hingeType = "SPR";
      break;
    }
  }

  if (rawData.DEFINITION !== "SKEL") return {};
  if (rawData.HINGE_TYPE !== hingeType) return {};
  if (rawData.INTERACTION_TYPE !== "NONE") return {};
  if (!rawData.COMPONENT_DIR[ComponentValue - 1]) return {};

  // MATERIAL_TYPE -> RC or STEEL
  // HYSTERESIS_MODEL -> 데이터 유형
  // 데이터 유형 내부 SYMMETRIC -> 1 일경우 값 있음???
  // 데이터 유형 내부 유형 YIELDSTRENGTHOPT -> 0 일경우 유저 입력
  // 데이터 유형 내부 PALPHADELTA -> 탭 유형 0, 1 //
  const dataObject = rawData.ALL_PROP[ComponentValue - 1];
  const NAME = Object.keys(dataObject)[0];
  const setData = {
    NAME: rawData.NAME,
    MATERIAL_TYPE: rawData.MATERIAL_TYPE,
    HISTORY_TYPE: NAME,
    HISTORY_MODEL: rawData.HYSTERESIS_MODEL[ComponentValue - 1],
    DATA: dataObject[NAME],
  };

  if (NAME === "MULTLIN") {
    // MULTLIN 안에  DEFORMCAPACITY -> 레벨 값
    // MULTLIN 안에  nType -> 양방향인지 ... + or - 인지
    // MULTLIN 안에 nDeformDefineType ->  D1 or D2
    return { "3": setData };
  } else {
    if (dataObject[NAME].YIELDSTRENGTHOPT !== 0) return {};

    switch (dataObject[NAME].PALPHADELTA) {
      case 0:
        return { "1": setData };
      case 1:
        return { "2": setData };
    }
  }
  return {};
};

export default RequestBtnPy;
