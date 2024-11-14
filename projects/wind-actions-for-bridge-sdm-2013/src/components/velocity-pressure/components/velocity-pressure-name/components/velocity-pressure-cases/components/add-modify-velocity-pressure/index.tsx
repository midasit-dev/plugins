import {
  GuideBox,
  Radio,
  RadioGroup,
  TextField,
  Typography,
} from "@midasit-dev/moaui";
import { VELOCITY_PRESSURE_CASES_WIDTH } from "../../../../../../../../defines/widthDefines";
import Simplified from "./components/simplified";
import Btns from "./components/btns";
import { useRecoilState } from "recoil";
import { TempProcedureValueSelector } from "../../../../../../../../defines/applyDefines";

export default function AddModVelocityPressure() {
  const [tempValue, setTempValue] = useRecoilState(TempProcedureValueSelector);

  return (
    <div className="absolute -top-12 left-4 w-auto z-30 shadow-lg rounded-md bg-[#f4f5f6] border border-gray-300">
      <GuideBox width={VELOCITY_PRESSURE_CASES_WIDTH} padding={2} spacing={2}>
        <Typography variant="h1" width={"100%"} center>
          Add / Modify Velocity Pressure
        </Typography>

        <GuideBox width="100%" horSpaceBetween verCenter row>
          <Typography>Velocity Pressure Name</Typography>
          <TextField
            width="200px"
            value={tempValue?.name}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setTempValue((prev: any) => {
                return {
                  ...prev,
                  name: e.target.value,
                };
              });
            }}
          />
        </GuideBox>

        <GuideBox width={"100%"} spacing={0.5}>
          <Typography>Procedure</Typography>
          <RadioGroup
            onChange={(e: React.ChangeEvent, value: string) => {
              setTempValue((prev: any) => {
                return {
                  ...prev,
                  procedure: {
                    ...prev.procedure,
                    name: value,
                  },
                };
              });
            }}
            value={tempValue?.procedure?.name ?? "simplified"}
          >
            <Radio name="Simplified Procedure" value={"simplified"} />
            <Radio name="Full Procedure" value={"full"} />
          </RadioGroup>
        </GuideBox>

        <Simplified />
        <Btns />
      </GuideBox>
    </div>
  );
}
