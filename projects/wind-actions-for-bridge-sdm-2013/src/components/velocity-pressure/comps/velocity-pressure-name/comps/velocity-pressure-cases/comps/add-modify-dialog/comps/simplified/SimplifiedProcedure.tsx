import {
  Button,
  DropList,
  GuideBox,
  Icon,
  IconButton,
  TextFieldV2,
  Typography,
} from "@midasit-dev/moaui";
import { PANEL_3_R_WIDTH } from "../../../../../../../../../../defines/widthDefines";
import type { SelectChangeEvent } from "@mui/material";
import { memo } from "react";
import CategoryOption1 from "./comps/CategoryOption1";
import CategoryOption2 from "./comps/CategoryOption2";
import CategoryOption3 from "./comps/CategoryOption3";
import useTemporaryValue from "../../../../../../../../../../hooks/useTemporaryValue";

const CategoryOptions = memo(
  ({ category }: { category: number | undefined }) => (
    <GuideBox width={"100%"} spacing={1}>
      {category === 1 && <CategoryOption1 />}
      {category === 2 && <CategoryOption2 />}
      {category === 3 && <CategoryOption3 />}
    </GuideBox>
  )
);

export default function Simplified() {
  const { tempValue, setTempValueCallback, asSimplified } = useTemporaryValue();

  return (
    <GuideBox width="100%" spacing={2}>
      <GuideBox
        width={"100%"}
        show
        fill="white"
        paddingTop={2}
        paddingBottom={2}
        border="1px solid #e3e3e3"
        borderRadius={2}
        spacing={2}
        padding={2}
      >
        <div className="border-b border-b-gray-300 flex w-full justify-center pb-4 flex-col gap-4">
          <Typography variant="h1" width={"100%"} center>
            Peak wind Pressure Selection
          </Typography>
          <GuideBox width="100%" spacing={1} row horSpaceBetween verCenter>
            <Typography>Category by</Typography>
            <DropList
              width={PANEL_3_R_WIDTH}
              itemList={[
                ["Table 3.6", 1],
                ["Table 3.7", 2],
                ["Table 3.8", 3],
              ]}
              onChange={(e: SelectChangeEvent) => {
                const selIndex = Number(e.target.value);
                setTempValueCallback({
                  procedureValue: { category: selIndex as 1 | 2 | 3 },
                });
              }}
              value={asSimplified(tempValue)?.category}
              defaultValue={1}
              placeholder="Select ..."
            />
          </GuideBox>
        </div>

        <GuideBox width={"100%"} spacing={1}>
          <CategoryOptions category={asSimplified(tempValue)?.category} />
        </GuideBox>

        <GuideBox width={"100%"} center>
          <Button color="negative" width="100%">
            Calculate
          </Button>
        </GuideBox>
      </GuideBox>

      <GuideBox width="100%" center spacing={1}>
        <div className="flex items-center">
          <Typography>Peak Velocity Pressure (qp)</Typography>
          <IconButton transparent>
            <Icon iconName="Info" />
          </IconButton>
        </div>
        <div className="flex items-center gap-2">
          <TextFieldV2
            type="number"
            numberOptions={{
              min: 0,
              onlyInteger: false,
              condition: {
                min: "greater",
              },
            }}
            value={tempValue?.value.toString()}
            width={100}
            placeholder="Value ..."
            defaultValue="3.865"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setTempValueCallback({
                value: Number.parseFloat(e.target.value),
              });
            }}
          />
          <Typography>kN/m2</Typography>
        </div>
      </GuideBox>
    </GuideBox>
  );
}
