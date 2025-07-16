/**
 * @fileoverview 말뚝 컨테이너
 * @description
 * 말뚝 컨테이너를 표시하고, 말뚝 정보를 관리합니다.
 */

import React, { useState } from "react";
import {
  PileBasicDimension,
  PileDataList,
  PileInitialSetting,
  PileLocation,
  PileReinforced,
  PileSection,
  PileViewer,
} from "../panels";
import { PileDataEditor } from "../interactions";
import { Typography } from "@midasit-dev/moaui";
import { Paper } from "@mui/material";
import { useTranslation } from "react-i18next";
import { TabGroup, Tab, CustomBox } from "../../components";
import { PILE_CONTAINER } from "../../constants/common/translations";

const PileMain = () => {
  const [tabValue, setTabValue] = useState<number>(1);
  const { t } = useTranslation();

  const handleTabChange = (event: React.SyntheticEvent, value: number) => {
    setTabValue(value);
  };

  return (
    <CustomBox
      sx={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        gap: 8,
      }}
    >
      {/* 기초 제원 및 말뚝 설정 */}
      <CustomBox
        sx={{
          width: "100%",
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}
      >
        <CustomBox sx={{ width: "100%", display: "flex" }}>
          <PileBasicDimension />
        </CustomBox>
        <CustomBox
          sx={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
            gap: 4,
          }}
        >
          <Typography variant="body2">
            {t(PILE_CONTAINER.PILE_SETTING)}
          </Typography>
          <Paper
            sx={{
              padding: "8px",
              width: "100%",
              display: "flex",
              flexDirection: "column",
              height: 320,
              justifyContent: "space-between",
            }}
          >
            <CustomBox
              sx={{ display: "flex", flexDirection: "column", gap: 16 }}
            >
              <TabGroup value={tabValue} onChange={handleTabChange}>
                <Tab label={t(PILE_CONTAINER.PILE_INITIAL_SETTING)} value={1} />
                <Tab label={t(PILE_CONTAINER.PILE_SECTION_SETTING)} value={2} />
                <Tab
                  label={t(PILE_CONTAINER.PILE_LOCATION_SETTING)}
                  value={3}
                />
                <Tab
                  label={t(PILE_CONTAINER.PILE_REINFORCED_SETTING)}
                  value={4}
                />
              </TabGroup>
              {tabValue === 1 && <PileInitialSetting />}
              {tabValue === 2 && <PileSection />}
              {tabValue === 3 && <PileLocation />}
              {tabValue === 4 && <PileReinforced />}
            </CustomBox>
            <CustomBox
              sx={{
                width: "100%",
                display: "flex",
                justifyContent: "flex-end",
                flexDirection: "row",
              }}
            >
              <PileDataEditor />
            </CustomBox>
          </Paper>
        </CustomBox>
      </CustomBox>

      {/* 기초 제원 및 말뚝 설정 */}
      <CustomBox sx={{ width: "100%", display: "flex", gap: 8 }}>
        <CustomBox
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 4,
          }}
        >
          <Typography variant="body2">
            {t(PILE_CONTAINER.PILE_VIEWER)}
          </Typography>
          <PileViewer />
        </CustomBox>
        <CustomBox
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 4,
          }}
        >
          <Typography variant="body2">
            {t(PILE_CONTAINER.PILE_ARRANGEMENT_TABLE)}
          </Typography>
          <PileDataList />
        </CustomBox>
      </CustomBox>
    </CustomBox>
  );
};

export default PileMain;
