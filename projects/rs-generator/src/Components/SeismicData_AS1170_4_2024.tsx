import React from "react";
import {
  Panel,
  GuideBox,
  Typography,
  TextFieldV2,
  RadioGroup,
  Radio,
  Dialog,
  IconButton,
  Icon,
  DropList,
} from "@midasit-dev/moaui";
import { useRecoilState, useRecoilValue } from "recoil";
import {
  VarProbabilityFactor,
  VarHazardFactor,
  VarPerformanceFactor,
  VarSubSiteClass,
  VarValids,
  VarSpectrumType,
  VarSpectrumTypeList,
  VarMu,
} from "./variables";
import CompTypographyAndTextFieldNumOnly from "./TypographyAndTextFieldNumOnly";

const CompSeismicData_AS1170_4_2024 = () => {
  const valids = useRecoilValue(VarValids);
  const [probabilityFactor, setProbabilityFactor] =
    useRecoilState(VarProbabilityFactor);
  const [hazardFactor, setHazardFactor] = useRecoilState(VarHazardFactor);
  const [performanceFactor, setPerformanceFactor] =
    useRecoilState(VarPerformanceFactor);
  const [mu, setMu] = useRecoilState(VarMu);
  const spectrumType = useRecoilValue(VarSpectrumType);

  return (
    <GuideBox overflow="visible" width={368}>
      <Panel variant="strock" width="100%" padding={2}>
        <GuideBox show fill="1" row borderRadius={1} center marginBottom={1}>
          <Typography variant="h1">Seismic Data</Typography>
          <CompInfoDialog />
        </GuideBox>
        <GuideBox width="100%" spacing={2}>
          <CompSubSiteClass />
          <CompSpectrumType />
          <CompTypographyAndTextFieldNumOnly
            title="Probability Factor(kp)"
            state={probabilityFactor}
            setState={setProbabilityFactor}
            error={!valids.VarProbabilityFactor(probabilityFactor)}
            step={0.1}
          />
          <CompTypographyAndTextFieldNumOnly
            title="Hazard Factor (Z)"
            state={hazardFactor}
            setState={setHazardFactor}
            error={!valids.VarHazardFactor(hazardFactor)}
            step={0.01}
          />
          <CompTypographyAndTextFieldNumOnly
            title="Structural Performance Factor (Sp)"
            state={performanceFactor}
            setState={setPerformanceFactor}
            error={!valids.VarPerformanceFactor(performanceFactor)}
            step={0.1}
          />
          <GuideBox width="100%" height={30} row>
            {spectrumType === 1 ? (
              <CompTypographyAndTextFieldNumOnly
                title="Structural Ductility Factor (μ)"
                state={mu}
                setState={setMu}
                error={!valids.VarMu(mu)}
              />
            ) : null}
          </GuideBox>
        </GuideBox>
      </Panel>
    </GuideBox>
  );
};

export default CompSeismicData_AS1170_4_2024;

const CompSubSiteClass = () => {
  const [subSiteClass, setSubSiteClass] = useRecoilState(VarSubSiteClass);

  const handleChange = (event: React.ChangeEvent, state: string) => {
    setSubSiteClass(state);
  };

  return (
    <GuideBox width="100%">
      <Typography variant="h1" height={30} verCenter>
        Site Sub Soil Class
      </Typography>
      <GuideBox padding={1} width="100%" center>
        <RadioGroup onChange={handleChange} value={subSiteClass} row>
          <Radio name="Ae" value="Ae" />
          <Radio name="Be" value="Be" marginLeft={2} />
          <Radio name="Ce" value="Ce" marginLeft={1.5} />
          <Radio name="De" value="De" marginLeft={1.5} />
          <Radio name="Ee" value="Ee" marginLeft={1.5} />
        </RadioGroup>
      </GuideBox>
    </GuideBox>
  );
};

const CompSpectrumType = () => {
  const [spectrumType, setSpectrumType] = useRecoilState(VarSpectrumType);
  const spectrumTypeList = useRecoilValue(VarSpectrumTypeList);

  return (
    <GuideBox width="100%" row horSpaceBetween>
      <GuideBox width="inherit" row horSpaceBetween verCenter height={30}>
        <Typography variant="h1" height={30} verCenter>
          Spectrum Type
        </Typography>
        <DropList
          width={200}
          itemList={spectrumTypeList}
          defaultValue={spectrumType}
          value={spectrumType}
          onChange={(e: any) => setSpectrumType(e.target.value)}
          listWidth={200}
        />
      </GuideBox>
    </GuideBox>
  );
};

const CompInfoDialog = () => {
  const [open, setOpen] = React.useState(false);

  return (
    <GuideBox>
      <IconButton onClick={() => setOpen(true)} transparent>
        <Icon iconName="InfoOutlined" />
      </IconButton>
      <Dialog
        open={open}
        setOpen={setOpen}
        headerIcon={<Icon iconName="InfoOutlined" />}
        headerTitle="Seismic Data : AS1170.4 (2024)"
      >
        <GuideBox spacing={2}>
          <Typography variant="h1">- Site Sub Soil Class:</Typography>
          <Typography variant="body1">
            Ae, Be, Ce, De, Ee (Refer to AS1170.4 Section 4.2)
          </Typography>

          <Typography variant="h1">- Probability Factor (kp):</Typography>
          <Typography variant="body1">Refer to AS1170.4 Section 3.1</Typography>

          <Typography variant="h1">- Hazard Factor (Z):</Typography>
          <Typography variant="body1">Refer to AS1170.4 Section 3.2</Typography>

          <Typography variant="h1">
            - Structural performance factor (Sp):
          </Typography>
          <Typography variant="body1">Refer to AS1170.4 Table 6.5</Typography>

          <Typography variant="h1">
            - Structural Ductility Factor (μ):
          </Typography>
          <Typography variant="body1">Refer to AS1170.4 Table 6.5</Typography>
        </GuideBox>
      </Dialog>
    </GuideBox>
  );
};
