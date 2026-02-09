// VBA: src/basicVBA/cls/Class100_Hinge_Ass.cls
// 힌지 할당 변환: ES → MCT (*IHINGE-ASSIGN 섹션)
import type { GlobalMaps } from '../types';

/**
 * 힌지 할당 데이터를 MCT *IHINGE-ASSIGN 형식으로 변환
 * VBA: Class100_Hinge_Ass.cls > ChangeHinge_Ass()
 */
export function convertHingeAss(
  _hingeAssData: string[][],
  _globalMaps: GlobalMaps
): { lines: string[]; updatedMaps: Partial<GlobalMaps> } {
  // TODO: VBA Class100_Hinge_Ass.cls 로직 구현
  return { lines: [], updatedMaps: {} };
}
