import { atom } from "recoil";
import { isLargerThanZero } from "../utils";

//if true, it is Valid
export const VarValids = atom({
  key: "Errors",
  default: {
    VarFunctionName: (value: any) => value !== "",
    VarDesignSpectrum: (value: any) => true,
    VarSiteSubSoilClass: (value: any) => true,
    VarReturnPeriodFactor: (value: any) => isLargerThanZero(value),
    VarHazardFactor: (value: any) => isLargerThanZero(value),
    VarDistanceFromNearestMajorFault: (value: any) => isLargerThanZero(value),
    VarDesignDuctilityFactor: (value: any) => isLargerThanZero(value),
    VarMaximumPeriod: (value: any) => isLargerThanZero(value),
    VarSiteClass: (value: any) => true,
    VarSpectralAccelerationSs: (value: any) => isLargerThanZero(value),
    VarSpectralAccelerationS1: (value: any) => isLargerThanZero(value),
    VarImportanceFactor: (value: any) => isLargerThanZero(value),
    VarResponseModificationFactor: (value: any) => isLargerThanZero(value),
    VarLongTranPeriod: (value: any) => isLargerThanZero(value),
    VarProbabilityFactor: (value: any) => isLargerThanZero(value),
    VarPerformanceFactor: (value: any) => isLargerThanZero(value),
    VarSubSiteClass: (value: any) => true,
    VarSpectrumType: (value: any) => true,
    VarMu: (value: any) => isLargerThanZero(value),
    VarAS1170_4_2024_HazardFactor: (value: any) => isLargerThanZero(value),

    VarNF1998_1_2008_SpectrumType: (value: any) => true,
    VarNF1998_1_2008_GroundType: (value: any) => true,
    VarNF1998_1_2008_SeismicZone: (value: any) => true,
    VarNF1998_1_2008_ImportanceFactor: (value: any) => isLargerThanZero(value),
    VarNF1998_1_2008_DampingRatio: (value: any) => isLargerThanZero(value),
    VarNF1998_1_2008_BehaviorFactor: (value: any) => isLargerThanZero(value),
    VarNF1998_1_2008_LowerBoundFactor: (value: any) => isLargerThanZero(value),

    VarUNE1998_1_2011_SpectrumType: (value: any) => true,
    VarUNE1998_1_2011_GroundType: (value: any) => true,
    VarUNE1998_1_2011_PgaValue: (value: any) => isLargerThanZero(value),
    VarUNE1998_1_2011_KFactor: (value: any) => isLargerThanZero(value),
    VarUNE1998_1_2011_CFactor: (value: any) => isLargerThanZero(value),
    VarUNE1998_1_2011_ImportanceFactor: (value: any) => isLargerThanZero(value),
    VarUNE1998_1_2011_DampingRatio: (value: any) => isLargerThanZero(value),
    VarUNE1998_1_2011_BehaviorFactor: (value: any) => isLargerThanZero(value),
    VarUNE1998_1_2011_LowerBoundFactor: (value: any) => isLargerThanZero(value),

    VarCYS1998_1_2004_SpectrumType: (value: any) => true,
    VarCYS1998_1_2004_GroundType: (value: any) => true,
    VarCYS1998_1_2004_SeismicZone: (value: any) => true,
    VarCYS1998_1_2004_ImportanceFactor: (value: any) => isLargerThanZero(value),
    VarCYS1998_1_2004_DampingRatio: (value: any) => isLargerThanZero(value),
    VarCYS1998_1_2004_BehaviorFactor: (value: any) => isLargerThanZero(value),
    VarCYS1998_1_2004_LowerBoundFactor: (value: any) => isLargerThanZero(value),

    VarNBN1998_1_2011_SpectrumType: (value: any) => true,
    VarNBN1998_1_2011_GroundType: (value: any) => true,
    VarNBN1998_1_2011_SeismicZone: (value: any) => true,
    VarNBN1998_1_2011_ImportanceFactor: (value: any) => isLargerThanZero(value),
    VarNBN1998_1_2011_DampingRatio: (value: any) => isLargerThanZero(value),
    VarNBN1998_1_2011_BehaviorFactor: (value: any) => isLargerThanZero(value),
    VarNBN1998_1_2011_LowerBoundFactor: (value: any) => isLargerThanZero(value),

    VarBDS1998_1_2012_SpectrumType: (value: any) => true,
    VarBDS1998_1_2012_GroundType: (value: any) => true,
    VarBDS1998_1_2012_Region: (value: any) => true,
    VarBDS1998_1_2012_PgaValue: (value: any) => isLargerThanZero(value),
    VarBDS1998_1_2012_ImportanceFactor: (value: any) => isLargerThanZero(value),
    VarBDS1998_1_2012_DampingRatio: (value: any) => isLargerThanZero(value),
    VarBDS1998_1_2012_BehaviorFactor: (value: any) => isLargerThanZero(value),
    VarBDS1998_1_2012_LowerBoundFactor: (value: any) => isLargerThanZero(value),

    VarDS1998_1_2020_SpectrumType: (value: any) => true,
    VarDS1998_1_2020_GroundType: (value: any) => true,
    VarDS1998_1_2020_Type: (value: any) => true,
    VarDS1998_1_2020_PgaValue: (value: any) => isLargerThanZero(value),
    VarDS1998_1_2020_ImportanceFactor: (value: any) => isLargerThanZero(value),
    VarDS1998_1_2020_DampingRatio: (value: any) => isLargerThanZero(value),
    VarDS1998_1_2020_BehaviorFactor: (value: any) => isLargerThanZero(value),
    VarDS1998_1_2020_LowerBoundFactor: (value: any) => isLargerThanZero(value),
  },
});

export const VarFuncName = atom({
  key: "VarFuncName",
  default: "",
});

const designSpectrumCodes: Array<[string, number]> = [
  ["NZS 1170.5 (2004)", 1],
  // ["SBC 301-CR (2018)", 2],
  // ["AS 1170.4 (2024)", 3],
  ["NF EN1998-1 (2008)", 4],
  ["UNE EN1998-1 (2011)", 5],
  ["CYS EN1998-1 (2004)", 6],
  ["NBN EN1998-1 (2011)", 7],
  ["BDS 1998-1 (2012)", 8],
  ["DS/EN1998-1 (2020)", 9],
];
export const VarDesignSpectrumList = atom({
  key: "VarDesignSpectrumList",
  default: designSpectrumCodes,
});
export const getDesignSpectrumCodeName = (index: number): string => {
  const codeNames = designSpectrumCodes;
  if (codeNames.length !== 0 && codeNames[index - 1]) {
    return codeNames[index - 1][0];
  } else {
    return "";
  }
};

export const VarDesignSpectrum = atom({
  key: "VarDesignSpectrum",
  default: 5,
});

// NZS 1170.5 (2004)
export const VarSiteSubSoilClass = atom({
  key: "VarSiteSubSoilClass",
  default: "A",
});
// NZS 1170.5 (2004)
export const VarReturnPeriodFactor = atom({
  key: "VarReturnPeriodFactor",
  default: "1.3",
});
// NZS 1170.5 (2004)
export const VarHazardFactor = atom({
  key: "VarHazardFactor",
  default: "0.08",
});
// NZS 1170.5 (2004)
export const VarDistanceFromNearestMajorFault = atom({
  key: "VarDistanceFromNearestMajorFault",
  default: "2.0",
});

export const VarDesignDuctilityFactor = atom({
  key: "VarDesignDuctilityFactor",
  default: "1.5",
});
// all
export const VarMaximumPeriod = atom({
  key: "VarMaximumPeriod",
  default: "6.0",
});

//SBC 301-CR (2018)
export const VarSiteClass = atom({
  key: "VarSiteClass",
  default: "A",
});
//SBC 301-CR (2018)
export const VarSpectralAccelerationSs = atom({
  key: "VarSpectralAccelerationSs",
  default: "0.75",
});
//SBC 301-CR (2018)
export const VarSpectralAccelerationS1 = atom({
  key: "VarSpectralAccelerationS1",
  default: "0.30",
});
//SBC 301-CR (2018)
export const VarImportanceFactor = atom({
  key: "VarImportanceFactor",
  default: "1.0",
});
//SBC 301-CR (2018)
export const VarResponseModificationFactor = atom({
  key: "VarResponseModificationFactor",
  default: "5.0",
});

export const VarLongTranPeriod = atom({
  key: "VarLongTranPeriod",
  default: "4.0",
});

// AS 1170.4 (2024)
export const VarProbabilityFactor = atom({
  key: "VarProbabilityFactor",
  default: "1.0",
});
// AS 1170.4 (2024)
export const VarPerformanceFactor = atom({
  key: "VarPerformanceFactor",
  default: "0.67",
});
// AS 1170.4 (2024)
export const VarSubSiteClass = atom({
  key: "VarSubSiteClass",
  default: "Ae",
});
// AS 1170.4 (2024)
const spectrumType: Array<[string, number]> = [
  ["Horizontal Design Spectrum", 1],
  ["Vertical Design Spectrum", 2],
];
export const VarSpectrumTypeList = atom({
  key: "VarSpectrumTypeList",
  default: spectrumType,
});
// AS 1170.4 (2024)
export const VarSpectrumType = atom({
  key: "VarSpectrumType",
  default: 1,
});
// AS 1170.4 (2024)
export const VarMu = atom({
  key: "VarMu",
  default: "4.0",
});
// AS 1170.4 (2024)
export const VarAS1170_4_2024_HazardFactor = atom({
  key: "VarAS1170_4_2024_HazardFactor",
  default: "0.08",
});

///////////////////////////////////////////////////////////////
// NF 1998-1 (2008)
const nf_spectrumType: Array<[string, number]> = [
  ["Horizontal Elastic Spectrum", 1],
  ["Vertical Elastic Spectrum", 2],
  ["Horizontal Design Spectrum", 3],
  ["Vertical Design Spectrum", 4],
];

export const VarNF1998_1_2008_SpectrumTypeList = atom({
  key: "VarNF1998_1_2008_SpectrumTypeList",
  default: nf_spectrumType,
});

export const VarNF1998_1_2008_SpectrumType = atom({
  key: "VarNF1998_1_2008_SpectrumType",
  default: 1,
});

// NF 1998-1 (2008)
export const VarNF1998_1_2008_GroundType = atom({
  key: "VarNF1998_1_2008_GroundType",
  default: "A",
});

const seismicZone: Array<[string, number]> = [
  ["1 (very low)", 1],
  ["2 (low)", 2],
  ["3 (moderate)", 3],
  ["4 (average)", 4],
  ["5 (strong)", 5],
];

export const VarNF1998_1_2008_SeismicZoneList = atom({
  key: "VarNF1998_1_2008_SeismicZoneList",
  default: seismicZone,
});
// NF 1998-1 (2008)
export const VarNF1998_1_2008_SeismicZone = atom({
  key: "VarNF1998_1_2008_SeismicZone",
  default: "1",
});

// NF 1998-1 (2008)
export const VarNF1998_1_2008_ImportanceFactor = atom({
  key: "VarNF1998_1_2008_ImportanceFactor",
  default: "1.0",
});

// NF 1998-1 (2008)
export const VarNF1998_1_2008_DampingRatio = atom({
  key: "VarNF1998_1_2008_DampingRatio",
  default: "5",
});

// NF 1998-1 (2008)
export const VarNF1998_1_2008_BehaviorFactor = atom({
  key: "VarNF1998_1_2008_BehaviorFactor",
  default: "1.5",
});

// NF 1998-1 (2008)
export const VarNF1998_1_2008_LowerBoundFactor = atom({
  key: "VarNF1998_1_2008_LowerBoundFactor",
  default: "0.2",
});

///////////////////////////////////////////////////////////////
// UNE 1998-1 (2011)
const une_spectrumType: Array<[string, number]> = [
  ["Horizontal Elastic Spectrum", 1],
  ["Vertical Elastic Spectrum", 2],
  ["Horizontal Design Spectrum", 3],
  ["Vertical Design Spectrum", 4],
];

export const VarUNE1998_1_2011_SpectrumTypeList = atom({
  key: "VarUNE1998_1_2011_SpectrumTypeList",
  default: une_spectrumType,
});

export const VarUNE1998_1_2011_SpectrumType = atom({
  key: "VarUNE1998_1_2011_SpectrumType",
  default: 1,
});

const une_groundType: [string, string][] = [
  ["A", "A"],
  ["B", "B"],
  ["C", "C"],
  ["D", "D"],
];

export const VarUNE1998_1_2011_GroundTypeList = atom<[string, string][]>({
  key: "VarUNE1998_1_2011_GroundTypeList",
  default: une_groundType,
});

export const VarUNE1998_1_2011_GroundType = atom({
  key: "VarUNE1998_1_2011_GroundType",
  default: "A",
});

export const VarUNE1998_1_2011_PgaValue = atom({
  key: "VarUNE1998_1_2011_PgaValue",
  default: "0.040",
});

export const VarUNE1998_1_2011_KFactor = atom({
  key: "VarUNE1998_1_2011_KFactor",
  default: "1.0",
});

export const VarUNE1998_1_2011_CFactor = atom({
  key: "VarUNE1998_1_2011_CFactor",
  default: "1.0",
});

// UNE 1998-1 (2011)
export const VarUNE1998_1_2011_ImportanceFactor = atom({
  key: "VarUNE1998_1_2011_ImportanceFactor",
  default: "1.0",
});

// UNE 1998-1 (2011)
export const VarUNE1998_1_2011_DampingRatio = atom({
  key: "VarUNE1998_1_2011_DampingRatio",
  default: "5",
});

// UNE 1998-1 (2011)
export const VarUNE1998_1_2011_BehaviorFactor = atom({
  key: "VarUNE1998_1_2011_BehaviorFactor",
  default: "1.5",
});

// UNE 1998-1 (2011)
export const VarUNE1998_1_2011_LowerBoundFactor = atom({
  key: "VarUNE1998_1_2011_LowerBoundFactor",
  default: "0.2",
});
//////////////////////////////////////
// CYS 1998-1 (2004)
const cys_spectrumType: Array<[string, number]> = [
  ["Horizontal Elastic Spectrum", 1],
  ["Vertical Elastic Spectrum", 2],
  ["Horizontal Design Spectrum", 3],
  ["Vertical Design Spectrum", 4],
];

export const VarCYS1998_1_2004_SpectrumTypeList = atom({
  key: "VarCYS1998_1_2004_SpectrumTypeList",
  default: cys_spectrumType,
});

export const VarCYS1998_1_2004_SpectrumType = atom({
  key: "VarCYS1998_1_2004_SpectrumType",
  default: 1,
});

// CYS 1998-1 (2004)
export const VarCYS1998_1_2004_GroundType = atom({
  key: "VarCYS1998_1_2004_GroundType",
  default: "A",
});

const cys_seismicZone: Array<[string, number]> = [
  ["Zone1(0.15g)", 1],
  ["Zone2(0.20g)", 2],
  ["Zone3(0.25g)", 3],
];

export const VarCYS1998_1_2004_SeismicZoneList = atom({
  key: "VarCYS1998_1_2004_SeismicZoneList",
  default: cys_seismicZone,
});
// CYS 1998-1 (2004)
export const VarCYS1998_1_2004_SeismicZone = atom({
  key: "VarCYS1998_1_2004_SeismicZone",
  default: "1",
});

// CYS 1998-1 (2004)
export const VarCYS1998_1_2004_ImportanceFactor = atom({
  key: "VarCYS1998_1_2004_ImportanceFactor",
  default: "1.0",
});

// CYS 1998-1 (2004)
export const VarCYS1998_1_2004_DampingRatio = atom({
  key: "VarCYS1998_1_2004_DampingRatio",
  default: "5",
});

// CYS 1998-1 (2004)
export const VarCYS1998_1_2004_BehaviorFactor = atom({
  key: "VarCYS1998_1_2004_BehaviorFactor",
  default: "1.5",
});

// CYS 1998-1 (2004)
export const VarCYS1998_1_2004_LowerBoundFactor = atom({
  key: "VarCYS1998_1_2004_LowerBoundFactor",
  default: "0.2",
});

//////////////////////////////////////
// NBN 1998-1 (2011)
const nbn_spectrumType: Array<[string, number]> = [
  ["Horizontal Elastic Spectrum", 1],
  ["Vertical Elastic Spectrum", 2],
  ["Horizontal Design Spectrum", 3],
  ["Vertical Design Spectrum", 4],
];

export const VarNBN1998_1_2011_SpectrumTypeList = atom({
  key: "VarNBN1998_1_2011_SpectrumTypeList",
  default: nbn_spectrumType,
});

export const VarNBN1998_1_2011_SpectrumType = atom({
  key: "VarNBN1998_1_2011_SpectrumType",
  default: 1,
});

// NBN 1998-1 (2011)
export const VarNBN1998_1_2011_GroundType = atom({
  key: "VarNBN1998_1_2011_GroundType",
  default: "A",
});

const nbn_seismicZone: Array<[string, number]> = [
  ["Zone1(0.04g)", 1],
  ["Zone2(0.06g)", 2],
  ["Zone3(0.08g)", 3],
  ["Zone4(0.10g)", 4],
];

export const VarNBN1998_1_2011_SeismicZoneList = atom({
  key: "VarNBN1998_1_2011_SeismicZoneList",
  default: nbn_seismicZone,
});
// NBN 1998-1 (2011)
export const VarNBN1998_1_2011_SeismicZone = atom({
  key: "VarNBN1998_1_2011_SeismicZone",
  default: "1",
});

// NBN 1998-1 (2011)
export const VarNBN1998_1_2011_ImportanceFactor = atom({
  key: "VarNBN1998_1_2011_ImportanceFactor",
  default: "1.0",
});

// NBN 1998-1 (2011)
export const VarNBN1998_1_2011_DampingRatio = atom({
  key: "VarNBN1998_1_2011_DampingRatio",
  default: "5",
});

// NBN 1998-1 (2011)
export const VarNBN1998_1_2011_BehaviorFactor = atom({
  key: "VarNBN1998_1_2011_BehaviorFactor",
  default: "1.5",
});

// NBN 1998-1 (2011)
export const VarNBN1998_1_2011_LowerBoundFactor = atom({
  key: "VarNBN1998_1_2011_LowerBoundFactor",
  default: "0.2",
});

//BDS 1998-1 (2012)
const bds_spectrumType: Array<[string, number]> = [
  ["Horizontal Elastic Spectrum", 1],
  ["Vertical Elastic Spectrum", 2],
  ["Horizontal Design Spectrum", 3],
  ["Vertical Design Spectrum", 4],
];

export const VarBDS1998_1_2012_SpectrumTypeList = atom({
  key: "VarBDS1998_1_2012_SpectrumTypeList",
  default: bds_spectrumType,
});

export const VarBDS1998_1_2012_SpectrumType = atom({
  key: "VarBDS1998_1_2012_SpectrumType",
  default: 1,
});

const bds_groundType: [string, string][] = [
  ["A", "A"],
  ["B", "B"],
  ["C", "C"],
  ["D", "D"],
  ["E", "E"],
];

export const VarBDS1998_1_2012_GroundTypeList = atom<[string, string][]>({
  key: "VarBDS1998_1_2012_GroundTypeList",
  default: bds_groundType,
});

export const VarBDS1998_1_2012_GroundType = atom({
  key: "VarBDS1998_1_2012_GroundType",
  default: "A",
});

const bds_region: [string, string][] = [
  ["Typical", "Typical"],
  ["Vrancea", "Vrancea"],
];

export const VarBDS1998_1_2012_RegionList = atom<[string, string][]>({
  key: "VarBDS1998_1_2012_RegionList",
  default: bds_region,
});

export const VarBDS1998_1_2012_Region = atom({
  key: "VarBDS1998_1_2012_Region",
  default: "Typical",
});

export const VarBDS1998_1_2012_PgaValue = atom({
  key: "VarBDS1998_1_2012_PgaValue",
  default: "0.23",
});

export const VarBDS1998_1_2012_ImportanceFactor = atom({
  key: "VarBDS1998_1_2012_ImportanceFactor",
  default: "1.0",
});

export const VarBDS1998_1_2012_DampingRatio = atom({
  key: "VarBDS1998_1_2012_DampingRatio",
  default: "5",
});

export const VarBDS1998_1_2012_BehaviorFactor = atom({
  key: "VarBDS1998_1_2012_BehaviorFactor",
  default: "1.5",
});

export const VarBDS1998_1_2012_LowerBoundFactor = atom({
  key: "VarBDS1998_1_2012_LowerBoundFactor",
  default: "0.2",
});

//////////////////////////////////////
// DS 1998-1 (2020)
const ds_spectrumType: Array<[string, number]> = [
  ["Horizontal Elastic Spectrum", 1],
  ["Vertical Elastic Spectrum", 2],
  ["Horizontal Design Spectrum", 3],
  ["Vertical Design Spectrum", 4],
];

export const VarDS1998_1_2020_SpectrumTypeList = atom({
  key: "VarDS1998_1_2020_SpectrumTypeList",
  default: ds_spectrumType,
});

export const VarDS1998_1_2020_SpectrumType = atom({
  key: "VarDS1998_1_2020_SpectrumType",
  default: 1,
});

const ds_groundType: [string, string][] = [
  ["A", "A"],
  ["B", "B"],
  ["C", "C"],
  ["D", "D"],
  ["E", "E"],
];

export const VarDS1998_1_2020_GroundTypeList = atom<[string, string][]>({
  key: "VarDS1998_1_2020_GroundTypeList",
  default: ds_groundType,
});

export const VarDS1998_1_2020_GroundType = atom({
  key: "VarDS1998_1_2020_GroundType",
  default: "A",
});

const ds_type: [string, string][] = [
  ["Type 1", "Type 1"],
  ["Type 2", "Type 2"],
];

export const VarDS1998_1_2020_TypeList = atom<[string, string][]>({
  key: "VarDS1998_1_2020_TypeList",
  default: ds_type,
});

export const VarDS1998_1_2020_Type = atom({
  key: "VarDS1998_1_2020_Type",
  default: "Type 1",
});

export const VarDS1998_1_2020_PgaValue = atom({
  key: "VarDS1998_1_2020_PgaValue",
  default: "0.1",
});

export const VarDS1998_1_2020_ImportanceFactor = atom({
  key: "VarDS1998_1_2020_ImportanceFactor",
  default: "1.0",
});

export const VarDS1998_1_2020_DampingRatio = atom({
  key: "VarDS1998_1_2020_DampingRatio",
  default: "5",
});

export const VarDS1998_1_2020_BehaviorFactor = atom({
  key: "VarDS1998_1_2020_BehaviorFactor",
  default: "1.5",
});

export const VarDS1998_1_2020_LowerBoundFactor = atom({
  key: "VarDS1998_1_2020_LowerBoundFactor",
  default: "0.2",
});
