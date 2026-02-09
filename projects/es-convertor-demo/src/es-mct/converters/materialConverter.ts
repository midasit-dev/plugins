// VBA: src/basicVBA/cls/Class050_Material.cls
// 재료 변환: ES → MCT (*MATERIAL 섹션)
import type { GlobalMaps } from '../types';

/**
 * 재료 데이터를 MCT *MATERIAL 형식으로 변환
 * VBA: Class050_Material.cls > ChangeMaterial()
 */
export function convertMaterial(
  _materialData: string[][],
  _globalMaps: GlobalMaps,
  _dicMatlYoung?: Map<string, number>,
  _dicSectName?: Map<string, { young: number; thermal: number }>
): { lines: string[]; updatedMaps: Partial<GlobalMaps> } {
  // TODO: VBA Class050_Material.cls 로직 구현
  // 1. 재료 타입 판정 (鋼材→STEEL, コンクリート→CONC)
  // 2. DB 재료 / User 정의 재료 분류
  // 3. 단위 변환 (N/mm² → kN/m²)
  // 4. dicSectName의 자동 재료 생성 (Material, Material~2, ...)
  return { lines: [], updatedMaps: {} };
}
