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
  const res_stld = await midasAPI("GET", "/db/stld", {});
  const res_splc = await midasAPI("GET", "/db/splc", {});
  const res_lcom = await midasAPI("GET", "/db/lcom-gen", {});

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
}

/**
 * @description GET STATIC LOAD CASE (Static)
 */
export async function getStaticLoadCase() {
  const res_stld = await midasAPI("GET", "/db/stld", {});

  const st_list = Object.values(res_stld.STLD as STLDData).map(
    (item) => `${item.NAME}(ST)`
  );

  return st_list;
}

/**
 * @description GET DYNAMIC LOAD CASE (Dynamic)
 */
export async function getDynamicLoadCase() {
  const res_splc = await midasAPI("GET", "/db/splc", {});

  const rs_list = Object.values(res_splc.SPLC as SPLCData).map(
    (item) => `${item.NAME}(RS)`
  );

  return rs_list;
}

/**
 * @description GET STATIC DYNAMIC LOAD CASE (Static Dynamic)
 */
export async function getStaticDynamicLoadCase() {
  const res_stld = await midasAPI("GET", "/db/stld", {});
  const res_splc = await midasAPI("GET", "/db/splc", {});

  const st_list = Object.values(res_stld.STLD as STLDData).map(
    (item) => `${item.NAME}(ST)`
  );
  const rs_list = Object.values(res_splc.SPLC as SPLCData).map(
    (item) => `${item.NAME}(RS)`
  );

  return [...st_list, ...rs_list];
}

/**
 * @description GET STATIC NAME LOAD CASE (Parameter)
 */
export async function getStaticLoadNameCase() {
  const res_stld = await midasAPI("GET", "/db/stld", {});

  const st_list = Object.values(res_stld.STLD as STLDData).map(
    (item) => `${item.NAME}`
  );

  return st_list;
}
