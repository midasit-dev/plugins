import React from "react";
import { GuideBox, Panel } from "@midasit-dev/moaui";
import { Paper } from "@mui/material";
import {
  CustomNumberField,
  CustomTextField,
  CustomDropList,
} from "../../components";
import {
  HeadConditionItems,
  ConstructionMethodItems,
  BottomConditionItems,
} from "../../constants";
import { usePileInitSet } from "../../hooks";
import { useTranslation } from "react-i18next";

const PileInitSet = () => {
  const { t } = useTranslation();
  const { values, handlers } = usePileInitSet();

  const totalWidth = 260;
  const fieldWidth = 160;

  return (
    <Paper id="PileInitSet_Panel" sx={{ padding: "8px" }}>
      <GuideBox
        id="PileInitSet_GuideBox"
        column
        verCenter
        verSpaceBetween
        spacing={0.75}
      >
        <CustomTextField
          label={t("Pile_Name")}
          width={totalWidth}
          textFieldWidth={fieldWidth}
          value={values.PileName}
          onChange={handlers.handleNameChange}
        />
        <CustomNumberField
          label={t("Pile_Length")}
          width={totalWidth}
          numberFieldWidth={fieldWidth}
          value={values.PileLength.toString()}
          // onChange={handlers.handleLengthChange}
          disabled={true}
        />
        <CustomNumberField
          label={t("Top_Level")}
          width={totalWidth}
          numberFieldWidth={fieldWidth}
          value={values.TopLevel.toString()}
          onChange={handlers.handleTopLevelChange}
        />
        <CustomDropList
          label={t("Head_Condition")}
          width={totalWidth}
          droplistWidth={fieldWidth}
          itemList={HeadConditionItems()}
          value={values.HeadCondition}
          onChange={handlers.handleHeadConditionChange}
        />
        <CustomDropList
          label={t("Construction_Method")}
          width={totalWidth}
          droplistWidth={fieldWidth}
          itemList={ConstructionMethodItems()}
          value={values.ConstructionMethod}
          onChange={handlers.handleConstructionMethodChange}
        />
        <CustomDropList
          label={t("Bottom_Condition")}
          width={totalWidth}
          droplistWidth={fieldWidth}
          itemList={BottomConditionItems()}
          value={values.BottomCondition}
          onChange={handlers.handleBottomConditionChange}
        />
      </GuideBox>
    </Paper>
  );
};

export default PileInitSet;
