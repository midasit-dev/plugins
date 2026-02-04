# *THICKNESS 변환 검증

## 1. VBA 흐름

### 1.1 호출 위치 (main.bas)
- Line 430: `clsPlnSect.ChangePlnSect(dicPlnSect)` (MCT 출력 + dicPlnSect 구성)

### 1.2 데이터 읽기
- 시트명: `"平板断面"`
- 읽기 범위: Row 3~, Col 2~7 (B~G, 6개 열)
  - strData(0) = 단면명
  - strData(1)~(3) = 기타 데이터
  - strData(4) = 두께 (thickness)
  - strData(5) = 재료명

### 1.3 데이터 가공
- 단면번호: `i + 1` (순번)
- `dicPlnSect.Add strData(0, i), strBuf` → 단면명 → [번호, strData(1)~(5)] 매핑
  - 이 딕셔너리는 나중에 PlnElm에서 사용 (단면번호, 재료명 조회)

### 1.4 MCT 출력
```
*THICKNESS    ; Thickness
{i+1}, VALUE,{i+1}, YES,{두께}, 0, NO, 0, 0
```

---

## 2. TypeScript 흐름

### 2.1 호출 위치 (MCTGenerator.ts)
- Line 191-201: `convertPlnSections()` 호출

### 2.2 데이터 읽기
- `getSheetDataForConversion(sheets, SHEET_NAMES.PLN_SECT)` 사용

### 2.3 데이터 가공
- 단면번호: `i + 1`
- `plnSectMapping.set(sectName, { sectNo, materialName })` → PlnElm에서 사용

### 2.4 MCT 출력
```
*THICKNESS    ; Thickness
{sectNo}, VALUE,{sectNo}, YES,{thickness}, 0, NO, 0, 0
```

---

## 3. 비교 분석

### 3.1 동일한 부분
| 항목 | VBA | TypeScript | 일치 |
|------|-----|-----------|------|
| MCT 헤더 | `*THICKNESS    ; Thickness` | 동일 | O |
| 데이터 형식 | `{no}, VALUE,{no}, YES,{thk}, 0, NO, 0, 0` | 동일 | O |
| 단면 번호 | i + 1 순번 | i + 1 순번 | O |
| 두께 필드 | strData(4) | row[4] | O |
| 재료명 저장 | dicPlnSect에 strBuf(5) | plnSectMapping에 materialName | O |

### 3.2 차이점
| 항목 | VBA | TypeScript | 영향 |
|------|-----|-----------|------|
| 없음 | - | - | - |

### 3.3 차이로 인한 MCT 결과 영향
- 완전히 동일한 MCT 출력

---

## 4. 결론
**PASS** - *THICKNESS 변환 로직은 VBA와 TypeScript가 완전히 동일. 단순한 구조로 차이점 없음.
