// VBA: src/basicVBA/cls/Class060_SectElem.cls
// 단면 요소 변환: ES → MCT (단면-재료 매핑)
import type { GlobalMaps } from '../types';

/**
 * 단면 요소 데이터 처리
 * VBA: Class060_SectElem.cls > ReadSectElem_SectName(), ReadSectElem()
 * 주의: 재료 컬럼은 row[3] (column E), row[1]이 아님 — VBA strData(3)
 */
export function processSectElem(
  _sectElemData: string[][],
  _globalMaps: GlobalMaps
): { updatedMaps: Partial<GlobalMaps> } {
  // TODO: VBA Class060_SectElem.cls 로직 구현
  // 1. ReadSectElem_SectName(): dicSectName에서 SectElem이 있는 단면 제거
  // 2. ReadSectElem(): m_Sect2Material에 sectName(row[0]) → materialName(row[3]) 매핑
  return { updatedMaps: {} };
}
