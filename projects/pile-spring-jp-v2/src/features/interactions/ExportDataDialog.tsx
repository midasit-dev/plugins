/**
 * @fileoverview 데이터 내보내기 대화상자
 * @description
 * 데이터 내보내기 대화상자를 표시하고, 데이터를 내보냅니다.
 */

import { Button } from "@midasit-dev/moaui";
import { useRecoilValue } from "recoil";
import {
  projectData,
  pileBasicDimState,
  pileDataListState,
} from "../../states";
import { useNotification, useSoilDomain } from "../../hooks";
import { useTranslation } from "react-i18next";
import { EXPORT_DATA_DIALOG } from "../../constants/common/translations";

const ExportDataDialog = () => {
  const { t } = useTranslation();
  const common = useRecoilValue(projectData);
  const pileBasicDimValue = useRecoilValue(pileBasicDimState);
  const pileDataList = useRecoilValue(pileDataListState);
  const { soilDomain } = useSoilDomain();

  const { showNotification } = useNotification();

  const handleExport = () => {
    if (!common.projectName) {
      showNotification("Project name is required", "error");
      return;
    }

    const data = {
      common,
      pileBasicDimValue,
      pileDataList,
      soilBasic: soilDomain.basic,
      soilResistance: soilDomain.resistance,
      soilTable: soilDomain.soilLayers,
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
      {t(EXPORT_DATA_DIALOG.DOWNLOAD_DATA_BUTTON)}
    </Button>
  );
};

export default ExportDataDialog;
