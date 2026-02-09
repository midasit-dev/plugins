// VBA: src/basicVBA/cls/Class160_Fulcrum.cls
// 지점 변환: ES → MCT (*GSPRING, *CONSTRAINT 섹션)
import type { GlobalMaps } from '../types';

/**
 * 지점 데이터를 MCT *GSPRING / *CONSTRAINT 형식으로 변환
 * VBA: Class160_Fulcrum.cls > ChangeFulcrum()
 */
export function convertFulcrum(
  _fulcrumData: string[][],
  _globalMaps: GlobalMaps
): { gspringLines: string[]; constraintLines: string[]; updatedMaps: Partial<GlobalMaps> } {
  // TODO: VBA Class160_Fulcrum.cls 로직 구현
  return { gspringLines: [], constraintLines: [], updatedMaps: {} };
}
