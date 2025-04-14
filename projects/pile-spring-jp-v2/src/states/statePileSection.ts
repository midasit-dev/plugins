import { atom } from "recoil";

// 인터페이스 정의
export interface PileRowData {
  id: number;
  checked: boolean;
  name: string;
  pileType: string;
  length: string;
  // startPoint: number;
  // endPoint: number;
  concrete_diameter: string;
  concrete_thickness: string;
  concrete_modulus: string;
  steel_diameter: string;
  steel_thickness: string;
  steel_modulus: string;
  steel_cor_thickness: string;
}

export const pileSectionState = atom<PileRowData[]>({
  key: "pileSectionState",
  default: [
    {
      id: 1,
      checked: true,
      name: "Pile_Category_Basic",
      pileType: "Cast_In_Situ",
      length: "10.0",
      // startPoint: 0,
      // endPoint: 6.0,
      concrete_diameter: "",
      concrete_thickness: "",
      concrete_modulus: "",
      steel_diameter: "",
      steel_thickness: "",
      steel_modulus: "",
      steel_cor_thickness: "",
    },
    {
      id: 2,
      checked: false,
      name: "Pile_Category_Sub1",
      pileType: "Cast_In_Situ",
      length: "10.0",
      // startPoint: 6.0,
      // endPoint: 12.0,
      concrete_diameter: "",
      concrete_thickness: "",
      concrete_modulus: "",
      steel_diameter: "",
      steel_thickness: "",
      steel_modulus: "",
      steel_cor_thickness: "",
    },
    {
      id: 3,
      checked: false,
      name: "Pile_Category_Sub2",
      pileType: "Cast_In_Situ",
      length: "10.0",
      // startPoint: 12.0,
      // endPoint: 18.0,
      concrete_diameter: "",
      concrete_thickness: "",
      concrete_modulus: "",
      steel_diameter: "",
      steel_thickness: "",
      steel_modulus: "",
      steel_cor_thickness: "",
    },
    {
      id: 4,
      checked: false,
      name: "Pile_Category_Sub3",
      pileType: "Cast_In_Situ",
      length: "10.0",
      // startPoint: 18.0,
      // endPoint: 24.0,
      concrete_diameter: "",
      concrete_thickness: "",
      concrete_modulus: "",
      steel_diameter: "",
      steel_thickness: "",
      steel_modulus: "",
      steel_cor_thickness: "",
    },
  ],
});
