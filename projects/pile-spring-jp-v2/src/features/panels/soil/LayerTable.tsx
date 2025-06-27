/**
 * @fileoverview 지반 층 테이블 패널
 * @description
 * 지반 층 테이블 패널을 표시하고, 지반 층 테이블 정보를 관리합니다.
 */

import { Typography } from "@midasit-dev/moaui";
import { CustomTable, CustomBox } from "../../../components";
import { IconButton } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useTranslation } from "react-i18next";
import { useSoilTable } from "../../../hooks/soil/useLayerTable";
import { SOIL_LAYER_TABLE } from "../../../constants/soil/translations";

const SoilLayerTable = () => {
  const { tableData, header, renderRow, handleAddRow } = useSoilTable();
  const { t } = useTranslation();

  return (
    <CustomBox sx={{ width: "100%", display: "flex", flexDirection: "column" }}>
      <CustomBox
        sx={{
          width: "100%",
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="body2">
          {t(SOIL_LAYER_TABLE.SOIL_TABLE)}
        </Typography>
        <IconButton size="small" onClick={handleAddRow}>
          <AddIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </CustomBox>
      <CustomBox sx={{ width: 892, display: "flex", flexDirection: "column" }}>
        <CustomTable
          headers={header}
          rows={tableData}
          renderRow={renderRow}
          height={400}
          stickyLastColumn
        />
      </CustomBox>
    </CustomBox>
  );
};

export default SoilLayerTable;
