import { Button } from "@midasit-dev/moaui";
import { useRecoilState, useRecoilValue } from "recoil";
import {
  selVelocityPressureCaseLightSelector,
  selVelocityPressureCaseSelector,
  velocityPressureCasesSelector,
} from "../../../../../../../../defines/applyDefines";

export default function DelBtn() {
  const sel = useRecoilValue(selVelocityPressureCaseLightSelector);
  const selCase = useRecoilValue(selVelocityPressureCaseSelector);
  const [cases, setCases] = useRecoilState(velocityPressureCasesSelector);

  return (
    <Button
      width={"80px"}
      onClick={() => {
        if (!cases) {
          console.error("cases is null ...");
          return;
        }

        if (!sel || sel.index === -1) {
          console.error("sel is null ...");
          return;
        }

        const newCases = [...cases];
        newCases.splice(sel.index, 1);
        setCases(newCases);
      }}
      disabled={!selCase}
    >
      Delete
    </Button>
  );
}
