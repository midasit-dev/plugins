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
import useTemporaryValue from "../../../../../../../../hooks/useTemporaryValue";
import { useEffect } from "react";
import { useRecoilState } from "recoil";
import { isOpenAddModVelocityPressureSelector } from "../../../../../../../../defines/openDefines";

export default function AddModVelocityPressure() {
  const { tempValue, setTempValueCallback } = useTemporaryValue();
  const [, setIsOpen] = useRecoilState(isOpenAddModVelocityPressureSelector);

  //이 컴포넌트에서 ESC를 누르면 setIsOpen(false)를 실행한다
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [setIsOpen]);

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
              setTempValueCallback({ name: e.target.value });
            }}
          />
        </GuideBox>

        <GuideBox width={"100%"} spacing={0.5}>
          <Typography>Procedure</Typography>
          <RadioGroup
            onChange={(e: React.ChangeEvent, value: string) => {
              setTempValueCallback({ procedureIndex: Number(value) as 1 | 2 });
            }}
            value={tempValue?.procedureIndex ?? 1}
          >
            <Radio name="Simplified Procedure" value={1} />
            <Radio name="Full Procedure" value={2} />
          </RadioGroup>
        </GuideBox>

        <Simplified />
        <Btns />
      </GuideBox>
    </div>
  );
}
