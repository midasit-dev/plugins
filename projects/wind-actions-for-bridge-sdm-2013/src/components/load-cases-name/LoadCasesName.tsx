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
  const [allNames, setAllNames] = useState<Array<[string, string]>>([]);
  const [selLoadCaseName, setSelLoadCaseName] = useRecoilState(
    selLoadCaseNameSelector
  );

  useQuery(["fetchSTLD"], fetchSTLD, {
    onSuccess: (data) => {
      const arr = data as Array<[string, string]>;
      setAllNames(arr);
      setIsEmpty(arr.length === 0);

      // 값 없으면 하나 채워주자!
      if (arr.length > 0 && selLoadCaseName === "") {
        setSelLoadCaseName(arr[0][0]);
      }
    },
    onError: (error) => {
      setAllNames([]);
      enqueueSnackbar((error as Error).message, {
        variant: "error",
      });
    },
  });

  return (
    <GuideBox width="100%" horSpaceBetween row verCenter>
      <Typography variant="h1" color={isEmpty ? "#FF5733" : "primary"}>
        {`Load Case Name`}
        {/* {`Load Case Name (${allNames.length ?? 0})`} */}
      </Typography>
      <DropList
        width={ROOT_R_WIDTH}
        itemList={allNames}
        onChange={(e: SelectChangeEvent) => {
          setSelLoadCaseName(e.target.value as string);
        }}
        value={selLoadCaseName}
        defaultValue={selLoadCaseName}
        placeholder="Select ..."
      />
    </GuideBox>
  );
}
