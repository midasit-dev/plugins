import React from "react";
import { Button } from "@midasit-dev/moaui";
import { useRecoilValue } from "recoil";
import {
  projectData,
  pileBasicDimensions,
  soilBasicData,
  soilResistance,
  soilTableData,
  pileDataListState,
} from "../../states";
import { useNotification } from "../../hooks/useNotification";
import { useTranslation } from "react-i18next";

const DataExport = () => {
  const { t } = useTranslation();
  const common = useRecoilValue(projectData);
  const pileBasicDim = useRecoilValue(pileBasicDimensions);
  const soilBasic = useRecoilValue(soilBasicData);
  const soilResist = useRecoilValue(soilResistance);
  const soilTable = useRecoilValue(soilTableData);
  const pileDataList = useRecoilValue(pileDataListState);

  const { showNotification } = useNotification();

  const handleExport = () => {
    if (!common.projectName) {
      showNotification("Project name is required", "error");
      return;
    }

    const data = {
      common,
      pileBasicDim,
      pileDataList,
      soilBasic,
      // soilResist,
      soilTable,
    };

    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${common.projectName}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <Button variant="contained" onClick={handleExport}>
      {t("Download_Data_Button")}
    </Button>
  );
};

export default DataExport;
