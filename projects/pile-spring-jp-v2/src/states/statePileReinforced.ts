import { atom } from "recoil";

export interface PileReinforcedRowData {
  id: number;
  checked: boolean;
  reinforced_method: string;
  reinforced_start: number;
  reinforced_end: number;
  reinforced_thickness: number;
  reinforced_modulus: number;
}

export const defaultPileReinforcedData: PileReinforcedRowData[] = [
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
  },
];

export const pileReinforcedState = atom<PileReinforcedRowData[]>({
  key: "pileReinforcedState",
  default: defaultPileReinforcedData,
});
