import React, { useState } from "react";
import {
  PileBasicDim,
  PileData,
  PileInitSet,
  PileLocation,
  PileReinforced,
  PileSection,
  SoilResistance,
  SoilTable,
} from "../panels";
import { PileActions, ImportJsonButton } from "../actions";
import { GuideBox, Typography, Panel, Button } from "@midasit-dev/moaui";
import { useTranslation } from "react-i18next";
import { TabGroup, Tab } from "../../components";
import SoilBasic from "../panels/SoilBasic";

const SoilMain = () => {
  const { t } = useTranslation();

  return (
    <GuideBox width="100%" column spacing={2}>
      <GuideBox width="100%" row spacing={2}>
        <SoilBasic />
        <SoilResistance />
      </GuideBox>
      <GuideBox width="100%">
        <SoilTable />
      </GuideBox>
    </GuideBox>
  );
};

export default SoilMain;
