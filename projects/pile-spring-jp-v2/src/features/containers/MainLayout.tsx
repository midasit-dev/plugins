/**
 * @fileoverview 메인 레이아웃
 * @description
 * 메인 레이아웃을 표시하고, 말뚝과 지반 정보를 관리합니다.
 */

import React from "react";
import PileMain from "./PileContainer";
import SoilMain from "./SoilContainer";
import OpeMain from "./OperationContainer";
import { TabGroup, Tab, CustomBox } from "../../components";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { MAIN_LAYOUT } from "../../constants/common/translations";

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
    <>
      <TabGroup
        orientation="vertical"
        value={tabValue}
        onChange={handleTabChange}
      >
        <Tab label={t(MAIN_LAYOUT.PILE_TAB)} value={1} />
        <Tab label={t(MAIN_LAYOUT.SOIL_TAB)} value={2} />
      </TabGroup>
      <CustomBox
        sx={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          padding: 8,
          justifyContent: "space-between",
        }}
      >
        <CustomBox
          sx={{
            display: tabValue === 1 ? "block" : "none",
          }}
        >
          <MemoizedPileMain />
        </CustomBox>
        <CustomBox
          sx={{
            display: tabValue === 2 ? "block" : "none",
          }}
        >
          <MemoizedSoilMain />
        </CustomBox>
        <MemoizedOpeMain />
      </CustomBox>
    </>
  );
};

export default React.memo(Main);
