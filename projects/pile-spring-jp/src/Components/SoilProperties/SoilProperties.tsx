import { GuideBox, Typography, Panel, Check } from "@midasit-dev/moaui";
import TypoGraphyTextField from "../NewComponents/TypoGraphyTextField";
import SoilSettings from "./SoilSettings";
import SoilTable from "./SoilTable";
import SoilOptions from "./SoilOptions";
import { useRecoilState } from "recoil";
import { GroundLevel, Waterlevel, ResistCal } from "../variables";
import { useTranslation } from "react-i18next";

function SoilProperties() {
  const { t: translate, i18n: internationalization } = useTranslation();
  const [groundLevel, setGroundLevel] = useRecoilState(GroundLevel);
  const [waterlevel, setWaterlevel] = useRecoilState(Waterlevel);
  const [resistCal, setResistCal] = useRecoilState(ResistCal);

  const handleGroundLevelChange = (e: any) => {
    const inputValue = e.target.value;
    if (inputValue === "") {
      setGroundLevel(0);
    }
    if (!Number.isNaN(Number(inputValue))) {
      setGroundLevel(e.target.value);
    } else {
      setGroundLevel(0);
    }
  };
  return (
    <GuideBox width="auto" marginRight={1} marginBottom={1}>
      <GuideBox row spacing={2}>
        <GuideBox>
          <Typography variant="h1" margin={1}>
            {translate("Soil_Info")}
          </Typography>
          <Panel paddingLeft={2} paddingTop={0.5} width={382}>
            <GuideBox row padding={1} width="100" verCenter spacing={1}>
              <TypoGraphyTextField
                title={translate("Soil_Top_Level")}
                width={250}
                textFieldWidth={100}
                value={groundLevel}
                onChange={handleGroundLevelChange}
                placeholder=""
              />
              {/* <TypoGraphyTextField
                    title = "지하 수위면 표고(m)"
                    width = {250}
                    textFieldWidth = {100}
                    value = {waterlevel}
                    onChange = {(e:any) => {setWaterlevel(e.target.value);}}
                    placeholder = '지하수위' /> */}
            </GuideBox>
          </Panel>
          <GuideBox padding={1}>
            <Typography variant="h1">{translate("Soil_Setting")}</Typography>
          </GuideBox>
          <Panel width={382}>
            <GuideBox row>
              <SoilSettings />
            </GuideBox>
          </Panel>
        </GuideBox>
        <GuideBox>
          <GuideBox row verCenter paddingTop={0.375} paddingBottom={0.375}>
            <Check
              checked={resistCal}
              onChange={() => setResistCal((prevState) => !prevState)}
            />
            <Typography variant="h1">{translate("Resist_Cal")}</Typography>
          </GuideBox>
          <Panel width={422}>
            <SoilOptions />
          </Panel>
        </GuideBox>
      </GuideBox>
      <Typography padding={1} variant="h1">
        {translate("Soil_Table")}
      </Typography>
      <Panel width={820}>
        <SoilTable />
      </Panel>
    </GuideBox>
  );
}

export default SoilProperties;
