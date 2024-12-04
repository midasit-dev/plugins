import {
  GuideBox,
  Grid,
  Panel,
  TabGroup,
  Tab,
  Color,
  Typography,
  Stack,
  Button,
} from "@midasit-dev/moaui";
import React, { useEffect } from "react";
import DefalutTable from "../../Input/TableGrid/DefaultTable";

interface Props {
  props: {
    UnitData: object;
    GetValue: Array<object>;
    tableType: number;
  };
  propFuncs: {
    setTableValue: React.Dispatch<React.SetStateAction<Array<object>>>;
    setTableType: React.Dispatch<React.SetStateAction<number>>;
  };
}

const Contents: React.FC<Props> = ({ props, propFuncs }) => {
  const { UnitData, GetValue, tableType } = props;
  const { setTableValue, setTableType } = propFuncs;
  let bUnit: Boolean = false;
  let bGetValue: Boolean = false;

  const onTabChange = (event: any) => {
    setTableType(parseInt(event.target.id));
  };
  return (
    <GuideBox verCenter width={"100%"} padding={2}>
      <GuideBox horRight margin={1}>
        {JSON.stringify(UnitData)};
      </GuideBox>
      <GuideBox center>
        <Panel>
          <Grid>
            <TabGroup onChange={onTabChange} value={1}>
              <Tab label="Tab 1" value={1} id="1" />
              <Tab label="Tab 2" value={2} id="2" />
              <Tab label="Tab 3" value={3} id="3" />
            </TabGroup>
          </Grid>
          <Grid>
            {/* <DefalutTable /> */}
            {tableType === 1 && tableType}
            {tableType === 2 && tableType}
            {tableType === 3 && <DefalutTable />}
          </Grid>
        </Panel>
      </GuideBox>
    </GuideBox>
  );
};

export default Contents;
