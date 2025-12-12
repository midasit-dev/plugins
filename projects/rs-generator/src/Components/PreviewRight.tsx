import React from "react";
import { ChartLine, Color, GuideBox, Typography } from "@midasit-dev/moaui";
import {
  createGraphData4NZS1170_5_2004,
  createGraphData4SBC301_CR_2018,
  createGraphData4AS1170_4_2024,
  createGraphData4NF1998_1_2008,
  createGraphData4UNE1998_1_2011,
  createGraphData4CYS1998_1_2004,
  createGraphData4NBN1998_1_2011,
  createGraphData4BDS1998_1_2012,
  createGraphData4DS1998_1_2020,
} from "../utils_pyscript";
import {
  VarDesignSpectrum,
  VarDesignDuctilityFactor,
  VarDistanceFromNearestMajorFault,
  VarHazardFactor,
  VarReturnPeriodFactor,
  VarSiteSubSoilClass,
  VarMaximumPeriod,
  VarValids,
  VarImportanceFactor,
  VarResponseModificationFactor,
  VarLongTranPeriod,
  VarSpectralAccelerationSs,
  VarSpectralAccelerationS1,
  VarSiteClass,
  VarSubSiteClass,
  VarSpectrumType,
  VarProbabilityFactor,
  VarAS1170_4_2024_HazardFactor,
  VarPerformanceFactor,
  VarMu,
  VarFuncName,
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
import { useRecoilValue } from "recoil";
import { useSnackbar } from "notistack";

interface ChartData {
  id: string;
  color: string;
  data: { x: string; y: string }[];
}

const CompPreviewRight = () => {
  const varValids = useRecoilValue(VarValids);
  const design_spectrum = useRecoilValue(VarDesignSpectrum);
  const func_name = useRecoilValue(VarFuncName);

  //NZS1170.5 (2004)용 데이터
  const site_sub_soil_class = useRecoilValue(VarSiteSubSoilClass);
  const return_period_factor = useRecoilValue(VarReturnPeriodFactor);
  const hazard_factor = useRecoilValue(VarHazardFactor);
  const distance_from_nearest_major_fault = useRecoilValue(
    VarDistanceFromNearestMajorFault
  );
  const design_ductility_factor = useRecoilValue(VarDesignDuctilityFactor);
  const maximum_period = useRecoilValue(VarMaximumPeriod);

  const [loading, setLoading] = React.useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const [chartData, setChartData] = React.useState<ChartData[]>([]);
  const processing = React.useRef(false);

  //SBC301_CR_2018
  const site_class = useRecoilValue(VarSiteClass);
  const spectralAccelerationSs = useRecoilValue(VarSpectralAccelerationSs);
  const spectralAccelerationS1 = useRecoilValue(VarSpectralAccelerationS1);
  const importance_factor = useRecoilValue(VarImportanceFactor);
  const response_modification_factor = useRecoilValue(
    VarResponseModificationFactor
  );
  const long_tran_period = useRecoilValue(VarLongTranPeriod);

  //AS1170.4 (2024)
  const sub_site_class = useRecoilValue(VarSubSiteClass);
  const spectrum_type = useRecoilValue(VarSpectrumType);
  const probability_factor = useRecoilValue(VarProbabilityFactor);
  const hazard_factor_AS1170_4_2024 = useRecoilValue(
    VarAS1170_4_2024_HazardFactor
  );
  const performance_factor = useRecoilValue(VarPerformanceFactor);
  const mu = useRecoilValue(VarMu);

  //NF1998_1_2008
  const spectrum_type_NF1998_1_2008 = useRecoilValue(
    VarNF1998_1_2008_SpectrumType
  );
  const ground_type_NF1998_1_2008 = useRecoilValue(VarNF1998_1_2008_GroundType);
  const seismic_zone_NF1998_1_2008 = useRecoilValue(
    VarNF1998_1_2008_SeismicZone
  );
  const importance_factor_NF1998_1_2008 = useRecoilValue(
    VarNF1998_1_2008_ImportanceFactor
  );
  const damping_ratio_NF1998_1_2008 = useRecoilValue(
    VarNF1998_1_2008_DampingRatio
  );
  const behavior_factor_NF1998_1_2008 = useRecoilValue(
    VarNF1998_1_2008_BehaviorFactor
  );
  const lower_bound_factor_NF1998_1_2008 = useRecoilValue(
    VarNF1998_1_2008_LowerBoundFactor
  );

  //UNE1998_1_2011
  const spectrum_type_UNE1998_1_2011 = useRecoilValue(
    VarUNE1998_1_2011_SpectrumType
  );
  const ground_type_UNE1998_1_2011 = useRecoilValue(
    VarUNE1998_1_2011_GroundType
  );
  const pga_value_UNE1998_1_2011 = useRecoilValue(VarUNE1998_1_2011_PgaValue);
  const k_factor_UNE1998_1_2011 = useRecoilValue(VarUNE1998_1_2011_KFactor);
  const c_factor_UNE1998_1_2011 = useRecoilValue(VarUNE1998_1_2011_CFactor);
  const importance_factor_UNE1998_1_2011 = useRecoilValue(
    VarUNE1998_1_2011_ImportanceFactor
  );
  const damping_ratio_UNE1998_1_2011 = useRecoilValue(
    VarUNE1998_1_2011_DampingRatio
  );
  const behavior_factor_UNE1998_1_2011 = useRecoilValue(
    VarUNE1998_1_2011_BehaviorFactor
  );
  const lower_bound_factor_UNE1998_1_2011 = useRecoilValue(
    VarUNE1998_1_2011_LowerBoundFactor
  );

  //CYS1998_1_2004
  const spectrum_type_CYS1998_1_2004 = useRecoilValue(
    VarCYS1998_1_2004_SpectrumType
  );
  const ground_type_CYS1998_1_2004 = useRecoilValue(
    VarCYS1998_1_2004_GroundType
  );
  const seismic_zone_CYS1998_1_2004 = useRecoilValue(
    VarCYS1998_1_2004_SeismicZone
  );
  const importance_factor_CYS1998_1_2004 = useRecoilValue(
    VarCYS1998_1_2004_ImportanceFactor
  );
  const damping_ratio_CYS1998_1_2004 = useRecoilValue(
    VarCYS1998_1_2004_DampingRatio
  );
  const behavior_factor_CYS1998_1_2004 = useRecoilValue(
    VarCYS1998_1_2004_BehaviorFactor
  );
  const lower_bound_factor_CYS1998_1_2004 = useRecoilValue(
    VarCYS1998_1_2004_LowerBoundFactor
  );

  //NBN1998_1_2011
  const spectrum_type_NBN1998_1_2011 = useRecoilValue(
    VarNBN1998_1_2011_SpectrumType
  );
  const ground_type_NBN1998_1_2011 = useRecoilValue(
    VarNBN1998_1_2011_GroundType
  );
  const seismic_zone_NBN1998_1_2011 = useRecoilValue(
    VarNBN1998_1_2011_SeismicZone
  );
  const importance_factor_NBN1998_1_2011 = useRecoilValue(
    VarNBN1998_1_2011_ImportanceFactor
  );
  const damping_ratio_NBN1998_1_2011 = useRecoilValue(
    VarNBN1998_1_2011_DampingRatio
  );
  const behavior_factor_NBN1998_1_2011 = useRecoilValue(
    VarNBN1998_1_2011_BehaviorFactor
  );
  const lower_bound_factor_NBN1998_1_2011 = useRecoilValue(
    VarNBN1998_1_2011_LowerBoundFactor
  );

  // BDS1998_1_2012
  const spectrum_type_BDS1998_1_2012 = useRecoilValue(
    VarBDS1998_1_2012_SpectrumType
  );
  const ground_type_BDS1998_1_2012 = useRecoilValue(
    VarBDS1998_1_2012_GroundType
  );
  const region_BDS1998_1_2012 = useRecoilValue(VarBDS1998_1_2012_Region);
  const pga_value_BDS1998_1_2012 = useRecoilValue(VarBDS1998_1_2012_PgaValue);
  const importance_factor_BDS1998_1_2012 = useRecoilValue(
    VarBDS1998_1_2012_ImportanceFactor
  );
  const damping_ratio_BDS1998_1_2012 = useRecoilValue(
    VarBDS1998_1_2012_DampingRatio
  );
  const behavior_factor_BDS1998_1_2012 = useRecoilValue(
    VarBDS1998_1_2012_BehaviorFactor
  );
  const lower_bound_factor_BDS1998_1_2012 = useRecoilValue(
    VarBDS1998_1_2012_LowerBoundFactor
  );

  // DS1998_1_2020
  const spectrum_type_DS1998_1_2020 = useRecoilValue(
    VarDS1998_1_2020_SpectrumType
  );
  const ground_type_DS1998_1_2020 = useRecoilValue(VarDS1998_1_2020_GroundType);
  const type_DS1998_1_2020 = useRecoilValue(VarDS1998_1_2020_Type);
  const pga_value_DS1998_1_2020 = useRecoilValue(VarDS1998_1_2020_PgaValue);
  const importance_factor_DS1998_1_2020 = useRecoilValue(
    VarDS1998_1_2020_ImportanceFactor
  );
  const damping_ratio_DS1998_1_2020 = useRecoilValue(
    VarDS1998_1_2020_DampingRatio
  );
  const behavior_factor_DS1998_1_2020 = useRecoilValue(
    VarDS1998_1_2020_BehaviorFactor
  );
  const lower_bound_factor_DS1998_1_2020 = useRecoilValue(
    VarDS1998_1_2020_LowerBoundFactor
  );

  React.useEffect(() => {
    if (processing.current) {
      processing.current = false;
      return;
    }

    setLoading(true);
    processing.current = true;

    setTimeout(() => {
      try {
        console.log("current design spectrum", design_spectrum);

        let result = null;
        //NZS1170_5_2004
        if (design_spectrum === 1) {
          if (
            !varValids.VarReturnPeriodFactor(return_period_factor) ||
            !varValids.VarHazardFactor(hazard_factor) ||
            !varValids.VarDesignDuctilityFactor(design_ductility_factor) ||
            !varValids.VarDistanceFromNearestMajorFault(
              distance_from_nearest_major_fault
            )
          ) {
            throw new Error("Creating graph data is failed (Calc Input Error)");
          }

          result = createGraphData4NZS1170_5_2004(
            site_sub_soil_class,
            return_period_factor,
            hazard_factor,
            distance_from_nearest_major_fault,
            design_ductility_factor,
            maximum_period
          );
        }

        //SBC301_CR_2018
        if (design_spectrum === 2) {
          console.log(
            site_class,
            spectralAccelerationSs,
            spectralAccelerationS1,
            importance_factor,
            response_modification_factor,
            long_tran_period,
            maximum_period
          );
          result = createGraphData4SBC301_CR_2018(
            site_class,
            spectralAccelerationSs,
            spectralAccelerationS1,
            importance_factor,
            response_modification_factor,
            long_tran_period,
            maximum_period
          );
        }

        //AS1170.4 (2024)
        if (design_spectrum === 3) {
          console.log(
            sub_site_class,
            spectrum_type,
            probability_factor,
            hazard_factor_AS1170_4_2024,
            performance_factor,
            mu,
            maximum_period
          );
          const effectiveMu = spectrum_type === 1 ? mu : "1";
          result = createGraphData4AS1170_4_2024(
            sub_site_class,
            spectrum_type.toString(),
            probability_factor,
            hazard_factor_AS1170_4_2024,
            performance_factor,
            effectiveMu,
            maximum_period
          );
        }

        //NF1998_1_2008
        if (design_spectrum === 4) {
          console.log(
            spectrum_type_NF1998_1_2008,
            ground_type_NF1998_1_2008,
            seismic_zone_NF1998_1_2008,
            importance_factor_NF1998_1_2008,
            damping_ratio_NF1998_1_2008,
            behavior_factor_NF1998_1_2008,
            lower_bound_factor_NF1998_1_2008,
            maximum_period
          );

          const effective_damping_ratio =
            spectrum_type_NF1998_1_2008 === 1 ||
            spectrum_type_NF1998_1_2008 === 2
              ? damping_ratio_NF1998_1_2008
              : "1";

          const effective_behavior_factor =
            spectrum_type_NF1998_1_2008 === 3 ||
            spectrum_type_NF1998_1_2008 === 4
              ? behavior_factor_NF1998_1_2008
              : "1";

          const effective_lower_bound_factor =
            spectrum_type_NF1998_1_2008 === 3 ||
            spectrum_type_NF1998_1_2008 === 4
              ? lower_bound_factor_NF1998_1_2008
              : "1";

          result = createGraphData4NF1998_1_2008(
            spectrum_type_NF1998_1_2008 === 1
              ? "Horizontal Elastic Spectrum"
              : spectrum_type_NF1998_1_2008 === 2
              ? "Vertical Elastic Spectrum"
              : spectrum_type_NF1998_1_2008 === 3
              ? "Horizontal Design Spectrum"
              : "Vertical Design Spectrum",
            ground_type_NF1998_1_2008,
            seismic_zone_NF1998_1_2008.toString(),
            importance_factor_NF1998_1_2008,
            effective_damping_ratio,
            effective_behavior_factor,
            effective_lower_bound_factor,
            maximum_period
          );
        }

        //UNE1998_1_2011
        if (design_spectrum === 5) {
          console.log(
            spectrum_type_UNE1998_1_2011,
            ground_type_UNE1998_1_2011,
            pga_value_UNE1998_1_2011,
            k_factor_UNE1998_1_2011,
            c_factor_UNE1998_1_2011,
            importance_factor_UNE1998_1_2011,
            damping_ratio_UNE1998_1_2011,
            behavior_factor_UNE1998_1_2011,
            lower_bound_factor_UNE1998_1_2011,
            maximum_period
          );
          const effective_damping_ratio =
            spectrum_type_UNE1998_1_2011 === 1 ||
            spectrum_type_UNE1998_1_2011 === 2
              ? damping_ratio_UNE1998_1_2011
              : "1";

          const effective_behavior_factor =
            spectrum_type_UNE1998_1_2011 === 3 ||
            spectrum_type_UNE1998_1_2011 === 4
              ? behavior_factor_UNE1998_1_2011
              : "1";

          const effective_lower_bound_factor =
            spectrum_type_UNE1998_1_2011 === 3 ||
            spectrum_type_UNE1998_1_2011 === 4
              ? lower_bound_factor_UNE1998_1_2011
              : "1";

          result = createGraphData4UNE1998_1_2011(
            spectrum_type_UNE1998_1_2011 === 1
              ? "Horizontal Elastic Spectrum"
              : spectrum_type_UNE1998_1_2011 === 2
              ? "Vertical Elastic Spectrum"
              : spectrum_type_UNE1998_1_2011 === 3
              ? "Horizontal Design Spectrum"
              : "Vertical Design Spectrum",
            ground_type_UNE1998_1_2011,
            pga_value_UNE1998_1_2011,
            k_factor_UNE1998_1_2011,
            c_factor_UNE1998_1_2011,
            importance_factor_UNE1998_1_2011,
            effective_damping_ratio,
            effective_behavior_factor,
            effective_lower_bound_factor,
            maximum_period
          );
        }

        //CYS1998_1_2004
        if (design_spectrum === 6) {
          console.log(
            spectrum_type_CYS1998_1_2004,
            ground_type_CYS1998_1_2004,
            seismic_zone_CYS1998_1_2004,
            importance_factor_CYS1998_1_2004,
            damping_ratio_CYS1998_1_2004,
            behavior_factor_CYS1998_1_2004,
            lower_bound_factor_CYS1998_1_2004,
            maximum_period
          );

          const effective_damping_ratio =
            spectrum_type_CYS1998_1_2004 === 1 ||
            spectrum_type_CYS1998_1_2004 === 2
              ? damping_ratio_CYS1998_1_2004
              : "1";

          const effective_behavior_factor =
            spectrum_type_CYS1998_1_2004 === 3 ||
            spectrum_type_CYS1998_1_2004 === 4
              ? behavior_factor_CYS1998_1_2004
              : "1";

          const effective_lower_bound_factor =
            spectrum_type_CYS1998_1_2004 === 3 ||
            spectrum_type_CYS1998_1_2004 === 4
              ? lower_bound_factor_CYS1998_1_2004
              : "1";

          result = createGraphData4CYS1998_1_2004(
            spectrum_type_CYS1998_1_2004 === 1
              ? "Horizontal Elastic Spectrum"
              : spectrum_type_CYS1998_1_2004 === 2
              ? "Vertical Elastic Spectrum"
              : spectrum_type_CYS1998_1_2004 === 3
              ? "Horizontal Design Spectrum"
              : "Vertical Design Spectrum",
            ground_type_CYS1998_1_2004,
            seismic_zone_CYS1998_1_2004.toString(),
            importance_factor_CYS1998_1_2004,
            effective_damping_ratio,
            effective_behavior_factor,
            effective_lower_bound_factor,
            maximum_period
          );
        }

        // NBN1998_1_2011
        if (design_spectrum === 7) {
          console.log(
            spectrum_type_NBN1998_1_2011,
            ground_type_NBN1998_1_2011,
            seismic_zone_NBN1998_1_2011,
            importance_factor_NBN1998_1_2011,
            damping_ratio_NBN1998_1_2011,
            behavior_factor_NBN1998_1_2011,
            lower_bound_factor_NBN1998_1_2011,
            maximum_period
          );

          // 스펙트럼 타입에 따른 유효 매개변수 설정
          const effective_damping_ratio =
            spectrum_type_NBN1998_1_2011 === 1 ||
            spectrum_type_NBN1998_1_2011 === 2
              ? damping_ratio_NBN1998_1_2011
              : "1";

          const effective_behavior_factor =
            spectrum_type_NBN1998_1_2011 === 3 ||
            spectrum_type_NBN1998_1_2011 === 4
              ? behavior_factor_NBN1998_1_2011
              : "1";

          const effective_lower_bound_factor =
            spectrum_type_NBN1998_1_2011 === 3 ||
            spectrum_type_NBN1998_1_2011 === 4
              ? lower_bound_factor_NBN1998_1_2011
              : "1";

          // 스펙트럼 타입 문자열 변환
          const spectrumTypeString =
            spectrum_type_NBN1998_1_2011 === 1
              ? "Horizontal Elastic Spectrum"
              : spectrum_type_NBN1998_1_2011 === 2
              ? "Vertical Elastic Spectrum"
              : spectrum_type_NBN1998_1_2011 === 3
              ? "Horizontal Design Spectrum"
              : "Vertical Design Spectrum";

          // 그래프 데이터 생성
          console.log("NBN Input parameters:", {
            spectrumTypeString,
            ground_type_NBN1998_1_2011,
            seismic_zone_NBN1998_1_2011: seismic_zone_NBN1998_1_2011.toString(),
            importance_factor_NBN1998_1_2011,
            effective_damping_ratio,
            effective_behavior_factor,
            effective_lower_bound_factor,
            maximum_period,
          });

          result = createGraphData4NBN1998_1_2011(
            spectrumTypeString,
            ground_type_NBN1998_1_2011,
            seismic_zone_NBN1998_1_2011.toString(),
            importance_factor_NBN1998_1_2011,
            effective_damping_ratio,
            effective_behavior_factor,
            effective_lower_bound_factor,
            maximum_period
          );

          console.log("NBN result:", result);
        }

        // BDS1998_1_2012
        if (design_spectrum === 8) {
          console.log(
            spectrum_type_BDS1998_1_2012,
            ground_type_BDS1998_1_2012,
            region_BDS1998_1_2012,
            pga_value_BDS1998_1_2012,
            importance_factor_BDS1998_1_2012,
            damping_ratio_BDS1998_1_2012,
            behavior_factor_BDS1998_1_2012,
            lower_bound_factor_BDS1998_1_2012,
            maximum_period
          );

          const effective_damping_ratio =
            spectrum_type_BDS1998_1_2012 === 1 ||
            spectrum_type_BDS1998_1_2012 === 2
              ? damping_ratio_BDS1998_1_2012
              : "1";

          const effective_behavior_factor =
            spectrum_type_BDS1998_1_2012 === 3 ||
            spectrum_type_BDS1998_1_2012 === 4
              ? behavior_factor_BDS1998_1_2012
              : "1";

          const effective_lower_bound_factor =
            spectrum_type_BDS1998_1_2012 === 3 ||
            spectrum_type_BDS1998_1_2012 === 4
              ? lower_bound_factor_BDS1998_1_2012
              : "1";

          result = createGraphData4BDS1998_1_2012(
            spectrum_type_BDS1998_1_2012 === 1
              ? "Horizontal Elastic Spectrum"
              : spectrum_type_BDS1998_1_2012 === 2
              ? "Vertical Elastic Spectrum"
              : spectrum_type_BDS1998_1_2012 === 3
              ? "Horizontal Design Spectrum"
              : "Vertical Design Spectrum",
            ground_type_BDS1998_1_2012,
            region_BDS1998_1_2012,
            pga_value_BDS1998_1_2012,
            importance_factor_BDS1998_1_2012,
            effective_damping_ratio,
            effective_behavior_factor,
            effective_lower_bound_factor,
            maximum_period
          );

          console.log("BDS1998_1_2012 result:", result);
        }

        // DS1998_1_2020
        if (design_spectrum === 9) {
          console.log(
            spectrum_type_DS1998_1_2020,
            ground_type_DS1998_1_2020,
            type_DS1998_1_2020,
            pga_value_DS1998_1_2020,
            importance_factor_DS1998_1_2020,
            damping_ratio_DS1998_1_2020,
            behavior_factor_DS1998_1_2020,
            lower_bound_factor_DS1998_1_2020,
            maximum_period
          );
          const effective_damping_ratio =
            spectrum_type_DS1998_1_2020 === 1 ||
            spectrum_type_DS1998_1_2020 === 2
              ? damping_ratio_DS1998_1_2020
              : "1";

          const effective_behavior_factor =
            spectrum_type_DS1998_1_2020 === 3 ||
            spectrum_type_DS1998_1_2020 === 4
              ? behavior_factor_DS1998_1_2020
              : "1";

          const effective_lower_bound_factor =
            spectrum_type_DS1998_1_2020 === 3 ||
            spectrum_type_DS1998_1_2020 === 4
              ? lower_bound_factor_DS1998_1_2020
              : "1";

          result = createGraphData4DS1998_1_2020(
            spectrum_type_DS1998_1_2020 === 1
              ? "Horizontal Elastic Spectrum"
              : spectrum_type_DS1998_1_2020 === 2
              ? "Vertical Elastic Spectrum"
              : spectrum_type_DS1998_1_2020 === 3
              ? "Horizontal Design Spectrum"
              : "Vertical Design Spectrum",
            ground_type_DS1998_1_2020,
            type_DS1998_1_2020,
            pga_value_DS1998_1_2020,
            importance_factor_DS1998_1_2020,
            effective_damping_ratio,
            effective_behavior_factor,
            effective_lower_bound_factor,
            maximum_period
          );

          console.log("DS1998_1_2020 result:", result);
        }

        const arrX = result.period;
        const arrY = result.value;

        if (arrX.length !== arrY.length) {
          enqueueSnackbar("Creating graph data is failed (Calc Input Error)", {
            variant: "error",
          });
          throw new Error("Creating graph data is failed (Calc Input Error)");
        }

        const data_of_chart = [];
        for (let i = 0; i < arrX.length; i++) {
          data_of_chart.push({ x: arrX[i], y: arrY[i] });
        }

        console.log("result", result);
        console.log("data_of_chart", data_of_chart);

        setChartData([
          {
            id: "TempHeating",
            color: Color.secondary.main,
            data: data_of_chart,
          },
        ]);
      } catch (e: any) {
        console.error(e);
      } finally {
        enqueueSnackbar("Updating graph data is successfully", {
          variant: "success",
          autoHideDuration: 1500,
        });
        setLoading(false);

        processing.current = false;
      }
    }, 500);
  }, [
    varValids,
    design_spectrum,
    site_sub_soil_class,
    return_period_factor,
    hazard_factor,
    distance_from_nearest_major_fault,
    design_ductility_factor,
    maximum_period,
    enqueueSnackbar,
    site_class,
    spectralAccelerationSs,
    spectralAccelerationS1,
    importance_factor,
    response_modification_factor,
    long_tran_period,
    hazard_factor_AS1170_4_2024,
    performance_factor,
    sub_site_class,
    spectrum_type,
    mu,
    probability_factor,
    //NF1998_1_2008
    spectrum_type_NF1998_1_2008,
    ground_type_NF1998_1_2008,
    seismic_zone_NF1998_1_2008,
    importance_factor_NF1998_1_2008,
    damping_ratio_NF1998_1_2008,
    behavior_factor_NF1998_1_2008,
    lower_bound_factor_NF1998_1_2008,

    //UNE1998_1_2011
    spectrum_type_UNE1998_1_2011,
    ground_type_UNE1998_1_2011,
    pga_value_UNE1998_1_2011,
    k_factor_UNE1998_1_2011,
    c_factor_UNE1998_1_2011,
    importance_factor_UNE1998_1_2011,
    damping_ratio_UNE1998_1_2011,
    behavior_factor_UNE1998_1_2011,
    lower_bound_factor_UNE1998_1_2011,

    //CYS1998_1_2004
    spectrum_type_CYS1998_1_2004,
    ground_type_CYS1998_1_2004,
    seismic_zone_CYS1998_1_2004,
    importance_factor_CYS1998_1_2004,
    damping_ratio_CYS1998_1_2004,
    behavior_factor_CYS1998_1_2004,
    lower_bound_factor_CYS1998_1_2004,

    //NBN1998_1_2011
    spectrum_type_NBN1998_1_2011,
    ground_type_NBN1998_1_2011,
    seismic_zone_NBN1998_1_2011,
    importance_factor_NBN1998_1_2011,
    damping_ratio_NBN1998_1_2011,
    behavior_factor_NBN1998_1_2011,
    lower_bound_factor_NBN1998_1_2011,

    //BDS1998_1_2012
    spectrum_type_BDS1998_1_2012,
    ground_type_BDS1998_1_2012,
    region_BDS1998_1_2012,
    pga_value_BDS1998_1_2012,
    importance_factor_BDS1998_1_2012,
    damping_ratio_BDS1998_1_2012,
    behavior_factor_BDS1998_1_2012,
    lower_bound_factor_BDS1998_1_2012,

    //DS1998_1_2020
    spectrum_type_DS1998_1_2020,
    ground_type_DS1998_1_2020,
    type_DS1998_1_2020,
    pga_value_DS1998_1_2020,
    importance_factor_DS1998_1_2020,
    damping_ratio_DS1998_1_2020,
    behavior_factor_DS1998_1_2020,
    lower_bound_factor_DS1998_1_2020,
  ]);

  return (
    <GuideBox height="100%" verSpaceBetween>
      <GuideBox show fill="1" width="100%" center padding={1} borderRadius={1}>
        <Typography variant="h1">Preview Design Spectrum</Typography>
      </GuideBox>
      <GuideBox loading={loading} center>
        <CompChartLeftBottom data={chartData} />
      </GuideBox>
    </GuideBox>
  );
};

export default CompPreviewRight;

const CompChartLeftBottom = (props: any) => {
  const { data } = props;

  return (
    <ChartLine
      width={500}
      data={data}
      axisBottom
      axisBottomTickValues={5}
      axisBottomDecimals={2}
      axisBottomTickRotation={0}
      axisBottomLegend="Period (sec)"
      axisBottomLegendOffset={50}
      axisLeft
      axisLeftTickValues={5}
      axisLeftDecimals={5}
      axisLeftTickRotation={0}
      axisLeftLegend="Spectral Data"
      axisLeftLegendOffset={-80}
      marginTop={20}
      marginRight={20}
      marginLeft={90}
      marginBottom={60}
      pointSize={0}
      xDecimals={2}
      yDecimals={4}
    />
  );
};
