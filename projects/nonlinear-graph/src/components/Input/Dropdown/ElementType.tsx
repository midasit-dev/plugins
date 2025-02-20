import { Stack, DropList, Typography, GuideBox } from "@midasit-dev/moaui";
import { useTranslation } from "react-i18next";
import { useRecoilState } from "recoil";
import { ElementState, ComponentState } from "../../../values/RecoilValue";

const ElementType = () => {
  const [ElementValue, setElementValue] = useRecoilState(ElementState);
  const [ComponentValue, setComponentValue] = useRecoilState(ComponentState);

  const { t: translate, i18n: internationalization } = useTranslation();
  const elementType = translate("elementType");
  const items = new Map<string, number>([
    [translate("BeamColumn"), 1],
    [translate("Truss"), 2],
    [translate("GenericLink"), 3],
  ]);

  function onChangeHandler(event: any) {
    setElementValue(event.target.value);
    if (event.target.value === 2) setComponentValue(1);
    else setComponentValue(5);
  }
  return (
    <GuideBox center>
      <Stack direction="row" spacing={2} content="center">
        <Typography variant="body1" size="medium" center>
          {elementType}
        </Typography>

        <DropList
          itemList={items}
          value={ElementValue}
          onChange={onChangeHandler}
          width={150}
        />
      </Stack>
    </GuideBox>
  );
};

export default ElementType;
