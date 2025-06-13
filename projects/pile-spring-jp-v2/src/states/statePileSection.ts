import { atom } from "recoil";

// 인터페이스 정의
export interface PileRowData {
  id: number;
  checked: boolean;
  name: string;
  pileType: string;
  length: number;
  concrete_diameter: number;
  concrete_thickness: number;
  concrete_modulus: number;
  steel_diameter: number;
  steel_thickness: number;
  steel_modulus: number;
  steel_cor_thickness: number;
}

export const defaultPileSectionData: PileRowData[] = [
  {
    id: 1,
    checked: true,
    name: "Pile_Category_Basic",
    pileType: "Cast_In_Situ",
    length: 10,
    // startPoint: 0,
    // endPoint: 6.0,
    concrete_diameter: 0,
    concrete_thickness: 0,
    concrete_modulus: 0,
    steel_diameter: 0,
    steel_thickness: 0,
    steel_modulus: 0,
    steel_cor_thickness: 0,
  },
  {
    id: 2,
    checked: false,
    name: "Pile_Category_Sub1",
    pileType: "Cast_In_Situ",
    length: 10,
    // startPoint: 6.0,
    // endPoint: 12.0,
    concrete_diameter: 0,
    concrete_thickness: 0,
    concrete_modulus: 0,
    steel_diameter: 0,
    steel_thickness: 0,
    steel_modulus: 0,
    steel_cor_thickness: 0,
  },
  {
    id: 3,
    checked: false,
    name: "Pile_Category_Sub2",
    pileType: "Cast_In_Situ",
    length: 10,
    // startPoint: 12.0,
    // endPoint: 18.0,
    concrete_diameter: 0,
    concrete_thickness: 0,
    concrete_modulus: 0,
    steel_diameter: 0,
    steel_thickness: 0,
    steel_modulus: 0,
    steel_cor_thickness: 0,
  },
  {
    id: 4,
    checked: false,
    name: "Pile_Category_Sub3",
    pileType: "Cast_In_Situ",
    length: 10.0,
    // startPoint: 18.0,
    // endPoint: 24.0,
    concrete_diameter: 0,
    concrete_thickness: 0,
    concrete_modulus: 0,
    steel_diameter: 0,
    steel_thickness: 0,
    steel_modulus: 0,
    steel_cor_thickness: 0,
  },
];

export const pileSectionState = atom<PileRowData[]>({
  key: "pileSectionState",
  default: defaultPileSectionData,
});
