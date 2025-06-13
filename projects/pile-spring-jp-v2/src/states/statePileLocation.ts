import { atom } from "recoil";

export interface PileLocationRowData {
  id: number;
  loc_title: string;
  ref_point: string;
  loc: number;
  space: number[];
  angle: number[];
}

export const defaultPileLocationData: PileLocationRowData[] = [
  {
    id: 1,
    loc_title: "Pile_X_Dir",
    ref_point: "Ref_Point_Right",
    loc: 0,
    space: [],
    angle: [],
  },
  {
    id: 2,
    loc_title: "Pile_Y_Dir",
    ref_point: "Ref_Point_Top",
    loc: 0,
    space: [],
    angle: [],
  },
];

export const pileLocationState = atom<PileLocationRowData[]>({
  key: "pileLocationState",
  default: defaultPileLocationData,
});
