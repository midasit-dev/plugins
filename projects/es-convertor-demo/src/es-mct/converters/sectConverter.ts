// VBA: src/basicVBA/cls/Class070_Sect.cls
// 단면 특성 변환: ES → MCT (*SECTION, *SECT-PSCVALUE 섹션)
import type { GlobalMaps } from '../types';

/**
 * 단면 특성 데이터를 MCT *SECTION 형식으로 변환
 * VBA: Class070_Sect.cls > ReadSect_SectName(), ChangeSect()
 * VALUE 단면 + TAPERED 단면 처리
 */
export function convertSect(
  _sectData: string[][],
  _globalMaps: GlobalMaps,
  _dicSectAll?: Map<string, number>,
  _dicSectYoung?: Map<string, number>
): { lines: string[]; pscLines: string[]; updatedMaps: Partial<GlobalMaps> } {
  // TODO: VBA Class070_Sect.cls 로직 구현
  // 1. ReadSect_SectName(): dicSectName에서 Young/thermal 값 추출
  // 2. ChangeSect(): VALUE/TAPERED 단면의 MCT 출력 생성
  // 주의: -0 포맷팅 — Object.is(v, -0) ? '-0' : String(v)
  return { lines: [], pscLines: [], updatedMaps: {} };
}
