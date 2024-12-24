import {
  Grid,
  GuideBox,
  Panel,
  Tab,
  TabGroup,
  Typography,
} from "@midasit-dev/moaui";
import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import MutiTable from "../../Input/TableGrid/MutiTable";
import { useRecoilState, useRecoilValue } from "recoil";
import {
  ElementState,
  ComponentState,
  GetDBState,
  UnitState,
  TableListState,
  TableTypeState,
} from "../../../values/RecoilValue";
import MultiDataGrid from "../../Input/TableGrid/MultiDataGrid";
import DispDataGrid from "../../Input/TableGrid/DispDataGrid";
import StiffDataGrid from "../../Input/TableGrid/StiffDataGrid copy";
const Contents = () => {
  const UnitData = useRecoilValue(UnitState);
  const [TableType, setTableType] = useRecoilState(TableTypeState);
  const { t: translate, i18n: internationalization } = useTranslation();
  const UnitText = translate("unit");

  const onTabChange = (event: any) => {
    setTableType(parseInt(event.target.id));
  };

  return (
    <GuideBox center width={"60vw"} padding={1}>
      <GuideBox width={"100%"}>
        <Panel
          height="fit-content"
          variant="shadow"
          width="100%"
          margin={2}
          overflow={"scroll"}
        >
          <GuideBox horRight width={"100%"}>
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
    </GuideBox>
  );
};

export default Contents;
