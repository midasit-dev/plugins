import { Button, GuideBox } from "@midasit-dev/moaui";
import { useRecoilState, useRecoilValue } from "recoil";
import { isOpenAddModVelocityPressureSelector } from "../../../../../../../../../../defines/openDefines";
import {
  selVelocityPressureCaseLightSelector,
  TempProcedureFlagSelector,
  velocityPressureCasesSelector,
} from "../../../../../../../../../../defines/applyDefines";
import useTemporaryValue from "../../../../../../../../../../hooks/useTemporaryValue";
import { useSnackbar } from "notistack";

export default function Btns() {
  const [, setIsOpen] = useRecoilState(isOpenAddModVelocityPressureSelector);

  const [tempFlag] = useRecoilState(TempProcedureFlagSelector);
  const { tempValue, setTempValueCallback } = useTemporaryValue();
  const selCase = useRecoilValue(selVelocityPressureCaseLightSelector);
  const [cases, setCases] = useRecoilState(velocityPressureCasesSelector);

  const { enqueueSnackbar } = useSnackbar();

  return (
    <GuideBox width={"100%"} row horRight verCenter spacing={1} paddingTop={1}>
      <Button
        color="negative"
        width={"80px"}
        onClick={() => {
          if (tempFlag === "add") {
            // cases의 name 중에 tempValue.name이 있는지 확인 (중복체크)
            if (cases?.some((item) => item.name === tempValue?.name)) {
              enqueueSnackbar("The name already exists.", { variant: "error" });
              return;
            }

            setCases((prev: any) => {
              if (prev) return [...prev, tempValue];
              return [tempValue];
            });
          }

          if (tempFlag === "modify") {
            // cases의 name 중에 tempValue.name이 있는지 확인 (중복체크)
            if (
              selCase?.item.name !== tempValue?.name &&
              cases?.some((item) => item.name === tempValue?.name)
            ) {
              enqueueSnackbar("The name already exists.", { variant: "error" });
              return;
            }

            setCases((prev: any) => {
              if (!selCase) return prev;
              const temp = [...prev];
              temp[selCase.index] = tempValue;
              return temp;
            });
          }

          setIsOpen(false);
          setTempValueCallback(null);
        }}
      >
        OK
      </Button>
      <Button
        onClick={() => {
          setIsOpen(false);
          setTempValueCallback(null);
        }}
        width="80px"
      >
        Cancel
      </Button>
    </GuideBox>
  );
}
