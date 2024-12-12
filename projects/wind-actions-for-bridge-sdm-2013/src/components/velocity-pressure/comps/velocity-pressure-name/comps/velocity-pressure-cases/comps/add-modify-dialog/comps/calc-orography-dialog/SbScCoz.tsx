import { GuideBox, TextFieldV2, Typography } from "@midasit-dev/moaui";
import useTemporaryValueCozOptions from "../../../../../../../../../../hooks/useTemporaryValueCozOptions";
import {
  DoneBanner,
  useChangeBanner,
} from "../../../../../../../../../../utils/loadingUtils";

//TEST Python 계산 결과 보여주는 곳
export default function Result() {
  const { tempValueCozOptions } = useTemporaryValueCozOptions();
  const { isVisible: isVisibleSbz } = useChangeBanner(
    tempValueCozOptions?.sbz,
    500
  );
  const { isVisible: isVisibleScz } = useChangeBanner(
    tempValueCozOptions?.scz,
    500
  );
  const { isVisible: isVisibleCoz } = useChangeBanner(
    tempValueCozOptions?.coz,
    500
  );

  return (
    <GuideBox width={"100%"} spacing={2}>
      <Typography variant="h1" width={"100%"} center>
        Result
      </Typography>

      <div className="w-full grid grid-cols-3 gap-4">
        <div className="flex flex-col gap-2">
          <div className="flex gap-2 w-full justify-center items-center">
            <Typography>Sb (z)</Typography>
            <DoneBanner isVisible={isVisibleSbz} />
          </div>
          <TextFieldV2
            defaultValue="N.A"
            value={String(tempValueCozOptions?.sbz) ?? "N.A"}
            width="100%"
            disabled
          />
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex gap-2 w-full justify-center items-center">
            <Typography>Sc (z)</Typography>
            <DoneBanner isVisible={isVisibleScz} />
          </div>
          <TextFieldV2
            defaultValue="N.A"
            value={String(tempValueCozOptions?.scz) ?? "N.A"}
            width="100%"
            disabled
          />
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex gap-2 w-full justify-center items-center">
            <Typography>Co (z)</Typography>
            <DoneBanner isVisible={isVisibleCoz} />
          </div>
          <TextFieldV2
            defaultValue="0.0"
            value={String(tempValueCozOptions?.coz) ?? "0.0"}
            width="100%"
            disabled
          />
        </div>
      </div>
    </GuideBox>
  );
}
