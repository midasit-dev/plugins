/**
 * @fileoverview 말뚝 기초의 3D 시각화를 위한 계산 유틸리티 모듈
 * @description
 * 이 모듈은 말뚝 기초의 3D 시각화에 필요한 모든 계산 함수들을 포함합니다.
 * 주로 usePileViewer hook에서 사용되며, 기초, 말뚝, 치수선 등의 3D 객체 생성을 담당합니다.
 */

import { PileBasicDim } from "../../types/typePileDomain";
import { PileDataItem } from "../../types/typePileDomain";
import {
  CylinderState,
  ConeState,
  PileBasic,
  PileCylinderData,
  CanvasTextState,
  PlaneDimState,
} from "../../types/typePileViewer";

// 기초 높이 계산
export const calBaseTopLevel = (pileDataList: PileDataItem[]): number => {
  const topLevels = pileDataList
    .map((pile) => pile?.initSetData?.topLevel)
    .filter((level) => typeof level === "number" && !isNaN(level));
  return topLevels.length > 0 ? Math.max(...topLevels) : 0;
};

// 말뚝 타입별 색상 매핑
const pileColorMap: Record<string, string> = {
  Cast_In_Situ: "#D0D0D0",
  PHC_Pile: "#4ECDC4",
  SC_Pile: "#F7B733",
  Steel_Pile: "#FF6B6B",
  Soil_Cement_Pile: "#A8D5BA",
};

// 기초와 하중재하점의 3D 시각화 데이터 생성
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

// 말뚝의 3D 시각화 데이터 생성
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
                ? section.steel.diameter / 1000 / 2
                : section.concrete.diameter / 1000 / 2;
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

// 치수선 텍스트 생성
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

// 치수선 도형 생성
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
