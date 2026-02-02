# \*INI-EFORCE MCT 변환 분석

## 개요

ES(Engineer Studio) 엑셀의 `内力` 시트에서 초기 요소력을 MIDAS Civil NX의 `*INI-EFORCE` 섹션으로 변환

> **참고**: INI-EFORCE는 요소의 초기 내력(Initial Element Force)을 정의합니다.
> 프리스트레스 효과나 시공 단계에서의 초기 응력 상태를 모델링할 때 사용됩니다.

---

## 1. 필요한 데이터 시트

### 주요 시트

| 항목    | VBA                     | TypeScript   | 상태 |
| ------- | ----------------------- | ------------ | ---- |
| 시트명  | `m_Sheet_InternalForce` | `内力`       | ✓    |
| 시작 행 | 3 (nReadSTRow)          | 3            | ✓    |
| 시작 열 | 2 (nReadSTCol)          | 2 (B)        | ✓    |
| 종료 열 | 12 (nReadEDCol)         | 12 (L)       | ✓    |

### 열 구조 (B~L, 11열)

| 열  | 인덱스 | VBA            | TypeScript    | 설명                     |
| --- | ------ | -------------- | ------------- | ------------------------ |
| B   | 0      | strData(0, j)  | row[0]        | (미사용)                 |
| C   | 1      | strData(1, j)  | row[1]        | (미사용)                 |
| D   | 2      | strData(2, j)  | ELEM_ID       | 요소명/번호              |
| E   | 3      | strData(3, j)  | AXIAL_I       | 축력-i단 (Axial-i)       |
| F   | 4      | strData(4, j)  | AXIAL_J       | 축력-j단 (Axial-j)       |
| G   | 5      | strData(5, j)  | MOMENT_Z_I    | 모멘트-z-i (**부호 반전**) |
| H   | 6      | strData(6, j)  | MOMENT_Y_I    | 모멘트-y-i               |
| I   | 7      | strData(7, j)  | MOMENT_Z_J    | 모멘트-z-j (**부호 반전**) |
| J   | 8      | strData(8, j)  | MOMENT_Y_J    | 모멘트-y-j               |
| K   | 9      | strData(9, j)  | TORSION_I     | 비틀림-i단 (Torsion-i)   |
| L   | 10     | strData(10, j) | TORSION_J     | 비틀림-j단 (Torsion-j)   |

### 의존 시트

| 시트명         | TypeScript 상수 | 용도             | 필수 여부 |
| -------------- | --------------- | ---------------- | --------- |
| `フレーム要素` | `FRAME`         | 요소 번호 매핑   | 선택      |

---

## 2. 출력 구조

### MCT 형식

```
*INI-EFORCE    ; Initial Element Force
; TYPE, ID, Axial-i, Axial-j     ; TRUSS
; TYPE, ID, [ASTM]-i, [ASTM]-j   ; BEAM, E-LINK, G-LINK
; [ASTM] : Axial, Shear-y, Shear-z, Torsion, Moment-y, Moment-z
   BEAM,1,100,0,0,10,50,-30,100,0,0,10,50,-30
```

### 필드 설명 (BEAM 타입)

| 위치 | 필드        | 설명                    | VBA 소스              |
| ---- | ----------- | ----------------------- | --------------------- |
| 0    | TYPE        | 요소 타입               | "BEAM" (고정)         |
| 1    | ID          | 요소 번호               | strData(2, j)         |
| 2    | Axial-i     | 축력-i단                | strData(3, j)         |
| 3    | Shear-y-i   | 전단력-y-i              | 0 (고정)              |
| 4    | Shear-z-i   | 전단력-z-i              | 0 (고정)              |
| 5    | Torsion-i   | 비틀림-i단              | strData(9, j)         |
| 6    | Moment-y-i  | 모멘트-y-i              | strData(6, j)         |
| 7    | Moment-z-i  | 모멘트-z-i              | **-1** × strData(5, j)|
| 8    | Axial-j     | 축력-j단                | strData(4, j)         |
| 9    | Shear-y-j   | 전단력-y-j              | 0 (고정)              |
| 10   | Shear-z-j   | 전단력-z-j              | 0 (고정)              |
| 11   | Torsion-j   | 비틀림-j단              | strData(10, j)        |
| 12   | Moment-y-j  | 모멘트-y-j              | strData(8, j)         |
| 13   | Moment-z-j  | 모멘트-z-j              | **-1** × strData(7, j)|

---

## 3. 부호 반전 규칙

### Moment-z 부호 반전

```
ES Moment-z-i → MCT Moment-z-i = -1 × ES값
ES Moment-z-j → MCT Moment-z-j = -1 × ES값
```

**VBA 코드 (lines 65, 71):**
```vba
strBuf(i) = -1 * strData(5, j)  ' Moment-z-i 부호 반전
strBuf(i) = -1 * strData(7, j)  ' Moment-z-j 부호 반전
```

> **이유**: ES와 MIDAS 간의 좌표계 차이로 인한 모멘트 방향 보정

---

## 4. VBA 함수 분석

### ChangeInternalForce (lines 22-84)

```vba
Public Sub ChangeInternalForce()
  ' 데이터 배열 초기화
  Dim strData() As String
  ReDim strData(nReadEDCol - nReadSTCol, 0)  ' 11열 (0-10)

  ' 시트에서 데이터 읽기
  nCnt = GetData(m_ChangeBook, strName, nReadSTRow, nReadSTCol, nReadEDCol, strData)

  ' MCT 헤더 출력 (lines 49-52)
  vWriteData(nRowCnt, 0) = "*INI-EFORCE    ; Initial Element Force"
  vWriteData(nRowCnt, 0) = "; TYPE, ID, Axial-i, Axial-j     ; TRUSS"
  vWriteData(nRowCnt, 0) = "; TYPE, ID, [ASTM]-i, [ASTM]-j   ; BEAM, E-LINK, G-LINK"
  vWriteData(nRowCnt, 0) = "; [ASTM] : Axial, Shear-y, Shear-z, Torsion, Moment-y, Moment-z"

  ' 데이터 출력 (lines 56-79)
  For j = 0 To nCnt
    ReDim strBuf(11)
    i = 0
    strBuf(i) = "BEAM": i = i + 1                    ' [0] TYPE
    strBuf(i) = strData(2, j): i = i + 1            ' [1] Element ID
    strBuf(i) = strData(3, j): i = i + 1            ' [2] Axial-i
    strBuf(i) = "0,0": i = i + 1                     ' [3] Shear-y-i, Shear-z-i
    strBuf(i) = strData(9, j): i = i + 1            ' [4] Torsion-i
    strBuf(i) = strData(6, j): i = i + 1            ' [5] Moment-y-i
    strBuf(i) = -1 * strData(5, j): i = i + 1       ' [6] Moment-z-i (부호 반전!)

    strBuf(i) = strData(4, j): i = i + 1            ' [7] Axial-j
    strBuf(i) = "0,0": i = i + 1                     ' [8] Shear-y-j, Shear-z-j
    strBuf(i) = strData(10, j): i = i + 1           ' [9] Torsion-j
    strBuf(i) = strData(8, j): i = i + 1            ' [10] Moment-y-j
    strBuf(i) = -1 * strData(7, j)                  ' [11] Moment-z-j (부호 반전!)

    ' 콤마로 연결하여 출력
    vWriteData(nRowCnt, 0) = strBuf(0)
    For k = 1 To i
      vWriteData(nRowCnt, 0) = vWriteData(nRowCnt, 0) & "," & strBuf(k)
    Next k
  Next j
End Sub
```

---

## 5. VBA와 TypeScript 비교

| 항목              | VBA                           | TypeScript                    | 일치 |
| ----------------- | ----------------------------- | ----------------------------- | ---- |
| 시트 설정         | row=3, col=2-12               | row=3, col=2-12               | ✓    |
| 요소 타입         | "BEAM" (고정)                 | "BEAM" (고정)                 | ✓    |
| Shear 패딩        | "0,0" (하나의 문자열)         | "0","0" (두 개)               | ✓*   |
| Moment-z 부호     | -1 × 값                       | -1 × 값                       | ✓    |
| 출력 형식         | 콤마 구분 14개 필드           | 콤마 구분 14개 필드           | ✓    |

> \* VBA는 "0,0"을 하나의 배열 요소로, TypeScript는 "0","0"을 두 개의 요소로 처리하지만,
> 최종 출력 문자열은 동일함

---

## 6. 결론

**✓ \*INI-EFORCE 변환은 VBA와 완전히 일치합니다.**

- 생성 조건: `内力` 시트에 데이터가 존재할 때
- 필요한 시트: `内力` (주요), `フレーム要素` (의존, 선택)
- 처리 경로: 문제 없음

> **핵심 포인트**:
> 1. 요소 타입은 항상 "BEAM"으로 고정
> 2. Shear-y, Shear-z는 0으로 패딩
> 3. **Moment-z-i, Moment-z-j는 부호 반전** (좌표계 변환)
> 4. 출력 필드: 14개 (TYPE, ID, 6개×i단, 6개×j단)

---

## 데이터 입력 예제

### Excel 시트 (`内力`)

|     | B | C | D(요소) | E(Axial-i) | F(Axial-j) | G(Mz-i) | H(My-i) | I(Mz-j) | J(My-j) | K(T-i) | L(T-j) |
| --- | - | - | ------- | ---------- | ---------- | ------- | ------- | ------- | ------- | ------ | ------ |
| 2   |   |   | 要素    | 軸力-i     | 軸力-j     | Mz-i    | My-i    | Mz-j    | My-j    | T-i    | T-j    |
| 3   |   |   | E1      | 100        | 100        | 30      | 50      | 30      | 50      | 10     | 10     |
| 4   |   |   | E2      | 200        | 200        | 60      | 80      | 60      | 80      | 20     | 20     |

### 변환 과정

| 행 | 요소 | Mz-i(ES) | Mz-i(MCT) | Mz-j(ES) | Mz-j(MCT) |
| -- | ---- | -------- | --------- | -------- | --------- |
| 3  | E1   | 30       | **-30**   | 30       | **-30**   |
| 4  | E2   | 60       | **-60**   | 60       | **-60**   |

### MCT 출력 결과

```
*INI-EFORCE    ; Initial Element Force
; TYPE, ID, Axial-i, Axial-j     ; TRUSS
; TYPE, ID, [ASTM]-i, [ASTM]-j   ; BEAM, E-LINK, G-LINK
; [ASTM] : Axial, Shear-y, Shear-z, Torsion, Moment-y, Moment-z
   BEAM,1,100,0,0,10,50,-30,100,0,0,10,50,-30
   BEAM,2,200,0,0,20,80,-60,200,0,0,20,80,-60
```

### 출력 필드 순서

```
BEAM, ID, Axial-i, Shear-y-i, Shear-z-i, Torsion-i, Moment-y-i, Moment-z-i,
          Axial-j, Shear-y-j, Shear-z-j, Torsion-j, Moment-y-j, Moment-z-j
```

### 의존 관계

```
INI-EFORCE ──── フレーム要素 (요소 번호 매핑, 선택)
                   ↓
               elementMapping.get('E1') → 1
```
