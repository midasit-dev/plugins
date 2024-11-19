import { GuideBox, TextField, Typography } from "@midasit-dev/moaui";
import { VELOCITY_PRESSURE_CASES_WIDTH } from "../../../../../../../../defines/widthDefines";
import Simplified from "./comps/simplified/SimplifiedProcedure";
import Btns from "./comps/btns/Buttons";
import useTemporaryValue from "../../../../../../../../hooks/useTemporaryValue";
import { useEffect } from "react";
import { useRecoilState } from "recoil";
import { isOpenAddModVelocityPressureSelector } from "../../../../../../../../defines/openDefines";
import Full from "./comps/full/FullProcedure";

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

        <div className="flex gap-4 w-full justify-center">
          {["Simplified Procedure", "Full Procedure"].map((item, index) => {
            const curIndex = index + 1;
            return (
              <button
                key={item}
                type="button"
                className="p-2"
                style={{
                  borderBottom:
                    tempValue?.procedureIndex === curIndex
                      ? "1px solid #0867EC"
                      : "1px solid transparent",
                }}
                onClick={(e: React.MouseEvent) => {
                  setTempValueCallback({ procedureIndex: curIndex as 1 | 2 });
                }}
              >
                <Typography
                  color={
                    tempValue?.procedureIndex === curIndex
                      ? "#0867EC"
                      : undefined
                  }
                >
                  {item}
                </Typography>
              </button>
            );
          })}
        </div>

        {tempValue?.procedureIndex === 1 && <Simplified />}
        {tempValue?.procedureIndex === 2 && <Full />}

        <Btns />
      </GuideBox>
    </div>
  );
}
