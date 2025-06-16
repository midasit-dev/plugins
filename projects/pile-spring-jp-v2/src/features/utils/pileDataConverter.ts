import {
  PileDataItem,
  PileReinforced,
  PileSection,
  PileBasicDim,
  defaultPileSection,
  PileType,
} from "../../states";
import { parseSpaceInput } from "./spacingConverter";

interface LegacyPileData {
  pileName: string;
  pileLength: string | number;
  pileType: string;
  constructionMethod: string;
  headCondition: string;
  bottomCondition: string;
  concreteDiameter: string | number;
  concreteThickness: string | number;
  concreteModulus: string | number;
  steelDiameter: string | number;
  steelThickness: string | number;
  steelModulus: string | number;
  steelCorThickness: string | number;
  compositeTypeCheck: boolean;
  compStartLength: string | number;
  compPileType: string;
  compConcreteDiameter: string | number;
  compConcreteThickness: string | number;
  compConcreteModulus: string | number;
  compSteelDiameter: string | number;
  compSteelThickness: string | number;
  compSteelModulus: string | number;
  compSteelCorThickness: string | number;
  reinforcedMethod: string;
  reinforcedStartLength: string | number;
  reinforcedEndLength: string | number;
  outerThickness: string | number;
  outerModulus: string | number;
  innerThickness: string | number;
  innerModulus: string | number;
  majorRefValue: number;
  minorRefValue: number;
  majorStartPoint: string | number;
  minorStartPoint: string | number;
  majorSpace: string;
  majorDegree: string;
  minorDegree: string;
  PileNums: number;
}

interface LegacyJsonData {
  projectName: string;
  piletableData: LegacyPileData[];
  soilData: any[];
  topLevel: string;
  groundLevel: string;
  waterlevel: string;
  groupEffectValue: number;
  slopeEffectState: boolean;
  foundationWidth: string;
  sideLength: string;
  liquefactionState: boolean;
  calVsiState: boolean;
  groupEffectState: boolean;
  forcepointX: string | number;
  forcepointY: string | number;
  language: string;
}

// Section 데이터 처리
const convertLegacySectionData = (pile: LegacyPileData): PileSection[] => {
  const sections: PileSection[] = [];

  // 하부 말뚝이 있는 경우 추가
  if (pile.compositeTypeCheck) {
    sections.push(
      {
        id: 1,
        checked: true,
        name: "Pile_Category_Basic",
        pileType: pile.pileType as PileType,
        length: Number(pile.compStartLength),
        concrete_diameter: Number(pile.concreteDiameter),
        concrete_thickness: Number(pile.concreteThickness),
        concrete_modulus: Number(pile.concreteModulus),
        steel_diameter: Number(pile.steelDiameter),
        steel_thickness: Number(pile.steelThickness),
        steel_modulus: Number(pile.steelModulus),
        steel_cor_thickness: Number(pile.steelCorThickness),
      },
      {
        id: 2,
        checked: true,
        name: "Pile_Category_Sub1",
        pileType: pile.compPileType as PileType,
        length: Number(pile.pileLength) - Number(pile.compStartLength),
        concrete_diameter: Number(pile.compConcreteDiameter),
        concrete_thickness: Number(pile.compConcreteThickness),
        concrete_modulus: Number(pile.compConcreteModulus),
        steel_diameter: Number(pile.compSteelDiameter),
        steel_thickness: Number(pile.compSteelThickness),
        steel_modulus: Number(pile.compSteelModulus),
        steel_cor_thickness: Number(pile.compSteelCorThickness),
      },
      defaultPileSection[2],
      defaultPileSection[3]
    );
  } else {
    sections.push(
      {
        id: 1,
        checked: true,
        name: "Pile_Category_Basic",
        pileType: pile.pileType as PileType,
        length: Number(pile.pileLength),
        concrete_diameter: Number(pile.concreteDiameter),
        concrete_thickness: Number(pile.concreteThickness),
        concrete_modulus: Number(pile.concreteModulus),
        steel_diameter: Number(pile.steelDiameter),
        steel_thickness: Number(pile.steelThickness),
        steel_modulus: Number(pile.steelModulus),
        steel_cor_thickness: Number(pile.steelCorThickness),
      },
      defaultPileSection[1],
      defaultPileSection[2],
      defaultPileSection[3]
    );
  }

  return sections;
};

// Reinforced 데이터 처리
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

// pileData 전체 데이터 변환
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
            pile.majorRefValue === 1 ? "Ref_Point_Left" : "Ref_Point_Right",
          loc: Number(pile.majorStartPoint),
          space: majorSpace,
          angle: adjustAngleArray(majorSpace, majorDegree),
        },
        {
          id: 2,
          loc_title: "Pile_Y_Dir",
          ref_point:
            pile.minorRefValue === 1 ? "Ref_Point_Bottom" : "Ref_Point_Top",
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

// 데이터 유효성 검사 함수
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
