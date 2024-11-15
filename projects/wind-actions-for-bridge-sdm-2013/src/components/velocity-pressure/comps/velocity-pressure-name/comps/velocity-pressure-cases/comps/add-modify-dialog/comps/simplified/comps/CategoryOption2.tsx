import { GuideBox, Radio, RadioGroup, Typography } from "@midasit-dev/moaui";
import useTemporaryValue, {
  type TypeSimplified,
} from "../../../../../../../../../../../hooks/useTemporaryValue";

export default function CategoryOption2() {
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
          defaultValue={1}
        >
          <Radio name="Sheltered Location" value={1} />
          <Radio name="Exposed Location" value={2} />
        </RadioGroup>
      </GuideBox>
    </>
  );
}
