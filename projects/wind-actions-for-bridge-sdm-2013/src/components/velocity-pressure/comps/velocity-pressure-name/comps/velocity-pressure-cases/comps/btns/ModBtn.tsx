import { Button } from "@midasit-dev/moaui";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { isOpenAddModVelocityPressureSelector } from "../../../../../../../../defines/openDefines";
import {
  selVelocityPressureCaseSelector,
  TempProcedureFlagSelector,
} from "../../../../../../../../defines/applyDefines";
import useTemporaryValue from "../../../../../../../../hooks/useTemporaryValue";

export default function ModBtn() {
  const setFlag = useSetRecoilState(TempProcedureFlagSelector);
  const [, setIsOpen] = useRecoilState(isOpenAddModVelocityPressureSelector);
  const selCase = useRecoilValue(selVelocityPressureCaseSelector);
  const { setTempValueCallback } = useTemporaryValue();

  return (
    <Button
      onClick={() => {
        setFlag("modify");
        setIsOpen(true);

        if (!selCase) {
          console.error("selCase is null ...");
          return;
        }

        setTempValueCallback({ ...selCase });
      }}
      width={"80px"}
      disabled={!selCase}
    >
      Modify
    </Button>
  );
}
