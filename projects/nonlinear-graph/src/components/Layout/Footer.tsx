import { GuideBox, Grid, Panel } from "@midasit-dev/moaui";
import ChangeBtnPy from "../Input/Button/ChangeBtnPy";

const Footer = () => {
  return (
    <GuideBox row width={"100%"} margin={1}>
      <Panel height="fit-content" variant="shadow" width="100%">
        <ChangeBtnPy />
      </Panel>
    </GuideBox>
  );
};

const FooterStyle: any = {
  display: "flex" /* Flexbox 레이아웃 설정 */,
  justifyContent: "space-around" /* 요소들 사이의 간격을 균등하게 조절 */,
  alignItems: "center" /* 요소들을 세로 중앙에 배치 */,
  margin: "10px",
  height: "1vh",
};

export default Footer;
