import { GuideBox, Grid, Panel, Stack, Typography } from "@midasit-dev/moaui";
import ElementType from "../Input/Dropdown/ElementType";
import ComponentType from "../Input/Dropdown/ComponentType";
import RequestBtnpy from "../Input/Button/RequestBtnPy";
import LanguageType from "../Input/Dropdown/LanguageType";
import { useRecoilValue } from "recoil";
import { UnitState } from "../../values/RecoilValue";
import { forceUnit, lengthUnit } from "../../values/units";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";

const Header = () => {
  const UnitData = useRecoilValue(UnitState);
  const [unit, setUnit] = useState({ FORCE: "", DIST: "" });
  const { t: translate } = useTranslation();
  const UnitText = translate("unit");

  useEffect(() => {
    if (UnitData !== undefined) {
      // 단위 코드 -> 표기 문자열 대응은 values/units.ts 에 모아 뒀다.
      setUnit({
        FORCE: forceUnit(UnitData.FORCE),
        DIST: lengthUnit(UnitData.DIST),
      });
    }
  }, [UnitData]);

  return (
    <GuideBox center row width={"100%"} margin={1}>
      <Panel height="fit-content" variant="shadow" width="70%" marginRight={1}>
        <Grid style={container}>
          <Stack direction="row" spacing={5}>
            <ElementType />
            <ComponentType />
            <RequestBtnpy />
          </Stack>
        </Grid>
      </Panel>
      <Panel height="fit-content" variant="shadow" width="30%" marginLeft={1}>
        <Grid style={container}>
          <Stack direction={"row"} spacing={5}>
            <Typography variant="body1" size="medium" center margin={1}>
              {`${UnitText} : ${unit.FORCE}, ${unit.DIST}`}
            </Typography>
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
