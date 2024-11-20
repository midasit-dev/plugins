import {
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
import useTemporaryValue, {
  type TypeSimplified,
} from "../../../../../../../../../../hooks/useTemporaryValue";
import { SimplifiedCategoryEnum } from "../../../../../../../../../../defines/applyDefines";
import CalculateButton from "./CalculateButton";
import QpValue from "./QpValue";
import InfoWrapper from "../../../../../../../../../common/InfoWrapper";

const CategoryOptions = memo(
  ({ category }: { category: TypeSimplified["category"] | undefined }) => (
    <GuideBox width={"100%"} spacing={1}>
      {category === SimplifiedCategoryEnum.TABLE_3_6 && <CategoryOption1 />}
      {category === SimplifiedCategoryEnum.TABLE_3_7 && <CategoryOption2 />}
      {category === SimplifiedCategoryEnum.TABLE_3_8 && <CategoryOption3 />}
    </GuideBox>
  )
);

const items: [string, string][] = [
  [SimplifiedCategoryEnum.TABLE_3_6, SimplifiedCategoryEnum.TABLE_3_6],
  [SimplifiedCategoryEnum.TABLE_3_7, SimplifiedCategoryEnum.TABLE_3_7],
  [SimplifiedCategoryEnum.TABLE_3_8, SimplifiedCategoryEnum.TABLE_3_8],
];

export default function Simplified() {
  const { tempValue, setTempValueCallback, asSimplified } = useTemporaryValue();
  const currentTable = asSimplified(tempValue)?.category;

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
            <InfoWrapper
              tooltipProps={{
                left: -120,
                bottom: 30,
              }}
              tooltip={
                <GuideBox width={300} spacing={1}>
                  {currentTable === "Table 3.6" && (
                    <img
                      src="./assets/Table_3.6_rev.png"
                      alt="Refer to Table 3.6"
                    />
                  )}
                  {currentTable === "Table 3.7" && (
                    <img
                      src="./assets/Table_3.7.png"
                      alt="Refer to Table 3.7"
                    />
                  )}
                  {currentTable === "Table 3.8" && (
                    <img
                      src="./assets/Table_3.8.png"
                      alt="Refer to Table 3.8"
                    />
                  )}
                </GuideBox>
              }
            >
              <IconButton transparent>
                <Icon iconName="Info" />
              </IconButton>
            </InfoWrapper>
            <DropList
              width={PANEL_3_R_WIDTH}
              itemList={items}
              onChange={(e: SelectChangeEvent) => {
                setTempValueCallback({
                  procedureSimplified: {
                    category: e.target.value as TypeSimplified["category"],
                  },
                });
              }}
              value={asSimplified(tempValue)?.category}
              defaultValue={SimplifiedCategoryEnum.TABLE_3_6}
              placeholder="Select ..."
            />
          </GuideBox>
        </div>

        <GuideBox width={"100%"} spacing={1}>
          <CategoryOptions category={asSimplified(tempValue)?.category} />
        </GuideBox>

        <GuideBox width={"100%"} center>
          <CalculateButton />
        </GuideBox>
      </GuideBox>

      <QpValue />
    </GuideBox>
  );
}
