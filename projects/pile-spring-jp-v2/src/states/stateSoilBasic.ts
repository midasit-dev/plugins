import { atom } from "recoil";

export interface SoilBasic {
  groundLevel: number;
  waterLevel: number;
  calVsiState: boolean;
  liquefactionState: boolean;
  slopeEffectState: boolean;
  groupEffectState: boolean;
  groupEffectValue: number;
}

export const defaultSoilBasic: SoilBasic = {
  groundLevel: 0,
  waterLevel: 0,
  calVsiState: false,
  liquefactionState: false,
  slopeEffectState: false,
  groupEffectState: false,
  groupEffectValue: 1,
};

export const soilBasicState = atom<SoilBasic>({
  key: "soilBasicState",
  default: defaultSoilBasic,
});
