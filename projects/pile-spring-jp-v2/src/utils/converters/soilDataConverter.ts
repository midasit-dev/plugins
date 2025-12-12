/**
 * @fileoverview 레거시 토양 데이터를 현재 구조로 변환하는 유틸리티 모듈
 */

import { SoilBasic, SoilTable } from "../../types/typeSoilDomain";
import { LegacySoilBasic, LegacySoilTable } from "../../types/typeLegacyData";

// 레거시 토양 기본 데이터를 현재 형식으로 변환함
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

// 레거시 토양 테이블 데이터를 현재 형식으로 변환함
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
