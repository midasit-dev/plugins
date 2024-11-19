import { GuideBox, Typography } from "@midasit-dev/moaui";
import OrographyType from "./comps/OrographyType";
import { VELOCITY_PRESSURE_CASES_WIDTH } from "../../../../../../../../../../defines/widthDefines";
import Location from "./comps/Location";
import H from "./comps/H";
import Lu from "./comps/Lu";
import Ld from "./comps/Ld";
import Refz from "./comps/Refz";
import LoadedLength from "./comps/LoadedLength";
import Result from "./SbScCoz";
import Btns from "./comps/Buttons";
import X from "./comps/X";
import useTemporaryValue, {
  type TypeFull,
} from "../../../../../../../../../../hooks/useTemporaryValue";
import useTemporaryValueCozOptions from "../../../../../../../../../../hooks/useTemporaryValueCozOptions";
import { useEffect } from "react";
import { tempProcedureValueCozOptionsDefalutForAdd } from "../../../../../../../../../../defines/applyDefines";
import CalculateButton from "./CalculateButton";

export default function CalcOrographyDialog() {
  const { tempValue } = useTemporaryValue();
  const { setTempValueCozOptionsCallback } = useTemporaryValueCozOptions();

  //초기화 시, cozOptions가 있는지 확인하고 없으면 tempProcedureValueCozOptionsDefalutForAdd로 초기화
  useEffect(() => {
    if (!tempValue || !tempValue.procedureFull) {
      console.error("tempValue is not defined!!");
      return;
    }

    if (
      "cozOptions" in tempValue.procedureFull &&
      Object.keys(tempValue.procedureFull.cozOptions ?? {}).length > 0
    ) {
      setTempValueCozOptionsCallback(
        tempValue.procedureFull.cozOptions as TypeFull["cozOptions"]
      );
    } else {
      setTempValueCozOptionsCallback(tempProcedureValueCozOptionsDefalutForAdd);
    }
  }, [setTempValueCozOptionsCallback, tempValue]);

  return (
    <div className="absolute -top-6 left-4 w-auto shadow-lg rounded-md bg-[#f4f5f6] border border-gray-300 z-30">
      <GuideBox width={VELOCITY_PRESSURE_CASES_WIDTH} padding={2} spacing={2}>
        <Typography variant="h1" width={"100%"} center>
          Calculate Orography Effect Factor Co(z)
        </Typography>

        <OrographyType />

        <GuideBox
          width={"100%"}
          show
          fill="white"
          paddingTop={2}
          paddingBottom={2}
          border="1px solid #e3e3e3"
          borderRadius={2}
          spacing={1}
          padding={2}
        >
          <Location />
          <H />
          <Lu />
          <Ld />
          <X />

          <div className="w-full h-1 border-t border-gray-300" />

          <Refz />
          <LoadedLength />

          <CalculateButton />
        </GuideBox>

        <GuideBox
          width={"100%"}
          show
          fill="white"
          paddingTop={2}
          paddingBottom={2}
          border="1px solid #e3e3e3"
          borderRadius={2}
          spacing={1}
          padding={2}
        >
          <Result />
        </GuideBox>

        <Btns />
      </GuideBox>
    </div>
  );
}
