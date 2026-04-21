/**
 * @fileoverview v2 말뚝 도메인 데이터를 Python 계산 스크립트(py_main.py)가
 * 기대하는 v1 호환 형식(`piletableData` 배열)으로 변환합니다.
 * 각 말뚝 항목에는 말뚝별 topLevel / headCondition / bottomCondition 값을
 * 주입하여, 기초 저면이 단차가 있는 기초에서도 계산이 말뚝 단위 값으로
 * 동작하도록 합니다.
 */

import { PileDataItem, PileSection, PileReinforced } from "../../types/typePileDomain";
import { SoilTable } from "../../types/typeSoilDomain";

// Python 스크립트가 기대하는 단일 말뚝 레코드의 형태
export interface LegacyPileCalcItem {
  // 기본 정보 (per-pile)
  pileName: string;
  pileLength: number;
  pileType: string;
  constructionMethod: string;
  headCondition: string;
  bottomCondition: string;
  topLevel: number;

  // 상부(top) 단면
  concreteDiameter: number;
  concreteThickness: number;
  concreteModulus: number;
  steelDiameter: number;
  steelThickness: number;
  steelModulus: number;
  steelCorThickness: number;

  // 복합(compo) 단면
  compositeTypeCheck: boolean;
  compStartLength: number;
  compPileType: string;
  compConcreteDiameter: number;
  compConcreteThickness: number;
  compConcreteModulus: number;
  compSteelDiameter: number;
  compSteelThickness: number;
  compSteelModulus: number;
  compSteelCorThickness: number;

  // 보강 정보
  reinforcedMethod: string;
  reinforcedStartLength: number;
  reinforcedEndLength: number;
  outerThickness: number;
  outerModulus: number;
  innerThickness: number;
  innerModulus: number;

  // 배치 정보
  majorRefValue: number;
  minorRefValue: number;
  majorStartPoint: number;
  minorStartPoint: number;
  majorSpace: string;
  majorDegree: string;
  minorDegree: string;
  PileNums: number;
}

// v2 토양 테이블을 v1 Python 계산용 키로 변환
export interface LegacySoilCalcItem {
  id: number;
  LayerNo: number;
  LayerType: string;
  LayerDepth: number;
  Depth: number;
  AvgNValue: number;
  gamma: number;
  aE0: number;
  aE0_Seis: number;
  vd: number;
  Vsi: number;
  ED: number;
  DE: number;
  Length: number;
}

// 참조점 문자열을 v1 숫자형 플래그로 변환
// v1 규약: Ref_Point_Right(또는 Top) = 1, Ref_Point_Left(또는 Bottom) = 2
const refPointToValue = (ref: string, axis: "X" | "Y"): number => {
  if (axis === "X") {
    return ref === "Ref_Point_Right" ? 1 : 2;
  }
  return ref === "Ref_Point_Top" ? 1 : 2;
};

// 숫자 배열을 Python extract_numbers가 파싱 가능한 comma 구분 문자열로 변환
const arrayToString = (values: number[]): string => values.map((v) => String(v)).join(", ");

// 체크된 보강재에서 v1 형식 보강 정보를 도출
const resolveReinforcedInfo = (reinforced: PileReinforced[]) => {
  const outer = reinforced.find((r) => r.method === "Reinforced_Method_Outer");
  const inner = reinforced.find((r) => r.method === "Reinforced_Method_Inner");

  const outerChecked = !!outer?.checked;
  const innerChecked = !!inner?.checked;

  let reinforcedMethod = "Reinforced_Method_Outer";
  if (outerChecked && innerChecked) {
    reinforcedMethod = "Reinforced_Method_Inner_Outer";
  } else if (!outerChecked && innerChecked) {
    reinforcedMethod = "Reinforced_Method_Inner";
  }

  const baseRef = outer ?? inner ?? {
    start: 0,
    end: 0,
    thickness: 0,
    modulus: 0,
  };

  return {
    reinforcedMethod,
    reinforcedStartLength: outerChecked || innerChecked ? Number(baseRef.start) : 0,
    reinforcedEndLength: outerChecked || innerChecked ? Number(baseRef.end) : 0,
    outerThickness: outerChecked ? Number(outer?.thickness ?? 0) : 0,
    outerModulus: outerChecked ? Number(outer?.modulus ?? 0) : 0,
    innerThickness: innerChecked ? Number(inner?.thickness ?? 0) : 0,
    innerModulus: innerChecked ? Number(inner?.modulus ?? 0) : 0,
  };
};

// 4개 섹션 슬롯 중 체크된 섹션을 top/comp 두 개의 v1 단면으로 압축
// - 체크된 섹션이 1개 (id=1만)면 단일 말뚝
// - 체크된 섹션이 2개 이상이면 첫 번째를 top, 두 번째를 comp로 사용하고
//   comp 시작 깊이는 top 섹션의 길이로 둔다.
const resolveSectionInfo = (sections: PileSection[]) => {
  const checked = sections.filter((s) => s.checked);
  const top = checked[0] ?? sections[0];
  const comp = checked[1];

  const compositeTypeCheck = !!comp;
  const compStartLength = comp ? Number(top?.length ?? 0) : 0;

  return {
    pileType: top?.pileType ?? "Cast_In_Situ",
    concreteDiameter: Number(top?.concrete.diameter ?? 0),
    concreteThickness: Number(top?.concrete.thickness ?? 0),
    concreteModulus: Number(top?.concrete.modulus ?? 0),
    steelDiameter: Number(top?.steel.diameter ?? 0),
    steelThickness: Number(top?.steel.thickness ?? 0),
    steelModulus: Number(top?.steel.modulus ?? 0),
    steelCorThickness: Number(top?.steel.cor_thickness ?? 0),

    compositeTypeCheck,
    compStartLength: compositeTypeCheck ? compStartLength : 0,

    compPileType: comp?.pileType ?? top?.pileType ?? "Cast_In_Situ",
    compConcreteDiameter: Number(comp?.concrete.diameter ?? 0),
    compConcreteThickness: Number(comp?.concrete.thickness ?? 0),
    compConcreteModulus: Number(comp?.concrete.modulus ?? 0),
    compSteelDiameter: Number(comp?.steel.diameter ?? 0),
    compSteelThickness: Number(comp?.steel.thickness ?? 0),
    compSteelModulus: Number(comp?.steel.modulus ?? 0),
    compSteelCorThickness: Number(comp?.steel.cor_thickness ?? 0),
  };
};

// v2 PileDataItem[] → Python 계산용 v1 호환 레코드 배열
export const convertPileDataForCalc = (
  pileDataList: PileDataItem[]
): LegacyPileCalcItem[] => {
  return pileDataList.map((item) => {
    const initSet = item.initSetData;
    const xLoc = item.locationData.find((l) => l.loc_title === "Pile_X_Dir") ?? item.locationData[0];
    const yLoc = item.locationData.find((l) => l.loc_title === "Pile_Y_Dir") ?? item.locationData[1];

    const sectionInfo = resolveSectionInfo(item.sectionData);
    const reinforcedInfo = resolveReinforcedInfo(item.reinforcedData);

    return {
      pileName: initSet.pileName,
      pileLength: Number(initSet.pileLength),
      topLevel: Number(initSet.topLevel),
      constructionMethod: initSet.constructionMethod,
      headCondition: initSet.headCondition,
      bottomCondition: initSet.bottomCondition,

      ...sectionInfo,
      ...reinforcedInfo,

      majorRefValue: refPointToValue(xLoc?.ref_point ?? "Ref_Point_Right", "X"),
      minorRefValue: refPointToValue(yLoc?.ref_point ?? "Ref_Point_Top", "Y"),
      majorStartPoint: Number(xLoc?.loc ?? 0),
      minorStartPoint: Number(yLoc?.loc ?? 0),
      majorSpace: arrayToString(xLoc?.space ?? []),
      majorDegree: arrayToString(xLoc?.angle ?? []),
      minorDegree: arrayToString(yLoc?.angle ?? []),
      PileNums: item.pileNumber,
    };
  });
};

// v2 SoilTable[] → Python 계산용 v1 호환 레코드 배열
export const convertSoilDataForCalc = (soilLayers: SoilTable[]): LegacySoilCalcItem[] => {
  return soilLayers.map((layer) => ({
    id: layer.id,
    LayerNo: layer.layerNo,
    LayerType: layer.layerType,
    LayerDepth: Number(layer.layerDepth),
    Depth: Number(layer.depth),
    AvgNValue: Number(layer.avgNvalue),
    gamma: Number(layer.gamma),
    aE0: Number(layer.aE0),
    aE0_Seis: Number(layer.aE0_Seis),
    vd: Number(layer.vd),
    Vsi: Number(layer.Vsi),
    ED: Number(layer.ED),
    DE: Number(layer.DE),
    Length: Number(layer.length),
  }));
};

// 기준 TopLevel: 말뚝별 topLevel의 최대값을 scalar 인수로 전달해 레거시 호환성 확보
export const resolveBaseTopLevel = (pileDataList: PileDataItem[]): number => {
  const topLevels = pileDataList
    .map((p) => Number(p.initSetData.topLevel))
    .filter((v) => !Number.isNaN(v));
  return topLevels.length > 0 ? Math.max(...topLevels) : 0;
};
