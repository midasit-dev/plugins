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
    ["kr", 3],
  ]);
  const [value, setValue] = useState(items.get(nowLang));

  function onChangeHandler(event: any) {
    setValue(event.target.value);
    items.forEach((value, key) => {
      console.log(key);
      if (
        value === event.target.value &&
        window.location.pathname !== `/${key}`
      )
        window.location.pathname = `/${key}`;
    });
  }
  return (
    <GuideBox horRight>
      <Stack direction="row" spacing={5}>
        <GuideBox center>
          <Typography variant="h1" size="large">
            {nowLang} :
          </Typography>
        </GuideBox>
        <GuideBox center>
          <DropList
            width={"10vh"}
            itemList={items}
            defaultValue="en"
            value={value}
            onChange={onChangeHandler}
          />
        </GuideBox>
      </Stack>
    </GuideBox>
  );
};

export default LanguageType;
