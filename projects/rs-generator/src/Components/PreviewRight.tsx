import React from "react";
import { ChartLine, Color, GuideBox, Typography } from "@midasit-dev/moaui";
import {
  createGraphData4NZS1170_5_2004,
  createGraphData4SBC301_CR_2018,
  createGraphData4AS1170_4_2024,
  createGraphData4NF1998_1_2008,
  createGraphData4UNE1998_1_2011,
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
