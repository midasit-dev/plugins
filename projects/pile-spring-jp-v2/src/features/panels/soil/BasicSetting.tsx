/**
 * @fileoverview 지반 기본 설정 패널
 * @description
 * 지반 기본 설정 패널을 표시하고, 지반 기본 설정 정보를 관리합니다.
 */

import React from "react";
import { Panel, Typography, Check } from "@midasit-dev/moaui";
import { CustomNumberField, CustomBox } from "../../../components";
import { useSoilDomain } from "../../../hooks";
import { SOIL_BASIC_SETTING } from "../../../constants/soil/translations";
import { useTranslation } from "react-i18next";

const FIELD_WIDTH = 200;
const NUMBER_FIELD_WIDTH = 80;
const GROUP_FIELD_WIDTH = 100;

const SoilInfo = React.memo(() => {
  const { t } = useTranslation();
  const { basic: values, handleBasicChange: handleChange } = useSoilDomain();

  return (
    <CustomBox sx={{ width: "100%", display: "flex", flexDirection: "column" }}>
      <Typography variant="body2">{t(SOIL_BASIC_SETTING.SOIL_INFO)}</Typography>
      <Panel width="100%">
        <CustomNumberField
          label={t(SOIL_BASIC_SETTING.SOIL_TOP_LEVEL)}
          width={FIELD_WIDTH}
          numberFieldWidth={NUMBER_FIELD_WIDTH}
          value={values.groundLevel.toString()}
          onChange={handleChange("groundLevel")}
          numberOptions={{
            min: 0,
            condition: {
              min: "greater",
            },
          }}
        />
      </Panel>
    </CustomBox>
  );
});

const SoilSettings = React.memo(() => {
  const { t } = useTranslation();
  const {
    basic: values,
    handleBasicChange: handleChange,
    handleBasicCheckBoxChange: handleCheckBoxChange,
  } = useSoilDomain();

  return (
    <CustomBox sx={{ width: "100%", display: "flex", flexDirection: "column" }}>
      <Typography variant="body2">
        {t(SOIL_BASIC_SETTING.SOIL_SETTING)}
      </Typography>
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
            sx={{ width: "100%", display: "flex", flexDirection: "column" }}
          >
            <Typography variant="body2">
              {t(SOIL_BASIC_SETTING.VSI_TITLE)}
            </Typography>
            <Check
              name={t(SOIL_BASIC_SETTING.VSI_AUTO_CAL)}
              checked={values.calVsiState}
              onChange={handleCheckBoxChange("calVsiState")}
            />
          </CustomBox>
          <CustomBox
            sx={{ width: "100%", display: "flex", flexDirection: "column" }}
          >
            <Typography variant="body2">
              {t(SOIL_BASIC_SETTING.REDUCE_KH)}
            </Typography>
            <Check
              name={t(SOIL_BASIC_SETTING.LIQUIFACTION_TITLE)}
              checked={values.liquefactionState}
              onChange={handleCheckBoxChange("liquefactionState")}
            />
            <Check
              name={t(SOIL_BASIC_SETTING.SLOPE_EFFECT_TITLE)}
              checked={values.slopeEffectState}
              onChange={handleCheckBoxChange("slopeEffectState")}
            />
            <CustomBox
              sx={{
                width: "100%",
                display: "flex",
                flexDirection: "row",
                gap: 4,
              }}
            >
              <Check
                name={t(SOIL_BASIC_SETTING.GROUP_EFFECT_TITLE)}
                checked={values.groupEffectState}
                onChange={handleCheckBoxChange("groupEffectState")}
              />
              <CustomNumberField
                label="μ"
                width={GROUP_FIELD_WIDTH}
                disabled={!values.groupEffectState}
                numberFieldWidth={NUMBER_FIELD_WIDTH}
                value={values.groupEffectValue.toString()}
                onChange={handleChange("groupEffectValue")}
              />
            </CustomBox>
          </CustomBox>
        </CustomBox>
      </Panel>
    </CustomBox>
  );
});

const SoilBasicSetting = () => {
  return (
    <CustomBox
      sx={{ width: "50%", display: "flex", flexDirection: "column", gap: 8 }}
    >
      <SoilInfo />
      <SoilSettings />
    </CustomBox>
  );
};

export default React.memo(SoilBasicSetting);
