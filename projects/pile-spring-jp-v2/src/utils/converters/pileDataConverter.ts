/**
 * @fileoverview 레거시 파일 데이터를 현재 구조로 변환하는 유틸리티 모듈
 * @module pileDataConverter
 */

import { parseSpaceInput } from "./pileSpacingConverter";
import { createDefaultPileSections } from "../../constants/pile/defaults";
import { LegacyPileData, LegacyJsonData } from "../../types/typeLegacyData";
import {
  PileReinforced,
  PileSection,
  PileBasicDim,
  PileType,
  PileDataItem,
} from "../../types/typePileDomain";

// 레거시 파일의 Section 데이터를 현재 구조로 변환
const convertLegacySectionData = (pile: LegacyPileData): PileSection[] => {
  const sections: PileSection[] = [];

  if (pile.compositeTypeCheck) {
    sections.push(
      {
        id: 1,
        checked: true,
        name: "Pile_Category_Basic",
        pileType: pile.pileType as PileType,
        length: Number(pile.compStartLength),
        concrete: {
          diameter: Number(pile.concreteDiameter),
          thickness: Number(pile.concreteThickness),
          modulus: Number(pile.concreteModulus),
        },
        steel: {
          diameter: Number(pile.steelDiameter),
          thickness: Number(pile.steelThickness),
          modulus: Number(pile.steelModulus),
          cor_thickness: Number(pile.steelCorThickness),
        },
      },
      {
        id: 2,
        checked: true,
        name: "Pile_Category_Sub1",
        pileType: pile.compPileType as PileType,
        length: Number(pile.pileLength) - Number(pile.compStartLength),
        concrete: {
          diameter: Number(pile.compConcreteDiameter),
          thickness: Number(pile.compConcreteThickness),
          modulus: Number(pile.compConcreteModulus),
        },
        steel: {
          diameter: Number(pile.compSteelDiameter),
          thickness: Number(pile.compSteelThickness),
          modulus: Number(pile.compSteelModulus),
          cor_thickness: Number(pile.compSteelCorThickness),
        },
      },
      createDefaultPileSections()[2],
      createDefaultPileSections()[3]
    );
  } else {
    sections.push(
      {
        id: 1,
        checked: true,
        name: "Pile_Category_Basic",
        pileType: pile.pileType as PileType,
        length: Number(pile.pileLength),
        concrete: {
          diameter: Number(pile.concreteDiameter),
          thickness: Number(pile.concreteThickness),
          modulus: Number(pile.concreteModulus),
        },
        steel: {
          diameter: Number(pile.steelDiameter),
          thickness: Number(pile.steelThickness),
          modulus: Number(pile.steelModulus),
          cor_thickness: Number(pile.steelCorThickness),
        },
      },
      createDefaultPileSections()[1],
      createDefaultPileSections()[2],
      createDefaultPileSections()[3]
    );
  }

  return sections;
};

// 레거시 파일의 Reinforced 데이터를 현재 구조로 변환
const convertLegacyReinforcedData = (
  pile: LegacyPileData
): PileReinforced[] => {
  const reinforcedData: PileReinforced[] = [];

  if (
    Number(pile.reinforcedStartLength) === 0 &&
    Number(pile.reinforcedEndLength) === 0
  ) {
    // state에서 default 값으로 설정
    reinforcedData.push(
      {
        id: 1,
        checked: false,
        method: "Reinforced_Method_Outer",
        start: 0,
        end: 0,
        thickness: 0,
        modulus: 0,
      },
      {
        id: 2,
        checked: false,
        method: "Reinforced_Method_Inner",
        start: 0,
        end: 0,
        thickness: 0,
        modulus: 0,
      }
    );
  } else {
    reinforcedData.push(
      {
        id: 1,
        checked: true,
        method: pile.reinforcedMethod,
        start: Number(pile.reinforcedStartLength),
        end: Number(pile.reinforcedEndLength),
        thickness: Number(pile.outerThickness),
        modulus: Number(pile.outerModulus),
      },
      {
        id: 2,
        checked:
          pile.reinforcedMethod === "Reinforced_Method_Inner_Outer"
            ? true
            : false,
        method: "Reinforced_Method_Inner",
        start: Number(pile.reinforcedStartLength),
        end: Number(pile.reinforcedEndLength),
        thickness: Number(pile.innerThickness),
        modulus: Number(pile.innerModulus),
      }
    );
  }

  return reinforcedData;
};

// 전체 레거시 파일 데이터를 현재 구조로 변환
const convertPileLegacyToCurrent = (
  legacyData: LegacyJsonData
): { pileData: PileDataItem[]; basicDimensions: PileBasicDim } => {
  const pileData = legacyData.piletableData.map((pile, index) => {
    // space와 angle 데이터 처리
    const majorSpace = parseSpaceInput(pile.majorSpace);
    const majorDegree = parseSpaceInput(pile.majorDegree);
    const minorDegree = parseSpaceInput(pile.minorDegree);

    // angle 배열 길이 조정
    const adjustAngleArray = (spaceArray: number[], angleArray: number[]) => {
      const targetLength = spaceArray.length + 1;

      if (
        angleArray.length === 0 ||
        (angleArray.length === 1 && angleArray[0] === 0)
      ) {
        return Array(targetLength).fill(0);
      }

      if (angleArray.length < targetLength) {
        return [
          ...angleArray,
          ...Array(targetLength - angleArray.length).fill(0),
        ];
      } else if (angleArray.length > targetLength) {
        return angleArray.slice(0, targetLength);
      }
      return angleArray;
    };

    return {
      id: index + 1,
      pileName: pile.pileName,
      pileNumber: pile.PileNums,
      initSetData: {
        pileName: pile.pileName,
        pileLength: Number(pile.pileLength),
        topLevel: Number(legacyData.topLevel),
        constructionMethod: pile.constructionMethod,
        headCondition: pile.headCondition,
        bottomCondition: pile.bottomCondition,
      },
      locationData: [
        {
          id: 1,
          loc_title: "Pile_X_Dir",
          ref_point:
            pile.majorRefValue === 1 ? "Ref_Point_Right" : "Ref_Point_Left",
          loc: Number(pile.majorStartPoint),
          space: majorSpace,
          angle: adjustAngleArray(majorSpace, majorDegree),
        },
        {
          id: 2,
          loc_title: "Pile_Y_Dir",
          ref_point:
            pile.minorRefValue === 1 ? "Ref_Point_Top" : "Ref_Point_Bottom",
          loc: Number(pile.minorStartPoint),
          space: [],
          angle: adjustAngleArray(majorSpace, minorDegree),
        },
      ],
      reinforcedData: convertLegacyReinforcedData(pile),
      sectionData: convertLegacySectionData(pile),
    };
  });

  const basicDimensions = {
    foundationWidth: Number(legacyData.foundationWidth),
    sideLength: Number(legacyData.sideLength),
    forcePointX: Number(legacyData.forcepointX),
    forcePointY: Number(legacyData.forcepointY),
  };

  return { pileData, basicDimensions };
};

// 레거시 데이터의 유효성을 검사
const validateLegacyData = (data: any): boolean => {
  if (!data.piletableData || !Array.isArray(data.piletableData)) {
    return false;
  }

  const requiredFields = [
    "pileName",
    "pileLength",
    "pileType",
    "constructionMethod",
    "headCondition",
    "bottomCondition",
    "concreteDiameter",
    "concreteThickness",
    "concreteModulus",
    "steelDiameter",
    "steelThickness",
    "steelModulus",
    "steelCorThickness",
    "compositeTypeCheck",
    "compStartLength",
    "compPileType",
    "compConcreteDiameter",
    "compConcreteThickness",
    "compConcreteModulus",
    "compSteelDiameter",
    "compSteelThickness",
    "compSteelModulus",
    "compSteelCorThickness",
    "reinforcedMethod",
    "reinforcedStartLength",
    "reinforcedEndLength",
    "outerThickness",
    "outerModulus",
    "innerThickness",
    "innerModulus",
    "majorRefValue",
    "minorRefValue",
    "majorStartPoint",
    "minorStartPoint",
    "majorSpace",
    "majorDegree",
    "minorDegree",
    "PileNums",
  ];

  return data.piletableData.every((pile: any) =>
    requiredFields.every((field) => field in pile)
  );
};

export { convertPileLegacyToCurrent, validateLegacyData };
