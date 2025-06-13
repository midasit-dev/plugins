import React from "react";
import { GuideBox, Panel, Typography, Check } from "@midasit-dev/moaui";
import { CustomNumberField, CustomDropList } from "../../components";
import { useSoilResistance } from "../../hooks";
import { useTranslation } from "react-i18next";
import { SoilResistanceMethodItems } from "../../constants";

const SoilBasic = () => {
  const { t } = useTranslation();
  const {
    values,
    handleChange,
    handleCheckBoxChange,
    handleClayFrictionMethodChange,
  } = useSoilResistance();

  return (
    <GuideBox width="50%" column>
      <GuideBox width="100%" row verCenter>
        <Check
          checked={values.useResistance}
          onChange={handleCheckBoxChange("useResistance")}
        />
        <Typography
          variant="body2"
          color={values.useResistance ? "inherit" : "gray"}
        >
          {t("Soil_Resistance")}
        </Typography>
      </GuideBox>
      <Panel width="100%">
        <GuideBox width="100%" column spacing={2}>
          <GuideBox width="100%" column spacing={1}>
            <Typography
              variant="body2"
              color={values.useResistance ? "inherit" : "gray"}
            >
              {t("Soil_Resistance_Axial")}
            </Typography>
            <CustomDropList
              label={t("Soil_Resistance_Method")}
              droplistWidth={140}
              itemList={SoilResistanceMethodItems()}
              value={values.clayFrictionMethod}
              onChange={handleClayFrictionMethodChange}
              disabled={!values.useResistance}
              labelColor={values.useResistance ? "inherit" : "gray"}
            />
            <CustomNumberField
              label={t("Soil_Resistance_Tip_Capacity")}
              numberFieldWidth={140}
              value={values.tipCapacity.toString()}
              onChange={handleChange("tipCapacity")}
              numberOptions={{
                min: 0,
                condition: {
                  min: "greater",
                },
              }}
              disabled={!values.useResistance}
              labelColor={values.useResistance ? "inherit" : "gray"}
            />
          </GuideBox>
          <GuideBox width="100%" column spacing={1}>
            <Typography
              variant="body2"
              color={values.useResistance ? "inherit" : "gray"}
            >
              {t("Soil_Resistance_lateral")}
            </Typography>
            <CustomNumberField
              label={t("Soil_Resistance_Slope_Angle")}
              numberFieldWidth={140}
              value={values.groundSlopeAngle.toString()}
              onChange={handleChange("groundSlopeAngle")}
              numberOptions={{
                min: 0,
                condition: {
                  min: "greater",
                },
              }}
              disabled={!values.useResistance}
              labelColor={values.useResistance ? "inherit" : "gray"}
            />
            <CustomNumberField
              label={t("Soil_Resistance_Surface_Load")}
              numberFieldWidth={140}
              value={values.groundSurfaceLoad.toString()}
              onChange={handleChange("groundSurfaceLoad")}
              numberOptions={{
                min: 0,
                condition: {
                  min: "greater",
                },
              }}
              disabled={!values.useResistance}
              labelColor={values.useResistance ? "inherit" : "gray"}
            />
          </GuideBox>
        </GuideBox>
      </Panel>
    </GuideBox>
  );
};

export default SoilBasic;
