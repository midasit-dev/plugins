import {
  Stack,
  DropList,
  Typography,
  GuideBox,
  Grid,
} from "@midasit-dev/moaui";
import { useState } from "react";

const LanguageType = () => {
  const nowLang = window.location.pathname.split("/")[1];
  const items = new Map<string, number>([
    ["en", 1],
    ["jp", 2],
  ]);
  const [value, setValue] = useState(items.get(nowLang));

  function onChangeHandler(event: any) {
    setValue(event.target.value);
    items.forEach((value, key) => {
      if (
        value === event.target.value &&
        window.location.pathname !== `/${key}`
      )
        window.location.pathname = `/${key}`;
    });
  }
  return (
    <GuideBox horRight margin={2}>
      <DropList
        itemList={items}
        defaultValue="en"
        value={value}
        onChange={onChangeHandler}
      />
    </GuideBox>
  );
};

export default LanguageType;
