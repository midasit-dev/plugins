/**
 * @fileoverview 6 자유도 스프링을 생성합니다.
 * @description
 * 6 자유도 스프링을 제품에 입력합니다.
 */

import { Button } from "@midasit-dev/moaui";
import { useTranslation } from "react-i18next";
import { CREATE_SPRING } from "../../constants/common/translations";

const CreateSpring = () => {
  const { t } = useTranslation();

  const handleCalculation = () => {
    console.log("Calculation");
  };

  return (
    <Button variant="contained" onClick={handleCalculation}>
      {t(CREATE_SPRING.CREATE_SPRING_BUTTON)}
    </Button>
  );
};

export default CreateSpring;
