import React, { useMemo } from "react";
import { GuideBox, Panel, Typography, Check } from "@midasit-dev/moaui";
import { CustomNumberField, CustomDropList } from "../../components";
import { useSoilResistance } from "../../hooks";
import { useTranslation } from "react-i18next";
import { SoilResistanceMethodItems } from "../../constants";

const NUMBER_FIELD_WIDTH = 140;

const SoilResistance = React.memo(() => {
  const { t } = useTranslation();
  const { values, handleChange, handleCheckBoxChange } = useSoilResistance();

  const isDisabled = !values.useResistance;
  const labelColor = values.useResistance ? "inherit" : "gray";

  const commonProps = useMemo(
    () => ({
      disabled: isDisabled,
      labelColor,
    }),
    [isDisabled, labelColor]
  );

  return (
    <GuideBox width="50%" column>
      <GuideBox width="100%" row verCenter>
        <Check checked={values.useResistance} onChange={handleCheckBoxChange} />
        <Typography variant="body2" color={labelColor}>
          {t("Soil_Resistance")}
        </Typography>
      </GuideBox>
      <Panel width="100%">
        <GuideBox width="100%" column spacing={2}>
          <GuideBox width="100%" column spacing={1}>
            <Typography variant="body2" color={labelColor}>
              {t("Soil_Resistance_Axial")}
            </Typography>
            <CustomDropList
              label={t("Soil_Resistance_Method")}
              droplistWidth={NUMBER_FIELD_WIDTH}
              itemList={SoilResistanceMethodItems()}
              value={values.clayFrictionMethod}
              onChange={handleChange("clayFrictionMethod")}
              {...commonProps}
            />
            <CustomNumberField
              label={t("Soil_Resistance_Tip_Capacity")}
              numberFieldWidth={NUMBER_FIELD_WIDTH}
              value={values.tipCapacity.toString()}
              onChange={handleChange("tipCapacity")}
              numberOptions={{
                min: 0,
                condition: {
                  min: "greater",
                },
              }}
              {...commonProps}
            />
          </GuideBox>
          <GuideBox width="100%" column spacing={1}>
            <Typography variant="body2" color={labelColor}>
              {t("Soil_Resistance_lateral")}
            </Typography>
            <CustomNumberField
              label={t("Soil_Resistance_Slope_Angle")}
              numberFieldWidth={NUMBER_FIELD_WIDTH}
              value={values.groundSlopeAngle.toString()}
              onChange={handleChange("groundSlopeAngle")}
              numberOptions={{
                min: 0,
                condition: {
                  min: "greater",
                },
              }}
              {...commonProps}
            />
            <CustomNumberField
              label={t("Soil_Resistance_Surface_Load")}
              numberFieldWidth={NUMBER_FIELD_WIDTH}
              value={values.groundSurfaceLoad.toString()}
              onChange={handleChange("groundSurfaceLoad")}
              numberOptions={{
                min: 0,
                condition: {
                  min: "greater",
                },
              }}
              {...commonProps}
            />
          </GuideBox>
        </GuideBox>
      </Panel>
    </GuideBox>
  );
});

SoilResistance.displayName = "SoilResistance";

export default SoilResistance;
