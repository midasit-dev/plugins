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
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  // styled,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { useRecoilState, useRecoilValue } from "recoil";
import {
  ElementState,
  ComponentState,
  GetDBState,
  TableTypeState,
  UnitState,
  TableListState,
  filteredTableListState,
  TableChangeState,
} from "../../../values/RecoilValue";
import { MULTLIN_HistoryType, MULTLIN_nType } from "../../../values/EnumValue";

interface HeaderProps {
  props: {
    PnD_size: number;
    hoverColumn: number | null;
  };
  propFunc: {
    setPnD_size: React.Dispatch<React.SetStateAction<number>>;
    setHoverColumn: React.Dispatch<React.SetStateAction<number | null>>;
  };
}

const SetHeader: React.FC<HeaderProps> = ({ props, propFunc }) => {
  const { PnD_size, hoverColumn } = props;
  const { setPnD_size, setHoverColumn } = propFunc;
  const filterList = useRecoilValue(filteredTableListState);
  const [bChange, setbChange] = useRecoilState(TableChangeState);

  const { t: translate, i18n: internationalization } = useTranslation();
  const [dynamicHeader, setDynamicHeader] = useState<string[]>([]);

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
        <Checkbox
          color="primary"
          // indeterminate={numSelected > 0 && numSelected < rowCount}
          // checked={rowCount > 0 && numSelected === rowCount}
          // onChange={onSelectAllClick}
        />
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
  const { t: translate, i18n: internationalization } = useTranslation();
  const TableType = useRecoilValue(TableTypeState);
  const [TableList, setTableList] = useRecoilState(TableListState);
  const [bChange, setbChange] = useRecoilState(TableChangeState);
  const filterList = useRecoilValue(filteredTableListState);

  const [DataList, setDataList] = useState<any>([]);
  const [PnD_size, setPnD_size] = useState(1);
  const [hoverColumn, setHoverColumn] = useState<number | null>(null);

  useEffect(() => {
    initDataList();
  }, [filterList]);

  const initDataList = () => {
    if (filterList !== undefined) {
      setDataList([]);
      filterList.forEach((value: any) => {
        let list = [
          value.NAME,
          value.MATERIAL_TYPE,
          translate(MULTLIN_HistoryType[value.HISTORY_MODEL]),
          translate(MULTLIN_nType[value.DATA.nType]),
        ];

        // PnD data init
        setPnD_size(value.DATA.PnD_Data.length);
        value.DATA.PnD_Data.forEach((PnD: any) => {
          const SFactDispl = value.DATA.dScaleF_Displ;
          const SFactForce = value.DATA.dScaleF_Force;
          const dSFact = SFactDispl / SFactForce;
          const Pdata = PnD[0] * SFactDispl;
          const Ddata = PnD[1] * SFactForce;
          list.push(Pdata);
          list.push(Ddata);
        });
        list.push("");

        // HISTORY_MODEL case
        if (value.HISTORY_MODEL === "MLPT")
          list.push(value.DATA.dHysParam_Beta1);
        else if (value.HISTORY_MODEL === "MLPP") {
          list.push("");
          list.push(value.DATA.dHysParam_Alpha1);
          list.push(value.DATA.dHysParam_Alpha2);
          list.push(value.DATA.dHysParam_Beta1);
          list.push(value.DATA.dHysParam_Beta2);
          list.push(value.DATA.dHysParam_Eta);
        }
        setDataList((preList: any) => [...preList, list]);
      });
    }
  };

  // tableList 변경
  useEffect(() => {
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
          DataList[row][4 + i * 2] === undefined ||
          DataList[row][4 + i * 2] === "" ||
          DataList[row][4 + (i * 2 + 1)] === undefined ||
          DataList[row][4 + (i * 2 + 1)] === ""
        )
          PnD_Data.push([0, 0]);
        else
          PnD_Data.push([
            DataList[row][4 + i * 2],
            DataList[row][4 + (i * 2 + 1)],
          ]);
      }
      if (bChange === true)
        updateData(row, NAME, MATERIAL_TYPE, HISTORY_MODEL, MUL_TYPE, PnD_Data);
    }
    if (bChange === true) setbChange(false);
  }, [PnD_size, bChange]);

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
            PnD_Data: newPnDData,
          },
        })),
      }));
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
              colIdx === col ? event.target.value : el
            )
          : Item
      )
    );
  }

  const keydownHandler = (eventkey: any, col: number) => {
    let dbUpdate = false;
    if (eventkey.key === "Enter") {
      const Inputvalue = eventkey.target.value; // 현재 input의 값을 참조
      switch (col) {
        case 0: // name
          dbUpdate = true;
          break;
        case 1: // material
          if (Inputvalue === "RS" || Inputvalue === "S") dbUpdate = true;
          break;
        case 2: // historyType
          Object.entries(MULTLIN_HistoryType).forEach(([key, value]) => {
            if (translate(value) === Inputvalue) dbUpdate = true;
          });
          break;
        case 3: // MUL_nType
          Object.entries(MULTLIN_nType).forEach(([key, value]) => {
            if (translate(value) === Inputvalue) dbUpdate = true;
          });
          break;
        case 4: // ...
          break;
        default:
          break;
      }
      if (dbUpdate) {
        setbChange(dbUpdate);
      } else {
        initDataList();
      }
    }
  };

  return (
    <GuideBox width={"100%"}>
      <TableContainer>
        <Table padding="normal" style={tableStyle}>
          {/* header 고정 */}
          <SetHeader
            props={{ PnD_size, hoverColumn }}
            propFunc={{ setPnD_size, setHoverColumn }}
          />
          <TableBody style={bodyStyles}>
            {DataList !== undefined &&
              DataList.map((list: any, row: any) => {
                return (
                  <TableRow key={row} hover role="checkbox">
                    <TableCell key={row}>
                      <Checkbox
                        color="primary"
                        //  indeterminate={numSelected > 0 && numSelected < rowCount}
                        //  checked={rowCount > 0 && numSelected === rowCount}
                        //  onChange={onSelectAllClick}
                      />
                    </TableCell>
                    {list.map((element: string, col: number) =>
                      col !== 4 + PnD_size * 2 && element !== "" ? (
                        // not Plus Cell
                        <BodyStyleCell
                          // contentEditable
                          key={col}
                          mycolumn={col}
                          hovercolumn={hoverColumn}
                          onMouseEnter={() => setHoverColumn(col)}
                          onMouseLeave={() => setHoverColumn(null)}
                          onKeyDown={(eventKey) => {
                            keydownHandler(eventKey, col);
                          }}
                        >
                          {/* <Typography center>{element}</Typography> */}
                          <TextField
                            value={element}
                            width={col === 2 ? "170px" : "70px"}
                            textAlign="center"
                            onChange={(event) => {
                              onChangeTextHandler(event, row, col);
                            }}
                          />
                        </BodyStyleCell>
                      ) : (
                        // Plus Cell
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
                      )
                    )}
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
/// Style
// table
const tableStyle: any = {
  width: "100%",
  borderCollapse: "collapse",
  margin: "10px",
  display: "block",
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
    "&:hover": {
      backgroundColor: "#b1b1b1", // 호버 시 배경색 변경
    },
  })
);

export default MutiTable;
