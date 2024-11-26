import { DropList, GuideBox, Typography } from "@midasit-dev/moaui";
import { useCallback, useState } from "react";
import type { SelectChangeEvent } from "@mui/material/Select";
import XDirection from "./comps/x-direction/XDirection";
import ZDirection from "./comps/z-direction/ZDirection";

const items = [
  ["x-direction", 1],
  ["z-direction", 2],
] as [string, number][];

export default function CfDialog() {
  const [dir, setDir] = useState<number>(1);

  const handleChange = useCallback(
    (e: SelectChangeEvent) => setDir(Number(e.target.value)),
    []
  );

  return (
    <div className="absolute -top-[120px] right-0 w-auto z-20 shadow-lg rounded-md bg-[#f4f5f6] border border-gray-300">
      <GuideBox center spacing={2} padding={2}>
        <Typography variant="h1">
          Calculate Force efficient for Bridge
        </Typography>

        <div className="flex justify-between items-center w-full">
          <Typography>Loading Direction</Typography>
          <DropList
            width={150}
            itemList={items}
            onChange={handleChange}
            value={dir}
            defaultValue={dir}
          />
        </div>

        {dir === 1 && <XDirection />}
        {dir === 2 && <ZDirection />}
      </GuideBox>
    </div>
  );
}
