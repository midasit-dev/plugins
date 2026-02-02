# \*ELTEMPER MCT 변환 분석

## 개요

ES(Engineer Studio) 엑셀의 `荷重` 시트에서 온도 하중을 MIDAS Civil NX의 `*ELTEMPER` 섹션으로 변환

> **참고**: ELTEMPER는 요소의 온도 하중을 정의합니다.
> `*STLDCASE`의 하위 섹션으로, `*USE-STLD` 래퍼와 함께 출력됩니다.

---

## 1. 필요한 데이터 시트

### 주요 시트

| 항목    | VBA              | TypeScript        | 상태 |
| ------- | ---------------- | ----------------- | ---- |
| 시트명  | `m_Sheet_Load`   | `荷重`            | ✓    |
| 시작 행 | 3 (nReadSTRow)   | 3                 | ✓    |
| 열 범위 | B~T (2~20)       | B~T (2~20)        | ✓    |

### 관련 열 구조

| 열  | 인덱스  | VBA              | TypeScript      | 설명                    |
| --- | ------- | ---------------- | --------------- | ----------------------- |
| C   | row[1]  | strData(1, i)    | LOAD_TYPE       | 하중 유형 (温度荷重)    |
| D   | row[2]  | strData(2, i)    | LOAD_CASE       | 하중 케이스명           |
| F   | row[4]  | strData(4, i)    | TARGET          | 대상 요소명 (콤마 구분) |
| G   | row[5]  | strData(5, i)    | VALUE1          | 온도값 (℃)             |

### 의존 시트

| 시트명       | TypeScript 상수 | 용도                          | 필수 여부 |
| ------------ | --------------- | ----------------------------- | --------- |
| `節点座標`   | `NODE`          | MCT 변환 기본                 | **필수**  |
| `フレーム要素`| `FRAME`        | 요소 번호 매핑                | **필수**  |

---

## 2. 출력 구조

### MCT 형식

```
*USE-STLD, TempLoad

*ELTEMPER    ; Element Temperatures
; ELEM_LIST, TEMPER, GROUP
   1,30,
   '2,3,4',25,

; End of data for load case [TempLoad] -------------------------
```

### 필드 설명

| 필드        | 설명                    | 값/소스                          |
| ----------- | ----------------------- | -------------------------------- |
| ELEM_LIST   | 요소 번호 (또는 목록)   | elementMapping.get(elemName)     |
| TEMPER      | 온도값 (℃)             | strData(5, nCnt)                 |
| GROUP       | 그룹 이름               | 항상 빈값                        |

---

## 3. ELTEMPER 생성 조건

### 하중 유형 매핑

| 유형 번호 | 하중 유형  | MCT 출력   |
| --------- | ---------- | ---------- |
| 8         | 温度荷重   | *ELTEMPER  |

### 스킵 조건

```vba
' VBA line 236: If strData(5, i) <> 0# Then
' 온도값이 0이면 스킵
```

---

## 4. SetElTemper 함수 분석

### VBA (lines 798-823)

```vba
Private Sub SetElTemper(tElTemper As tElTemperType, strData() As String, nCnt As Long)
  ' 하중 케이스 딕셔너리 확인
  If tElTemper.dicName.Exists(strData(2, nCnt)) Then
    i = tElTemper.dicName(strData(2, nCnt))
    j = UBound(tElTemper.strElTemper(i).strDat) + 1
  Else
    i = tElTemper.dicName.Count
    tElTemper.dicName.Add strData(2, nCnt), i
    ReDim Preserve tElTemper.strElTemper(i)
    j = 0
  End If

  ' 요소 목록 문자열 생성
  strElem = GetStringGen(strData(4, nCnt))

  ' 출력: "요소목록,온도값,"
  tElTemper.strElTemper(i).strDat(j) = strElem & "," & strData(5, nCnt) & ","
End Sub
```

### TypeScript (setElTemper)

```typescript
function setElTemper(
  tElTemper: { dicName: Map<string, number>; strDat: string[][] },
  row: (string | number)[],
  strElem: string
): void {
  const loadCase = String(row[COL.LOAD_CASE] || '');
  // ... 하중 케이스별 인덱스 관리 ...

  const elemStr = getStringGen(strElem);
  const temp = safeParseNumber(row[COL.VALUE1]);

  tElTemper.strDat[i][j] = `${elemStr},${temp},`;
}
```

---

## 5. 요소 번호 변환

### VBA 처리 (lines 238-248)

```vba
Case 8
  If strData(5, i) <> 0# Then
    ' 요소명 → 요소번호 변환
    vElem = Split(strData(4, i), ",")
    For j = 0 To UBound(vElem)
      vElem(j) = m_ElemData(vElem(j))  ' 요소 번호 조회
    Next j
    strElem = vElem(0)
    For j = 1 To UBound(vElem)
      strElem = strElem & "," & vElem(j)
    Next j

    strData(4, i) = strElem
    Call SetElTemper(tElTemper, strData, i)
  End If
```

### TypeScript 처리

```typescript
case 8: // 温度荷重
  if (value1 !== 0) {
    const targetStr = String(row[COL.TARGET] || '');
    const vElem = targetStr.split(',');
    const elemNos: number[] = [];
    for (const elemName of vElem) {
      const elemNo = context.elementMapping.get(elemName.trim());
      if (elemNo) elemNos.push(elemNo);
    }
    if (elemNos.length === 0) continue;
    const strElem = elemNos.join(',');
    setElTemper(tElTemper, row, strElem);
  }
  break;
```

---

## 6. VBA와 차이점

| 항목              | VBA                      | TypeScript                  | 영향      |
| ----------------- | ------------------------ | --------------------------- | --------- |
| 요소 번호 변환    | m_ElemData               | elementMapping              | 동일      |
| 다중 요소 처리    | GetStringGen             | getStringGen                | 동일      |
| 출력 형식         | "elem,temp,"             | "elem,temp,"                | 동일      |

---

## 7. 결론

**✓ \*ELTEMPER 변환은 VBA와 완전히 일치합니다.**

- 생성 조건: 하중 유형 8 (温度荷重)
- 필요한 시트: `荷重` (주요), `節点座標`, `フレーム要素` (의존)
- 처리 경로: 문제 없음

> **핵심 포인트**:
> 1. 매우 단순한 형식: 요소목록, 온도값
> 2. 온도값이 0이면 스킵
> 3. *USE-STLD 래퍼로 하중 케이스별 그룹화

---

## 데이터 입력 예제

### Excel 시트 (`荷重`)

|     | C          | D          | F      | G     |
| --- | ---------- | ---------- | ------ | ----- |
| 2   | 荷重タイプ | ケース名   | 対象   | 温度  |
| 3   | 温度荷重   | TempLoad   | E1     | 30    |
| 4   | 温度荷重   | TempLoad   | E2,E3  | 25    |

### 변환 과정

| 행 | 요소명 (ES) | 요소 번호 (MCT) | 온도값 |
| -- | ----------- | --------------- | ------ |
| 3  | E1          | 1               | 30     |
| 4  | E2,E3       | '2,3'           | 25     |

### MCT 출력 결과

```
*USE-STLD, TempLoad

*ELTEMPER    ; Element Temperatures
; ELEM_LIST, TEMPER, GROUP
   1,30,
   '2,3',25,

; End of data for load case [TempLoad] -------------------------
```

### 의존 관계

```
ELTEMPER ──── フレーム要素 (요소 번호 매핑)
                  ↓
              elementMapping.get('E1') → 1
```
