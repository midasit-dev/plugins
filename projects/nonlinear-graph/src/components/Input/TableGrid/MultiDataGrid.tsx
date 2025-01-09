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
        } else obj["disable"] = 1;
        setRows((row) => [...row, obj]);
      });
      setPnD_size(maxSize);
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
        field: "plus",
        headerName: "+",
        editable: false,
        width: 40,
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
    ForceChildren.push({ field: "plus" });
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
            AlertFunc(false, 0, `D${i}`, noData);
          else if (isEmpty(rows[row][`D${i}`]) === false)
            AlertFunc(false, 0, `P${i}`, noData);
          continue;
        } else
          PnD_Data.push([
            parseFloat(rows[row][`P${i}`]),
            parseFloat(rows[row][`D${i}`]),
          ]);
      }
      if (bEnter === false && PnD_Data.length < PnD_size)
        PnD_Data.push([0.0, 0.0]);

      // a1,a2, b1, b2, n - values
      const bMLPT: boolean = HISTORY_MODEL === "MLPT" ? true : false;
      const B1 = bMLPT
        ? parseFloat(rows[row][`B`])
        : parseFloat(rows[row]["B1"]);
      const dValues: any = {
        a1: isEmpty(rows[row]["a1"]) ? 10.0 : parseFloat(rows[row]["a1"]),
        a2: isEmpty(rows[row]["a2"]) ? 10.0 : parseFloat(rows[row]["a2"]),
        B1: isEmpty(B1) ? 0.7 : B1,
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
      case "disable":
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

      let dataObj: { [key: string]: any } = {};
      startColumns.forEach((column: any, idx) => {
        if (column.field === "plus") return;

        const bCheck = DataValid(dataObj, column.field, data[idx]);
        if (bCheck) dataObj[column.field] = data[idx];
        else throw new Error("Paste operation cancelled");
      });

      let errCol = "";
      if (isEmpty(dataObj["MATERIAL_TYPE"])) errCol = "MATERIAL_TYPE";
      else if (isEmpty(dataObj["HISTORY_MODEL"])) errCol = "HISTORY_MODEL";
      else if (isEmpty(dataObj["Type"])) errCol = "Type";

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
    <GuideBox
      height={filterList !== undefined ? "50vh" : "10vh"}
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
