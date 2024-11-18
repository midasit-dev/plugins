import { Button, GuideBox, Typography } from "@midasit-dev/moaui";
import PeakVelocity from "./comps/peak-velocity/PeakVelocity";
import useTemporaryValue from "../../../../../../../../../../hooks/useTemporaryValue";
import PeakVelocityQpz from "./comps/peak-velocity/PeakVelocityQpz";
import MeanVelocity from "./comps/mean-velocity/MeanVelocity";
import MeanVelocityQz from "./comps/mean-velocity/MeanVelocityQz";
import { FullVelocityEnum } from "../../../../../../../../../../defines/applyDefines";

export default function Full() {
  const { tempValue, setTempValueCallback, asFull } = useTemporaryValue();

  return (
    <GuideBox width="100%" spacing={2}>
      <GuideBox
        width={"100%"}
        show
        fill="white"
        paddingTop={2}
        paddingBottom={2}
        border="1px solid #e3e3e3"
        borderRadius={2}
        spacing={2}
        padding={2}
      >
        <div className="flex w-full justify-center flex-col gap-4">
          {/* <Typography variant="h1" width={"100%"} center>
            Wind Load Parameters
          </Typography> */}

          <div className="flex gap-4 w-full justify-center">
            {["Peak Velocity", "Mean Velocity"].map((item, index) => {
              return (
                <button
                  key={item}
                  type="button"
                  className="p-2"
                  style={{
                    borderBottom:
                      asFull(tempValue)?.velocity === item
                        ? "1px solid #0867EC"
                        : "1px solid transparent",
                  }}
                  onClick={(e: React.MouseEvent) => {
                    setTempValueCallback({
                      procedureFull: { velocity: item as FullVelocityEnum },
                    });
                  }}
                >
                  <Typography
                    color={
                      asFull(tempValue)?.velocity === item
                        ? "#0867EC"
                        : undefined
                    }
                  >
                    {item}
                  </Typography>
                </button>
              );
            })}
          </div>
        </div>

        {asFull(tempValue)?.velocity === FullVelocityEnum.PEAK_VELOCITY && (
          <PeakVelocity />
        )}
        {asFull(tempValue)?.velocity === FullVelocityEnum.MEAN_VELOCITY && (
          <MeanVelocity />
        )}

        <Button color="negative" width="100%">
          Calculate
        </Button>
      </GuideBox>

      {asFull(tempValue)?.velocity === FullVelocityEnum.PEAK_VELOCITY && (
        <PeakVelocityQpz />
      )}
      {asFull(tempValue)?.velocity === FullVelocityEnum.MEAN_VELOCITY && (
        <MeanVelocityQz />
      )}
    </GuideBox>
  );
}
