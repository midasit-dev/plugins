import {
  Grid,
  GuideBox,
  Panel,
  Stack,
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
import PointType from "../../Input/Dropdown/PointType";
const Contents = () => {
  const [TableType, setTableType] = useRecoilState(TableTypeState);
  const [hidden, setHidden] = useRecoilState(HiddenBtnState);
  const { t: translate, i18n: internationalization } = useTranslation();

  const onTabChange = (event: any) => {
    setTableType(parseInt(event.target.id));
    setHidden(false);
  };

  return (
    <GuideBox center width={"100%"} margin={1}>
      <Panel height={"100%"} variant="shadow" width="100%" overflow={"scroll"}>
        <Stack direction="row" justifyContent={"space-between"}>
          <TabGroup onChange={onTabChange} value={1}>
            <Tab label={translate("TabDisp")} value={1} id="1" />
            <Tab label={translate("TabStiff")} value={2} id="2" />
            <Tab label={translate("TabMulti")} value={3} id="3" />
          </TabGroup>
          <Grid>{TableType === 3 && <PointType />}</Grid>
        </Stack>
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
