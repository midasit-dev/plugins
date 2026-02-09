// VBA: UNIT.bas — 단위 변환 함수
// N→kN, mm→m, mm²→m², 1/mm²→1/m²

/** N → kN 변환 */
export function changeN_kN(dVal: number): number {
  return dVal * 0.001;
}

/** mm → m 변환 */
export function changeMM_M(dVal: number): number {
  return dVal * 0.001;
}

/** mm² → m² 변환 */
export function changeMM2_M2(dVal: number): number {
  return dVal * 0.001 * 0.001;
}

/** /mm² → /m² 변환 (역변환) */
export function change_par_MM2_M2(dVal: number): number {
  return dVal / 0.001 / 0.001;
}
