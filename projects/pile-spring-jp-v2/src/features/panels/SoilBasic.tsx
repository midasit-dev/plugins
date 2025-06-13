import React from "react";
import { GuideBox, Panel, Typography, Check } from "@midasit-dev/moaui";
import { CustomNumberField, CustomCheckBox } from "../../components";
import { useSoilBasic } from "../../hooks";
import { useTranslation } from "react-i18next";

const SoilBasic = () => {
  const { t } = useTranslation();
  const { values, handleChange, handleCheckBoxChange } = useSoilBasic();

  return (
    <GuideBox width="50%" column spacing={2}>
      <GuideBox width="100%" column>
        <Typography variant="body2">{t("Soil_Info")}</Typography>
        <Panel width="100%">
          <CustomNumberField
            label={t("Soil_Top_Level")}
            width={200}
            numberFieldWidth={80}
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
      </GuideBox>
      <GuideBox width="100%" column>
        <Typography variant="body2">{t("Soil_Setting")}</Typography>
        <Panel width="100%">
          <GuideBox width="100%" column spacing={1}>
            <GuideBox width="100%" column>
              <Typography variant="body2">{t("Vsi_Title")}</Typography>
              <Check
                name={t("Vsi_AutoCal")}
                checked={values.calVsiState}
                onChange={handleCheckBoxChange("calVsiState")}
              />
            </GuideBox>
            <GuideBox width="100%" column>
              <Typography variant="body2">{t("Reduce_KH")}</Typography>
              <Check
                name={t("Liquifaction_Title")}
                checked={values.liquefactionState}
                onChange={handleCheckBoxChange("liquefactionState")}
              />
              <Check
                name={t("SlopeEffect_Title")}
                checked={values.slopeEffectState}
                onChange={handleCheckBoxChange("slopeEffectState")}
              />
              <GuideBox width="100%" row spacing={1}>
                <Check
                  name={t("GroupEffect_Title")}
                  checked={values.groupEffectState}
                  onChange={handleCheckBoxChange("groupEffectState")}
                />
                <CustomNumberField
                  label="μ"
                  width={100}
                  disabled={!values.groupEffectState}
                  numberFieldWidth={80}
                  value={values.groupEffectValue.toString()}
                  onChange={handleChange("groupEffectValue")}
                />
              </GuideBox>
            </GuideBox>
          </GuideBox>
        </Panel>
      </GuideBox>
    </GuideBox>
  );
};

export default SoilBasic;
