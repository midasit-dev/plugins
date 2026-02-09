// VBA: Class200 참조 (내력 데이터)
// 내력 변환: ES → MCT
import type { GlobalMaps } from '../types';

/**
 * 내력 데이터를 MCT 형식으로 변환
 * VBA: Class200 계열 참조
 */
export function convertInternalForce(
  _intforceData: string[][],
  _globalMaps: GlobalMaps
): { lines: string[]; updatedMaps: Partial<GlobalMaps> } {
  // TODO: VBA 내력 변환 로직 구현
  return { lines: [], updatedMaps: {} };
}
