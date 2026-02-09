// VBA: src/basicVBA/cls/Class020_Frame.cls
// 프레임 요소 변환: ES → MCT (*ELEMENT 섹션)
import type { GlobalMaps } from '../types';

/**
 * 프레임 요소 데이터를 MCT *ELEMENT 형식으로 변환
 * VBA: Class020_Frame.cls > ReadFrame_Sectname(), ReadFrame(), SetElemNo(), ChangeFrame()
 */
export function convertFrames(
  _frameData: string[][],
  _globalMaps: GlobalMaps
): { lines: string[]; updatedMaps: Partial<GlobalMaps> } {
  // TODO: VBA Class020_Frame.cls 로직 구현
  // 1. ReadFrame_Sectname(): 단면 이름 수집 → dicSectName
  // 2. ReadFrame(): 전체 단면 참조 수집 → dicSectAll
  // 3. SetElemNo(): 요소 번호 할당
  // 4. ChangeFrame(): MCT *ELEMENT 출력 생성
  return { lines: [], updatedMaps: {} };
}
