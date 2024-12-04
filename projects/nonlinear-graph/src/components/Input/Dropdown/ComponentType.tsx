import { Stack, DropList, Typography, GuideBox } from "@midasit-dev/moaui";
import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";

interface Props {
  ElementValue: number;
  ComponentValue: number;
  setComponentValue: React.Dispatch<React.SetStateAction<number>>;
}

const ComponentType: React.FC<Props> = ({
  ElementValue,
  ComponentValue,
  setComponentValue,
}) => {
  const { t: translate, i18n: internationalization } = useTranslation();
  const componentType = translate("componentType");
  let Items = new Map<string, number>();
  const BeamCoulmItems = new Map<string, number>([
    ["Fx", 1],
    ["Fy", 2],
    ["Fz", 3],
    ["My", 5],
    ["Mz", 6],
  ]);
  const TrussItems = new Map<string, number>([["Fx", 1]]);
  const GenericLinkItems = new Map<string, number>([
    ["Fx", 1],
    ["Fy", 2],
    ["Fz", 3],
    ["Mx", 4],
    ["My", 5],
    ["Mz", 6],
  ]);

  useEffect(() => {
    initItems();
  }, [ElementValue, ComponentValue]);

  const initItems = () => {
    switch (ElementValue) {
      case 1: {
        BeamCoulmItems.forEach((value, key) => Items.set(key, value));
        break;
      }
      case 2: {
        TrussItems.forEach((value, key) => Items.set(key, value));
        break;
      }
      case 3: {
        GenericLinkItems.forEach((value, key) => Items.set(key, value));
        break;
      }
      default:
        break;
    }
  };

  function onChangeHandler(event: any) {
    setComponentValue(event.target.value);
  }

  initItems();
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
