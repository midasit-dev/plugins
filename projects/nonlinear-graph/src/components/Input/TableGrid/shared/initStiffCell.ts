/**
 * 표의 `初期剛性` 칸에 무엇을 쓸지 정한다.
 *
 * 이 칸은 값 하나로 세 가지를 나타내야 한다 — 사용자가 넣은 값, 서버가 계산해 준
 * 값, 그리고 값 자체가 존재하지 않는 산정 방식. 그래서 표시 문자열과 편집 가능
 * 여부를 함께 돌려준다.
 *
 * 예전에는 값을 못 쓰는 경우를 전부 `"E"` 로 적었는데, `"E"` 는 MIDAS 다이얼로그
 * 에서 **Elastic(타입 4)** 을 뜻하는 표기라 Skeleton 이나 6EI/L 까지 `"E"` 로
 * 보이는 건 틀린 표기였다.
 */

/** `INITSTIFFTYPE` 열거 (IehpPropDlg.cpp 라디오 순서). */
export const INIT_STIFF_TYPE = {
  EI6: 0,
  EI3: 1,
  EI2: 2,
  USER: 3,
  ELASTIC: 4,
  SKELETON: 5,
} as const;

/**
 * 표에서 고를 수 있는 타입.
 *
 * 이 플러그인 범위(YIELDSTRENGTHOPT=0 / INTERACTION_TYPE=NONE / DIST·TRUSS·SPR)
 * 에서 탭2(P-alpha)는 `nCtrlType == 1` 이라 CIVIL 자신도 {3, 4} 만 허용한다
 * (`EditData.cpp` CheckIehpInitStiff). 6EI/L 계열은 Lumped 전용, Skeleton 은
 * 탭1 전용이라 여기 올 수 없다.
 */
export const SELECTABLE_TYPES: number[] = [
  INIT_STIFF_TYPE.USER,
  INIT_STIFF_TYPE.ELASTIC,
];

/**
 * 값을 못 구할 때 대신 적는 산정 방식 이름.
 *
 * 수식 표기라 번역하지 않는다 — MIDAS 다이얼로그의 라디오 라벨과 같은 문자열이다.
 */
export const TYPE_LABEL: { [type: number]: string } = {
  [INIT_STIFF_TYPE.EI6]: "6EI/L",
  [INIT_STIFF_TYPE.EI3]: "3EI/L",
  [INIT_STIFF_TYPE.EI2]: "2EI/L",
  [INIT_STIFF_TYPE.USER]: "User",
  [INIT_STIFF_TYPE.ELASTIC]: "E*I",
  [INIT_STIFF_TYPE.SKELETON]: "Skeleton",
};

/**
 * 타입별로 받아들이는 라벨 표기.
 *
 * 화면 언어와 무관하게 전부 받는다 - 일본어 화면에서 복사한 데이터를 영어 화면에
 * 붙여넣어도 통해야 한다. locales 의 문구를 바꾸면 여기도 함께 손봐야 한다.
 */
const ALL_LABELS: { [type: number]: string[] } = {
  [INIT_STIFF_TYPE.USER]: ["User", "ユーザー入力"],
  // "E·I" / "E-I" 는 예전 표기. 그때 복사해 둔 데이터도 붙여넣을 수 있어야 한다.
  [INIT_STIFF_TYPE.ELASTIC]: ["E*I", "E-I", "E·I"],
};

/** 모르는 타입 코드일 때. 예전 표기를 그대로 둔다. */
const UNKNOWN_LABEL = "E";

/**
 * 아직 정해지지 않은 값.
 *
 * 붙여넣기로 만든 신규 행이 여기 해당한다 - 타입도 값도 없다. 예전에는
 * `"E"` 를 적었는데 `"E"` 는 Elastic 표기라, 사용자가 고르지도 않은 산정
 * 방식이 이미 정해진 것처럼 읽혔다.
 */
const EMPTY_LABEL = "";

export interface InitStiffCell {
  /** 숫자면 그 값을 표시한다 (원본 보관 대상). null 이면 label 을 그대로 적는다. */
  value: number | null;
  label: string | null;
  editable: boolean;
}

const isNumber = (v: any): v is number =>
  typeof v === "number" && Number.isFinite(v);

/**
 * @param DATA 조회가 내려준 행 데이터 (K0_INPUT / K0 / INITSTIFFTYPE)
 */
export function initStiffCell(DATA: any): InitStiffCell {
  const type = DATA?.INITSTIFFTYPE;
  const k0 = DATA?.K0;

  // 1. 사용자 지정(타입 3) - 그 슬롯의 값을 보여 주고 편집을 연다.
  //    타입은 표에서 바꿀 수 있으므로 값이 아니라 **타입**으로 판단한다.
  if (type === INIT_STIFF_TYPE.USER)
    return {
      value: isNumber(DATA?.K0_INPUT) ? DATA.K0_INPUT : null,
      // 값이 아직 없으면 빈 칸이다. 편집이 열려 있으니 그대로 입력하면 된다.
      label: isNumber(DATA?.K0_INPUT) ? null : EMPTY_LABEL,
      editable: true,
    };

  // 2. 계산해 낸 K0 가 있으면 보여 준다. 사용자가 넣는 값이 아니므로 편집은 막는다.
  //    (+)/(-) 가 다르면 한 칸에 담을 수 없으니 방식 이름으로 물러선다.
  if (Array.isArray(k0) && isNumber(k0[0]) && isNumber(k0[1]) && k0[0] === k0[1])
    return { value: k0[0], label: null, editable: false };

  // 3. 값이 없다 - 어떻게 산정되는지만 알린다. 요소 길이가 필요한 6EI/L 계열은
  //    CIVIL 도 값을 보관하지 않아 여기로 온다.
  // 타입 자체가 없으면 "알 수 없는 산정 방식"이 아니라 **아직 안 정한 것**이다.
  if (type === null || type === undefined)
    return { value: null, label: EMPTY_LABEL, editable: false };

  return {
    value: null,
    label: TYPE_LABEL[type] ?? UNKNOWN_LABEL,
    editable: false,
  };
}

/**
 * 표의 타입 칸이 갖는 값은 **화면에 보이는 라벨 문자열**이다 (SYMMETRIC 컬럼과 같다).
 *
 * 숫자를 값으로 쓰면 붙여넣기로 `3` / `4` 같은 내부 코드가 그대로 들어올 수 있고,
 * 사용자가 그 숫자의 뜻을 알 방법도 없다. 그래서 라벨만 오간다.
 */

/** 타입 -> 번역 키. 표시와 입력 판별 모두 이 키를 쓴다. */
export const TYPE_LABEL_KEY: { [type: number]: string } = {
  [INIT_STIFF_TYPE.USER]: "InitStiffType_User",
  [INIT_STIFF_TYPE.ELASTIC]: "InitStiffType_Elastic",
};

/**
 * 고를 수는 없지만 표에 떠 있을 수 있는 라벨.
 *
 * 이 플러그인이 만들지는 않아도, 본체에서 그렇게 설정된 힌지를 조회하면 나온다.
 */
/** 고를 수 있는 타입의 라벨 원문. 값 칸에 대체 표기로 뜰 수 있다. */
const SELECTABLE_LABEL_VALUES = new Set(
  SELECTABLE_TYPES.map((t) => TYPE_LABEL[t])
);

const DISPLAY_ONLY_LABELS = new Set(
  Object.keys(TYPE_LABEL)
    .map(Number)
    .filter((t) => !SELECTABLE_TYPES.includes(t))
    .map((t) => TYPE_LABEL[t])
    .concat([UNKNOWN_LABEL])
);

export type Translate = (key: string) => any;


/** 화면에 적을 라벨. 고를 수 없는 타입은 산정 방식 이름을 그대로 쓴다. */
export function stiffTypeLabel(type: any, translate: Translate): string {
  const key = TYPE_LABEL_KEY[type];
  if (key) return String(translate(key));
  return TYPE_LABEL[type] ?? "";
}

/**
 * 표에 들어온 라벨을 타입 숫자로 되돌린다.
 *
 * **숫자는 받지 않는다.** `3` / `4` 는 내부 코드일 뿐 사용자가 쓰는 표기가 아니다.
 * 빈 칸은 "변경 없음"이라 null 을 돌려주고, 호출부가 원래 값을 유지한다.
 *
 * 라벨은 **모든 언어**를 받는다. 일본어 화면에서 만든 데이터를 영어 화면에
 * 붙여넣어도 통해야 하기 때문이다.
 */
export function parseStiffType(input: any, translate?: Translate): number | null {
  if (input === null || input === undefined) return null;
  const text = String(input).trim();
  if (text === "") return null;

  // 현재 언어의 라벨
  if (translate) {
    const hit = Object.keys(TYPE_LABEL_KEY).find(
      (t) => String(translate(TYPE_LABEL_KEY[Number(t)])) === text
    );
    if (hit !== undefined) return Number(hit);
  }

  // 언어와 무관하게 쓰이는 표기 + 다른 언어의 라벨
  const known = Object.keys(ALL_LABELS).find((t) =>
    ALL_LABELS[Number(t)].includes(text)
  );
  return known === undefined ? null : Number(known);
}

/**
 * 이 값이 타입 칸에 **있어도** 되는가 (행 검증).
 *
 * 넣을 수 있는 값보다 넓다. 행 편집을 확정하면 그 행의 모든 칸이 검증을 타는데,
 * 표에는 고를 수 없는 타입(Skeleton, 6EI/L ...)의 행도 떠 있기 때문이다.
 * 여기서 막으면 초기강성과 무관한 편집까지 조용히 롤백된다.
 *
 * 넣어도 되는지는 isStiffTypeSelectable 가 따로 본다.
 */
export function isStiffTypeAllowed(input: any, translate?: Translate): boolean {
  if (String(input ?? "").trim() === "") return true;
  if (parseStiffType(input, translate) !== null) return true;
  // 고를 수 없는 타입도 표에 떠 있을 수 있다 - 그 행 위에서 편집을 확정하면
  // 행 전체가 검증을 타므로, 여기서 막으면 무관한 편집이 통째로 롤백된다.
  return DISPLAY_ONLY_LABELS.has(String(input).trim());
}

/**
 * 사용자가 이 값을 **넣어도** 되는가.
 *
 * `User` 와 `E*I` 뿐이다. 이 플러그인 범위(YIELDSTRENGTHOPT=0 /
 * INTERACTION_TYPE=NONE / DIST·TRUSS·SPR)에서 CIVIL 자신이 허용하는 타입이
 * 그 둘이다. 드롭다운은 애초에 둘만 내므로 실제로 걸리는 것은 붙여넣기다.
 *
 * 빈 칸은 "변경 없음"이라 통과시킨다 - 거부하면 타입 열을 비워 둔 붙여넣기가
 * 통째로 취소된다.
 */
export function isStiffTypeSelectable(input: any, translate?: Translate): boolean {
  if (String(input ?? "").trim() === "") return true;
  const parsed = parseStiffType(input, translate);
  return parsed !== null && SELECTABLE_TYPES.includes(parsed);
}

/**
 * 初期剛性 칸에 이 값이 있어도 되는가.
 *
 * 숫자만 받으면 안 된다. 이 칸은 값을 못 구할 때 **산정 방식 이름**을 대신
 * 적는데(`E*I`, `Skeleton`, `6EI/L` ...), 그걸 거부하면 그 행 위에서 Enter 를
 * 누를 때마다 행 전체가 검증에 걸려 조용히 롤백된다 - 초기강성을 건드리지
 * 않았는데도.
 *
 * 빈 칸은 "값 없음"이라 통과시킨다.
 */
export function isStiffValueAllowed(input: any): boolean {
  const text = String(input ?? "").trim();
  if (text === "") return true;
  if (!Number.isNaN(Number(text))) return true;
  return DISPLAY_ONLY_LABELS.has(text) || SELECTABLE_LABEL_VALUES.has(text);
}
