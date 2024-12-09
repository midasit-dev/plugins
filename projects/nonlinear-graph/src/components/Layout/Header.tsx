import { GuideBox, Grid, Panel, Stack } from "@midasit-dev/moaui";
import ElementType from "../Input/Dropdown/ElementType";
import ComponentType from "../Input/Dropdown/ComponentType";
import RequestBtnpy from "../Input/Button/RequestBtnPy";
import LanguageType from "../Input/Dropdown/LanguageType";
import PointType from "../Input/Dropdown/PointType";
import { useEffect, useState } from "react";
import { useRecoilState } from "recoil";
import { TableTypeState } from "../../values/RecoilValue";

const Header = () => {
  const [TableType, setTableType] = useRecoilState(TableTypeState);

  return (
    <GuideBox center show padding={1}>
      <GuideBox row>
        <Panel
          height="fit-content"
          variant="shadow"
          width="fit-content"
          margin={2}
        >
          <Grid style={container}>
            <Stack direction="row" spacing={5} margin={1}>
              <ElementType />
              <ComponentType />
            </Stack>
          </Grid>
        </Panel>
        <Panel
          height="fit-content"
          variant="shadow"
          width="fit-content"
          margin={2}
        >
          <Grid style={container}>
            <Stack direction={"row"} spacing={5} margin={1}>
              <RequestBtnpy />
              <LanguageType />
            </Stack>
          </Grid>
          {TableType === 3 && <PointType />}
        </Panel>
      </GuideBox>
    </GuideBox>
  );
};

const container: any = {
  display: "flex" /* Flexbox 레이아웃 설정 */,
  justifyContent: "space-around" /* 요소들 사이의 간격을 균등하게 조절 */,
  alignItems: "center" /* 요소들을 세로 중앙에 배치 */,
  margin: "10px",
};

export default Header;
