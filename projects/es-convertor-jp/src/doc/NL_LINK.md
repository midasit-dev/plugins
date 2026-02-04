# *NL-LINK 변환 검증

## 1. VBA 흐름

### 1.1 호출 위치 (main.bas)

VBA에서 ばね요素 변환은 2단계로 호출된다.

**1단계: 데이터 읽기 (Line 398)**
```vba
If ChangeSheetName.Exists(m_Sheet_ElmSpr) Then Call clsElmSpr.GetSpringElem(dicDblPnt)
```
- `m_Sheet_ElmSpr = "ばね要素"` (main.bas Line 42)
- Node 변환 전에 호출되어, 2중절점(dicDblPnt) 정보를 수집한다.

**2단계: MCT 출력 (Line 462)**
```vba
If ChangeSheetName.Exists(m_Sheet_ElmSpr) Then Call clsElmSpr.ChangeElemSpring(dicSPG6Comp)
```
- SPG6Comp 읽기 이후, SPGAllSym/SPGAllASym 출력 이전에 호출된다.
- 호출 순서: `GetHingeSPG6Comp` -> `GetSpringData` -> `ChangeElemSpring` -> `ChangeSPGAllSym` -> `ChangeSPGAllASym`

### 1.2 데이터 읽기

**GetSpringElem 함수 (Class110_ElemSpring.cls Line 57-80)**

| 항목 | 값 |
|------|-----|
| 시트명 | `ばね要素` |
| 시작행 | `nReadSTRow = 4` (VBA 1-based, 실제 4행) |
| 시작열 | `nReadSTCol = 2` (B열) |
| 끝열 | `nReadEDCol = 9` (I열) |
| 열 수 | 8개 (col 2~9) |

**strData 배열 구조 (0-based index):**

| Index | 열 | 내용 |
|-------|-----|------|
| 0 | B (col 2) | 요소번호 (Element ID) |
| 1 | C (col 3) | 절점1 (Node1) |
| 2 | D (col 4) | 절점2 (Node2) |
| 3 | E (col 5) | 속성명 (Property Name) |
| 4 | F (col 6) | 좌표계 문자열 (CoordSys) |
| 5 | G (col 7) | - |
| 6 | H (col 8) | - |
| 7 | I (col 9) | - |

**2중절점 판정 로직 (Line 69-78):**
```vba
Dim strRefElem As String: strRefElem = "参照要素"  ' Shift_JIS encoded
For i = 0 To UBound(strData, 2)
  If Left(strData(4, i), Len(strRefElem)) = strRefElem Then
    If Not dicDblPnt.Exists(strData(1, i)) Then dicDblPnt.Add strData(1, i), strData(2, i)
    If Not dicDblPnt.Exists(strData(2, i)) Then dicDblPnt.Add strData(2, i), strData(1, i)
  End If
Next i
```
- 좌표계가 `참조요소(参照要素)`로 시작하는 경우에만 node1, node2를 dicDblPnt에 추가한다.
- dicDblPnt의 Key는 절점명, Value는 상대 절점명이다.

### 1.3 데이터 가공

**ChangeElemSpring 함수 (Line 86-189)**

**Step 1: 요소번호 최대값 추출 (Line 101-107)**
```vba
For i = 0 To UBound(strData, 2)
  If IsNumeric(strData(0, i)) Then
    If nMax < strData(0, i) Then nMax = strData(0, i)
  End If
  If Len(strData(0, i)) > 0 Then m_ElemSprData.Add strData(0, i), strData(0, i)
Next i
```
- 숫자형 요소ID 중 최대값을 구한다.
- m_ElemSprData에 요소ID를 Key=Value로 등록한다.

**Step 2: 비숫자 요소번호에 번호 부여 (Line 109-116)**
```vba
nMax = nMax + 1
For i = 0 To m_ElemSprData.Count - 1
  If Not IsNumeric(m_ElemSprData.Keys(i)) Then
    m_ElemSprData(m_ElemSprData.Keys(i)) = nMax
    nMax = nMax + 1
  End If
Next i
```
- 문자열 요소ID에 `nMax+1`부터 순차적으로 번호를 부여한다.

**Step 3: 속성별 요소번호 수집 (Line 119-129)**
```vba
For i = 0 To UBound(strData, 2)
  If m_ElemSprProp.Exists(strData(3, i)) Then
    s = m_ElemSprProp(strData(3, i))
    s = s & "," & m_ElemSprData(strData(0, i))
    m_ElemSprProp(strData(3, i)) = s
  Else
    m_ElemSprProp(strData(3, i)) = m_ElemSprData(strData(0, i))
  End If
Next i
```
- m_ElemSprProp: Key=속성명, Value=콤마구분 요소번호 목록

**Step 4: CalcAngle - 좌표계 처리 (Line 191-272)**

`CalcAngle` 함수는 각 요소별로 호출되며 다음 입력을 받는다:
- `strN1`, `strN2`: 절점명
- `strName`: 속성명 (ByRef, 변경될 수 있음)
- `strCoordSys`: 좌표계 문자열
- `dicSPG6Comp`: 6성분 매핑
- `vCoordSys`: 좌표계 판별 배열 `Array("参照要素", "ベクトル:""v1=Global", "ベクトル:""v1=X=")`

**4-1. 2중절점 판정 (Line 215-219)**
```vba
strSprPnt = "_NotSame"
If m_DicOrgNode(strN1) = m_DicOrgNode(strN2) Then
  strSprPnt = "_Same"
End If
```
- 원본 좌표가 같은 경우 `_Same`, 다른 경우 `_NotSame`

**4-2. dicComponent 로직 - ~1, ~2 접미사 처리 (Line 221-254)**

같은 속성명이지만 다른 좌표계(`strCoordSys + strSprPnt`)를 사용하는 경우:
1. 기존 속성과 좌표계가 다르면 `~1`, `~2` 등의 접미사를 붙인 새 속성명을 생성한다.
2. `m_SprCompORG`, `m_SprComp` 배열을 확장하여 원본 데이터를 복사한다.
3. `dicSPG6Comp`에도 새 속성명을 추가한다.
4. **핵심:** `m_SprComp(n).vAngle`을 `Array(Dx, Dz, -Dy, Rx, Rz, -Ry)`로 설정한다.
   - 이는 참조요소의 경우 성분 순서를 바꾸는 것이다: `(Dx, Dy, Dz, Rx, Ry, Rz)` -> `(Dx, Dz, -Dy, Rx, Rz, -Ry)`

**4-3. 참조요소 분기 (Line 256-262)**
```vba
If Left(strCoordSys, Len(vCoordSys(0))) = vCoordSys(0) Then
  ' 参照要素
  m_dicSpgRef.Add strName, True
  vBuf = Split(strCoordSys, ":")
  If UBound(vBuf) = 1 Then
    strAngle = "0," & m_ElemAngle(vBuf(1))(0)
  End If
```
- 참조요소인 경우: `strAngle = "0,{참조요소의 각도}"`
- 형식: `0,{angle}` (iRCS=0)

**4-4. 벡터 분기 (Line 263-268)**
```vba
Else
  strAngle = "1,2,"
  strAngle = strAngle & Split_CoordSys(strCoordSys)
  n = m_dicSprProp(strName)
  m_SprComp(n).vAngle = Array(Dx, Dy, Dz, Rx, Ry, Rz)
End If
```
- 벡터인 경우: `strAngle = "1,2,{v1x},{v1y},{v1z},{v2x},{v2y},{v2z}"`
- 형식: `1,2,{6개 벡터값}` (iRCS=1, iMETHOD=2)
- `vAngle`을 `Array(Dx, Dy, Dz, Rx, Ry, Rz)` = 정상 순서로 설정한다.

**Step 5: Split_CoordSys - 좌표계 문자열 해석 (Line 348-413)**

좌표계 문자열 형식: `ベクトル:"v1=...,v2=...,Align=...,Axis=..."`

**Case A: v1, v2 모두 Global (Line 367-379)**
- 문자열에서 `Global`이 2번 나타나면 dicChangeVecter 딕셔너리에서 매핑 조회
- 키 형식: `"X,Y,v1,xl"` 등
- 36개 조합 (6 plane 조합 x 6 Align/Axis 조합)

**Case B: v1, v2 중 비 Global 존재 (Line 381-407)**
- 따옴표로 분리하여 v1, v2 문자열을 추출
- 각각 `Change_Global`, `Change_Alpha`, `Change_Vect`로 벡터 변환
- Align/Axis에 따라 3가지 경우:
  - `v1,xl` 또는 `v2,yl`: `v1x,-v1z,v1y,cross(v1,v2)`
  - `v1,yl` 또는 `v2,zl`: `cross(v1,v2),v2x,-v2z,v2y`
  - `v1,zl` 또는 `v2,xl`: `v1x,-v1z,v1y,v2x,-v2z,v2y`

**좌표 변환 규칙:** ES -> MIDAS 변환 시 `(x, y, z) -> (x, -z, y)` 적용

**Step 6: 보조 함수들**

- `Change_Global (Line 274-282)`: GlobalX/Y/Z -> `(1,0,0)/(0,1,0)/(0,0,1)`
- `Change_Alpha (Line 284-303)`: `Alpha=a,Beta=b` -> `(cos(b)*cos(a), cos(b)*sin(a), sin(b))`
  - 주의: VBA에서 `vAlpha = Split(vBuf(0), "=")` 후 `vAlpha = vAlpha(2)` -> 세 번째 요소 사용 (v1=Alpha=30 형태이므로)
- `Change_Vect (Line 304-321)`: `X=x,Y=y,Z=z` -> 파싱
  - `vX(2)`, `vY(1)`, `vZ(1)` 사용 (v1=X=1 형태이므로 인덱스 다름)
- `Calc_Vecter (Line 322-345)`: 외적 계산
  - 정규화 후 외적: `vRet = (v2[1]*-v1[2] - v1[1]*-v2[2], v2[2]*-v1[0] - v1[2]*-v2[2], v2[0]*v1[1] - v1[0]*-v2[1])`
  - 출력 형식: `vRet(0),-vRet(2),vRet(1)` (여기서도 y/z 교환)

### 1.4 MCT 출력

**출력 형식 (Line 131-184)**

```
*NL-LINK  ; General Link
; iNO, iNODE1, iNODE2, GPROP, IEPROP, iRCS, ANGLE, GROUP
; iNO, iNODE1, iNODE2, GPROP, IEPROP, iRCS, iMETHOD, ANGLE-x, ANGLE-y, ANGLE-z, GROUP
; iNO, iNODE1, iNODE2, GPROP, IEPROP, iRCS, iMETHOD, P0X, P0Y, P0Z, P1X, P1Y, P1Z, P2X, P2Y, P2Z, GROUP
; iNO, iNODE1, iNODE2, GPROP, IEPROP, iRCS, iMETHOD, V1X, V1Y, V1Z, V2X, V2Y, V2Z, GROUP
```

**각 요소의 출력 라인 구성 (Line 160-181):**
```
{elemNo},{node1},{node2},{GPROP},{IEPROP},{angleStr},
```

- `elemNo`: m_ElemSprData에서 조회 (숫자 또는 자동부여)
- `node1`, `node2`: m_NodeData에서 조회
- `GPROP`: `ChgCamma(strData(3,j))` - 속성명에서 콤마를 대시로 치환
- `IEPROP`: `dicSPG6Comp`에 존재하면 `"NL_" & strData(3,j)`, 없으면 빈 문자열
- `angleStr`: CalcAngle 결과
  - 참조요소: `0,{angle}`
  - 벡터: `1,2,{v1x},{v1y},{v1z},{v2x},{v2y},{v2z}`
- 마지막 GROUP은 빈 문자열

**ChgCamma 함수:** `Replace(strORG, ",", "-")` - 콤마를 대시로 치환

---

## 2. TypeScript 흐름

### 2.1 호출 위치 (MCTGenerator.ts)

**MCTGenerator.ts Line 288-355:**

```typescript
// Step 14: Convert spring elements
report(70, 'ばね要素を変換中...');
```

호출 순서:
1. `parseSPG6CompData` (SPG6Comp 파싱)
2. `parseSymmetricSpringTables` (대칭 스프링 데이터 파싱)
3. `parseAsymmetricSpringTables` (비대칭 스프링 데이터 파싱)
4. **`convertSpringElements`** (ElemSpring MCT 출력) -- Line 350
5. `convertSymmetricSprings` (NL-PROP 출력)

- VBA와 동일하게 SPG6Comp -> 스프링 상세 데이터 -> ElemSpring -> NL-PROP 순서로 처리한다.

### 2.2 데이터 읽기

**시트 설정 (sheetNames.ts Line 126):**
```typescript
ELEM_SPRING: { name: 'ばね要素', startRow: 4, startCol: 2, endCol: 9, headerRows: 2 },
```
- VBA와 동일: startRow=4, startCol=2, endCol=9, 8열

**parseSpringElementData 함수 (ElemSpringConverter.ts Line 106-126):**

rawData 배열 매핑:

| Index | VBA strData | 내용 |
|-------|-------------|------|
| row[0] | strData(0,i) | 요소ID |
| row[1] | strData(1,i) | 절점1 |
| row[2] | strData(2,i) | 절점2 |
| row[3] | strData(3,i) | 속성명 |
| row[4] | strData(4,i) | 좌표계/타입 |
| row[5] | strData(5,i) | 참조방향 |

**getSpringDoublePoints 함수 (Line 81-101):**

```typescript
if (refType.includes('セル:セル') || refType.includes('参照方向:セル')) {
  if (node1) doublePoints.add(node1);
  if (node2) doublePoints.add(node2);
}
```

### 2.3 데이터 가공

**convertSpringElements 함수 (Line 558-714):**

**Step 1: 요소번호 매핑 (Line 574-598)**
- VBA와 동일한 로직: 숫자 ID의 최대값 구한 후, 비숫자 ID에 순차 부여

**Step 2: dicComponent 로직 (Line 600-686)**
- VBA와 동일: 같은 속성명에 다른 좌표계가 사용될 때 `~1`, `~2` 접미사 추가
- `componentKey = coordSysStr + strSprPnt` (Line 639)
- 2중절점 판정: `origNode1.x === origNode2.x && ...` (Line 631-635)
- springCompData 복사 포함 (Line 662-678)

**Step 3: calcAngleString 함수 (Line 398-478)**

참조요소 분기 (Line 404-418):
```typescript
if (isRefElement) {
  const parts = strCoordSys.split(':');
  if (parts.length === 2) {
    const refElemName = parts[1].trim();
    const refElemNo = context.elementMapping?.get(refElemName);
    if (refElemNo !== undefined) {
      const refAngle = context.elementAngles?.get(refElemNo);
      if (refAngle !== undefined) {
        return `0,${refAngle}`;
      }
    }
  }
  return '0,0';
}
```

벡터 분기 (Line 421-477):
- `anglePrefix = '1,2,'`
- Global 2개인 경우: `VECTOR_TRANSFORMATIONS` 딕셔너리 참조
- 비 Global인 경우: 따옴표 분리 후 벡터 계산

**Step 4: Split_CoordSys 등가 처리**

`VECTOR_TRANSFORMATIONS` 상수 (Line 18-66): 36개 매핑 정의

보조 함수:
- `parseVectorString (Line 483-517)`: VBA `Change_Global`, `Change_Alpha`, `Change_Vect` 통합
- `calcVectorCross (Line 522-544)`: VBA `Calc_Vecter` 동일 로직

### 2.4 MCT 출력

**출력 형식 (Line 567-572):**
```typescript
mctLines.push('*NL-LINK  ; General Link');
mctLines.push('; iNO, iNODE1, iNODE2, GPROP, IEPROP, iRCS, ANGLE, GROUP');
mctLines.push('; iNO, iNODE1, iNODE2, GPROP, IEPROP, iRCS, iMETHOD, ANGLE-x, ANGLE-y, ANGLE-z, GROUP');
mctLines.push('; iNO, iNODE1, iNODE2, GPROP, IEPROP, iRCS, iMETHOD, P0X, P0Y, P0Z, P1X, P1Y, P1Z, P2X, P2Y, P2Z, GROUP');
mctLines.push('; iNO, iNODE1, iNODE2, GPROP, IEPROP, iRCS, iMETHOD, V1X, V1Y, V1Z, V2X, V2Y, V2Z, GROUP');
```
- VBA와 완전히 동일한 5줄의 주석 헤더

**각 요소 출력 (Line 696-701):**
```typescript
const gprop = chgComma(propName);
const ieprop = spg6CompMapping.has(origPropName) ? `NL_${propName}` : '';
const mctLine = `${elemNo},${node1No},${node2No},${gprop},${ieprop},${angleStr},`;
```

---

## 3. 비교 분석

### 3.1 동일한 부분

| 항목 | VBA | TypeScript | 일치 |
|------|-----|-----------|------|
| 시트명 | `ばね要素` | `ばね要素` | O |
| 읽기 범위 | row=4, col=2~9 | startRow=4, startCol=2, endCol=9 | O |
| 주석 헤더 5줄 | 동일 | 동일 | O |
| 요소번호 최대값 + 자동부여 | 동일 로직 | 동일 로직 | O |
| ChgCamma (콤마->대시) | `Replace(str, ",", "-")` | `str.replace(/,/g, '-')` | O |
| MCT 출력 형식 | `elemNo,n1,n2,GPROP,IEPROP,angleStr,` | 동일 | O |
| dicChangeVecter 36개 매핑 | VBA Class_Initialize | VECTOR_TRANSFORMATIONS 상수 | O |
| dicComponent ~접미사 로직 | 동일 | 동일 | O |
| 참조요소: `"0,{angle}"` | 동일 | 동일 | O |
| 벡터: `"1,2,{v1},{v2}"` | 동일 | 동일 | O |
| Calc_Vecter 외적 계산 | 동일 수식 | 동일 수식 | O |
| Change_Global | GlobalX/Y/Z -> 단위벡터 | parseVectorString GlobalX/Y/Z | O |
| Change_Alpha | cos/sin 계산 | parseVectorString Alpha/Beta | O |
| 2중절점 판정 (`_Same`/`_NotSame`) | `m_DicOrgNode` 비교 | `originalNodeCoords` 비교 | O |

### 3.2 차이점

#### 차이 1: 2중절점(dicDblPnt) 판정 조건

| 항목 | VBA | TypeScript |
|------|-----|-----------|
| 조건 | `Left(strData(4,i), Len("参照要素")) = "参照要素"` | `refType.includes('セル:セル') \|\| refType.includes('参照方向:セル')` |
| 판정 대상 | 좌표계가 "参照要素"로 시작하는 경우 | "セル:セル" 또는 "参照方向:セル"을 포함하는 경우 |

- **VBA:** `strData(4, i)` = 좌표계 문자열이 "参照要素"로 시작하면 양쪽 노드를 dicDblPnt에 추가
- **TS:** `row[5]` = refDirection이 "セル:セル" 또는 "参照方向:セル"을 포함하면 추가
- **원인:** VBA의 `strData(4,i)`는 index 4 = col F (좌표계), TS의 `row[5]`는 index 5 = col G (참조방향). 읽는 열이 다르며, 판정 문자열도 다르다.

#### 차이 2: IEPROP 출력 시 속성명 참조

| 항목 | VBA | TypeScript |
|------|-----|-----------|
| IEPROP | `"NL_" & strData(3, j)` (항상 원본명) | `"NL_" + propName` (~접미사 포함명 사용) |
| GPROP | `ChgCamma(strData(3,j))` (항상 원본명) | `chgComma(propName)` (~접미사 포함명 사용) |

- **VBA:** GPROP, IEPROP 모두 `strData(3,j)` = **원본 속성명**을 사용한다. 단, `strName`은 ByRef로 변경되므로 CalcAngle 내부에서 `strName = strName & s`로 변경된 값이 CalcAngle 이후에 반영되지만, MCT 출력 시에는 `strData(3,j)`를 직접 사용하므로 **원본명이 출력된다.**
- **TS:** `propName`이 dicComponent 로직에 의해 `~1` 등이 붙은 상태로 GPROP, IEPROP에 사용된다.

**실제로 VBA를 재검토하면:**
```vba
str6Comp = strData(3, j)                    ' Line 155: 원본명 보존
strAngle = CalcAngle(..., strData(3, j), ...) ' Line 156: strData(3,j)는 ByRef가 아님
                                              ' 그러나 strName 파라미터는 ByRef
...
strBuf(3) = ChgCamma(strData(3, j))        ' Line 165: 원본명 사용
If dicSPG6Comp.Exists(str6Comp) Then        ' Line 167: 원본명으로 체크
  strBuf(4) = "NL_" & strData(3, j)         ' Line 168: 원본명 사용
```

그런데 CalcAngle의 세 번째 파라미터 `strName`은 `ByRef`이며, CalcAngle 내부에서 `strName = strName & s` (Line 244)로 변경한다. 이 `strName`은 CalcAngle 호출 시 `strData(3, j)`를 전달받았다. VBA에서 **ByRef로 배열 요소를 전달하면 원본 배열도 변경된다.** 따라서 **strData(3, j) 자체가 변경된다.**

결론: VBA에서도 `strData(3, j)`가 CalcAngle에 의해 `~1` 접미사가 추가된 상태에서 MCT 출력에 사용되므로, **TS의 동작이 VBA와 일치한다.**

> **주의:** 단, VBA Line 155에서 `str6Comp = strData(3, j)`로 **CalcAngle 호출 전에** 원본명을 미리 저장하고, Line 167에서 `dicSPG6Comp.Exists(str6Comp)`로 원본명을 사용하여 6성분 존재 여부를 판정한다. TS도 `origPropName` (Line 616)으로 동일하게 처리하므로 일치한다.

#### 차이 3: m_ElemSprProp (속성별 요소번호 수집)

| 항목 | VBA | TypeScript |
|------|-----|-----------|
| 처리 | m_ElemSprProp 딕셔너리 구축 (Line 119-129) | 없음 |
| 용도 | 이후 SPGAllSym 등에서 사용 | context를 통해 다른 방식으로 전달 |

- VBA의 m_ElemSprProp는 속성명별로 해당 속성을 사용하는 요소번호 목록을 콤마구분 문자열로 저장한다. 이 정보는 후속 SPG 변환에서 사용된다.
- TS에서는 이 정보를 별도로 구축하지 않고, ConversionContext를 통해 필요한 정보를 전달한다.

#### 차이 4: splitCoordSys 함수의 존재

| 항목 | VBA | TypeScript |
|------|-----|-----------|
| 함수 | Split_CoordSys만 사용 (calcAngleString 내부) | splitCoordSys (Line 137-234) + calcAngle (Line 240-333) 두 가지 함수 존재 |

- TS에는 `splitCoordSys` (범용 좌표계 해석)와 `calcAngleString` (MCT용 각도 문자열 생성) 두 개의 별도 함수가 있다.
- `splitCoordSys`는 `calcAngle` 함수에서 사용되지만, `convertSpringElements`에서는 `calcAngleString`을 직접 호출한다.
- `calcAngle` 함수(Line 240-333)는 `convertSpringElements`에서 **사용되지 않는 미사용 코드**이다.

#### 차이 5: VBA의 vAngle 설정

| 항목 | VBA | TypeScript |
|------|-----|-----------|
| 참조요소 | `vAngle = Array(Dx, Dz, -Dy, Rx, Rz, -Ry)` | springCompData에 Deep copy |
| 벡터 | `vAngle = Array(Dx, Dy, Dz, Rx, Ry, Rz)` | 별도 처리 없음 |

- VBA에서 CalcAngle은 참조요소/벡터에 따라 `m_SprComp(n).vAngle`의 성분 순서를 변경한다. 이는 후속 NL-PROP 출력 시 스프링 성분(Dx,Dy,Dz,Rx,Ry,Rz)의 배치 순서에 영향을 준다.
- TS에서는 springCompData의 복사 시 성분 순서 변경 로직이 주석으로만 언급되어 있다 (Line 671).

#### 차이 6: VECTOR_TRANSFORMATIONS 매핑값 차이

VBA `dicChangeVecter`와 TS `VECTOR_TRANSFORMATIONS` 비교:

| Key | VBA strVect Index | VBA 값 | TS 값 | 일치 |
|-----|-------------------|--------|-------|------|
| X,Y,v1,yl | strVect(4) | `0,-1,0,0,0,1` | `0,-1,0,0,0,1` | O |
| X,Z,v1,yl | strVect(6) | `0,0,-1,0,-1,0` | `0,0,-1,0,-1,0` | O |
| Y,Z,v1,yl | strVect(0) | `1,0,0,0,-1,0` | `1,0,0,0,-1,0` | O |
| Y,X,v1,yl | strVect(7) | `0,1,0,1,0,0` | `0,1,0,1,0,0` | O |
| Z,X,v1,yl | strVect(2) | `0,0,1,1,0,0` | `0,0,1,1,0,0` | O |
| Z,Y,v1,yl | strVect(8) | `-1,0,0,0,0,1` | `-1,0,0,0,0,1` | O |
| X,Y,v1,zl | strVect(2) | `0,0,1,1,0,0` | `0,0,1,1,0,0` | O |
| X,Z,v1,zl | strVect(9) | `0,-1,0,1,0,0` | `0,-1,0,1,0,0` | O |
| Y,Z,v1,zl | strVect(4) | `0,-1,0,0,0,1` | `0,-1,0,0,0,1` | O |
| Y,X,v1,zl | strVect(10) | `1,0,0,0,0,1` | `1,0,0,0,0,1` | O |
| Z,X,v1,zl | strVect(0) | `1,0,0,0,-1,0` | `1,0,0,0,-1,0` | O |
| Z,Y,v1,zl | strVect(11) | `0,0,1,0,-1,0` | `0,0,1,0,-1,0` | O |

모든 36개 매핑값이 VBA와 TS에서 동일하다.

### 3.3 차이로 인한 MCT 결과 영향

#### 차이 1 영향 (2중절점 판정 조건)

- **영향도: 낮음 (MCT 직접 영향 없음)**
- `getSpringDoublePoints`의 결과는 `doublePointNodes`로 반환되어 이후 Node 변환 등에 사용된다.
- NL-LINK MCT 출력 자체에는 직접적 영향이 없다.
- 그러나 Node 변환에서 2중절점 처리가 달라질 수 있어, 간접적으로 node 번호가 달라질 가능성이 있다.
- VBA는 `참조요소`를 조건으로 사용하고, TS는 `セル:セル`/`参照方向:セル`을 조건으로 사용하므로 판정 대상 요소가 완전히 다르다. **실제 ES 데이터의 포맷에 따라 검증 필요.**

#### 차이 3 영향 (m_ElemSprProp 미구축)

- **영향도: 없음 (NL-LINK MCT에 대해)**
- m_ElemSprProp은 NL-LINK 출력에 사용되지 않으며, 후속 처리에서 다른 메커니즘으로 대체된다.

#### 차이 4 영향 (미사용 코드)

- **영향도: 없음**
- `calcAngle`과 `splitCoordSys` 함수는 `convertSpringElements`에서 호출되지 않으므로 MCT 결과에 영향 없음.
- 코드 정리 차원에서 제거를 고려할 수 있으나 기능에는 무영향.

#### 차이 5 영향 (vAngle 성분 순서)

- **영향도: 중간 (NL-PROP 출력에 영향)**
- NL-LINK 출력에는 직접 영향이 없으나, 참조요소를 사용하는 스프링의 NL-PROP 출력 시 성분 순서(Dx,Dy,Dz vs Dx,Dz,-Dy)가 달라질 수 있다.
- 이 차이는 NL-PROP 변환 검증에서 별도로 확인해야 한다.

---

## 4. 결론

**판정: PASS (조건부)**

NL-LINK MCT 출력 자체는 VBA와 TypeScript가 동일한 결과를 생성한다.

### 확인된 일치 사항:
- MCT 헤더 주석 5줄: 완전 일치
- 요소번호 자동 부여 로직: 완전 일치
- GPROP/IEPROP 출력: 완전 일치 (VBA ByRef 동작 포함)
- 참조요소/벡터 분기: 완전 일치
- VECTOR_TRANSFORMATIONS 36개 매핑: 완전 일치
- Calc_Vecter 외적 계산: 완전 일치
- dicComponent ~접미사 처리: 완전 일치
- ChgCamma 함수: 완전 일치
- 2중절점 판정 (`_Same`/`_NotSame`): 완전 일치

### 수정 이력
- **2025-01 수정 완료**: 2중절점(dicDblPnt) 판정 조건 수정 — `getSpringDoublePoints` 함수에서:
  - `row[5]` → `row[4]` (VBA의 `strData(4,i)`와 일치하도록 인덱스 수정)
  - 조건 `refType.includes('セル:セル') || refType.includes('参照方向:セル')` → `refType.startsWith('参照要素')` (VBA의 `Left(strData(4,i), Len("参照要素")) = "参照要素"` 로직과 일치)

### 잔여 주의사항
1. **vAngle 성분 순서** - 참조요소 사용 시 NL-PROP 출력에서 성분 순서 차이가 발생할 수 있음. NL-PROP 검증에서 별도 확인 필요.
2. **미사용 코드 존재** - `calcAngle`(Line 240-333), `splitCoordSys`(Line 137-234), `parseReferenceDirection`(Line 351-391) 등은 `convertSpringElements`에서 사용되지 않는 코드이므로 혼동 주의.
