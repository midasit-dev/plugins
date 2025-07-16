/**
 * @fileoverview 메인 계산기
 * @description
 * 메인 계산기를 표시하고, 계산을 수행합니다.
 */

import { Button } from "@midasit-dev/moaui";
import { useTranslation } from "react-i18next";
import { MAIN_CALCULATOR } from "../../constants/common/translations";

const MainCalculation = () => {
  const { t } = useTranslation();

  const handleCalculation = () => {
    console.log("Calculation");
  };

  return (
    <Button variant="contained" onClick={handleCalculation}>
      {t(MAIN_CALCULATOR.CALCULATE_BUTTON)}
    </Button>
  );
};

export default MainCalculation;
