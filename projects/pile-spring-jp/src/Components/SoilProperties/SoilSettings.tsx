import { GuideBox, Typography, Panel, Check } from "@midasit-dev/moaui";
import TypoGraphyTextField from "../NewComponents/TypoGraphyTextField";
import { useRecoilState, useRecoilValue } from "recoil";
import {
  CalVsiState,
  SoilData,
  LiquefactionState,
  SlopeEffectState,
  GroupEffectState,
  GroupEffectValue,
} from "../variables";
import { useTranslation } from "react-i18next";

function SoilSettings() {
  const { t: translate, i18n: internationalization } = useTranslation();

  const [calVsiState, setCalVsiState] = useRecoilState(CalVsiState);
  const [liqufactionState, setLiqufactionState] =
    useRecoilState(LiquefactionState);
  const [slopeEffectState, setSlopeEffectState] =
    useRecoilState(SlopeEffectState);
  const [groupEffectState, setGroupEffectState] =
    useRecoilState(GroupEffectState);
  const [groupEffectValue, setGroupEffectValue] =
    useRecoilState(GroupEffectValue);

  const [soilData, setSoilData] = useRecoilState(SoilData);
  const handleVsiState = (e: any) => {
    setCalVsiState((prevState) => !prevState);
    if (calVsiState === false) {
      setSoilData((prevSoilData) =>
        prevSoilData.map((row: any) => {
          //Vsi, ED 자동 계산
          let newVsi = 0;
          let newVsd = 0;
          let newED = 0;
          if (row.LayerType === "SoilType_Clay") {
            newVsi = Number(100 * Math.pow(Math.min(row.AvgNValue, 25), 1 / 3));
            if (newVsi < 300) {
              newVsd = 0.8 * newVsi;
            } else {
              newVsd = newVsi;
            }
            let Gd = (row.gamma / 9.8) * Math.pow(newVsd, 2);
            newED = 2 * (1 + Number(row.vd)) * Gd;
            return { ...row, Vsi: newVsi, ED: newED };
          } else if (
            row.LayerType === "SoilType_Sand" ||
            row.LayerType === "SoilType_Sandstone"
          ) {
            newVsi = Number(80 * Math.pow(Math.min(row.AvgNValue, 50), 1 / 3));
            if (newVsi < 300) {
              newVsd = 0.8 * newVsi;
            } else {
              newVsd = newVsi;
            }
            let Gd = (row.gamma / 9.8) * Math.pow(newVsd, 2);
            newED = 2 * (1 + Number(row.vd)) * Gd;
            return { ...row, Vsi: newVsi, ED: newED };
          } else {
            return row;
          }
        })
      );
    }
  };

  const handleLiqufactionState = (e: any) => {
    setLiqufactionState((prevState) => !prevState);
    if (liqufactionState === true) {
      setSoilData(
        soilData.map((data) => {
          return { ...data, DE: 1 };
        })
      );
    }
  };

  const handleSlopeEffectState = (e: any) => {
    setSlopeEffectState((prevState) => !prevState);
    if (slopeEffectState === true) {
      setSoilData(
        soilData.map((data) => {
          return { ...data, Length: 1 };
        })
      );
    }
  };

  const handleGroupEffectState = (e: any) => {
    setGroupEffectState((prevState) => !prevState);
    if (groupEffectState === true) {
      setGroupEffectValue(1.0);
    }
  };
  return (
    <GuideBox>
      <GuideBox row verCenter>
        <Check onChange={handleVsiState} checked={calVsiState} />
        <Typography>{translate("Vsi_AutoCal")}</Typography>
      </GuideBox>
      <Typography variant="h1" padding={1}>
        {translate("Reduce_KH")}
      </Typography>
      <GuideBox>
        <Panel width={362}>
          <GuideBox row verCenter>
            <Check
              onChange={handleLiqufactionState}
              checked={liqufactionState}
            />
            <Typography>{translate("Liquifaction_Title")}</Typography>
          </GuideBox>
          <GuideBox row verCenter>
            <Check
              onChange={handleSlopeEffectState}
              checked={slopeEffectState}
            />
            <Typography>{translate("SlopeEffect_Title")}</Typography>
          </GuideBox>
          <GuideBox row verCenter>
            <Check
              onChange={handleGroupEffectState}
              checked={groupEffectState}
            />
            <Typography>{translate("GroupEffect_Title")}</Typography>
            <GuideBox marginLeft={1}>
              <TypoGraphyTextField
                title="μ"
                value={groupEffectValue}
                onChange={(e: any) => setGroupEffectValue(e.target.value)}
                width={100}
                textFieldWidth={80}
                disabled={!groupEffectState}
              />
            </GuideBox>
          </GuideBox>
        </Panel>
      </GuideBox>
    </GuideBox>
  );
}

export default SoilSettings;
