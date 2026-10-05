/**
 * 신규 레코드 템플릿과 placeholder 상수. 로직은 담지 않는다.
 * TEMPLATE 리터럴은 500줄이 넘어 template.json 으로 분리했다.
 */
import TEMPLATE_JSON from "./template.json";

export const DEFAULT_DEFORM = [
  [0.5, 1, 2, 4, 8],
  [0.5, 1, 2, 4, 8],
];

// tableType "1"에서 강성비 자리를 채울 값. TEMPLATE placeholder 슬롯과 같은 값을 쓴다.
export const DEFAULT_STIFFRATIO = [0.1, 0.1];

// required 이지만 실제 입력이 없는 자리에 넣는 placeholder.
// 실제 모델의 레코드가 담고 있는 값과 동일하다.
export const DEFAULT_FORCE = [1, 1];
export const DEFAULT_CRACK = [0.5, 0.5];
export const DEFAULT_DISP_2ND = [0.2, 0.2];
export const DEFAULT_DISP_3RD = [0.3, 0.3];

export const TEMPLATE: Record<string, any> = TEMPLATE_JSON;
