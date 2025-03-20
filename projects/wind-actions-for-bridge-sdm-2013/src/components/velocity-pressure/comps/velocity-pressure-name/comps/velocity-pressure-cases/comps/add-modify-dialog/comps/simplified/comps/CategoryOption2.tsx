import {
  GuideBox,
  Radio,
  RadioGroup,
  Typography,
  Check,
} from "@midasit-dev/moaui";
import useTemporaryValue, {
  type TypeSimplified,
} from "../../../../../../../../../../../hooks/useTemporaryValue";
import { SimplifiedLocationEnum } from "../../../../../../../../../../../defines/applyDefines";
import { useEffect } from "react";

export default function CategoryOption2() {
  const { tempValue, setTempValueCallback, asSimplified } = useTemporaryValue();

  useEffect(() => {
    if (
      ![
        SimplifiedLocationEnum.SHELTERED_LOCATION,
        SimplifiedLocationEnum.EXPOSED_LOCATION,
      ].includes(asSimplified(tempValue)?.location as SimplifiedLocationEnum)
    ) {
      setTempValueCallback({
        procedureSimplified: {
          location: SimplifiedLocationEnum.SHELTERED_LOCATION,
        } as TypeSimplified,
      });
    }
  }, [asSimplified, setTempValueCallback, tempValue]);

  return (
    <>
      <GuideBox width="100%" spacing={0.5}>
        <Typography>Location</Typography>
        <RadioGroup
          onChange={(e: React.ChangeEvent, value: string) => {
            console.log(value);
            setTempValueCallback({
              procedureSimplified: {
                location: value as TypeSimplified["location"],
              } as TypeSimplified,
            });
          }}
          value={
            (asSimplified(tempValue)?.location as SimplifiedLocationEnum) ??
            SimplifiedLocationEnum.SHELTERED_LOCATION
          }
          defaultValue={SimplifiedLocationEnum.SHELTERED_LOCATION}
        >
          <Radio
            name={SimplifiedLocationEnum.SHELTERED_LOCATION}
            value={SimplifiedLocationEnum.SHELTERED_LOCATION}
          />
          <Radio
            name={SimplifiedLocationEnum.EXPOSED_LOCATION}
            value={SimplifiedLocationEnum.EXPOSED_LOCATION}
          />
        </RadioGroup>
      </GuideBox>
    </>
  );
}
