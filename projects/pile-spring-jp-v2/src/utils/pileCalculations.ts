import { PileDataItem, PileBasicDim } from "../states";
import {
  PlaneMeshState,
  SphereState,
  CylinderState,
  ConeState,
} from "../hooks";

/*
 * 기초 높이 계산
 * 말뚝 데이터의 최대 높이를 계산하여 반환
 */

export const calBaseTopLevel = (pileDataList: PileDataItem[]): number => {
  const topLevels = pileDataList
    .map((pile) => pile?.initSetData?.topLevel)
    .filter((level) => typeof level === "number" && !isNaN(level));
  return topLevels.length > 0 ? Math.max(...topLevels) : 0;
};

/*
 * PileBasicDim의 입력값을 평면 메시, 구체로 표현하기 위해 변환하는 함수
 * 기초 -> 평면 메시 입력값으로 반환
 * 하중재하점 -> 구체 입력값으로 반환
 */

export interface PileBasic {
  foundation: PlaneMeshState;
  forcePoint: SphereState;
}

export const calcPileBasic = (
  pileDataList: PileDataItem[],
  pileBasicDim: PileBasicDim
): PileBasic => {
  const width = pileBasicDim.foundationWidth;
  const length = pileBasicDim.sideLength;
  const baseTopLevel = calBaseTopLevel(pileDataList);
  const forceX = pileBasicDim.forcePointX;
  const forceY = pileBasicDim.forcePointY;
  const pointRadius = Math.max(width, length) * 0.03;

  return {
    foundation: {
      planegeometry: [width, length],
      position: [width / 2, baseTopLevel + 0.01, length / 2],
      rotation: [Math.PI / 2, 0, 0],
      color: "#E9EBEF",
      opacity: 0.3,
    },
    forcePoint: {
      position: [forceY, baseTopLevel + pointRadius, forceX],
      radius: pointRadius,
      color: "#E24335",
      opacity: 0.3,
    },
  };
};

/*
 * PileDataList의 입력값을 원통으로 표현하기 위해 변환하는 함수
 * 말뚝 데이터 -> 원통 입력값으로 반환
 *
 * 특이사항: DataList의 id 별로 선택시 활성화를 위해, group key 정보를 추가하여 반환
 */

const pileColorMap: Record<string, string> = {
  Cast_In_Situ: "#D0D0D0",
  PHC_Pile: "#4ECDC4",
  SC_Pile: "#F7B733",
  Steel_Pile: "#FF6B6B",
  Soil_Cement_Pile: "#A8D5BA",
};

export interface PileCylinderData {
  group_key: number;
  pile_data: CylinderState[];
}

export const calcPileData = (
  pileDataList: PileDataItem[],
  pileBasicDim: PileBasicDim
): PileCylinderData[] => {
  return pileDataList
    .map((pile) => {
      if (!pile?.initSetData?.pileName) return null;

      // 기본 치수
      const foundationWidth = pileBasicDim.foundationWidth;
      const foundationLength = pileBasicDim.sideLength;

      // 말뚝 그룹 정보
      const pileId = pile.id;
      const pileCount = pile.pileNumber;
      const pileTopLevel = pile.initSetData.topLevel;

      // X축 위치 정보
      const xRefPoint = pile.locationData[0].ref_point;
      const xLocation = pile.locationData[0].loc;
      const xSpacing = pile.locationData[0].space;
      const xAngle = pile.locationData[0].angle;

      // Y축 위치 정보
      const yRefPoint = pile.locationData[1].ref_point;
      const yLocation = pile.locationData[1].loc;
      const yAngle = pile.locationData[1].angle;

      // 시작점 계산
      const startX =
        xRefPoint === "Ref_Point_Left"
          ? xLocation
          : foundationLength - xLocation;
      const startY =
        yRefPoint === "Ref_Point_Bottom"
          ? yLocation
          : foundationWidth - yLocation;
      const xDirection = xRefPoint === "Ref_Point_Left" ? 1 : -1;

      const pileData: CylinderState[] = [];
      let currentX = startX;

      // 각 말뚝에 대해 처리
      for (let pileIndex = 0; pileIndex < pileCount; pileIndex++) {
        let accumulatedHeight = 0;

        // 각 단면에 대해 처리
        for (
          let sectionIndex = 0;
          sectionIndex < pile.sectionData.length;
          sectionIndex++
        ) {
          const section = pile.sectionData[sectionIndex];

          if (section.checked) {
            const pileType = section.pileType;
            const pileRadius =
              pileType === "Steel_Pile"
                ? section.steel_diameter / 1000 / 2
                : section.concrete_diameter / 1000 / 2;
            const pileHeight = section.length;

            pileData.push({
              position: [
                startY,
                pileTopLevel - accumulatedHeight - pileHeight / 2,
                currentX,
              ],
              rotation: [xAngle[sectionIndex], 0, yAngle[sectionIndex]],
              radius: pileRadius,
              height: pileHeight,
              color: pileColorMap[pileType] || "#CCCCCC",
              opacity: 0.3,
            });

            accumulatedHeight += pileHeight;
          }
        }

        // 다음 말뚝 위치로 이동
        if (pileIndex < xSpacing.length) {
          currentX += xSpacing[pileIndex] * xDirection;
        }
      }

      return {
        group_key: pileId,
        pile_data: pileData,
      };
    })
    .filter(Boolean) as PileCylinderData[];
};

/*
 * 각 뷰에서 출력하는 치수 데이터
 */

export interface CanvasTextState {
  text: string;
  position: [number, number, number];
  rotation: [number, number, number];
  fontSize: number;
  color: string;
}

export const createCanvasText = (
  pileBasicDim: PileBasicDim,
  baseTopLevel: number
): CanvasTextState[] => {
  const fdLength = pileBasicDim.sideLength;
  const fdWidth = pileBasicDim.foundationWidth;

  const basicSize = Math.max(fdLength, fdWidth) * 0.1;

  const text: CanvasTextState[] = [
    {
      text: `${(fdWidth * 1000).toLocaleString()} mm`,
      position: [fdWidth / 2, baseTopLevel, fdLength + basicSize],
      rotation: [-Math.PI / 2, 0, -Math.PI],
      fontSize: basicSize / 1.8,
      color: "#000000",
    },
    {
      text: `${(fdLength * 1000).toLocaleString()} mm`,
      position: [fdWidth + basicSize, baseTopLevel, fdLength / 2],
      rotation: [-Math.PI / 2, 0, -Math.PI / 2],
      fontSize: basicSize / 1.8,
      color: "#000000",
    },
  ];
  return text;
};

export interface PlaneDimState {
  coneObject: ConeState[];
  cylinderObject: CylinderState[];
}

export const createDimText = (
  pileBasicDim: PileBasicDim,
  baseTopLevel: number
): PlaneDimState => {
  const fdLength = pileBasicDim.sideLength;
  const fdWidth = pileBasicDim.foundationWidth;

  const interval = Math.max(fdLength, fdWidth) * 0.1;

  const coneObject: ConeState[] = [
    {
      position: [fdWidth + interval / 2, baseTopLevel, interval / 4],
      rotation: [-Math.PI / 2, 0, 0],
      radius: interval / 5,
      height: interval / 2,
      color: "#000000",
      opacity: 0.5,
    },
    {
      position: [fdWidth + interval / 2, baseTopLevel, fdLength - interval / 4],
      rotation: [Math.PI / 2, 0, 0],
      radius: interval / 5,
      height: interval / 2,
      color: "#000000",
      opacity: 0.5,
    },
    {
      position: [interval / 4, baseTopLevel, fdLength + interval / 2],
      rotation: [0, 0, Math.PI / 2],
      radius: interval / 5,
      height: interval / 2,
      color: "#000000",
      opacity: 0.5,
    },
    {
      position: [fdWidth - interval / 4, baseTopLevel, fdLength + interval / 2],
      rotation: [0, 0, -Math.PI / 2],
      radius: interval / 5,
      height: interval / 2,
      color: "#000000",
      opacity: 0.5,
    },
  ];

  const cylinderObject: CylinderState[] = [
    {
      position: [fdWidth + interval / 2, baseTopLevel, fdLength / 2],
      rotation: [Math.PI / 2, 0, 0],
      radius: interval / 20,
      height: fdLength - interval / 2,
      color: "#000000",
      opacity: 0.5,
    },
    {
      position: [fdWidth / 2, baseTopLevel, fdLength + interval / 2],
      rotation: [0, 0, Math.PI / 2],
      radius: interval / 20,
      height: fdWidth - interval / 2,
      color: "#000000",
      opacity: 0.5,
    },
  ];

  return {
    coneObject: coneObject,
    cylinderObject: cylinderObject,
  };
};
