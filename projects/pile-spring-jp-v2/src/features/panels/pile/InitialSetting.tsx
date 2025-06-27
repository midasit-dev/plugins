/**
 * @fileoverview 말뚝 기본 설정 패널
 * @description
 * 통합 도메인 시스템을 사용하여 다음 값들을 관리:
 * - 말뚝 명칭(string): pileName
 * - 말뚝 길이(number): pileLength
 * - 저면 표고(number): topLevel
 * - 말뚝머리 접합조건(string): headCondition
 * - 시공방법(string): constructionMethod
 */

import React, { useMemo } from "react";

import {
  CustomNumberField,
  CustomTextField,
  CustomDropList,
  CustomBox,
} from "../../../components";

import {
  HeadConditionItems,
  ConstructionMethodItems,
  BottomConditionItems,
} from "../../../constants/common/selectOptions";
import { PILE_INIT_SETTING } from "../../../constants/pile/translations";
import { usePileInitSet } from "../../../hooks/pile/useInitialSetting";

import { useTranslation } from "react-i18next";

const PileInitialSetting = React.memo(() => {
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
    <CustomBox sx={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <CustomTextField
        label={t(PILE_INIT_SETTING.PILE_NAME)}
        width={totalWidth}
        textFieldWidth={fieldWidth}
        value={values.pileName}
        onChange={handlers.handleNameChange}
      />
      <CustomNumberField
        label={t(PILE_INIT_SETTING.PILE_LENGTH)}
        width={totalWidth}
        numberFieldWidth={fieldWidth}
        value={values.pileLength.toString()}
        disabled={true}
      />
      <CustomNumberField
        label={t(PILE_INIT_SETTING.TOP_LEVEL)}
        width={totalWidth}
        numberFieldWidth={fieldWidth}
        value={values.topLevel.toString()}
        onChange={handlers.handleTopLevelChange}
      />
      <CustomDropList
        label={t(PILE_INIT_SETTING.CONSTRUCTION_METHOD)}
        width={totalWidth}
        droplistWidth={fieldWidth}
        itemList={ConstructionMethodItems()}
        value={values.constructionMethod}
        onChange={handlers.handleConstructionMethodChange}
      />
      <CustomDropList
        label={t(PILE_INIT_SETTING.HEAD_CONDITION)}
        width={totalWidth}
        droplistWidth={fieldWidth}
        itemList={HeadConditionItems()}
        value={values.headCondition}
        onChange={handlers.handleHeadConditionChange}
      />
      <CustomDropList
        label={t(PILE_INIT_SETTING.BOTTOM_CONDITION)}
        width={totalWidth}
        droplistWidth={fieldWidth}
        itemList={BottomConditionItems()}
        value={values.bottomCondition}
        onChange={handlers.handleBottomConditionChange}
      />
    </CustomBox>
  );
});

PileInitialSetting.displayName = "PileInitSet";

export default PileInitialSetting;
