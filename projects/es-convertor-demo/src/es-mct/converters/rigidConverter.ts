// VBA: src/basicVBA/cls/Class040_Rigid.cls
// 강체 요소 변환: ES → MCT (*RIGIDLINK 섹션)
import type { GlobalMaps } from '../types';

/**
 * 강체 요소 데이터를 MCT *RIGIDLINK 형식으로 변환
 * VBA: Class040_Rigid.cls > ReadRigid(), ChangeRigid()
 */
export function convertRigid(
  _rigidData: string[][],
  _globalMaps: GlobalMaps
): { lines: string[]; updatedMaps: Partial<GlobalMaps> } {
  // TODO: VBA Class040_Rigid.cls 로직 구현
  return { lines: [], updatedMaps: {} };
}
