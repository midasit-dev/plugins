# \*STLDCASE MCT 변환 분석

## 개요

ES(Engineer Studio) 엑셀의 `荷重` 시트를 MIDAS Civil NX의 `*STLDCASE` 및 관련 하중 섹션으로 변환

> **참고**: STLDCASE는 정적 하중 케이스를 정의합니다.
> 실제 하중 데이터는 `*USE-STLD` 래퍼와 함께 별도 섹션으로 출력됩니다.

---

## 1. 필요한 데이터 시트

### 주요 시트

| 항목    | VBA              | TypeScript        | 상태 |
| ------- | ---------------- | ----------------- | ---- |
| 시트명  | `m_Sheet_Load`   | `荷重`            | ✓    |
| 시작 행 | 3 (nReadSTRow)   | 3                 | ✓    |
| 열 범위 | B~T (2~20)       | B~T (2~20)        | ✓    |

### 열 구조

| 열  | 인덱스  | VBA 변수        | TypeScript      | 설명                              |
| --- | ------- | --------------- | --------------- | --------------------------------- |
| B   | row[0]  | strData(0, i)   | -               | (미사용)                          |
| C   | row[1]  | strData(1, i)   | LOAD_TYPE       | 하중 유형                         |
| D   | row[2]  | strData(2, i)   | LOAD_CASE       | 하중 케이스명                     |
| E   | row[3]  | strData(3, i)   | ACTION_TYPE     | 작용 유형 (並進荷重/モーメント)   |
| F   | row[4]  | strData(4, i)   | TARGET          | 대상 노드/요소명 (콤마 구분)      |
| G   | row[5]  | strData(5, i)   | VALUE1          | P1 값                             |
| H   | row[6]  | strData(6, i)   | VALUE2          | P2 값                             |
| I~L | row[7-10]| strData(7-10, i)| VALUE3~6        | 추가 값                           |
| M   | row[11] | strData(11, i)  | ECCENTRICITY    | 편심값                            |
| N   | row[12] | strData(12, i)  | COORD_TYPE      | 좌표 유형 (座標指定/ベクトル指定) |
| O   | row[13] | strData(13, i)  | DIRECTION       | 방향 (全体 X/Y/Z, 要素 X/Y/Z)     |
| P   | row[14] | strData(14, i)  | VECTOR_X        | X성분 또는 "モーメント"           |
| Q   | row[15] | strData(15, i)  | VECTOR_Y        | Y성분                             |
| R   | row[16] | strData(16, i)  | VECTOR_Z        | Z성분                             |
| S   | row[17] | strData(17, i)  | ALPHA           | Alpha 각도                        |
| T   | row[18] | strData(18, i)  | BETA            | Beta 각도                         |

### 의존 시트

| 시트명       | TypeScript 상수 | 용도                          | 필수 여부 |
| ------------ | --------------- | ----------------------------- | --------- |
| `節点座標`   | `NODE`          | 노드 번호 매핑                | **필수**  |
| `フレーム要素`| `FRAME`        | 요소 번호 매핑                | 선택*     |
| `剛体要素`   | `RIGID`         | 강체 마스터 노드 조회         | 선택*     |

> **참고**: 하중 유형에 따라 필요한 의존 시트가 달라집니다.

---

## 2. 출력 구조

### MCT 블록 개요

| MCT 섹션      | 하중 유형                           | 설명                    |
| ------------- | ----------------------------------- | ----------------------- |
| `*STLDCASE`   | 모든 유형                           | 하중 케이스 정의        |
| `*CONLOAD`    | ノード-集中荷重, 剛体要素荷重       | 집중 하중               |
| `*SPDISP`     | ノード-強制変位                     | 강제 변위               |
| `*BEAMLOAD`   | フレーム要素-* (4가지 유형)         | 보 요소 하중            |
| `*ELTEMPER`   | 温度荷重                            | 온도 하중               |

### 2.1 *STLDCASE 형식

```
*STLDCASE    ; Static Load Cases
; LCNAME, LCTYPE, DESC
   Dead,USER,
   Live,USER,
   Seismic,USER,
```

### 필드 설명

| 필드     | 설명              | 값                    |
| -------- | ----------------- | --------------------- |
| LCNAME   | 하중 케이스 이름  | dicLoadName.keys()    |
| LCTYPE   | 하중 케이스 타입  | 항상 `USER`           |
| DESC     | 설명              | 항상 빈값             |

### 2.2 *USE-STLD 래퍼 구조

각 하중 데이터는 `*USE-STLD` 래퍼로 감싸져 출력됩니다:

```
*USE-STLD, Dead

*CONLOAD    ; Nodal Loads
; NODE_LIST, FX, FY, FZ, MX, MY, MZ, GROUP,STRTYPENAME
   1,100,0,0,0,0,0,,

; End of data for load case [Dead] -------------------------
```

---

## 3. 하중 유형 딕셔너리

### VBA (lines 106-113)

```vba
dicType.Add "ノード-集中荷重", 1
dicType.Add "剛体要素荷重", 2
dicType.Add "ノード-強制変位", 3
dicType.Add "フレーム要素-集中荷重", 4
dicType.Add "フレーム要素-分布荷重(単独)", 5
dicType.Add "フレーム要素-分布荷重(連続)", 6
dicType.Add "フレーム要素-射影面荷重", 7
dicType.Add "温度荷重", 8
```

### TypeScript (LOAD_TYPES)

```typescript
const LOAD_TYPES: Record<string, number> = {
  'ノード-集中荷重': 1,           // → *CONLOAD
  '剛体要素荷重': 2,              // → *CONLOAD (마스터 노드 사용)
  'ノード-強制変位': 3,           // → *SPDISP
  'フレーム要素-集中荷重': 4,     // → *BEAMLOAD (CONLOAD)
  'フレーム要素-分布荷重(単独)': 5,// → *BEAMLOAD (UNILOAD, BEAM)
  'フレーム要素-分布荷重(連続)': 6,// → *BEAMLOAD (UNILOAD, LINE)
  'フレーム要素-射影面荷重': 7,   // → *BEAMLOAD (UNILOAD, LINE, PROJ=YES)
  '温度荷重': 8,                   // → *ELTEMPER
};
```

### 하중 유형별 출력 매핑

| 유형 | 하중 종류                   | MCT 섹션    | CMD   | PROJ |
| ---- | --------------------------- | ----------- | ----- | ---- |
| 1    | ノード-集中荷重             | *CONLOAD    | -     | -    |
| 2    | 剛体要素荷重                | *CONLOAD    | -     | -    |
| 3    | ノード-強制変位             | *SPDISP     | -     | -    |
| 4    | フレーム要素-集中荷重       | *BEAMLOAD   | BEAM  | NO   |
| 5    | フレーム要素-分布荷重(単独) | *BEAMLOAD   | LINE  | NO   |
| 6    | フレーム要素-分布荷重(連続) | *BEAMLOAD   | LINE  | NO   |
| 7    | フレーム要素-射影面荷重     | *BEAMLOAD   | LINE  | YES  |
| 8    | 温度荷重                    | *ELTEMPER   | -     | -    |

---

## 4. 처리 경로

### VBA (Class190_Load.cls)

```
1. ChangeLoad() 호출
2. GetData() → 시트에서 B3:T~ 데이터 읽기
3. dicLoadName 구축 (하중 케이스명 → 하중 유형)
4. 각 행 처리:
   a. dicType에서 하중 유형 번호 조회
   b. 노드/요소 번호 변환
   c. 유형별 Set* 함수 호출
5. MCT 출력:
   a. *STLDCASE (lines 262-269)
   b. *CONLOAD with *USE-STLD (lines 271-288)
   c. *SPDISP with *USE-STLD (lines 290-307)
   d. *BEAMLOAD with *USE-STLD (lines 309-328)
   e. *ELTEMPER with *USE-STLD (lines 330-347)
```

### TypeScript (LoadConverter.ts)

```
1. convertLoads() 호출
2. dicLoadName 구축
3. 각 행 처리:
   a. LOAD_TYPES에서 유형 번호 조회
   b. 노드/요소 번호 변환
   c. set* 함수 호출
4. MCT 출력:
   a. mctLinesLoadCase (*STLDCASE)
   b. mctLinesConLoad (*CONLOAD with *USE-STLD)
   c. mctLinesSpDisp (*SPDISP with *USE-STLD)
   d. mctLinesBeamLoad (*BEAMLOAD with *USE-STLD)
   e. mctLinesElTemper (*ELTEMPER with *USE-STLD)
```

---

## 5. 주요 함수

### 5.1 CalcVecter (벡터 계산)

VBA lines 354-400, TypeScript `calcVecter()`

**기능**: 하중 방향 벡터 계산

**좌표 변환**: ES(X,Y,Z) → MIDAS(X,-Z,Y)

```typescript
// 힘: (x, -z, y)
strLoad = `${vBuf[0]},${-1 * vBuf[2]},${vBuf[1]},0,0,0`;

// 모멘트: (0,0,0,x,-z,y)
strLoad = `0,0,0,${vBuf[0]},${-1 * vBuf[2]},${vBuf[1]}`;
```

**Alpha/Beta 각도 지원**:
```typescript
if (coordType === '座標指定') {
  vBuf[0] = Math.cos(dBeta) * Math.cos(dAlpha);
  vBuf[1] = Math.cos(dBeta) * Math.sin(dAlpha);
  vBuf[2] = Math.sin(dBeta);
}
```

### 5.2 SortElem (요소 정렬)

VBA lines 557-617, TypeScript `sortElem()`

**기능**: 연속 분포하중을 위한 요소 체인 정렬

```
요소 연결 감지:
- vElemNode[i].vNode_I === vElemNode[j].vNode_J → 연결
- vElemNode[i].vNode_J === vElemNode[j].vNode_I → 연결

정렬 순서: 시작 요소 → 끝 요소
```

### 5.3 GetECCEN (편심 처리)

VBA lines 500-545, TypeScript `getECCEN()`

**기능**: 요소 각도 기반 편심 방향 결정

```
방향 | 조건                    | 편심 방향
GX   | angle0=0 && angle1=0    | LY
GX   | angle0≠0 && angle1=1    | LY
GX   | 기타                    | LZ
GY   | angle0=0 && angle1=0    | LZ
GY   | angle0=0 && angle1=1    | LZ
GY   | 기타                    | LY
GZ   | angle1=1 && angle0=0    | LY
GZ   | angle1=1 && angle0≠0    | LZ
```

---

## 6. 방향 매핑

### VBA (lines 654-659)

```vba
dicDir.Add "全体 X", "GX"
dicDir.Add "全体 Y", "GZ"   ' ES Y → MIDAS Z
dicDir.Add "全体 Z", "GY"   ' ES Z → MIDAS Y
dicDir.Add "要素 X", "LX"
dicDir.Add "要素 Y", "LZ"   ' ES Y → MIDAS Z
dicDir.Add "要素 Z", "LY"   ' ES Z → MIDAS Y
```

### Y-Z 부호 반전

```typescript
// GY 또는 LY 방향일 때 부호 반전 (VBA lines 756-759)
if (strDir === 'GY' || strDir === 'LY') {
  dP1[k] = dP1[k] * -1;
  dP2[k] = dP2[k] * -1;
}
```

---

## 7. 각 하중 섹션 형식

### 7.1 *CONLOAD (집중 하중)

```
*CONLOAD    ; Nodal Loads
; NODE_LIST, FX, FY, FZ, MX, MY, MZ, GROUP,STRTYPENAME
   1,100,0,50,0,0,0,,
```

### 7.2 *SPDISP (강제 변위)

```
*SPDISP    ; Specified Displacement of Supports
; NODE_LIST, FLAG, Dx, Dy, Dz, Rx, Ry, Rz, GROUP
   1,100000,0.01,0,0,0,0,0,
```

### 7.3 *BEAMLOAD (보 하중)

```
*BEAMLOAD    ; Element Beam Loads
; ELEM_LIST, CMD, TYPE, DIR, bPROJ, [ECCEN], [VALUE], GROUP
; ELEM_LIST, CMD, TYPE, TYPE, DIR, VX, VY, VZ, bPROJ, [ECCEN], [VALUE], GROUP
; [VALUE]       : D1, P1, D2, P2, D3, P3, D4, P4
; [ECCEN]       : bECCEN, ECCDIR, I-END, J-END, bJ-END
; [ADDITIONAL]  : bADDITIONAL, ADDITIONAL_I-END, ADDITIONAL_J-END, bADDITIONAL_J-END
   1,BEAM,CONLOAD,GY,NO,NO,,,,0,100,1,0, 0, 0, 0, 0,, NO, 0, 0, NO,
   2,LINE,UNILOAD,GY,NO,NO,,,,0,10,1,10, 0, 0, 0, 0,, NO, 0, 0, NO,
```

### 7.4 *ELTEMPER (온도 하중)

```
*ELTEMPER    ; Element Temperatures
; ELEM_LIST, TEMPER, GROUP
   1,30,
```

---

## 8. VBA와 차이점

| 항목              | VBA                      | TypeScript                  | 영향      |
| ----------------- | ------------------------ | --------------------------- | --------- |
| 일본어 정규화     | 없음                     | normalizeJapaneseText()     | 호환성 ↑  |
| 하중 유형 변형    | 고정                     | 여러 변형 지원              | 호환성 ↑  |
| 요소 정렬         | SortElem                 | sortElem (동일 로직)        | 일치      |
| 좌표 변환         | 직접 계산                | calcVecter 함수             | 일치      |

---

## 9. 결론

**✓ \*STLDCASE 변환은 VBA와 완전히 일치합니다.**

- 필요한 시트: `荷重` (주요), `節点座標`, `フレーム要素`, `剛体要素` (의존)
- 처리 경로: 문제 없음
- 누락된 기능: 없음

> **핵심 포인트**:
> 1. LCTYPE은 항상 `USER`
> 2. 각 하중 데이터는 `*USE-STLD` 래퍼로 감싸짐
> 3. 좌표 변환: ES(X,Y,Z) → MIDAS(X,-Z,Y)
> 4. 방향 매핑: 全体 Y → GZ, 全体 Z → GY

---

## 데이터 입력 예제

### Excel 시트 (`荷重`)

|     | B   | C              | D      | E        | F      | G     | H    | ... | O        |
| --- | --- | -------------- | ------ | -------- | ------ | ----- | ---- | --- | -------- |
| 2   |     | 荷重タイプ     | ケース名| 作用タイプ| 対象   | P1    | P2   | ... | 方向     |
| 3   |     | ノード-集中荷重 | Dead   | 並進荷重 | N1     | 100   |      | ... | 全体 Z   |
| 4   |     | フレーム要素-分布荷重(単独) | Live | 並進荷重 | E1,E2 | 10 | 10 | ... | 全体 Z |
| 5   |     | ノード-強制変位 | Seismic | 並進荷重 | N1    | 0.01  |      | ... | 全体 X   |

### MCT 출력 결과

```
*STLDCASE    ; Static Load Cases
; LCNAME, LCTYPE, DESC
   Dead,USER,
   Live,USER,
   Seismic,USER,

*USE-STLD, Dead

*CONLOAD    ; Nodal Loads
; NODE_LIST, FX, FY, FZ, MX, MY, MZ, GROUP,STRTYPENAME
   1,0,-100,0,0,0,0,,

; End of data for load case [Dead] -------------------------

*USE-STLD, Live

*BEAMLOAD    ; Element Beam Loads
; ELEM_LIST, CMD, TYPE, DIR, bPROJ, [ECCEN], [VALUE], GROUP
...
   1,LINE,UNILOAD,GY,NO,NO,,,,0,-10,1,-10, 0, 0, 0, 0,, NO, 0, 0, NO,
   2,LINE,UNILOAD,GY,NO,NO,,,,0,-10,1,-10, 0, 0, 0, 0,, NO, 0, 0, NO,

; End of data for load case [Live] -------------------------

*USE-STLD, Seismic

*SPDISP    ; Specified Displacement of Supports
; NODE_LIST, FLAG, Dx, Dy, Dz, Rx, Ry, Rz, GROUP
   1,100000,0.01,0,0,0,0,0,

; End of data for load case [Seismic] -------------------------
```

### 의존 관계

```
荷重 ──┬── 節点座標 (노드 번호 매핑)
      ├── フレーム要素 (요소 번호 매핑, BEAMLOAD용)
      └── 剛体要素 (마스터 노드 조회, 剛体要素荷重용)
```
