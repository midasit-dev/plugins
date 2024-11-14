import { GuideBox, Radio, RadioGroup, Typography } from "@midasit-dev/moaui";
import { useRecoilState } from "recoil";
import {
  TempProcedureValueSelector,
  type VelocityPressureCaseProcedureSimplified,
} from "../../../../../../../../../../../defines/applyDefines";
import { useEffect, useState } from "react";

export default function CategoryOption2() {
  const [tempValue, setTempValue] = useRecoilState(TempProcedureValueSelector);
  const [tempProcedure, setTempProcedure] =
    useState<VelocityPressureCaseProcedureSimplified>();

  useEffect(() => {
    setTempProcedure(
      tempValue?.procedure?.value as VelocityPressureCaseProcedureSimplified
    );
  }, [tempValue]);

  return (
    <>
      <GuideBox width="100%" spacing={0.5}>
        <Typography>Location</Typography>
        <RadioGroup
          onChange={(e: React.ChangeEvent, value: string) => {
            setTempValue((prev: any) => {
              return {
                ...prev,
                procedure: {
                  ...prev.procedure,
                  value: {
                    ...prev.procedure.value,
                    location: value,
                  },
                },
              };
            });
          }}
          value={tempProcedure?.location ?? 1}
          defaultValue={1}
        >
          <Radio name="Sheltered Location" value={1} />
          <Radio name="Exposed Location" value={2} />
        </RadioGroup>
      </GuideBox>
    </>
  );
}
