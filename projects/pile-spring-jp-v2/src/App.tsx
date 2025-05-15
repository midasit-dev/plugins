/**
 *
 * ██████╗        █████╗ ██████╗ ██████╗
 * ╚════██╗      ██╔══██╗██╔══██╗██╔══██╗
 *  █████╔╝█████╗███████║██████╔╝██████╔╝
 *  ╚═══██╗╚════╝██╔══██║██╔═══╝ ██╔═══╝
 * ██████╔╝      ██║  ██║██║     ██║
 * ╚═════╝       ╚═╝  ╚═╝╚═╝     ╚═╝
 *
 * @description Entry point for the application after Wrapper
 * @next last entry point
 */

import React, { useState } from "react";
import { GuideBox, Panel } from "@midasit-dev/moaui";
import { default as WelcomeDevTools } from "./DevTools/Welcome";
import {
  CustomTextField,
  CustomDropList,
  CustomDataGrid,
  CustomDataGridGrouping,
} from "./components";
import {
  PileBasicDim,
  PileInitSet,
  PileSection,
  PileLocation,
  PileReinforced,
  PileData,
} from "./features/panels";
import { PileMain, Main } from "./features/frames";
import { PileActions } from "./features/actions";
import { Button } from "@mui/material";
import {
  pileSectionState,
  pileLocationState,
  pileReinforcedState,
} from "./states";
import { useRecoilValue } from "recoil";

const opacity = 0.5;
//If you want to test, try using the GuideApp component.
//import GuideApp from './SampleComponents/GuideApp';

/**
 * You can modify the code here and test.
 *
 * @description You can start from the Panel Component below.
 * 							You can add the Component you want.
 *							You can check the version of the library you are currently using by opening the developer tool.
 *
 * For more information about the library, please refer to the link below.
 * @see https://midasit-dev.github.io/moaui
 */
// interface RowData {
//   id: number;
//   name: string;
//   age: number;
//   country: string;
// }

const App = () => {
  // const [selectedValue, setSelectedValue] = useState<string>("KO");
  // const [value, setValue] = useState<string>("");

  // const itemsArray: Array<[string, string | number]> = [
  //   ["Korean", "KO"],
  //   ["American", "AM"],
  //   ["Asia", "AS"],
  //   ["Midas", "MI"],
  // ];

  // function onChangeHandler(event: any) {
  //   console.log(event.target.value);
  //   setSelectedValue(event.target.value);
  // }

  // function onChangeTextFieldHandler(event: any) {
  //   console.log(event.target.value);
  //   setValue(event.target.value);
  // }

  // const [rows, setRows] = useState<RowData[]>([
  //   { id: 1, name: "홍길동", age: 30, country: "한국" },
  //   { id: 2, name: "John Doe", age: 25, country: "미국" },
  // ]);

  // const columns = [
  //   { field: "id", headerName: "ID", width: 90 },
  //   { field: "name", headerName: "이름", width: 150 },
  //   { field: "age", headerName: "나이", width: 100 },
  //   { field: "country", headerName: "국가", width: 150 },
  // ];

  // const onAddRow = (newRow: RowData) => {
  //   setRows([...rows, newRow]);
  // };

  // const onDeleteRow = (id: number) => {
  //   setRows(rows.filter((row) => row.id !== id));
  // };

  const pileSection = useRecoilValue(pileSectionState);
  const pileLocation = useRecoilValue(pileLocationState);
  const pileReinforced = useRecoilValue(pileReinforcedState);

  function handleClick() {
    console.log("================PileSection=================");
    console.log(pileSection);
    console.log("================PileLocation=================");
    console.log(pileLocation);
    console.log("================PileReinforced=================");
    console.log(pileReinforced);
  }

  return (
    <GuideBox
      width={1000}
      height={800}
      spacing={2}
      padding={2}
      border={"1px solid black"}
    >
      <Main />
      {/* <CustomDropList
        label="커스텀 드롭리스트"
        width={300}
        itemList={itemsArray}
        value={selectedValue}
        onChange={onChangeHandler}
      />
      <CustomTextField
        width={300}
        label="AA"
        value={value}
        onChange={onChangeTextFieldHandler}
      />
      <CustomDataGrid
        label="사용자 데이터"
        columns={columns}
        rows={rows}
        onAddRow={onAddRow}
        onDeleteRow={onDeleteRow}
        enableRowManagement={true} // 행 관리 기능 활성화
        width={600}
        height={400}
      /> */}
    </GuideBox>
  );
};

export default App;
