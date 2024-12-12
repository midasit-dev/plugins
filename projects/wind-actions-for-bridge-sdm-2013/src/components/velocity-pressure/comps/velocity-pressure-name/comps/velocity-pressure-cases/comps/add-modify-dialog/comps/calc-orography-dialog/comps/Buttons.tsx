import { Button, GuideBox } from "@midasit-dev/moaui";
import { useRecoilState } from "recoil";
import { isOpenCalcOrographyDialogSelector } from "../../../../../../../../../../../defines/openDefines";
import useTemporaryValue from "../../../../../../../../../../../hooks/useTemporaryValue";
import useTemporaryValueCozOptions from "../../../../../../../../../../../hooks/useTemporaryValueCozOptions";

export default function Btns() {
  const [, setIsOpen] = useRecoilState(isOpenCalcOrographyDialogSelector);
  const { setTempValueCallback } = useTemporaryValue();
  const { tempValueCozOptions } = useTemporaryValueCozOptions();

  return (
    <GuideBox width={"100%"} row horRight verCenter spacing={1} paddingTop={1}>
      <Button
        color="negative"
        width={"80px"}
        onClick={() => {
          setIsOpen(false);

          const tempOptions = tempValueCozOptions;
          if (tempOptions) {
            setTempValueCallback({
              procedureFull: {
                cozOptions: tempOptions,
                cozValue: tempOptions.coz,
              },
            });
          }
        }}
      >
        OK
      </Button>
      <Button onClick={() => setIsOpen(false)} width="80px">
        Cancel
      </Button>
    </GuideBox>
  );
}
