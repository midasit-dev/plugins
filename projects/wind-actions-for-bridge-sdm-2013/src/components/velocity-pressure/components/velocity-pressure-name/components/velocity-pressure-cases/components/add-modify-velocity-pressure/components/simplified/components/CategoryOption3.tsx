import {
  DropList,
  GuideBox,
  Icon,
  IconButton,
  Typography,
} from "@midasit-dev/moaui";
import { PANEL_3_R_WIDTH } from "../../../../../../../../../../../defines/widthDefines";
import type { SelectChangeEvent } from "@mui/material";
import { useRecoilState } from "recoil";
import {
  TempProcedureValueSelector,
  type VelocityPressureCaseProcedureSimplified,
} from "../../../../../../../../../../../defines/applyDefines";
import { useEffect, useState } from "react";

export default function CategoryOption3() {
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
      <GuideBox width="100%" horSpaceBetween row verCenter>
        <GuideBox row verCenter>
          <Typography>Degree of Exposure</Typography>
          <IconButton transparent>
            <Icon iconName="Info" />
          </IconButton>
        </GuideBox>
        <DropList
          width={PANEL_3_R_WIDTH}
          itemList={[
            ["1", 1],
            ["2", 2],
            ["3", 3],
            ["4", 4],
          ]}
          onChange={(e: SelectChangeEvent) => {
            const selIndex = Number(e.target.value);
            setTempValue((prev: any) => {
              return {
                ...prev,
                procedure: {
                  ...prev.procedure,
                  value: {
                    ...prev.procedure.value,
                    degree: selIndex,
                  },
                },
              };
            });
          }}
          value={tempProcedure?.degree ?? 1}
          defaultValue={1}
          placeholder="Select ..."
        />
      </GuideBox>
    </>
  );
}
