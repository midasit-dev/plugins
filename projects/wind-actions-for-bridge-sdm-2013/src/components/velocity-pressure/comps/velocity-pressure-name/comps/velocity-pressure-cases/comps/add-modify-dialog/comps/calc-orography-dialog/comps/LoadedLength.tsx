import {
  GuideBox,
  Icon,
  IconButton,
  TextFieldV2,
  Typography,
} from "@midasit-dev/moaui";
import { CALC_OROGRAPHY_DIALOG_R_WIDTH_M } from "../../../../../../../../../../../defines/widthDefines";
import useTemporaryValueCozOptions from "../../../../../../../../../../../hooks/useTemporaryValueCozOptions";
import InfoWrapper from "../../../../../../../../../../common/InfoWrapper";

export default function LoadedLength() {
  const { tempValueCozOptions, setTempValueCozOptionsCallback } =
    useTemporaryValueCozOptions();
  return (
    <GuideBox width="100%" horSpaceBetween verCenter row>
      <div className="w-full flex items-center">
        <Typography>Loaded Length</Typography>

        <InfoWrapper
          tooltip={
            <GuideBox width={130} center>
              <Typography variant="h1" color="gray">
                Refer to Table 3.10
              </Typography>
            </GuideBox>
          }
        >
          <IconButton transparent>
            <Icon iconName="Help" />
          </IconButton>
        </InfoWrapper>
      </div>

      <div className="flex w-auto justify-between items-center gap-2">
        <TextFieldV2
          type="number"
          placeholder="Enter value"
          width={CALC_OROGRAPHY_DIALOG_R_WIDTH_M}
          defaultValue="0.0"
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            setTempValueCozOptionsCallback({
              loadLength: Number.parseFloat(e.target.value),
            });
          }}
          value={String(tempValueCozOptions?.loadLength) ?? "0.0"}
          numberOptions={{
            min: 0.0,
            step: 1.0,
            condition: {
              min: "greater",
            },
          }}
        />
        <Typography>m</Typography>
      </div>
    </GuideBox>
  );
}
