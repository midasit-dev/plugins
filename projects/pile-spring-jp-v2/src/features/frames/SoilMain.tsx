import React from "react";
import { SoilResistance, SoilTable } from "../panels";
import { GuideBox } from "@midasit-dev/moaui";
import SoilBasic from "../panels/SoilBasic";

const SoilMain = () => {
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
