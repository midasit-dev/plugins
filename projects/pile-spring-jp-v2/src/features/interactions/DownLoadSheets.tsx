/**
 * @fileoverview 엑셀 계산서 다운로드
 * @description
 * 엑셀 계산서를 다운로드합니다.
 */

import { Button } from "@midasit-dev/moaui";
import { useTranslation } from "react-i18next";
import { DOWN_LOAD_SHEETS } from "../../constants/common/translations";

const DownLoadSheets = () => {
  const { t } = useTranslation();

  const handleCalculation = () => {
    console.log("Calculation");
  };

  return (
    <Button variant="contained" onClick={handleCalculation}>
      {t(DOWN_LOAD_SHEETS.DOWN_LOAD_SHEETS_BUTTON)}
    </Button>
  );
};

export default DownLoadSheets;
