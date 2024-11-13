import { GuideBox, DropList, Typography } from "@midasit-dev/moaui";
import type { SelectChangeEvent } from "@mui/material";
import { useRecoilState } from "recoil";
import { selLoadCaseNameSelector } from "../../defines/applyDefines";
import { useEffect, useState } from "react";
import { ROOT_R_WIDTH } from "../../defines/widthDefines";

export default function LoadCasesName() {
  const [allNames, setAllNames] = useState<Array<[string, number]>>([]);

  useEffect(() => {
    //TODO-PY 파이썬 코드를 통해 STLD를 가져온다!
    setAllNames([
      ["STLD-1", 1],
      ["STLD-2", 2],
    ]);
  }, []);

  const [selLoadCaseName, setSelLoadCaseName] = useRecoilState(
    selLoadCaseNameSelector
  );

  return (
    <GuideBox width="100%" horSpaceBetween row verCenter>
      <Typography variant="h1">Load Case Name</Typography>
      <DropList
        width={ROOT_R_WIDTH}
        itemList={allNames}
        onChange={(e: SelectChangeEvent) => {
          const selIndex = Number(e.target.value);
          setSelLoadCaseName(toLoadCasePack(allNames, selIndex));
        }}
        value={selLoadCaseName[1]}
        defaultValue={1}
        placeholder="Select ..."
      />
    </GuideBox>
  );
}

function toLoadCasePack(
  allNames: Array<[string, number]>,
  index: number
): [string, number] {
  if (!allNames) return ["", 1];

  const found = allNames.find((elem) => elem[1] === index);
  return found ? found : ["", 1];
}
