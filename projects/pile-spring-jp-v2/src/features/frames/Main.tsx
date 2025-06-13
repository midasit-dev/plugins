import React, { Suspense } from "react";
import { GuideBox } from "@midasit-dev/moaui";
import PileMain from "./PileMain";
import SoilMain from "./SoilMain";
import { TabGroup, Tab } from "../../components";
import { useState } from "react";
import { useTranslation } from "react-i18next";

// const MomorizedPileMain = React.memo(PileMain);

const Main = () => {
  const [tabValue, setTabValue] = useState<number>(1);
  const { t } = useTranslation();

  const handleTabChange = (event: React.SyntheticEvent, value: number) => {
    setTabValue(value);
  };

  return (
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
      {/* {tabValue === 1 && <MomorizedPileMain />} */}
      {tabValue === 1 && <PileMain />}
      {tabValue === 2 && <SoilMain />}
    </GuideBox>
  );
};

export default Main;
