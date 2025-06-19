import { Button } from "@midasit-dev/moaui";
import { useTranslation } from "react-i18next";
import {
  pileDataListState,
  soilBasicState,
  soilResistanceState,
  soilTableState,
} from "../../states";
import { useRecoilValue } from "recoil";
// import { CalculateBeta } from "../../utils_pyscript";

const Calculation = () => {
  const { t } = useTranslation();
  const pileDataList = useRecoilValue(pileDataListState);
  const soilBasic = useRecoilValue(soilBasicState);
  const soilResistance = useRecoilValue(soilResistanceState);
  const soilTable = useRecoilValue(soilTableState);

  const handleCalculation = () => {
    // console.log(pileDataList);
    // console.log(soilBasic);
    // console.log(soilResistance);
    // console.log(soilTable);
    // const Beta_Normal = CalculateBeta(
    //   "normal",
    //   soilTable,
    //   pileDataList,
    //   soilBasic
    // );
    // console.log(Beta_Normal);
    // const Beta_Seismic = CalculateBeta(
    //   "seismic",
    //   soilTable,
    //   pileDataList,
    //   soilBasic
    // );
    // console.log(Beta_Seismic);
    // const Beta_Period = CalculateBeta(
    //   "period",
    //   soilTable,
    //   pileDataList,
    //   soilBasic
    // );
    // console.log(Beta_Period);
  };

  return (
    <Button variant="contained" onClick={handleCalculation}>
      {t("Calculate_Button")}
    </Button>
  );
};

export default Calculation;
