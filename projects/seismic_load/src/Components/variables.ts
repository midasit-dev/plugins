import {SetRecoilState, atom, selector,DefaultValue} from 'recoil';

export const TsValue = atom({
  key: 'TsValue',
  default: '0'
});

export const DampingRatio = atom<number>({
  // 감쇠비 𝜉
  // 기능수행수준 : 10, 붕괴방지수준 : 20
  key : 'DampingRatio',
  default: 10
});

export const RegionFactor = atom<number>({
  // 지진구역계수
  // Ⅰ구역 : 0.11, Ⅱ구역 : 0.07
  key : 'RegionFactor',
  default: 0.11
});
export const SeismicFactor = atom<number>({
  // 내진등급
  // Ⅰ등급 : 1, Ⅱ등급 : 2
  key : 'SeismicFactor',
  default: 1
});

export const RiskFactor_Operating = atom<number>({
  // 기능수행수준 위험도계수
  key : 'RiskFactor_Operating',
  default: 0.57
});

export const RiskFactor_SafeShutdown = atom<number>({
  // 붕괴방지수준 위험도계수
  key : 'RiskFactor_SafeShutdown',
  default: 1.4
});

export const SValue_Operating = atom<number>({
  key : 'SValue_Operating',
  default : 0.0627
});

export const SValue_SafeShutdown = atom<number>({
  key : 'SValue_SafeShutdown',
  default : 0.154
});

export const MDResult = atom<string>({
  key: 'MDResult',
  default: ''
});

export const CDValue_Operating = atom<number>({
  key: 'CDValue_Operating',
  default: 0
});

export const CDValue_SafeShutdown = atom<number>({
  key: 'CDValue_SafeShutdown',
  default: 0
});

export const SvValue_Operating = atom<number>({
  key: 'SvValue_Operating',
  default: 0
});

export const SvValue_SafeShutdown = atom<number>({
  key: 'SvValue_SafeShutdown',
  default: 0
});