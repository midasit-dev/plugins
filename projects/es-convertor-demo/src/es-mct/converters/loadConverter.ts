// VBA: src/basicVBA/cls/Class190_Load.cls
// 하중 변환: ES → MCT (하중 케이스별 *LOAD 섹션)
import type { GlobalMaps } from '../types';

/**
 * 하중 데이터를 MCT 하중 형식으로 변환
 * VBA: Class190_Load.cls > ChangeLoad()
 * 주의: 섹션 배열 끝에 불필요한 빈 줄 추가하지 않기
 */
export function convertLoad(
  _loadData: string[][],
  _globalMaps: GlobalMaps
): { lines: string[]; updatedMaps: Partial<GlobalMaps> } {
  // TODO: VBA Class190_Load.cls 로직 구현
  return { lines: [], updatedMaps: {} };
}
