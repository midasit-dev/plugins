import { GuideBox } from "@midasit-dev/moaui";
import { Button, Alert } from "@mui/material";
import { useRecoilValue } from "recoil";
import {
  ComponentState,
  GetDBState,
  TableListState,
  TableErrState,
} from "../../../values/RecoilValue";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { isEmpty } from "lodash";
import { ALL_History_Prop_Name } from "../../../values/EnumValue";
import { dbUpdateItem } from "../../../utils_pyscript";

const ChangeBtnPy = () => {
  const { t: translate, i18n: internationalization } = useTranslation();
  const GetDB = useRecoilValue(GetDBState);
  const ComponentValue = useRecoilValue(ComponentState);
  const TableList = useRecoilValue(TableListState);
  const TableErr = useRecoilValue(TableErrState);

  const [bBtn, setbBtn] = useState(false);
  const [newDB, setNewDB] = useState<any>({});

  const TableErrMsg = translate("TableErrState");
  const changeDBBtn = translate("changeDBBtn");

  useEffect(() => {
    if (bBtn) {
      if (pyscript && pyscript.interpreter) {
        const bResult = Object.keys(newDB).every(async (key) => {
          try {
            await dbUpdateItem("IEHP", key, newDB[key]);
          } catch {
            return false;
          }
          return true;
        });
      }
    }

    setbBtn(false);
  }, [bBtn]);

  const setInitNewDB = async () => {
    setNewDB({});
    let newDBAll: { [key: string]: any } = {};
    Object.keys(GetDB).forEach((key: string) => {
      const dataObject = GetDB[key].ALL_PROP[ComponentValue - 1];
      const NAME = Object.keys(dataObject)[0];

      const changeData: any = getTableList(key);
      if (isEmpty(changeData)) return;
      const MATERIAL_TYPE = changeData.MATERIAL_TYPE === "S" ? "STEEL" : "RC";
      const HistoryPropName = ALL_History_Prop_Name[changeData.HISTORY_MODEL];
      const bStiff = dataObject[NAME].PALPHADELTA === 0 ? true : false;
      const nCount = bStiff ? changeData.DATA.PND + 1 : changeData.DATA.PND;

      const newDB =
        NAME === "MULTLIN"
          ? setMULTLINData(
              ComponentValue,
              NAME,
              GetDB,
              changeData,
              MATERIAL_TYPE,
              nCount,
              HistoryPropName,
              bStiff,
              key
            )
          : setOtherAllData(
              ComponentValue,
              NAME,
              GetDB,
              changeData,
              MATERIAL_TYPE,
              nCount,
              HistoryPropName,
              bStiff,
              key
            );

      newDBAll[key] = newDB[key];
    });
    await setNewDB(newDBAll);
  };

  const getTableList = (key: string) => {
    let changeData = {};
    Object.keys(TableList).forEach((tableType: string) => {
      const selectData = TableList[tableType]
        .map((data: any) => {
          return data.KEY === key ? data : {};
        })
        .filter((data: any) => !isEmpty(data));

      if (!isEmpty(selectData)) changeData = selectData[0];
    });
    return changeData;
  };

  // event
  async function onClickChange() {
    if (TableErr) {
    } else {
      await setInitNewDB();
      setbBtn(true);
    }
  }

  return (
    <GuideBox horRight row spacing={5}>
      {TableErr && (
        <Alert
          style={{
            width: "100%",
            height: "45px",
            transition: "opacity 0.5s ease-out",
            opacity: 1,
          }}
          severity="error"
        >
          {TableErrMsg}
        </Alert>
      )}
      <Button
        disabled={TableErr ? true : false}
        sx={BtnStyle}
        onClick={onClickChange}
      >
        {changeDBBtn}
      </Button>
    </GuideBox>
  );
};

const setMULTLINData = (
  ComponentValue: number,
  NAME: string,
  GetDB: any,
  changeData: any,
  MATERIAL_TYPE: string,
  nCount: number,
  HistoryPropName: string,
  bStiff: boolean,
  key: string
) => {
  let newDB: { [key: string]: any } = {
    [key]: {
      ...GetDB[key],
      NAME: changeData.NAME,
      MATERIAL_TYPE: MATERIAL_TYPE,
      HYSTERESIS_MODEL: GetDB[key].HYSTERESIS_MODEL.map(
        (model: string, i: number) =>
          i === ComponentValue - 1 ? changeData.HISTORY_MODEL : model
      ),
      MULT_DATA: changeData.DATA.PnD_Data.map((pnd: any) => {
        if (changeData.DATA.PnD_Data.lengh === 1) return { DISP: 0, FORCE: 0 };
        else return { DISP: pnd[1], FORCE: pnd[0] };
      }),
      ALL_PROP: GetDB[key].ALL_PROP.map((prop: any, index: number) => {
        return index === ComponentValue - 1
          ? {
              [HistoryPropName]: {
                ...prop[NAME],
                dHysParam_Alpha1:
                  changeData.DATA.dHysParam_Alpha1 !== undefined
                    ? changeData.DATA.dHysParam_Alpha1
                    : 10,
                dHysParam_Alpha2:
                  changeData.DATA.dHysParam_Alpha2 !== undefined
                    ? changeData.DATA.dHysParam_Alpha2
                    : 10,
                dHysParam_Beta1:
                  changeData.DATA.dHysParam_Beta1 !== undefined
                    ? changeData.DATA.dHysParam_Beta1
                    : 0.7,
                dHysParam_Beta2:
                  changeData.DATA.dHysParam_Beta2 !== undefined
                    ? changeData.DATA.dHysParam_Beta2
                    : 0.7,
                dHysParam_Eta:
                  changeData.DATA.dHysParam_Eta !== undefined
                    ? changeData.DATA.dHysParam_Eta
                    : 0,
                nType: changeData.DATA.nType,
              },
            }
          : prop;
      }),
    },
  };
  newDB["ALL_SUBPROP"] = newDB.ALL_PROP;
  return newDB;
};

const setOtherAllData = (
  ComponentValue: number,
  NAME: string,
  GetDB: any,
  changeData: any,
  MATERIAL_TYPE: string,
  nCount: number,
  HistoryPropName: string,
  bStiff: boolean,
  key: string
) => {
  let CRACKFORCE: number[] = [];
  let YIELDFORCE: number[] = [];
  let ULTIMATEFORCE: number[] = [];
  let FRACTUREFORCE: number[] = [];

  let YIELDDISP1ST: number[] = [];
  let YIELDDISP2ND: number[] = [];
  let YIELDDISP3RD: number[] = [];
  let YIELDDISP4TH: number[] = [];

  let CRACKMOMENT: number[] = [];
  let YIELDMOMENT: number[] = [];
  let ULTIMATEMOMENT: number[] = [];
  let FRACTUREMOMENT: number[] = [];

  let YIELDROTN1ST: number[] = [];
  let YIELDROTN2ND: number[] = [];
  let YIELDROTN3RD: number[] = [];
  let YIELDROTN4TH: number[] = [];

  let STIFFRATIO1ST: number[] = [];
  let STIFFRATIO2ND: number[] = [];
  let STIFFRATIO3RD: number[] = [];
  let STIFFRATIO4TH: number[] = [];

  // Force, Disp
  if (ComponentValue < 4) {
    let idx = 0;

    if (nCount !== 2) {
      // bilinear
      if (nCount > idx) CRACKFORCE = changeData.DATA.P_DATA[idx];
      if (nCount > idx) YIELDDISP1ST = changeData.DATA.D_DATA[idx];
      idx++;
    }

    if (nCount > idx) YIELDFORCE = changeData.DATA.P_DATA[idx];
    if (nCount > idx) YIELDDISP2ND = changeData.DATA.D_DATA[idx];
    idx++;

    if (nCount > idx) ULTIMATEFORCE = changeData.DATA.P_DATA[idx];
    if (nCount > idx) YIELDDISP3RD = changeData.DATA.D_DATA[idx];
    idx++;

    if (nCount > idx) FRACTUREFORCE = changeData.DATA.P_DATA[idx];
    if (nCount > idx) YIELDDISP4TH = changeData.DATA.D_DATA[idx];
  }
  // Moment, Rotn
  else {
    let idx = 0;

    if (nCount !== 2) {
      // bilinear
      if (nCount > idx) CRACKMOMENT = changeData.DATA.P_DATA[idx];
      if (nCount > idx) YIELDROTN1ST = changeData.DATA.D_DATA[idx];
      idx++;
    }

    if (nCount > idx) YIELDMOMENT = changeData.DATA.P_DATA[idx];
    if (nCount > idx) YIELDROTN2ND = changeData.DATA.D_DATA[idx];
    idx++;

    if (nCount > idx) ULTIMATEMOMENT = changeData.DATA.P_DATA[idx];
    if (nCount > idx) YIELDROTN3RD = changeData.DATA.D_DATA[idx];
    idx++;

    if (nCount > idx) FRACTUREMOMENT = changeData.DATA.P_DATA[idx];
    if (nCount > idx) YIELDROTN4TH = changeData.DATA.D_DATA[idx];
  }

  // stiff
  if (bStiff) {
    let idx = 0;
    if (nCount !== 2) {
      // bilinear
      if (nCount > idx) STIFFRATIO1ST = changeData.DATA.A_DATA[idx];
      idx++;
    }
    if (nCount > idx) STIFFRATIO2ND = changeData.DATA.A_DATA[idx];
    idx++;

    if (nCount > idx) STIFFRATIO3RD = changeData.DATA.A_DATA[idx];
    idx++;

    if (nCount > idx) STIFFRATIO4TH = changeData.DATA.A_DATA[idx];
  }

  let newDB: { [key: string]: any } = {
    [key]: {
      ...GetDB[key],
      NAME: changeData.NAME,
      MATERIAL_TYPE: MATERIAL_TYPE,
      HYSTERESIS_MODEL: GetDB[key].HYSTERESIS_MODEL.map(
        (model: string, i: number) =>
          i === ComponentValue - 1 ? changeData.HISTORY_MODEL : model
      ),
      ALL_PROP: GetDB[key].ALL_PROP.map((prop: any, index: number) => {
        const origin_CRACKFORCE = prop[NAME]?.COMPONENTPROPS.CRACKFORCE;
        const origin_YIELDFORCE = prop[NAME]?.COMPONENTPROPS.YIELDFORCE;
        const origin_ULTIMATEFORCE = prop[NAME]?.COMPONENTPROPS.ULTIMATEFORCE;
        const origin_FRACTUREFORCE = prop[NAME]?.COMPONENTPROPS.FRACTUREFORCE;

        const origin_YIELDDISP1ST = prop[NAME]?.COMPONENTPROPS.YIELDDISP1ST;
        const origin_YIELDDISP2ND = prop[NAME]?.COMPONENTPROPS.YIELDDISP2ND;
        const origin_YIELDDISP3RD = prop[NAME]?.COMPONENTPROPS.YIELDDISP3RD;
        const origin_YIELDDISP4TH = prop[NAME]?.COMPONENTPROPS.YIELDDISP4TH;

        const origin_CRACKMOMENT = prop[NAME]?.COMPONENTPROPS.CRACKMOMENT;
        const origin_YIELDMOMENT = prop[NAME]?.COMPONENTPROPS.YIELDMOMENT;
        const origin_ULTIMATEMOMENT = prop[NAME]?.COMPONENTPROPS.ULTIMATEMOMENT;
        const origin_FRACTUREMOMENT = prop[NAME]?.COMPONENTPROPS.FRACTUREMOMENT;

        const origin_YIELDROTN1ST = prop[NAME]?.COMPONENTPROPS.YIELDROTN1ST;
        const origin_YIELDROTN2ND = prop[NAME]?.COMPONENTPROPS.YIELDROTN2ND;
        const origin_YIELDROTN3RD = prop[NAME]?.COMPONENTPROPS.YIELDROTN3RD;
        const origin_YIELDROTN4TH = prop[NAME]?.COMPONENTPROPS.YIELDROTN4TH;

        const origin_STIFFRATIO1ST = prop[NAME]?.COMPONENTPROPS.STIFFRATIO1ST;
        const origin_STIFFRATIO2ND = prop[NAME]?.COMPONENTPROPS.STIFFRATIO2ND;
        const origin_STIFFRATIO3RD = prop[NAME]?.COMPONENTPROPS.STIFFRATIO3RD;
        const origin_STIFFRATIO4TH = prop[NAME]?.COMPONENTPROPS.STIFFRATIO4TH;

        return index === ComponentValue - 1
          ? {
              [HistoryPropName]: {
                ...prop[NAME],
                COMPONENTPROPS: {
                  ...prop[NAME].COMPONENTPROPS,
                  ...(!isEmpty(CRACKFORCE) && {
                    CRACKFORCE: isEmpty(CRACKFORCE)
                      ? origin_CRACKFORCE
                      : CRACKFORCE,
                  }),
                  ...(!isEmpty(YIELDFORCE) && {
                    YIELDFORCE: isEmpty(YIELDFORCE)
                      ? origin_YIELDFORCE
                      : YIELDFORCE,
                  }),
                  ...(!isEmpty(ULTIMATEFORCE) && {
                    ULTIMATEFORCE: isEmpty(ULTIMATEFORCE)
                      ? origin_ULTIMATEFORCE
                      : ULTIMATEFORCE,
                  }),
                  ...(!isEmpty(FRACTUREFORCE) && {
                    FRACTUREFORCE: isEmpty(FRACTUREFORCE)
                      ? origin_FRACTUREFORCE
                      : FRACTUREFORCE,
                  }),

                  ...(!isEmpty(YIELDDISP1ST) && {
                    YIELDDISP1ST: isEmpty(YIELDDISP1ST)
                      ? origin_YIELDDISP1ST
                      : YIELDDISP1ST,
                  }),
                  ...(!isEmpty(YIELDDISP2ND) && {
                    YIELDDISP2ND: isEmpty(YIELDDISP2ND)
                      ? origin_YIELDDISP2ND
                      : YIELDDISP2ND,
                  }),
                  ...(!isEmpty(YIELDDISP3RD) && {
                    YIELDDISP3RD: isEmpty(YIELDDISP3RD)
                      ? origin_YIELDDISP3RD
                      : YIELDDISP3RD,
                  }),
                  ...(!isEmpty(YIELDDISP4TH) && {
                    YIELDDISP4TH: isEmpty(YIELDDISP4TH)
                      ? origin_YIELDDISP4TH
                      : YIELDDISP4TH,
                  }),

                  ...(!isEmpty(CRACKMOMENT) && {
                    CRACKMOMENT: isEmpty(CRACKMOMENT)
                      ? origin_CRACKMOMENT
                      : CRACKMOMENT,
                  }),
                  ...(!isEmpty(YIELDMOMENT) && {
                    YIELDMOMENT: isEmpty(YIELDMOMENT)
                      ? origin_YIELDMOMENT
                      : YIELDMOMENT,
                  }),
                  ...(!isEmpty(ULTIMATEMOMENT) && {
                    ULTIMATEMOMENT: isEmpty(ULTIMATEMOMENT)
                      ? origin_ULTIMATEMOMENT
                      : ULTIMATEMOMENT,
                  }),
                  ...(!isEmpty(FRACTUREMOMENT) && {
                    FRACTUREMOMENT: isEmpty(FRACTUREMOMENT)
                      ? origin_FRACTUREMOMENT
                      : FRACTUREMOMENT,
                  }),

                  ...(!isEmpty(YIELDROTN1ST) && {
                    YIELDROTN1ST: isEmpty(YIELDROTN1ST)
                      ? origin_YIELDROTN1ST
                      : YIELDROTN1ST,
                  }),
                  ...(!isEmpty(YIELDROTN2ND) && {
                    YIELDROTN2ND: isEmpty(YIELDROTN2ND)
                      ? origin_YIELDROTN2ND
                      : YIELDROTN2ND,
                  }),
                  ...(!isEmpty(YIELDROTN3RD) && {
                    YIELDROTN3RD: isEmpty(YIELDROTN3RD)
                      ? origin_YIELDROTN3RD
                      : YIELDROTN3RD,
                  }),
                  ...(!isEmpty(YIELDROTN4TH) && {
                    YIELDROTN4TH: isEmpty(YIELDROTN4TH)
                      ? origin_YIELDROTN4TH
                      : YIELDROTN4TH,
                  }),

                  ...(!isEmpty(STIFFRATIO1ST) && {
                    STIFFRATIO1ST: isEmpty(STIFFRATIO1ST)
                      ? origin_STIFFRATIO1ST
                      : STIFFRATIO1ST,
                  }),
                  ...(!isEmpty(STIFFRATIO2ND) && {
                    STIFFRATIO2ND: isEmpty(STIFFRATIO2ND)
                      ? origin_STIFFRATIO2ND
                      : STIFFRATIO2ND,
                  }),
                  ...(!isEmpty(STIFFRATIO3RD) && {
                    STIFFRATIO3RD: isEmpty(STIFFRATIO3RD)
                      ? origin_STIFFRATIO3RD
                      : STIFFRATIO3RD,
                  }),
                  ...(!isEmpty(STIFFRATIO4TH) && {
                    STIFFRATIO4TH: isEmpty(STIFFRATIO4TH)
                      ? origin_STIFFRATIO4TH
                      : STIFFRATIO4TH,
                  }),
                },
                // DEFORMDEFINETYPE: 1,
                ...(changeData.DATA.INIT_GAP[0] !== undefined && {
                  INITGAPPOSITIVE: changeData.DATA.INIT_GAP[0],
                }), // init gap POSITIVE
                ...(changeData.DATA.INIT_GAP[1] !== undefined && {
                  INITGAPNEGATIVE: changeData.DATA.INIT_GAP[1],
                }), // init gap NEGATIVE

                ...(changeData.DATA.BETA !== undefined && {
                  UNLOADSTIFFCALCEXPO: changeData.DATA.BETA,
                }),
                ...(changeData.DATA.ALPA !== undefined && {
                  UNLOADSTIFFREDUFAC: changeData.DATA.ALPA,
                }),
                ...(changeData.DATA.GAMMA !== undefined && {
                  PINCHINGRULEFAC: changeData.DATA.GAMMA,
                }),
                INITSTIFFNESS:
                  changeData.DATA.INITSTIFFNESS !== undefined
                    ? changeData.DATA.INITSTIFFNESS
                    : 1,
                SYMMETRIC: changeData.DATA.SYMMETRIC,
                // YIELDSTRENGTHOPT: 0,
              },
            }
          : prop;
      }),
    },
  };
  newDB["ALL_SUBPROP"] = newDB.ALL_PROP;
  return newDB;
};

const BtnStyle: any = {
  textTransform: "none",
  backgroundColor: "#EEEEEE",
  color: "#1F2937",
  width: "300px", // 버튼의 너비
  height: "45px",
  borderRadius: "10px", // 버튼의 모서리 둥글기
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  ":hover": {
    backgroundColor: "#5F666B",
    color: "#FFFFFF",
    border: "1px solid #5F666B",
  },
};
export default ChangeBtnPy;
