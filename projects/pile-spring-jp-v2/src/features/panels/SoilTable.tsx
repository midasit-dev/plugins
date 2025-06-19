import { GuideBox, Typography } from "@midasit-dev/moaui";
import { CustomTable } from "../../components";
import { IconButton } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useTranslation } from "react-i18next";
import { useSoilTable } from "../../hooks";

const SoilTable = () => {
  const { tableData, header, renderRow, handleAddRow } = useSoilTable();
  const { t } = useTranslation();

  return (
    <GuideBox width="100%" column>
      <GuideBox width="100%" row horSpaceBetween verCenter>
        <Typography variant="body2">{t("Soil_Table")}</Typography>
        <IconButton size="small" onClick={handleAddRow}>
          <AddIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </GuideBox>
      <GuideBox width="860px" column>
        <CustomTable
          headers={header}
          rows={tableData}
          renderRow={renderRow}
          height={400}
          stickyLastColumn
        />
      </GuideBox>
    </GuideBox>
  );
};

export default SoilTable;
