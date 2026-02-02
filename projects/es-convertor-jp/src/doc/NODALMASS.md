# \*NODALMASS MCT 변환 분석

## 개요

ES(Engineer Studio) 엑셀의 `節点質量` 시트에서 노드 질량을 MIDAS Civil NX의 `*NODALMASS` 섹션으로 변환

> **참고**: NODALMASS는 노드에 집중된 질량을 정의합니다.
> 동적 해석(고유치 해석, 시간이력 해석 등)에서 사용됩니다.

---

## 1. 필요한 데이터 시트

### 주요 시트

| 항목    | VBA                | TypeScript   | 상태 |
| ------- | ------------------ | ------------ | ---- |
| 시트명  | `m_Sheet_NodalMass`| `節点質量`   | ✓    |
| 시작 행 | 4 (nReadSTRow)     | 4            | ✓    |
| 시작 열 | 2 (nReadSTCol)     | 2 (B)        | ✓    |
| 종료 열 | 11 (nReadEDCol)    | 11 (K)       | ✓    |
| 헤더 행 | 2행                | 2행          | ✓    |

### 열 구조 (B~K, 10열)

| 열  | 인덱스 | VBA           | TypeScript | 설명              |
| --- | ------ | ------------- | ---------- | ----------------- |
| B   | 0      | strData(0, j) | row[0]     | 노드명            |
| C   | 1      | strData(1, j) | row[1]     | (미사용)          |
| D   | 2      | strData(2, j) | row[2]     | (미사용)          |
| E   | 3      | strData(3, j) | row[3]     | (미사용)          |
| F   | 4      | strData(4, j) | row[4]     | mX (ES X 질량)    |
| G   | 5      | strData(5, j) | row[5]     | mY (ES Y 질량)    |
| H   | 6      | strData(6, j) | row[6]     | mZ (ES Z 질량)    |
| I   | 7      | strData(7, j) | row[7]     | rmX (ES X 회전질량) |
| J   | 8      | strData(8, j) | row[8]     | rmY (ES Y 회전질량) |
| K   | 9      | strData(9, j) | row[9]     | rmZ (ES Z 회전질량) |

### 의존 시트

| 시트명     | TypeScript 상수 | 용도             | 필수 여부 |
| ---------- | --------------- | ---------------- | --------- |
| `節点座標` | `NODE`          | 노드 번호 매핑   | **필수**  |

---

## 2. 출력 구조

### MCT 형식

```
*NODALMASS    ; Nodal Masses
; NODE_LIST, mX, mY, mZ, rmX, rmY, rmZ, rAngX, rAngY, rAngZ
   1,100,200,150,0,0,0
   2,50,100,75,0,0,0
```

### 필드 설명

| 필드      | 설명                | 값/소스                       |
| --------- | ------------------- | ----------------------------- |
| NODE_LIST | 노드 번호           | nodeMapping.get(nodeName)     |
| mX        | X축 질량 (tonf)     | ES mX (좌표 변환 없음)        |
| mY        | Y축 질량 (tonf)     | ES mZ → MCT mY (좌표 변환)    |
| mZ        | Z축 질량 (tonf)     | ES mY → MCT mZ (좌표 변환)    |
| rmX       | X축 회전질량        | ES rmX (좌표 변환 없음)       |
| rmY       | Y축 회전질량        | ES rmZ → MCT rmY (좌표 변환)  |
| rmZ       | Z축 회전질량        | ES rmY → MCT rmZ (좌표 변환)  |

> **주의**: MCT 주석에는 rAngX, rAngY, rAngZ가 언급되지만, VBA는 이 값들을 출력하지 않습니다.

---

## 3. 좌표 변환

### ES → MCT 좌표계 변환

```
ES 좌표계:  (X, Y, Z)
MCT 좌표계: (X, -Z, Y)

질량 변환:
  MCT mX  = ES mX   (동일)
  MCT mY  = ES mZ   (ES Z → MCT Y)
  MCT mZ  = ES mY   (ES Y → MCT Z)

회전질량 변환:
  MCT rmX = ES rmX  (동일)
  MCT rmY = ES rmZ  (ES rmZ → MCT rmY)
  MCT rmZ = ES rmY  (ES rmY → MCT rmZ)
```

### VBA 코드 (lines 64-70)

```vba
strBuf(i) = m_NodeData(strData(0, j)): i = i + 1  ' 노드 번호
strBuf(i) = strData(4, j): i = i + 1  ' ES mX  → MCT mX
strBuf(i) = strData(6, j): i = i + 1  ' ES mZ  → MCT mY  ★ 좌표 변환
strBuf(i) = strData(5, j): i = i + 1  ' ES mY  → MCT mZ  ★ 좌표 변환
strBuf(i) = strData(7, j): i = i + 1  ' ES rmX → MCT rmX
strBuf(i) = strData(9, j): i = i + 1  ' ES rmZ → MCT rmY ★ 좌표 변환
strBuf(i) = strData(8, j)             ' ES rmY → MCT rmZ ★ 좌표 변환
```

---

## 4. VBA 함수 분석

### ChangeNodalMass (lines 22-83)

```vba
Public Sub ChangeNodalMass()
  ' 데이터 배열 초기화
  Dim strData() As String
  ReDim strData(nReadEDCol - nReadSTCol, 0)  ' 10열 (0-9)

  ' 시트에서 데이터 읽기
  nCnt = GetData(m_ChangeBook, strName, nReadSTRow, nReadSTCol, nReadEDCol, strData)

  ' 비숫자 값 → 0으로 변환 (lines 48-54)
  For j = 0 To nCnt
    For i = 4 To 9
      If Not IsNumeric(strData(i, j)) Then
        strData(i, j) = 0#
      End If
    Next i
  Next j

  ' MCT 헤더 출력 (lines 56-57)
  vWriteData(nRowCnt, 0) = "*NODALMASS    ; Nodal Masses"
  vWriteData(nRowCnt, 0) = "; NODE_LIST, mX, mY, mZ, rmX, rmY, rmZ, rAngX, rAngY, rAngZ"

  ' 데이터 출력 (lines 61-78)
  For j = 0 To nCnt
    ' 좌표 변환 적용하여 strBuf 배열 생성
    ' ...
    ' 콤마로 연결하여 출력
    vWriteData(nRowCnt, 0) = strBuf(0)
    For k = 1 To i
      vWriteData(nRowCnt, 0) = vWriteData(nRowCnt, 0) & "," & strBuf(k)
    Next k
  Next j
End Sub
```

---

## 5. TypeScript 구현

### convertNodalMass (lines 65-123)

```typescript
export function convertNodalMass(
  rawData: (string | number)[][],
  context: ConversionContext
): NodalMassConversionResult {
  const nodalMasses: MCTNodalMass[] = [];
  const mctLines: string[] = [];

  // VBA comments (lines 56-57)
  mctLines.push('*NODALMASS    ; Nodal Masses');
  mctLines.push('; NODE_LIST, mX, mY, mZ, rmX, rmY, rmZ, rAngX, rAngY, rAngZ');

  for (let j = 0; j < rawData.length; j++) {
    const row = rawData[j];
    // ...

    // VBA coordinate swap (lines 65-70):
    // ES (X, Y, Z) → MCT (X, Z, Y)
    const mctMx = esMx;    // strBuf(1) = strData(4) - no swap
    const mctMy = esMz;    // strBuf(2) = strData(6) - ES mZ → MCT mY
    const mctMz = esMy;    // strBuf(3) = strData(5) - ES mY → MCT mZ
    const mctRmx = esRmx;  // strBuf(4) = strData(7) - no swap
    const mctRmy = esRmz;  // strBuf(5) = strData(9) - ES rmZ → MCT rmY
    const mctRmz = esRmy;  // strBuf(6) = strData(8) - ES rmY → MCT rmZ

    const mctLine = `${nodeNo},${mctMx},${mctMy},${mctMz},${mctRmx},${mctRmy},${mctRmz}`;
    mctLines.push(mctLine);
  }

  return { nodalMasses, mctLines };
}
```

---

## 6. VBA와 TypeScript 비교

| 항목              | VBA                      | TypeScript                  | 일치 |
| ----------------- | ------------------------ | --------------------------- | ---- |
| 시트 설정         | row=4, col=2-11          | row=4, col=2-11             | ✓    |
| 좌표 변환         | mY↔mZ, rmY↔rmZ           | mY↔mZ, rmY↔rmZ              | ✓    |
| 비숫자 처리       | 0으로 변환               | safeParseNumber             | ✓    |
| 출력 형식         | nodeNo,mX,mY,mZ,rmX,rmY,rmZ | nodeNo,mX,mY,mZ,rmX,rmY,rmZ | ✓    |

---

## 7. 결론

**✓ \*NODALMASS 변환은 VBA와 완전히 일치합니다.**

- 생성 조건: `節点質量` 시트에 데이터가 존재할 때
- 필요한 시트: `節点質量` (주요), `節点座標` (의존)
- 처리 경로: 문제 없음

> **핵심 포인트**:
> 1. 좌표 변환 적용: ES(X,Y,Z) → MCT(X,Z,Y)
> 2. 질량과 회전질량 모두 좌표 변환 적용
> 3. 비숫자 값은 0으로 처리
> 4. 출력 필드: 7개 (nodeNo, mX, mY, mZ, rmX, rmY, rmZ)

---

## 데이터 입력 예제

### Excel 시트 (`節点質量`)

|     | B    | C | D | E | F(mX) | G(mY) | H(mZ) | I(rmX) | J(rmY) | K(rmZ) |
| --- | ---- | - | - | - | ----- | ----- | ----- | ------ | ------ | ------ |
| 2   | 節点 |   |   |   | mX    | mY    | mZ    | rmX    | rmY    | rmZ    |
| 3   | 名称 |   |   |   | (tonf)| (tonf)| (tonf)|        |        |        |
| 4   | N1   |   |   |   | 100   | 150   | 200   | 0      | 0      | 0      |
| 5   | N2   |   |   |   | 50    | 75    | 100   | 0      | 0      | 0      |

### 변환 과정

| 행 | ES mX | ES mY | ES mZ | MCT mX | MCT mY | MCT mZ |
| -- | ----- | ----- | ----- | ------ | ------ | ------ |
| 4  | 100   | 150   | 200   | 100    | 200    | 150    |
| 5  | 50    | 75    | 100   | 50     | 100    | 75     |

> ES mY(150) → MCT mZ(150), ES mZ(200) → MCT mY(200)

### MCT 출력 결과

```
*NODALMASS    ; Nodal Masses
; NODE_LIST, mX, mY, mZ, rmX, rmY, rmZ, rAngX, rAngY, rAngZ
   1,100,200,150,0,0,0
   2,50,100,75,0,0,0
```

### 의존 관계

```
NODALMASS ──── 節点座標 (노드 번호 매핑)
                  ↓
              nodeMapping.get('N1') → 1
              nodeMapping.get('N2') → 2
```
