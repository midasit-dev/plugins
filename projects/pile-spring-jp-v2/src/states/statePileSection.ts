import { atom } from "recoil";

export type PileType =
  | "Cast_In_Situ"
  | "Steel_Pile"
  | "Soil_Cement_Pile"
  | "SC_Pile"
  | "PHC_Pile";

export const PILE_SECTION_CONSTANTS = {
  DEFAULT_LENGTH: 10,
  DEFAULT_DIAMETER: 0,
  DEFAULT_THICKNESS: 0,
  DEFAULT_MODULUS: 0,
} as const;

// 인터페이스 정의
export interface PileSection {
  id: number;
  checked: boolean;
  name: string;
  pileType: PileType;
  length: number;
  concrete_diameter: number;
  concrete_thickness: number;
  concrete_modulus: number;
  steel_diameter: number;
  steel_thickness: number;
  steel_modulus: number;
  steel_cor_thickness: number;
}

export const defaultPileSection: PileSection[] = [
  {
    id: 1,
    checked: true,
    name: "Pile_Category_Basic",
    pileType: "Cast_In_Situ",
    length: PILE_SECTION_CONSTANTS.DEFAULT_LENGTH,
    concrete_diameter: PILE_SECTION_CONSTANTS.DEFAULT_DIAMETER,
    concrete_thickness: PILE_SECTION_CONSTANTS.DEFAULT_THICKNESS,
    concrete_modulus: PILE_SECTION_CONSTANTS.DEFAULT_MODULUS,
    steel_diameter: PILE_SECTION_CONSTANTS.DEFAULT_DIAMETER,
    steel_thickness: PILE_SECTION_CONSTANTS.DEFAULT_THICKNESS,
    steel_modulus: PILE_SECTION_CONSTANTS.DEFAULT_MODULUS,
    steel_cor_thickness: PILE_SECTION_CONSTANTS.DEFAULT_THICKNESS,
  },
  {
    id: 2,
    checked: false,
    name: "Pile_Category_Sub1",
    pileType: "Cast_In_Situ",
    length: PILE_SECTION_CONSTANTS.DEFAULT_LENGTH,
    concrete_diameter: PILE_SECTION_CONSTANTS.DEFAULT_DIAMETER,
    concrete_thickness: PILE_SECTION_CONSTANTS.DEFAULT_THICKNESS,
    concrete_modulus: PILE_SECTION_CONSTANTS.DEFAULT_MODULUS,
    steel_diameter: PILE_SECTION_CONSTANTS.DEFAULT_DIAMETER,
    steel_thickness: PILE_SECTION_CONSTANTS.DEFAULT_THICKNESS,
    steel_modulus: PILE_SECTION_CONSTANTS.DEFAULT_MODULUS,
    steel_cor_thickness: PILE_SECTION_CONSTANTS.DEFAULT_THICKNESS,
  },
  {
    id: 3,
    checked: false,
    name: "Pile_Category_Sub2",
    pileType: "Cast_In_Situ",
    length: PILE_SECTION_CONSTANTS.DEFAULT_LENGTH,
    concrete_diameter: PILE_SECTION_CONSTANTS.DEFAULT_DIAMETER,
    concrete_thickness: PILE_SECTION_CONSTANTS.DEFAULT_THICKNESS,
    concrete_modulus: PILE_SECTION_CONSTANTS.DEFAULT_MODULUS,
    steel_diameter: PILE_SECTION_CONSTANTS.DEFAULT_DIAMETER,
    steel_thickness: PILE_SECTION_CONSTANTS.DEFAULT_THICKNESS,
    steel_modulus: PILE_SECTION_CONSTANTS.DEFAULT_MODULUS,
    steel_cor_thickness: PILE_SECTION_CONSTANTS.DEFAULT_THICKNESS,
  },
  {
    id: 4,
    checked: false,
    name: "Pile_Category_Sub3",
    pileType: "Cast_In_Situ",
    length: PILE_SECTION_CONSTANTS.DEFAULT_LENGTH,
    concrete_diameter: PILE_SECTION_CONSTANTS.DEFAULT_DIAMETER,
    concrete_thickness: PILE_SECTION_CONSTANTS.DEFAULT_THICKNESS,
    concrete_modulus: PILE_SECTION_CONSTANTS.DEFAULT_MODULUS,
    steel_diameter: PILE_SECTION_CONSTANTS.DEFAULT_DIAMETER,
    steel_thickness: PILE_SECTION_CONSTANTS.DEFAULT_THICKNESS,
    steel_modulus: PILE_SECTION_CONSTANTS.DEFAULT_MODULUS,
    steel_cor_thickness: PILE_SECTION_CONSTANTS.DEFAULT_THICKNESS,
  },
];

export const pileSectionState = atom<PileSection[]>({
  key: "pileSectionState",
  default: defaultPileSection,
});
