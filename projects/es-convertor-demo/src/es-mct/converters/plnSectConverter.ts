// VBA: src/basicVBA/cls/Class080_PlnSect.cls
// 평판 단면 변환: ES → MCT (*THICKNESS 섹션)
import type { GlobalMaps } from '../types';

/**
 * 평판 단면 데이터를 MCT *THICKNESS 형식으로 변환
 * VBA: Class080_PlnSect.cls > ChangePlnSect()
 */
export function convertPlnSect(
  _plnSectData: string[][],
  _globalMaps: GlobalMaps
): { lines: string[]; updatedMaps: Partial<GlobalMaps> } {
  // TODO: VBA Class080_PlnSect.cls 로직 구현
  return { lines: [], updatedMaps: {} };
}
