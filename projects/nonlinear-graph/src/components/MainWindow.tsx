import Contents from "./Layout/Contents/Contents";
import { GuideBox } from "@midasit-dev/moaui";

function MainWindow() {
  return (
    <GuideBox width={"100%"} height={"100%"} padding={2}>
      <Contents />
    </GuideBox>
  );
}

export default MainWindow;
