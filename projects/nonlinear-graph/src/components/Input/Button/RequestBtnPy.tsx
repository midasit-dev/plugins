import { Button, GuideBox } from "@midasit-dev/moaui";
import { dbRead } from "../../../utils_pyscript";
import { useTranslation } from "react-i18next";
import { useRecoilState, useRecoilValue } from "recoil";
import {
  ElementState,
  ComponentState,
  GetDBState,
  UnitState,
  TableListState,
} from "../../../values/RecoilValue";
import { isEmpty } from "lodash";

const RequestBtnPy = () => {
  const ElementValue = useRecoilValue(ElementState);
  const ComponentValue = useRecoilValue(ComponentState);
  const [GetDB, setGetDB] = useRecoilState(GetDBState);
  const [TableList, setTableList] = useRecoilState(TableListState);
  const [UnitData, setUnitData] = useRecoilState(UnitState);

  const { t: translate, i18n: internationalization } = useTranslation();
  const requestBtn = translate("requestBtn");
  const onClick = () => {
    setGetDB({});
    if (pyscript && pyscript.interpreter) {
      Get_UNIT();
      Get_IEHP();
    }
  };

  const Get_UNIT = async () => {
    try {
      const getData = dbRead("UNIT"); // 데이터베이스에서 데이터 읽기
      setUnitData(getData["1"]);
    } catch (error) {
      console.error("Failed to load UNIT data", error);
    }
  };

  const Get_IEHP = async () => {
    try {
      setTableList({});
      const getData = dbRead("IEHP");
      setGetDB(getData);
      const aGetDatatKey = Object.keys(getData);
      aGetDatatKey.forEach((key) => {
        const setData: any = findDataFunc(
          ElementValue,
          ComponentValue,
          key,
          getData[key]
        );
        if (!isEmpty(setData)) {
          const tableKey = Object.keys(setData)[0];
          setTableList((List: any) => ({
            ...List,
            [tableKey]: List[tableKey]
              ? [...List[tableKey], setData[tableKey]]
              : [setData[tableKey]],
          }));
        }
      });
    } catch (error) {
      console.error("Failed to load IEHP data", error);
    }
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
  key: string,
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

  if (NAME === "MULTLIN") {
    const setData = {
      KEY: key,
      NAME: rawData.NAME,
      MATERIAL_TYPE: rawData.MATERIAL_TYPE == "STEEL" ? "S" : "RS",
      HISTORY_MODEL: rawData.HYSTERESIS_MODEL[ComponentValue - 1],
      DATA: setMULTLINData(dataObject[NAME], rawData?.MULT_DATA),
    };
    // MULTLIN 안에  DEFORMCAPACITY -> 레벨 값
    // MULTLIN 안에  nType -> 양방향인지 ... + or - 인지
    // MULTLIN 안에 nDeformDefineType ->  D1 or D2
    return { "3": setData };
  } else {
    if (dataObject[NAME].YIELDSTRENGTHOPT !== 0) return {};
    const setData = {
      KEY: key,
      NAME: rawData.NAME,
      MATERIAL_TYPE: rawData.MATERIAL_TYPE == "STEEL" ? "S" : "RS",
      HISTORY_MODEL: rawData.HYSTERESIS_MODEL[ComponentValue - 1],
      SYMMETRIC: dataObject[NAME].SYMMETRIC,
      DATA: dataObject[NAME].COMPONENTPROPS,
      BETA: dataObject[NAME]?.UNLOADSTIFFCALCEXPO,
      ALPA: dataObject[NAME]?.UNLOADSTIFFREDUFAC,
      GAMMA: dataObject[NAME]?.PINCHINGRULEFAC,
      INIT_GAP: [
        dataObject[NAME]?.INITGAPPOSITIVE,
        dataObject[NAME]?.INITGAPNEGATIVE,
      ],
    };
    switch (dataObject[NAME].PALPHADELTA) {
      case 0:
        return { "2": setData };
      case 1:
        return { "1": setData };
    }
  }
  return {};
};

const setMULTLINData = (DATA: any, MULT_DATA: []) => {
  let mult_data: any[][];
  if (MULT_DATA !== undefined) {
    mult_data = MULT_DATA.map((value: any) => {
      return [value.DISP, value.FORCE];
    });
  } else mult_data = [[0.0, 0.0]];

  let nType = 0;
  switch (DATA.nType) {
    default:
    case 0:
      nType = 0;
      break;
    case 1:
      nType = 1;
      break;
    case 2:
      nType = 2;
      break;
  }
  return {
    nType: nType,
    dHysParam_Alpha1: DATA.dHysParam_Alpha1,
    dHysParam_Alpha2: DATA.dHysParam_Alpha2,
    dHysParam_Beta1: DATA.dHysParam_Alpha1,
    dHysParam_Beta2: DATA.dHysParam_Beta2,
    dHysParam_Eta: DATA.dHysParam_Eta,
    DEFORMCAPACITY: DATA.DEFORMCAPACITY,
    dScaleF_Displ: DATA.dScaleF_Displ,
    dScaleF_Force: DATA.dScaleF_Force,
    PnD_Data: mult_data,
  };
};

export default RequestBtnPy;
