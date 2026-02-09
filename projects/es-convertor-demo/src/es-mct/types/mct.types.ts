// MCT 변환 결과 및 전역 맵 타입 정의
// VBA main.bas의 전역 Dictionary들에 대응

/** MCT 변환 결과 (v2025/v2026 버전별) */
export interface MctResult {
  v2025: string;
  v2026: string;
}

/**
 * VBA 전역 Dictionary → TypeScript Map
 * main.bas의 모듈 레벨 Dictionary 변수들에 대응
 */
export interface GlobalMaps {
  /** 노드 ID → 할당된 MCT 노드 번호 */
  nodeData: Map<string, number>;
  /** 재료 이름 → 할당된 MCT 재료 번호 */
  materialData: Map<string, number>;
  /** 요소 ID → 할당된 MCT 요소 번호 */
  elemData: Map<string, number>;
  /** 요소 ID → 요소 각도 */
  elemAngle: Map<string, number>;
  /** 단면 쌍 (sectName1-sectName2) → 단면 번호 */
  sectData: Map<string, number>;
  /** 단면 이름 → 재료 이름 */
  sect2Material: Map<string, string>;
  /** 요소 ID → [Node1, Node2] */
  elemNode: Map<string, [string, string]>;
  /** MCT 요소 번호 → MCT 재료 번호 */
  elemNo2MaterialNo: Map<number, number>;
  /** MCT 재료 번호 → "STEEL" | "RC" */
  matNo2SorRC: Map<number, string>;
  /** 원본 노드 ID → "X_Y_Z" 좌표 문자열 */
  dicOrgNode: Map<string, string>;
  /** MCT 노드 번호 → [X, Y, Z] (ES→MCT 변환 후) */
  dicESNode: Map<number, [number, number, number]>;
  /** 긴 재료 이름 → 축약 이름 */
  dicMatlName: Map<string, string>;
  /** 강체 요소 추적 */
  dicRigidElem: Map<string, string>;
  /** 스프링 특성 추적 */
  dicSprProp: Map<string, string>;
  /** 스프링 참조 추적 */
  dicSpgRef: Map<string, string>;
}

/** GlobalMaps의 초기값 팩토리 */
export function createEmptyGlobalMaps(): GlobalMaps {
  return {
    nodeData: new Map(),
    materialData: new Map(),
    elemData: new Map(),
    elemAngle: new Map(),
    sectData: new Map(),
    sect2Material: new Map(),
    elemNode: new Map(),
    elemNo2MaterialNo: new Map(),
    matNo2SorRC: new Map(),
    dicOrgNode: new Map(),
    dicESNode: new Map(),
    dicMatlName: new Map(),
    dicRigidElem: new Map(),
    dicSprProp: new Map(),
    dicSpgRef: new Map(),
  };
}
