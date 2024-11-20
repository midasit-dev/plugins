import {
  GuideBox,
  Icon,
  IconButton,
  TextFieldV2,
  Typography,
} from "@midasit-dev/moaui";
import useTemporaryValue from "../../../../../../../../../../../../hooks/useTemporaryValue";
import InfoWrapper from "../../../../../../../../../../../common/InfoWrapper";
import {
  DoneBanner,
  useChangeBanner,
} from "../../../../../../../../../../../../utils/loadingUtils";
import { InlineMath } from "react-katex";
import "katex/dist/katex.min.css";

//TEST Python 계산 결과 보여주는 곳
export default function PeakVelocityQpz() {
  const { tempValue, setTempValueCallback } = useTemporaryValue();
  const { isVisible } = useChangeBanner(tempValue?.value, 500);

  return (
    <GuideBox width="100%" center spacing={1}>
      <div className="flex items-center">
        <Typography center width={"100%"}>
          {/* Peak Velocity Pressure at Referenace Height,qp(z) */}
          <InlineMath>
            {"\\text{Peak Velecity Pressure,} \\; q_p(z)"}
          </InlineMath>
        </Typography>

        <InfoWrapper
          tooltipProps={{
            left: -250,
            bottom: 30,
          }}
          tooltip={
            <GuideBox width={300}>
              <Typography variant="h1" color="gray">
                Peak Veocity Pressure
              </Typography>
              <img
                src="./assets/Peak Velocity Pressure.png"
                alt="Peak Velocity Pressure"
              />
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
          disabled={true}
        />
        <Typography>
          <InlineMath>kN/m^2</InlineMath>
        </Typography>
        <DoneBanner isVisible={isVisible} />
      </div>
    </GuideBox>
  );
}
