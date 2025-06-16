import { atom } from "recoil";

export interface PileReinforced {
  id: number;
  checked: boolean;
  method: string;
  start: number;
  end: number;
  thickness: number;
  modulus: number;
}

export const defaultPileReinforced: PileReinforced[] = [
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
  },
];

export const pileReinforcedState = atom<PileReinforced[]>({
  key: "pileReinforcedState",
  default: defaultPileReinforced,
});
