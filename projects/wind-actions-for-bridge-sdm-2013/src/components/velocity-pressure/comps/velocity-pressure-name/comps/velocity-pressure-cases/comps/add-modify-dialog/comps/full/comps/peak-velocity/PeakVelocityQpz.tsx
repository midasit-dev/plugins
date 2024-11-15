import {
  GuideBox,
  Icon,
  IconButton,
  TextFieldV2,
  Typography,
} from "@midasit-dev/moaui";
import useTemporaryValue from "../../../../../../../../../../../../hooks/useTemporaryValue";

export default function PeakVelocityQpz() {
  const { tempValue, setTempValueCallback } = useTemporaryValue();

  return (
    <GuideBox width="100%" center spacing={1}>
      <div className="flex items-center">
        <Typography center width={"100%"}>
          Peak Velocity Pressure at Referenace Height,qp(z)
        </Typography>
        <IconButton transparent>
          <Icon iconName="Info" />
        </IconButton>
      </div>
      <div className="flex items-center gap-2">
        <TextFieldV2
          type="number"
          numberOptions={{
            min: 0,
            onlyInteger: false,
            condition: {
              min: "greater",
            },
          }}
          value={tempValue?.value.toString()}
          width={100}
          placeholder="Value ..."
          defaultValue="3.865"
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            setTempValueCallback({
              value: Number.parseFloat(e.target.value),
            });
          }}
          disabled={true}
        />
        <Typography>kN/m2</Typography>
      </div>
    </GuideBox>
  );
}
