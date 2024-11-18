import { Button, GuideBox, Typography } from "@midasit-dev/moaui";
import OrographyType from "./comps/OrographyType";
import { VELOCITY_PRESSURE_CASES_WIDTH } from "../../../../../../../../../../defines/widthDefines";
import Location from "./comps/Location";
import H from "./comps/H";
import Lu from "./comps/Lu";
import Ld from "./comps/Ld";
import Refz from "./comps/Refz";
import LoadedLength from "./comps/LoadedLength";
import Result from "./comps/Result";
import Btns from "./comps/Buttons";
import X from "./comps/X";

export default function CalcOrographyDialog() {
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

          <Button width="100%" color="negative">
            Calculate
          </Button>
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
