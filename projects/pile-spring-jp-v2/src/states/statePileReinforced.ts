import { atom } from "recoil";

export interface PileReinforcedRowData {
  id: number;
  checked: boolean;
  reinforced_method: string;
  reinforced_start: string;
  reinforced_end: string;
  reinforced_thickness: string;
  reinforced_modulus: string;
}

export const pileReinforcedState = atom<PileReinforcedRowData[]>({
  key: "pileReinforcedState",
  default: [
    {
      id: 1,
      checked: true,
      reinforced_method: "Reinforced_Method_Outer",
      reinforced_start: "0",
      reinforced_end: "0",
      reinforced_thickness: "",
      reinforced_modulus: "",
    },
    {
      id: 2,
      checked: false,
      reinforced_method: "Reinforced_Method_Inner",
      reinforced_start: "0",
      reinforced_end: "0",
      reinforced_thickness: "",
      reinforced_modulus: "",
    },
  ],
});
