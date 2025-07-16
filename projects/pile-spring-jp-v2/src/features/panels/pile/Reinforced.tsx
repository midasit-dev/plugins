/**
 * @fileoverview 말뚝 보강 패널
 * @description
 * 통합 도메인 시스템을 사용하여 다음 값들을 관리:
 * - 보강 방법(string): reinforcedMethod
 * - 보강 시작(number): reinforcedStart
 * - 보강 종료(number): reinforcedEnd
 * - 보강 두께(number): reinforcedThickness
 * - 보강 탄성계수(number): reinforcedModulus
 *
 * 1행과 2행 간의 체크박스 연동
 * 1행의 시작/종료 값이 2행에 자동 반영
 * 전체 선택/해제 기능
 * 숫자 필드 유효성 검사
 */

import { CustomTable, CustomBox } from "../../../components";
import { usePileReinforced } from "../../../hooks/pile/useReinforced";

const PileReinforced = () => {
  const { rows, renderRow, getHeaders } = usePileReinforced();

  return (
    <CustomBox
      sx={{ width: 550, display: "flex", flexDirection: "column", gap: 4 }}
    >
      <CustomTable
        totalWidth={540}
        rows={rows}
        renderRow={renderRow}
        headers={getHeaders()}
      />
    </CustomBox>
  );
};

export default PileReinforced;
