import React, { useMemo } from "react";
import { GuideBox } from "@midasit-dev/moaui";
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

const PileInitSet = React.memo(() => {
  /**
  말뚝 기본 설정

  말뚝 명칭: 말뚝 이름
  말뚝 길이(m): 전체 길이, 기존 버전에서는 값을 입력받았지만, 지금은 Section에서 설정한 값을 합쳐서 표기
  저면 표고(m): 말뚝 머리 표고, 기존 버전에서는 하나의 값으로 받았지만, 지금은 각 파일에 적용 가능한 형식으로 변경
  말뚝머리 접합조건: 강결 또는 힌지
  시공방법: 7개 옵션
  말뚝 선단 조건: 자유, 힌지 또는 고정
  **/
  const { t } = useTranslation();
  const { values, handlers } = usePileInitSet();

  const { totalWidth, fieldWidth } = useMemo(
    () => ({
      totalWidth: 260,
      fieldWidth: 160,
    }),
    []
  );

  return (
    <Paper id="PileInitSet_Panel" sx={{ padding: "8px" }}>
      <GuideBox width="100%" column verCenter verSpaceBetween spacing={0.75}>
        <CustomTextField
          label={t("Pile_Name")}
          width={totalWidth}
          textFieldWidth={fieldWidth}
          value={values.pileName}
          onChange={handlers.handleNameChange}
        />
        <CustomNumberField
          label={t("Pile_Length")}
          width={totalWidth}
          numberFieldWidth={fieldWidth}
          value={values.pileLength.toString()}
          // onChange={handlers.handleLengthChange}
          disabled={true}
        />
        <CustomNumberField
          label={t("Top_Level")}
          width={totalWidth}
          numberFieldWidth={fieldWidth}
          value={values.topLevel.toString()}
          onChange={handlers.handleTopLevelChange}
        />
        <CustomDropList
          label={t("Head_Condition")}
          width={totalWidth}
          droplistWidth={fieldWidth}
          itemList={HeadConditionItems()}
          value={values.headCondition}
          onChange={handlers.handleHeadConditionChange}
        />
        <CustomDropList
          label={t("Construction_Method")}
          width={totalWidth}
          droplistWidth={fieldWidth}
          itemList={ConstructionMethodItems()}
          value={values.constructionMethod}
          onChange={handlers.handleConstructionMethodChange}
        />
        <CustomDropList
          label={t("Bottom_Condition")}
          width={totalWidth}
          droplistWidth={fieldWidth}
          itemList={BottomConditionItems()}
          value={values.bottomCondition}
          onChange={handlers.handleBottomConditionChange}
        />
      </GuideBox>
    </Paper>
  );
});

PileInitSet.displayName = "PileInitSet";

export default PileInitSet;
