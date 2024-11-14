import {
  GuideBox,
  Radio,
  RadioGroup,
  TextFieldV2,
  Typography,
} from "@midasit-dev/moaui";
import { PANEL_3_R_WIDTH } from "../../../../../../../../../../../defines/widthDefines";
import { useRecoilState } from "recoil";
import {
  TempProcedureValueSelector,
  type VelocityPressureCaseProcedureSimplified,
} from "../../../../../../../../../../../defines/applyDefines";

export default function CategoryOption1() {
  const [tempValue, setTempValue] = useRecoilState(TempProcedureValueSelector);

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
          value={
            (
              tempValue?.procedure
                ?.value as VelocityPressureCaseProcedureSimplified
            ).location ?? 1
          }
        >
          <Radio name="Waglan Island" value={1} />
          <Radio name="Hong Kong Observation" value={2} />
        </RadioGroup>
      </GuideBox>

      <GuideBox width="100%" horSpaceBetween row verCenter>
        <Typography>Return Period (Year)</Typography>
        <TextFieldV2
          width={PANEL_3_R_WIDTH}
          placeholder="Enter the period ..."
          type="number"
          numberOptions={{
            min: 50,
            max: 200,
            step: 1,
            onlyInteger: true,
          }}
          defaultValue="120"
        />
      </GuideBox>
    </>
  );
}
