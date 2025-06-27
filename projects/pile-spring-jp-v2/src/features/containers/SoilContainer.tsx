/**
 * @fileoverview 지반 컨테이너
 * @description
 * 지반 컨테이너를 표시하고, 지반 정보를 관리합니다.
 */

import { SoilBasicSetting, SoilResistance, SoilLayerTable } from "../panels";
import { CustomBox } from "../../components";

const SoilMain = () => {
  return (
    <CustomBox
      sx={{ width: "100%", display: "flex", flexDirection: "column", gap: 8 }}
    >
      <CustomBox
        sx={{ width: "100%", display: "flex", flexDirection: "row", gap: 8 }}
      >
        <SoilBasicSetting />
        <SoilResistance />
      </CustomBox>
      <CustomBox sx={{ width: "100%" }}>
        <SoilLayerTable />
      </CustomBox>
    </CustomBox>
  );
};

export default SoilMain;
