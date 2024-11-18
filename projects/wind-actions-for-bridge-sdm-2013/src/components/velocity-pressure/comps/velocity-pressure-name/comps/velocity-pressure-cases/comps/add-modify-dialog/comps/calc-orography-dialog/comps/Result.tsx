import { GuideBox, TextFieldV2, Typography } from "@midasit-dev/moaui";
import useTemporaryValueCozOptions from "../../../../../../../../../../../hooks/useTemporaryValueCozOptions";

export default function Result() {
  const { tempValueCozOptions } = useTemporaryValueCozOptions();

  return (
    <GuideBox width={"100%"} spacing={2}>
      <Typography variant="h1" width={"100%"} center>
        Result
      </Typography>

      <div className="w-full grid grid-cols-3 gap-4">
        <div className="flex flex-col gap-2">
          <Typography width={"100%"} center>
            Sb (z)
          </Typography>
          <TextFieldV2
            defaultValue="N.A"
            value={String(tempValueCozOptions?.sbz) ?? "N.A"}
            width="100%"
            disabled
          />
        </div>

        <div className="flex flex-col gap-2">
          <Typography width={"100%"} center>
            Sc (z)
          </Typography>
          <TextFieldV2
            defaultValue="N.A"
            value={String(tempValueCozOptions?.scz) ?? "N.A"}
            width="100%"
            disabled
          />
        </div>

        <div className="flex flex-col gap-2">
          <Typography width={"100%"} center>
            Co (z)
          </Typography>
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
