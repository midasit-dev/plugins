// global.d.ts
export {};

declare global {
  interface Window {
    /** 콘솔 디버깅용. utils_api.ts 가 채운다. */
    IEHP_DEBUG?: any;
  }
}
