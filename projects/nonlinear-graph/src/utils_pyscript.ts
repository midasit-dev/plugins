/**
 *
 * ██╗   ██╗████████╗██╗██╗       ██╗     ██╗██████╗ ██╗   ██╗██╗
 * ██║   ██║╚══██╔══╝██║██║      ███║    ██╔╝██╔══██╗╚██╗ ██╔╝╚██╗
 * ██║   ██║   ██║   ██║██║█████╗╚██║    ██║ ██████╔╝ ╚████╔╝  ██║
 * ██║   ██║   ██║   ██║██║╚════╝ ██║    ██║ ██╔═══╝   ╚██╔╝   ██║
 * ╚██████╔╝   ██║   ██║███████╗  ██║    ╚██╗██║        ██║   ██╔╝
 *  ╚═════╝    ╚═╝   ╚═╝╚══════╝  ╚═╝     ╚═╝╚═╝        ╚═╝   ╚═╝
 *
 * @description Functions for executing python script in typescript
 * @linkcode ./public/py_main.py
 */

import { VerifyUtil } from "@midasit-dev/moaui";

/**
 * PyScript(Pyodide) 준비를 기다린다.
 *
 * 예전에는 콜백을 동기로 호출하고, 준비 전이면 아무것도 반환하지 않아 호출부가
 * undefined 를 받았다. Python 전송 계층이 async 로 바뀌면서 모든 브리지 함수가
 * Promise 를 돌려주므로 여기도 Promise 로 통일한다.
 */
export function checkPyScriptReady(): Promise<void> {
  return new Promise((resolve) => {
    const poll = () => {
      if (typeof pyscript !== "undefined" && pyscript && pyscript.interpreter)
        resolve();
      else setTimeout(poll, 100);
    };
    poll();
  });
}

/** 파이썬 전역 함수를 await 로 호출하고 JSON 문자열 반환값을 파싱한다. */
async function callPy(name: string, ...args: any[]): Promise<any> {
  await checkPyScriptReady();
  const func = pyscript.interpreter.globals.get(name);
  const result = await func(...args);
  return JSON.parse(result);
}

//before execute a python main function, insert this function
export function setGlobalVariable() {
  const set_func = pyscript.interpreter.globals.get("set_g_values");
  set_func(
    JSON.stringify({
      g_mapi_key: VerifyUtil.getMapiKey(),
      g_base_uri: VerifyUtil.getBaseUri(),
      g_base_port: VerifyUtil.getBasePort(),
    })
  );
}

export function getGlobalVariable() {
  const get_func = pyscript.interpreter.globals.get("get_g_values");
  const g_values = JSON.parse(get_func());
  console.log(`
┌─┐┬ ┬  ┬┌┐┌┌─┐┌┬┐┌─┐┬  ┬  ┌─┐┌┬┐
├─┘└┬┘  ││││└─┐ │ ├─┤│  │  ├┤  ││
┴   ┴   ┴┘└┘└─┘ ┴ ┴ ┴┴─┘┴─┘└─┘─┴┘

@ Global variables in python script
- MAPI-Key: ${g_values.g_mapi_key}
- Base-Uri: ${g_values.g_base_uri}
- Base-Port: ${g_values.g_base_port}
 `);
}

/**
 * @description this function is for python script to create data in database
 * @see ./public/py_main.py
 */
export function dbCreate(itemName: string, items: any) {
  return callPy("py_db_create", itemName, JSON.stringify(items));
}

export function dbCreateItem(itemName: string, key: string, item: any) {
  return callPy("py_db_create_item", itemName, key, JSON.stringify(item));
}

export function dbRead(itemName: string): Promise<any> {
  return callPy("py_db_read", itemName);
}

export function dbReadItem(itemName: string, key: string): Promise<any> {
  return callPy("py_db_read_item", itemName, key);
}

export function dbUpdate(itemName: string, items: any) {
  return callPy("py_db_update", itemName, JSON.stringify(items));
}

export function dbUpdateItem(itemName: string, key: string, item: any) {
  return callPy("py_db_update_item", itemName, key, JSON.stringify(item));
}

export function dbDelete(itemName: string, item_id: string | number) {
  return callPy("py_db_delete", itemName, item_id);
}

/////////////////////////////////////////////
//////IEHP///////////////////////////////////
/////////////////////////////////////////////
export async function getIEHP(
  ElementValue: number,
  ComponentValue: number
): Promise<any> {
  await checkPyScriptReady();
  const IEHP = pyscript.interpreter.globals.get("IEHP");
  const result = await IEHP("IEHP").loadHinges(ElementValue, ComponentValue);
  return JSON.parse(result);
}

export async function DoRequest(
  ElementValue: number,
  Component: number,
  obj: object
): Promise<any> {
  await checkPyScriptReady();
  const IEHP = pyscript.interpreter.globals.get("IEHP");
  const result = await IEHP("IEHP").saveHinges(
    ElementValue,
    Component,
    JSON.stringify(obj)
  );
  return JSON.parse(result);
}
