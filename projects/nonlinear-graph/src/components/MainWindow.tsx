import Header from "./Layout/Header";
import Footer from "./Layout/Footer";
import Contents from "./Layout/Contents/Contents";
import { Grid, GuideBox } from "@midasit-dev/moaui";
import { useEffect, useState } from "react";
import { dbRead } from "../utils_pyscript";
// recoil
import { useRecoilState } from "recoil";
import { UnitState, GetDBState } from "../values/RecoilValue";

function MainWindow() {
  const [UnitData, setUnitData] = useRecoilState(UnitState);

  useEffect(() => {
    Get_UNIT();
  }, []);

  const Get_UNIT = async () => {
    try {
      const getData = dbRead("UNIT"); // 데이터베이스에서 데이터 읽기
      setUnitData(getData["1"]);
    } catch (error) {
      console.error("Failed to load UNIT data", error);
    }
  };
  return (
    <GuideBox center width={"60vw"} height={"100%"} padding={2}>
      <Header />
      <Contents />
      <Footer />
    </GuideBox>
  );
}

export default MainWindow;
