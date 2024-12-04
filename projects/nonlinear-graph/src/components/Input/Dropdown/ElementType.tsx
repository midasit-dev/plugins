import { Stack, DropList, Typography, GuideBox } from "@midasit-dev/moaui";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";

interface Props {
  ElementValue: number;
  setElementValue: React.Dispatch<React.SetStateAction<number>>;
}

const ElementType: React.FC<Props> = ({ ElementValue, setElementValue }) => {
  const { t: translate, i18n: internationalization } = useTranslation();
  const elementType = translate("elementType");
  const items = new Map<string, number>([
    [translate("BeamColumn"), 1],
    [translate("Truss"), 2],
    [translate("GenericLink"), 3],
  ]);

  function onChangeHandler(event: any) {
    setElementValue(event.target.value);
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
