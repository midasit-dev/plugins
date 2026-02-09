// VBA: src/basicVBA/cls/Class010_Node.cls
// 노드 좌표 변환: ES → MCT (*NODE 섹션)
import type { GlobalMaps } from '../types';

/**
 * VBA IsNumeric() 호환 — 문자열이 유효한 숫자인지 판별
 * VBA: IsNumeric("") = False, IsNumeric("1") = True
 */
function isVbaNumeric(s: string): boolean {
  if (s.trim() === '') return false;
  const n = Number(s);
  return !isNaN(n) && isFinite(n);
}

/**
 * VBA CStr() 호환 — 숫자를 문자열로 변환 (-0 처리)
 * JavaScript String(-0) = "0" 이지만 VBA CStr(-0) = "-0"
 */
function vbaCStr(value: number): string {
  if (Object.is(value, -0)) return '-0';
  return String(value);
}

/**
 * VBA: Class010_Node.cls > GetNode()
 * 노드 데이터에서 dicDblNode_Z 맵 생성 (이중점 검출용)
 * Frame의 ReadFrame_Sectname에서 사용
 *
 * @param nodeData 節点座標 시트 데이터 (string[][])
 * @returns dicDblNode_Z: 노드 ID → ["X_Z", "Y"]
 */
export function getNodeData(
  nodeData: string[][]
): Map<string, [string, string]> {
  const dicDblNode_Z = new Map<string, [string, string]>();

  for (let i = 0; i < nodeData.length; i++) {
    const nodeId = nodeData[i][0]; // VBA: strData(0, i) — 節点名
    const x = nodeData[i][1];      // VBA: strData(1, i) — X
    const y = nodeData[i][2];      // VBA: strData(2, i) — Y
    const z = nodeData[i][3];      // VBA: strData(3, i) — Z

    // VBA: vBuf = Array(strData(1, i) & "_" & strData(3, i), strData(2, i))
    // VBA: dicDblNode_Z.Add strData(0, i), vBuf
    dicDblNode_Z.set(nodeId, [`${x}_${z}`, y]);
  }

  return dicDblNode_Z;
}

/**
 * 노드 데이터를 MCT *NODE 형식으로 변환
 * VBA: Class010_Node.cls > ChangeNode()
 *
 * 좌표 변환: ES(X, Y, Z) → MCT(X, -Z, Y)
 * 이중점 처리: 동일 좌표의 스프링 노드 → Y를 0.001씩 감소
 *
 * @param nodeData 節点座標 시트 데이터 (string[][])
 * @param dicDblPnt 이중점 맵 — GetSpringElem에서 생성 (nodeI → nodeJ)
 * @returns { lines: MCT 출력 라인 배열, updatedMaps: 갱신된 전역 맵 }
 */
export function convertNodes(
  nodeData: string[][],
  dicDblPnt: Map<string, string>
): { lines: string[]; updatedMaps: Partial<GlobalMaps> } {
  if (nodeData.length === 0) {
    return { lines: [], updatedMaps: {} };
  }

  // VBA: dicNodeData — 이중점 검출용 "X-Y-Z" 문자열 맵
  const dicNodeData = new Map<string, boolean>();
  // VBA: m_DicOrgNode — 원본 노드 ID → "X_Y_Z" 좌표 문자열
  const dicOrgNode = new Map<string, string>();
  // VBA: m_NodeData — 노드 ID → MCT 노드 번호 (처음엔 자기 자신)
  const m_NodeData = new Map<string, string | number>();

  // ─── Step 1: 최대 노드 번호 검출 & m_DicOrgNode, m_NodeData 구성 ───
  // VBA: nMax = 0 → 최대 숫자형 노드 번호 검출
  let nMax = 0;

  for (let i = 0; i < nodeData.length; i++) {
    const nodeId = nodeData[i][0]; // VBA: strData(0, i)
    const x = nodeData[i][1];      // VBA: strData(1, i)
    const y = nodeData[i][2];      // VBA: strData(2, i)
    const z = nodeData[i][3];      // VBA: strData(3, i)

    // VBA: strBuf = strData(1, i) & "_" & strData(2, i) & "_" & strData(3, i)
    // VBA: m_DicOrgNode.Add strData(0, i), strBuf
    const strBuf = `${x}_${y}_${z}`;
    if (!dicOrgNode.has(nodeId)) {
      dicOrgNode.set(nodeId, strBuf);
    }

    // VBA: If IsNumeric(strData(0, i)) Then If nMax < strData(0, i) Then nMax = strData(0, i)
    if (isVbaNumeric(nodeId)) {
      const numId = Number(nodeId);
      if (nMax < numId) nMax = numId;
    }

    // VBA: If Len(strData(0, i)) > 0 Then m_NodeData.Add strData(0, i), strData(0, i)
    if (nodeId.length > 0 && !m_NodeData.has(nodeId)) {
      m_NodeData.set(nodeId, nodeId);
    }
  }

  // ─── Step 2: 노드 번호 할당 + m_dicESNode + 이중점 처리 ───
  // VBA: Set m_dicESNode = New Dictionary
  const dicESNode = new Map<number, [number, number, number]>();

  // VBA: nMax = nMax + 1 (자동 번호 시작점)
  nMax = nMax + 1;

  // strData는 이중점 처리에서 수정될 수 있으므로 복사
  const mutableData = nodeData.map(row => [...row]);

  // VBA: m_NodeData.Keys(i)와 strData(*, i)는 동일 인덱스 사용
  const nodeKeys = Array.from(m_NodeData.keys());

  for (let i = 0; i < nodeKeys.length; i++) {
    const key = nodeKeys[i];

    // VBA: If Not IsNumeric(m_NodeData.Keys(i)) Then
    //        m_NodeData(m_NodeData.Keys(i)) = nMax: nMax = nMax + 1
    if (!isVbaNumeric(key)) {
      m_NodeData.set(key, nMax);
      nMax = nMax + 1;
    }

    // VBA: BufP(0) = CDbl(strData(1, i))
    // VBA: BufP(1) = -1# * CDbl(strData(3, i))
    // VBA: BufP(2) = CDbl(strData(2, i))
    const bufP: [number, number, number] = [
      Number(mutableData[i][1]),
      -1 * Number(mutableData[i][3]),
      Number(mutableData[i][2]),
    ];

    // VBA: m_dicESNode.Add CLng(m_NodeData(m_NodeData.Keys(i))), BufP
    const mctNodeNo = Number(m_NodeData.get(key));
    dicESNode.set(mctNodeNo, bufP);

    // ─── 이중점 처리 ───
    // VBA: s = strData(1, i) & "-" & strData(2, i) & "-" & strData(3, i)
    let s = `${mutableData[i][1]}-${mutableData[i][2]}-${mutableData[i][3]}`;
    let bFlg = true;

    // VBA: While dicNodeData.Exists(s) And bFlg
    while (dicNodeData.has(s) && bFlg) {
      const nodeId = mutableData[i][0];

      // VBA: If dicDblPnt.Exists(strData(0, i)) Then
      if (dicDblPnt.has(nodeId)) {
        // VBA: strData(2, i) = strData(2, i) - 0.001
        const currentY = Number(mutableData[i][2]);
        mutableData[i][2] = String(currentY - 0.001);
        // VBA: s = strData(1, i) & "-" & strData(2, i) & "-" & strData(3, i)
        s = `${mutableData[i][1]}-${mutableData[i][2]}-${mutableData[i][3]}`;
      } else {
        bFlg = false;
      }
    }

    // VBA: While Not dicNodeData.Exists(s) → dicNodeData.Add s, True → Wend
    // 좌표가 없으면 추가 (한 번만 실행)
    if (!dicNodeData.has(s)) {
      dicNodeData.set(s, true);
    }
  }

  // ─── Step 3: MCT 출력 생성 ───
  const lines: string[] = [];

  // VBA: vWriteData(0, 0) = "*NODE    ; Nodes"
  lines.push('*NODE    ; Nodes');
  // VBA: vWriteData(1, 0) = "; iNO, X, Y, Z"
  lines.push('; iNO, X, Y, Z');

  // VBA: For i = 0 To m_NodeData.Count - 1
  for (let i = 0; i < nodeKeys.length; i++) {
    const nodeId = mutableData[i][0];
    // VBA: m_NodeData(strData(0, i)) — MCT 노드 번호
    const mctNo = m_NodeData.get(nodeId);
    // VBA: strData(1, i) — X 좌표 (원본 문자열 그대로)
    const x = mutableData[i][1];
    // VBA: -1# * strData(3, i) — Z 좌표 부호 반전 (숫자 연산)
    const negZ = -1 * Number(mutableData[i][3]);
    // VBA: strData(2, i) — Y 좌표 (이중점 처리 후 문자열)
    const y = mutableData[i][2];

    // VBA: m_NodeData(strData(0, i)) & "," & strData(1, i) & "," & -1# * strData(3, i) & "," & strData(2, i)
    lines.push(`${mctNo},${x},${vbaCStr(negZ)},${y}`);
  }

  // ─── nodeData Map을 number 타입으로 변환하여 반환 ───
  const nodeDataResult = new Map<string, number>();
  m_NodeData.forEach((v, k) => {
    nodeDataResult.set(k, Number(v));
  });

  return {
    lines,
    updatedMaps: {
      nodeData: nodeDataResult,
      dicOrgNode,
      dicESNode,
    },
  };
}
