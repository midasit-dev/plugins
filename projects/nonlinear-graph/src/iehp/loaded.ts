/**
 * 마지막 조회(loadHinges) 결과를 담는 모듈 전역 LOADED.
 *
 * 저장(saveHinges)의 삭제 판정과 성분 가드가 전부 이 값을 기준으로 삼는다.
 * 브라우저 콘솔에서 window.IEHP_DEBUG.LOADED.records / .keys 로 바로 들여다볼 수 있다.
 */
export class Loaded {
  /** 서버에서 읽은 IEHP 전체 {키: 레코드} */
  records: Record<string, any> = {};
  /** 그중 필터를 통과해 화면에 나간 키. 삭제 판정의 유일한 기준 */
  keys: string[] = [];
  /** 조회에 쓴 요소 타입 */
  element: number | null = null;
  /** 조회에 쓴 성분 (0-based) */
  component: number | null = null;
  /** 읽을 수 없어 건너뛴 레코드 [키, 사유] */
  skipped: [string, string][] = [];

  reset(element: number, component: number) {
    this.records = {};
    this.keys = [];
    this.skipped = [];
    this.element = element;
    this.component = component;
  }

  /**
   * 읽을 수 없는 레코드를 기록하고 빈 행을 돌려준다.
   *
   * 화면에 내보내지 않으므로(LOADED.keys 에 안 들어감) 저장 시 삭제 대상도 아니다.
   * 콘솔에서 LOADED.skipped 로 무엇이 왜 빠졌는지 확인할 수 있다.
   */
  skip(key: string, reason: string): Record<string, any> {
    this.skipped.push([key, reason]);
    console.log(`[IEHP] skip record ${key} - ${reason}`);
    return {};
  }
}

export const LOADED = new Loaded();
