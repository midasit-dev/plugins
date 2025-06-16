import React from "react";
import { GuideBox, Panel } from "@midasit-dev/moaui";
import { CustomNumberField } from "../../components";
import { usePileBasicDim } from "../../hooks";
import { useTranslation } from "react-i18next";

const PileBasicDim = () => {
  /**
  기초 제원 설정 패널

  재항뱡향 폭(m)
  측면 길이(m)
  힘 작용 점 X좌표(m)
  힘 작용 점 Y좌표(m)

  남은 작업: 입력값의 유효성 검토 및 오류 메시지 추가
  **/
  const { t } = useTranslation();
  const { values, handleChange } = usePileBasicDim();

  const fields = [
    {
      label: t("Xdir_Dim"),
      width: 170,
      value: values.foundationWidth.toString(),
      onChange: handleChange("foundationWidth"),
      hasValidation: true,
    },
    {
      label: t("Ydir_Dim"),
      width: 170,
      value: values.sideLength.toString(),
      onChange: handleChange("sideLength"),
      hasValidation: true,
    },
    {
      label: t("X_Force_Point"),
      width: 230,
      value: values.forcePointX.toString(),
      onChange: handleChange("forcePointX"),
      hasValidation: false,
    },
    {
      label: t("Y_Force_Point"),
      width: 230,
      value: values.forcePointY.toString(),
      onChange: handleChange("forcePointY"),
      hasValidation: false,
    },
  ];

  return (
    <Panel id="PileBasicDim_Panel" width="100%">
      <GuideBox width="100%" row verCenter horSpaceBetween>
        {fields.map((field, index) => (
          <CustomNumberField
            key={index}
            label={field.label}
            width={field.width}
            numberFieldWidth={80}
            value={field.value}
            onChange={field.onChange}
            numberOptions={
              field.hasValidation
                ? {
                    min: 0,
                    condition: {
                      min: "greater",
                    },
                  }
                : undefined
            }
          />
        ))}
      </GuideBox>
    </Panel>
  );
};

export default PileBasicDim;
