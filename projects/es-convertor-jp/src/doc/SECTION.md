# \*SECTION MCT 변환 분석

## 개요

ES(Engineer Studio) 엑셀의 `断面特性ｵﾌﾟｼｮﾝ` 시트를 MIDAS Civil NX의 `*SECTION` 섹션으로 변환

> **중요**: 이 변환은 **2개의 `*SECTION` 블록**을 생성할 수 있습니다:
> 1. **VALUE** 타입: i-단면 = j-단면 (균일 단면)
> 2. **TAPERED** 타입: i-단면 ≠ j-단면 (테이퍼 단면)

---

## 1. 필요한 데이터 시트

### 주요 시트

| 항목    | VBA               | TypeScript            | 상태 |
| ------- | ----------------- | --------------------- | ---- |
| 시트명  | `m_Sheet_Sect`    | `断面特性ｵﾌﾟｼｮﾝ`       | ✓    |
| 시작 행 | 4 (nReadSTRow)    | 4                     | ✓    |
| 열 범위 | B~AD (2~30)       | B~AD (2~30)           | ✓    |

### 의존 시트

| 시트명               | TypeScript 상수      | 용도                                      | 필수 여부       |
| -------------------- | -------------------- | ----------------------------------------- | --------------- |
| `節点座標`           | `NODE`               | MCT 변환의 기본 시트 (노드 매핑)          | **필수**        |
| `フレーム`           | `FRAME`              | 단면 쌍(i-단면, j-단면) 제공              | **필수**        |
| `材料`               | `MATERIAL`           | 재료 매핑, 추가 재료 생성                 | **필수**        |
| `数値断面`           | `NUMB_SECT`          | 단면명 → 재료명 매핑                      | 선택            |
| `断面要素`           | `SECT_ELEM`          | 단면-요소 관계, 재료 매핑                 | 선택            |

> **주의**:
> - `フレーム` 시트가 없으면 단면 쌍을 알 수 없어 변환 불가
> - `節点座標` 시트가 없으면 MCT 파일 생성 자체가 불가

---

## 2. 출력 구조

### 2개의 `*SECTION` 블록

이 변환기는 조건에 따라 **2개의 별도 `*SECTION` 블록**을 생성합니다:

| 출력 블록           | 조건                    | MCT TYPE    | 줄 수/단면 |
| ------------------- | ----------------------- | ----------- | ---------- |
| **VALUE 섹션**      | i-단면 = j-단면         | `VALUE`     | 4줄        |
| **TAPERED 섹션**    | i-단면 ≠ j-단면         | `TAPERED`   | 9줄        |

```
// VALUE 섹션 (균일 단면)
*SECTION    ; Section
; iSEC, TYPE, SNAME, [OFFSET], bSD, bWE, SHAPE, BLT, D1, ..., D8, iCEL
1,VALUE,SectionName,CC,0,0,0,0,0,0,NO,NO,SB,BUILT,0,0,0,0,0,0,0,0,0
0.1,0,0,0.001,0.002,0.003                    ; Line 2: AREA, ASy, ASz, Ixx, Iyy, Izz
0.05,0.05,0.1,0.1,0,0,0,0,0.05,0.1           ; Line 3: CyP, CyM, CzP, CzM...
-0.05,0.05,0.05,-0.05,0.1,0.1,-0.1,-0.1,0,0  ; Line 4: Y1~Z4, Zyy, Zzz

// TAPERED 섹션 (테이퍼 단면)
*SECTION    ; Section
; iSEC, TYPE, SNAME, [OFFSET], bSD, bWE, SHAPE, BLT, D1, ..., D8, iCEL
2,TAPERED,SectionName(TAP),CC,0,0,0,0,0,0,0,0,NO,NO,NO,SB,1,1,VALUE
0,0,0,0,0,0,0,0                              ; Line 2: D11-D18
0.1,0,0,0.001,0.002,0.003                    ; Line 3: i-section props
0.05,0.05,0.1,0.1,0,0,0,0,0,0                ; Line 4: i-section C values
-0.05,0.05,0.05,-0.05,0.1,0.1,-0.1,-0.1,0,0  ; Line 5: i-section Y,Z values
0,0,0,0,0,0,0,0                              ; Line 6: D21-D28
0.08,0,0,0.0008,0.0015,0.002                 ; Line 7: j-section props
0.04,0.04,0.08,0.08,0,0,0,0,0,0              ; Line 8: j-section C values
-0.04,0.04,0.04,-0.04,0.08,0.08,-0.08,-0.08,0,0  ; Line 9: j-section Y,Z values
```

---

## 3. 열 구조 (断面特性ｵﾌﾟｼｮﾝ)

| 열   | 인덱스  | VBA 변수       | TypeScript      | 설명                     |
| ---- | ------- | -------------- | --------------- | ------------------------ |
| B    | row[0]  | strData(0, i)  | name            | 断面名称                 |
| C    | row[1]  | strData(1, i)  | -               | (미사용)                 |
| D    | row[2]  | strData(2, i)  | youngModulus    | ヤング係数 (N/mm²)       |
| E    | row[3]  | strData(3, i)  | -               | (미사용)                 |
| F    | row[4]  | strData(4, i)  | area            | 단면적 A (m²)            |
| G    | row[5]  | strData(5, i)  | iyy             | Iyy (m⁴)                 |
| H    | row[6]  | strData(6, i)  | izz             | Izz (m⁴)                 |
| ...  | ...     | ...            | ...             | ...                      |
| L    | row[10] | strData(10, i) | czP             | CzP                      |
| M    | row[11] | strData(11, i) | czM             | CzM                      |
| N    | row[12] | strData(12, i) | cyM             | CyM                      |
| O    | row[13] | strData(13, i) | cyP             | CyP                      |
| ...  | ...     | ...            | ...             | ...                      |
| S    | row[17] | strData(17, i) | hasOffset       | オフセット有無 (TRUE/FALSE) |
| T    | row[18] | strData(18, i) | hOffset         | 水平オフセット           |
| U    | row[19] | strData(19, i) | vOffset         | 垂直オフセット           |
| ...  | ...     | ...            | ...             | ...                      |
| Z    | row[24] | strData(24, i) | ixx             | Ixx (m⁴)                 |
| ...  | ...     | ...            | ...             | ...                      |
| AD   | row[28] | strData(28, i) | shape           | 断面形状                 |

---

## 4. 처리 경로

### VBA (Class070_Sect.cls)

```
1. dicSect (단면 쌍) 수신 ← Frame에서 생성
2. GetData() → 시트에서 B4:AD~ 데이터 읽기
3. dicSectOption 생성: 단면명 → 인덱스
4. dicSectYoung 생성: 단면명 → Young 계수 (단위 변환)
5. vKeys = dicSect.Keys 순회
6. Split(dicSect(vKeys(i)), "===") → j-단면 목록 추출
7. i-단면 = j-단면 → Set_Value() 호출 (VALUE 섹션)
8. i-단면 ≠ j-단면 → Set_Taperd() 호출 (TAPERED 섹션)
9. m_SectData에 "i-j" → sectNo 매핑 저장
10. VALUE 섹션 MCT 출력
11. TAPERED 섹션 MCT 출력 (별도 열)
```

### TypeScript (SectConverter.ts)

```
1. sectionPairs (단면 쌍) 수신 ← MCTGenerator에서 Frame 데이터로 생성
2. sectOptionIndex 맵 구축: 단면명 → 인덱스
3. sectYoung 맵 구축: 단면명 → Young 계수 (단위 변환)
4. sectionPairs 순회
5. i-단면 = j-단면 → generateValueSection() 호출
6. i-단면 ≠ j-단면 → generateTaperedSection() 호출
7. context.sectionMapping에 "i-j" → sectNo 매핑 저장
8. mctLinesValue 반환 (VALUE 섹션)
9. mctLinesTapered 반환 (TAPERED 섹션)
```

### 처리 경로 비교

| 단계                | VBA                        | TypeScript                  | 상태 |
| ------------------- | -------------------------- | --------------------------- | ---- |
| 단면 쌍 입력        | dicSect (Frame에서)        | sectionPairs (Frame에서)    | ✓    |
| 인덱스 맵           | dicSectOption              | sectOptionIndex             | ✓    |
| Young 계수 매핑     | dicSectYoung               | sectYoung                   | ✓    |
| VALUE 생성          | Set_Value()                | generateValueSection()      | ✓    |
| TAPERED 생성        | Set_Taperd()               | generateTaperedSection()    | ✓    |
| 단면명 자르기       | SectName()                 | truncateSectionName()       | ✓    |
| 매핑 저장           | m_SectData                 | context.sectionMapping      | ✓    |

---

## 5. 단면 쌍 생성 로직

### Frame에서 단면 쌍 추출

VBA (Class020_Frame.ReadFrame):
```vba
' i-단면 없으면 추가
If Not dicSect.Exists(strData(4, i)) Then
  dicSect.Add strData(4, i), strData(5, i)   ' i-단면 → j-단면
Else
  ' 이미 존재하면 j-단면 목록에 추가
  vBuf = Split(dicSect(strData(4, i)), "===")
  ' j-단면이 목록에 없으면 추가
  dicSect(strData(4, i)) = dicSect(strData(4, i)) & "===" & strData(5, i)
End If
```

TypeScript (MCTGenerator.ts):
```typescript
const sectionPairs = new Map<string, string[]>();
for (const row of frameData) {
  const iSect = String(row[4] || '');
  const jSect = String(row[5] || iSect);

  if (!sectionPairs.has(iSect)) {
    sectionPairs.set(iSect, []);
  }
  const existing = sectionPairs.get(iSect)!;
  if (!existing.includes(jSect)) {
    existing.push(jSect);
  }
}
```

---

## 6. 단면 형상 매핑 (dicSectList)

| 日本語              | MCT 코드 |
| ------------------- | -------- |
| 山形断面            | L        |
| 溝形断面            | C        |
| H-断面              | H        |
| T-断面              | T        |
| ボックス断面        | B        |
| パイプ断面          | P        |
| 2山形断面           | 2L       |
| 2溝形断面           | 2C       |
| 矩形                | SB       |
| 円形                | SR       |
| 中空八角形          | OCT      |
| 八角形              | SOCT     |
| 矩形-八角形         | ROCT     |
| 中空小判形          | TRK      |
| 小判形              | STRK     |
| 半小判形            | HTRK     |
| (빈값)              | SB       |

---

## 7. 단위 변환

### Young 계수 변환

```
입력: E (N/mm²)
출력: E (kN/m²)

공식: E_out = E_in * 1000 / 1e-6 = E_in * 1e9

VBA: ChangeN_kN(dValue) / ChangeMM2_M2(1)
TS:  changeN_kN(young) / changeMM2_M2(1)
```

---

## 8. VBA와 차이점

| 항목              | VBA                      | TypeScript                  | 영향      |
| ----------------- | ------------------------ | --------------------------- | --------- |
| 출력 위치         | 별도 열 (MCT 시트)       | 배열 분리 후 합침           | 동일 결과 |
| 단면명 자르기     | SectName (28자 제한)     | truncateSectionName         | 동일 기능 |
| dicSect 구분자    | "===" (문자열)           | string[] (배열)             | 동일 기능 |

---

## 9. Context에 저장되는 데이터

| Map              | Key                    | Value              | 용도                        |
| ---------------- | ---------------------- | ------------------ | --------------------------- |
| sectionMapping   | "i단면-j단면" (string) | 단면 번호 (number) | 요소에서 단면 번호 조회     |
| maxSectionNo     | -                      | number             | 다음 단면 번호 시작점       |

---

## 10. 관련 변환기

### 평판 단면 (PlnSect) - 별도 출력

`平板断面` 시트는 `*THICKNESS` 섹션을 생성합니다 (별도 변환기).

| 항목    | VBA               | TypeScript        |
| ------- | ----------------- | ----------------- |
| 시트명  | `m_Sheet_PlnSect` | `平板断面`        |
| 출력    | `*THICKNESS`      | `*THICKNESS`      |
| 시작 행 | 3                 | 3                 |
| 열 범위 | B~G (2~7)         | B~G (2~7)         |

---

## 11. 결론

**✓ \*SECTION 변환은 VBA와 완전히 일치합니다.**

- 필요한 시트: `断面特性ｵﾌﾟｼｮﾝ` (주요), `フレーム` (의존), `節点座標` (의존), `材料` (의존)
- 선택적 시트: `数値断面`, `断面要素`
- 처리 경로: 문제 없음
- 누락된 기능: 없음

> **핵심 포인트**:
> 1. **2개의 `*SECTION` 블록** 생성 가능 (VALUE + TAPERED)
> 2. 단면 쌍은 **`フレーム` 시트에서 추출**
> 3. `*THICKNESS`는 별도 변환기 (`PlnSectConverter`)

---

## 데이터 입력 예제

### Excel 시트 (`断面特性ｵﾌﾟｼｮﾝ`) - 주요 열만

|     | B         | D      | F      | G       | H       | AD       |
| --- | --------- | ------ | ------ | ------- | ------- | -------- |
| 3   | 断面名称  | ヤング | A(m²)  | Iyy(m⁴) | Izz(m⁴) | 形状     |
| 4   | Rect-500  | 23500  | 0.25   | 0.0052  | 0.0052  | 矩形     |
| 5   | Rect-400  | 23500  | 0.16   | 0.0021  | 0.0021  | 矩形     |
| 6   | H-300     | 200000 | 0.0082 | 0.00012 | 0.00004 | H-断面   |

### Excel 시트 (`フレーム`) - 단면 열만

|     | E (i-断面) | F (j-断面) |
| --- | ---------- | ---------- |
| 4   | Rect-500   | Rect-500   |
| 5   | Rect-500   | Rect-400   |
| 6   | H-300      | H-300      |

### 변환 결과

위 데이터에서:
- Row 4: i=j (Rect-500 = Rect-500) → **VALUE** 섹션
- Row 5: i≠j (Rect-500 ≠ Rect-400) → **TAPERED** 섹션
- Row 6: i=j (H-300 = H-300) → **VALUE** 섹션

### MCT 출력 결과

```
*SECTION    ; Section
; iSEC, TYPE, SNAME, [OFFSET], bSD, bWE, SHAPE, BLT, D1, ..., D8, iCEL              ; 1st line - VALUE
;       AREA, ASy, ASz, Ixx, Iyy, Izz                                               ; 2nd line
;       CyP, CyM, CzP, CzM, QyB, QzB, PERI_OUT, PERI_IN, Cy, Cz                     ; 3rd line
;       Y1, Y2, Y3, Y4, Z1, Z2, Z3, Z4, Zyy, Zzz                                    ; 4th line
; [OFFSET] : OFFSET, iCENT, iREF, iHORZ, HUSER, iVERT, VUSER
1,VALUE,Rect-500,CC,0,0,0,0,0,0,NO,NO,SB,BUILT,0,0,0,0,0,0,0,0,0
0.25,0,0,0,0.0052,0.0052
0.25,0.25,0.25,0.25,0,0,0,0,0.25,0.25
-0.25,0.25,0.25,-0.25,0.25,0.25,-0.25,-0.25,0,0
3,VALUE,H-300,CC,0,0,0,0,0,0,NO,NO,H,BUILT,0,0,0,0,0,0,0,0,0
0.0082,0,0,0,0.00012,0.00004
0.15,0.15,0.05,0.05,0,0,0,0,0.15,0.05
-0.15,0.15,0.15,-0.15,0.05,0.05,-0.05,-0.05,0,0

*SECTION    ; Section
; iSEC, TYPE, SNAME, [OFFSET], bSD, bWE, SHAPE, BLT, D1, ..., D8, iCEL              ; 1st line - TAPERED
;       D11, D12, D13, D14, D15, D16, D17, D18                                      ; 2nd line
;       AREA1, ASy1, ASz1, Ixx1, Iyy1, Izz1                                         ; 3rd line
;       CyP1, CyM1, CzP1, CzM1, QyB1, QzB1, PERI_OUT1, PERI_IN1, Cy1, Cz1           ; 4th line
;       Y11, Y12, Y13, Y14, Z11, Z12, Z13, Z14, Zyy1, Zzz1                          ; 5th line
;       D21, D22, D23, D24, D25, D26, D27, D28                                      ; 6th line
;       AREA2, ASy2, ASz2, Ixx2, Iyy2, Izz2                                         ; 7th line
;       CyP2, CyM2, CzP2, CzM2, QyB2, QzB2, PERI_OUT2, PERI_IN2, Cy2, Cz2           ; 8th line
;       Y21, Y22, Y23, Y24, Z21, Z22, Z23, Z24, Zyy2, Zzz2                          ; 9th line
; [OFFSET2]: OFFSET, iCENT, iREF, iHORZ, HUSERI, HUSERJ, iVERT, VUSERI, VUSERJ
2,TAPERED,Rect-500(TAP),CC,0,0,0,0,0,0,0,0,NO,NO,NO,SB,1,1,VALUE
0,0,0,0,0,0,0,0
0.25,0,0,0,0.0052,0.0052
0.25,0.25,0.25,0.25,0,0,0,0,0,0
-0.25,0.25,0.25,-0.25,0.25,0.25,-0.25,-0.25,0,0
0,0,0,0,0,0,0,0
0.16,0,0,0,0.0021,0.0021
0.2,0.2,0.2,0.2,0,0,0,0,0,0
-0.2,0.2,0.2,-0.2,0.2,0.2,-0.2,-0.2,0,0
```

### 단면 매핑 결과

| Key              | 단면 번호 |
| ---------------- | --------- |
| Rect-500-Rect-500 | 1        |
| Rect-500-Rect-400 | 2        |
| H-300-H-300       | 3        |
