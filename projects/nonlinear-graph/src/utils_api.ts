/**
 *
 * ██╗   ██╗████████╗██╗██╗       ██╗      █████╗ ██████╗ ██╗
 * ██║   ██║╚══██╔══╝██║██║      ███║     ██╔══██╗██╔══██╗██║
 * ██║   ██║   ██║   ██║██║█████╗╚██║     ███████║██████╔╝██║
 * ██║   ██║   ██║   ██║██║╚════╝ ██║     ██╔══██║██╔═══╝ ██║
 * ╚██████╔╝   ██║   ██║███████╗  ██║     ██║  ██║██║     ██║
 *  ╚═════╝    ╚═╝   ╚═╝╚══════╝  ╚═╝     ╚═╝  ╚═╝╚═╝     ╚═╝
 *
 * @description MIDAS API 호출 진입점. 예전 utils_pyscript.ts 와 같은 이름을 내보낸다.
 *
 * PyScript(Pyodide) 시절에는 여기서 Python 전역 함수를 꺼내 JSON 문자열로 주고받았다.
 * 지금은 같은 로직이 src/api, src/iehp 에 TypeScript 로 있어 바로 부른다.
 * 컴포넌트 쪽 시그니처는 그대로다.
 */

import { VerifyUtil } from "@midasit-dev/moaui";
import { MidasAPI, setGlobalValues, getGlobalValues } from "./api/midasApi";
import { IEHP } from "./iehp/iehp";
import { LOADED } from "./iehp/loaded";
import { STIFFNESS } from "./iehp/stiffness";

// 브라우저 콘솔 디버깅용. Python 시절 LOADED / STIFFNESS 를 콘솔에서 보던 관행을 유지한다.
(window as any).IEHP_DEBUG = { LOADED, STIFFNESS };

/** 기동 시 한 번, MAPI-Key / Base URI / Port 를 API 계층에 넣는다. */
export function setGlobalVariable() {
  setGlobalValues({
    g_mapi_key: VerifyUtil.getMapiKey(),
    g_base_uri: VerifyUtil.getBaseUri(),
    g_base_port: String(VerifyUtil.getBasePort()),
  });
}

export function getGlobalVariable() {
  const g_values = getGlobalValues();
  console.log(`
┌─┐┌─┐┬  ┬┌┐┌┌─┐┌┬┐┌─┐┬  ┬  ┌─┐┌┬┐
├─┤├─┘│  ││││└─┐ │ ├─┤│  │  ├┤  ││
┴ ┴┴  ┴  ┴┘└┘└─┘ ┴ ┴ ┴┴─┘┴─┘└─┘─┴┘

@ Global variables for MIDAS API
- MAPI-Key: ${g_values.g_mapi_key}
- Base-Uri: ${g_values.g_base_uri}
- Base-Port: ${g_values.g_base_port}
 `);
}

const api = () => new MidasAPI();

export function dbCreate(itemName: string, items: any) {
  return api().dbCreate(itemName, items);
}

export function dbCreateItem(itemName: string, key: string, item: any) {
  return api().dbCreateItem(itemName, key, item);
}

/** 성공 시 {키: 레코드}. 실패 시 {error}. */
export function dbRead(itemName: string): Promise<any> {
  return api().dbRead(itemName);
}

export function dbReadItem(itemName: string, key: string): Promise<any> {
  return api().dbReadItem(itemName, key);
}

export function dbUpdate(itemName: string, items: any) {
  return api().dbUpdate(itemName, items);
}

export function dbUpdateItem(itemName: string, key: string, item: any) {
  return api().dbUpdateItem(itemName, key, item);
}

export function dbDelete(itemName: string, item_id: string | number) {
  return api().dbDelete(itemName, item_id);
}

/////////////////////////////////////////////
//////IEHP///////////////////////////////////
/////////////////////////////////////////////
export function getIEHP(ElementValue: number, ComponentValue: number): Promise<any> {
  return new IEHP("IEHP").loadHinges(ElementValue, ComponentValue);
}

export function DoRequest(ElementValue: number, Component: number, obj: object): Promise<any> {
  return new IEHP("IEHP").saveHinges(ElementValue, Component, obj);
}
