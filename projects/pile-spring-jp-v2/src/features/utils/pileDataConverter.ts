import { PileDataItem } from "../../states/statePileData";
import { PileInitSetData } from "../../states/statePileInitSet";
import { PileLocationRowData } from "../../states/statePileLocation";
import { PileReinforcedRowData } from "../../states/statePileReinforced";
import { PileRowData } from "../../states/statePileSection";
import { PileBasicDimensions } from "../../states/statePileBasicDim";
import { parseSpaceInput, formatSpaceDisplay } from "./spacingConverter";

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
  majorDegree: string | number;
  minorDegree: string | number;
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

// Section 데이터는 기존과 구조가 많이 달라져서 별도로 처리
const convertLegacySectionData = (pile: LegacyPileData): PileRowData[] => {
  const sections: PileRowData[] = [];

  // 하부 말뚝이 있는 경우 추가
  if (pile.compositeTypeCheck) {
    sections.push(
      {
        id: 1,
        checked: true,
        name: "Pile_Category_Basic",
        pileType: pile.pileType,
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
        pileType: pile.compPileType,
        length: Number(pile.pileLength) - Number(pile.compStartLength),
        concrete_diameter: Number(pile.compConcreteDiameter),
        concrete_thickness: Number(pile.compConcreteThickness),
        concrete_modulus: Number(pile.compConcreteModulus),
        steel_diameter: Number(pile.compSteelDiameter),
        steel_thickness: Number(pile.compSteelThickness),
        steel_modulus: Number(pile.compSteelModulus),
        steel_cor_thickness: Number(pile.compSteelCorThickness),
      }
    );
  } else {
    sections.push({
      id: 1,
      checked: true,
      name: "Pile_Category_Basic",
      pileType: pile.pileType,
      length: Number(pile.pileLength),
      concrete_diameter: Number(pile.concreteDiameter),
      concrete_thickness: Number(pile.concreteThickness),
      concrete_modulus: Number(pile.concreteModulus),
      steel_diameter: Number(pile.steelDiameter),
      steel_thickness: Number(pile.steelThickness),
      steel_modulus: Number(pile.steelModulus),
      steel_cor_thickness: Number(pile.steelCorThickness),
    });
  }

  return sections;
};

const convertLegacyReinforcedData = (
  pile: LegacyPileData
): PileReinforcedRowData[] => {
  const reinforcedData: PileReinforcedRowData[] = [];

  if (
    Number(pile.reinforcedStartLength) === 0 &&
    Number(pile.reinforcedEndLength) === 0
  ) {
    // state에서 default 값으로 설정
    reinforcedData.push(
      {
        id: 1,
        checked: false,
        reinforced_method: "Reinforced_Method_Outer",
        reinforced_start: 0,
        reinforced_end: 0,
        reinforced_thickness: 0,
        reinforced_modulus: 0,
      },
      {
        id: 2,
        checked: false,
        reinforced_method: "Reinforced_Method_Inner",
        reinforced_start: 0,
        reinforced_end: 0,
        reinforced_thickness: 0,
        reinforced_modulus: 0,
      }
    );
  } else {
    reinforcedData.push(
      {
        id: 1,
        checked: true,
        reinforced_method: pile.reinforcedMethod,
        reinforced_start: Number(pile.reinforcedStartLength),
        reinforced_end: Number(pile.reinforcedEndLength),
        reinforced_thickness: Number(pile.outerThickness),
        reinforced_modulus: Number(pile.outerModulus),
      },
      {
        id: 2,
        checked:
          pile.reinforcedMethod === "Reinforced_Method_Inner_Outer"
            ? true
            : false,
        reinforced_method: "Reinforced_Method_Inner",
        reinforced_start: Number(pile.reinforcedStartLength),
        reinforced_end: Number(pile.reinforcedEndLength),
        reinforced_thickness: Number(pile.innerThickness),
        reinforced_modulus: Number(pile.innerModulus),
      }
    );
  }

  return reinforcedData;
};

export const convertLegacyToCurrent = (
  legacyData: LegacyJsonData
): { pileData: PileDataItem[]; basicDimensions: PileBasicDimensions } => {
  const pileData = legacyData.piletableData.map((pile, index) => ({
    id: index + 1,
    pileName: pile.pileName,
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
        space: parseSpaceInput(pile.majorSpace),
        angle: Number(pile.majorDegree),
      },
      {
        id: 2,
        loc_title: "Pile_Y_Dir",
        ref_point:
          pile.minorRefValue === 1 ? "Ref_Point_Bottom" : "Ref_Point_Top",
        loc: Number(pile.minorStartPoint),
        space: parseSpaceInput(pile.majorSpace),
        angle: Number(pile.minorDegree),
      },
    ],
    reinforcedData: convertLegacyReinforcedData(pile),
    sectionData: convertLegacySectionData(pile),
  }));

  const basicDimensions = {
    foundationWidth: Number(legacyData.foundationWidth),
    sideLength: Number(legacyData.sideLength),
    forcePointX: Number(legacyData.forcepointX),
    forcePointY: Number(legacyData.forcepointY),
  };

  return { pileData, basicDimensions };
};

// 데이터 유효성 검사 함수
export const validateLegacyData = (data: any): boolean => {
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
