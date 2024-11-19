import { GuideBox, DropList, Typography } from "@midasit-dev/moaui";
import type { SelectChangeEvent } from "@mui/material";
import { useRecoilState } from "recoil";
import { selLoadCaseNameSelector } from "../../defines/applyDefines";
import { useState } from "react";
import { ROOT_R_WIDTH } from "../../defines/widthDefines";
import { fetchSTLD } from "../../utils/fetchUtils";
import { useQuery } from "react-query";
import { enqueueSnackbar } from "notistack";

export default function LoadCasesName() {
  const [isEmpty, setIsEmpty] = useState(false);
  const [allNames, setAllNames] = useState<Array<[string, number]>>([]);

  useQuery(["fetchSTLD"], fetchSTLD, {
    onSuccess: (data) => {
      const arr = data as Array<[string, number]>;
      setAllNames(arr);
      setIsEmpty(arr.length === 0);
    },
    onError: (error) => {
      setAllNames([]);
      enqueueSnackbar((error as Error).message, {
        variant: "error",
      });
    },
  });

  const [selLoadCaseName, setSelLoadCaseName] = useRecoilState(
    selLoadCaseNameSelector
  );

  return (
    <GuideBox width="100%" horSpaceBetween row verCenter>
      <Typography variant="h1" color={isEmpty ? "#FF5733" : "primary"}>
        {`Load Case Name (${allNames.length ?? 0})`}
      </Typography>
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
