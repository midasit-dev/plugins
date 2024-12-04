import { Stack, DropList, Typography, GuideBox } from "@midasit-dev/moaui";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";

interface Props {
  pointValue: number;
  setPointValue: React.Dispatch<React.SetStateAction<number>>;
}

const PointType: React.FC<Props> = ({ pointValue, setPointValue }) => {
  const { t: translate, i18n: internationalization } = useTranslation();
  const pointType = translate("pointType");
  const items = new Map<string, number>([
    ["1", 1],
    ["2", 2],
    ["3", 3],
    ["4", 4],
    ["5", 5],
  ]);

  function onChangeHandler(event: any) {
    setPointValue(event.target.value);
  }
  return (
    <GuideBox horRight margin={2}>
      <Stack direction="row" spacing={2} content="center">
        <Typography variant="body1" size="small" center>
          {pointType}
        </Typography>
        <DropList
          itemList={items}
          value={pointValue}
          onChange={onChangeHandler}
        />
      </Stack>
    </GuideBox>
  );
};

export default PointType;
