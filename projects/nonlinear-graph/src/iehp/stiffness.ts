/**
 * 비탄성 힌지의 초기강성 K0 판정.
 *
 * 탭2(P-alpha)의 x 축은 표에 없는 값이다. alpha 는 **K0 에 대한 비율**이라
 * 실변위를 그리려면 K0 가 필요하다.
 *
 *     phi1 = P1 / K0
 *     phi2 = phi1 + (P2 - P1) / (alpha1 * K0)
 *
 * 판정 규약은 CIVIL 측 인계서(`IEHP 초기강성 인계서`)를 따른다. 정본은
 * `AnalCtrl.cpp:43946` 의 솔버 입력 생성 코드다.
 *
 * **JSON 키는 대문자다.** 인계서 본문의 `InitStiffType` 등은 DTO 매크로의 설명
 * 문자열이고, 응답에 실리는 이름은 매크로의 두 번째 인자
 * (`INITSTIFFTYPE` / `INITSTIFFNESS` / `INITSTIFFNESSDIST`)다.
 *
 * **슬롯을 값으로 판별하지 않는다.** 쓰이지 않는 K 슬롯에는 이전 값이나
 * 초기화 기본값 1.0 이 그대로 남는다. 1.0 이 "미설정"을 뜻하지 않으므로
 * 반드시 INITSTIFFTYPE + HINGE_TYPE 조합으로만 고른다.
 */
import { MidasAPI, isApiError } from "../api/midasApi";
import { slotAt } from "./slots";

type Rec = Record<string, any>;
type SkeletonSlot = [string, string, string, string, boolean];

const isNumber = (v: any): v is number => typeof v === "number" && !Number.isNaN(v);

export class InitStiffness {
  // INITSTIFFTYPE 열거 (IehpPropDlg.cpp 라디오 순서)
  static readonly TYPE_6EIL = 0;
  static readonly TYPE_3EIL = 1;
  static readonly TYPE_2EIL = 2;
  static readonly TYPE_USER = 3;
  /** E * I - 요소에 묶여 있어 IEHP 만으로는 못 구한다 */
  static readonly TYPE_ELASTIC = 4;
  /** 골격곡선에서 산정 */
  static readonly TYPE_SKELETON = 5;

  /** 요소의 재료·단면·길이가 있어야 하는 타입. IEHP 는 프로퍼티 단위라 알 수 없다. */
  static readonly ELEMENT_DEPENDENT = [
    InitStiffness.TYPE_6EIL,
    InitStiffness.TYPE_3EIL,
    InitStiffness.TYPE_2EIL,
    InitStiffness.TYPE_ELASTIC,
  ];

  /** 성분 0~2 는 힘/변위, 3~5 는 모멘트/회전각 */
  static readonly MOMENT_FROM = 3;

  /**
   * 골격곡선(타입 5) 산정에 쓰는 (힘, 변위) 슬롯.
   *   3절선 계열은 1차 절점(균열점), 2절선 계열은 2차 절점(항복점)을 쓴다.
   *   SLIP 계열은 변위에서 초기 갭을 뺀다.
   */
  static readonly SKELETON_SLOTS: Record<string, SkeletonSlot> = (() => {
    const out: Record<string, SkeletonSlot> = {};
    for (const m of ["KIN", "ORG", "PKO", "DEG", "TAK", "MTK", "TAKS", "ETR", "ETE", "TTE", "MTT", "SRCT"])
      out[m] = ["CRACKFORCE", "YIELDDISP1ST", "CRACKMOMENT", "YIELDROTN1ST", false];
    for (const m of ["CLO", "NBI", "EBI"])
      out[m] = ["YIELDFORCE", "YIELDDISP2ND", "YIELDMOMENT", "YIELDROTN2ND", false];
    for (const m of ["SLBI", "SLBT", "SLBC"])
      out[m] = ["YIELDFORCE", "YIELDDISP2ND", "YIELDMOMENT", "YIELDROTN2ND", true];
    for (const m of ["SLTR", "SLTT", "SLTC"])
      out[m] = ["CRACKFORCE", "YIELDDISP1ST", "CRACKMOMENT", "YIELDROTN1ST", true];
    return out;
  })();

  /** 인장 전용은 (-) 갭을, 압축 전용은 (+) 갭을 0 으로 둔다. */
  static readonly NO_MINUS_GAP = ["SLBT", "SLTT"];
  static readonly NO_PLUS_GAP = ["SLBC", "SLTC"];

  // ---------------------------------------------------------------- 판정

  /**
   * K0 를 [정(+), 부(-)] 로 돌려준다. 못 구하면 [null, 사유].
   *
   * 인계서 2장의 순서를 그대로 따른다. **위에서부터 먼저 맞는 것 하나만** 쓴다.
   */
  resolve(
    prop: any,
    hingeType: string | undefined,
    component: number,
    historyModel: string
  ): [number[] | null, string] {
    if (!prop || typeof prop !== "object") return [null, "NO_PROP"];

    const stiffType = prop["INITSTIFFTYPE"];
    if (stiffType === undefined || stiffType === null) return [null, "NO_INITSTIFFTYPE"];

    // 1-2. 요소 의존 - 솔버가 계산하므로 IEHP 에 값이 존재한 적이 없다.
    if (InitStiffness.ELEMENT_DEPENDENT.includes(stiffType))
      return [null, `ELEMENT_DEPENDENT_${stiffType}`];

    // 3. 골격곡선. 분모 가드를 통과할 때만 쓰고, 아니면 아래 슬롯 규칙으로 폴백한다.
    if (stiffType === InitStiffness.TYPE_SKELETON) {
      const values = this.skeletonK0(prop, component, historyModel);
      if (values !== null) return [values, "SKELETON"];
    }

    // 4 (P-Delta 입력 모드)는 여기 없다. 그 모드의 K0 는 CIVIL 이 (힘, 변위)에서
    //   역산해 `INITSTIFFP` / `INITSTIFFN` 에 넣어 두던 값인데, 파생값이라 API 에서
    //   제거됐다. 애초에 이 함수는 `PALPHADELTA == 0`(탭2)인 행에서만 불리고
    //   (iehp.toTableRow), 탭1 은 D_DATA 가 이미 실변위라 K0 가 필요 없다.

    // 5-6. 분포 힌지는 전용 슬롯을, 그 밖은 공용 슬롯을 쓴다.
    //      HINGE_TYPE 이 아예 없을 수 있다 (Point Spring). 없으면 DIST 가 아니다.
    const isDist = hingeType === "DIST";
    const value = isDist ? prop["INITSTIFFNESSDIST"] : prop["INITSTIFFNESS"];
    if (!InitStiffness.isPositive(value))
      return [null, isDist ? "NO_INITSTIFFNESS_DIST" : "NO_INITSTIFFNESS"];
    return [[Number(value), Number(value)], isDist ? "USER_DIST" : "USER"];
  }

  /**
   * 사용자 지정 초기강성이 들어가는 슬롯 이름.
   *
   * **힌지 타입만으로 정해진다.** INITSTIFFTYPE 과 무관한 이유는, 표에서 타입을
   * User 로 바꾸면 그 슬롯에 값을 써야 하기 때문이다 - 읽을 당시의 타입으로
   * 슬롯을 정해 두면 타입을 바꾼 행에 쓸 자리가 없어진다.
   *
   * 반대쪽 슬롯에는 이전 힌지 타입에서 쓰던 값이 남아 있으므로(인계서 6장)
   * 반드시 이쪽에만 써야 한다.
   */
  userSlot(hingeType: string | undefined): string {
    return hingeType === "DIST" ? "INITSTIFFNESSDIST" : "INITSTIFFNESS";
  }

  // ------------------------------------------------------------ 골격곡선

  /** 타입 5 의 K0 = 기준 하중 / 기준 변위. 분모가 0 이하면 null (폴백). */
  skeletonK0(prop: Rec, component: number, historyModel: string): number[] | null {
    const slots = InitStiffness.SKELETON_SLOTS[historyModel];
    if (slots === undefined) return null;
    const [forceField, dispField, momentField, rotnField, useGap] = slots;

    const cprops = prop["COMPONENTPROPS"];
    if (!cprops || typeof cprops !== "object") return null;

    const isForce = component < InitStiffness.MOMENT_FROM;
    const force = cprops[isForce ? forceField : momentField];
    const disp = cprops[isForce ? dispField : rotnField];

    const gaps = useGap ? this.slipGaps(prop, historyModel) : [0, 0];

    const out: number[] = [];
    for (const side of [0, 1]) {
      const numerator = slotAt(force, side);
      let denominator = slotAt(disp, side);
      if (!isNumber(numerator)) return null;
      if (!isNumber(denominator)) return null;
      denominator = denominator - gaps[side];
      // 본체도 분모가 > 0 일 때만 이 식을 쓴다. 아니면 슬롯 규칙으로 폴백한다.
      if (denominator <= 0) return null;
      out.push(numerator / denominator);
    }
    return out;
  }

  /**
   * SLIP 계열의 [정(+), 부(-)] 초기 갭.
   *
   * 인장 전용(SLBT/SLTT)은 (-) 를, 압축 전용(SLBC/SLTC)은 (+) 를 0 으로 둔다.
   */
  slipGaps(prop: Rec, historyModel: string): [number, number] {
    let plus = isNumber(prop["INITGAPPOSITIVE"]) ? prop["INITGAPPOSITIVE"] : 0;
    let minus = isNumber(prop["INITGAPNEGATIVE"]) ? prop["INITGAPNEGATIVE"] : 0;
    if (InitStiffness.NO_PLUS_GAP.includes(historyModel)) plus = 0;
    if (InitStiffness.NO_MINUS_GAP.includes(historyModel)) minus = 0;
    return [plus, minus];
  }

  static isPositive(value: any): boolean {
    return isNumber(value) && value > 0;
  }

  // -------------------------------------------- 타입 4 (Elastic, 요소 의존)
  //
  // K0 = E * I. IEHP 는 프로퍼티 단위라 요소를 모르므로 표를 네 개 더 읽어야 한다.
  // 조회가 1초에서 3~5초로 늘어나서, **화면에 타입 4 가 하나라도 있을 때만** 읽는다.

  /** 성분 -> 단면 2차모멘트 이름 (본체: j==4 ? Ryy : Rzz) */
  static readonly INERTIA_OF_COMPONENT: Record<number, string> = { 4: "Iyy", 5: "Izz" };

  /** IEHP NAME -> [요소번호] */
  elementsOf: Record<string, number[]> = {};
  /** 요소번호 -> {MATL, SECT} */
  elements: Record<string, { MATL: any; SECT: any }> = {};
  /** 재료번호 -> E */
  elastOf: Record<string, number> = {};
  /** 단면번호 -> {"Iyy": ..., "Izz": ...} */
  inertiaOf: Record<string, Record<string, number>> = {};
  elementsLoaded = false;
  elementsError: string | null = null;

  resetElements() {
    this.elementsOf = {};
    this.elements = {};
    this.elastOf = {};
    this.inertiaOf = {};
    this.elementsLoaded = false;
    this.elementsError = null;
  }

  /**
   * K0 = E*I 계산에 필요한 표를 한 번씩 읽어 색인한다.
   *
   * 실패해도 예외를 올리지 않는다. K0 는 있으면 좋은 값이지 조회의 전제가 아니라,
   * 여기서 죽으면 그래프가 아니라 표 전체를 못 보게 된다.
   */
  async loadElements(): Promise<this> {
    if (this.elementsLoaded) return this;
    this.resetElements();
    try {
      const api = new MidasAPI();
      this.elementsOf = InitStiffness.indexAssignments(await api.dbRead("IEHG"));
      this.elements = InitStiffness.indexElements(await api.dbRead("ELEM"));
      this.elastOf = InitStiffness.indexMaterials(await api.dbRead("MATL"));
      this.inertiaOf = InitStiffness.indexSections(await api.opeGet("SECTPROP"));
      this.elementsLoaded = true;
    } catch (err: any) {
      this.elementsError = `${err?.name ?? "Error"}: ${err?.message ?? err}`;
      console.log(`[IEHP] elastic stiffness unavailable - ${this.elementsError}`);
    }
    return this;
  }

  /** db/IEHG: 키가 **요소번호**, 값이 힌지 property 이름이다. */
  static indexAssignments(data: any): Record<string, number[]> {
    const out: Record<string, number[]> = {};
    if (isApiError(data)) return out;
    for (const [elementNo, value] of Object.entries<any>(data)) {
      if (!value || typeof value !== "object") continue;
      const name = value["PROP_NAME"];
      if (!name) continue;
      const no = parseInt(elementNo, 10);
      if (Number.isNaN(no)) continue;
      (out[name] = out[name] || []).push(no);
    }
    return out;
  }

  static indexElements(data: any): Record<string, { MATL: any; SECT: any }> {
    const out: Record<string, { MATL: any; SECT: any }> = {};
    if (isApiError(data)) return out;
    for (const [elementNo, value] of Object.entries<any>(data)) {
      if (value && typeof value === "object")
        out[elementNo] = { MATL: value["MATL"], SECT: value["SECT"] };
    }
    return out;
  }

  /** db/MATL: E 는 PARAM[0].ELAST. DB 재료(bELAST=false)여도 값은 실려 온다. */
  static indexMaterials(data: any): Record<string, number> {
    const out: Record<string, number> = {};
    if (isApiError(data)) return out;
    for (const [matlNo, value] of Object.entries<any>(data)) {
      if (!value || typeof value !== "object") continue;
      const param = value["PARAM"];
      if (!Array.isArray(param) || param.length === 0) continue;
      const first = param[0];
      if (!first || typeof first !== "object") continue;
      const elast = first["ELAST"];
      if (isNumber(elast) && elast > 0) out[matlNo] = elast;
    }
    return out;
  }

  /**
   * ope/SECTPROP: 단면별 HEAD/DATA 표. db/SECT 는 형상 치수만 주고 I 가 없다.
   *
   * 값이 **소수 6자리 문자열**로 와서 아주 작은 단면은 유효숫자가 크게 깎인다.
   */
  static indexSections(data: any): Record<string, Record<string, number>> {
    const out: Record<string, Record<string, number>> = {};
    if (!data || typeof data !== "object") return out;
    const table = data["SECTPROP"];
    if (!table || typeof table !== "object") return out;
    for (const [sectNo, value] of Object.entries<any>(table)) {
      if (!value || typeof value !== "object") continue;
      const rows = value["DATA"];
      if (!Array.isArray(rows)) continue;
      const found: Record<string, number> = {};
      for (const row of rows) {
        if (!Array.isArray(row) || row.length < 2) continue;
        if (row[0] !== "Iyy" && row[0] !== "Izz") continue;
        const v = parseFloat(row[1]);
        if (Number.isNaN(v)) continue;
        found[row[0]] = v;
      }
      if (Object.keys(found).length > 0) out[sectNo] = found;
    }
    return out;
  }

  /**
   * 타입 4 의 K0 = E * I. 못 구하면 [null, 사유].
   *
   * 모멘트 성분에만 정의된다 - 본체도 `if(j<4) continue` 로 My/Mz 만 다룬다.
   */
  elasticK0(name: string | undefined, component: number): [number | null, string] {
    const inertiaName = InitStiffness.INERTIA_OF_COMPONENT[component];
    if (inertiaName === undefined) return [null, "NO_INERTIA_FOR_COMPONENT"];

    const elements = (name && this.elementsOf[name]) || [];
    if (elements.length === 0) return [null, "NO_ELEMENT_ASSIGNED"];

    // 한 property 가 여러 요소에 걸리면 요소마다 K0 가 다를 수 있다. 실모델은
    // 1:1 이지만 보장은 없으므로, 값이 갈리면 대표값을 쓰되 사유를 남긴다.
    const values: number[] = [];
    for (const elementNo of elements) {
      const element = this.elements[String(elementNo)];
      if (!element) continue;
      const elast = this.elastOf[String(element.MATL)];
      const inertia = (this.inertiaOf[String(element.SECT)] || {})[inertiaName];
      if (!elast || !inertia) continue;
      values.push(elast * inertia);
    }

    if (values.length === 0) return [null, "NO_E_OR_I"];
    if (new Set(values).size > 1) return [values[0], "ELASTIC_AMBIGUOUS"];
    return [values[0], "ELASTIC"];
  }
}

export const STIFFNESS = new InitStiffness();
