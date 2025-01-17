import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { MULTLIN_HistoryType, MULTLIN_nType } from "../../../values/EnumValue";
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

const MultiDataGrid = () => {
  const TableType = useRecoilValue(TableTypeState);
  const [TableList, setTableList] = useRecoilState(TableListState);
  const [bChange, setbChange] = useRecoilState(TableChangeState);
  const filterList = useRecoilValue(filteredTableListState);
  const [CheckBox, setCheckBox] = useRecoilState(CheckBoxState);
  const hidden = useRecoilValue(HiddenBtnState);

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
  }, [filterList, PnD_size, alertMsg]);

  const initRows = () => {
    if (filterList !== undefined) {
      let maxSize = 0;
      setRows([]);
      filterList.forEach((value: any, idx: any) => {
        const obj: { [key: string]: any } = {
          id: idx,
          NAME: value.NAME,
          MATERIAL_TYPE: value.MATERIAL_TYPE,
          HISTORY_MODEL: translate(MULTLIN_HistoryType[value.HISTORY_MODEL]),
          Type: translate(MULTLIN_nType[value.DATA.nType]),
        };

        // PnD data init
        maxSize = Math.max(maxSize, value.DATA.PnD_Data.length);
        value.DATA.PnD_Data.forEach((PnD: any, idx: number) => {
          const Pdata = PnD[0];
          const Ddata = PnD[1];
          obj[`P${idx + 1}`] = formatSmallNumber(Pdata);
          obj[`D${idx + 1}`] = formatSmallNumber(Ddata);
        });
        obj["pnd"] = value.DATA.PnD_Data.length;

        // b, a1, a2, b1, b2, n
        const bMLPT: boolean = value.HISTORY_MODEL === "MLPT" ? true : false;
        const bMLPP: boolean = value.HISTORY_MODEL === "MLPP" ? true : false;
        if (bMLPP) {
          obj["disable"] = 3;
          obj["a1"] = formatSmallNumber(value.DATA.dHysParam_Alpha1);
          obj["a2"] = formatSmallNumber(value.DATA.dHysParam_Alpha2);
          obj["B1"] = formatSmallNumber(value.DATA.dHysParam_Beta1);
          obj["B2"] = formatSmallNumber(value.DATA.dHysParam_Beta2);
          obj["n"] = formatSmallNumber(value.DATA.dHysParam_Eta);
        } else if (bMLPT) {
          obj["disable"] = 2;
          obj["B"] = formatSmallNumber(value.DATA.dHysParam_Beta1);
        } else {
          obj["disable"] = 1;
          obj["B"] = undefined;
          obj["a1"] = undefined;
          obj["a2"] = undefined;
          obj["B1"] = undefined;
          obj["B2"] = undefined;
          obj["n"] = undefined;
        }
        setRows((row) => [...row, obj]);
      });
      setPnD_size(maxSize + 1);
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
        width: 160,
      },
      {
        field: "Type",
        headerName: translate("Type"),
        editable: true,
        width: 130,
      },
    ];
    for (let i = 1; i < PnD_size + 1; i++) {
      const columnP = {
        field: `P${i}`,
        headerName: `P${i}`,
        editable: true,
        width: 68,
      };
      const columnD = {
        field: `D${i}`,
        headerName: `D${i}`,
        editable: true,
        width: 68,
      };
      baseColumns.push(columnP);
      baseColumns.push(columnD);
    }
    const remainColumns = [
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
        field: "a1",
        headerName: "α1",
        editable: true,
        width: 68,
        cellClassName: (params: any) => {
          const bDisable = disableCell(params);
          return bDisable ? "enable-cell" : "disable-cell";
        },
      },
      {
        field: "a2",
        headerName: "α2",
        editable: true,
        width: 68,
        cellClassName: (params: any) => {
          const bDisable = disableCell(params);
          return bDisable ? "enable-cell" : "disable-cell";
        },
      },
      {
        field: "B1",
        headerName: "β1",
        editable: true,
        width: 68,
        cellClassName: (params: any) => {
          const bDisable = disableCell(params);
          return bDisable ? "enable-cell" : "disable-cell";
        },
      },
      {
        field: "B2",
        headerName: "β2",
        editable: true,
        width: 68,
        cellClassName: (params: any) => {
          const bDisable = disableCell(params);
          return bDisable ? "enable-cell" : "disable-cell";
        },
      },
      {
        field: "n",
        headerName: "η",
        editable: true,
        width: 68,
        cellClassName: (params: any) => {
          const bDisable = disableCell(params);
          return bDisable ? "enable-cell" : "disable-cell";
        },
      },
    ];
    setColumns(baseColumns.concat(remainColumns));
  };

  const initGroupColumns = () => {
    setGroupColumns([]);
    const ForceChildren = [];
    for (let i = 1; i < PnD_size + 1; i++) {
      const columnP = {
        field: `P${i}`,
      };
      const columnD = {
        field: `D${i}`,
      };
      ForceChildren.push(columnP);
      ForceChildren.push(columnD);
    }
    const groupColumn = [
      {
        groupId: "Force_Deformation",
        headerName: translate("Force_Deformation"),
        description: "",
        children: ForceChildren,
      },
      {
        groupId: "Hysteresis_Type_Parameter",
        headerName: translate("Hysteresis_Type_Parameter"),
        children: [
          { field: "B" },
          { field: "a1" },
          { field: "a2" },
          { field: "B1" },
          { field: "B2" },
          { field: "n" },
        ],
      },
    ];

    setGroupColumns(groupColumn);
  };

  const disableCell = (params: any) => {
    const disableField = params.field;
    const disableCase = ["B", "a1", "a2", "B1", "B2", "n"];
    switch (params.row.disable) {
      case 1:
        if (disableCase.some((e) => e === disableField)) {
          return false;
        }
        break;
      case 2:
        if (disableCase.slice(1).some((e) => e === disableField)) {
          return false;
        }
        break;
      case 3:
        if (disableField === "B") {
          return false;
        }
        break;
      default:
        return true;
    }
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
        if (isEmpty(rows[row][`P${i}`]) || isEmpty(rows[row][`D${i}`])) {
          const noData = "No Data";
          if (isEmpty(rows[row][`P${i}`]) === false)
            AlertFunc(false, -1, `D${i}`, noData);
          else if (isEmpty(rows[row][`D${i}`]) === false)
            AlertFunc(false, -1, `P${i}`, noData);
          continue;
        } else
          PnD_Data.push([
            parseFloat(rows[row][`P${i}`]),
            parseFloat(rows[row][`D${i}`]),
          ]);
      }
      PnD_Data.sort((a, b) => a[0] - b[0]);

      // PnD err Check
      if (!pndErrCheck(PnD_Data, HISTORY_MODEL, MUL_TYPE, row)) continue;

      // a1,a2, b1, b2, n - values
      const bMLPT: boolean = HISTORY_MODEL === "MLPT" ? true : false;
      const B1 = bMLPT ? rows[row][`B`] : rows[row]["B1"];
      const dValues: any = {
        a1: isEmpty(rows[row]["a1"]) ? 10.0 : parseFloat(rows[row]["a1"]),
        a2: isEmpty(rows[row]["a2"]) ? 10.0 : parseFloat(rows[row]["a2"]),
        B1: isEmpty(B1) ? 0.7 : parseFloat(B1),
        B2: isEmpty(rows[row]["B2"]) ? 0.7 : parseFloat(rows[row]["B2"]),
        n: isEmpty(rows[row]["n"]) ? 0.0 : parseFloat(rows[row]["n"]),
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
            nType: idx === row ? parseInt(MUL_TYPE) : item.DATA.nType,
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
    if (InputValue === undefined) dbUpdate = true;
    // if (InputValue === undefined || InputValue === "") dbUpdate = true;

    switch (col) {
      case "id":
      case "disable":
      case "pnd":
      case "NAME": // name
        dbUpdate = true;
        break;
      case "MATERIAL_TYPE": // material
        if (InputValue === "RC" || InputValue === "S") dbUpdate = true;
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
        if (isEmpty(InputValue) === false && isNaN(InputValue) === false) {
          const HISTORY_MODEL_B = row.HISTORY_MODEL;
          Object.entries(MULTLIN_HistoryType).forEach(([key, value]) => {
            if (translate(value) === HISTORY_MODEL_B && key === "MLPT")
              dbUpdate = true;
          });
          if (
            col === "B" &&
            (parseFloat(InputValue) <= 0.0 || parseFloat(InputValue) > 1.0)
          )
            dbUpdate = false;
        }
        if (InputValue === "") {
          dbUpdate = true;
        }
        break;
      case "a1": // a1
      case "a2": // a2
      case "B1": // b1
      case "B2": // b2
      case "n": // n
        if (isEmpty(InputValue) === false && isNaN(InputValue) === false) {
          const HISTORY_MODEL = row.HISTORY_MODEL;
          Object.entries(MULTLIN_HistoryType).forEach(([key, value]) => {
            if (translate(value) === HISTORY_MODEL && key === "MLPP")
              dbUpdate = true;
          });

          if (col === "a1" && parseFloat(InputValue) < 1.0) dbUpdate = false;
          if (col === "a2" && parseFloat(InputValue) < 1.0) dbUpdate = false;
          if (
            col === "B1" &&
            (parseFloat(InputValue) <= 0.0 || parseFloat(InputValue) > 1.0)
          )
            dbUpdate = false;
          if (
            col === "B2" &&
            (parseFloat(InputValue) <= 0.0 || parseFloat(InputValue) > 1.0)
          )
            dbUpdate = false;
          if (col === "n" && parseFloat(InputValue) < 0.0) dbUpdate = false;
        }
        if (InputValue === "") {
          dbUpdate = true;
        }
        break;
      default: // 4 < ~~ < 4 + PnD_size*2
        if (isEmpty(InputValue) === false && isNaN(InputValue) === false) {
          // data check
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

          // check exist
          const existMsg = translate("existMsg");
          if (rows[row.id][col] !== InputValue && col.slice(0, 1) === "P") {
            for (let i = 1; i <= PnD_size; i++) {
              if (
                col !== `P${i}` &&
                parseFloat(row[`P${i}`]) === parseFloat(InputValue)
              ) {
                dbUpdate = false;
                AlertFunc(false, -1, col, existMsg);
                return dbUpdate;
              }
            }
          }
        }

        if (InputValue === "") {
          dbUpdate = true;
        }
        break;
    }

    AlertFunc(dbUpdate, row.id, col, InputValue);
    return dbUpdate;
  };

  const pndErrCheck = (
    PnD_Data: number[][],
    HISTORY_MODEL: string,
    MUL_TYPE: string,
    rowIndex: number
  ): boolean => {
    // zero data check
    const zeroErrMsg = translate("Force_Disp_Zero_err");
    let bDispForceZero = PnD_Data.some((PnD) => PnD[0] === 0 && PnD[1] === 0);
    if (!bDispForceZero) {
      AlertFunc(false, -1, `NAME`, zeroErrMsg);
      return false;
    }
    let nForcePlus = 0,
      nForceMinus = 0;

    const positionErrMsg = translate("positionErrMsg");
    const sameForceErrMsg = translate("sameForceErrMsg");
    const tooSmallErrMsg = translate("tooSmallErrMsg");
    let bMinus01 = false,
      bMinus02 = false;
    let bPlus01 = false,
      bPlus02 = false;
    const bReulst = PnD_Data.every(([disp, force], idx) => {
      // position check
      if (disp > 0 && force < 0) {
        AlertFunc(false, rowIndex, `D${idx + 1}`, positionErrMsg);
        return false;
      } else if (disp < 0 && force > 0) {
        AlertFunc(false, rowIndex, `D${idx + 1}`, positionErrMsg);
        return false;
      }
      // slope check
      if (force === 0 && disp === 0) return true;
      if (disp * force <= 1e-8) {
        AlertFunc(false, rowIndex, `D${idx + 1}`, tooSmallErrMsg);
        return false;
      }
      if (idx > 0) {
        if (force < PnD_Data[idx - 1][1] && force < 0) {
          if (idx === 1) bMinus01 = true;
          else bMinus02 = true;
        } else if (force < PnD_Data[idx - 1][1] && force > 0) {
          if (idx === PnD_Data.length - 1) bPlus01 = true;
          else bPlus02 = true;
        }
      }
      // same force check
      if (
        idx > 1 &&
        idx < PnD_Data.length - 1 &&
        force === PnD_Data[idx - 1][1]
      ) {
        //  minus
        if (force < 0) {
          AlertFunc(false, rowIndex, `D${idx + 1}`, sameForceErrMsg);
          return false;
        }
        //  plus
        else if (force > 0) {
          AlertFunc(false, rowIndex, `D${idx + 1}`, sameForceErrMsg);
          return false;
        }
      }
      if (force > 0) nForcePlus++;
      else if (force < 0) nForceMinus++;
      return true;
    });
    if (!bReulst) return bReulst;

    const modelMatchErrMsg = translate("no_match_pnd");
    const slopErrMsg = translate("slopErrMsg");
    if (HISTORY_MODEL === "MLPK" || HISTORY_MODEL === "MLPT") {
      if (bMinus01 || bMinus02 || bPlus01 || bPlus02) {
        AlertFunc(false, -1, "HISTORY_MODEL", slopErrMsg);
        return false;
      }
      switch (MUL_TYPE) {
        case "0":
          if (nForcePlus !== nForceMinus || nForcePlus < 1 || nForceMinus < 1) {
            AlertFunc(false, rowIndex, "HISTORY_MODEL", modelMatchErrMsg);
            return false;
          }
          break;
        case "1":
          if (nForceMinus > 1 || nForcePlus < 1) {
            AlertFunc(false, rowIndex, "HISTORY_MODEL", modelMatchErrMsg);
            return false;
          }
          break;
        case "2":
          if (nForceMinus < 1 || nForcePlus > 1) {
            AlertFunc(false, rowIndex, "HISTORY_MODEL", modelMatchErrMsg);
            return false;
          }
          break;
      }
    } else if (HISTORY_MODEL === "MLEL" || HISTORY_MODEL === "MLPP") {
      if (bMinus02 || bPlus02) {
        AlertFunc(false, rowIndex, "HISTORY_MODEL", slopErrMsg);
        return false;
      }
      if (HISTORY_MODEL === "MLPP" && (nForcePlus < 1 || nForceMinus < 1)) {
        AlertFunc(false, rowIndex, "HISTORY_MODEL", modelMatchErrMsg);
        return false;
      }
    }
    return true;
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

    const copyErrMsg = "Paste operation cancelled";
    for (let i = startRowId; i < startRowId + paramsDataCount; i++) {
      if (rows.length === i) break;
      const data = paramsData[i - startRowId];
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
      else if (isEmpty(dataObj["Type"])) errCol = "Type";

      if (!isEmpty(errCol)) {
        const msg = `no data column [${errCol}]`;
        AlertFunc(false, i, errCol, msg);
        throw new Error(copyErrMsg);
      } else {
        setRows((preRows) =>
          preRows.map((row) => (row.id === dataObj.id ? dataObj : row))
        );
        setbChange(true);
      }
    }
  };

  return (
    <GuideBox
      height={hidden ? "600px" : "400px"}
      width={"100%"}
      loading={filterList === undefined ? true : false}
    >
      {filterList !== undefined && (
        <DataGridPremium
          rows={rows} // rows
          columns={columns} // columns
          columnGroupingModel={groupColumns} // header group text
          // isCellEditable={
          //   (params) => disableCell(params) // disable settting
          // }
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
    // pointerEvents: "none", // 클릭 차단
  },
  ".enable-cell": {
    // backgroundColor: "#fff",
  },
};

// 소수점 표기
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

export default MultiDataGrid;
