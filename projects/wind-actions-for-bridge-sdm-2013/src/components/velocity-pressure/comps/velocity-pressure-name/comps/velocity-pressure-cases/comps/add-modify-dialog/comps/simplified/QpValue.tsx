import {
  GuideBox,
  Icon,
  IconButton,
  TextFieldV2,
  Typography,
} from "@midasit-dev/moaui";
import useTemporaryValue from "../../../../../../../../../../hooks/useTemporaryValue";
import InfoWrapper from "../../../../../../../../../common/InfoWrapper";
import {
  useChangeBanner,
  DoneBanner,
} from "../../../../../../../../../../utils/loadingUtils";

//TEST Python 계산 결과 보여주는 곳
export default function QpValue() {
  const { tempValue, setTempValueCallback } = useTemporaryValue();
  const { isVisible } = useChangeBanner(tempValue?.value, 500);

  return (
    <GuideBox width="100%" center spacing={1}>
      <div className="flex items-center">
        <Typography>Peak Velocity Pressure (qp)</Typography>

        <InfoWrapper
          tooltip={
            <GuideBox width={150}>
              <Typography>test</Typography>
            </GuideBox>
          }
        >
          <IconButton transparent>
            <Icon iconName="Info" />
          </IconButton>
        </InfoWrapper>
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
        />
        <Typography>kN/m2</Typography>
        <DoneBanner isVisible={isVisible} />
      </div>
    </GuideBox>
  );
}
