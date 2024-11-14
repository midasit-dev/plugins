import { Button } from "@midasit-dev/moaui";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { isOpenAddModVelocityPressureSelector } from "../../../../../../../../defines/openDefines";
import {
  TempProcedureFlagSelector,
  tempProcedureValueDefault,
  TempProcedureValueSelector,
  velocityPressureCasesSelector,
} from "../../../../../../../../defines/applyDefines";

export default function AddBtn() {
  const setFlag = useSetRecoilState(TempProcedureFlagSelector);
  const [, setIsOpen] = useRecoilState(isOpenAddModVelocityPressureSelector);
  const [, setTempValue] = useRecoilState(TempProcedureValueSelector);
  const cases = useRecoilValue(velocityPressureCasesSelector);

  return (
    <Button
      color="negative"
      onClick={() => {
        setFlag("add");
        setIsOpen(true);

        setTempValue({
          ...tempProcedureValueDefault,
          name: `new name - ${(cases?.length ?? 1) + 1}`,
        });
      }}
      width={"80px"}
    >
      Add
    </Button>
  );
}
