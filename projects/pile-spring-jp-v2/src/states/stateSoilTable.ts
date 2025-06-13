import { atom } from "recoil";

// 인터페이스 정의
export interface SoilTableRowData {
  id: number;
  layerNo: number;
  layerType: string;
  layerDepth: number;
  depth: number;
  avgNvalue: number;
  c: number;
  pi: number;
  gamma: number;
  aE0: number;
  aE0_Seis: number;
  vd: number;
  Vsi: number;
  ED: number;
  DE: number;
  legnth: number;
}

export const soilTableState = atom<SoilTableRowData[]>({
  key: "soilTableState",
  default: [],
});
