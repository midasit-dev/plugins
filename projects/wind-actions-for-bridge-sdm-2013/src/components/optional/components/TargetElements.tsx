import { GuideBox, TextField, Typography } from "@midasit-dev/moaui";
import { PANEL_1_R_WIDTH } from "../../../defines/widthDefines";
import { useRecoilState } from "recoil";
import { mainTargetElementsSelector } from "../../../defines/applyDefines";
import { useQuery } from "react-query";
import { fetchSelect } from "../../../utils/fetchUtils";
import { useState } from "react";
import { enqueueSnackbar } from "notistack";

export default function TargetElements() {
  const [isEmpty, setIsEmpty] = useState(false);
  const [value, setValue] = useRecoilState(mainTargetElementsSelector);

  useQuery(["fetchSelect"], fetchSelect, {
    onSuccess: (data) => {
      const { elems } = data;
      setIsEmpty(elems.length === 0);
      setValue(elems);
    },
    onError: (error) => {
      setValue([]);
      enqueueSnackbar((error as Error).message, {
        variant: "error",
      });
    },
  });

  return (
    <GuideBox width={"100%"} horSpaceBetween row verCenter>
      <Typography variant="h1" color={isEmpty ? "#FF5733" : "primary"}>
        {`Select Target Elements (${value?.length ?? 0})`}
      </Typography>
      <TextField
        width={PANEL_1_R_WIDTH}
        placeholder="Select the elements ..."
        value={value?.join(", ") ?? ""}
      />
    </GuideBox>
  );
}
