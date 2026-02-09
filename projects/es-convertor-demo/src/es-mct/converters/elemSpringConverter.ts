// VBA: src/basicVBA/cls/Class110_ElemSpring.cls
// 스프링 요소 변환: ES → MCT (*NL-LINK 섹션)
import type { GlobalMaps } from '../types';

/**
 * VBA: Class110_ElemSpring.cls > GetSpringElem()
 * 스프링 요소에서 이중점(Double-Point) 노드 쌍 추출
 *
 * 座標系가 "参照要素"로 시작하는 스프링 요소의 노드i/j를
 * 양방향으로 맵에 저장 (nodeI → nodeJ, nodeJ → nodeI)
 *
 * @param springElemData ばね要素 시트 데이터 (string[][])
 * @returns dicDblPnt: 이중점 노드 맵 (nodeId → 상대 nodeId)
 */
export function getSpringElemDblPnt(
  springElemData: string[][]
): Map<string, string> {
  const dicDblPnt = new Map<string, string>();

  // VBA: strRefElem = "参照要素"
  const strRefElem = '参照要素';

  for (let i = 0; i < springElemData.length; i++) {
    const nodeI = springElemData[i][1]; // VBA: strData(1, i) — 節点i
    const nodeJ = springElemData[i][2]; // VBA: strData(2, i) — 節点j
    const coordSys = springElemData[i][4]; // VBA: strData(4, i) — 座標系

    // VBA: If Left(strData(4, i), Len(strRefElem)) = strRefElem Then
    if (coordSys && coordSys.substring(0, strRefElem.length) === strRefElem) {
      // VBA: If Not dicDblPnt.Exists(strData(1, i)) Then dicDblPnt.Add strData(1, i), strData(2, i)
      if (!dicDblPnt.has(nodeI)) {
        dicDblPnt.set(nodeI, nodeJ);
      }
      // VBA: If Not dicDblPnt.Exists(strData(2, i)) Then dicDblPnt.Add strData(2, i), strData(1, i)
      if (!dicDblPnt.has(nodeJ)) {
        dicDblPnt.set(nodeJ, nodeI);
      }
    }
  }

  return dicDblPnt;
}

/**
 * 스프링 요소 데이터를 MCT *NL-LINK 형식으로 변환
 * VBA: Class110_ElemSpring.cls > ChangeElemSpring()
 */
export function convertElemSpring(
  _springElemData: string[][],
  _globalMaps: GlobalMaps
): { lines: string[]; updatedMaps: Partial<GlobalMaps> } {
  // TODO: VBA Class110_ElemSpring.cls > ChangeElemSpring() 로직 구현
  return { lines: [], updatedMaps: {} };
}
