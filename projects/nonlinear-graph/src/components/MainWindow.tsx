import Header from "./Layout/Header";
import Footer from "./Layout/Footer";
import Contents from "./Layout/Contents/Contents";
import { Grid, GuideBox, Stack } from "@midasit-dev/moaui";
import { useEffect, useState } from "react";
import { dbRead } from "../utils_pyscript";
// recoil
import { useRecoilState } from "recoil";
import { UnitState, HiddenBtnState } from "../values/RecoilValue";
import GraphBtn from "./Input/Button/GraphBtn";
import NewWindow from "./Layout/Contents/NewWindow";
import GraphChart from "./Input/Graph/GraphChart";

function MainWindow() {
  const [UnitData, setUnitData] = useRecoilState(UnitState);
  const [hidden, setHidden] = useRecoilState(HiddenBtnState);

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
    <GuideBox center width={"60vw"} height={"100vh"} padding={2}>
      {UnitData !== undefined && (
        <Stack width={"100%"} direction="row">
          <Grid width={"100%"} margin={1}>
            {!hidden && <Header />}
            <Contents />
            {!hidden && <Footer />}
          </Grid>
          <Grid width={"100%"} margin={1}>
            <GraphBtn />
          </Grid>
          <Grid width={hidden ? "100%" : "0px"} margin={1}>
            {hidden && (
              <NewWindow>
                <GraphChart />
              </NewWindow>
            )}
          </Grid>
        </Stack>
      )}
    </GuideBox>
  );
}

export default MainWindow;
