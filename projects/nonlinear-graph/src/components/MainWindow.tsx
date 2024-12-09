import Header from "./Layout/Header";
import Footer from "./Layout/Footer";
import Contents from "./Layout/Contents/Contents";
import { GuideBox } from "@midasit-dev/moaui";
import { useEffect, useState } from "react";
import { dbRead } from "../utils_pyscript";
// recoil
import { useRecoilState } from "recoil";
import { UnitState, GetDBState } from "../values/RecoilValue";

function MainWindow() {
  const [UnitData, setUnitData] = useRecoilState(UnitState);

  // const [tableType, setTableType] = useState(1);
  // const [pointValue, setPointValue] = useState(1);
  // const [TableValue, setTableValue] = useState<object>({});
  // const [bChange, setbChange] = useState<boolean>(false);

  useEffect(() => {
    setUnitData(Get_UNIT());
  }, []);

  const Get_UNIT = () => {
    try {
      const getData = dbRead("UNIT"); // 데이터베이스에서 데이터 읽기
      return getData["1"]; // 전체 데이터로 상태 설정
    } catch (error) {
      console.error("Failed to load UNIT data", error);
    }
  };
  return (
    <GuideBox width={"100%"} height={"100%"} padding={2}>
      <Header />
      <Contents />
      <Footer />
    </GuideBox>
  );
}

export default MainWindow;
