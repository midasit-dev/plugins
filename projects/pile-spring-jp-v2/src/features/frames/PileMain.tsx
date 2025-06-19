import React, { useState } from "react";
import {
  PileBasicDim,
  PileData,
  PileInitSet,
  PileLocation,
  PileReinforced,
  PileSection,
  PileViewer,
} from "../panels";
import { PileDataEditor } from "../actions";
import { GuideBox, Typography, Panel } from "@midasit-dev/moaui";
import { useTranslation } from "react-i18next";
import { TabGroup, Tab } from "../../components";

const PileMain = () => {
  const [tabValue, setTabValue] = useState<number>(1);
  const { t } = useTranslation();

  const handleTabChange = (event: React.SyntheticEvent, value: number) => {
    setTabValue(value);
  };

  return (
    <GuideBox id="PileMain_Guide" width="100%" spacing={2}>
      <GuideBox id="PileMain_BasicDim" width="100%" column>
        <Typography variant="body2">{t("Footing_Dimension")}</Typography>
        <PileBasicDim />
      </GuideBox>

      <GuideBox id="PileMain_PileSetting" width="100%">
        <Typography variant="body2">{t("Pile_Setting")}</Typography>
        <Panel width="100%">
          <GuideBox width="100%" spacing={1}>
            <GuideBox
              id="PileMain_PileSetting_Guide"
              width="100%"
              height={280}
              column
              spacing={1}
            >
              <TabGroup value={tabValue} onChange={handleTabChange}>
                <Tab label={t("Initial_Setting")} value={1} />
                <Tab label={t("Section_Setting")} value={2} />
              </TabGroup>
              {tabValue === 1 && (
                <GuideBox width="100%" spacing={3} row horSpaceBetween>
                  <GuideBox column spacing={1}>
                    <Typography variant="body2">
                      {t("Initial_Setting")}
                    </Typography>
                    <PileInitSet />
                  </GuideBox>

                  <GuideBox width="100%" column spacing={1}>
                    <GuideBox column spacing={1} width="100%">
                      <Typography variant="body2">
                        {t("Pile_Arrangement")}
                      </Typography>
                      <PileLocation />
                    </GuideBox>

                    <GuideBox column spacing={1} width="100%">
                      <Typography variant="body2">
                        {t("Reinforced_Section_Title")}
                      </Typography>
                      <PileReinforced />
                    </GuideBox>
                  </GuideBox>
                </GuideBox>
              )}
              {tabValue === 2 && <PileSection />}
            </GuideBox>
            <GuideBox width="100%" row horRight>
              <PileDataEditor />
            </GuideBox>
          </GuideBox>
        </Panel>
      </GuideBox>

      <GuideBox id="PileMain_PileData" width="100%" row horSpaceBetween>
        <GuideBox column spacing={1}>
          <Typography variant="body2">{t("Pile_Arrangement_Table")}</Typography>
          <PileData />
        </GuideBox>
        <GuideBox column spacing={1}>
          <Typography variant="body2">{t("Pile_Arrangement_Table")}</Typography>
          <PileViewer />
        </GuideBox>
      </GuideBox>
    </GuideBox>
  );
};

export default PileMain;
