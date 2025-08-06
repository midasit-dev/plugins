import React from "react";
import { useSnackbar } from "notistack";
import { useRecoilValue } from "recoil";
import {
  VarDesignDuctilityFactor,
  VarDistanceFromNearestMajorFault,
  VarHazardFactor,
  VarReturnPeriodFactor,
  VarSiteSubSoilClass,
  VarSiteClass,
  VarDesignSpectrum,
  getDesignSpectrumCodeName,
  VarSpectralAccelerationSs,
  VarSpectralAccelerationS1,
  VarImportanceFactor,
  VarResponseModificationFactor,
  VarLongTranPeriod,
  VarFuncName,
  VarMaximumPeriod,
  VarValids,
  // AS1170.4 (2024)
  VarProbabilityFactor,
  VarPerformanceFactor,
  VarMu,
  VarSubSiteClass,
  VarSpectrumType,
  VarAS1170_4_2024_HazardFactor,

  // NF1998_1_2008
  VarNF1998_1_2008_SpectrumType,
  VarNF1998_1_2008_GroundType,
  VarNF1998_1_2008_SeismicZone,
  VarNF1998_1_2008_ImportanceFactor,
  VarNF1998_1_2008_DampingRatio,
  VarNF1998_1_2008_BehaviorFactor,
  VarNF1998_1_2008_LowerBoundFactor,

  // UNE1998_1_2011
  VarUNE1998_1_2011_SpectrumType,
  VarUNE1998_1_2011_GroundType,
  VarUNE1998_1_2011_PgaValue,
  VarUNE1998_1_2011_KFactor,
  VarUNE1998_1_2011_CFactor,
  VarUNE1998_1_2011_ImportanceFactor,
  VarUNE1998_1_2011_DampingRatio,
  VarUNE1998_1_2011_BehaviorFactor,
  VarUNE1998_1_2011_LowerBoundFactor,

  // CYS1998_1_2004
  VarCYS1998_1_2004_SpectrumType,
  VarCYS1998_1_2004_GroundType,
  VarCYS1998_1_2004_SeismicZone,
  VarCYS1998_1_2004_ImportanceFactor,
  VarCYS1998_1_2004_DampingRatio,
  VarCYS1998_1_2004_BehaviorFactor,
  VarCYS1998_1_2004_LowerBoundFactor,

  // NBN1998_1_2011
  VarNBN1998_1_2011_SpectrumType,
  VarNBN1998_1_2011_GroundType,
  VarNBN1998_1_2011_SeismicZone,
  VarNBN1998_1_2011_ImportanceFactor,
  VarNBN1998_1_2011_DampingRatio,
  VarNBN1998_1_2011_BehaviorFactor,
  VarNBN1998_1_2011_LowerBoundFactor,

  // BDS1998_1_2012
  VarBDS1998_1_2012_SpectrumType,
  VarBDS1998_1_2012_GroundType,
  VarBDS1998_1_2012_Region,
  VarBDS1998_1_2012_PgaValue,
  VarBDS1998_1_2012_ImportanceFactor,
  VarBDS1998_1_2012_DampingRatio,
  VarBDS1998_1_2012_BehaviorFactor,
  VarBDS1998_1_2012_LowerBoundFactor,

  // DS1998_1_2020
  VarDS1998_1_2020_SpectrumType,
  VarDS1998_1_2020_GroundType,
  VarDS1998_1_2020_Type,
  VarDS1998_1_2020_PgaValue,
  VarDS1998_1_2020_ImportanceFactor,
  VarDS1998_1_2020_DampingRatio,
  VarDS1998_1_2020_BehaviorFactor,
  VarDS1998_1_2020_LowerBoundFactor,
} from "./variables";
import {
  GuideBox,
  Button,
  TemplatesFunctionalComponentsValidCheckDialog,
} from "@midasit-dev/moaui";

import {
  spfcUpdate4NZS1170_5_2004,
  spfcUpdate4SBC301_CR_2018,
  spfcUpdate4AS1170_4_2024,
  spfcUpdate4NF1998_1_2008,
  spfcUpdate4UNE1998_1_2011,
  spfcUpdate4CYS1998_1_2004,
  spfcUpdate4NBN1998_1_2011,
  spfcUpdate4BDS1998_1_2012,
  spfcUpdate4DS1998_1_2020,
} from "../utils_pyscript";

const CompUpdate = () => {
  //기준
  const design_spectrum = useRecoilValue(VarDesignSpectrum);

  //for Dialog
  const [open, setOpen] = React.useState(false);

  return (
    <GuideBox horRight width="50%">
      <Button color="negative" onClick={() => setOpen(true)}>
        Update
      </Button>
      {design_spectrum === 1 && (
        <CompValidCheckDialogNZS117052004
          open={open}
          setOpen={setOpen}
          design_spectrum={design_spectrum}
        />
      )}
      {design_spectrum === 2 && (
        <CompValidCheckDialogSBC301CR2018
          open={open}
          setOpen={setOpen}
          design_spectrum={design_spectrum}
        />
      )}
      {design_spectrum === 3 && (
        <CompValidCheckDialogAS117042024
          open={open}
          setOpen={setOpen}
          design_spectrum={design_spectrum}
        />
      )}
      {design_spectrum === 4 && (
        <CompValidCheckDialogNF199812008
          open={open}
          setOpen={setOpen}
          design_spectrum={design_spectrum}
        />
      )}
      {design_spectrum === 5 && (
        <CompValidCheckDialogUNE199812011
          open={open}
          setOpen={setOpen}
          design_spectrum={design_spectrum}
        />
      )}
      {design_spectrum === 6 && (
        <CompValidCheckDialogCYS199812004
          open={open}
          setOpen={setOpen}
          design_spectrum={design_spectrum}
        />
      )}
      {design_spectrum === 7 && (
        <CompValidCheckDialogNBN199812011
          open={open}
          setOpen={setOpen}
          design_spectrum={design_spectrum}
        />
      )}
      {design_spectrum === 8 && (
        <CompValidCheckDialogBDS199812012
          open={open}
          setOpen={setOpen}
          design_spectrum={design_spectrum}
        />
      )}
      {design_spectrum === 9 && (
        <CompValidCheckDialogDS199812020
          open={open}
          setOpen={setOpen}
          design_spectrum={design_spectrum}
        />
      )}
    </GuideBox>
  );
};

export default CompUpdate;

// NZS 1170.5 (2004)
const CompValidCheckDialogNZS117052004 = (props: any) => {
  const { open, setOpen, design_spectrum } = props;

  const { enqueueSnackbar } = useSnackbar();

  //for CheckList
  const [checkList, setCheckList] = React.useState<any>([]);

  //UI Values
  const func_name = useRecoilValue(VarFuncName);
  const site_sub_soil_class = useRecoilValue(VarSiteSubSoilClass);
  const return_period_factor = useRecoilValue(VarReturnPeriodFactor);
  const hazard_factor = useRecoilValue(VarHazardFactor);
  const distance_from_nearest_major_fault = useRecoilValue(
    VarDistanceFromNearestMajorFault
  );
  const design_ductility_factor = useRecoilValue(VarDesignDuctilityFactor);
  const maximum_period = useRecoilValue(VarMaximumPeriod);

  //Create CheckList
  const valids = useRecoilValue(VarValids);
  React.useEffect(() => {
    setCheckList([
      {
        title: "Function Name",
        value: func_name,
        error: !valids.VarFunctionName(func_name),
        reason: "The length of name must be greater than 0.",
      },
      {
        title: "Design Spectrum",
        value: getDesignSpectrumCodeName(design_spectrum),
        error: !valids.VarDesignSpectrum(design_spectrum),
        reason: "",
      },
      {
        title: "Site Sub Soil Class",
        value: site_sub_soil_class,
        error: !valids.VarSiteSubSoilClass(site_sub_soil_class),
        reason: "",
      },
      {
        title: "Return Period Factor",
        value: return_period_factor,
        error: !valids.VarReturnPeriodFactor(return_period_factor),
        reason: "Return period factor must be greater than 0.",
      },
      {
        title: "Hazard Factor",
        value: hazard_factor,
        error: !valids.VarHazardFactor(hazard_factor),
        reason: "Hazard Factor must be greater than 0.",
      },
      {
        title: "Distance From Nearest Major Fault",
        value: distance_from_nearest_major_fault,
        error: !valids.VarDistanceFromNearestMajorFault(
          distance_from_nearest_major_fault
        ),
        reason: "Distance From Nearest Major Fault must be greater than 0.",
      },
      {
        title: "Design Ductility Factor",
        value: design_ductility_factor,
        error: !valids.VarDesignDuctilityFactor(design_ductility_factor),
        reason: "Design Ductility Factor must be greater than 0.",
      },
      {
        title: "Maximum Period",
        value: maximum_period,
        error: !valids.VarMaximumPeriod(maximum_period),
        reason: "Maximum Period must be greater than 0.",
      },
    ]);
  }, [
    design_ductility_factor,
    design_spectrum,
    distance_from_nearest_major_fault,
    func_name,
    hazard_factor,
    maximum_period,
    return_period_factor,
    site_sub_soil_class,
    valids,
  ]);

  return (
    <TemplatesFunctionalComponentsValidCheckDialog
      open={open}
      setOpen={setOpen}
      checkList={checkList}
      buttonText="Update"
      buttonClick={() => {
        const result = spfcUpdate4NZS1170_5_2004(
          func_name,
          site_sub_soil_class,
          return_period_factor,
          hazard_factor,
          distance_from_nearest_major_fault,
          design_ductility_factor,
          maximum_period
        );

        if ("error" in result) {
          enqueueSnackbar(result.error, { variant: "error" });
        }
        console.log(result);

        if ("success" in result) {
          enqueueSnackbar(result.success, {
            variant: "success",
            autoHideDuration: 1500,
          });
        }
      }}
      maxPanelRows={8}
    />
  );
};

// SBC 301-CR (2018)
const CompValidCheckDialogSBC301CR2018 = (props: any) => {
  const { open, setOpen, design_spectrum } = props;

  const { enqueueSnackbar } = useSnackbar();

  //for CheckList
  const [checkList, setCheckList] = React.useState<any>([]);

  //UI Values
  const func_name = useRecoilValue(VarFuncName);
  const site_class = useRecoilValue(VarSiteClass);
  const spectral_acceleration_ss = useRecoilValue(VarSpectralAccelerationSs);
  const spectral_acceleration_s1 = useRecoilValue(VarSpectralAccelerationS1);
  const importance_factor = useRecoilValue(VarImportanceFactor);
  const response_modification_factor = useRecoilValue(
    VarResponseModificationFactor
  );
  const long_tran_period = useRecoilValue(VarLongTranPeriod);
  const maximum_period = useRecoilValue(VarMaximumPeriod);

  //Create CheckList
  const valids = useRecoilValue(VarValids);
  React.useEffect(() => {
    setCheckList([
      {
        title: "Function Name",
        value: func_name,
        error: !valids.VarFunctionName(func_name),
        reason: "The length of name must be greater than 0.",
      },
      {
        title: "Design Spectrum",
        value: getDesignSpectrumCodeName(design_spectrum),
        error: !valids.VarDesignSpectrum(design_spectrum),
        reason: "",
      },
      {
        title: "Site Class",
        value: site_class,
        error: !valids.VarSiteClass(site_class),
        reason: "",
      },
      {
        title: "Spectral Acceleration(Ss)",
        value: spectral_acceleration_ss,
        error: !valids.VarSpectralAccelerationSs(spectral_acceleration_ss),
        reason: "Spectral Acceleration(Ss) must be greater than 0.",
      },
      {
        title: "Spectral Acceleration(S1)",
        value: spectral_acceleration_s1,
        error: !valids.VarSpectralAccelerationS1(spectral_acceleration_s1),
        reason: "Spectral Acceleration(S1) must be greater than 0.",
      },
      {
        title: "Importance Factor(Ie)",
        value: importance_factor,
        error: !valids.VarImportanceFactor(importance_factor),
        reason: "Importance Factor must be greater than 0.",
      },
      {
        title: "Response Modification Factor(R)",
        value: response_modification_factor,
        error: !valids.VarResponseModificationFactor(
          response_modification_factor
        ),
        reason: "Response Modification Factor must be greater than 0.",
      },
      {
        title: "Long-Period Transition Period(TL)",
        value: long_tran_period,
        error: !valids.VarLongTranPeriod(long_tran_period),
        reason: "TL must be greater than Ts and less than the Max Period.",
      },
      {
        title: "Maximum Period",
        value: maximum_period,
        error: !valids.VarMaximumPeriod(maximum_period),
        reason: "Maximum Period must be greater than 0.",
      },
    ]);
  }, [
    design_spectrum,
    func_name,
    importance_factor,
    long_tran_period,
    maximum_period,
    response_modification_factor,
    site_class,
    spectral_acceleration_s1,
    spectral_acceleration_ss,
    valids,
  ]);

  return (
    <TemplatesFunctionalComponentsValidCheckDialog
      open={open}
      setOpen={setOpen}
      checkList={checkList}
      buttonText="Update"
      buttonClick={() => {
        const result = spfcUpdate4SBC301_CR_2018(
          func_name,
          site_class,
          spectral_acceleration_ss,
          spectral_acceleration_s1,
          importance_factor,
          response_modification_factor,
          long_tran_period,
          maximum_period
        );

        if ("error" in result) {
          enqueueSnackbar(result.error, { variant: "error" });
        }

        if ("success" in result) {
          enqueueSnackbar(result.success, {
            variant: "success",
            autoHideDuration: 1500,
          });
        }
      }}
      maxPanelRows={9}
    />
  );
};

// AS 1170.4 (2024)
const CompValidCheckDialogAS117042024 = (props: any) => {
  const { open, setOpen, design_spectrum } = props;
  const { enqueueSnackbar } = useSnackbar();
  //for CheckList
  const [checkList, setCheckList] = React.useState<any>([]);

  //UI Values
  const func_name = useRecoilValue(VarFuncName);
  const sub_site_class = useRecoilValue(VarSubSiteClass);
  const spectrum_type = useRecoilValue(VarSpectrumType);
  const probability_factor = useRecoilValue(VarProbabilityFactor);
  const hazard_factor_AS1170_4_2024 = useRecoilValue(
    VarAS1170_4_2024_HazardFactor
  );
  const performance_factor = useRecoilValue(VarPerformanceFactor);
  const mu = useRecoilValue(VarMu);
  const maximum_period = useRecoilValue(VarMaximumPeriod);

  //Create CheckList
  const valids = useRecoilValue(VarValids);
  React.useEffect(() => {
    setCheckList([
      {
        title: "Function Name",
        value: func_name,
        error: !valids.VarFunctionName(func_name),
        reason: "The length of name must be greater than 0.",
      },
      {
        title: "Design Spectrum",
        value: getDesignSpectrumCodeName(design_spectrum),
        error: !valids.VarDesignSpectrum(design_spectrum),
        reason: "",
      },
      {
        title: "Sub Site Class",
        value: sub_site_class,
        error: !valids.VarSubSiteClass(sub_site_class),
        reason: "",
      },
      {
        title: "Spectrum Type",
        value:
          spectrum_type === 1
            ? "Horizontal Design Spectrum"
            : "Vertical Design Spectrum",
        error: !valids.VarSpectrumType(spectrum_type),
        reason: "",
      },
      {
        title: "Probability Factor(kp)",
        value: probability_factor,
        error: !valids.VarProbabilityFactor(probability_factor),
        reason: "Probability Factor must be greater than 0.",
      },
      {
        title: "Hazard Factor(Z)",
        value: hazard_factor_AS1170_4_2024,
        error: !valids.VarAS1170_4_2024_HazardFactor(
          hazard_factor_AS1170_4_2024
        ),
        reason: "Hazard Factor must be greater than 0.",
      },
      {
        title: "Sp",
        value: performance_factor,
        error: !valids.VarPerformanceFactor(performance_factor),
        reason: "Sp must be greater than 0.",
      },
      {
        title: "Structural Ductility Factor (μ)",
        value: mu,
        error: !valids.VarMu(mu),
        reason: "Mu must be greater than 0.",
      },
      {
        title: "Maximum Period",
        value: maximum_period,
        error: !valids.VarMaximumPeriod(maximum_period),
        reason: "Maximum Period must be greater than 0.",
      },
    ]);
  }, [
    func_name,
    design_spectrum,
    sub_site_class,
    spectrum_type,
    probability_factor,
    hazard_factor_AS1170_4_2024,
    performance_factor,
    mu,
    maximum_period,
    valids,
  ]);

  return (
    <TemplatesFunctionalComponentsValidCheckDialog
      open={open}
      setOpen={setOpen}
      checkList={checkList}
      buttonText="Update"
      buttonClick={() => {
        const result = spfcUpdate4AS1170_4_2024(
          func_name,
          sub_site_class,
          spectrum_type === 1 ? "HORIZONTAL" : "VERTICAL",
          probability_factor,
          hazard_factor_AS1170_4_2024,
          performance_factor,
          mu,
          maximum_period
        );

        console.log("result?", result);

        if ("error" in result) {
          enqueueSnackbar(result.error, { variant: "error" });
        }
        console.log(result);

        if ("success" in result) {
          enqueueSnackbar(result.success, {
            variant: "success",
            autoHideDuration: 1500,
          });
        }
      }}
      maxPanelRows={10}
    />
  );
};

// NF 1998-1 (2008)
const CompValidCheckDialogNF199812008 = (props: any) => {
  const { open, setOpen, design_spectrum } = props;
  const { enqueueSnackbar } = useSnackbar();
  //for CheckList
  const [checkList, setCheckList] = React.useState<any>([]);

  //UI Values
  const func_name = useRecoilValue(VarFuncName);
  const spectrum_type = useRecoilValue(VarNF1998_1_2008_SpectrumType);
  const ground_type = useRecoilValue(VarNF1998_1_2008_GroundType);
  const seismic_zone = useRecoilValue(VarNF1998_1_2008_SeismicZone);
  const importance_factor = useRecoilValue(VarNF1998_1_2008_ImportanceFactor);
  const damping_ratio = useRecoilValue(VarNF1998_1_2008_DampingRatio);
  const behavior_factor = useRecoilValue(VarNF1998_1_2008_BehaviorFactor);
  const lower_bound_factor = useRecoilValue(VarNF1998_1_2008_LowerBoundFactor);
  const maximum_period = useRecoilValue(VarMaximumPeriod);

  //Create CheckList
  const valids = useRecoilValue(VarValids);
  React.useEffect(() => {
    const baseCheckList = [
      {
        title: "Function Name",
        value: func_name,
        error: !valids.VarFunctionName(func_name),
        reason: "The length of name must be greater than 0.",
      },
      {
        title: "Spectrum Type",
        value:
          spectrum_type === 1
            ? "Horizontal Elastic Spectrum"
            : spectrum_type === 2
            ? "Vertical Elastic Spectrum"
            : spectrum_type === 3
            ? "Horizontal Design Spectrum"
            : "Vertical Design Spectrum",
        error: !valids.VarNF1998_1_2008_SpectrumType(spectrum_type),
        reason: "",
      },
      {
        title: "Ground Type",
        value: ground_type,
        error: !valids.VarNF1998_1_2008_GroundType(ground_type),
        reason: "",
      },
      {
        title: "Seismic Zone",
        value: seismic_zone,
        error: !valids.VarNF1998_1_2008_SeismicZone(seismic_zone),
        reason: "",
      },
      {
        title: "Importance Factor(I)",
        value: importance_factor,
        error: !valids.VarNF1998_1_2008_ImportanceFactor(importance_factor),
        reason: "Importance Factor must be greater than 0.",
      },
    ];

    // spectrum_type에 따라 조건부로 항목 추가
    if (spectrum_type === 1 || spectrum_type === 2) {
      // 탄성 스펙트럼일 때 Damping Ratio만 추가
      baseCheckList.push({
        title: "Damping Ratio(%)",
        value: damping_ratio,
        error: !valids.VarNF1998_1_2008_DampingRatio(damping_ratio),
        reason: "Damping Ratio must be greater than 0.",
      });
    } else if (spectrum_type === 3 || spectrum_type === 4) {
      // 설계 스펙트럼일 때 Behavior Factor와 Lower Bound Factor 추가
      baseCheckList.push({
        title: "Behavior Factor(q)",
        value: behavior_factor,
        error: !valids.VarNF1998_1_2008_BehaviorFactor(behavior_factor),
        reason: "Behavior Factor must be greater than 0.",
      });
      baseCheckList.push({
        title: "Lower Bound Factor(β)",
        value: lower_bound_factor,
        error: !valids.VarNF1998_1_2008_LowerBoundFactor(lower_bound_factor),
        reason: "Lower Bound Factor must be greater than 0.",
      });
    }

    baseCheckList.push({
      title: "Maximum Period",
      value: maximum_period,
      error: !valids.VarMaximumPeriod(maximum_period),
      reason: "Maximum Period must be greater than 0.",
    });

    setCheckList(baseCheckList);
  }, [
    func_name,
    design_spectrum,
    spectrum_type,
    ground_type,
    seismic_zone,
    importance_factor,
    damping_ratio,
    behavior_factor,
    lower_bound_factor,
    maximum_period,
    valids,
  ]);

  return (
    <TemplatesFunctionalComponentsValidCheckDialog
      open={open}
      setOpen={setOpen}
      checkList={checkList}
      buttonText="Update"
      buttonClick={() => {
        const result = spfcUpdate4NF1998_1_2008(
          func_name,
          spectrum_type.toString(),
          ground_type,
          seismic_zone,
          importance_factor.toString(),
          damping_ratio,
          behavior_factor,
          lower_bound_factor,
          maximum_period
        );

        if ("error" in result) {
          enqueueSnackbar(result.error, { variant: "error" });
        }
        console.log(result);

        if ("success" in result) {
          enqueueSnackbar(result.success, {
            variant: "success",
            autoHideDuration: 1500,
          });
        }
      }}
      maxPanelRows={11}
    />
  );
};

// UNE 1998-1 (2011)
const CompValidCheckDialogUNE199812011 = (props: any) => {
  const { open, setOpen, design_spectrum } = props;
  const { enqueueSnackbar } = useSnackbar();
  //for CheckList
  const [checkList, setCheckList] = React.useState<any>([]);

  //UI Values
  const func_name = useRecoilValue(VarFuncName);
  const spectrum_type = useRecoilValue(VarUNE1998_1_2011_SpectrumType);
  const ground_type = useRecoilValue(VarUNE1998_1_2011_GroundType);
  const pga_value = useRecoilValue(VarUNE1998_1_2011_PgaValue);
  const k_factor = useRecoilValue(VarUNE1998_1_2011_KFactor);
  const c_factor = useRecoilValue(VarUNE1998_1_2011_CFactor);
  const importance_factor = useRecoilValue(VarUNE1998_1_2011_ImportanceFactor);
  const damping_ratio = useRecoilValue(VarUNE1998_1_2011_DampingRatio);
  const behavior_factor = useRecoilValue(VarUNE1998_1_2011_BehaviorFactor);
  const lower_bound_factor = useRecoilValue(VarUNE1998_1_2011_LowerBoundFactor);
  const maximum_period = useRecoilValue(VarMaximumPeriod);

  //Create CheckList
  const valids = useRecoilValue(VarValids);
  React.useEffect(() => {
    const baseCheckList = [
      {
        title: "Function Name",
        value: func_name,
        error: !valids.VarFunctionName(func_name),
        reason: "The length of name must be greater than 0.",
      },
      {
        title: "Spectrum Type",
        value:
          spectrum_type === 1
            ? "Horizontal Elastic Spectrum"
            : spectrum_type === 2
            ? "Vertical Elastic Spectrum"
            : spectrum_type === 3
            ? "Horizontal Design Spectrum"
            : "Vertical Design Spectrum",
        error: !valids.VarUNE1998_1_2011_SpectrumType(spectrum_type),
        reason: "",
      },
      {
        title: "Ground Type",
        value: ground_type,
        error: !valids.VarUNE1998_1_2011_GroundType(ground_type),
        reason: "",
      },
      {
        title: "PGA Value",
        value: pga_value,
        error: !valids.VarUNE1998_1_2011_PgaValue(pga_value),
        reason: "PGA Value must be greater than 0.",
      },
      {
        title: "K Factor",
        value: k_factor,
        error: !valids.VarUNE1998_1_2011_KFactor(k_factor),
        reason: "K Factor must be greater than 0.",
      },
      {
        title: "C Factor",
        value: c_factor,
        error: !valids.VarUNE1998_1_2011_CFactor(c_factor),
        reason: "C Factor must be greater than 0.",
      },
      {
        title: "Importance Factor(I)",
        value: importance_factor,
        error: !valids.VarUNE1998_1_2011_ImportanceFactor(importance_factor),
        reason: "Importance Factor must be greater than 0.",
      },
    ];

    // spectrum_type에 따라 조건부로 항목 추가
    if (spectrum_type === 1 || spectrum_type === 2) {
      // 탄성 스펙트럼일 때 Damping Ratio만 추가
      baseCheckList.push({
        title: "Damping Ratio(%)",
        value: damping_ratio,
        error: !valids.VarUNE1998_1_2011_DampingRatio(damping_ratio),
        reason: "Damping Ratio must be greater than 0.",
      });
    } else if (spectrum_type === 3 || spectrum_type === 4) {
      // 설계 스펙트럼일 때 Behavior Factor와 Lower Bound Factor 추가
      baseCheckList.push({
        title: "Behavior Factor(q)",
        value: behavior_factor,
        error: !valids.VarUNE1998_1_2011_BehaviorFactor(behavior_factor),
        reason: "Behavior Factor must be greater than 0.",
      });
      baseCheckList.push({
        title: "Lower Bound Factor(β)",
        value: lower_bound_factor,
        error: !valids.VarUNE1998_1_2011_LowerBoundFactor(lower_bound_factor),
        reason: "Lower Bound Factor must be greater than 0.",
      });
    }

    baseCheckList.push({
      title: "Maximum Period",
      value: maximum_period,
      error: !valids.VarMaximumPeriod(maximum_period),
      reason: "Maximum Period must be greater than 0.",
    });

    setCheckList(baseCheckList);
  }, [
    func_name,
    design_spectrum,
    spectrum_type,
    ground_type,
    pga_value,
    k_factor,
    c_factor,
    importance_factor,
    damping_ratio,
    behavior_factor,
    lower_bound_factor,
    maximum_period,
    valids,
  ]);

  return (
    <TemplatesFunctionalComponentsValidCheckDialog
      open={open}
      setOpen={setOpen}
      checkList={checkList}
      buttonText="Update"
      buttonClick={() => {
        const result = spfcUpdate4UNE1998_1_2011(
          func_name,
          spectrum_type.toString(),
          ground_type,
          pga_value,
          k_factor,
          c_factor,
          importance_factor.toString(),
          damping_ratio,
          behavior_factor,
          lower_bound_factor,
          maximum_period
        );

        if ("error" in result) {
          enqueueSnackbar(result.error, { variant: "error" });
        }
        console.log(result);

        if ("success" in result) {
          enqueueSnackbar(result.success, {
            variant: "success",
            autoHideDuration: 1500,
          });
        }
      }}
      maxPanelRows={11}
    />
  );
};

// CYS 1998-1 (2004)
const CompValidCheckDialogCYS199812004 = (props: any) => {
  const { open, setOpen, design_spectrum } = props;
  const { enqueueSnackbar } = useSnackbar();
  //for CheckList
  const [checkList, setCheckList] = React.useState<any>([]);

  //UI Values
  const func_name = useRecoilValue(VarFuncName);
  const spectrum_type = useRecoilValue(VarCYS1998_1_2004_SpectrumType);
  const ground_type = useRecoilValue(VarCYS1998_1_2004_GroundType);
  const seismic_zone = useRecoilValue(VarCYS1998_1_2004_SeismicZone);
  const importance_factor = useRecoilValue(VarCYS1998_1_2004_ImportanceFactor);
  const damping_ratio = useRecoilValue(VarCYS1998_1_2004_DampingRatio);
  const behavior_factor = useRecoilValue(VarCYS1998_1_2004_BehaviorFactor);
  const lower_bound_factor = useRecoilValue(VarCYS1998_1_2004_LowerBoundFactor);
  const maximum_period = useRecoilValue(VarMaximumPeriod);

  //Create CheckList
  const valids = useRecoilValue(VarValids);
  React.useEffect(() => {
    const baseCheckList = [
      {
        title: "Function Name",
        value: func_name,
        error: !valids.VarFunctionName(func_name),
        reason: "The length of name must be greater than 0.",
      },
      {
        title: "Spectrum Type",
        value:
          spectrum_type === 1
            ? "Horizontal Elastic Spectrum"
            : spectrum_type === 2
            ? "Vertical Elastic Spectrum"
            : spectrum_type === 3
            ? "Horizontal Design Spectrum"
            : "Vertical Design Spectrum",
        error: !valids.VarCYS1998_1_2004_SpectrumType(spectrum_type),
        reason: "",
      },
      {
        title: "Ground Type",
        value: ground_type,
        error: !valids.VarCYS1998_1_2004_GroundType(ground_type),
        reason: "",
      },
      {
        title: "Seismic Zone",
        value: seismic_zone,
        error: !valids.VarCYS1998_1_2004_SeismicZone(seismic_zone),
        reason: "",
      },
      {
        title: "Importance Factor(I)",
        value: importance_factor,
        error: !valids.VarCYS1998_1_2004_ImportanceFactor(importance_factor),
        reason: "Importance Factor must be greater than 0.",
      },
    ];

    // spectrum_type에 따라 조건부로 항목 추가
    if (spectrum_type === 1 || spectrum_type === 2) {
      // 탄성 스펙트럼일 때 Damping Ratio만 추가
      baseCheckList.push({
        title: "Damping Ratio(%)",
        value: damping_ratio,
        error: !valids.VarCYS1998_1_2004_DampingRatio(damping_ratio),
        reason: "Damping Ratio must be greater than 0.",
      });
    } else if (spectrum_type === 3 || spectrum_type === 4) {
      // 설계 스펙트럼일 때 Behavior Factor와 Lower Bound Factor 추가
      baseCheckList.push({
        title: "Behavior Factor(q)",
        value: behavior_factor,
        error: !valids.VarCYS1998_1_2004_BehaviorFactor(behavior_factor),
        reason: "Behavior Factor must be greater than 0.",
      });
      baseCheckList.push({
        title: "Lower Bound Factor(β)",
        value: lower_bound_factor,
        error: !valids.VarCYS1998_1_2004_LowerBoundFactor(lower_bound_factor),
        reason: "Lower Bound Factor must be greater than 0.",
      });
    }

    baseCheckList.push({
      title: "Maximum Period",
      value: maximum_period,
      error: !valids.VarMaximumPeriod(maximum_period),
      reason: "Maximum Period must be greater than 0.",
    });

    setCheckList(baseCheckList);
  }, [
    func_name,
    design_spectrum,
    spectrum_type,
    ground_type,
    seismic_zone,
    importance_factor,
    damping_ratio,
    behavior_factor,
    lower_bound_factor,
    maximum_period,
    valids,
  ]);

  return (
    <TemplatesFunctionalComponentsValidCheckDialog
      open={open}
      setOpen={setOpen}
      checkList={checkList}
      buttonText="Update"
      buttonClick={() => {
        const result = spfcUpdate4CYS1998_1_2004(
          func_name,
          spectrum_type.toString(),
          ground_type,
          seismic_zone,
          importance_factor.toString(),
          damping_ratio,
          behavior_factor,
          lower_bound_factor,
          maximum_period
        );

        if ("error" in result) {
          enqueueSnackbar(result.error, { variant: "error" });
        }
        console.log(result);

        if ("success" in result) {
          enqueueSnackbar(result.success, {
            variant: "success",
            autoHideDuration: 1500,
          });
        }
      }}
      maxPanelRows={11}
    />
  );
};

// NBN 1998-1 (2011)
const CompValidCheckDialogNBN199812011 = (props: any) => {
  const { open, setOpen, design_spectrum } = props;
  const { enqueueSnackbar } = useSnackbar();
  //for CheckList
  const [checkList, setCheckList] = React.useState<any>([]);

  //UI Values
  const func_name = useRecoilValue(VarFuncName);
  const spectrum_type = useRecoilValue(VarNBN1998_1_2011_SpectrumType);
  const ground_type = useRecoilValue(VarNBN1998_1_2011_GroundType);
  const seismic_zone = useRecoilValue(VarNBN1998_1_2011_SeismicZone);
  const importance_factor = useRecoilValue(VarNBN1998_1_2011_ImportanceFactor);
  const damping_ratio = useRecoilValue(VarNBN1998_1_2011_DampingRatio);
  const behavior_factor = useRecoilValue(VarNBN1998_1_2011_BehaviorFactor);
  const lower_bound_factor = useRecoilValue(VarNBN1998_1_2011_LowerBoundFactor);
  const maximum_period = useRecoilValue(VarMaximumPeriod);

  //Create CheckList
  const valids = useRecoilValue(VarValids);
  React.useEffect(() => {
    const baseCheckList = [
      {
        title: "Function Name",
        value: func_name,
        error: !valids.VarFunctionName(func_name),
        reason: "The length of name must be greater than 0.",
      },
      {
        title: "Spectrum Type",
        value:
          spectrum_type === 1
            ? "Horizontal Elastic Spectrum"
            : spectrum_type === 2
            ? "Vertical Elastic Spectrum"
            : spectrum_type === 3
            ? "Horizontal Design Spectrum"
            : "Vertical Design Spectrum",
        error: !valids.VarNBN1998_1_2011_SpectrumType(spectrum_type),
        reason: "",
      },
      {
        title: "Ground Type",
        value: ground_type,
        error: !valids.VarNBN1998_1_2011_GroundType(ground_type),
        reason: "",
      },
      {
        title: "Seismic Zone",
        value: seismic_zone,
        error: !valids.VarNBN1998_1_2011_SeismicZone(seismic_zone),
        reason: "",
      },
      {
        title: "Importance Factor(I)",
        value: importance_factor,
        error: !valids.VarNBN1998_1_2011_ImportanceFactor(importance_factor),
        reason: "Importance Factor must be greater than 0.",
      },
    ];

    // spectrum_type에 따라 조건부로 항목 추가
    if (spectrum_type === 1 || spectrum_type === 2) {
      // 탄성 스펙트럼일 때 Damping Ratio만 추가
      baseCheckList.push({
        title: "Damping Ratio(%)",
        value: damping_ratio,
        error: !valids.VarNBN1998_1_2011_DampingRatio(damping_ratio),
        reason: "Damping Ratio must be greater than 0.",
      });
    } else if (spectrum_type === 3 || spectrum_type === 4) {
      // 설계 스펙트럼일 때 Behavior Factor와 Lower Bound Factor 추가
      baseCheckList.push({
        title: "Behavior Factor(q)",
        value: behavior_factor,
        error: !valids.VarNBN1998_1_2011_BehaviorFactor(behavior_factor),
        reason: "Behavior Factor must be greater than 0.",
      });
      baseCheckList.push({
        title: "Lower Bound Factor(β)",
        value: lower_bound_factor,
        error: !valids.VarNBN1998_1_2011_LowerBoundFactor(lower_bound_factor),
        reason: "Lower Bound Factor must be greater than 0.",
      });
    }

    baseCheckList.push({
      title: "Maximum Period",
      value: maximum_period,
      error: !valids.VarMaximumPeriod(maximum_period),
      reason: "Maximum Period must be greater than 0.",
    });

    setCheckList(baseCheckList);
  }, [
    func_name,
    design_spectrum,
    spectrum_type,
    ground_type,
    seismic_zone,
    importance_factor,
    damping_ratio,
    behavior_factor,
    lower_bound_factor,
    maximum_period,
    valids,
  ]);

  return (
    <TemplatesFunctionalComponentsValidCheckDialog
      open={open}
      setOpen={setOpen}
      checkList={checkList}
      buttonText="Update"
      buttonClick={() => {
        const result = spfcUpdate4NBN1998_1_2011(
          func_name,
          spectrum_type.toString(),
          ground_type,
          seismic_zone,
          importance_factor.toString(),
          damping_ratio,
          behavior_factor,
          lower_bound_factor,
          maximum_period
        );

        if ("error" in result) {
          enqueueSnackbar(result.error, { variant: "error" });
        }
        console.log(result);

        if ("success" in result) {
          enqueueSnackbar(result.success, {
            variant: "success",
            autoHideDuration: 1500,
          });
        }
      }}
      maxPanelRows={11}
    />
  );
};

// BDS 1998-1 (2012)
const CompValidCheckDialogBDS199812012 = (props: any) => {
  const { open, setOpen, design_spectrum } = props;
  const { enqueueSnackbar } = useSnackbar();

  //for CheckList
  const [checkList, setCheckList] = React.useState<any>([]);

  //UI Values
  const func_name = useRecoilValue(VarFuncName);
  const spectrum_type = useRecoilValue(VarBDS1998_1_2012_SpectrumType);
  const ground_type = useRecoilValue(VarBDS1998_1_2012_GroundType);
  const region = useRecoilValue(VarBDS1998_1_2012_Region);
  const pga_value = useRecoilValue(VarBDS1998_1_2012_PgaValue);
  const importance_factor = useRecoilValue(VarBDS1998_1_2012_ImportanceFactor);
  const damping_ratio = useRecoilValue(VarBDS1998_1_2012_DampingRatio);
  const behavior_factor = useRecoilValue(VarBDS1998_1_2012_BehaviorFactor);
  const lower_bound_factor = useRecoilValue(VarBDS1998_1_2012_LowerBoundFactor);
  const maximum_period = useRecoilValue(VarMaximumPeriod);

  //Create CheckList
  const valids = useRecoilValue(VarValids);
  React.useEffect(() => {
    const baseCheckList = [
      {
        title: "Function Name",
        value: func_name,
        error: !valids.VarFunctionName(func_name),
        reason: "The length of name must be greater than 0.",
      },
      {
        title: "Spectrum Type",
        value:
          spectrum_type === 1
            ? "Horizontal Elastic Spectrum"
            : spectrum_type === 2
            ? "Vertical Elastic Spectrum"
            : spectrum_type === 3
            ? "Horizontal Design Spectrum"
            : "Vertical Design Spectrum",
        error: !valids.VarBDS1998_1_2012_SpectrumType(spectrum_type),
        reason: "",
      },
      {
        title: "Ground Type",
        value: ground_type,
        error: !valids.VarBDS1998_1_2012_GroundType(ground_type),
        reason: "",
      },
      {
        title: "Region",
        value: region,
        error: !valids.VarBDS1998_1_2012_Region(region),
        reason: "",
      },
      {
        title: "PGA Value",
        value: pga_value,
        error: !valids.VarBDS1998_1_2012_PgaValue(pga_value),
        reason: "PGA Value must be greater than 0.",
      },
      {
        title: "Importance Factor(I)",
        value: importance_factor,
        error: !valids.VarBDS1998_1_2012_ImportanceFactor(importance_factor),
        reason: "Importance Factor must be greater than 0.",
      },
    ];

    // spectrum_type에 따라 조건부로 항목 추가
    if (spectrum_type === 1 || spectrum_type === 2) {
      // 탄성 스펙트럼일 때 Damping Ratio만 추가
      baseCheckList.push({
        title: "Damping Ratio(%)",
        value: damping_ratio,
        error: !valids.VarBDS1998_1_2012_DampingRatio(damping_ratio),
        reason: "Damping Ratio must be greater than 0.",
      });
    } else if (spectrum_type === 3 || spectrum_type === 4) {
      // 설계 스펙트럼일 때 Behavior Factor와 Lower Bound Factor 추가
      baseCheckList.push({
        title: "Behavior Factor(q)",
        value: behavior_factor,
        error: !valids.VarBDS1998_1_2012_BehaviorFactor(behavior_factor),
        reason: "Behavior Factor must be greater than 0.",
      });
      baseCheckList.push({
        title: "Lower Bound Factor(β)",
        value: lower_bound_factor,
        error: !valids.VarBDS1998_1_2012_LowerBoundFactor(lower_bound_factor),
        reason: "Lower Bound Factor must be greater than 0.",
      });
    }

    baseCheckList.push({
      title: "Maximum Period",
      value: maximum_period,
      error: !valids.VarMaximumPeriod(maximum_period),
      reason: "Maximum Period must be greater than 0.",
    });

    setCheckList(baseCheckList);
  }, [
    func_name,
    design_spectrum,
    spectrum_type,
    ground_type,
    region,
    pga_value,
    importance_factor,
    damping_ratio,
    behavior_factor,
    lower_bound_factor,
    maximum_period,
    valids,
  ]);

  return (
    <TemplatesFunctionalComponentsValidCheckDialog
      open={open}
      setOpen={setOpen}
      checkList={checkList}
      buttonText="Update"
      buttonClick={() => {
        const result = spfcUpdate4BDS1998_1_2012(
          func_name,
          spectrum_type.toString(),
          ground_type,
          region,
          pga_value.toString(),
          importance_factor.toString(),
          damping_ratio,
          behavior_factor,
          lower_bound_factor,
          maximum_period
        );

        if ("error" in result) {
          enqueueSnackbar(result.error, { variant: "error" });
        }
        console.log(result);

        if ("success" in result) {
          enqueueSnackbar(result.success, {
            variant: "success",
            autoHideDuration: 1500,
          });
        }
      }}
      maxPanelRows={11}
    />
  );
};

// DS 1998-1 (2020)
const CompValidCheckDialogDS199812020 = (props: any) => {
  const { open, setOpen, design_spectrum } = props;
  const { enqueueSnackbar } = useSnackbar();

  //for CheckList
  const [checkList, setCheckList] = React.useState<any>([]);

  //UI Values
  const func_name = useRecoilValue(VarFuncName);
  const spectrum_type = useRecoilValue(VarDS1998_1_2020_SpectrumType);
  const ground_type = useRecoilValue(VarDS1998_1_2020_GroundType);
  const type = useRecoilValue(VarDS1998_1_2020_Type);
  const pga_value = useRecoilValue(VarDS1998_1_2020_PgaValue);
  const importance_factor = useRecoilValue(VarDS1998_1_2020_ImportanceFactor);
  const damping_ratio = useRecoilValue(VarDS1998_1_2020_DampingRatio);
  const behavior_factor = useRecoilValue(VarDS1998_1_2020_BehaviorFactor);
  const lower_bound_factor = useRecoilValue(VarDS1998_1_2020_LowerBoundFactor);
  const maximum_period = useRecoilValue(VarMaximumPeriod);

  //Create CheckList
  const valids = useRecoilValue(VarValids);
  React.useEffect(() => {
    const baseCheckList = [
      {
        title: "Function Name",
        value: func_name,
        error: !valids.VarFunctionName(func_name),
        reason: "The length of name must be greater than 0.",
      },
      {
        title: "Spectrum Type",
        value:
          spectrum_type === 1
            ? "Horizontal Elastic Spectrum"
            : spectrum_type === 2
            ? "Vertical Elastic Spectrum"
            : spectrum_type === 3
            ? "Horizontal Design Spectrum"
            : "Vertical Design Spectrum",
        error: !valids.VarDS1998_1_2020_SpectrumType(spectrum_type),
        reason: "",
      },
      {
        title: "Ground Type",
        value: ground_type,
        error: !valids.VarDS1998_1_2020_GroundType(ground_type),
        reason: "",
      },
      {
        title: "Type",
        value: type,
        error: !valids.VarDS1998_1_2020_Type(type),
        reason: "",
      },
      {
        title: "PGA Value",
        value: pga_value,
        error: !valids.VarDS1998_1_2020_PgaValue(pga_value),
        reason: "PGA Value must be greater than 0.",
      },
      {
        title: "Importance Factor(I)",
        value: importance_factor,
        error: !valids.VarDS1998_1_2020_ImportanceFactor(importance_factor),
        reason: "Importance Factor must be greater than 0.",
      },
    ];

    // spectrum_type에 따라 조건부로 항목 추가
    if (spectrum_type === 1 || spectrum_type === 2) {
      // 탄성 스펙트럼일 때 Damping Ratio만 추가
      baseCheckList.push({
        title: "Damping Ratio(%)",
        value: damping_ratio,
        error: !valids.VarDS1998_1_2020_DampingRatio(damping_ratio),
        reason: "Damping Ratio must be greater than 0.",
      });
    } else if (spectrum_type === 3 || spectrum_type === 4) {
      // 설계 스펙트럼일 때 Behavior Factor와 Lower Bound Factor 추가
      baseCheckList.push({
        title: "Behavior Factor(q)",
        value: behavior_factor,
        error: !valids.VarDS1998_1_2020_BehaviorFactor(behavior_factor),
        reason: "Behavior Factor must be greater than 0.",
      });
      baseCheckList.push({
        title: "Lower Bound Factor(β)",
        value: lower_bound_factor,
        error: !valids.VarDS1998_1_2020_LowerBoundFactor(lower_bound_factor),
        reason: "Lower Bound Factor must be greater than 0.",
      });
    }

    baseCheckList.push({
      title: "Maximum Period",
      value: maximum_period,
      error: !valids.VarMaximumPeriod(maximum_period),
      reason: "Maximum Period must be greater than 0.",
    });

    setCheckList(baseCheckList);
  }, [
    func_name,
    design_spectrum,
    spectrum_type,
    ground_type,
    type,
    pga_value,
    importance_factor,
    damping_ratio,
    behavior_factor,
    lower_bound_factor,
    maximum_period,
    valids,
  ]);

  return (
    <TemplatesFunctionalComponentsValidCheckDialog
      open={open}
      setOpen={setOpen}
      checkList={checkList}
      buttonText="Update"
      buttonClick={() => {
        const result = spfcUpdate4DS1998_1_2020(
          func_name,
          spectrum_type.toString(),
          ground_type,
          type,
          pga_value.toString(),
          importance_factor.toString(),
          damping_ratio,
          behavior_factor,
          lower_bound_factor,
          maximum_period
        );

        if ("error" in result) {
          enqueueSnackbar(result.error, { variant: "error" });
        }
        console.log(result);

        if ("success" in result) {
          enqueueSnackbar(result.success, {
            variant: "success",
            autoHideDuration: 1500,
          });
        }
      }}
      maxPanelRows={11}
    />
  );
};
