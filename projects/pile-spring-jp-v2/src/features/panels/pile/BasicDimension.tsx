/**
 * @fileoverview 말뚝 기초 제원 설정 패널
 * @description
 * 통합 도메인 시스템을 사용하여 다음 값들을 관리:
 * - 재항뱡향 폭(m): foundationWidth
 * - 측면 길이(m): sideLength
 * - 힘 작용 점 X좌표(m): forcePointX
 * - 힘 작용 점 Y좌표(m): forcePointY
 *
 * 상태 관리: usePileDomain 훅을 통해 통합된 pileDomainState 사용
 * 유효성 검사: 양수 값만 허용 (foundationWidth, sideLength)
 */

import React, { useMemo } from "react";

import { Typography } from "@midasit-dev/moaui";
import { Paper } from "@mui/material";
import { CustomNumberField, CustomBox } from "../../../components";

import { usePileBasicDim } from "../../../hooks/pile/useBasicDimension";
import { PILE_BASIC_DIMENSION } from "../../../constants/pile/translations";

import { useTranslation } from "react-i18next";

const PileBasicDimension = React.memo(() => {
  const { t } = useTranslation();
  const { values, handleChange } = usePileBasicDim();

  const fields = useMemo(
    () => [
      {
        label: t(PILE_BASIC_DIMENSION.FOUNDATION_WIDTH),
        value: values.foundationWidth.toString(),
        onChange: handleChange("foundationWidth"),
        hasValidation: true,
        width: 180,
      },
      {
        label: t(PILE_BASIC_DIMENSION.SIDE_LENGTH),
        value: values.sideLength.toString(),
        onChange: handleChange("sideLength"),
        hasValidation: true,
        width: 180,
      },
      {
        label: t(PILE_BASIC_DIMENSION.FORCE_POINT_X),
        value: values.forcePointX.toString(),
        onChange: handleChange("forcePointX"),
        hasValidation: false,
        width: 240,
      },
      {
        label: t(PILE_BASIC_DIMENSION.FORCE_POINT_Y),
        value: values.forcePointY.toString(),
        onChange: handleChange("forcePointY"),
        hasValidation: false,
        width: 240,
      },
    ],
    [t, values, handleChange]
  );

  return (
    <CustomBox
      sx={{ display: "flex", width: "100%", flexDirection: "column", gap: 4 }}
    >
      <Typography variant="body2">
        {t(PILE_BASIC_DIMENSION.FOOTING_DIMENSION)}
      </Typography>
      <Paper sx={{ padding: "8px", width: "100%" }}>
        <CustomBox
          sx={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
          }}
        >
          {fields.map((field, index) => (
            <CustomNumberField
              key={index}
              label={field.label}
              width={field.width}
              numberFieldWidth={90}
              value={field.value}
              onChange={field.onChange}
              numberOptions={
                field.hasValidation
                  ? {
                      min: 0,
                      condition: {
                        min: "greater",
                      },
                    }
                  : undefined
              }
            />
          ))}
        </CustomBox>
      </Paper>
    </CustomBox>
  );
});

PileBasicDimension.displayName = "PileBasicDimension";

export default PileBasicDimension;
