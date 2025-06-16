import { atom } from "recoil";

export interface SoilResistance {
  useResistance: boolean;
  clayFrictionMethod: string;
  tipCapacity: number;
  groundSlopeAngle: number;
  groundSurfaceLoad: number;
}

export const defaultSoilResistance: SoilResistance = {
  useResistance: false,
  clayFrictionMethod: "Calculate_by_N",
  tipCapacity: 0,
  groundSlopeAngle: 0,
  groundSurfaceLoad: 0,
};

export const soilResistanceState = atom<SoilResistance>({
  key: "soilResistanceState",
  default: defaultSoilResistance,
});
