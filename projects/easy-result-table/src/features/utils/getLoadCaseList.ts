/**
 * @fileoverview 하중 리스트 불러오는 함수
 */

import { midasAPI } from "./common";

type STLDData = Record<string, { NAME: string }>;
type SPLCData = Record<string, { NAME: string; bACCECC: boolean }>;
type LCOMData = Record<string, { NAME: string; ACTIVE: string; iTYPE: number }>;

/**
 * @description GET LOAD CASE (Default)
 */
export async function getLoadCase() {
  try {
    const res_stld = await midasAPI("GET", "/db/stld", {});
    const res_splc = await midasAPI("GET", "/db/splc", {});
    const res_lcom = await midasAPI("GET", "/db/lcom-gen", {});

    if (!res_stld || !res_stld.STLD) {
      throw new Error("Invalid STLD response from server");
    }
    if (!res_splc || !res_splc.SPLC) {
      throw new Error("Invalid SPLC response from server");
    }
    if (!res_lcom || !res_lcom["LCOM-GEN"]) {
      throw new Error("Invalid LCOM-GEN response from server");
    }

    const st_list = Object.values(res_stld.STLD as STLDData).map(
      (item) => `${item.NAME}(ST)`
    );

    const rs_list = Object.values(res_splc.SPLC as SPLCData).map(
      (item) => `${item.NAME}(RS)`
    );

    const es_list = Object.values(res_splc.SPLC as SPLCData)
      .filter((item) => item.bACCECC)
      .map((item) => `${item.NAME}(ES)`);

    const cb_list = Object.values(res_lcom["LCOM-GEN"] as LCOMData)
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

    if (!res_stld || !res_stld.STLD) {
      throw new Error("Invalid STLD response from server");
    }

    const st_list = Object.values(res_stld.STLD as STLDData).map(
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

    if (!res_splc || !res_splc.SPLC) {
      throw new Error("Invalid SPLC response from server");
    }

    const rs_list = Object.values(res_splc.SPLC as SPLCData).map(
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

    if (!res_stld || !res_stld.STLD) {
      throw new Error("Invalid STLD response from server");
    }
    if (!res_splc || !res_splc.SPLC) {
      throw new Error("Invalid SPLC response from server");
    }

    const st_list = Object.values(res_stld.STLD as STLDData).map(
      (item) => `${item.NAME}(ST)`
    );
    const rs_list = Object.values(res_splc.SPLC as SPLCData).map(
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

    if (!res_stld || !res_stld.STLD) {
      throw new Error("Invalid response from server");
    }

    const st_list = Object.values(res_stld.STLD as STLDData).map(
      (item) => `${item.NAME}`
    );

    return st_list;
  } catch (error) {
    console.error("Error fetching static load name case:", error);
    throw error;
  }
}
