// MCT state management with Recoil

import { atom, selector } from 'recoil';
import { conversionResultState } from './conversionState';

// MCT text output
export const mctTextState = selector<string>({
  key: 'mctText',
  get: ({ get }) => {
    const result = get(conversionResultState);
    return result?.mctText ?? '';
  },
});

// MCT preview state (first N lines)
export const mctPreviewLinesState = atom<number>({
  key: 'mctPreviewLines',
  default: 100,
});

// MCT preview selector
export const mctPreviewSelector = selector<string>({
  key: 'mctPreview',
  get: ({ get }) => {
    const mctText = get(mctTextState);
    const previewLines = get(mctPreviewLinesState);

    if (!mctText) return '';

    const lines = mctText.split('\n');
    if (lines.length <= previewLines) {
      return mctText;
    }

    return lines.slice(0, previewLines).join('\n') + '\n... (truncated)';
  },
});

// MCT line count selector
export const mctLineCountSelector = selector<number>({
  key: 'mctLineCount',
  get: ({ get }) => {
    const mctText = get(mctTextState);
    if (!mctText) return 0;
    return mctText.split('\n').length;
  },
});

// MCT file size selector (in bytes)
export const mctFileSizeSelector = selector<number>({
  key: 'mctFileSize',
  get: ({ get }) => {
    const mctText = get(mctTextState);
    if (!mctText) return 0;
    return new Blob([mctText]).size;
  },
});

// Format file size for display
export const mctFileSizeDisplaySelector = selector<string>({
  key: 'mctFileSizeDisplay',
  get: ({ get }) => {
    const size = get(mctFileSizeSelector);

    if (size === 0) return '0 B';
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  },
});

// Has MCT output selector
export const hasMctOutputSelector = selector<boolean>({
  key: 'hasMctOutput',
  get: ({ get }) => {
    const mctText = get(mctTextState);
    return mctText.length > 0;
  },
});
