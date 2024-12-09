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
const Contents = () => {
  const UnitData = useRecoilValue(UnitState);
  const [TableType, setTableType] = useRecoilState(TableTypeState);
  const { t: translate, i18n: internationalization } = useTranslation();
  const UnitText = translate("unit");

  const onTabChange = (event: any) => {
    setTableType(parseInt(event.target.id));
  };

  return (
    <GuideBox verCenter center width={"100%"} padding={2}>
      <GuideBox horRight width={"100%"}>
        <Typography variant="body1" size="medium" center>
          {`${UnitText} : ${UnitData.FORCE}, ${UnitData.DIST}`}
        </Typography>
      </GuideBox>
      <GuideBox horLeft width={"100%"}>
        <Panel
          height="fit-content"
          variant="shadow"
          width="fit-content"
          margin={2}
        >
          <Grid>
            <TabGroup onChange={onTabChange} value={1}>
              <Tab label={translate("TabDisp")} value={1} id="1" />
              <Tab label={translate("TabStiff")} value={2} id="2" />
              <Tab label={translate("TabMulti")} value={3} id="3" />
            </TabGroup>
          </Grid>
          <Grid>
            {TableType === 1 && TableType}
            {TableType === 2 && TableType}
            {TableType === 3 && <MutiTable />}
          </Grid>
        </Panel>
      </GuideBox>
    </GuideBox>
  );
};

export default Contents;
