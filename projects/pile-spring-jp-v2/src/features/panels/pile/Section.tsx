/**
 * @fileoverview 말뚝 단면 패널
 * @description
 * 통합 도메인 시스템을 사용하여 다음 값들을 관리:
 * - 말뚝 단면 타입(string): pileSectionType
 * - 말뚝 단면 두께(number): pileSectionThickness
 * - 말뚝 단면 탄성계수(number): pileSectionModulus
 * - 말뚝 단면 피복(number): pileSectionCover
 * - 말뚝 단면 충진(number): pileSectionFill
 *
 * 순차적 체크박스 연동
 * 파일 타입에 따른 필드 편집 제한
 * 동적 헤더 텍스트 변경
 * 숫자 필드 유효성 검사
 * 기본 말뚝 단면은 항상 체크
 * 추가 말뚝 단면은 총 3개 층으로 구성 (추후 추가가 쉽도록 리스트로 구성)
 */

import React from "react";

import { CustomTable, CustomBox } from "../../../components";

import { usePileSection } from "../../../hooks/pile/useSection";

const PileSection = React.memo(() => {
  const { rows, renderRow, getHeaders } = usePileSection();

  return (
    <CustomBox sx={{ width: 870 }}>
      <CustomTable
        headers={getHeaders[0]}
        groupHeaders={getHeaders[1]}
        rows={rows}
        renderRow={renderRow}
      />
    </CustomBox>
  );
});

PileSection.displayName = "PileSectionTable";

export default PileSection;
