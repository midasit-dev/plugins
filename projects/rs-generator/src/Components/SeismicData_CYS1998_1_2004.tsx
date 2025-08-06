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
  VarValids,
  VarFuncName,
  VarCYS1998_1_2004_SpectrumType,
  VarCYS1998_1_2004_GroundType,
  VarCYS1998_1_2004_SeismicZone,
  VarCYS1998_1_2004_ImportanceFactor,
  VarCYS1998_1_2004_DampingRatio,
  VarCYS1998_1_2004_BehaviorFactor,
  VarCYS1998_1_2004_LowerBoundFactor,
  VarCYS1998_1_2004_SeismicZoneList,
  VarCYS1998_1_2004_SpectrumTypeList,
} from "./variables";
import CompTypographyAndTextFieldNumOnly from "./TypographyAndTextFieldNumOnly";

const CompSeismicData_CYS1998_1_2004 = () => {
  const valids = useRecoilValue(VarValids);
  const spectrumType = useRecoilValue(VarCYS1998_1_2004_SpectrumType);

  const [importanceFactor, setImportanceFactor] = useRecoilState(
    VarCYS1998_1_2004_ImportanceFactor
  );
  const [dampingRatio, setDampingRatio] = useRecoilState(
    VarCYS1998_1_2004_DampingRatio
  );
  const [behaviorFactor, setBehaviorFactor] = useRecoilState(
    VarCYS1998_1_2004_BehaviorFactor
  );
  const [lowerBoundFactor, setLowerBoundFactor] = useRecoilState(
    VarCYS1998_1_2004_LowerBoundFactor
  );

  // 스펙트럼 타입이 변경될 때 Behavior Factor와 Damping Ratio 값 설정
  React.useEffect(() => {
    if (spectrumType === 3 || spectrumType === 4) {
      // 설계 스펙트럼일 때 Behavior Factor를 1.5로 설정
      setBehaviorFactor("1.5");
    } else {
      // 탄성 스펙트럼일 때 Damping Ratio를 5로 설정
      setDampingRatio("5");
    }
  }, [spectrumType]);

  return (
    <GuideBox overflow="visible" width={368}>
      <Panel variant="strock" width="100%" padding={2}>
        <GuideBox show fill="1" row borderRadius={1} center marginBottom={1}>
          <Typography variant="h1">Seismic Data</Typography>
          <CompInfoDialog />
        </GuideBox>
        <GuideBox width="100%" spacing={2}>
          <CompSpectrumType />
          <CompGroundType />
          <CompSeismicZone />
          <CompTypographyAndTextFieldNumOnly
            title="Importance Factor (γI)"
            state={importanceFactor}
            setState={setImportanceFactor}
            error={!valids.VarCYS1998_1_2004_ImportanceFactor(importanceFactor)}
            step={0.1}
          />
          <GuideBox width="100%" height={30} row>
            {spectrumType === 1 || spectrumType === 2 ? (
              <CompTypographyAndTextFieldNumOnly
                title="Viscous Damping Ratio (%)"
                state={dampingRatio}
                setState={setDampingRatio}
                error={!valids.VarCYS1998_1_2004_DampingRatio(dampingRatio)}
              />
            ) : null}
            {spectrumType === 3 || spectrumType === 4 ? (
              <CompTypographyAndTextFieldNumOnly
                title="Behavior Factor (q)"
                state={behaviorFactor}
                setState={setBehaviorFactor}
                error={!valids.VarCYS1998_1_2004_BehaviorFactor(behaviorFactor)}
                step={0.1}
              />
            ) : null}
          </GuideBox>
          <GuideBox width="100%" height={30} row>
            {spectrumType === 3 || spectrumType === 4 ? (
              <CompTypographyAndTextFieldNumOnly
                title="Lower Bound Factor (β)"
                state={lowerBoundFactor}
                setState={setLowerBoundFactor}
                error={
                  !valids.VarCYS1998_1_2004_LowerBoundFactor(lowerBoundFactor)
                }
                step={0.1}
              />
            ) : null}
          </GuideBox>
        </GuideBox>
      </Panel>
    </GuideBox>
  );
};

export default CompSeismicData_CYS1998_1_2004;
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
        headerTitle="Seismic Data : Cyprus CYS 1998-1 (2004)"
      >
        <GuideBox spacing={2}>
          <Typography variant="h1">- Ground Type : </Typography>
          <Typography variant="body1">
            A,B,C,D,E (Refer to CYS-EN1998-1 Table 3.1)
          </Typography>

          <Typography variant="h1">- Seismic Zone : </Typography>
          <Typography variant="body1">
            Refer to CYS-EN1998-1 Zonation Map
          </Typography>

          <Typography variant="h1">- Importance Factor (I):</Typography>
          <Typography variant="body1">
            Refer to CYS-EN1998-1 Section 4.2.5(5)
          </Typography>

          <Typography variant="h1">- Behavior Factor:</Typography>
          <Typography variant="body1">
            Refer to CYS-EN1998-1 Table 9.1
          </Typography>

          <Typography variant="h1">- Lower Bound Factor:</Typography>
          <Typography variant="body1">
            Refer to CYS-EN1998-1 Section 3.2.2.5(4)
          </Typography>
        </GuideBox>
      </Dialog>
    </GuideBox>
  );
};

const CompSpectrumType = () => {
  const [spectrumType, setSpectrumType] = useRecoilState(
    VarCYS1998_1_2004_SpectrumType
  );
  const spectrumTypeList = useRecoilValue(VarCYS1998_1_2004_SpectrumTypeList);

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

const CompGroundType = () => {
  const [groundType, setGroundType] = useRecoilState(
    VarCYS1998_1_2004_GroundType
  );

  const handleChange = (event: React.ChangeEvent, state: string) => {
    setGroundType(state);
  };

  return (
    <GuideBox width="100%">
      <Typography variant="h1" height={30} verCenter>
        Ground Type
      </Typography>
      <GuideBox padding={1} width="100%" center>
        <RadioGroup onChange={handleChange} value={groundType} row>
          <Radio name="A" value="A" />
          <Radio name="B" value="B" marginLeft={2.5} />
          <Radio name="C" value="C" marginLeft={1.5} />
          <Radio name="D" value="D" marginLeft={1.5} />
          <Radio name="E" value="E" marginLeft={1.5} />
        </RadioGroup>
      </GuideBox>
    </GuideBox>
  );
};

const CompSeismicZone = () => {
  const [seismicZone, setSeismicZone] = useRecoilState(
    VarCYS1998_1_2004_SeismicZone
  );
  const seismicZoneList = useRecoilValue(VarCYS1998_1_2004_SeismicZoneList);

  return (
    <GuideBox width="100%" row horSpaceBetween>
      <GuideBox width="inherit" row horSpaceBetween verCenter height={30}>
        <Typography variant="h1" height={30} verCenter>
          Seismic Zone
        </Typography>
        <DropList
          width={200}
          itemList={seismicZoneList}
          defaultValue={seismicZone}
          value={seismicZone}
          onChange={(e: any) => setSeismicZone(e.target.value)}
          listWidth={200}
        />
      </GuideBox>
    </GuideBox>
  );
};

// const CompGroundType = () => {
//   const [groundType, setGroundType] = useRecoilState(
//     VarNF1998_1_2008_GroundType
//   );
//   const groundTypeList = useRecoilValue(VarNF1998_1_2008_GroundTypeList);

//   return (
//     <GuideBox width="100%" row horSpaceBetween>
//       <GuideBox width="inherit" row horSpaceBetween verCenter height={30}>
//         <Typography variant="h1" height={30} verCenter>
//           Ground Type
//         </Typography>
//         <DropList
//           width={200}
//           itemList={groundTypeList}
//           defaultValue={groundType}
//           value={groundType}
//           onChange={(e: any) => setGroundType(e.target.value)}
//           listWidth={200}
//         />
//       </GuideBox>
//     </GuideBox>
//   );
// };
