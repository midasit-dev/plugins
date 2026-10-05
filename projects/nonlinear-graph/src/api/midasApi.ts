/**
 * MIDAS API 전송 계층.
 *
 * 예전 py_base.py 의 requests_json / MidasAPI 를 그대로 옮겼다. Python 쪽도
 * 브라우저 fetch 를 빌려 쓰고 있었으므로 동작은 같고, JSON 문자열 왕복만 사라졌다.
 */

export type JsonRecord = Record<string, any>;

// 기본값. Wrapper 가 기동 시 setGlobalValues 로 덮어쓴다.
let g_mapi_key = "";
let g_base_uri = "moa-engineers.midasit.com";
let g_base_port = "443";

export interface GlobalValues {
  g_mapi_key: string;
  g_base_uri: string;
  g_base_port: string;
}

export function setGlobalValues(values: GlobalValues) {
  g_mapi_key = values.g_mapi_key;
  g_base_uri = values.g_base_uri;
  g_base_port = values.g_base_port;
}

export function getGlobalValues(): GlobalValues {
  return { g_mapi_key, g_base_uri, g_base_port };
}

export function errorDict(prefix = "", message = "", postfix = ""): JsonRecord {
  return {
    error: `Error: ${prefix} ${message !== "" ? message : "request is failed..."} ${postfix}`,
  };
}

function isJsonText(text: string) {
  const t = text.trim();
  return (t.startsWith("{") && t.endsWith("}")) || (t.startsWith("[") && t.endsWith("]"));
}

function responseHandler(text: string, url: string): any {
  if (isJsonText(text)) return JSON.parse(text);
  return errorDict("", "", url);
}

/** 실패해도 예외를 올리지 않고 {error} 를 돌려준다. 호출부는 "error" 키로 판별한다. */
async function send(
  method: string,
  url: string,
  headers: Record<string, string>,
  jsonObj?: any
): Promise<any> {
  try {
    const options: RequestInit = { method, headers };
    if (jsonObj !== undefined) options.body = JSON.stringify(jsonObj);
    const response = await fetch(url, options);
    const text = await response.text();
    return responseHandler(text, url);
  } catch {
    return errorDict("", "", url);
  }
}

export const requestJson = {
  post: (url: string, headers: Record<string, string>, jsonObj: any) =>
    send("POST", url, headers, jsonObj),
  get: (url: string, headers: Record<string, string>) => send("GET", url, headers),
  put: (url: string, headers: Record<string, string>, jsonObj: any) =>
    send("PUT", url, headers, jsonObj),
  delete: (url: string, headers: Record<string, string>) => send("DELETE", url, headers),
};

export enum Product {
  CIVIL = 1,
  GEN = 2,
}

function getBaseUrl(product: Product) {
  const path = product === Product.GEN ? "gen" : "civil";
  return `https://${g_base_uri}:${g_base_port}/${path}`;
}

export class MidasAPI {
  product: Product;
  baseUrl: string;
  headers: Record<string, string>;

  constructor(product: Product = Product.CIVIL) {
    this.product = product;
    this.baseUrl = getBaseUrl(product);
    this.headers = {
      "MAPI-Key": g_mapi_key,
      "Content-Type": "application/json",
    };
  }

  // doc ------------------------------------------------------------------
  docOpen(filePath: string) {
    return requestJson.post(`${this.baseUrl}/doc/open`, this.headers, { Argument: filePath });
  }
  docAnal() {
    return requestJson.post(`${this.baseUrl}/doc/anal`, this.headers, {});
  }

  // db -------------------------------------------------------------------
  dbCreate(itemName: string, items: JsonRecord) {
    return requestJson.post(`${this.baseUrl}/db/${itemName}`, this.headers, { Assign: items });
  }
  dbCreateItem(itemName: string, itemId: string | number, item: JsonRecord) {
    return requestJson.post(`${this.baseUrl}/db/${itemName}/${itemId}`, this.headers, {
      Assign: item,
    });
  }

  /** 성공 시 {키: 레코드}. 실패 시 {error}. 키는 문자열이다. */
  async dbRead(itemName: string): Promise<JsonRecord> {
    const responseJson = await requestJson.get(`${this.baseUrl}/db/${itemName}`, this.headers);
    if (!responseJson || !(itemName in responseJson)) {
      return { error: `Error: Unable to find the registry key or value for ${itemName}` };
    }
    return responseJson[itemName];
  }

  async dbReadItem(itemName: string, itemId: string | number): Promise<any> {
    const idStr = String(itemId);
    const responseJson = await requestJson.get(
      `${this.baseUrl}/db/${itemName}/${idStr}`,
      this.headers
    );
    if (!responseJson || !(itemName in responseJson)) {
      return { error: `Error: Unable to find the registry key or value for ${itemName}` };
    }
    if (!(idStr in responseJson[itemName])) {
      return { error: `Error: Unable to find the registry key or value for ${itemId}` };
    }
    return responseJson[itemName][idStr];
  }

  dbUpdate(itemName: string, items: JsonRecord) {
    return requestJson.put(`${this.baseUrl}/db/${itemName}`, this.headers, { Assign: items });
  }
  dbUpdateItem(itemName: string, itemId: string | number, item: JsonRecord) {
    return requestJson.put(`${this.baseUrl}/db/${itemName}/${itemId}`, this.headers, {
      Assign: item,
    });
  }
  dbDelete(itemName: string, itemId: string | number) {
    return requestJson.delete(`${this.baseUrl}/db/${itemName}/${itemId}`, this.headers);
  }

  // ope ------------------------------------------------------------------
  /** GET /ope/{name}. db/SECT 에는 없는 계산값(SECTPROP 등)을 읽을 때 쓴다. */
  opeGet(name: string) {
    return requestJson.get(`${this.baseUrl}/ope/${name}`, this.headers);
  }

  // view -----------------------------------------------------------------
  async viewSelectGet() {
    const response = await requestJson.get(`${this.baseUrl}/view/select`, this.headers);
    return response?.SELECT;
  }
}

/** 응답이 {error} 인지 판별한다. */
export function isApiError(res: any): boolean {
  return !res || typeof res !== "object" || Boolean(res.error);
}
