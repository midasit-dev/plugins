import Header from "./Layout/Header";
import Footer from "./Layout/Footer";
import Contents from "./Layout/Contents/Contents";
import { Grid, GuideBox } from "@midasit-dev/moaui";
import { Stack } from "@mui/material";

import { useEffect } from "react";
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
    <GuideBox width={"100%"}>
      {UnitData !== undefined && (
        <Stack direction="row" spacing={3}>
          <Grid width={"1200px"}>
            {!hidden && <Header />}
            <Contents />
            {!hidden && <Footer />}
          </Grid>
          <Grid width={"50px"} padding={1}>
            <GraphBtn />
          </Grid>
        </Stack>
      )}
      <Grid width={hidden ? "100%" : "0px"}>
        {hidden && (
          <NewWindow>
            <GraphChart />
          </NewWindow>
        )}
      </Grid>
    </GuideBox>
  );
}

export default MainWindow;
