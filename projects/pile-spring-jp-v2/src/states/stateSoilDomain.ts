/**
 * @fileoverview 토양 관련 상태 관리를 위한 Recoil atoms와 selectors
 * @description 토양 데이터의 상태 관리와 관련된 기본 atom과 파생 데이터를 위한 selector들을 정의합니다.
 */

import { atom, selector } from "recoil";

import { defaultSoilDomainState } from "../constants/soil/defaults";
import { SoilDomainState } from "../types/typeSoilDomain";

// 토양 도메인의 기본 상태를 관리하는 atom
export const soilDomainState = atom<SoilDomainState>({
  key: "soilDomainState",
  default: defaultSoilDomainState,
});

// 토양층을 깊이 기준으로 정렬하여 반환하는 selector
export const sortedSoilLayersSelector = selector({
  key: "sortedSoilLayersSelector",
  get: ({ get }) => {
    const soilDomain = get(soilDomainState);
    const { soilLayers } = soilDomain;
    return [...soilLayers].sort((a, b) => a.depth - b.depth);
  },
});
