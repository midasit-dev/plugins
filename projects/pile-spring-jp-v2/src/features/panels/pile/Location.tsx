/**
 * @fileoverview 말뚝 배치 패널
 * @description
 * 통합 도메인 시스템을 사용하여 다음 값들을 관리:
 * - 말뚝 위치(string): pileLocation
 * - 참조기준(string): referencePoint
 * - 위치(number): location
 * - 간격(number): space
 * - 각도(number): angle
 *
 * 각도는 간격보다 항상 갯수가 +1
 * 재하 직각방향의 간격은 없음
 */

import { CustomTable, CustomBox } from "../../../components";
import { usePileLocation } from "../../../hooks/pile/useLocation";

const PileLocation = () => {
  const { rows, renderRow, getHeaders } = usePileLocation();

  return (
    <CustomBox
      sx={{ width: 500, display: "flex", flexDirection: "column", gap: 4 }}
    >
      <CustomTable rows={rows} renderRow={renderRow} headers={getHeaders()} />
    </CustomBox>
  );
};

export default PileLocation;
