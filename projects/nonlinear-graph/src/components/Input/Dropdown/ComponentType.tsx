import { Stack, DropList, Typography, GuideBox } from "@midasit-dev/moaui";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useRecoilState } from "recoil";
import { ElementState, ComponentState } from "../../../values/RecoilValue";

const BeamCoulmItems = new Map<string, number>([
  ["My", 5],
  ["Mz", 6],
  ["Fx", 1],
  ["Fy", 2],
  ["Fz", 3],
]);
const TrussItems = new Map<string, number>([["Fx", 1]]);
const GenericLinkItems = new Map<string, number>([
  ["My", 5],
  ["Mz", 6],
  ["Fx", 1],
  ["Fy", 2],
  ["Fz", 3],
  ["Mx", 4],
]);

const ComponentType = () => {
  const [ElementValue, setElementValue] = useRecoilState(ElementState);
  const [ComponentValue, setComponentValue] = useRecoilState(ComponentState);
  const [Items, setItems] = useState<Map<string, number>>(BeamCoulmItems);
  const { t: translate, i18n: internationalization } = useTranslation();
  const componentType = translate("componentType");

  useEffect(() => {
    initItems();
  }, [ElementValue]);

  const initItems = () => {
    switch (ElementValue) {
      case 1: {
        setItems(BeamCoulmItems);
        break;
      }
      case 2: {
        setItems(TrussItems);
        break;
      }
      case 3: {
        setItems(GenericLinkItems);
        break;
      }
      default:
        break;
    }
  };

  function onChangeHandler(event: any) {
    setComponentValue(event.target.value);
  }

  return (
    <GuideBox center>
      <Stack direction="row" spacing={2} content="center">
        <Typography variant="body1" size="medium" center>
          {componentType}
        </Typography>

        <DropList
          itemList={Items}
          value={ComponentValue}
          onChange={onChangeHandler}
          width={150}
        />
      </Stack>
    </GuideBox>
  );
};

export default ComponentType;
