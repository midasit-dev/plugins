import React from "react";
import { GuideBox } from "@midasit-dev/moaui";
import PileMain from "./PileMain";
import SoilMain from "./SoilMain";
import OpeMain from "./OpeMain";
import { TabGroup, Tab } from "../../components";
import { useState } from "react";
import { useTranslation } from "react-i18next";

const MemoizedPileMain = React.memo(PileMain);
const MemoizedSoilMain = React.memo(SoilMain);
const MemoizedOpeMain = React.memo(OpeMain);

const Main = () => {
  const [tabValue, setTabValue] = useState<number>(1);
  const { t } = useTranslation();

  const handleTabChange = (event: React.SyntheticEvent, value: number) => {
    setTabValue(value);
  };

  return (
    <GuideBox width="100%" height="100%" spacing={2} row>
      <GuideBox width="100%" spacing={2} row>
        <TabGroup
          orientation="vertical"
          value={tabValue}
          onChange={handleTabChange}
        >
          <Tab label={t("TabName_Pile")} value={1} />
          <Tab label={t("TabName_Soil")} value={2} />
          <Tab label={t("TabName_Import")} value={3} />
        </TabGroup>
      </GuideBox>
      <GuideBox width="100%" height="100%" column verSpaceBetween>
        <div style={{ display: tabValue === 1 ? "block" : "none" }}>
          <MemoizedPileMain />
        </div>
        <div style={{ display: tabValue === 2 ? "block" : "none" }}>
          <MemoizedSoilMain />
        </div>
        <MemoizedOpeMain />
      </GuideBox>
    </GuideBox>
  );
};

export default React.memo(Main);
