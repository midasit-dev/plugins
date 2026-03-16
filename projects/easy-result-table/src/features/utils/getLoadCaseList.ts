/**
 * @fileoverview 하중 리스트 불러오는 함수
 */

import { midasAPI } from "./common";

type STLDData = Record<string, { NAME: string }>;
type SPLCData = Record<string, { NAME: string; bACCECC: boolean }>;
type LCOMData = Record<string, { NAME: string; ACTIVE: string; iTYPE: number }>;

/**
 * 응답이 { message: "" }만 오거나 데이터 키가 없을 때 빈 객체로 취급 (에러 아님)
 */
function getStldMap(res: unknown): STLDData {
  const r = res as { STLD?: STLDData } | null | undefined;
  if (!r?.STLD || typeof r.STLD !== "object") return {};
  return r.STLD;
}

function getSplcMap(res: unknown): SPLCData {
  const r = res as { SPLC?: SPLCData } | null | undefined;
  if (!r?.SPLC || typeof r.SPLC !== "object") return {};
  return r.SPLC;
}

function getLcomGenMap(res: unknown): LCOMData {
  const r = res as { "LCOM-GEN"?: LCOMData } | null | undefined;
  if (!r?.["LCOM-GEN"] || typeof r["LCOM-GEN"] !== "object") return {};
  return r["LCOM-GEN"];
}

/**
 * @description GET LOAD CASE (Default)
 */
export async function getLoadCase() {
  try {
    const res_stld = await midasAPI("GET", "/db/stld", {});
    const res_splc = await midasAPI("GET", "/db/splc", {});
    const res_lcom = await midasAPI("GET", "/db/lcom-gen", {});

    const st_list = Object.values(getStldMap(res_stld)).map(
      (item) => `${item.NAME}(ST)`
    );

    const rs_list = Object.values(getSplcMap(res_splc)).map(
      (item) => `${item.NAME}(RS)`
    );

    const es_list = Object.values(getSplcMap(res_splc))
      .filter((item) => item.bACCECC)
      .map((item) => `${item.NAME}(ES)`);

    const cb_list = Object.values(getLcomGenMap(res_lcom))
      .filter((item) => item.iTYPE === 0 && item.ACTIVE === "ACTIVE")
      .map((item) => `${item.NAME}(CB)`);

    return [...st_list, ...rs_list, ...es_list, ...cb_list];
  } catch (error) {
    console.error("Error fetching load case:", error);
    throw error;
  }
}

/**
 * @description GET STATIC LOAD CASE (Static)
 */
export async function getStaticLoadCase() {
  try {
    const res_stld = await midasAPI("GET", "/db/stld", {});

    const st_list = Object.values(getStldMap(res_stld)).map(
      (item) => `${item.NAME}(ST)`
    );

    return st_list;
  } catch (error) {
    console.error("Error fetching static load case:", error);
    throw error;
  }
}

/**
 * @description GET DYNAMIC LOAD CASE (Dynamic)
 */
export async function getDynamicLoadCase() {
  try {
    const res_splc = await midasAPI("GET", "/db/splc", {});

    const rs_list = Object.values(getSplcMap(res_splc)).map(
      (item) => `${item.NAME}(RS)`
    );

    return rs_list;
  } catch (error) {
    console.error("Error fetching dynamic load case:", error);
    throw error;
  }
}

/**
 * @description GET STATIC DYNAMIC LOAD CASE (Static Dynamic)
 */
export async function getStaticDynamicLoadCase() {
  try {
    const res_stld = await midasAPI("GET", "/db/stld", {});
    const res_splc = await midasAPI("GET", "/db/splc", {});

    const st_list = Object.values(getStldMap(res_stld)).map(
      (item) => `${item.NAME}(ST)`
    );
    const rs_list = Object.values(getSplcMap(res_splc)).map(
      (item) => `${item.NAME}(RS)`
    );

    return [...st_list, ...rs_list];
  } catch (error) {
    console.error("Error fetching static dynamic load case:", error);
    throw error;
  }
}

/**
 * @description GET STATIC NAME LOAD CASE (Parameter)
 */
export async function getStaticLoadNameCase() {
  try {
    const res_stld = await midasAPI("GET", "/db/stld", {});

    const st_list = Object.values(getStldMap(res_stld)).map(
      (item) => `${item.NAME}`
    );

    return st_list;
  } catch (error) {
    console.error("Error fetching static load name case:", error);
    throw error;
  }
}
