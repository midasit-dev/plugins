import { Button } from "@midasit-dev/moaui";
import { useRecoilState } from "recoil";
import { isOpenVelocityPressureCasesSelector } from "../../../../../../../../defines/openDefines";
import { isBlurSelector } from "../../../../../../../../defines/blurDefines";

export default function CloseBtn() {
  const [isOpen, setIsOpen] = useRecoilState(
    isOpenVelocityPressureCasesSelector
  );
  const [, setIsBlur] = useRecoilState(isBlurSelector);

  return (
    <Button
      onClick={() => {
        setIsOpen(!isOpen);
        setIsBlur(!isOpen);
      }}
      width={"80px"}
    >
      Close
    </Button>
  );
}
