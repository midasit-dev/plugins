// Conversion state management with Recoil

import { atom, selector } from 'recoil';
import { ConversionResult, ConversionOptions } from '../types/converter.types';

// Conversion options
export const conversionOptionsState = atom<ConversionOptions>({
  key: 'conversionOptions',
  default: {
    version: 1,
    includeComments: true,
    validateInput: true,
  },
});

// Conversion result
export const conversionResultState = atom<ConversionResult | null>({
  key: 'conversionResult',
  default: null,
});

// Conversion in progress
export const isConvertingState = atom<boolean>({
  key: 'isConverting',
  default: false,
});

// Conversion progress (0-100)
export const conversionProgressState = atom<number>({
  key: 'conversionProgress',
  default: 0,
});

// Current conversion step message
export const conversionStepState = atom<string>({
  key: 'conversionStep',
  default: '',
});

// Conversion success selector
export const isConversionSuccessSelector = selector<boolean>({
  key: 'isConversionSuccess',
  get: ({ get }) => {
    const result = get(conversionResultState);
    return result?.success ?? false;
  },
});

// Conversion errors selector
export const conversionErrorsSelector = selector<string[]>({
  key: 'conversionErrors',
  get: ({ get }) => {
    const result = get(conversionResultState);
    return result?.errors ?? [];
  },
});

// Conversion warnings selector
export const conversionWarningsSelector = selector<string[]>({
  key: 'conversionWarnings',
  get: ({ get }) => {
    const result = get(conversionResultState);
    return result?.warnings ?? [];
  },
});

// Has errors selector
export const hasErrorsSelector = selector<boolean>({
  key: 'hasErrors',
  get: ({ get }) => {
    const errors = get(conversionErrorsSelector);
    return errors.length > 0;
  },
});

// Has warnings selector
export const hasWarningsSelector = selector<boolean>({
  key: 'hasWarnings',
  get: ({ get }) => {
    const warnings = get(conversionWarningsSelector);
    return warnings.length > 0;
  },
});
