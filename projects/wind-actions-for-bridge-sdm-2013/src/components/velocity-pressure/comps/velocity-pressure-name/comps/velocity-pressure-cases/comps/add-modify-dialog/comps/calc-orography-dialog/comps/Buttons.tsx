import { Button, GuideBox } from "@midasit-dev/moaui";
import { useRecoilState } from "recoil";
import { isOpenCalcOrographyDialogSelector } from "../../../../../../../../../../../defines/openDefines";

export default function Btns() {
  const [, setIsOpen] = useRecoilState(isOpenCalcOrographyDialogSelector);

  return (
    <GuideBox width={"100%"} row horRight verCenter spacing={1} paddingTop={1}>
      <Button
        color="negative"
        width={"80px"}
        onClick={() => {
          setIsOpen(false);
          console.log("test");
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
