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
import { SimplifiedLocationEnum } from "../../../../../../../../../../../defines/applyDefines";
import { useEffect } from "react";

export default function CategoryOption1() {
  const { tempValue, setTempValueCallback, asSimplified } = useTemporaryValue();

  useEffect(() => {
    if (
      ![
        SimplifiedLocationEnum.WAGLAN_ISLAND,
        SimplifiedLocationEnum.HONG_KONG_OBSERVATION,
      ].includes(asSimplified(tempValue)?.location as SimplifiedLocationEnum)
    ) {
      setTempValueCallback({
        procedureSimplified: {
          location: SimplifiedLocationEnum.WAGLAN_ISLAND,
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
            setTempValueCallback({
              procedureSimplified: {
                location: value as SimplifiedLocationEnum,
              } as TypeSimplified,
            });
          }}
          value={
            asSimplified(tempValue)?.location ??
            SimplifiedLocationEnum.WAGLAN_ISLAND
          }
          defaultValue={SimplifiedLocationEnum.WAGLAN_ISLAND}
        >
          <Radio
            name={SimplifiedLocationEnum.WAGLAN_ISLAND}
            value={SimplifiedLocationEnum.WAGLAN_ISLAND}
          />
          <Radio
            name={SimplifiedLocationEnum.HONG_KONG_OBSERVATION}
            value={SimplifiedLocationEnum.HONG_KONG_OBSERVATION}
          />
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
              procedureSimplified: {
                period: Number(e.target.value),
              } as TypeSimplified,
            });
          }}
        />
      </GuideBox>
    </>
  );
}
