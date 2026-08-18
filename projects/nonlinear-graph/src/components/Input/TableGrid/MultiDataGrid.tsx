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
  LanguageState,
  RequestBtnState,
  PointState,
} from "../../../values/RecoilValue";
// UI
import { Grid, GuideBox } from "@midasit-dev/moaui";
import { DataGrid, GridColDef, GridColumnGroup } from "@mui/x-data-grid";
import { Alert } from "@mui/material";
import useGridCursor from "./hooks/useGridCursor";
import useGridAlert from "./hooks/useGridAlert";
import useGridEditing from "./hooks/useGridEditing";
import { DataGridStyle } from "./shared/gridStyle";
import { formatSmallNumber } from "./shared/format";
import { numberColumn, textColumn } from "./shared/columns";

const MultiDataGrid = () => {
  const RequestBtn = useRecoilValue(RequestBtnState);
  const PointValue = useRecoilValue(PointState);
  const TableType = useRecoilValue(TableTypeState);
  const [TableList, setTableList] = useRecoilState(TableListState);
  const [bChange, setbChange] = useRecoilState(TableChangeState);
  const filterList = useRecoilValue(filteredTableListState);
  const CheckBox = useRecoilValue(CheckBoxState);
  const hidden = useRecoilValue(HiddenBtnState);
  const lan = useRecoilValue(LanguageState);

  // const [PnD_size, setPnD_size] = useState(1);

  const { t: translate, i18n: internationalization } = useTranslation();

  const [columns, setColumns] = useState<GridColDef<any>[]>([]);
  const [groupColumns, setGroupColumns] = useState<GridColumnGroup[]>([]);
  const [rows, setRows] = useState<any[]>([]);

  const { cursur, field, onClickCell } = useGridCursor();
  const { alertMsg, AlertFunc, alertToolbar } = useGridAlert({
    rows,
    columns,
    cursur,
  });

  useEffect(() => {
    initRows();
    initCloumns();
    initGroupColumns();
  }, [filterList, PointValue, alertMsg, lan]);

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
        const obj: { [key: string]: any } = {
          id: idx,
          NAME: value.NAME,
          MATERIAL_TYPE: value.MATERIAL_TYPE,
          HISTORY_MODEL: translate(MULTLIN_HistoryType[value.HISTORY_MODEL]),
          Type: translate(MULTLIN_nType[value.DATA.nType]),
        };

        // PnD data init
        obj["pnd"] = value.DATA.PnD_Data.length;
        for (let i = 1; i < PointValue + 1; i++) {
          if (obj["pnd"] < i) {
            obj[`P${i}`] = "";
            obj[`D${i}`] = "";
          } else {
            const PnD = value.DATA.PnD_Data[i - 1];
            obj[`P${i}`] = formatSmallNumber(PnD[0]);
            obj[`D${i}`] = formatSmallNumber(PnD[1]);
          }
        }

        // b, a1, a2, b1, b2, n
        const bMLPT: boolean = value.HISTORY_MODEL === "MLPT" ? true : false;
        const bMLPP: boolean = value.HISTORY_MODEL === "MLPP" ? true : false;
        if (bMLPP) {
          obj["disable"] = 3;
          obj["a1"] = value.DATA.dHysParam_Alpha1.toFixed(1);
          obj["a2"] = value.DATA.dHysParam_Alpha2.toFixed(1);
          obj["B1"] = value.DATA.dHysParam_Beta1.toFixed(1);
          obj["B2"] = value.DATA.dHysParam_Beta2.toFixed(1);
          obj["n"] = value.DATA.dHysParam_Eta.toFixed(1);
        } else if (bMLPT) {
          obj["disable"] = 2;
          obj["B"] = value.DATA.dHysParam_Beta1.toFixed(1);
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
    }
    AddBlankRow();
  };

  const initCloumns = () => {
    setColumns([]);
    // colums
    const baseColumns = [
      textColumn("NAME", translate("Name"), 68),
      textColumn("MATERIAL_TYPE", translate("Material"), 68),
      textColumn("HISTORY_MODEL", translate("Hysteresis_model"), 160),
      textColumn("Type", translate("Type"), 130),
    ];
    for (let i = 1; i < PointValue + 1; i++) {
      baseColumns.push(numberColumn(`P${i}`, `P${i}`));
      baseColumns.push(numberColumn(`D${i}`, `D${i}`));
    }
    const remainColumns = [
      numberColumn("B", "β", isCellEnabled, 68),
      numberColumn("a1", "α1", isCellEnabled, 68),
      numberColumn("a2", "α2", isCellEnabled, 68),
      numberColumn("B1", "β1", isCellEnabled, 68),
      numberColumn("B2", "β2", isCellEnabled, 68),
      numberColumn("n", "η", isCellEnabled, 68),
    ];
    setColumns(baseColumns.concat(remainColumns));
  };
  const initGroupColumns = () => {
    setGroupColumns([]);
    const ForceChildren = [];
    for (let i = 1; i < PointValue + 1; i++) {
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

  const isCellEnabled = (params: any) => {
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
      if (
        NAME === "" ||
        NAME === undefined ||
        MATERIAL_TYPE === "" ||
        MATERIAL_TYPE === undefined
      )
        continue;

      // PnD_Size
      const PnD_Data = [];
      for (let i = 1; i < PointValue + 1; i++) {
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
      PnD_Data.sort((a, b) => a[1] - b[1]);
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
    if (filterList === undefined || row > filterList.length - 1) {
      // add
      addTable(
        NAME,
        MATERIAL_TYPE,
        HISTORY_MODEL,
        MUL_TYPE,
        newPnDData,
        dValues
      );
    } else {
      // modify
      modifyTable(
        row,
        NAME,
        MATERIAL_TYPE,
        HISTORY_MODEL,
        MUL_TYPE,
        newPnDData,
        dValues
      );
    }
  };

  const addTable = (
    NAME: string,
    MATERIAL_TYPE: string,
    HISTORY_MODEL: string,
    MUL_TYPE: string,
    newPnDData: Array<Array<number>>,
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
                nType: parseInt(MUL_TYPE),
                dHysParam_Alpha1: dValues.a1,
                dHysParam_Alpha2: dValues.a2,
                dHysParam_Beta1: dValues.B1,
                dHysParam_Beta2: dValues.B2,
                dHysParam_Eta: dValues.n,
                PnD_Data: newPnDData,
              },
            },
          ]
        : [
            {
              NAME: NAME,
              MATERIAL_TYPE: MATERIAL_TYPE,
              HISTORY_MODEL: HISTORY_MODEL,
              DATA: {
                nType: parseInt(MUL_TYPE),
                dHysParam_Alpha1: dValues.a1,
                dHysParam_Alpha2: dValues.a2,
                dHysParam_Beta1: dValues.B1,
                dHysParam_Beta2: dValues.B2,
                dHysParam_Eta: dValues.n,
                PnD_Data: newPnDData,
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
    MUL_TYPE: string,
    newPnDData: Array<Array<number>>,
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
          nType: idx === row ? parseInt(MUL_TYPE) : item.DATA.nType,
          dHysParam_Alpha1:
            idx === row ? dValues.a1 : item.DATA.dHysParam_Alpha1,
          dHysParam_Alpha2:
            idx === row ? dValues.a2 : item.DATA.dHysParam_Alpha2,
          dHysParam_Beta1: idx === row ? dValues.B1 : item.DATA.dHysParam_Beta1,
          dHysParam_Beta2: idx === row ? dValues.B2 : item.DATA.dHysParam_Beta2,
          dHysParam_Eta: idx === row ? dValues.n : item.DATA.dHysParam_Eta,
          PnD_Data: idx === row ? newPnDData : item.DATA.PnD_Data,
        },
      })),
    }));
  };

  const DataValid = (row: any, col: string, InputValue: any): boolean => {
    let dbUpdate: boolean = false;
    if (InputValue === undefined) dbUpdate = true;

    switch (col) {
      case "id":
      case "disable":
      case "pnd":
        dbUpdate = true;
        break;
      case "NAME": // name
        if (!isEmpty(InputValue)) dbUpdate = true;
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
        const HISTORY_MODEL = row.HISTORY_MODEL;
        let onlyBoth = false;
        Object.entries(MULTLIN_HistoryType).forEach(([key, value]) => {
          if (
            translate(value) === HISTORY_MODEL &&
            (key === "MLEL" || key === "MLPP")
          )
            onlyBoth = true;
        });

        Object.entries(MULTLIN_nType).forEach(([key, value]) => {
          if (translate(value) === InputValue) {
            if (onlyBoth && key === "0") dbUpdate = true;
            if (!onlyBoth) dbUpdate = true;
          }
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
                  if (parseFloat(InputValue) >= 0) dbUpdate = true;
                  break;
                case "2":
                  if (parseFloat(InputValue) <= 0) dbUpdate = true;
                  break;
                default:
                  dbUpdate = true;
                  break;
              }
            }
          });

          // check exist
          const existMsg = translate("existMsg");
          if (
            rows.length > row.id &&
            rows[row.id][col] !== InputValue &&
            col.slice(0, 1) === "D"
          ) {
            for (let i = 1; i <= PointValue; i++) {
              if (
                col !== `D${i}` &&
                parseFloat(row[`D${i}`]) === parseFloat(InputValue)
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
      AlertFunc(false, rowIndex, `NAME`, zeroErrMsg);
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
  const { checkboxSet, onKeyDown, onRowChange, pasteProps, setbEnter } =
    useGridEditing({
      rows,
      setRows,
      columns,
      cursur,
      field,
      requiredFields: ["MATERIAL_TYPE", "HISTORY_MODEL", "Type"],
      dataValid: DataValid,
      initRows,
      alert: AlertFunc,
    });

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
            {translate("TabMulti") + translate("request_noData")}
          </Alert>
        </Grid>
      )}
      {RequestBtn && (
        <div {...pasteProps}>
          {/* paste 이벤트는 pasteProps 로 처리 */}
          <DataGrid
            rows={rows} // rows
            columns={columns} // columns
            columnGroupingModel={groupColumns} // header group text
            // isCellEditable={
            //   (params) => isCellEnabled(params) // disable settting
            // }
            columnGroupHeaderHeight={56} // header group height
            rowHeight={30}
            sx={DataGridStyle} // style
            editMode="row" // edit mode
            ignoreValueFormatterDuringExport // copy paste setting
            disableRowSelectionOnClick // click no row
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
            slots={{
              toolbar: alertToolbar, // toolbar
            }}
            disableColumnSorting // disable sort
          />
        </div>
      )}
    </GuideBox>
  );
};

export default MultiDataGrid;
