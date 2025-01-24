import {
  Grid,
  GuideBox,
  Panel,
  Tab,
  TabGroup,
  Typography,
} from "@midasit-dev/moaui";
import { useTranslation } from "react-i18next";
import { useRecoilState, useRecoilValue } from "recoil";
import {
  UnitState,
  TableTypeState,
  HiddenBtnState,
} from "../../../values/RecoilValue";
import MultiDataGrid from "../../Input/TableGrid/MultiDataGrid";
import DispDataGrid from "../../Input/TableGrid/DispDataGrid";
import StiffDataGrid from "../../Input/TableGrid/StiffDataGrid copy";
const Contents = () => {
  const UnitData = useRecoilValue(UnitState);
  const [TableType, setTableType] = useRecoilState(TableTypeState);
  const [hidden, setHidden] = useRecoilState(HiddenBtnState);
  const { t: translate, i18n: internationalization } = useTranslation();
  const UnitText = translate("unit");

  const onTabChange = (event: any) => {
    setTableType(parseInt(event.target.id));
    setHidden(false);
  };

  return (
    <GuideBox center width={"100%"} margin={1}>
      <Panel height={"100%"} variant="shadow" width="100%" overflow={"scroll"}>
        <GuideBox horRight>
          <Typography variant="body1" size="medium" center margin={1}>
            {`${UnitText} : ${UnitData.FORCE}, ${UnitData.DIST}`}
          </Typography>
        </GuideBox>
        <Grid>
          <TabGroup onChange={onTabChange} value={1}>
            <Tab label={translate("TabDisp")} value={1} id="1" />
            <Tab label={translate("TabStiff")} value={2} id="2" />
            <Tab label={translate("TabMulti")} value={3} id="3" />
          </TabGroup>
        </Grid>
        <Grid width={"100%"}>
          {TableType === 1 && <DispDataGrid />}
          {TableType === 2 && <StiffDataGrid />}
          {TableType === 3 && <MultiDataGrid />}
        </Grid>
      </Panel>
    </GuideBox>
  );
};

export default Contents;
