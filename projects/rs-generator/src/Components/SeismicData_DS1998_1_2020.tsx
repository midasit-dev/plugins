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
  VarDS1998_1_2020_SpectrumType,
  VarDS1998_1_2020_GroundType,
  VarDS1998_1_2020_Type,
  VarDS1998_1_2020_PgaValue,
  VarDS1998_1_2020_ImportanceFactor,
  VarDS1998_1_2020_DampingRatio,
  VarDS1998_1_2020_BehaviorFactor,
  VarDS1998_1_2020_LowerBoundFactor,
  VarDS1998_1_2020_SpectrumTypeList,
  VarDS1998_1_2020_GroundTypeList,
  VarDS1998_1_2020_TypeList,
} from "./variables";
import CompTypographyAndTextFieldNumOnly from "./TypographyAndTextFieldNumOnly";

const CompSeismicData_DS1998_1_2020 = () => {
  const valids = useRecoilValue(VarValids);
  const spectrumType = useRecoilValue(VarDS1998_1_2020_SpectrumType);
  const groundType = useRecoilValue(VarDS1998_1_2020_GroundType);
  const type = useRecoilValue(VarDS1998_1_2020_Type);
  const [pgaValue, setPgaValue] = useRecoilState(VarDS1998_1_2020_PgaValue);
  const [importanceFactor, setImportanceFactor] = useRecoilState(
    VarDS1998_1_2020_ImportanceFactor
  );
  const [dampingRatio, setDampingRatio] = useRecoilState(
    VarDS1998_1_2020_DampingRatio
  );
  const [behaviorFactor, setBehaviorFactor] = useRecoilState(
    VarDS1998_1_2020_BehaviorFactor
  );
  const [lowerBoundFactor, setLowerBoundFactor] = useRecoilState(
    VarDS1998_1_2020_LowerBoundFactor
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
          <CompType />
          <CompTypographyAndTextFieldNumOnly
            title="Reference Peak Ground Acceleration(m/s²)"
            state={pgaValue}
            setState={setPgaValue}
            error={!valids.VarDS1998_1_2020_PgaValue(pgaValue)}
            height={20}
            step={0.01}
          />
          <CompTypographyAndTextFieldNumOnly
            title="Importance Factor (γI)"
            state={importanceFactor}
            setState={setImportanceFactor}
            error={!valids.VarDS1998_1_2020_ImportanceFactor(importanceFactor)}
            height={20}
            step={0.1}
          />
          <GuideBox width="100%" height={20} row>
            {spectrumType === 1 || spectrumType === 2 ? (
              <CompTypographyAndTextFieldNumOnly
                title="Viscous Damping Ratio (%)"
                state={dampingRatio}
                setState={setDampingRatio}
                error={!valids.VarDS1998_1_2020_DampingRatio(dampingRatio)}
                height={20}
              />
            ) : null}
            {spectrumType === 3 || spectrumType === 4 ? (
              <CompTypographyAndTextFieldNumOnly
                title="Behavior Factor (q)"
                state={behaviorFactor}
                setState={setBehaviorFactor}
                error={!valids.VarDS1998_1_2020_BehaviorFactor(behaviorFactor)}
                height={20}
                step={0.1}
              />
            ) : null}
          </GuideBox>
          <GuideBox width="100%" height={20} row>
            {spectrumType === 3 || spectrumType === 4 ? (
              <CompTypographyAndTextFieldNumOnly
                title="Lower Bound Factor (β)"
                state={lowerBoundFactor}
                setState={setLowerBoundFactor}
                error={
                  !valids.VarDS1998_1_2020_LowerBoundFactor(lowerBoundFactor)
                }
                height={20}
                step={0.1}
              />
            ) : null}
          </GuideBox>
        </GuideBox>
      </Panel>
    </GuideBox>
  );
};

export default CompSeismicData_DS1998_1_2020;

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
        headerTitle="Seismic Data : Denmark DS/EN1998-1 (2020)"
      >
        <GuideBox spacing={2}>
          <Typography variant="h1">- Ground Type : </Typography>
          <Typography variant="body1">
            A,B,C,D,E (Refer to DS/EN1998-1 Table 3.1)
          </Typography>
          <Typography variant="h1">- Spectrum Type : </Typography>
          <Typography variant="body1">
            Type 1, Type 2(Refer to DS/EN1998-1 Section 3.2.2.1)
          </Typography>
          <Typography variant="h1">
            - Reference Peak Ground Acceleration(AgR):
          </Typography>
          <Typography variant="body1">
            Refer to DS/EN1998-1 Figure D.2 Value of design ground Acceleration
          </Typography>

          <Typography variant="h1">- Importance Factor (γI):</Typography>
          <Typography variant="body1">
            Refer to DS/EN1998-1 Section 4.2.5(5)
          </Typography>

          <Typography variant="h1">- Behavior Factor:</Typography>
          <Typography variant="body1">
            Refer to DS/EN1998-1 Table 9.1
          </Typography>

          <Typography variant="h1">- Lower Bound Factor:</Typography>
          <Typography variant="body1">
            Refer to DS/EN1998-1 Section 3.2.2.5(4)
          </Typography>
        </GuideBox>
      </Dialog>
    </GuideBox>
  );
};

const CompSpectrumType = () => {
  const [spectrumType, setSpectrumType] = useRecoilState(
    VarDS1998_1_2020_SpectrumType
  );
  const spectrumTypeList = useRecoilValue(VarDS1998_1_2020_SpectrumTypeList);

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
    VarDS1998_1_2020_GroundType
  );
  const groundTypeList = useRecoilValue(VarDS1998_1_2020_GroundTypeList);

  return (
    <GuideBox width="100%" row horSpaceBetween>
      <GuideBox width="inherit" row horSpaceBetween verCenter height={30}>
        <Typography variant="h1" height={30} verCenter>
          Ground Type
        </Typography>
        <DropList
          width={200}
          itemList={groundTypeList}
          defaultValue={groundType}
          value={groundType}
          onChange={(e: any) => setGroundType(e.target.value)}
          listWidth={200}
        />
      </GuideBox>
    </GuideBox>
  );
};

const CompType = () => {
  const [type, setType] = useRecoilState(VarDS1998_1_2020_Type);
  const typeList = useRecoilValue(VarDS1998_1_2020_TypeList);
  return (
    <GuideBox width="100%" row horSpaceBetween>
      <GuideBox width="inherit" row horSpaceBetween verCenter height={30}>
        <Typography variant="h1" height={30} verCenter>
          Spectrum Type
        </Typography>
        <DropList
          width={200}
          itemList={typeList}
          defaultValue={type}
          value={type}
          onChange={(e: any) => setType(e.target.value)}
          listWidth={200}
        />
      </GuideBox>
    </GuideBox>
  );
};
