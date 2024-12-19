import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ALL_HistoryType,
  MULTLIN_HistoryType,
  MULTLIN_nType,
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

const DispDataGrid = () => {
  const TableType = useRecoilValue(TableTypeState);
  const [TableList, setTableList] = useRecoilState(TableListState);
  const [bChange, setbChange] = useRecoilState(TableChangeState);
  const filterList = useRecoilValue(filteredTableListState);
  const [CheckBox, setCheckBox] = useRecoilState(CheckBoxState);

  const [bError, setbError] = useState(false);
  const [alertMsg, setAlertMsg] = useState("");
  const [PnD_size, setPnD_size] = useState(1);
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
    console.log(filterList);
  }, [filterList, PnD_size]);

  const initRows = () => {
    if (filterList !== undefined) {
      let maxSize = 0;
      setRows([]);
      filterList.forEach((value: any, idx: any) => {
        const obj: { [key: string]: any } = {
          id: idx,
          NAME: value.NAME,
          MATERIAL_TYPE: value.MATERIAL_TYPE,
          HISTORY_MODEL: translate(ALL_HistoryType(value.HISTORY_MODEL)),
          Type: value.HISTORY_MODEL,
          SYMMETRIC: translate(SYMMETRIC[value.SYMMETRIC]),
        };
        // PnD data init
        obj["Plus_P1"] = value.DATA?.CRACKMOMENT?.[0];
        obj["Minus_P1"] = value.DATA?.CRACKMOMENT?.[1];
        obj["Plus_D1"] = value.DATA?.YIELDROTN1ST?.[0];
        obj["Minus_D1"] = value.DATA?.YIELDROTN1ST?.[1];

        obj["Plus_P2"] = value.DATA?.YIELDMOMENT?.[0];
        obj["Minus_P2"] = value.DATA?.YIELDMOMENT?.[1];

        obj["Plus_D2"] = value.DATA?.YIELDROTN2ND?.[0];
        obj["Minus_D2"] = value.DATA?.YIELDROTN2ND?.[1];

        obj["Plus_P3"] = value.DATA?.ULTIMATEMOMENT?.[0];
        obj["Minus_P3"] = value.DATA?.ULTIMATEMOMENT?.[1];

        obj["Plus_D3"] = value.DATA?.YIELDROTN3RD?.[0];
        obj["Minus_D3"] = value.DATA?.YIELDROTN3RD?.[1];

        obj["Plus_P4"] = value.DATA?.FRACTUREMOMENT?.[0];
        obj["Minus_P4"] = value.DATA?.FRACTUREMOMENT?.[1];

        obj["Plus_D4"] = value.DATA?.YIELDROTN4TH?.[0];
        obj["Minus_D4"] = value.DATA?.YIELDROTN4TH?.[1];

        // b, a, g
        const bBeta = value.BETA === undefined ? false : true;
        const bAlpa = value.ALPA === undefined ? false : true;
        const bGamma = value.GAMMA === undefined ? false : true;
        if (bBeta) {
          obj["B"] = value.BETA;
        }
        if (bAlpa) {
          obj["a"] = value.ALPA;
        }
        if (bGamma) {
          obj["g"] = value.GAMMA;
        }
        obj["bBeta"] = bBeta;
        obj["bAlpa"] = bAlpa;
        obj["bGamma"] = bGamma;

        // init gap
        const bInintGap =
          value.INIT_GAP?.[0] === undefined || value.INIT_GAP?.[1] === undefined
            ? false
            : true;
        if (bInintGap) {
          obj["plus_gap"] = value.INIT_GAP[0];
          obj["minus_gap"] = value.INIT_GAP[1];
        }
        obj["bInintGap"] = bInintGap;

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
      },
      {
        field: "MATERIAL_TYPE",
        headerName: translate("Material"),
        editable: true,
      },
      {
        field: "HISTORY_MODEL",
        headerName: translate("Hysteresis_model"),
        editable: true,
      },
      {
        field: "SYMMETRIC",
        headerName: translate("Axisymmetric"),
        editable: true,
      },
    ];

    const Plus_Columns = [
      {
        field: "Plus_P1",
        headerName: "P1",
        editable: true,
        cellClassName: (params: any) => {
          const bDisable = disableCell(params);
          return bDisable ? "enable-cell" : "disable-cell";
        },
      },
      {
        field: "Plus_D1",
        headerName: "D1",
        editable: true,
        cellClassName: (params: any) => {
          const bDisable = disableCell(params);
          return bDisable ? "enable-cell" : "disable-cell";
        },
      },
      {
        field: "Plus_P2",
        headerName: "P2",
        editable: true,
        cellClassName: (params: any) => {
          const bDisable = disableCell(params);
          return bDisable ? "enable-cell" : "disable-cell";
        },
      },
      {
        field: "Plus_D2",
        headerName: "D2",
        editable: true,
        cellClassName: (params: any) => {
          const bDisable = disableCell(params);
          return bDisable ? "enable-cell" : "disable-cell";
        },
      },
      {
        field: "Plus_P3",
        headerName: "P3",
        editable: true,
        cellClassName: (params: any) => {
          const bDisable = disableCell(params);
          return bDisable ? "enable-cell" : "disable-cell";
        },
      },
      {
        field: "Plus_D3",
        headerName: "D3",
        editable: true,
        cellClassName: (params: any) => {
          const bDisable = disableCell(params);
          return bDisable ? "enable-cell" : "disable-cell";
        },
      },
      {
        field: "Plus_P4",
        headerName: "P4",
        editable: true,
        cellClassName: (params: any) => {
          const bDisable = disableCell(params);
          return bDisable ? "enable-cell" : "disable-cell";
        },
      },
      {
        field: "Plus_D4",
        headerName: "D4",
        editable: true,
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
        cellClassName: (params: any) => {
          const bDisable = disableCell(params);
          return bDisable ? "enable-cell" : "disable-cell";
        },
      },
      {
        field: "Minus_D1",
        headerName: "D1",
        editable: true,
        cellClassName: (params: any) => {
          const bDisable = disableCell(params);
          return bDisable ? "enable-cell" : "disable-cell";
        },
      },
      {
        field: "Minus_P2",
        headerName: "P2",
        editable: true,
        cellClassName: (params: any) => {
          const bDisable = disableCell(params);
          return bDisable ? "enable-cell" : "disable-cell";
        },
      },
      {
        field: "Minus_D2",
        headerName: "D2",
        editable: true,
        cellClassName: (params: any) => {
          const bDisable = disableCell(params);
          return bDisable ? "enable-cell" : "disable-cell";
        },
      },
      {
        field: "Minus_P3",
        headerName: "P3",
        editable: true,
        cellClassName: (params: any) => {
          const bDisable = disableCell(params);
          return bDisable ? "enable-cell" : "disable-cell";
        },
      },
      {
        field: "Minus_D3",
        headerName: "D3",
        editable: true,
        cellClassName: (params: any) => {
          const bDisable = disableCell(params);
          return bDisable ? "enable-cell" : "disable-cell";
        },
      },
      {
        field: "Minus_P4",
        headerName: "P4",
        editable: true,
        cellClassName: (params: any) => {
          const bDisable = disableCell(params);
          return bDisable ? "enable-cell" : "disable-cell";
        },
      },
      {
        field: "Minus_D4",
        headerName: "D4",
        editable: true,
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
        cellClassName: (params: any) => {
          const bDisable = disableCell(params);
          return bDisable ? "enable-cell" : "disable-cell";
        },
      },
      {
        field: "a",
        headerName: "α",
        editable: true,
        cellClassName: (params: any) => {
          const bDisable = disableCell(params);
          return bDisable ? "enable-cell" : "disable-cell";
        },
      },
      {
        field: "g",
        headerName: "λ",
        editable: true,
        cellClassName: (params: any) => {
          const bDisable = disableCell(params);
          return bDisable ? "enable-cell" : "disable-cell";
        },
      },
      {
        field: "plus_gap",
        headerName: "(+)",
        editable: true,
        cellClassName: (params: any) => {
          const bDisable = disableCell(params);
          return bDisable ? "enable-cell" : "disable-cell";
        },
      },
      {
        field: "minus_gap",
        headerName: "(-)",
        editable: true,
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
        field: "PnD_Plus",
        description: "",
        headerName: `(+) ${translate("Direction")}`,
        children: Plus_children,
      },
      {
        groupId: "PnD_Minus",
        field: "PnD_Minus",
        description: "",
        headerName: `(-) ${translate("Direction")}`,
        children: Minus_children,
      },
      {
        groupId: "Gap",
        field: "Gap",
        description: "",
        headerName: translate("Gap"),
        children: [{ field: "plus_gap" }, { field: "minus_gap" }],
      },
    ];

    setGroupColumns(groupColumn);
  };

  const disableCell = (params: any) => {
    const disableField = params.field;

    if (params.row.bBeta) return disableField === "B" ? true : false;
    if (params.row.bAlpa) return disableField === "a" ? true : false;
    if (params.row.bGamma) return disableField === "g" ? true : false;
    if (params.row.bInintGap)
      return disableField === "plus_gap" || disableField === "minus_gap"
        ? true
        : false;

    // const disableCase = [
    //   "Plus_P1",
    //   "Plus_D1",
    //   "Plus_P2",
    //   "Plus_D2",
    //   "Plus_P3",
    //   "Plus_D3",
    //   "Plus_P4",
    //   "Plus_D4",
    //   "Minus_P1",
    //   "Minus_D1",
    //   "Minus_P2",
    //   "Minus_D2",
    //   "Minus_P3",
    //   "Minus_D3",
    //   "Minus_P4",
    //   "Minus_D4",
    // ];
    // switch (params.row.disable) {
    //   case 1:
    //     if (disableCase.some((e) => e === disableField)) {
    //       return false;
    //     }
    //     break;
    //   case 2:
    //     if (disableCase.slice(1).some((e) => e === disableField)) {
    //       return false;
    //     }
    //     break;
    //   case 3:
    //     if (disableField === "B") {
    //       return false;
    //     }
    //     break;
    //   default:
    //     return true;
    // }

    return true;
  };

  // tableList 변경
  useEffect(() => {
    if (bChange === false) return;
    for (let row = 0; row < rows.length; row++) {
      // name
      const NAME: string = rows[row].NAME;
      // MATERIAL_TYPE
      const MATERIAL_TYPE: string = rows[row].MATERIAL_TYPE;

      // HISTORY_MODEL
      let HISTORY_MODEL: string = "";
      Object.entries(MULTLIN_HistoryType).forEach(([key, value]) => {
        if (translate(value) === rows[row].HISTORY_MODEL) HISTORY_MODEL = key;
      });

      // MULTLIN_nType
      let MUL_TYPE: string = "";
      Object.entries(MULTLIN_nType).forEach(([key, value]) => {
        if (translate(value) === rows[row].Type) {
          MUL_TYPE = key;
        }
      });

      // PnD_Size
      const PnD_Data = [];
      for (let i = 1; i < PnD_size + 1; i++) {
        if (isNaN(rows[row][`P${i}`]) || isNaN(rows[row][`D${i}`])) {
          const noData = "No Data";
          if (isNaN(rows[row][`P${i}`]) === false)
            AlertFunc(false, `D${i}`, noData);
          else if (isNaN(rows[row][`D${i}`]) === false)
            AlertFunc(false, `P${i}`, noData);
          continue;
        } else
          PnD_Data.push([
            parseFloat(rows[row][`P${i}`]),
            parseFloat(rows[row][`D${i}`]),
          ]);
      }
      if (bEnter === false && PnD_Data.length < PnD_size) PnD_Data.push([0, 0]);

      // a1,a2, b1, b2, n - values
      const bMLPT: boolean = HISTORY_MODEL === "MLPT" ? true : false;
      const dValues: any = {
        a1: rows[row]["a1"],
        a2: rows[row][`a2`],
        B1: bMLPT ? rows[row][`B`] : rows[row]["B1"],
        B2: rows[row][`B2`],
        n: rows[row][`n`],
      };

      if (bChange === true)
        updateTableList(
          row,
          NAME,
          MATERIAL_TYPE,
          HISTORY_MODEL,
          MUL_TYPE,
          PnD_Data,
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
    MUL_TYPE: string,
    newPnDData: Array<Array<number>>,
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
            nType: idx === row ? MUL_TYPE : item.DATA.nType,
            dHysParam_Alpha1:
              idx === row ? dValues.a1 : item.DATA.dHysParam_Alpha1,
            dHysParam_Alpha2:
              idx === row ? dValues.a2 : item.DATA.dHysParam_Alpha2,
            dHysParam_Beta1:
              idx === row ? dValues.B1 : item.DATA.dHysParam_Beta1,
            dHysParam_Beta2:
              idx === row ? dValues.B2 : item.DATA.dHysParam_Beta2,
            dHysParam_Eta: idx === row ? dValues.n : item.DATA.dHysParam_Eta,
            PnD_Data: idx === row ? newPnDData : item.DATA.PnD_Data,
          },
        })),
      }));
    }
  };

  const DataValid = (row: any, col: string, InputValue: any): boolean => {
    let dbUpdate: boolean = false;
    if (InputValue === undefined || InputValue === "") dbUpdate = true;

    switch (col) {
      case "plus":
      case "id":
      case "NAME": // name
        dbUpdate = true;
        break;
      case "MATERIAL_TYPE": // material
        if (InputValue === "RS" || InputValue === "S") dbUpdate = true;
        break;
      case "HISTORY_MODEL": // historyType
        Object.entries(MULTLIN_HistoryType).forEach(([key, value]) => {
          if (translate(value) === InputValue) dbUpdate = true;
        });
        break;
      case "Type": // MUL_nType
        Object.entries(MULTLIN_nType).forEach(([key, value]) => {
          if (translate(value) === InputValue) dbUpdate = true;
        });
        break;
      case "B": // B
        if (isNaN(InputValue) === false) {
          const HISTORY_MODEL_B = row.HISTORY_MODEL;
          Object.entries(MULTLIN_HistoryType).forEach(([key, value]) => {
            if (translate(value) === HISTORY_MODEL_B && key === "MLPT")
              dbUpdate = true;
          });
        }
        break;
      case "a1": // a1
      case "a2": // a2
      case "B1": // b1
      case "B2": // b2
      case "n": // n
        if (isNaN(InputValue) === false) {
          const HISTORY_MODEL = row.HISTORY_MODEL;
          Object.entries(MULTLIN_HistoryType).forEach(([key, value]) => {
            if (translate(value) === HISTORY_MODEL && key === "MLPP")
              dbUpdate = true;
          });
        }
        break;
      default: // 4 < ~~ < 4 + PnD_size*2
        if (isNaN(InputValue) === false) {
          const MUL_nType = row.Type;
          Object.entries(MULTLIN_nType).forEach(([key, value]) => {
            if (translate(value) === MUL_nType) {
              switch (key) {
                case "1":
                  if (InputValue >= 0) dbUpdate = true;
                  break;
                case "2":
                  if (InputValue <= 0) dbUpdate = true;
                  break;
                default:
                  dbUpdate = true;
                  break;
              }
            }
          });
        }
        break;
    }
    AlertFunc(dbUpdate, col, InputValue);
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
    colFild: string = "",
    msg: string = ""
  ) => {
    if (bSuccess) {
      const succesMsg = translate("success_change_data");
      setbError(false);
      setAlertMsg(succesMsg);
    } else {
      const colIdx = columns.findIndex((col) => col.field === colFild);
      const errMsg =
        translate("row_col_valid_error") +
        `: [Name : ${rows[cursur].NAME}, Header : ${columns[colIdx].headerName}] -> Input : ${msg}`;
      setbError(true);
      setAlertMsg(errMsg);
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
    if (field === "plus") {
      setPnD_size(PnD_size + 1);
      setbChange(true);
    } else {
      setCursur(rowID);
      setField(field);
    }
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
      const data = paramsData[i - startRowId];

      let dataObj: { [key: string]: any } = { id: i };
      startColumns.forEach((column: any, idx) => {
        if (column.field === "plus") return;

        const bCheck = DataValid(dataObj, column.field, data[idx]);
        if (bCheck) dataObj[column.field] = data[idx];
        else throw new Error("Paste operation cancelled");
      });
      if (!isEmpty(dataObj)) {
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

  if (value < Number.MIN_VALUE) {
    return "0.0"; // 너무 작은 값은 0 처리
  } else if (value < 1e-21) {
    return "0.0"; // 과학적 표기법으로 출력
  }

  return formatter.format(value);
}

export default DispDataGrid;
