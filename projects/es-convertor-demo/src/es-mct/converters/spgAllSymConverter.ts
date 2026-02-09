// VBA: src/basicVBA/cls/Class130_SPGAllSym.cls
// 대칭 스프링 특성 변환: ES → MCT (*NL-PROP 섹션)
import type { GlobalMaps } from '../types';

/**
 * 대칭 스프링 특성 데이터를 MCT *NL-PROP 형식으로 변환
 * VBA: Class130_SPGAllSym.cls
 * 선형/바이리니어/트리리니어/테트라리니어 하위 타입 처리
 */
export function convertSpgAllSym(
  _symLinData: string[][],
  _symBiData: string[][],
  _symTriData: string[][],
  _symTetData: string[][],
  _globalMaps: GlobalMaps
): { lines: string[]; updatedMaps: Partial<GlobalMaps> } {
  // TODO: VBA Class130_SPGAllSym.cls 로직 구현
  return { lines: [], updatedMaps: {} };
}
