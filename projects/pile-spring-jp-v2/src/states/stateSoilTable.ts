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

export const defaultRowData: SoilTableRowData = {
  id: 1,
  layerNo: 1,
  layerType: "SoilType_Clay",
  layerDepth: 0,
  depth: 10,
  avgNvalue: 10,
  c: 0,
  pi: 0,
  gamma: 18,
  aE0: 14000,
  aE0_Seis: 28000,
  vd: 0.5,
  Vsi: 0,
  ED: 0,
  DE: 1,
  legnth: 1,
};

export const soilTableData = atom<SoilTableRowData[]>({
  key: "soilTableState",
  default: [],
});
