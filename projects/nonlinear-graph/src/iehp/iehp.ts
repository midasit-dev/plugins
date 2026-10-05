/**
 * IEHP 테이블 조작. 상태는 갖지 않는다 - name(테이블 이름)뿐이고
 * 조회 결과는 모듈 전역 LOADED 에 있다. 브리지(utils_api)가 매 호출마다 새로 만든다.
 *
 * py_iehp.py 를 그대로 옮겼다. Python 시절에는 TS 와 JSON 문자열로 주고받았기
 * 때문에 `None` 은 `null` 로, 없는 키는 빠진 채로 화면에 갔다. 표 컴포넌트가 그
 * 모양에 맞춰져 있으므로, 읽기 경로의 `.get()` 은 `nz()` 로 null 을 유지하고
 * 입출력 객체는 JSON 왕복으로 정규화한다.
 */
import isEqual from "lodash/isEqual";
import { MidasAPI, isApiError } from "../api/midasApi";
import {
  TEMPLATE,
  DEFAULT_DEFORM,
  DEFAULT_STIFFRATIO,
  DEFAULT_FORCE,
  DEFAULT_CRACK,
  DEFAULT_DISP_2ND,
  DEFAULT_DISP_3RD,
} from "./template";
import {
  HINGE_TYPE,
  COMPONENT_COUNT,
  ALL_History_PND,
  ALL_History_Prop_Name,
  ALL_History_Prop_ExtraField,
  FORCE_FIELDS,
  MOMENT_FIELDS,
  DISP_FIELDS,
  ROTN_FIELDS,
  STIFF_FIELDS,
  pointSlots,
  stiffSlots,
  pointFields,
  slotAt,
} from "./slots";
import { LOADED } from "./loaded";
import { STIFFNESS, InitStiffness } from "./stiffness";

type Rec = Record<string, any>;
type TableRow = { KEY: string | null; NAME: any; MATERIAL_TYPE: string; HISTORY_MODEL: string; DATA: Rec };
type TableList = Record<string, TableRow[]>;

/** Python 의 dict.get: 없는 키는 None(null). */
const nz = (v: any) => (v === undefined ? null : v);
const isObj = (v: any): v is Rec => v !== null && typeof v === "object" && !Array.isArray(v);
const clone = <T>(v: T): T => JSON.parse(JSON.stringify(v));
const errText = (err: any) => `${err?.name ?? "Error"}: ${err?.message ?? err}`;

export class IEHP {
  name: string;

  constructor(name: string) {
    this.name = name;
  }

  private api() {
    return new MidasAPI();
  }

  /** 서버 -> 표. IEHP 전체를 읽어 필터를 통과한 것만 탭별 행 목록으로 돌려준다. */
  async loadHinges(ElementValue: number, ComponentValue: number): Promise<TableList> {
    // 무엇보다 먼저 이전 조회 결과를 버린다. 이 함수가 어디로 빠져나가든
    // 낡은 records/keys 가 남아 있으면 다음 저장이 그걸 기준으로 삼는다.
    LOADED.reset(ElementValue, ComponentValue);

    // 범위 밖 인자는 호출 쪽 실수다. 레코드 손상과 섞이지 않게 여기서 막는다.
    if (!(ElementValue in HINGE_TYPE)) return {};
    if (!Number.isInteger(ComponentValue)) return {};
    if (ComponentValue < 0 || ComponentValue >= COMPONENT_COUNT) return {};

    const records = await this.api().dbRead(this.name);
    if (isApiError(records)) return {};
    LOADED.records = records;

    const tableList: TableList = {};
    for (const key of Object.keys(LOADED.records)) {
      // toTableRow 가 예상 못 한 모양의 레코드에서 터져도 나머지는 살린다.
      // 건너뛴 레코드는 LOADED.keys 에 들어가지 않으므로 저장 시 삭제 대상도 아니다.
      let tableData: Rec;
      try {
        tableData = this.toTableRow(ElementValue, ComponentValue, key, LOADED.records[key]);
      } catch (err) {
        LOADED.skip(key, errText(err));
        continue;
      }
      if (Object.keys(tableData).length > 0) {
        LOADED.keys.push(key);
        for (const [tableType, data] of Object.entries(tableData)) {
          (tableList[tableType] = tableList[tableType] || []).push(data);
        }
      }
    }

    await this.fillElasticK0(tableList["2"], ComponentValue);

    // 예전 JSON 문자열 경계와 같은 모양(undefined 제거)으로 넘긴다.
    return clone(tableList);
  }

  /**
   * 타입 4(Elastic)인 행의 K0 를 E * I 로 채운다. **지연 로딩**이다.
   *
   * K0 = E * I 는 요소의 재료·단면이 있어야 해서 표를 네 개 더 읽는다
   * (IEHG / ELEM / MATL / ope-SECTPROP). 조회가 1초에서 3~5초로 늘어나므로,
   * **화면에 타입 4 가 하나라도 있을 때만** 읽는다. 타입 3·5 로만 이뤄진
   * 모델은 이 비용을 전혀 내지 않는다.
   */
  async fillElasticK0(rows: TableRow[] | undefined, ComponentValue: number) {
    if (!rows || rows.length === 0) return;
    const pending = rows.filter((r) =>
      String(r.DATA["K0_SOURCE"] || "").startsWith("ELEMENT_DEPENDENT_4")
    );
    if (pending.length === 0) return;

    await STIFFNESS.loadElements();
    if (!STIFFNESS.elementsLoaded) return;

    for (const row of pending) {
      const [value, why] = STIFFNESS.elasticK0(row.NAME, ComponentValue);
      if (value === null) {
        row.DATA["K0_SOURCE"] = why;
        continue;
      }
      // E * I 는 부호를 가리지 않는다.
      row.DATA["K0"] = [value, value];
      row.DATA["K0_SOURCE"] = why;
    }
  }

  /**
   * 서버 레코드 1개 -> 표 행 1개. 필터를 통과하지 못하면 빈 객체.
   *
   * 필터 탈락(이 성분/요소의 힌지가 아님)과 레코드 손상은 다르다. 앞은 조용히
   * 빈 객체, 뒤는 LOADED.skip 으로 사유를 남긴다. 둘 다 화면에 나가지 않으므로
   * 저장 시 삭제 대상이 되지도 않는다.
   */
  toTableRow(ElementValue: number, ComponentValue: number, key: string, rawData: any): Rec {
    const hingeType = HINGE_TYPE[ElementValue];
    if (hingeType === undefined) return {};
    if (!isObj(rawData)) return LOADED.skip(key, "record is not an object");

    if (rawData["DEFINITION"] !== "SKEL") return {};
    if (rawData["HINGE_TYPE"] !== hingeType) return {};
    if (rawData["INTERACTION_TYPE"] !== "NONE") return {};

    // COMPONENT_DIR 자체가 없거나 짧은 것(손상)과, 값이 false 인 것(이 성분의
    // 힌지가 아님 = 정상 탈락)은 다르다. 뭉뚱그리면 손상이 조용히 묻힌다.
    const componentDir = rawData["COMPONENT_DIR"];
    if (!Array.isArray(componentDir) || ComponentValue >= componentDir.length)
      return LOADED.skip(key, `COMPONENT_DIR[${ComponentValue}] is missing`);
    if (!componentDir[ComponentValue]) return {};

    // 여기서부터는 COMPONENT_DIR 이 true 인 성분이다. 대응하는 ALL_PROP /
    // HYSTERESIS_MODEL 이 비어 있으면 필터 탈락이 아니라 레코드가 깨진 것이다.
    const dataObject = slotAt<Rec>(rawData["ALL_PROP"], ComponentValue);
    if (!isObj(dataObject) || Object.keys(dataObject).length === 0)
      return LOADED.skip(key, `ALL_PROP[${ComponentValue}] is empty`);

    const NAME = Object.keys(dataObject)[0];
    const propData = dataObject[NAME];
    if (!isObj(propData))
      return LOADED.skip(key, `ALL_PROP[${ComponentValue}].${NAME} is not an object`);

    const historyModel = slotAt<string>(rawData["HYSTERESIS_MODEL"], ComponentValue);
    if (!historyModel) return LOADED.skip(key, `HYSTERESIS_MODEL[${ComponentValue}] is empty`);

    // 저장 경로(buildRecord)가 이 코드로 prop 구조체 이름을 찾는다. 모르는 코드를
    // 화면에 내보내면 저장할 때 구조체 이름을 못 찾아 저장 전체가 죽는다.
    if (!(historyModel in ALL_History_Prop_Name))
      return LOADED.skip(key, `unknown hysteresis model ${historyModel}`);

    // 구조체 이름과 모델 코드는 서로에게서 유도되므로 항상 일치해야 한다.
    // 어긋나면 조회는 A 형식으로 읽고 저장은 B 형식으로 쓰게 된다.
    if (ALL_History_Prop_Name[historyModel] !== NAME)
      return LOADED.skip(
        key,
        `model ${historyModel} expects ${ALL_History_Prop_Name[historyModel]} but ALL_PROP[${ComponentValue}] holds ${NAME}`
      );

    const setData: TableRow = {
      KEY: key,
      NAME: nz(rawData["NAME"]),
      MATERIAL_TYPE: rawData["MATERIAL_TYPE"] === "STEEL" ? "S" : "RC",
      HISTORY_MODEL: historyModel,
      DATA: {},
    };

    if (NAME === "MULTLIN") {
      setData.DATA = this.readMultilinear(propData, rawData["MULT_DATA"]);
      return { "3": setData };
    }

    // 스켈레톤 경로는 절선 수를 모델 코드에서 얻는다.
    if (!(historyModel in ALL_History_PND))
      return LOADED.skip(key, `no linearity defined for ${historyModel}`);
    if (propData["YIELDSTRENGTHOPT"] !== 0) return {};

    const tableType = propData["PALPHADELTA"];
    const DATA = this.readSkeleton(propData, historyModel, tableType, ComponentValue, rawData["HINGE_TYPE"]);

    // readSkeleton 은 값이 비면 거기서 수집을 멈춘다. 그래서 배열이 PND 보다
    // 짧아질 수 있는데, 저장 경로는 PND 개를 그대로 인덱싱한다. 그대로 두면
    // 레코드 하나 때문에 저장 전체가 죽는다.
    // 탭1(P-D)은 힘·변위가, 탭2(P-alpha)는 힘·강성비가 입력이다.
    const needed = tableType === 1 ? ["P_DATA", "D_DATA"] : ["P_DATA", "A_DATA"];
    const short = needed.filter((f) => (DATA[f] || []).length !== DATA["PND"]);
    if (short.length > 0) {
      return LOADED.skip(
        key,
        `${short.join("/")} shorter than PND=${DATA["PND"]} (${needed
          .map((f) => `${f}=${(DATA[f] || []).length}`)
          .join(", ")})`
      );
    }

    // 탭2 는 alpha 가 K0 에 대한 비율이라 x축을 실단위로 만들려면 K0 가 필요하다.
    // 탭1 은 D_DATA 가 이미 실변위라 필요 없다.
    // K0 는 [정(+), 부(-)] 이고, 못 구하면 null -> 그래프가 정규화 축으로 그린다.
    if (tableType === 0) {
      const [k0, source] = STIFFNESS.resolve(propData, rawData["HINGE_TYPE"], ComponentValue, historyModel);
      DATA["K0"] = k0;
      DATA["K0_SOURCE"] = source;
    }

    setData.DATA = DATA;
    return tableType === 0 ? { "2": setData } : { "1": setData };
  }

  readMultilinear(data: Rec, multData: any): Rec {
    const multi_data: any[][] = [];

    if (Array.isArray(multData) && multData.length > 0) {
      for (const mul of multData) multi_data.push([nz(mul?.["FORCE"]), nz(mul?.["DISP"])]);
    } else {
      multi_data.push([0.0, 0.0]);
    }

    let nType = data["nType"];
    if (nType !== 1 && nType !== 2) nType = 0;

    return {
      nType,
      dHysParam_Alpha1: nz(data["dHysParam_Alpha1"]),
      dHysParam_Alpha2: nz(data["dHysParam_Alpha2"]),
      dHysParam_Beta1: nz(data["dHysParam_Beta1"]),
      dHysParam_Beta2: nz(data["dHysParam_Beta2"]),
      dHysParam_Eta: nz(data["dHysParam_Eta"]),
      PnD_Data: multi_data,
    };
  }

  /** 서버 prop 구조체 -> 표 DATA. writeSkeleton 의 역방향이다. */
  readSkeleton(data: Rec, historyModel: string, tableType: number, ComponentValue: number, hingeType?: string): Rec {
    const pndData: Rec = data["COMPONENTPROPS"] || {};
    const dataType = ALL_History_PND[historyModel];
    const nPnd = tableType === 1 ? dataType : dataType - 1;

    const [pointKeys, stepKeys] = pointFields(ComponentValue);
    const slots = pointSlots(nPnd, dataType);

    // 데이터 점이 들어 있는 슬롯만 읽는다. 그 밖의 자리에도 DTO required 를 채우느라
    // 값이 들어 있어(ULTIMATEMOMENT = [1,1] 같은 placeholder), 값의 유무로 세면
    // P_DATA 길이와 PND 가 어긋난다.
    const collect = (keys: string[]) => {
      const out: any[] = [];
      for (const slot of slots) {
        const value = pndData[keys[slot]];
        if (value === undefined || value === null) break;
        out.push(value);
      }
      return out;
    };

    const pData = collect(pointKeys);
    const dData = collect(stepKeys);
    const aData = collect(STIFF_FIELDS);

    // 초기강성은 슬롯이 넷인데 그중 하나만 유효하다. 어느 것인지는 값이 아니라
    // INITSTIFFTYPE + PALPHADELTA + HINGE_TYPE 이 정한다 (stiffness.ts).
    // 표는 K0_INPUT 을 보여 주고, 저장은 K0_SLOT 이 가리키는 자리에 되쓴다.
    // 슬롯은 힌지 타입만으로 정해진다 - 표에서 타입을 User 로 바꾼 행에도
    // 쓸 자리가 있어야 하기 때문이다. 편집 가능 여부는 타입이 정한다
    // (shared/initStiffCell).
    const k0Slot = STIFFNESS.userSlot(hingeType);

    return {
      SYMMETRIC: nz(data["SYMMETRIC"]),
      INITSTIFFNESS: nz(data["INITSTIFFNESS"]),
      K0_SLOT: k0Slot,
      K0_INPUT: nz(data[k0Slot]),
      // 표가 초기강성 칸에 무엇을 쓸지 정하는 데 쓴다 (값 / 산정 방식 이름).
      INITSTIFFTYPE: nz(data["INITSTIFFTYPE"]),
      BETA: nz(data["UNLOADSTIFFCALCEXPO"]),
      ALPA: nz(data["UNLOADSTIFFREDUFAC"]),
      GAMMA: nz(data["PINCHINGRULEFAC"]),
      INIT_GAP: [nz(data["INITGAPPOSITIVE"]), nz(data["INITGAPNEGATIVE"])],
      P_DATA: pData,
      D_DATA: dData,
      A_DATA: aData,
      PND: nPnd,
    };
  }

  /** 표 -> 서버. 추가/삭제/변경된 행만 보낸다. */
  async saveHinges(ElementValue: number, Component: number, obj: object): Promise<Rec> {
    // 예전 JSON 문자열 경계와 같은 모양(undefined 제거)으로 받는다.
    const tableObj: TableList = clone(obj) as TableList;
    const allKeys = Object.keys(LOADED.records);
    // 삭제 판정은 "화면에 보였던 키"에 대해서만 한다. 서버 전체를 기준으로 삼으면
    // 필터(HINGE_TYPE / COMPONENT_DIR / DEFINITION ...)에 걸러져 사용자가 본 적도 없는
    // 힌지까지 함께 지워진다.
    const shownKeys = LOADED.keys.filter((k) => allKeys.includes(k));
    const updateKeyData: { Key: string; Data: TableRow; Type: string }[] = [];
    const addKeyData: { Key: string; Data: TableRow; Type: string }[] = [];

    const tableKeys: [string | null | undefined, TableRow, string][] = [];
    for (const type of ["1", "2", "3"]) {
      for (const row of tableObj[type] || []) tableKeys.push([row.KEY, row, type]);
    }

    if (allKeys.length === 0 && tableKeys.length === 0) return { result: "error" };

    // 드롭다운은 TableList 를 비우지 않는다. 조회 이후 요소/성분을 바꾸고 저장하면
    // 화면에 남아 있는 이전 성분의 행이 전부 새 성분 슬롯에 기록되어 기존 정의를 덮어쓴다.
    if (LOADED.element !== null && (LOADED.element !== ElementValue || LOADED.component !== Component)) {
      return {
        result: "error",
        message: [
          `ELEMENT_COMPONENT_MISMATCH: table was loaded for element=${LOADED.element} component=${LOADED.component} but save targets element=${ElementValue} component=${Component}. Request again before saving.`,
        ],
      };
    }

    // 객체 순서상 마지막 키가 최대값이라는 보장이 없다. 최대값 기준으로 잡아야
    // 기존 키와 충돌해 덮어쓰는 일이 없다.
    // 신규 키는 숨겨진 힌지와 충돌하지 않도록 화면 표시분이 아닌 전체 키 기준으로 잡는다.
    let nextKey = allKeys.length > 0 ? Math.max(...allKeys.map((k) => parseInt(k, 10))) + 1 : 1;
    const keptKeys: string[] = [];
    for (const [chKey, data, tableType] of tableKeys) {
      if (chKey === null || chKey === undefined) {
        addKeyData.push({ Key: String(nextKey), Data: data, Type: tableType });
        nextKey += 1;
      } else if (allKeys.includes(String(chKey))) {
        updateKeyData.push({ Key: String(chKey), Data: data, Type: tableType });
        keptKeys.push(String(chKey));
      }
    }
    // 화면에 보였는데 테이블에서 사라진 행 = 사용자가 실제로 지운 행
    const delKey = shownKeys.filter((k) => !keptKeys.includes(k));

    let errors: string[] = [];
    let nUpdated = 0;
    let nSkipped = 0;
    if (delKey.length > 0) {
      errors = errors.concat(await this.deleteRecords(delKey));
    }
    if (updateKeyData.length > 0) {
      const [updErrors, updated, skipped] = await this.putChangedRecords(ElementValue, Component, updateKeyData);
      errors = errors.concat(updErrors);
      nUpdated = updated;
      nSkipped = skipped;
    }
    if (addKeyData.length > 0) {
      errors = errors.concat(await this.postNewRecords(ElementValue, Component, addKeyData));
    }

    if (errors.length > 0) return { result: "error", message: errors };

    return {
      result: "success",
      deleted: delKey.length,
      updated: nUpdated,
      added: addKeyData.length,
      skipped: nSkipped,
    };
  }

  /** API 응답이 실패({error})면 그 문구를, 아니면 null 을 돌려준다. */
  checkResult(result: any): string | null {
    if (result && typeof result === "object") {
      return result.error ? String(result.error) : null;
    }
    return String(result);
  }

  async deleteRecords(delKey: string[]): Promise<string[]> {
    // DELETE /db/IEHP (키 없음)은 테이블 전체를 지우므로 삭제만 키 단위로 호출한다
    const errors: string[] = [];
    for (const key of delKey) {
      const error = this.checkResult(await this.api().dbDelete(this.name, key));
      if (error) errors.push(error);
    }
    return errors;
  }

  isUnchanged(key: string, newValue: Rec): boolean {
    // 서버 상태와 한 글자도 다르지 않은 레코드는 보낼 이유가 없다.
    // ALL_SUBPROP 은 EXIST_IJ_PROP 이 전부 false 일 때 의도적으로 빼고 보내므로
    // (서버가 I단 값으로 채운다) 비교 대상에서 제외한다. 편집 대상도 아니다.
    const origin = LOADED.records[key];
    if (origin === undefined || origin === null) return false;
    const { ALL_SUBPROP: _a, ...a } = newValue;
    const { ALL_SUBPROP: _b, ...b } = origin;
    return isEqual(a, b);
  }

  async putChangedRecords(
    ElementValue: number,
    Component: number,
    updateKeyData: { Key: string; Data: TableRow; Type: string }[]
  ): Promise<[string[], number, number]> {
    const updateIEHP: Rec = {};
    let skipped = 0;
    if (Object.keys(LOADED.records).length > 0) {
      for (const update of updateKeyData) {
        const newValue = this.buildRecord(ElementValue, Component, update.Type, update.Data, update.Key);
        // 바뀌지 않은 행까지 매번 재작성하면 UI 에 없는 탭(MULTLIN)까지 다시 쓰이고,
        // 한 셀만 고쳐도 전량이 buildRecord 왕복 무결성에 걸리게 된다.
        if (this.isUnchanged(update.Key, newValue)) {
          skipped += 1;
          continue;
        }
        updateIEHP[update.Key] = newValue;
      }
    }

    const count = Object.keys(updateIEHP).length;
    if (count === 0) return [[], 0, skipped];

    // PUT /db/IEHP 한 번으로 일괄 수정
    const error = this.checkResult(await this.api().dbUpdate(this.name, updateIEHP));
    return [error ? [error] : [], count, skipped];
  }

  async postNewRecords(
    ElementValue: number,
    Component: number,
    addKeyData: { Key: string; Data: TableRow; Type: string }[]
  ): Promise<string[]> {
    const addIEHP: Rec = {};
    for (const add of addKeyData) {
      addIEHP[add.Key] = this.buildRecord(ElementValue, Component, add.Type, add.Data);
    }

    if (Object.keys(addIEHP).length === 0) return [];

    // POST /db/IEHP 한 번으로 일괄 생성
    const error = this.checkResult(await this.api().dbCreate(this.name, addIEHP));
    return error ? [error] : [];
  }

  /** 표 행 1개 -> 서버 레코드 1개. key 가 없으면 신규다. */
  buildRecord(ElementValue: number, Component: number, tableType: string, value: TableRow, key?: string): Rec {
    const model = value.HISTORY_MODEL;
    const modelPropName = ALL_History_Prop_Name[model];
    if (modelPropName === undefined) throw new Error(`unknown hysteresis model ${model}`);
    const DATA: Rec = value.DATA;

    // 기존 힌지는 원본 위에 현재 성분만 얹는다.
    // TEMPLATE 에서 새로 만들면 COMPONENT_DIR / HYSTERESIS_MODEL / ALL_PROP 이
    // 현재 성분만 남도록 덮여, 같은 힌지의 다른 성분 정의가 사라진다.
    const origin = key !== undefined ? LOADED.records[key] : undefined;
    const isNew = origin === undefined || origin === null;
    const newValue: Rec = clone(isNew ? TEMPLATE : origin);

    newValue["NAME"] = nz(value.NAME);
    newValue["MATERIAL_TYPE"] = value.MATERIAL_TYPE === "S" ? "STEEL" : "RC";

    if (isNew) {
      newValue["HINGE_TYPE"] = HINGE_TYPE[ElementValue];
      // 슬롯 6~8 은 서버가 재조회 시 "" 로 정규화한다. "" 도 "KIN" 도 입력으로 허용된다.
      newValue["HYSTERESIS_MODEL"] = [0, 1, 2, 3, 4, 5].map((idx) => (Component === idx ? model : "KIN")).concat(["", "", ""]);
      newValue["COMPONENT_DIR"] = [0, 1, 2, 3, 4, 5].map((idx) => Component === idx);
    } else {
      // 다른 성분의 값은 그대로 두고 현재 성분만 갱신한다.
      newValue["HYSTERESIS_MODEL"][Component] = model;
      newValue["COMPONENT_DIR"][Component] = true;
    }

    // 모델이 그대로면 원본 prop 을 기반으로 삼아, 플러그인이 관리하지 않는
    // 필드(INITSTIFFTYPE 등)를 잃지 않는다. 모델이 바뀌었으면 새로 만든다.
    //
    // 여기 오는 레코드는 toTableRow 를 통과했으니 슬롯이 있는 것이 보장되지만,
    // 다른 슬롯 접근과 같은 규칙(slotAt)을 쓴다. 없으면 새로 만들면 되는 자리다.
    const prevSlot = isNew ? {} : slotAt<Rec>(origin["ALL_PROP"], Component);
    const prevProp = isObj(prevSlot) ? prevSlot[modelPropName] : undefined;
    const propData: Rec = isObj(prevProp) ? clone(prevProp) : {};
    newValue["ALL_PROP"][Component] = { [modelPropName]: propData };

    // 신규 행은 조회 경로를 거치지 않아 K0_SLOT 이 없다. 힌지 타입만으로 정해지는
    // 값이라 여기서 채운다 - 비워 두면 사용자가 넣은 초기강성이 조용히 버려진다.
    if (!DATA["K0_SLOT"]) {
      DATA["K0_SLOT"] = STIFFNESS.userSlot(newValue["HINGE_TYPE"]);
    }

    if (tableType === "1" || tableType === "2") {
      this.writeSkeleton(Component, tableType, propData, DATA, modelPropName);
    } else {
      newValue["MULT_DATA"] = (DATA["PnD_Data"] || []).map((pnd: any[]) => ({ DISP: pnd[1], FORCE: pnd[0] }));
      this.writeMultilinear(propData, DATA);
    }

    // ALL_SUBPROP(J단)은 EXIST_IJ_PROP[i]가 true일 때만 의미가 있다.
    // 전부 false면 서버가 I단 값으로 채우므로 보내지 않는다.
    // true 인 슬롯이 있으면 J단은 편집 대상이 아니므로 원본을 그대로 둔다.
    if (!(newValue["EXIST_IJ_PROP"] || []).some(Boolean)) {
      delete newValue["ALL_SUBPROP"];
    }

    return newValue;
  }

  /**
   * 표 DATA -> 서버 prop 구조체. readSkeleton 의 역방향이다.
   *
   * **propData 를 제자리에서 고친다.** buildRecord 가 이미
   * newValue["ALL_PROP"][Component] 에 꽂아 둔 그 객체이므로 돌려줄 것이 없다.
   * cprops 도 propData["COMPONENTPROPS"] 와 같은 객체다.
   */
  writeSkeleton(Component: number, tableType: string, propData: Rec, DATA: Rec, modelPropName: string) {
    propData["SYMMETRIC"] = nz(DATA["SYMMETRIC"]);
    propData["YIELDSTRENGTHOPT"] = 0;
    propData["DEFORMDEFINETYPE"] = 1;
    // 초기강성은 **읽을 때 고른 슬롯에만** 되쓴다. 반대쪽 슬롯에는 이전 힌지
    // 타입에서 쓰던 값이 남아 있어(인계서 6장), 거기에 쓰면 실제로 쓰이는 값은
    // 그대로인 채 안 쓰이는 값만 바뀐다.
    // 슬롯이 없으면(타입 4/5 등) 사용자가 못 고치는 자리이므로 원본을 보존한다.
    // 초기강성 타입. 표에서 바꿀 수 있으므로 그대로 되쓴다.
    const stiffType = DATA["INITSTIFFTYPE"];
    if (stiffType !== undefined && stiffType !== null) {
      propData["INITSTIFFTYPE"] = stiffType;
    }

    // 값은 **사용자 지정(3)일 때만** 쓴다. 그 밖의 타입은 CIVIL 이 계산하는
    // 값이라 슬롯을 건드리면 안 되고, 원본이 그대로 따라간다.
    const k0Slot = DATA["K0_SLOT"];
    const k0Input = DATA["K0_INPUT"];
    if (stiffType === InitStiffness.TYPE_USER && k0Slot && k0Input !== undefined && k0Input !== null) {
      propData[k0Slot] = k0Input;
    } else if (!("INITSTIFFNESS" in propData)) {
      // 신규 레코드는 TEMPLATE 에서 시작해 이 필드가 없다. 서버 기본값을 채운다.
      propData["INITSTIFFNESS"] = nz(DATA["INITSTIFFNESS"]);
    }
    propData["PALPHADELTA"] = tableType === "1" ? 1 : 0;

    // COMPONENTPROPS 는 원본을 기반으로 삼고 관리하는 필드만 덮어쓴다.
    //
    // 통째로 새로 만들면 이 탭이 쓰지 않는 자리가 사라진다. 예를 들어 4절선
    // 힌지를 탭2(P-alpha)로 저장하면 점이 3쌍이라 4번째 슬롯
    // (FRACTUREMOMENT / YIELDROTN4TH ...)을 아무도 쓰지 않는데, 그 자리를
    // 지워 보내면 서버가 초기화되지 않은 메모리를 돌려준다. 그러면 편집이
    // 없어도 원본과 달라 보여 그 행이 매번 재전송된다.
    //
    // 모델이 바뀌면 buildRecord 가 propData 를 빈 객체로 시작하므로,
    // 여기로 옛 모델의 값이 딸려 오지는 않는다.
    let cprops: Rec = propData["COMPONENTPROPS"];
    if (!isObj(cprops)) cprops = {};
    propData["COMPONENTPROPS"] = cprops;
    cprops["DEFORMCAPACITY"] = clone(DEFAULT_DEFORM);

    // 데이터 점 기록
    //
    // 축이 세 개다.
    //   isPD    탭1(P-D)이면 변위가 입력, 탭2(P-alpha)면 강성비가 입력
    //   isForce 성분 0~2 는 힘/변위, 3~5 는 모멘트/회전각에 실제 값이 들어간다
    //   slot    절선 슬롯. pointSlots 가 PND 와 절선수로부터 정한다
    //
    // 서버는 힘·모멘트·변위·회전·강성비를 전부 required 로 요구하므로,
    // 그 모드에서 입력이 아닌 자리도 placeholder 로 채워야 한다.
    const isPD = tableType === "1";
    const pnd: number = DATA["PND"];
    const dataType = isPD ? pnd : pnd + 1;
    const isForce = Component < 3;

    pointSlots(pnd, dataType).forEach((slot, i) => {
      const point = DATA["P_DATA"][i];
      const dummyPoint = [...(slot === 0 ? DEFAULT_CRACK : DEFAULT_FORCE)];
      const dummy = Math.round(0.1 * (slot + 1) * 10) / 10;
      const dummyStep = [dummy, dummy];
      const step = isPD ? DATA["D_DATA"][i] : null;

      cprops[FORCE_FIELDS[slot]] = isForce ? point : dummyPoint;
      cprops[MOMENT_FIELDS[slot]] = isForce ? dummyPoint : point;

      cprops[DISP_FIELDS[slot]] = isPD && isForce ? step : dummyStep;
      cprops[ROTN_FIELDS[slot]] = isPD && !isForce ? step : dummyStep;
    });

    // 강성비는 점보다 한 칸 적다. 탭2 는 A_DATA 가 입력이고, 탭1 은 입력이
    // 아니지만 STIFFRATIO2ND 가 서버 required 라 placeholder 로 채운다.
    stiffSlots(dataType).forEach((slot, i) => {
      cprops[STIFF_FIELDS[slot]] = !isPD ? DATA["A_DATA"][i] : [...DEFAULT_STIFFRATIO];
    });

    // others
    // FE는 BETA/ALPA/GAMMA/INIT_GAP을 모델과 무관하게 항상 실어 보내므로
    // (특히 INIT_GAP은 값이 비어도 [null, null] 이라 truthy) 여기서 걸러낸다.
    const extraField = ALL_History_Prop_ExtraField[modelPropName] || [];
    const rawGap = DATA["INIT_GAP"];
    const initGap: any[] = Array.isArray(rawGap) && rawGap.length > 0 ? rawGap : [null, null];
    const extras: [string, any][] = [
      ["UNLOADSTIFFCALCEXPO", DATA["BETA"]],
      ["UNLOADSTIFFREDUFAC", DATA["ALPA"]],
      ["PINCHINGRULEFAC", DATA["GAMMA"]],
      ["INITGAPPOSITIVE", initGap[0]],
      ["INITGAPNEGATIVE", initGap[1]],
    ];
    for (const [field, v] of extras) {
      if (extraField.includes(field) && v !== undefined && v !== null) propData[field] = v;
    }

    // required 보정
    // 위 루프는 데이터 점이 있는 슬롯만 채운다. 그 밖의 자리에도 DTO 가 required 로
    // 요구하는 필드가 있어, 비워 두면 서버가 'Wrong Field' 로 거부한다.
    // 실제 모델의 레코드도 이 자리에 placeholder([1,1] / 0.1*n)를 담고 있으므로
    // 같은 값으로 채운다. 이미 실제 값이 들어간 필드는 건드리지 않는다.
    const fills: [string, number[]][] = [
      ["YIELDFORCE", DEFAULT_FORCE],
      ["YIELDMOMENT", DEFAULT_FORCE],
      ["ULTIMATEFORCE", DEFAULT_FORCE],
      ["ULTIMATEMOMENT", DEFAULT_FORCE],
      ["YIELDDISP2ND", DEFAULT_DISP_2ND],
      ["YIELDROTN2ND", DEFAULT_DISP_2ND],
      ["YIELDDISP3RD", DEFAULT_DISP_3RD],
      ["YIELDROTN3RD", DEFAULT_DISP_3RD],
      ["STIFFRATIO2ND", DEFAULT_STIFFRATIO],
    ];
    for (const [field, fill] of fills) {
      if (!(field in cprops)) cprops[field] = [...fill];
    }
  }

  /** 표 DATA -> MULTLIN prop 구조체. writeSkeleton 과 마찬가지로 제자리에서 고친다. */
  writeMultilinear(propData: Rec, DATA: Rec) {
    propData["nMultiType"] = 0;
    propData["nDeformDefineType"] = 1;
    propData["dInitStiffP"] = 1;
    propData["dInitStiffN"] = 1;
    propData["dHysParam_Alpha1"] = nz(DATA["dHysParam_Alpha1"]);
    propData["dHysParam_Alpha2"] = nz(DATA["dHysParam_Alpha2"]);
    propData["dHysParam_Beta1"] = nz(DATA["dHysParam_Beta1"]);
    propData["dHysParam_Beta2"] = nz(DATA["dHysParam_Beta2"]);
    propData["dHysParam_Eta"] = nz(DATA["dHysParam_Eta"]);
    propData["nType"] = nz(DATA["nType"]);
    propData["dScaleF_Displ"] = 1;
    propData["dScaleF_Force"] = 1;
    propData["DEFORMCAPACITY"] = clone(DEFAULT_DEFORM);
  }
}
