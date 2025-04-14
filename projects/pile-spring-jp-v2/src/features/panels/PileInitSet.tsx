import React from "react";
import { GuideBox, Panel } from "@midasit-dev/moaui";
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

  const totalWidth = 280;
  const fieldWidth = 180;

  return (
    <Panel width="100%">
      <GuideBox column verCenter horSpaceBetween spacing={1}>
        <GuideBox row verCenter horSpaceBetween>
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
          <CustomDropList
            label={t("Head_Condition")}
            width={totalWidth}
            droplistWidth={fieldWidth}
            itemList={HeadConditionItems()}
            value={values.HeadCondition}
            onChange={handlers.handleHeadConditionChange}
          />
        </GuideBox>
        <GuideBox row verCenter horSpaceBetween>
          <CustomNumberField
            label={t("Top_Level")}
            width={totalWidth}
            numberFieldWidth={fieldWidth}
            value={values.TopLevel.toString()}
            onChange={handlers.handleTopLevelChange}
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
      </GuideBox>
    </Panel>
  );
};

export default PileInitSet;
