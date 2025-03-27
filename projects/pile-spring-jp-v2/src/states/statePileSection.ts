import { atom } from "recoil";

export const varPileType = atom({
  key: "varPileType",
  default: ["Cast_In_Situ", "Cast_In_Situ", "Cast_In_Situ", "Cast_In_Situ"],
});

export const varPileLength = atom({
  key: "varPileLength",
  default: [10, 10, 10, 10],
});

export const Concrete_Diameter = atom({
  key: "Concrete_Diameter",
  default: [0, 0, 0, 0],
});

export const Concrete_Thickness = atom({
  key: "Concrete_Thickness",
  default: [0, 0, 0, 0],
});

export const Concrete_Modulus = atom({
  key: "Concrete_Modulus",
  default: [0, 0, 0, 0],
});

export const Steel_Diameter = atom({
  key: "SteelCase_Diameter",
  default: [0, 0, 0, 0],
});

export const Steel_Thickness = atom({
  key: "SteelCase_Thickness",
  default: [0, 0, 0, 0],
});

export const Steel_Modulus = atom({
  key: "SteelCase_Modulus",
  default: [0, 0, 0, 0],
});

export const Steel_Cor_Thickness = atom({
  key: "Steel_Cor_Thickness",
  default: [0, 0, 0, 0],
});

export const pileSectionState = atom({
  key: "pileSectionState",
  default: [
    {
      id: 1,
      checked: true,
      name: "기본",
      pileType: "Cast_In_Situ",
      length: 6.0,
      startPoint: 0,
      endPoint: 6.0,
      concrete_diameter: 6.0,
      concrete_thickness: 6.0,
      concrete_modulus: 6.0,
      steel_diameter: 6.0,
      steel_thickness: 6.0,
      steel_modulus: 6.0,
      steel_cor_thickness: 6.0,
    },
    {
      id: 2,
      checked: true,
      name: "하부 #1",
      pileType: "Cast_In_Situ",
      length: 6.0,
      startPoint: 6.0,
      endPoint: 12.0,
      concrete_diameter: 6.0,
      concrete_thickness: 6.0,
      concrete_modulus: 6.0,
      steel_diameter: 6.0,
      steel_thickness: 6.0,
      steel_modulus: 6.0,
      steel_cor_thickness: 6.0,
    },
    {
      id: 3,
      checked: true,
      name: "하부 #2",
      pileType: "Cast_In_Situ",
      length: 6.0,
      startPoint: 12.0,
      endPoint: 18.0,
      concrete_diameter: 6.0,
      concrete_thickness: 6.0,
      concrete_modulus: 6.0,
      steel_diameter: 6.0,
      steel_thickness: 6.0,
      steel_modulus: 6.0,
      steel_cor_thickness: 6.0,
    },
    {
      id: 4,
      checked: true,
      name: "하부 #3",
      pileType: "Cast_In_Situ",
      length: 6.0,
      startPoint: 18.0,
      endPoint: 24.0,
      concrete_diameter: 6.0,
      concrete_thickness: 6.0,
      concrete_modulus: 6.0,
      steel_diameter: 6.0,
      steel_thickness: 6.0,
      steel_modulus: 6.0,
      steel_cor_thickness: 6.0,
    },
  ],
});
