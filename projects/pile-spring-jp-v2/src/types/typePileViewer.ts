/**
 * @fileoverview 말뚝 기초 3D 시각화 관련 타입 정의
 */

// 기초 평면 메시 상태를 정의하는 인터페이스
export interface PlaneMeshState {
  planegeometry: number[];
  position: number[];
  rotation: number[];
  color: string;
  opacity: number;
}

// 하중재하점 구체 상태를 정의하는 인터페이스
export interface SphereState {
  position: number[];
  radius: number;
  color: string;
  opacity: number;
}

// 원뿔(치수선 화살표) 상태를 정의하는 인터페이스
export interface ConeState {
  position: number[];
  rotation: number[];
  radius: number;
  height: number;
  color: string;
  opacity: number;
}

// 원통(말뚝, 치수선) 상태를 정의하는 인터페이스
export interface CylinderState {
  position: number[];
  rotation: number[];
  radius: number;
  height: number;
  color: string;
  opacity: number;
}

// 기초와 하중재하점의 3D 시각화 데이터를 정의하는 인터페이스
export interface PileBasic {
  foundation: PlaneMeshState;
  forcePoint: SphereState;
}

// 말뚝의 3D 시각화 데이터를 정의하는 인터페이스
export interface PileCylinderData {
  group_key: number;
  pile_data: CylinderState[];
}

// 3D 캔버스의 텍스트 상태를 정의하는 인터페이스
export interface CanvasTextState {
  text: string;
  position: [number, number, number];
  rotation: [number, number, number];
  fontSize: number;
  color: string;
}

// 치수선 도형 상태를 정의하는 인터페이스
export interface PlaneDimState {
  coneObject: ConeState[];
  cylinderObject: CylinderState[];
}
