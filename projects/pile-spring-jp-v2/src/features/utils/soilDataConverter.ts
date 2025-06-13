import { SoilBasic, SoilResistance, SoilTableRowData } from "../../states";

interface LegacySoilBasic {
  groundLevel: string | number;
  waterLevel: string | number;
  calVsiState: boolean;
  liquefactionState: boolean;
  slopeEffectState: boolean;
  groupEffectState: boolean;
  groupEffectValue: string | number;
}

const convertSoilBasicLegacyToCurrent = (
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
  LayerDepth: number;
  Depth: string | number;
  AvgNValue: string | number;
  c: string | number;
  pi: string | number;
  gamma: string | number;
  aE0: string | number;
  aE0_Seis: string | number;
  vd: number;
  Vsi: number;
  ED: number;
  DE: number;
  Length: number;
}

const convertSoilTableLegacyToCurrent = (
  legacyData: LegacySoilTable[]
): SoilTableRowData[] => {
  return legacyData.map((item) => ({
    id: item.id,
    layerNo: item.LayerNo,
    layerType: item.LayerType,
    layerDepth: item.LayerDepth,
    depth: Number(item.Depth),
    avgNvalue: Number(item.AvgNValue),
    c: Number(item.c),
    pi: Number(item.pi),
    gamma: Number(item.gamma),
    aE0: Number(item.aE0),
    aE0_Seis: Number(item.aE0_Seis),
    vd: item.vd,
    Vsi: item.Vsi,
    ED: item.ED,
    DE: item.DE,
    legnth: item.Length,
  }));
};

export { convertSoilBasicLegacyToCurrent, convertSoilTableLegacyToCurrent };
