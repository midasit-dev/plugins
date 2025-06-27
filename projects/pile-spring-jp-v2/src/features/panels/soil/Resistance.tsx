import React, { useMemo } from "react";
import { Panel, Typography, Check } from "@midasit-dev/moaui";
import {
  CustomNumberField,
  CustomDropList,
  CustomBox,
} from "../../../components";
import { useSoilDomain } from "../../../hooks";
import { useTranslation } from "react-i18next";
import { SoilResistanceMethodItems } from "../../../constants";
import { SOIL_RESISTANCE } from "../../../constants/soil/translations";

const NUMBER_FIELD_WIDTH = 140;

const SoilResistance = React.memo(() => {
  const { t } = useTranslation();
  const {
    resistance: values,
    handleResistanceChange: handleChange,
    handleResistanceCheckBoxChange: handleCheckBoxChange,
  } = useSoilDomain();

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
    <CustomBox sx={{ width: "50%", display: "flex", flexDirection: "column" }}>
      <CustomBox
        sx={{
          width: "100%",
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <Check checked={values.useResistance} onChange={handleCheckBoxChange} />
        <Typography variant="body2" color={labelColor}>
          {t(SOIL_RESISTANCE.SOIL_RESISTANCE)}
        </Typography>
      </CustomBox>
      <Panel width="100%">
        <CustomBox
          sx={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
            gap: 4,
          }}
        >
          <CustomBox
            sx={{
              width: "100%",
              display: "flex",
              flexDirection: "column",
              gap: 4,
            }}
          >
            <Typography variant="body2" color={labelColor}>
              {t(SOIL_RESISTANCE.SOIL_RESISTANCE_AXIAL)}
            </Typography>
            <CustomDropList
              label={t(SOIL_RESISTANCE.SOIL_RESISTANCE_METHOD)}
              droplistWidth={NUMBER_FIELD_WIDTH}
              itemList={SoilResistanceMethodItems()}
              value={values.clayFrictionMethod}
              onChange={handleChange("clayFrictionMethod")}
              {...commonProps}
            />
            <CustomNumberField
              label={t(SOIL_RESISTANCE.SOIL_RESISTANCE_TIP_CAPACITY)}
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
          </CustomBox>
          <CustomBox
            sx={{
              width: "100%",
              display: "flex",
              flexDirection: "column",
              gap: 4,
            }}
          >
            <Typography variant="body2" color={labelColor}>
              {t(SOIL_RESISTANCE.SOIL_RESISTANCE_LATERAL)}
            </Typography>
            <CustomNumberField
              label={t(SOIL_RESISTANCE.SOIL_RESISTANCE_SLOPE_ANGLE)}
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
              label={t(SOIL_RESISTANCE.SOIL_RESISTANCE_SURFACE_LOAD)}
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
          </CustomBox>
        </CustomBox>
      </Panel>
    </CustomBox>
  );
});

SoilResistance.displayName = "SoilResistance";

export default SoilResistance;
