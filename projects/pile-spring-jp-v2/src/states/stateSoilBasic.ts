import { atom } from "recoil";

interface SoilBasic {
  groundLevel: number;
  waterLevel: number;
  calVsiState: boolean;
  liquefactionState: boolean;
  slopeEffectState: boolean;
  groupEffectState: boolean;
  groupEffectValue: number;
}

export const soilBasicData = atom<SoilBasic>({
  key: "soilBasicData",
  default: {
    groundLevel: 0,
    waterLevel: 0,
    calVsiState: false,
    liquefactionState: false,
    slopeEffectState: false,
    groupEffectState: false,
    groupEffectValue: 1,
  },
});
