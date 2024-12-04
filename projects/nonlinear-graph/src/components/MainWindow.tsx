import Header from "./Layout/Header";
import Footer from "./Layout/Footer";
import Contents from "./Layout/Contents/Contents";
import { GuideBox } from "@midasit-dev/moaui";
import { useEffect, useState } from "react";
import { dbRead } from "../utils_pyscript";

function MainWindow() {
  const [UnitData, setUnitData] = useState({});
  const [GetValue, setGetValue] = useState<Array<object>>([]);
  const [tableType, setTableType] = useState(1);
  const [TableValue, setTableValue] = useState<Array<object>>([]);

  useEffect(() => {
    console.log(UnitData);
    console.log(GetValue);
  }, [UnitData, GetValue]);

  useEffect(() => Get_UNIT(), []);

  const Get_UNIT = () => {
    setUnitData({});
    const getData = dbRead("UNIT");
    const aGetDatatKey = Object.keys(getData);
    aGetDatatKey.forEach((key) => {
      setUnitData(getData[key]);
    });
  };

  return (
    <GuideBox width={"100%"} height={"100%"} padding={2}>
      <Header props={{ tableType }} propFuncs={{ Get_UNIT, setGetValue }} />
      <Contents
        props={{ UnitData, GetValue, tableType }}
        propFuncs={{ setTableValue, setTableType }}
      />
      <Footer />
    </GuideBox>
  );
}

export default MainWindow;
