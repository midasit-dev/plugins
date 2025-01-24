import { GuideBox, Grid, Panel, Stack } from "@midasit-dev/moaui";
import ElementType from "../Input/Dropdown/ElementType";
import ComponentType from "../Input/Dropdown/ComponentType";
import RequestBtnpy from "../Input/Button/RequestBtnPy";
import LanguageType from "../Input/Dropdown/LanguageType";

const Header = () => {
  return (
    <GuideBox center row width={"100%"} margin={1}>
      <Panel height="fit-content" variant="shadow" width="70%" marginRight={1}>
        <Grid style={container}>
          <Stack direction="row" spacing={5}>
            <ElementType />
            <ComponentType />
          </Stack>
        </Grid>
      </Panel>
      <Panel height="fit-content" variant="shadow" width="30%" marginLeft={1}>
        <Grid style={container}>
          <Stack direction={"row"} spacing={5}>
            <RequestBtnpy />
            <LanguageType />
          </Stack>
        </Grid>
      </Panel>
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
