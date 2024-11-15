import { Button, GuideBox } from "@midasit-dev/moaui";
import { useRecoilState, useRecoilValue } from "recoil";
import { isOpenAddModVelocityPressureSelector } from "../../../../../../../../../../defines/openDefines";
import {
  selVelocityPressureCaseLightSelector,
  TempProcedureFlagSelector,
  velocityPressureCasesSelector,
} from "../../../../../../../../../../defines/applyDefines";
import useTemporaryValue from "../../../../../../../../../../hooks/useTemporaryValue";

export default function Btns() {
  const [, setIsOpen] = useRecoilState(isOpenAddModVelocityPressureSelector);

  const [tempFlag, setTempFlag] = useRecoilState(TempProcedureFlagSelector);
  const { tempValue } = useTemporaryValue();
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
            console.log(tempValue);

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
