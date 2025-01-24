import { GuideBox, Panel } from "@midasit-dev/moaui";
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

export default Footer;
