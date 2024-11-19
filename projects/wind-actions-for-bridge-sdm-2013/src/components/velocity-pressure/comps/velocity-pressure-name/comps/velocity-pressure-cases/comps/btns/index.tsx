import { GuideBox } from "@midasit-dev/moaui";
import AddBtn from "./AddBtn";
import ModBtn from "./ModBtn";
import DelBtn from "./DelBtn";
import CloseBtn from "./CloseBtn";

export default function Btns() {
  return (
    <GuideBox width="100%" row horSpaceBetween verCenter>
      <GuideBox row spacing={1}>
        <AddBtn />
        <ModBtn />
        <DelBtn />
      </GuideBox>
      <GuideBox>
        <CloseBtn />
      </GuideBox>
    </GuideBox>
  );
}
