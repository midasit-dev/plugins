import { GuideBox, Typography } from "@midasit-dev/moaui";
import PeakVelocity from "./comps/peak-velocity/PeakVelocity";
import useTemporaryValue from "../../../../../../../../../../hooks/useTemporaryValue";
import PeakVelocityQpz from "./comps/peak-velocity/PeakVelocityQpz";
import MeanVelocity from "./comps/mean-velocity/MeanVelocity";
import MeanVelocityQz from "./comps/mean-velocity/MeanVelocityQz";

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
          <Typography variant="h1" width={"100%"} center>
            Wind Load Parameters
          </Typography>

          <div className="flex gap-4 w-full justify-center">
            {["Peak Velocity", "Mean Velocity"].map((item, index) => {
              const curIndex = index + 1;
              return (
                <button
                  key={item}
                  type="button"
                  className="p-2"
                  style={{
                    borderBottom:
                      asFull(tempValue)?.velocity === curIndex
                        ? "1px solid #0867EC"
                        : "1px solid transparent",
                  }}
                  onClick={(e: React.MouseEvent) => {
                    setTempValueCallback({
                      procedureValue: { velocity: curIndex as 1 | 2 },
                    });
                  }}
                >
                  <Typography
                    color={
                      asFull(tempValue)?.velocity === curIndex
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

        {asFull(tempValue)?.velocity === 1 && <PeakVelocity />}
        {asFull(tempValue)?.velocity === 2 && <MeanVelocity />}
      </GuideBox>

      {asFull(tempValue)?.velocity === 1 && <PeakVelocityQpz />}
      {asFull(tempValue)?.velocity === 2 && <MeanVelocityQz />}
    </GuideBox>
  );
}
