import { Button, GuideBox } from "@midasit-dev/moaui";
import { useRecoilState, useRecoilValue } from "recoil";
import { isOpenAddModVelocityPressureSelector } from "../../../../../../../../../../defines/openDefines";
import {
  selVelocityPressureCaseLightSelector,
  TempProcedureFlagSelector,
  TempProcedureValueSelector,
  velocityPressureCasesSelector,
} from "../../../../../../../../../../defines/applyDefines";

export default function Btns() {
  const [, setIsOpen] = useRecoilState(isOpenAddModVelocityPressureSelector);

  const [tempFlag, setTempFlag] = useRecoilState(TempProcedureFlagSelector);
  const [tempValue, setTempValue] = useRecoilState(TempProcedureValueSelector);
  const selCase = useRecoilValue(selVelocityPressureCaseLightSelector);
  const [, setCases] = useRecoilState(velocityPressureCasesSelector);

  return (
    <GuideBox width={"100%"} row horRight verCenter spacing={1} paddingTop={1}>
      <Button
        color="negative"
        width={"80px"}
        onClick={() => {
          if (tempFlag === "add") {
            setCases((prev: any) => {
              return [...prev, tempValue];
            });
          }

          if (tempFlag === "modify") {
            setCases((prev: any) => {
              if (!selCase) return prev;
              const temp = [...prev];
              temp[selCase.index] = tempValue;
              return temp;
            });
          }

          setIsOpen(false);
        }}
      >
        OK
      </Button>
      <Button onClick={() => setIsOpen(false)} width="80px">
        Cancel
      </Button>
    </GuideBox>
  );
}
