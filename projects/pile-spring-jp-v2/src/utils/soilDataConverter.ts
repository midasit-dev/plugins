import { SoilBasic, SoilTable } from "../states";

interface LegacySoilBasic {
  groundLevel: string | number;
  waterLevel: string | number;
  calVsiState: boolean;
  liquefactionState: boolean;
  slopeEffectState: boolean;
  groupEffectState: boolean;
  groupEffectValue: string | number;
}

export const convertSoilBasicLegacyToCurrent = (
  legacyData: LegacySoilBasic
): SoilBasic => {
  const basicData = {
    groundLevel: Number(legacyData.groundLevel),
    waterLevel: Number(legacyData.waterLevel),
    calVsiState: legacyData.calVsiState,
    liquefactionState: legacyData.liquefactionState,
    slopeEffectState: legacyData.slopeEffectState,
    groupEffectState: legacyData.groupEffectState,
    groupEffectValue: Number(legacyData.groupEffectValue),
  };
  return basicData;
};

interface LegacySoilTable {
  id: number;
  LayerNo: number;
  LayerType: string;
  LayerDepth: string | number;
  Depth: string | number;
  AvgNValue: string | number;
  c: string | number;
  pi: string | number;
  gamma: string | number;
  aE0: string | number;
  aE0_Seis: string | number;
  vd: string | number;
  Vsi: string | number;
  ED: string | number;
  DE: string | number;
  Length: string | number;
}

export const convertSoilTableLegacyToCurrent = (
  legacyData: LegacySoilTable[]
): SoilTable[] => {
  return legacyData.map((item) => ({
    id: item.id,
    layerNo: item.LayerNo,
    layerType: item.LayerType,
    layerDepth: Number(item.LayerDepth),
    depth: Number(item.Depth),
    avgNvalue: Number(item.AvgNValue),
    c: Number(item.c),
    pi: Number(item.pi),
    gamma: Number(item.gamma),
    aE0: Number(item.aE0),
    aE0_Seis: Number(item.aE0_Seis),
    vd: Number(item.vd),
    Vsi: Number(item.Vsi),
    ED: Number(item.ED),
    DE: Number(item.DE),
    length: Number(item.Length),
  }));
};
