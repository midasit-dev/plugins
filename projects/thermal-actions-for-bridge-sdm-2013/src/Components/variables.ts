import { atom } from "recoil";

/**
 * @description Variable of BasicInput.tsx
 */
export const VarSuperType = atom({
  key: "VarSuperType",
  default: 1,
});

export const VarStructType = atom({
  key: "VarStructType",
  default: "Normal",
});

export const VarDeckSurfType = atom({
  key: "VarDeckSurfType",
  default: "plain",
});

export const VarDeckSurfThick = atom({
  key: "VarDeckSurfThick",
  default: 0,
});

export const VarHeightSeaLevel = atom({
  key: "VarHeightSeaLevel",
  default: 0,
});

/**
 * @description Variable of deckSurfThickDisabled.tsx
 */

export const VarTabGroupMain = atom({
  key: "VarTabGroupMain",
  default: "Uniform",
});

export const VarLoadCase_TUH = atom({
  key: "VarLoadCase_TUH",
  default: "",
});

export const VarLoadCase_TUC = atom({
  key: "VarLoadCase_TUC",
  default: "",
});

export const VarLoadCase_TGH = atom({
  key: "VarLoadCase_TGH",
  default: "",
});

export const VarLoadCase_TGC = atom({
  key: "VarLoadCase_TGC",
  default: "",
});

export const VarAdjOpt = atom({
  key: "VarAdjOpt",
  default: true,
});

export const VarDiffOpt = atom({
  key: "VarDiffOpt",
  default: true,
});

export const VarStldlist = atom({
  key: "VarStldlist",
  default: [],
});
