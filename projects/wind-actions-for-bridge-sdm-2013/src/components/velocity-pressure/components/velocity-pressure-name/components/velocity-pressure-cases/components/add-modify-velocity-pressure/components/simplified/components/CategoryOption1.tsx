import {
  GuideBox,
  Radio,
  RadioGroup,
  TextFieldV2,
  Typography,
} from "@midasit-dev/moaui";
import { PANEL_3_R_WIDTH } from "../../../../../../../../../../../defines/widthDefines";
import useTemporaryValue, {
  type TypeSimplified,
} from "../../../../../../../../../../../hooks/useTemporaryValue";

export default function CategoryOption1() {
  const { tempValue, setTempValueCallback, asSimplified } = useTemporaryValue();

  return (
    <>
      <GuideBox width="100%" spacing={0.5}>
        <Typography>Location</Typography>
        <RadioGroup
          onChange={(e: React.ChangeEvent, value: string) => {
            setTempValueCallback({
              procedureValue: {
                location: Number(value) as 1 | 2,
              } as TypeSimplified,
            });
          }}
          value={asSimplified(tempValue)?.location ?? 1}
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
          value={asSimplified(tempValue)?.period?.toString() ?? "120"}
          defaultValue="120"
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            setTempValueCallback({
              procedureValue: {
                period: Number(e.target.value),
              } as TypeSimplified,
            });
          }}
        />
      </GuideBox>
    </>
  );
}
