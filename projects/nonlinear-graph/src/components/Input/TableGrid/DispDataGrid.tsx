import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ALL_HistoryType_LNG,
  ALL_Histroy_PND,
  GetKeyFromLNG,
  getModelAlpa,
  getModelBeta,
  getModelGamma,
  getModelInitGap,
  SYMMETRIC,
} from "../../../values/EnumValue";
import { isEmpty } from "lodash";
// recoil
import { useRecoilState, useRecoilValue } from "recoil";
import {
  TableTypeState,
  TableListState,
  filteredTableListState,
  TableChangeState,
  CheckBoxState,
  HiddenBtnState,
  LanguageState,
  RequestBtnState,
} from "../../../values/RecoilValue";
// UI
import { Grid, GuideBox } from "@midasit-dev/moaui";
import {
  GridCallbackDetails,
  GridColumnGroup,
  GridEventListener,
  GridRowModesModel,
} from "@mui/x-data-grid";
import { Alert } from "@mui/material";
import { DataGridPremium, GridColDef } from "@mui/x-data-grid-premium";

const DispDataGrid = () => {
  const RequestBtn = useRecoilValue(RequestBtnState);
  const TableType = useRecoilValue(TableTypeState);
  const [TableList, setTableList] = useRecoilState(TableListState);
  const [bChange, setbChange] = useRecoilState(TableChangeState);
  const filterList = useRecoilValue(filteredTableListState);
  const [CheckBox, setCheckBox] = useRecoilState(CheckBoxState);
  const hidden = useRecoilValue(HiddenBtnState);
  const lan = useRecoilValue(LanguageState);

  const [bError, setbError] = useState(false);
  const [alertMsg, setAlertMsg] = useState("");
  const [cursur, setCursur] = useState<number>(0);
  const [field, setField] = useState<string>("");
  const [bEnter, setbEnter] = useState(false);

  const { t: translate, i18n: internationalization } = useTranslation();

  const [columns, setColumns] = useState<GridColDef<any>[]>([]);
  const [groupColumns, setGroupColumns] = useState<GridColumnGroup[]>([]);
  const [rows, setRows] = useState<any[]>([]);

  useEffect(() => {
    initRows();
    initCloumns();
    initGroupColumns();
  }, [filterList, alertMsg, lan]);

  const AddBlankRow = () => {
    const len = filterList === undefined ? 0 : filterList.length;
    const obj: { [key: string]: any } = {};
    columns.forEach((col: any) => {
      obj[col.field] = "";
    });
    obj["id"] = len;
    setRows((row) => [...row, obj]);
  };

  const initRows = () => {
    setRows([]);
    if (filterList !== undefined) {
      filterList.forEach((value: any, idx: any) => {
        const HISTORY_MODEL = ALL_HistoryType_LNG[value.HISTORY_MODEL];

        const obj: { [key: string]: any } = {
          id: idx,
          NAME: value.NAME,
          MATERIAL_TYPE: value.MATERIAL_TYPE,
          HISTORY_MODEL: translate(HISTORY_MODEL),
          SYMMETRIC: translate(SYMMETRIC[value.DATA.SYMMETRIC]),
        };
        // SYMMETRIC disable
        obj["SYMMETRIC_DISABLE"] = value.DATA.SYMMETRIC === 0 ? true : false;

        // PnD data init
        const nPnd = value.DATA.PND;
        obj["pnd"] = nPnd;
        let maxPnd = nPnd;
        Object.entries(ALL_HistoryType_LNG).forEach(([key, value], idx) => {
          if (value === HISTORY_MODEL)
            maxPnd = Math.max(maxPnd, ALL_Histroy_PND[key]);
        });
        const pDataArr = [
          ["Plus_P1", "Minus_P1"],
          ["Plus_P2", "Minus_P2"],
          ["Plus_P3", "Minus_P3"],
          ["Plus_P4", "Minus_P4"],
        ];
        const dDataArr = [
          ["Plus_D1", "Minus_D1"],
          ["Plus_D2", "Minus_D2"],
          ["Plus_D3", "Minus_D3"],
          ["Plus_D4", "Minus_D4"],
        ];
        pDataArr.some(([plusField, minusField], idx) => {
          if (nPnd < idx + 1) {
            obj[plusField] = "";
            obj[minusField] = "";
          } else {
            const pData = value.DATA.P_DATA?.[idx];
            obj[plusField] = isEmpty(pData) ? "" : formatSmallNumber(pData[0]);
            obj[minusField] = isEmpty(pData)
              ? ""
              : formatSmallNumber(pData[1] * -1);
          }
        });

        if (value.HISTORY_MODEL === "SLBT" || value.HISTORY_MODEL === "SLTT")
          obj["disable"] = "Minus";
        else if (
          value.HISTORY_MODEL === "SLBC" ||
          value.HISTORY_MODEL === "SLTC"
        )
          obj["disable"] = "Plus";
        else obj["disable"] = undefined;

        dDataArr.some(([plusField, minusField], idx) => {
          if (nPnd < idx + 1) {
            obj[plusField] = "";
            obj[minusField] = "";
          } else {
            const dData = value.DATA.D_DATA?.[idx];
            obj[plusField] = isEmpty(dData) ? "" : formatSmallNumber(dData[0]);
            obj[minusField] = isEmpty(dData)
              ? ""
              : formatSmallNumber(dData[1] * -1);
          }
        });

        // b, a, g
        const HistoryModelLNG = ALL_HistoryType_LNG[value.HISTORY_MODEL];
        const bBeta = getModelBeta(HistoryModelLNG);
        const bAlpa = getModelAlpa(HistoryModelLNG);
        const bGamma = getModelGamma(HistoryModelLNG);
        if (bBeta) obj["B"] = value.DATA.BETA.toFixed(1);
        if (bAlpa) obj["a"] = value.DATA.ALPA.toFixed(1);
        if (bGamma) obj["g"] = value.DATA.GAMMA.toFixed(1);

        // init gap
        const bInitGap = getModelInitGap(HistoryModelLNG);
        if (bInitGap) {
          obj["Plus_gap"] = value.DATA.INIT_GAP[0].toFixed(1);
          obj["Minus_gap"] = (value.DATA.INIT_GAP[1] * -1).toFixed(1);
        }
        setRows((row) => [...row, obj]);
      });
    }
    AddBlankRow();
  };

  const initCloumns = () => {
    // colums
    const baseColumns = [
      {
        field: "NAME",
        headerName: translate("Name"),
        editable: true,
        width: 68,
      },
      {
        field: "MATERIAL_TYPE",
        headerName: translate("Material"),
        editable: true,
        width: 68,
      },
      {
        field: "HISTORY_MODEL",
        headerName: translate("Hysteresis_model"),
        editable: true,
        width: 135,
      },
      {
        field: "SYMMETRIC",
        headerName: translate("Axisymmetric"),
        editable: true,
        width: 87,
      },
    ];

    const Plus_Columns = [
      {
        field: "Plus_P1",
        headerName: "P1",
        editable: true,
        width: 90,
        align: "right",
        cellClassName: (params: any) => {
          const bDisable = disableCell(params);
          return bDisable ? "enable-cell" : "disable-cell";
        },
      },
      {
        field: "Plus_D1",
        headerName: "D1",
        editable: true,
        width: 90,
        align: "right",
        cellClassName: (params: any) => {
          const bDisable = disableCell(params);
          return bDisable ? "enable-cell" : "disable-cell";
        },
      },
      {
        field: "Plus_P2",
        headerName: "P2",
        editable: true,
        width: 90,
        align: "right",
        cellClassName: (params: any) => {
          const bDisable = disableCell(params);
          return bDisable ? "enable-cell" : "disable-cell";
        },
      },
      {
        field: "Plus_D2",
        headerName: "D2",
        editable: true,
        width: 90,
        align: "right",
        cellClassName: (params: any) => {
          const bDisable = disableCell(params);
          return bDisable ? "enable-cell" : "disable-cell";
        },
      },
      {
        field: "Plus_P3",
        headerName: "P3",
        editable: true,
        width: 90,
        align: "right",
        cellClassName: (params: any) => {
          const bDisable = disableCell(params);
          return bDisable ? "enable-cell" : "disable-cell";
        },
      },
      {
        field: "Plus_D3",
        headerName: "D3",
        editable: true,
        width: 90,
        align: "right",
        cellClassName: (params: any) => {
          const bDisable = disableCell(params);
          return bDisable ? "enable-cell" : "disable-cell";
        },
      },
      {
        field: "Plus_P4",
        headerName: "P4",
        editable: true,
        width: 90,
        align: "right",
        cellClassName: (params: any) => {
          const bDisable = disableCell(params);
          return bDisable ? "enable-cell" : "disable-cell";
        },
      },
      {
        field: "Plus_D4",
        headerName: "D4",
        editable: true,
        width: 90,
        align: "right",
        cellClassName: (params: any) => {
          const bDisable = disableCell(params);
          return bDisable ? "enable-cell" : "disable-cell";
        },
      },
    ];

    const Minus_Columns = [
      {
        field: "Minus_P1",
        headerName: "P1",
        editable: true,
        width: 90,
        align: "right",

        cellClassName: (params: any) => {
          const bDisable = disableCell(params);
          return bDisable ? "enable-cell" : "disable-cell";
        },
      },
      {
        field: "Minus_D1",
        headerName: "D1",
        editable: true,
        width: 90,
        align: "right",
        cellClassName: (params: any) => {
          const bDisable = disableCell(params);
          return bDisable ? "enable-cell" : "disable-cell";
        },
      },
      {
        field: "Minus_P2",
        headerName: "P2",
        editable: true,
        width: 90,
        align: "right",
        cellClassName: (params: any) => {
          const bDisable = disableCell(params);
          return bDisable ? "enable-cell" : "disable-cell";
        },
      },
      {
        field: "Minus_D2",
        headerName: "D2",
        editable: true,
        width: 90,
        align: "right",
        cellClassName: (params: any) => {
          const bDisable = disableCell(params);
          return bDisable ? "enable-cell" : "disable-cell";
        },
      },
      {
        field: "Minus_P3",
        headerName: "P3",
        editable: true,
        width: 90,
        align: "right",
        cellClassName: (params: any) => {
          const bDisable = disableCell(params);
          return bDisable ? "enable-cell" : "disable-cell";
        },
      },
      {
        field: "Minus_D3",
        headerName: "D3",
        editable: true,
        width: 90,
        align: "right",
        cellClassName: (params: any) => {
          const bDisable = disableCell(params);
          return bDisable ? "enable-cell" : "disable-cell";
        },
      },
      {
        field: "Minus_P4",
        headerName: "P4",
        editable: true,
        width: 90,
        align: "right",
        cellClassName: (params: any) => {
          const bDisable = disableCell(params);
          return bDisable ? "enable-cell" : "disable-cell";
        },
      },
      {
        field: "Minus_D4",
        headerName: "D4",
        editable: true,
        width: 90,
        align: "right",
        cellClassName: (params: any) => {
          const bDisable = disableCell(params);
          return bDisable ? "enable-cell" : "disable-cell";
        },
      },
    ];

    const remainColumns = [
      {
        field: "B",
        headerName: "β",
        editable: true,
        width: 68,
        align: "right",
        cellClassName: (params: any) => {
          const bDisable = disableCell(params);
          return bDisable ? "enable-cell" : "disable-cell";
        },
      },
      {
        field: "a",
        headerName: "α",
        editable: true,
        width: 68,
        align: "right",
        cellClassName: (params: any) => {
          const bDisable = disableCell(params);
          return bDisable ? "enable-cell" : "disable-cell";
        },
      },
      {
        field: "g",
        headerName: "λ",
        editable: true,
        width: 68,
        align: "right",
        cellClassName: (params: any) => {
          const bDisable = disableCell(params);
          return bDisable ? "enable-cell" : "disable-cell";
        },
      },
      {
        field: "Plus_gap",
        headerName: "(+)",
        editable: true,
        width: 68,
        align: "right",
        cellClassName: (params: any) => {
          const bDisable = disableCell(params);
          return bDisable ? "enable-cell" : "disable-cell";
        },
      },
      {
        field: "Minus_gap",
        headerName: "(-)",
        editable: true,
        width: 68,
        align: "right",
        cellClassName: (params: any) => {
          const bDisable = disableCell(params);
          return bDisable ? "enable-cell" : "disable-cell";
        },
      },
    ];
    setColumns(baseColumns.concat(Plus_Columns, Minus_Columns, remainColumns));
  };

  const initGroupColumns = () => {
    setGroupColumns([]);
    const Plus_children = [
      { field: "Plus_P1" },
      { field: "Plus_D1" },
      { field: "Plus_P2" },
      { field: "Plus_D2" },
      { field: "Plus_P3" },
      { field: "Plus_D3" },
      { field: "Plus_P4" },
      { field: "Plus_D4" },
    ];
    const Minus_children = [
      { field: "Minus_P1" },
      { field: "Minus_D1" },
      { field: "Minus_P2" },
      { field: "Minus_D2" },
      { field: "Minus_P3" },
      { field: "Minus_D3" },
      { field: "Minus_P4" },
      { field: "Minus_D4" },
    ];
    const groupColumn = [
      {
        groupId: "PnD_Plus",
        headerName: `(+) ${translate("Direction")}`,
        children: Plus_children,
      },
      {
        groupId: "PnD_Minus",
        headerName: `(-) ${translate("Direction")}`,
        children: Minus_children,
      },
      {
        groupId: "Gap",
        headerName: translate("Gap"),
        children: [{ field: "Plus_gap" }, { field: "Minus_gap" }],
      },
    ];

    setGroupColumns(groupColumn);
  };

  const disableCell = (params: any) => {
    const disableField = params.field;

    if (params.row["disable"] !== undefined) {
      if (params.row["disable"] === "Plus") {
        switch (disableField) {
          case "Plus_P1":
          case "Plus_P2":
          case "Plus_P3":
          case "Plus_P4":
          case "Plus_D1":
          case "Plus_D2":
          case "Plus_D3":
          case "Plus_D4":
          case "B":
          case "a":
          case "g":
          case "Plus_gap":
            return false;
          default:
            return true;
        }
      } else {
        switch (disableField) {
          case "Minus_P1":
          case "Minus_P2":
          case "Minus_P3":
          case "Minus_P4":
          case "Minus_D1":
          case "Minus_D2":
          case "Minus_D3":
          case "Minus_D4":
          case "B":
          case "a":
          case "g":
          case "Minus_gap":
            return false;
          default:
            return true;
        }
      }
    } else {
      if (params.row["SYMMETRIC_DISABLE"]) {
        switch (disableField) {
          case "Minus_P1":
          case "Minus_P2":
          case "Minus_P3":
          case "Minus_P4":
          case "Minus_D1":
          case "Minus_D2":
          case "Minus_D3":
          case "Minus_D4":
          case "Minus_gap":
            return false;
          default:
            break;
        }
      }

      if (params.row[disableField] === undefined) return false;
      else return true;
    }
  };

  // tableList 변경
  useEffect(() => {
    if (bChange === false) return;
    for (let row = 0; row < rows.length; row++) {
      // name
      const NAME: string = rows[row].NAME;
      // MATERIAL_TYPE
      const MATERIAL_TYPE: string = rows[row].MATERIAL_TYPE;

      // SYMMETRIC
      let symmetric: number = 0;
      Object.entries(SYMMETRIC).forEach(([key, value]) => {
        if (translate(value) === rows[row].SYMMETRIC) symmetric = parseInt(key);
      });
      if (
        NAME === "" ||
        NAME === undefined ||
        MATERIAL_TYPE === "" ||
        MATERIAL_TYPE === undefined
      )
        continue;

      // p_data
      const pData = [];
      for (let i = 1; i < 5; i++) {
        if (
          isEmpty(rows[row][`Plus_P${i}`]) ||
          isEmpty(rows[row][`Minus_P${i}`])
        ) {
          const noData = "No Data";
          if (isEmpty(rows[row][`Plus_P${i}`]) === false) {
            if (symmetric === 0) {
              pData.push([
                parseFloat(rows[row][`Plus_P${i}`]),
                parseFloat(rows[row][`Plus_P${i}`]),
              ]);
              continue;
            } else AlertFunc(false, -1, `Minus_P${i}`, noData);
          } else if (isEmpty(rows[row][`Minus_P${i}`]) === false)
            AlertFunc(false, -1, `Plus_P${i}`, noData);
          continue;
        } else
          pData.push([
            parseFloat(rows[row][`Plus_P${i}`]),
            symmetric === 0
              ? parseFloat(rows[row][`Plus_P${i}`])
              : parseFloat(rows[row][`Minus_P${i}`]) * -1,
          ]);
      }

      // d_data
      const dData = [];
      for (let i = 1; i < 5; i++) {
        if (
          isEmpty(rows[row][`Plus_D${i}`]) ||
          isEmpty(rows[row][`Minus_D${i}`])
        ) {
          const noData = "No Data";
          if (isEmpty(rows[row][`Plus_D${i}`]) === false) {
            if (symmetric === 0) {
              dData.push([
                parseFloat(rows[row][`Plus_D${i}`]),
                parseFloat(rows[row][`Plus_D${i}`]),
              ]);
              continue;
            } else AlertFunc(false, -1, `Minus_D${i}`, noData);
          } else if (isEmpty(rows[row][`Minus_D${i}`]) === false)
            AlertFunc(false, -1, `Plus_D${i}`, noData);
          continue;
        } else
          dData.push([
            parseFloat(rows[row][`Plus_D${i}`]),
            symmetric === 0
              ? parseFloat(rows[row][`Plus_D${i}`])
              : parseFloat(rows[row][`Minus_D${i}`]) * -1,
          ]);
      }

      if (pData.length !== dData.length) {
        const noData = "+ or - No Data";
        const col =
          pData.length > dData.length
            ? `Plus_D${dData.length + 1}`
            : `Plus_P${pData.length + 1}`;
        AlertFunc(false, -1, col, noData);
        continue;
      }

      // HISTORY_MODEL
      let HISTORY_MODEL: string = "";
      let HISTORY_MODEL_LNG: string = "";
      Object.entries(ALL_HistoryType_LNG).forEach(([key, value]) => {
        if (translate(value) === rows[row].HISTORY_MODEL) {
          const getKey = GetKeyFromLNG(value, pData.length);
          if (key === getKey) {
            HISTORY_MODEL = key;
            HISTORY_MODEL_LNG = value;
          }
        }
      });
      if (HISTORY_MODEL === "") {
        const noData = `[P or D] Data not match ${translate(
          "Hysteresis_model"
        )}`;
        const col = "HISTORY_MODEL";
        AlertFunc(false, row, col, noData);
        continue;
      }
      // PnD err check
      const [bErr, errCol, errMsg] = pndErrCheck(pData, dData, HISTORY_MODEL);
      if (!bErr) {
        AlertFunc(false, row, errCol, errMsg);
        continue;
      }

      // b, a, g, Plus_gap, Minus_gap- values
      const bBeta = getModelBeta(HISTORY_MODEL_LNG);
      const bAlpa = getModelAlpa(HISTORY_MODEL_LNG);
      const bGamma = getModelGamma(HISTORY_MODEL_LNG);
      const bInitGap = getModelInitGap(HISTORY_MODEL_LNG);

      const Beta = isEmpty(rows[row].B) ? 0.5 : parseFloat(rows[row].B);
      const Alpa = isEmpty(rows[row].a) ? 1.0 : parseFloat(rows[row].a);
      const Gamma = isEmpty(rows[row].g) ? 0.5 : parseFloat(rows[row].g);
      const PlusGap = isEmpty(rows[row].Plus_gap)
        ? 0.0
        : parseFloat(rows[row].Plus_gap);
      const MinusGap = isEmpty(rows[row].Minus_gap)
        ? 0.0
        : parseFloat(rows[row].Minus_gap) * -1;
      const dValues: any = {
        B: bBeta ? Beta : undefined,
        a: bAlpa ? Alpa : undefined,
        g: bGamma ? Gamma : undefined,
        Plus_gap: bInitGap ? PlusGap : undefined,
        Minus_gap: bInitGap ? MinusGap : undefined,
      };

      if (bChange === true)
        updateTableList(
          row,
          NAME,
          MATERIAL_TYPE,
          HISTORY_MODEL,
          symmetric,
          pData,
          dData,
          dValues
        );
    }
    if (bChange === true) {
      setbChange(false);
      setbEnter(false);
    }
  }, [bChange]);

  const updateTableList = (
    row: number,
    NAME: string,
    MATERIAL_TYPE: string,
    HISTORY_MODEL: string,
    SYMMETRIC: number,
    pData: Array<Array<number>>,
    dData: Array<Array<number>>,
    dValues: any
  ) => {
    if (
      isEmpty(NAME) ||
      isEmpty(MATERIAL_TYPE) ||
      isEmpty(HISTORY_MODEL) ||
      pData.length === 0 ||
      dData.length === 0
    )
      return;
    if (filterList === undefined || row > filterList.length - 1) {
      // add
      addTable(
        NAME,
        MATERIAL_TYPE,
        HISTORY_MODEL,
        SYMMETRIC,
        pData,
        dData,
        dValues
      );
    } else {
      // modify
      modifyTable(
        row,
        NAME,
        MATERIAL_TYPE,
        HISTORY_MODEL,
        SYMMETRIC,
        pData,
        dData,
        dValues
      );
    }
  };

  const addTable = (
    NAME: string,
    MATERIAL_TYPE: string,
    HISTORY_MODEL: string,
    SYMMETRIC: number,
    pData: Array<Array<number>>,
    dData: Array<Array<number>>,
    dValues: any
  ) => {
    setTableList((preTable: any) => ({
      ...preTable,
      [TableType]: preTable[TableType]
        ? [
            ...preTable[TableType],
            {
              NAME: NAME,
              MATERIAL_TYPE: MATERIAL_TYPE,
              HISTORY_MODEL: HISTORY_MODEL,
              DATA: {
                SYMMETRIC: SYMMETRIC,
                INITSTIFFNESS: dValues.INITSTIFFNESS,
                BETA: dValues.B,
                ALPA: dValues.a,
                GAMMA: dValues.g,
                INIT_GAP: [dValues.Plus_gap, dValues.Minus_gap],
                P_DATA: pData,
                D_DATA: dData,
                PND: pData.length,
              },
            },
          ]
        : [
            {
              NAME: NAME,
              MATERIAL_TYPE: MATERIAL_TYPE,
              HISTORY_MODEL: HISTORY_MODEL,
              DATA: {
                SYMMETRIC: SYMMETRIC,
                INITSTIFFNESS: dValues.INITSTIFFNESS,
                BETA: dValues.B,
                ALPA: dValues.a,
                GAMMA: dValues.g,
                INIT_GAP: [dValues.Plus_gap, dValues.Minus_gap],
                P_DATA: pData,
                D_DATA: dData,
                PND: pData.length,
              },
            },
          ],
    }));
  };

  const modifyTable = (
    row: number,
    NAME: string,
    MATERIAL_TYPE: string,
    HISTORY_MODEL: string,
    SYMMETRIC: number,
    pData: Array<Array<number>>,
    aData: Array<Array<number>>,
    dValues: any
  ) => {
    setTableList((preTable: any) => ({
      ...preTable,
      [TableType]: preTable[TableType].map((item: any, idx: number) => ({
        ...item,
        NAME: idx === row ? NAME : item.NAME,
        MATERIAL_TYPE: idx === row ? MATERIAL_TYPE : item.MATERIAL_TYPE,
        HISTORY_MODEL: idx === row ? HISTORY_MODEL : item.HISTORY_MODEL,
        DATA: {
          ...item.DATA,
          SYMMETRIC: idx === row ? SYMMETRIC : item.DATA.SYMMETRIC,
          INITSTIFFNESS:
            idx === row ? dValues.INITSTIFFNESS : item.DATA.INITSTIFFNESS,
          BETA: idx === row ? dValues.B : item.DATA.BETA,
          ALPA: idx === row ? dValues.a : item.DATA.ALPA,
          GAMMA: idx === row ? dValues.g : item.DATA.GAMMA,
          INIT_GAP:
            idx === row
              ? [dValues.Plus_gap, dValues.Minus_gap]
              : item.DATA.INIT_GAP,
          P_DATA: idx === row ? pData : item.DATA.P_DATA,
          A_DATA: idx === row ? aData : item.DATA.A_DATA,
          PND: idx === row ? pData.length : item.DATA.PND,
        },
      })),
    }));
  };

  const DataValid = (row: any, col: string, InputValue: any): boolean => {
    let dbUpdate: boolean = false;
    if (InputValue === undefined || InputValue === null) dbUpdate = true;

    switch (col) {
      case "id":
      case "pnd":
      case "disable":
      case "SYMMETRIC_DISABLE":
        dbUpdate = true;
        break;
      case "NAME": // name
        if (!isEmpty(InputValue)) dbUpdate = true;
        break;
      case "MATERIAL_TYPE": // material
        if (InputValue === "RC" || InputValue === "S") dbUpdate = true;
        break;
      case "HISTORY_MODEL": // historyType
        Object.entries(ALL_HistoryType_LNG).forEach(([key, value]) => {
          if (translate(value) === InputValue) {
            const nPnd = ALL_Histroy_PND[key];
            const getKey = GetKeyFromLNG(value, nPnd);
            if (key === getKey) dbUpdate = true;
          }
        });
        break;
      case "SYMMETRIC": // SYMMETRIC
        let sysValue = "";
        Object.entries(SYMMETRIC).forEach(([key, value]) => {
          if (translate(value) === InputValue) {
            sysValue = value;
            dbUpdate = true;
          }
        });
        const HISTORY_MODEL = row.HISTORY_MODEL;
        Object.entries(ALL_HistoryType_LNG).forEach(([key, value]) => {
          if (translate(value) === HISTORY_MODEL) {
            const nPnd = ALL_Histroy_PND[key];
            const getKey = GetKeyFromLNG(value, nPnd);
            if (key === getKey) {
              if (
                sysValue === "Symmetric" &&
                (getKey === "SLBT" ||
                  getKey === "SLTT" ||
                  getKey === "SLBC" ||
                  getKey === "SLTC")
              )
                dbUpdate = false;
            }
          }
        });
        break;
      case "B": // B
      case "a": // a
      case "g": // a
      case "Plus_gap": // b1
      case "Minus_gap": // b2
        if (isEmpty(InputValue) === false && isNaN(InputValue) === false) {
          // plus, minus check
          if (col === "Plus_gap" || col === "Minus_gap") {
            const fieldPM = col.split("_")[0];
            if (fieldPM === "Plus" && InputValue < 0) break;
            if (fieldPM === "Minus" && InputValue > 0) break;

            if (row["disable"] !== undefined) {
              if (
                row["disable"] === fieldPM &&
                rows[row.id][col] !== InputValue
              )
                break;
            }
          }

          let bBeta = false;
          let bAlpa = false;
          let bGamma = false;
          let bInitGap = false;
          const HISTORY_MODEL = row.HISTORY_MODEL;
          Object.entries(ALL_HistoryType_LNG).forEach(([key, value]) => {
            if (translate(value) === HISTORY_MODEL) {
              bBeta = getModelBeta(value);
              bAlpa = getModelAlpa(value);
              bGamma = getModelGamma(value);
              bInitGap = getModelInitGap(value);

              if (
                value !== "SLIP_Compression" &&
                col === "Plus_gap" &&
                parseFloat(InputValue) > parseFloat(row["Plus_D1"])
              )
                bInitGap = false;
              if (
                value !== "SLIP_Tension" &&
                col === "Minus_gap" &&
                parseFloat(InputValue) < parseFloat(row["Minus_D1"])
              )
                bInitGap = false;
            }
          });
          if (bInitGap && col === "Plus_gap") dbUpdate = true;
          if (bInitGap && col === "Minus_gap") dbUpdate = true;

          if (
            col === "B" &&
            bBeta &&
            parseFloat(InputValue) >= 0.0 &&
            parseFloat(InputValue) <= 1.0
          )
            dbUpdate = true;
          if (
            col === "a" &&
            bAlpa &&
            parseFloat(InputValue) >= 0.0 &&
            parseFloat(InputValue) <= 1.0
          )
            dbUpdate = true;
          if (
            col === "g" &&
            bGamma &&
            parseFloat(InputValue) >= 0.0 &&
            parseFloat(InputValue) <= 1.0
          )
            dbUpdate = true;
        }
        if (InputValue === "") {
          dbUpdate = true;
        }
        break;
      default: // 4 < ~~ < 4 + PnD_size*2
        if (isEmpty(InputValue) === false && isNaN(InputValue) === false) {
          // plus, minus check
          const fieldPM = col.split("_")[0];
          if (fieldPM === "Plus" && InputValue <= 0) break;
          if (fieldPM === "Minus" && InputValue >= 0) break;
          if (row["disable"] !== undefined) {
            if (row["disable"] === fieldPM && rows[row.id][col] !== InputValue)
              break;
          } else {
            if (
              row["SYMMETRIC_DISABLE"] &&
              fieldPM === "Minus" &&
              rows[row.id][col] !== InputValue
            )
              break;
          }
          // data check
          const HISTORY_MODEL = row.HISTORY_MODEL;
          Object.entries(ALL_HistoryType_LNG).forEach(([key, value]) => {
            if (translate(value) === HISTORY_MODEL) {
              const nPnd = ALL_Histroy_PND[key];
              const getKey = GetKeyFromLNG(value, nPnd);
              if (key === getKey) {
                if (parseInt(col.slice(-1)) <= nPnd) dbUpdate = true;
              }
            }
          });
        }

        if (InputValue === "") {
          const HISTORY_MODEL = row.HISTORY_MODEL;
          let minPnd = 10;
          Object.entries(ALL_HistoryType_LNG).forEach(([key, value]) => {
            if (translate(value) === HISTORY_MODEL) {
              const nPnd = ALL_Histroy_PND[key];
              minPnd = Math.min(minPnd, nPnd);
            }
          });
          if (minPnd < parseInt(col.slice(-1))) dbUpdate = true;
          if (parseInt(col.slice(-1)) <= minPnd) dbUpdate = false;
        }
        break;
    }

    AlertFunc(dbUpdate, row.id, col, InputValue);
    return dbUpdate;
  };

  const pndErrCheck = (
    pData: number[][],
    dData: number[][],
    HISTORY_MODEL: string
  ): any[] => {
    const PnD = pData.length;
    const dTol = 1.0e-9;
    switch (PnD) {
      case 4:
        if (pData[2][0] > pData[3][0]) return [false, "Plus_P3", "P3 > P4"];
        if (pData[2][1] > pData[3][1]) return [false, "Minus_P3", "P3 > P4"];
        if (dData[2][0] > dData[3][0]) return [false, "Plus_D3", "D3 > D4"];
        if (dData[2][1] > dData[3][1]) return [false, "Minus_D3", "D3 > D4"];

        if (
          dData[2][0] === dData[3][0] &&
          Math.abs(pData[2][0] - pData[3][0]) > dTol
        )
          return [false, "Plus_D4", "D4 > D3 (if P4 < P3)"];

        if (
          dData[2][1] === dData[3][1] &&
          Math.abs(pData[2][1] - pData[3][1]) > dTol
        )
          return [false, "Minus_D4", "D4 > D3 (if P4 < P3)"];

      case 3:
        if (pData[1][0] > pData[2][0]) return [false, "Plus_P2", "P2 > P3"];
        if (pData[1][1] > pData[2][1]) return [false, "Minus_P2", "P2 > P3"];
        if (dData[1][0] > dData[2][0]) return [false, "Plus_D2", "D2 > D3"];
        if (dData[1][1] > dData[2][1]) return [false, "Minus_D2", "D2 > D3"];

        if (
          dData[1][0] === dData[2][0] &&
          Math.abs(pData[1][0] - pData[2][0]) > dTol
        )
          return [false, "Plus_D3", "D3 > D2 (if P3 < P2)"];

        if (
          dData[1][1] === dData[2][1] &&
          Math.abs(pData[1][1] - pData[2][1]) > dTol
        )
          return [false, "Minus_D3", "D3 > D2 (if P3 < P2)"];

      case 2:
        if (pData[0][0] > pData[1][0]) return [false, "Plus_P1", "P1 > P2"];
        if (pData[0][1] > pData[1][1]) return [false, "Minus_P1", "P1 > P2"];
        if (dData[0][0] > dData[1][0]) return [false, "Plus_D1", "D1 > D2"];
        if (dData[0][1] > dData[1][1]) return [false, "Minus_D1", "D1 > D2"];

        if (
          dData[0][0] === dData[1][0] &&
          Math.abs(pData[0][0] - pData[1][0]) > dTol
        )
          return [false, "Plus_D2", "D2 > D1 (if P2 < P1)"];

        if (
          dData[0][1] === dData[1][1] &&
          Math.abs(pData[0][1] - pData[1][1]) > dTol
        )
          return [false, "Minus_D2", "D2 > D1 (if P2 < P1)"];

        break;
      default:
        break;
    }
    return [true, "", ""];
  };

  // alert
  useEffect(() => {
    // 5초 후에 Alert를 숨기기
    const timer = setTimeout(() => {
      setAlertMsg("");
    }, 5000);

    return () => clearTimeout(timer);
  }, [alertMsg]);

  const AlertFunc = (
    bSuccess: boolean,
    rowID: number = -1,
    colFild: string = "",
    msg: string = ""
  ) => {
    if (bSuccess) {
      const succesMsg = translate("success_change_data");
      setbError(false);
      setAlertMsg(succesMsg);
    } else {
      const rowIdx = rowID === -1 ? cursur : rowID;
      const colIdx = columns.findIndex((col) => col.field === colFild);
      if (colIdx !== -1) {
        const errMsg =
          translate("row_col_valid_error") +
          `: [Name : ${rows[rowIdx].NAME}, Header : ${columns[colIdx].headerName}] -> Input : ${msg}`;
        setbError(true);
        setAlertMsg(errMsg);
      }
    }
  };

  const alertToolbar = () => {
    return (
      <Grid width={"100%"}>
        {bError ? (
          <Alert
            style={{
              transition: "opacity 0.5s ease-out",
              opacity: alertMsg === "" ? 0 : 1,
            }}
            severity="error"
          >
            {alertMsg}
          </Alert>
        ) : (
          <Alert
            style={{
              transition: "opacity 0.5s ease-out",
              opacity: alertMsg === "" ? 0 : 1,
            }}
            severity="success"
          >
            {alertMsg}
          </Alert>
        )}
      </Grid>
    );
  };

  const checkboxSet = (selectedID: number[]) => {
    const checkBox = selectedID.filter((id) => !isEmpty(rows[id].NAME));
    setCheckBox(checkBox);
  };

  // event func
  const onClickCell: GridEventListener<"cellClick"> = (
    params,
    event: any,
    details
  ) => {
    const rowID = params.id as number;
    const field = params.field;
    setCursur(rowID);
    setField(field);
  };

  const onKeyDown: GridEventListener<"cellKeyDown"> = (
    params,
    event: any,
    details
  ) => {
    const InputValue = event.target.value;
    if (InputValue === undefined) return;
    setRows((preRows) =>
      preRows.map((Item: any) =>
        Item.id === params.row.id
          ? {
              ...Item,
              [params.field]: InputValue,
            }
          : Item
      )
    );
    if (event.key === "Enter") {
      setbEnter(true);
    }
    if (event.keyCode === 46) {
      // del button
      if (isEmpty(CheckBox)) return;
      let existedList: any[] = [];
      for (let i = 0; i < filterList.length; i++) {
        if (CheckBox.includes(i)) continue;
        existedList.push(filterList[i]);
      }

      setTableList((preTable: any) => ({
        ...preTable,
        [TableType]: existedList,
      }));
      setCheckBox([]);
    }
  };

  const onRowChange = (
    rowModesModel: GridRowModesModel,
    details: GridCallbackDetails
  ) => {
    const rowID = Object.keys(rowModesModel)[0];
    const mode = rowModesModel[rowID]?.mode;
    if (bEnter && mode === undefined) {
      const newDataList = Object.values(
        details.api.state.rows.dataRowIdToModelLookup
      ).filter((row) => row.id === cursur)[0];

      const bErr = Object.entries(newDataList).some(([key, value], idx) => {
        if (DataValid(newDataList, key, value)) return false; // no err
        else return true; // err
      });

      if (bErr) {
        initRows();
      } else {
        setRows((preRows) =>
          preRows.map((row) => (row.id === newDataList.id ? newDataList : row))
        );
        setbChange(true);
      }
    } else initRows();
  };

  const onClipboardPaste = async (params: { data: string[][] }) => {
    const startRowId: number = cursur;
    const paramsData = params.data;
    let paramsDataCount: number = params.data.length;
    // start Columns
    const index = columns.findIndex((col) => col.field === field);
    const startColumns = index !== -1 ? columns.slice(index) : [];
    let rowLength = rows.length;
    if (rowLength < startRowId + paramsDataCount) {
      const count = startRowId + paramsDataCount - rowLength;
      // for (let i = 0; i < count; i++) AddBlankRow();
      paramsDataCount += count;
      rowLength += count;
    }

    const copyErrMsg = "Paste operation cancelled";
    for (let i = startRowId; i < startRowId + paramsDataCount; i++) {
      let data = paramsData[i - startRowId];
      if (data.length < startColumns.length)
        data = data.concat(Array(startColumns.length - data.length).fill(""));

      let dataObj: { [key: string]: any } = { id: i };
      startColumns.forEach((column: any, idx) => {
        const bCheck = DataValid(dataObj, column.field, data[idx]);

        if (bCheck) dataObj[column.field] = data[idx];
        else {
          AlertFunc(false, idx, column.field, copyErrMsg);
          throw new Error(copyErrMsg);
        }
      });

      let errCol = "";
      if (isEmpty(dataObj["MATERIAL_TYPE"])) errCol = "MATERIAL_TYPE";
      else if (isEmpty(dataObj["HISTORY_MODEL"])) errCol = "HISTORY_MODEL";
      else if (isEmpty(dataObj["SYMMETRIC"])) errCol = "SYMMETRIC";

      if (!isEmpty(errCol)) {
        const msg = `no data column [${errCol}]`;
        AlertFunc(false, i, errCol, msg);
        throw new Error(copyErrMsg);
      } else {
        if (rows.length - 1 < i) setRows((preRows) => [...preRows, dataObj]);
        else
          setRows((preRows) =>
            preRows.map((row) => (row.id === dataObj.id ? dataObj : row))
          );
        setbChange(true);
      }
    }
  };

  return (
    <GuideBox
      height={hidden ? "800px" : "650px"}
      width={"100%"}
      loading={RequestBtn ? false : true}
    >
      {filterList === undefined && RequestBtn && (
        <Grid width={"100%"}>
          <Alert
            style={{
              transition: "opacity 0.5s ease-out",
              opacity: 1,
            }}
            severity="error"
          >
            {translate("TabDisp") + translate("request_noData")}
          </Alert>
        </Grid>
      )}
      {RequestBtn && (
        <DataGridPremium
          rows={rows} // rows
          columns={columns} // columns
          columnGroupingModel={groupColumns} // header group text
          // isCellEditable={
          //   (params) => disableCell(params) // disable settting
          // }
          columnGroupHeaderHeight={56} // header group height
          rowHeight={30}
          sx={DataGridStyle} // style
          editMode="row" // edit mode
          ignoreValueFormatterDuringExport // copy paste setting
          disableRowSelectionOnClick // click no row
          cellSelection // cell focus
          checkboxSelection // checkbox setting
          rowSelectionModel={CheckBox} // checkbox value
          onRowSelectionModelChange={(selectedID: any) => {
            checkboxSet(selectedID);
          }} // checkbox 이벤트
          // pagination // page setting
          // autoPageSize // auto page
          onCellClick={onClickCell} // cell click 이벤트
          onCellKeyDown={(params, event, details) =>
            onKeyDown(params, event, details)
          } // enter 이벤트
          onRowModesModelChange={(rowModesModel, details) =>
            onRowChange(rowModesModel, details)
          } // blur 이벤트
          onBeforeClipboardPasteStart={(params) => onClipboardPaste(params)} // paste 이벤트
          slots={{
            toolbar: alertToolbar, // toolbar
          }}
          disableColumnSorting // disable sort
        />
      )}
    </GuideBox>
  );
};

const DataGridStyle = {
  overflow: "auto",
  width: "100%",
  ".disable-cell": {
    backgroundColor: "#e3e3e3",
    opacity: 0.4,
    // pointerEvents: "none", // 클릭 차단
  },
  ".enable-cell": {
    // backgroundColor: "#fff",
  },
};

function formatSmallNumber(value: number) {
  // const formatter = new Intl.NumberFormat("en-US", {
  //   minimumFractionDigits: 2,
  //   maximumFractionDigits: 6, // 최대 소수점 자릿수 확장
  // });

  // if (Math.abs(value) < 1e-10) {
  //   return "0.00"; // 너무 작은 값은 0 처리
  // }

  // return formatter.format(value).replace(/,/, "");
  const formatValue = value.toExponential(4);
  return formatValue;
}

export default DispDataGrid;
