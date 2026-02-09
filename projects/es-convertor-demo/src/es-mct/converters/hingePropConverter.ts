// VBA: src/basicVBA/cls/Class090_Hinge_Prop.cls
// 힌지 특성 변환: ES → MCT (*IHINGE-PROP 섹션)
import type { GlobalMaps } from '../types';

/**
 * 힌지 특성 데이터를 MCT *IHINGE-PROP 형식으로 변환
 * VBA: Class090_Hinge_Prop.cls > ReadHinge_Prop(), ChangeHinge_Prop()
 */
export function convertHingeProp(
  _hingeZpData: string[][],
  _hingeYpData: string[][],
  _globalMaps: GlobalMaps
): { lines: string[]; updatedMaps: Partial<GlobalMaps> } {
  // TODO: VBA Class090_Hinge_Prop.cls 로직 구현
  return { lines: [], updatedMaps: {} };
}
