import { atom } from "recoil";

interface SoilResistance {
  useResistance: boolean;
  clayFrictionMethod: string;
  tipCapacity: number;
  groundSlopeAngle: number;
  groundSurfaceLoad: number;
}

export const soilResistance = atom<SoilResistance>({
  key: "soilResistance",
  default: {
    useResistance: false,
    clayFrictionMethod: "Calculate_by_N",
    tipCapacity: 0,
    groundSlopeAngle: 0,
    groundSurfaceLoad: 0,
  },
});
