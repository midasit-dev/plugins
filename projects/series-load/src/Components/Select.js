import * as React from "react";
import MoaDropList from "@midasit-dev/moaui/Components/DropList";
import MoaStack from "@midasit-dev/moaui/Components/Stack";
import MoaTypography from "@midasit-dev/moaui/Components/Typography";

export default function SelectVariants(
  title,
  preSetList,
  preListNb,
  setPreListNb,
  dropListWidth
) {
  const convertKeyValuePair = React.useCallback(
    (key) => {
      return [preSetList[key], key];
    },
    [preSetList]
  );

  const values = new Map([
    convertKeyValuePair(10),
    convertKeyValuePair(20),
    convertKeyValuePair(30),
    convertKeyValuePair(40),
    convertKeyValuePair(50),
    convertKeyValuePair(60),
  ]);

  return (
    <MoaStack
      direction="row"
      component="form"
      spacing={2}
      justifyContent="space-between"
      marginX={2}
    >
      <MoaTypography>{title}</MoaTypography>
      <MoaDropList
        itemList={values}
        value={preListNb}
        onChange={(e) => setPreListNb(e.target.value)}
        width={dropListWidth || undefined}
      />
    </MoaStack>
  );
}
