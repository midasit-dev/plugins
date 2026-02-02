# \*THICKNESS MCT 변환 분석

## 개요

ES(Engineer Studio) 엑셀의 `平板断面` 시트를 MIDAS Civil NX의 `*THICKNESS` 섹션으로 변환

> **참고**: THICKNESS는 평판 요소(PLATE)의 두께 정보를 정의합니다.
> 프레임 요소의 `*SECTION`과 별개로, 평판 요소 전용 단면 정보입니다.

---

## 1. 필요한 데이터 시트

### 주요 시트

| 항목    | VBA                | TypeScript        | 상태 |
| ------- | ------------------ | ----------------- | ---- |
| 시트명  | `m_Sheet_PlnSect`  | `平板断面`        | ✓    |
| 시작 행 | 3 (nReadSTRow)     | 3                 | ✓    |
| 열 범위 | B~G (2~7)          | B~G (2~7)         | ✓    |

### 열 구조

| 열  | 인덱스  | VBA 변수       | TypeScript     | 설명            |
| --- | ------- | -------------- | -------------- | --------------- |
| B   | row[0]  | strData(0, i)  | sectName       | 断面名称        |
| C   | row[1]  | strData(1, i)  | -              | (미사용)        |
| D   | row[2]  | strData(2, i)  | -              | (미사용)        |
| E   | row[3]  | strData(3, i)  | -              | (미사용)        |
| F   | row[4]  | strData(4, i)  | thickness      | 厚さ (m)        |
| G   | row[5]  | strData(5, i)  | materialName   | 材料名称        |

### 의존 시트

| 시트명       | TypeScript 상수 | 용도                          | 필수 여부 |
| ------------ | --------------- | ----------------------------- | --------- |
| `節点座標`   | `NODE`          | MCT 변환의 기본 시트          | **필수**  |
| `材料`       | `MATERIAL`      | 재료 번호 조회 (PLATE 요소용) | 선택*     |

> **참고**: `材料` 시트는 THICKNESS 자체에는 불필요하지만,
> 평판 요소(`*ELEMENT` PLATE) 변환 시 재료 번호 조회에 사용됩니다.

---

## 2. 출력 구조

### MCT 형식

```
*THICKNESS    ; Thickness
1, VALUE,1, YES,0.2, 0, NO, 0, 0
2, VALUE,2, YES,0.15, 0, NO, 0, 0
```

### 필드 설명

```
iTHK, VALUE, iTHK, YES, thickness, 0, NO, 0, 0
 │      │     │     │       │      │   │   │  │
 │      │     │     │       │      │   │   │  └─ (미사용)
 │      │     │     │       │      │   │   └──── (미사용)
 │      │     │     │       │      │   └──────── bMODI (수정 여부)
 │      │     │     │       │      └──────────── (미사용)
 │      │     │     │       └─────────────────── 두께값 (m)
 │      │     │     └─────────────────────────── bUSETHK (두께 사용 여부)
 │      │     └───────────────────────────────── iTHK (두께 번호, 반복)
 │      └─────────────────────────────────────── TYPE (항상 VALUE)
 └────────────────────────────────────────────── iTHK (두께 번호)
```

| 필드     | 설명              | 값                |
| -------- | ----------------- | ----------------- |
| iTHK     | 두께 번호         | 1부터 순차 증가   |
| TYPE     | 두께 타입         | 항상 `VALUE`      |
| iTHK     | 두께 번호 (반복)  | 첫 번째와 동일    |
| bUSETHK  | 두께 사용 여부    | 항상 `YES`        |
| thickness| 두께값            | strData(4) (m)    |
| -        | (미사용)          | `0`               |
| bMODI    | 수정 여부         | 항상 `NO`         |
| -        | (미사용)          | `0`               |
| -        | (미사용)          | `0`               |

---

## 3. 처리 경로

### VBA (Class080_PlnSect.cls)

```
1. GetData() → 시트에서 B3:G~ 데이터 읽기
2. dicPlnSect에 단면명 → 데이터 배열 저장
3. MCT 출력: "iTHK, VALUE, iTHK, YES, thickness, 0, NO, 0, 0"
4. 두께 번호는 1부터 순차 할당 (i + 1)
```

### TypeScript (PlnSectConverter.ts)

```
1. convertPlnSections() 호출
2. 각 행에서 sectName, thickness, materialName 추출
3. plnSectMapping에 단면명 → {sectNo, materialName} 저장
4. MCT 출력: "sectNo, VALUE, sectNo, YES, thickness, 0, NO, 0, 0"
5. thicknesses 배열 반환
```

### 처리 경로 비교

| 단계                | VBA                        | TypeScript                  | 상태 |
| ------------------- | -------------------------- | --------------------------- | ---- |
| 데이터 읽기         | GetData                    | rawData 파라미터            | ✓    |
| 번호 할당           | i + 1                      | i + 1                       | ✓    |
| 두께 추출           | strData(4, i)              | row[4]                      | ✓    |
| 재료명 추출         | strData(5, i)              | row[5]                      | ✓    |
| 매핑 저장           | dicPlnSect                 | plnSectMapping              | ✓    |
| MCT 형식            | 동일                       | 동일                        | ✓    |

---

## 4. dicPlnSect / plnSectMapping 구조

### VBA (dicPlnSect)

```vba
' Key: 단면명 (strData(0, i))
' Value: strBuf 배열
'   strBuf(0) = 두께 번호 (i + 1)
'   strBuf(1) = strData(1, i)
'   strBuf(2) = strData(2, i)
'   strBuf(3) = strData(3, i)
'   strBuf(4) = strData(4, i) - 두께
'   strBuf(5) = strData(5, i) - 재료명
dicPlnSect.Add strData(0, i), strBuf
```

### TypeScript (plnSectMapping)

```typescript
// Key: 단면명 (sectName)
// Value: { sectNo, materialName }
plnSectMapping.set(sectName, { sectNo, materialName });
```

### 사용처

- **PlnElmConverter**: 평판 요소 변환 시 단면명으로 두께 번호와 재료명 조회

---

## 5. Context에 저장되는 데이터

| 반환값           | Key             | Value                        | 용도                          |
| ---------------- | --------------- | ---------------------------- | ----------------------------- |
| plnSectMapping   | 단면명 (string) | {sectNo, materialName}       | PLATE 요소에서 두께/재료 조회 |
| thicknesses      | -               | MCTThickness[]               | 두께 정보 배열                |

---

## 6. VBA와 차이점

| 항목              | VBA                      | TypeScript                  | 영향      |
| ----------------- | ------------------------ | --------------------------- | --------- |
| 매핑 저장 구조    | 배열 (strBuf)            | 객체 {sectNo, materialName} | 단순화    |
| 데이터 검증       | 없음                     | 빈 행 스킵                  | 안전성 ↑  |

---

## 7. 결론

**✓ \*THICKNESS 변환은 VBA와 완전히 일치합니다.**

- 필요한 시트: `平板断面` (주요), `節点座標` (의존)
- 처리 경로: 문제 없음
- 누락된 기능: 없음

> **핵심 포인트**:
> 1. TYPE은 항상 `VALUE`
> 2. 두께 번호는 1부터 순차 할당
> 3. `plnSectMapping`은 PLATE 요소 변환 시 사용됨

---

## 데이터 입력 예제

### Excel 시트 (`平板断面`)

|     | B          | C    | D    | E    | F        | G            |
| --- | ---------- | ---- | ---- | ---- | -------- | ------------ |
| 2   | 断面名称   |      |      |      | 厚さ(m)  | 材料名称     |
| 3   | Slab-200   |      |      |      | 0.2      | Concrete-21  |
| 4   | Slab-150   |      |      |      | 0.15     | Concrete-21  |
| 5   | Wall-300   |      |      |      | 0.3      | Concrete-21  |

### 설명

- 행 2: 헤더 (변환 시 무시됨)
- 행 3~: 데이터 시작 (nReadSTRow = 3)
- 열 범위: B~G (nReadSTCol=2, nReadEDCol=7)
- 열 F (row[4]): 두께 (단위: m)
- 열 G (row[5]): 재료명 (PLATE 요소 변환 시 사용)

### MCT 출력 결과

```
*THICKNESS    ; Thickness
1, VALUE,1, YES,0.2, 0, NO, 0, 0
2, VALUE,2, YES,0.15, 0, NO, 0, 0
3, VALUE,3, YES,0.3, 0, NO, 0, 0
```

### 변환 상세

| 단면명     | 두께 번호 | 두께 (m) | 재료명       | MCT 출력                           |
| ---------- | --------- | -------- | ------------ | ---------------------------------- |
| Slab-200   | 1         | 0.2      | Concrete-21  | `1, VALUE,1, YES,0.2, 0, NO, 0, 0` |
| Slab-150   | 2         | 0.15     | Concrete-21  | `2, VALUE,2, YES,0.15, 0, NO, 0, 0`|
| Wall-300   | 3         | 0.3      | Concrete-21  | `3, VALUE,3, YES,0.3, 0, NO, 0, 0` |

### plnSectMapping 결과

| Key        | sectNo | materialName |
| ---------- | ------ | ------------ |
| Slab-200   | 1      | Concrete-21  |
| Slab-150   | 2      | Concrete-21  |
| Wall-300   | 3      | Concrete-21  |

### 의존 관계

```
平板断面 ──┬── 節点座標 (MCT 기본)
          └── 平板要素에서 참조 (plnSectMapping)
                    │
                    └── 材料 (재료 번호 조회)
```

### PLATE 요소에서의 사용 예

```typescript
// PlnElmConverter.ts
const sectInfo = plnSectMapping.get('Slab-200');
// sectInfo = { sectNo: 1, materialName: 'Concrete-21' }

const matNo = context.materialMapping.get(sectInfo.materialName);
// matNo = 1 (Concrete-21의 재료 번호)

// MCT 출력: 101,PLATE,1,1,10,11,12,13,1, 0
//                   │ │
//                   │ └── sectNo (두께 번호)
//                   └──── matNo (재료 번호)
```
