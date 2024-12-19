import {
  // Table,
  // TableHead,
  // TableRow,
  // TableCell,
  Typography,
  // TableBody,
  GuideBox,
  Stack,
  Grid,
  Button,
  TextField,
} from "@midasit-dev/moaui";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  Alert,
  // styled,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { useRecoilState, useRecoilValue } from "recoil";
import {
  TableTypeState,
  TableListState,
  filteredTableListState,
  TableChangeState,
  CheckBoxState,
} from "../../../values/RecoilValue";
import { MULTLIN_HistoryType, MULTLIN_nType } from "../../../values/EnumValue";
import { filter, isNull, isUndefined } from "lodash";

interface HeaderProps {
  props: {
    PnD_size: number;
    hoverColumn: number | null;
    DataList: any[];
  };
  propFunc: {
    setPnD_size: React.Dispatch<React.SetStateAction<number>>;
    setHoverColumn: React.Dispatch<React.SetStateAction<number | null>>;
  };
}

const SetHeader: React.FC<HeaderProps> = ({ props, propFunc }) => {
  const { PnD_size, hoverColumn, DataList } = props;
  const { setPnD_size, setHoverColumn } = propFunc;
  const filterList = useRecoilValue(filteredTableListState);
  const [bChange, setbChange] = useRecoilState(TableChangeState);
  const [CheckBox, setCheckBox] = useRecoilState(CheckBoxState);

  const [allCheck, setAllCheck] = useState(false);
  const [dynamicHeader, setDynamicHeader] = useState<string[]>([]);

  const { t: translate, i18n: internationalization } = useTranslation();

  useEffect(() => {
    // header
    for (let i = 1; i < PnD_size + 1; i++) {
      initHeader.push(`P${i}`);
      initHeader.push(`D${i}`);
    }
    initHeader.push(`+`);
    setDynamicHeader(initHeader.concat(paramHeader));
  }, [PnD_size]);

  // header
  const staticHeader = [
    "",
    "",
    "",
    "",
    "",
    translate("Force_Deformation"),
    translate("Hysteresis_Type_Parameter"),
  ];
  const initHeader = [
    translate("Name"),
    translate("Material"),
    translate("Hysteresis_model"),
    translate("Type"),
  ];
  const paramHeader = ["β", "α1", "α2", "β1", "β2", "η"];

  function onSelectAllClick(event: any) {
    const checFalsekList = filterList.map(() => false);
    const checTruekList = filterList.map(() => true);
    if (allCheck) {
      setAllCheck(false);
      setCheckBox(checFalsekList);
    } else {
      setAllCheck(true);
      setCheckBox(checTruekList);
    }
  }

  function onClickPlus(idx: any) {
    if (idx == 4 + PnD_size * 2) {
      setPnD_size(PnD_size + 1);
      setbChange(true);
    }
  }

  return (
    <TableHead style={headerStyles}>
      <TableRow>
        {staticHeader.map((header, idx) => {
          let colspan = 0;
          let style = { border: "1px solid #ddd" };
          if (idx == 5) colspan = PnD_size * 2 + 1;
          else if (idx > 5) colspan = 7;
          else style = { border: "" };
          return (
            <TableCell key={idx} colSpan={colspan} style={style}>
              <Typography center>{header}</Typography>
            </TableCell>
          );
        })}
      </TableRow>
      <TableRow>
        <TableCell>
          <Checkbox
            sx={checkboxStyle}
            color="primary"
            checked={allCheck}
            // indeterminate={allCheck}
            onChange={(event) => onSelectAllClick(event)}
          />
        </TableCell>
        {dynamicHeader.map((header, idx) => {
          return (
            <HeaderStyleCell
              key={idx}
              mycolumn={idx}
              hovercolumn={hoverColumn}
              onMouseEnter={() => setHoverColumn(idx)}
              onMouseLeave={() => setHoverColumn(null)}
              onClick={() => onClickPlus(idx)}
            >
              <Typography center>{header}</Typography>
            </HeaderStyleCell>
          );
        })}
      </TableRow>
    </TableHead>
  );
};

const MutiTable = () => {
  const TableType = useRecoilValue(TableTypeState);
  const [TableList, setTableList] = useRecoilState(TableListState);
  const [bChange, setbChange] = useRecoilState(TableChangeState);
  const filterList = useRecoilValue(filteredTableListState);
  const [CheckBox, setCheckBox] = useRecoilState(CheckBoxState);

  const [bError, setbError] = useState(false);
  const [alertMsg, setAlertMsg] = useState("");
  const [DataList, setDataList] = useState<any>([]);
  const [PnD_size, setPnD_size] = useState(1);
  const [hoverColumn, setHoverColumn] = useState<number | null>(null);
  const [ClipboardData, setClipboardData] = useState<string[][]>([]);

  const { t: translate, i18n: internationalization } = useTranslation();

  useEffect(() => {
    initDataList();
  }, [filterList]);

  const initDataList = () => {
    if (filterList !== undefined) {
      setDataList([]);
      // setCheckBox([]);
      let maxSize = 0;
      filterList.forEach((value: any) => {
        let list = [
          value.NAME,
          value.MATERIAL_TYPE,
          translate(MULTLIN_HistoryType[value.HISTORY_MODEL]),
          translate(MULTLIN_nType[value.DATA.nType]),
        ];

        // PnD data init
        maxSize = Math.max(maxSize, value.DATA.PnD_Data.length);
        value.DATA.PnD_Data.forEach((PnD: any) => {
          const Pdata = PnD[0];
          const Ddata = PnD[1];
          list.push(Pdata);
          list.push(Ddata);
        });
        if (maxSize > value.DATA.PnD_Data.length) {
          const gap = maxSize - value.DATA.PnD_Data.length;
          for (let i = 0; i < gap * 2; i++) {
            list.push("[NULL]");
          }
        }
        list.push("[PLUS]");

        // HISTORY_MODEL case
        const bMLPT: boolean = value.HISTORY_MODEL === "MLPT" ? true : false;
        const bMLPP: boolean = value.HISTORY_MODEL === "MLPP" ? true : false;
        list.push(bMLPT ? value.DATA.dHysParam_Beta1 : "[NULL]");
        list.push(bMLPP ? value.DATA.dHysParam_Alpha1 : "[NULL]");
        list.push(bMLPP ? value.DATA.dHysParam_Alpha2 : "[NULL]");
        list.push(bMLPP ? value.DATA.dHysParam_Beta1 : "[NULL]");
        list.push(bMLPP ? value.DATA.dHysParam_Beta2 : "[NULL]");
        list.push(bMLPP ? value.DATA.dHysParam_Eta : "[NULL]");

        setDataList((preList: any) => [...preList, list]);
        // setCheckBox((check) => [...check, false]);
      });
      setPnD_size(maxSize);
    }
  };

  // tableList 변경
  useEffect(() => {
    if (bChange === false) return;

    for (let row = 0; row < DataList.length; row++) {
      // name
      const NAME: string = DataList[row][0];

      // MATERIAL_TYPE
      const MATERIAL_TYPE: string = DataList[row][1];

      // HISTORY_MODEL
      let HISTORY_MODEL: string = "";
      Object.entries(MULTLIN_HistoryType).forEach(([key, value]) => {
        if (translate(value) === DataList[row][2]) HISTORY_MODEL = key;
      });

      // MULTLIN_nType
      let MUL_TYPE: string = "";
      Object.entries(MULTLIN_nType).forEach(([key, value]) => {
        if (translate(value) === DataList[row][3]) {
          MUL_TYPE = key;
        }
      });

      // PnD_Size 에 따른 talbeList 값 변경
      const PnD_Data = [];
      for (let i = 0; i < PnD_size; i++) {
        if (
          DataList[row][4 + i * 2] === "[PLUS]" ||
          DataList[row][4 + (i * 2 + 1)] === "[PLUS]"
        ) {
          PnD_Data.push([0, 0]);
        } else if (
          DataList[row][4 + i * 2] === "[NULL]" ||
          DataList[row][4 + (i * 2 + 1)] === "[NULL]"
        ) {
          continue;
        } else
          PnD_Data.push([
            parseFloat(DataList[row][4 + i * 2]),
            parseFloat(DataList[row][4 + (i * 2 + 1)]),
          ]);
      }
      if (bChange === true)
        updateData(row, NAME, MATERIAL_TYPE, HISTORY_MODEL, MUL_TYPE, PnD_Data);
    }
    if (bChange === true) setbChange(false);
  }, [bChange]);

  const updateData = (
    row: number,
    NAME: string,
    MATERIAL_TYPE: string,
    HISTORY_MODEL: string,
    MUL_TYPE: string,
    newPnDData: Array<Array<number>>
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
            PnD_Data: idx === row ? newPnDData : item.DATA.PnD_Data,
          },
        })),
      }));
    }
  };

  const DataValid = (row: number, col: number, InputValue: any): boolean => {
    let dbUpdate: boolean = false;
    switch (col) {
      case 0: // name
        dbUpdate = true;
        break;
      case 1: // material
        if (InputValue === "RS" || InputValue === "S") dbUpdate = true;
        break;
      case 2: // historyType
        Object.entries(MULTLIN_HistoryType).forEach(([key, value]) => {
          if (translate(value) === InputValue) dbUpdate = true;
        });
        break;
      case 3: // MUL_nType
        Object.entries(MULTLIN_nType).forEach(([key, value]) => {
          if (translate(value) === InputValue) dbUpdate = true;
        });
        break;
      case 4 + PnD_size * 2 + 1: // B
      case 4 + PnD_size * 2 + 2: // a1
      case 4 + PnD_size * 2 + 3: // a2
      case 4 + PnD_size * 2 + 4: // b1
      case 4 + PnD_size * 2 + 5: // b2
      case 4 + PnD_size * 2 + 6: // n
        if (isNaN(InputValue) === false) dbUpdate = true;
        break;
      default: // 4 < ~~ < 4 + PnD_size*2
        if (isNaN(InputValue) === false) {
          const MUL_nType = DataList[row][3];
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
    if (dbUpdate) {
      const succesMsg = translate("success_change_data");
      setbError(false);
      setAlertMsg(succesMsg);
      return dbUpdate;
    } else {
      const errMsg =
        translate("row_col_valid_error") +
        `: [${row + 1}, ${col + 1}] -> InputValue : ${InputValue}`;
      setbError(true);
      setAlertMsg(errMsg);
      return dbUpdate;
    }
  };

  function onChangeTextHandler(event: any, row: number, col: number) {
    const element = document.getElementById(
      event.target.id
    ) as HTMLInputElement;
    setDataList(
      DataList.map((Item: any, idx: number) =>
        row === idx
          ? Item.map((el: any, colIdx: number) =>
              colIdx === col ? element.value : el
            )
          : Item
      )
    );
  }

  function onCheckBox(event: any, row: number) {
    const tmp = [...CheckBox];
    // if (event.target.checked) {
    //   tmp[row] = true;
    //   setCheckBox(tmp);
    // } else {
    //   tmp[row] = false;
    //   setCheckBox(tmp);
    // }
  }

  function onBlurInit(event: any, row: number, col: number) {
    // initDataList();
    const InputValue = event.target.value; // 현재 input의 값을 참조
    const dbUpdate = DataValid(row, col, InputValue);
    if (dbUpdate) {
      setbChange(dbUpdate);
    } else {
      initDataList();
    }
  }

  async function onKeydownHandler(event: any, row: number, col: number) {
    if (event.key === "Enter") {
      const InputValue = event.target.value; // 현재 input의 값을 참조
      const dbUpdate = DataValid(row, col, InputValue);
      if (dbUpdate) {
        setbChange(dbUpdate);
      } else {
        initDataList();
      }
    }
  }

  async function onCopyPaste(event: any, row: number) {
    if (DataList.length === 0) return;

    if (event.ctrlKey && event.key === "c") {
      // ctrl + c 동작
      // const checkRows = CheckBox.map((check: boolean, idx: number) =>
      //   check ? idx : null
      // );
      // let clipboard = [];
      // for (let checkRow of checkRows) {
      //   if (isNull(checkRow)) continue;
      //   const copyRow: number = checkRow;
      //   clipboard.push(DataList[copyRow]);
      // }
      const newList = DataList[row].map((list: any) => {
        if (list === "[NULL]") return "";
        else if (list === "[PLUS]") return "";
        else return list;
      });
      setClipBoard([newList]);
      event.preventDefault(); // 기본 동작 방지
    }

    if (event.ctrlKey && event.key === "v") {
      const getData = await getClipBoard();
      console.log(event.target.value);
      console.log(getData);
      // const makeData = [];
      // getData.map((data) => {
      //   if(data.length < DataList[0].length)
      //   {
      //     const gap = DataList[0].length - data.length;
      //     for(let i=0; i<gap -1; i++)
      //       data.push("[NULL]")
      //     data.push("[PLUS]")
      //   }
      //   if(data.length > DataList[0].length)
      //     return data.slice(0, DataList[0].length)
      // });

      // const checkRows = CheckBox.map((check: boolean, idx: number) =>
      //   check ? idx : null
      // );
      // const applyArr = [];
      // for (let checkRow of checkRows) {
      //   if (isNull(checkRow)) continue;
      //   const copyRow: number = checkRow;
      //   for (let DataElement of getData) {
      //     const bData = DataElement.every((value, col) => {
      //       if (value === "[NULL]" || value === "[PLUS]") return true;
      //       else return DataValid(copyRow, col, value);
      //     });

      //     if (bData) {
      //       setDataList(
      //         DataList.map((list: any, row: number) => {
      //           if (row === copyRow) {
      //             return DataElement;
      //           } else return list;
      //         })
      //       );
      //     }
      //   }
      // }
    }
    // event.preventDefault(); // 기본 동작 방지
  }

  return (
    <GuideBox width={"100%"}>
      <TableContainer>
        {alertMsg !== "" && (
          <Grid>
            {bError ? (
              <Alert severity="error">{alertMsg}</Alert>
            ) : (
              <Alert severity="success">{alertMsg}</Alert>
            )}
          </Grid>
        )}
        <Table
          padding="normal"
          style={tableStyle}
          sx={{ tableLayout: "fixed" }}
        >
          {/* header 고정 */}
          <SetHeader
            props={{ PnD_size, hoverColumn, DataList }}
            propFunc={{ setPnD_size, setHoverColumn }}
          />
          <TableBody style={bodyStyles}>
            {DataList !== undefined &&
              DataList.map((list: any, row: any) => {
                return (
                  <TableRow
                    key={row}
                    hover
                    role="checkbox"
                    onKeyDown={(event) => onCopyPaste(event, row)}
                  >
                    <TableCell key={row} padding={"none"} align="center">
                      {/* Check Box Cell */}
                      <Checkbox
                        sx={checkboxStyle}
                        key={row}
                        color="primary"
                        // indeterminate={CheckBox[row]}
                        checked={CheckBox[row] ? true : false}
                        onChange={(event) => onCheckBox(event, row)}
                        // onKeyDown={(event) => onCopyPaste(event)}
                      />
                    </TableCell>
                    {/* Data Cell */}
                    {list.map((element: string, col: number) => {
                      if (col === 4 + PnD_size * 2 && element === "[PLUS]") {
                        // Plus Cell
                        return (
                          <BodyStyleCell
                            key={col}
                            mycolumn={col}
                            hovercolumn={hoverColumn}
                            onMouseEnter={() => setHoverColumn(col)}
                            onMouseLeave={() => setHoverColumn(null)}
                            onClick={() => {
                              setPnD_size(PnD_size + 1);
                              setbChange(true);
                            }}
                          ></BodyStyleCell>
                        );
                      } else if (element === "[NULL]") {
                        // null type cell
                        return (
                          <BodyStyleCell
                            key={col}
                            mycolumn={col}
                            hovercolumn={hoverColumn}
                            onMouseEnter={() => setHoverColumn(col)}
                            onMouseLeave={() => setHoverColumn(null)}
                          >
                            <TextField
                              value={""}
                              disabled={true}
                              width={col === 2 ? "170px" : "80px"}
                              textAlign="center"
                              onChange={(event) => {
                                onChangeTextHandler(event, row, col);
                              }}
                            />
                          </BodyStyleCell>
                        );
                      } else {
                        // data cell
                        return (
                          <BodyStyleCell
                            // contentEditable
                            key={col}
                            mycolumn={col}
                            hovercolumn={hoverColumn}
                            onMouseEnter={() => setHoverColumn(col)}
                            onMouseLeave={() => setHoverColumn(null)}
                            onKeyDown={(event) => {
                              onKeydownHandler(event, row, col);
                            }}
                            onBlur={(event) => onBlurInit(event, row, col)}
                          >
                            {/* <Typography center>{element}</Typography> */}
                            <TextField
                              value={element}
                              width={col === 2 ? "170px" : "80px"}
                              textAlign="center"
                              onChange={(event) => {
                                onChangeTextHandler(event, row, col);
                              }}
                            />
                          </BodyStyleCell>
                        );
                      }
                    })}
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>
      </TableContainer>
    </GuideBox>
  );
};
////////////////////////////////////////////////////////////////////////
/// ClipBoard
const getClipBoard = async (): Promise<string[][]> => {
  const parseExcelData = (clipboardText: string) => {
    const rows = clipboardText.split("\n").filter((row) => row.trim() !== "");

    const filterRows = rows
      .map((rowData) => rowData.replace("\r", ""))
      .map((row) =>
        row.split("\t").map((txt) => (txt === "" ? "[NULL]" : txt))
      );
    return filterRows; // 각 행을 열로 나누기
  };

  try {
    const clipboardText = await navigator.clipboard.readText();
    const getData = parseExcelData(clipboardText);
    return getData;
  } catch (error) {
    console.error("Failed to read clipboard contents: ", error);
  }
  return [];
};

const setClipBoard = async (data: string[][]) => {
  const formatExcelData = (data: string[][]): string => {
    const noNullPuls = data.map((row) => row.join("\t")).join("\n");
    console.log(noNullPuls);
    return data.map((row) => row.join("\t")).join("\n");
  };

  try {
    const clipboardText = formatExcelData(data);
    await navigator.clipboard.writeText(clipboardText);
  } catch (error) {
    console.error("Failed to copy to clipboard:", error);
  }
};

////////////////////////////////////////////////////////////////////////
/// Style
// table
const tableStyle: any = {
  // width: "100%",
  borderCollapse: "collapse",
  margin: "10px",
  display: "block",
};
// checkBox
const checkboxStyle: any = {
  transform: "scale(2)", // 크기 배율 조정
  "& .MuiSvgIcon-root": {
    fontSize: 10, // 아이콘 크기 조정
  },
};
// header
const headerStyles: any = {
  backgroundColor: "#cccccc",
  padding: "10px",
  textAlign: "center",
  border: "1px solid #ddd",
};
// Custom properties for the styled TableCell
interface CustomTableCellProps {
  hovercolumn: number | null;
  mycolumn: number;
}
const HeaderStyleCell = styled(TableCell)<CustomTableCellProps>(
  ({ theme, hovercolumn, mycolumn }) => ({
    textAlign: "center",
    border: "1px solid #ddd",
    backgroundColor: hovercolumn === mycolumn ? "#b1b1b1" : "#cccccc",
    margin: "5px",
  })
);
// body
const bodyStyles: any = {
  padding: "10px",
  textAlign: "center",
  border: "1px solid #ddd",
};

const BodyStyleCell = styled(TableCell)<CustomTableCellProps>(
  ({ theme, hovercolumn, mycolumn }) => ({
    textAlign: "center",
    // border: "1px solid #ddd",
    backgroundColor: hovercolumn === mycolumn ? "#cccccc" : "#FFFFFF",
    margin: "5px",
    padding: 0,
    "&:hover": {
      backgroundColor: "#b1b1b1", // 호버 시 배경색 변경
    },
  })
);

export default MutiTable;
