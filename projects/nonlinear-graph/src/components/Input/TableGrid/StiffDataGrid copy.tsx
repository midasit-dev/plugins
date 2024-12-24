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

const StiffDataGrid = () => {
  const TableType = useRecoilValue(TableTypeState);
  const [TableList, setTableList] = useRecoilState(TableListState);
  const [bChange, setbChange] = useRecoilState(TableChangeState);
  const filterList = useRecoilValue(filteredTableListState);
  const [CheckBox, setCheckBox] = useRecoilState(CheckBoxState);

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
  }, [filterList, alertMsg]);

  const initRows = () => {
    if (filterList !== undefined) {
      setRows([]);
      filterList.forEach((value: any, idx: any) => {
        const HISTORY_MODEL = ALL_HistoryType_LNG[value.HISTORY_MODEL];

        const obj: { [key: string]: any } = {
          id: idx,
          NAME: value.NAME,
          MATERIAL_TYPE: value.MATERIAL_TYPE,
          HISTORY_MODEL: translate(HISTORY_MODEL),
          SYMMETRIC: translate(SYMMETRIC[value.DATA.SYMMETRIC]),
        };

        // PnD data init
        const nPnd = value.DATA.PND;
        obj["pnd"] = nPnd;
        let maxPnd = nPnd;
        Object.entries(ALL_HistoryType_LNG).forEach(([key, value], idx) => {
          if (value === HISTORY_MODEL)
            maxPnd = Math.max(maxPnd, ALL_Histroy_PND[key] - 1);
        });
        const pDataArr = [
          ["Plus_P1", "Minus_P1"],
          ["Plus_P2", "Minus_P2"],
          ["Plus_P3", "Minus_P3"],
        ];
        const dDataArr = [
          ["Plus_A1", "Minus_A1"],
          ["Plus_A2", "Minus_A2"],
          ["Plus_A3", "Minus_A3"],
        ];
        pDataArr.some(([plusField, minusField], idx) => {
          // if (maxPnd < idx + 1) return false;
          if (nPnd < idx + 1) {
            obj[plusField] = "";
            obj[minusField] = "";
          } else {
            const pData = value.DATA.P_DATA?.[idx];
            obj[plusField] = isEmpty(pData) ? "" : formatSmallNumber(pData[0]);
            obj[minusField] = isEmpty(pData) ? "" : formatSmallNumber(pData[1]);
          }
        });
        dDataArr.some(([plusField, minusField], idx) => {
          // if (maxPnd < idx + 1) return false;
          if (nPnd < idx + 1) {
            obj[plusField] = "";
            obj[minusField] = "";
          } else {
            const dData = value.DATA.D_DATA?.[idx];
            obj[plusField] = isEmpty(dData) ? "" : formatSmallNumber(dData[0]);
            obj[minusField] = isEmpty(dData) ? "" : formatSmallNumber(dData[1]);
          }
        });

        // Init Stiff
        obj["INITSTIFFNESS"] =
          value.DATA.INITSTIFFNESS === 1
            ? "E"
            : formatSmallNumber(value.DATA.INITSTIFFNESS);

        // b, a, g
        const HistoryModelLNG = ALL_HistoryType_LNG[value.HISTORY_MODEL];
        const bBeta = getModelBeta(HistoryModelLNG);
        const bAlpa = getModelAlpa(HistoryModelLNG);
        const bGamma = getModelGamma(HistoryModelLNG);
        if (bBeta) obj["B"] = formatSmallNumber(parseFloat(value.DATA.BETA));
        if (bAlpa) obj["a"] = formatSmallNumber(value.DATA.ALPA);
        if (bGamma) obj["g"] = formatSmallNumber(value.DATA.GAMMA);

        // init gap
        const bInitGap = getModelInitGap(HistoryModelLNG);
        if (bInitGap) {
          obj["plus_gap"] = formatSmallNumber(value.DATA.INIT_GAP[0]);
          obj["minus_gap"] = formatSmallNumber(value.DATA.INIT_GAP[1]);
        }
        setRows((row) => [...row, obj]);
      });
    }
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
        width: 68,
        cellClassName: (params: any) => {
          const bDisable = disableCell(params);
          return bDisable ? "enable-cell" : "disable-cell";
        },
      },
      {
        field: "Plus_P2",
        headerName: "P2",
        editable: true,
        width: 68,
        cellClassName: (params: any) => {
          const bDisable = disableCell(params);
          return bDisable ? "enable-cell" : "disable-cell";
        },
      },
      {
        field: "Plus_P3",
        headerName: "P3",
        editable: true,
        width: 68,
        cellClassName: (params: any) => {
          const bDisable = disableCell(params);
          return bDisable ? "enable-cell" : "disable-cell";
        },
      },
      {
        field: "Plus_A1",
        headerName: "α1",
        editable: true,
        width: 68,
        cellClassName: (params: any) => {
          const bDisable = disableCell(params);
          return bDisable ? "enable-cell" : "disable-cell";
        },
      },

      {
        field: "Plus_A2",
        headerName: "α2",
        editable: true,
        width: 68,
        cellClassName: (params: any) => {
          const bDisable = disableCell(params);
          return bDisable ? "enable-cell" : "disable-cell";
        },
      },
      {
        field: "Plus_A3",
        headerName: "α3",
        editable: true,
        width: 68,
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
        width: 68,
        cellClassName: (params: any) => {
          const bDisable = disableCell(params);
          return bDisable ? "enable-cell" : "disable-cell";
        },
      },
      {
        field: "Minus_P2",
        headerName: "P2",
        editable: true,
        width: 68,
        cellClassName: (params: any) => {
          const bDisable = disableCell(params);
          return bDisable ? "enable-cell" : "disable-cell";
        },
      },
      {
        field: "Minus_P3",
        headerName: "P3",
        editable: true,
        width: 68,
        cellClassName: (params: any) => {
          const bDisable = disableCell(params);
          return bDisable ? "enable-cell" : "disable-cell";
        },
      },
      {
        field: "Minus_A1",
        headerName: "α1",
        editable: true,
        width: 68,
        cellClassName: (params: any) => {
          const bDisable = disableCell(params);
          return bDisable ? "enable-cell" : "disable-cell";
        },
      },

      {
        field: "Minus_A2",
        headerName: "α2",
        editable: true,
        width: 68,
        cellClassName: (params: any) => {
          const bDisable = disableCell(params);
          return bDisable ? "enable-cell" : "disable-cell";
        },
      },

      {
        field: "Minus_A3",
        headerName: "α3",
        editable: true,
        width: 68,
        cellClassName: (params: any) => {
          const bDisable = disableCell(params);
          return bDisable ? "enable-cell" : "disable-cell";
        },
      },
    ];

    const remainColumns = [
      {
        field: "INITSTIFFNESS",
        headerName: translate("Init_Stiff"),
        editable: true,
        width: 75,
        cellClassName: (params: any) => {
          const bDisable = disableCell(params);
          return bDisable ? "enable-cell" : "disable-cell";
        },
      },
      {
        field: "B",
        headerName: "β",
        editable: true,
        width: 68,
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
        cellClassName: (params: any) => {
          const bDisable = disableCell(params);
          return bDisable ? "enable-cell" : "disable-cell";
        },
      },
      {
        field: "plus_gap",
        headerName: "(+)",
        editable: true,
        width: 68,
        cellClassName: (params: any) => {
          const bDisable = disableCell(params);
          return bDisable ? "enable-cell" : "disable-cell";
        },
      },
      {
        field: "minus_gap",
        headerName: "(-)",
        editable: true,
        width: 68,
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
      { field: "Plus_P2" },
      { field: "Plus_P3" },
      { field: "Plus_A1" },
      { field: "Plus_A2" },
      { field: "Plus_A3" },
    ];
    const Minus_children = [
      { field: "Minus_P1" },
      { field: "Minus_P2" },
      { field: "Minus_P3" },
      { field: "Minus_A1" },
      { field: "Minus_A2" },
      { field: "Minus_A3" },
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
        children: [{ field: "plus_gap" }, { field: "minus_gap" }],
      },
    ];

    setGroupColumns(groupColumn);
  };

  const disableCell = (params: any) => {
    const disableField = params.field;

    if (params.row[disableField] === undefined) return false;
    else return true;
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
      let symmetric: string = "";
      Object.entries(SYMMETRIC).forEach(([key, value]) => {
        if (translate(value) === rows[row].SYMMETRIC) symmetric = key;
      });

      // p_data
      const pData = [];
      for (let i = 1; i < 4; i++) {
        if (
          isEmpty(rows[row][`Plus_P${i}`]) ||
          isEmpty(rows[row][`Minus_P${i}`])
        ) {
          const noData = "No Data";
          if (isEmpty(rows[row][`Plus_P${i}`]) === false)
            AlertFunc(false, 0, `Minus_P${i}`, noData);
          else if (isEmpty(rows[row][`Minus_P${i}`]) === false)
            AlertFunc(false, 0, `Plus_P${i}`, noData);
          continue;
        } else
          pData.push([
            parseFloat(rows[row][`Plus_P${i}`]),
            parseFloat(rows[row][`Minus_P${i}`]),
          ]);
      }

      // A_data
      const dData = [];
      for (let i = 1; i < 4; i++) {
        if (
          isEmpty(rows[row][`Plus_A${i}`]) ||
          isEmpty(rows[row][`Minus_A${i}`])
        ) {
          const noData = "No Data";
          if (isEmpty(rows[row][`Plus_A${i}`]) === false)
            AlertFunc(false, 0, `Minus_A${i}`, noData);
          else if (isEmpty(rows[row][`Minus_A${i}`]) === false)
            AlertFunc(false, 0, `Plus_A${i}`, noData);
          continue;
        } else
          dData.push([
            parseFloat(rows[row][`Plus_A${i}`]),
            parseFloat(rows[row][`Minus_A${i}`]),
          ]);
      }
      if (pData.length !== dData.length) {
        const noData = "+ or - No Data";
        const col =
          pData.length > dData.length
            ? `Plus_A${dData.length + 1}`
            : `Plus_P${pData.length + 1}`;
        AlertFunc(false, 0, col, noData);
        continue;
      }

      // HISTORY_MODEL
      let HISTORY_MODEL: string = "";
      let HISTORY_MODEL_LNG: string = "";
      Object.entries(ALL_HistoryType_LNG).forEach(([key, value]) => {
        if (translate(value) === rows[row].HISTORY_MODEL) {
          const getKey = GetKeyFromLNG(value, pData.length + 1);
          if (key === getKey) {
            HISTORY_MODEL = key;
            HISTORY_MODEL_LNG = value;
          }
        }
      });
      if (HISTORY_MODEL === "") {
        const noData = `[P or α] Data don't match ${translate(
          "Hysteresis_model"
        )}`;
        const col = "HISTORY_MODEL";
        AlertFunc(false, row, col, noData);
        continue;
      }
      // Init Stiff
      const defaultStiff =
        rows[row].INITSTIFFNESS === "" || rows[row].INITSTIFFNESS === "E"
          ? 1
          : parseFloat(rows[row].INITSTIFFNESS);
      const InitStiff = defaultStiff;

      // b, a, g, plus_gap, minus_gap- values
      const bBeta = getModelBeta(HISTORY_MODEL_LNG);
      const bAlpa = getModelAlpa(HISTORY_MODEL_LNG);
      const bGamma = getModelGamma(HISTORY_MODEL_LNG);
      const bInitGap = getModelInitGap(HISTORY_MODEL_LNG);

      const Beta = isEmpty(rows[row].B) ? 0.5 : parseFloat(rows[row].B);
      const Alpa = isEmpty(rows[row].a) ? 1.0 : parseFloat(rows[row].a);
      const Gamma = isEmpty(rows[row].g) ? 0.5 : parseFloat(rows[row].g);
      const PlusGap = isEmpty(rows[row].plus_gap)
        ? 0.0
        : parseFloat(rows[row].plus_gap);
      const MinusGap = isEmpty(rows[row].minus_gap)
        ? 0.0
        : parseFloat(rows[row].minus_gap);
      const dValues: any = {
        INITSTIFFNESS: InitStiff,
        B: bBeta ? Beta : undefined,
        a: bAlpa ? Alpa : undefined,
        g: bGamma ? Gamma : undefined,
        plus_gap: bInitGap ? PlusGap : undefined,
        minus_gap: bInitGap ? MinusGap : undefined,
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
    SYMMETRIC: string,
    pData: Array<Array<number>>,
    dData: Array<Array<number>>,
    dValues: any
  ) => {
    if (TableList !== undefined) {
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
                ? [dValues.plus_gap, dValues.minus_gap]
                : item.DATA.INIT_GAP,
            P_DATA: idx === row ? pData : item.DATA.P_DATA,
            D_DATA: idx === row ? dData : item.DATA.D_DATA,
            PND: idx === row ? pData.length : item.DATA.PND,
          },
        })),
      }));
    }
  };

  const DataValid = (row: any, col: string, InputValue: any): boolean => {
    let dbUpdate: boolean = false;
    if (InputValue === undefined) dbUpdate = true;
    // if (InputValue === undefined || InputValue === "") dbUpdate = true;

    switch (col) {
      case "id":
      case "NAME": // name
      case "pnd":
        dbUpdate = true;
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
        Object.entries(SYMMETRIC).forEach(([key, value]) => {
          if (translate(value) === InputValue) dbUpdate = true;
        });
        break;
      case "INITSTIFFNESS":
        if (InputValue === "E") dbUpdate = true;
        else if (isNaN(InputValue) === false) {
          dbUpdate = true;
        }
        break;
      case "B": // B
      case "a": // a
      case "g": // a
      case "plus_gap": // b1
      case "minus_gap": // b2
        if (isNaN(InputValue) === false) {
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
            }
          });
          if (bBeta && col === "B") dbUpdate = true;
          if (bAlpa && col === "a") dbUpdate = true;
          if (bGamma && col === "g") dbUpdate = true;
          if (bInitGap && col === "plus_gap") dbUpdate = true;
          if (bInitGap && col === "minus_gap") dbUpdate = true;
        }
        if (InputValue === "") {
          dbUpdate = true;
        }
        break;
      default: // 4 < ~~ < 4 + PnD_size*2
        if (isNaN(InputValue) === false) {
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
              const nPnd = ALL_Histroy_PND[key] - 1;
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
    rowID: number = 0,
    colFild: string = "",
    msg: string = ""
  ) => {
    if (bSuccess) {
      const succesMsg = translate("success_change_data");
      setbError(false);
      setAlertMsg(succesMsg);
    } else {
      const rowIdx = rowID === 0 ? cursur : rowID;
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
    const paramsDataCount: number = params.data.length;
    // start Columns
    const index = columns.findIndex((col) => col.field === field);
    const startColumns = index !== -1 ? columns.slice(index) : [];

    for (let i = startRowId; i < startRowId + paramsDataCount; i++) {
      if (rows.length === i) break;
      let data = paramsData[i - startRowId];
      if (data.length < startColumns.length)
        data = data.concat(Array(startColumns.length - data.length).fill(""));

      let dataObj: { [key: string]: any } = {};
      startColumns.forEach((column: any, idx) => {
        const bCheck = DataValid(dataObj, column.field, data[idx]);
        if (bCheck) dataObj[column.field] = data[idx];
        else throw new Error("Paste operation cancelled");
      });

      let errCol = "";
      if (isEmpty(dataObj["MATERIAL_TYPE"])) errCol = "MATERIAL_TYPE";
      else if (isEmpty(dataObj["HISTORY_MODEL"])) errCol = "HISTORY_MODEL";
      else if (isEmpty(dataObj["SYMMETRIC"])) errCol = "SYMMETRIC";

      if (!isEmpty(errCol)) {
        const msg = `no data column [${errCol}]`;
        AlertFunc(false, i, errCol, msg);
        throw new Error("Paste operation cancelled");
      } else {
        dataObj["id"] = i;
        setRows((preRows) =>
          preRows.map((row) => (row.id === dataObj.id ? dataObj : row))
        );
        setbChange(true);
      }
    }
  };

  return (
    <GuideBox height={filterList !== undefined ? "50vh" : "0"} width={"100%"}>
      {filterList !== undefined && (
        <DataGridPremium
          rows={rows} // rows
          columns={columns} // columns
          columnGroupingModel={groupColumns} // header group text
          isCellEditable={
            (params) => disableCell(params) // disable settting
          }
          columnGroupHeaderHeight={56} // header group height
          sx={DataGridStyle} // style
          editMode="row" // edit mode
          ignoreValueFormatterDuringExport // copy paste setting
          disableRowSelectionOnClick // click no row
          cellSelection // cell focus
          checkboxSelection // checkbox setting
          rowSelectionModel={CheckBox} // checkbox value
          onRowSelectionModelChange={(selectedID: any) => {
            setCheckBox(selectedID);
          }} // checkbox 이벤트
          pagination // page setting
          autoPageSize // auto page
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
    pointerEvents: "none", // 클릭 차단
  },
  ".enable-cell": {
    // backgroundColor: "#fff",
  },
};

function formatSmallNumber(value: number) {
  const formatter = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 20, // 최대 소수점 자릿수 확장
  });

  if (Math.abs(value) < 1e-10) {
    return "0.0"; // 너무 작은 값은 0 처리
  }

  return formatter.format(value).replace(/,/, "");
}

export default StiffDataGrid;
