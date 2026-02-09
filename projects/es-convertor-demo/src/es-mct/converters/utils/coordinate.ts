// VBA: Class010_Node.cls > ChangeNode() — 좌표 변환
// ES 좌표계 → MCT 좌표계: (X, Y, Z) → (X, -Z, Y)

export interface MidasCoord {
  x: number;
  y: number;
  z: number;
}

/**
 * ES 좌표를 MIDAS Civil 좌표로 변환
 * VBA: BufP(0) = X, BufP(1) = -Z, BufP(2) = Y
 */
export function esCoordToMidas(esX: number, esY: number, esZ: number): MidasCoord {
  return {
    x: esX,
    y: -1 * esZ,
    z: esY,
  };
}
