import React from "react";
import { GuideBox, Panel } from "@midasit-dev/moaui";
import { CustomNumberField } from "../../components";
import { useBasicDim } from "../../hooks";
import { useTranslation } from "react-i18next";

const BasicDim = () => {
  const { t } = useTranslation();
  const { values, handleChange } = useBasicDim();

  return (
    <Panel width="100%">
      <GuideBox row verCenter horSpaceBetween>
        <CustomNumberField
          label={t("Xdir_Dim")}
          width={180}
          numberFieldWidth={100}
          value={values.foundationWidth.toString()}
          onChange={handleChange("foundationWidth")}
          numberOptions={{
            min: 0,
            condition: {
              min: "greater",
            },
          }}
        />
        <CustomNumberField
          label={t("Ydir_Dim")}
          width={180}
          numberFieldWidth={100}
          value={values.sideLength.toString()}
          onChange={handleChange("sideLength")}
          numberOptions={{
            min: 0,
            condition: {
              min: "greater",
            },
          }}
        />
        <CustomNumberField
          label={t("X_Force_Point")}
          width={260}
          numberFieldWidth={100}
          value={values.forcePointX.toString()}
          onChange={handleChange("forcePointX")}
        />
        <CustomNumberField
          label={t("Y_Force_Point")}
          width={260}
          numberFieldWidth={100}
          value={values.forcePointY.toString()}
          onChange={handleChange("forcePointY")}
        />
      </GuideBox>
    </Panel>
  );
};

export default BasicDim;
