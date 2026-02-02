# \*ELEMENT MCT 변환 분석

## 개요

ES(Engineer Studio) 엑셀의 요소 관련 시트를 MIDAS Civil NX의 `*ELEMENT` 및 `*RIGIDLINK` 섹션으로 변환

> **중요**: 이 변환은 **3개의 MCT 블록**을 생성할 수 있습니다:
> 1. **`*ELEMENT` (Beam)**: 프레임 요소 → `フレーム要素` 시트
> 2. **`*ELEMENT` (PLATE)**: 평판 요소 → `平板要素` 시트
> 3. **`*RIGIDLINK`**: 강체 요소 → `剛体要素` 시트

---

## 1. 필요한 데이터 시트

### 1.1 프레임 요소 (フレーム要素)

| 항목    | VBA               | TypeScript        | 상태 |
| ------- | ----------------- | ----------------- | ---- |
| 시트명  | `m_Sheet_Frame`   | `フレーム要素`    | ✓    |
| 시작 행 | 3 (nReadSTRow)    | 3                 | ✓    |
| 열 범위 | B~K (2~11)        | B~K (2~11)        | ✓    |

#### 열 구조

| 열  | 인덱스  | VBA 변수       | TypeScript  | 설명                  |
| --- | ------- | -------------- | ----------- | --------------------- |
| B   | row[0]  | strData(0, i)  | elemId      | 要素名称              |
| C   | row[1]  | strData(1, i)  | node1Id     | i-節点                |
| D   | row[2]  | strData(2, i)  | node2Id     | j-節点                |
| E   | row[3]  | strData(3, i)  | -           | 長さ (미사용)         |
| F   | row[4]  | strData(4, i)  | iSectName   | i-断面                |
| G   | row[5]  | strData(5, i)  | jSectName   | j-断面                |
| H   | row[6]  | strData(6, i)  | coordStr    | 座標系                |
| I   | row[7]  | strData(7, i)  | -           | (미사용)              |
| J   | row[8]  | strData(8, i)  | elemType    | 要素タイプ (M−φ要素 등) |
| K   | row[9]  | strData(9, i)  | -           | (미사용)              |

### 1.2 평판 요소 (平板要素)

| 항목    | VBA               | TypeScript        | 상태 |
| ------- | ----------------- | ----------------- | ---- |
| 시트명  | `m_Sheet_PlnElm`  | `平板要素`        | ✓    |
| 시작 행 | 3 (nReadSTRow)    | 3                 | ✓    |
| 열 범위 | B~I (2~9)         | B~I (2~9)         | ✓    |

#### 열 구조

| 열  | 인덱스  | VBA 변수       | TypeScript   | 설명                     |
| --- | ------- | -------------- | ------------ | ------------------------ |
| B   | row[0]  | strData(0, i)  | elemId       | 要素名称                 |
| C   | row[1]  | strData(1, i)  | type         | タイプ                   |
| D   | row[2]  | strData(2, i)  | nodeListStr  | 節点リスト (カンマ区切り) |
| E   | row[3]  | strData(3, i)  | -            | ov.                      |
| F   | row[4]  | strData(4, i)  | sectName     | 断面名称                 |
| G   | row[5]  | strData(5, i)  | -            | 鉄筋断面                 |
| H   | row[6]  | strData(6, i)  | -            | Cx                       |
| I   | row[7]  | strData(7, i)  | -            | Cy                       |

### 1.3 강체 요소 (剛体要素)

| 항목    | VBA               | TypeScript        | 상태 |
| ------- | ----------------- | ----------------- | ---- |
| 시트명  | `m_Sheet_Rigid`   | `剛体要素`        | ✓    |
| 시작 행 | 3 (nReadSTRow)    | 3                 | ✓    |
| 열 범위 | B~D (2~4)         | B~D (2~4)         | ✓    |

#### 열 구조

| 열  | 인덱스  | VBA 변수       | TypeScript    | 설명                       |
| --- | ------- | -------------- | ------------- | -------------------------- |
| B   | row[0]  | strData(0, j)  | elemId        | 要素名称                   |
| C   | row[1]  | strData(1, j)  | masterNodeId  | マスター節点               |
| D   | row[2]  | strData(2, j)  | slaveNodesStr | スレーブ節点 (カンマ区切り) |

### 의존 시트

| 시트명               | TypeScript 상수      | 용도                              | 필수 여부       |
| -------------------- | -------------------- | --------------------------------- | --------------- |
| `節点座標`           | `NODE`               | 노드 번호 매핑                    | **필수**        |
| `材料`               | `MATERIAL`           | 재료 번호 조회                    | **필수**        |
| `断面特性ｵﾌﾟｼｮﾝ`     | `SECT`               | 단면 번호 조회 (Frame)            | Frame 시 필수   |
| `平板断面`           | `PLN_SECT`           | 두께 번호 조회 (Plane)            | Plane 시 필수   |
| `数値断面`           | `NUMB_SECT`          | 단면→재료 매핑                    | 선택            |
| `断面要素`           | `SECT_ELEM`          | 단면→재료 매핑                    | 선택            |

---

## 2. 출력 구조

### 2.1 프레임 요소 (`*ELEMENT` - Beam)

```
*ELEMENT    ; Elements
; iEL, TYPE, iMAT, iPRO, iN1, iN2, ANGLE, iSUB,                     ; Frame  Element
1,Beam,1,1,1,2,0,0
2,Beam,1,2,2,3,0,0
3,Beam,2,3,3,4,180,0
```

| 필드  | 설명                    | 소스                              |
| ----- | ----------------------- | --------------------------------- |
| iEL   | 요소 번호               | elemId (자동 번호 할당 가능)      |
| TYPE  | 요소 타입               | 항상 `Beam`                       |
| iMAT  | 재료 번호               | sect2Material → materialMapping   |
| iPRO  | 단면 번호               | sectionMapping (i-j 조합)         |
| iN1   | i-노드 번호             | nodeMapping                       |
| iN2   | j-노드 번호             | nodeMapping                       |
| ANGLE | 베타 각도               | CalcAngle() 계산                  |
| iSUB  | 서브 타입               | 항상 `0`                          |

### 2.2 평판 요소 (`*ELEMENT` - PLATE)

```
*ELEMENT    ; Elements
; iEL, TYPE, iMAT, iPRO, iN1, iN2, iN3, iN4, iSUB, iWID , LCAXIS    ; Planar Element
101,PLATE,1,1,1,2,3,4,1, 0
102,PLATE,1,1,5,6,7,0,1, 0
```

| 필드   | 설명                    | 소스                              |
| ------ | ----------------------- | --------------------------------- |
| iEL    | 요소 번호               | nElemMax + 1 (프레임 이후 번호)   |
| TYPE   | 요소 타입               | 항상 `PLATE`                      |
| iMAT   | 재료 번호               | plnSect → materialMapping         |
| iPRO   | 두께 번호               | plnSectMapping                    |
| iN1~4  | 노드 번호               | nodeMapping (3 or 4개)            |
| iSUB   | 서브 타입               | 항상 `1`                          |
| iWID   | -                       | 항상 `0`                          |

### 2.3 강체 요소 (`*RIGIDLINK`)

```
*RIGIDLINK    ; Rigid Link
; M-NODE, DOF, S-NODE LIST, GROUP
1,111111,2 3 4,
5,111111,6 7,
```

| 필드       | 설명                    | 소스                              |
| ---------- | ----------------------- | --------------------------------- |
| M-NODE     | 마스터 노드 번호        | nodeMapping                       |
| DOF        | 자유도 구속             | 항상 `111111`                     |
| S-NODE LIST| 슬레이브 노드 목록      | nodeMapping (공백 구분)           |
| GROUP      | 그룹                    | 항상 빈값                         |

---

## 3. 처리 경로

### VBA 처리 흐름

```
1. clsFrame.ReadFrame_Sectname() → 단면 이름 수집, m_ElemNode 저장
2. clsFrame.SetElemNo() → 최대 요소 번호 검출, 비숫자 ID 번호 할당
3. clsFrame.ChangeFrame() → *ELEMENT (Beam) 출력, 각도 계산
4. clsPlnElm.ChangePlnElm() → *ELEMENT (PLATE) 출력, 요소 번호 이어서 할당
5. clsRigid.ReadRigid() → 강체 데이터 읽기
6. clsRigid.ChangeRigid() → *RIGIDLINK 출력
```

### TypeScript 처리 흐름

```
1. readFrameSectionNames() → 단면 이름 수집, elementNodes/elemNodeNames 저장
2. setElementNumbers() → 최대 요소 번호 검출, 비숫자 ID 번호 할당
3. convertFrames() → *ELEMENT (Beam) 출력, 각도 계산
4. convertPlaneElements() → *ELEMENT (PLATE) 출력
5. readRigidData() → 강체 데이터 읽기
6. convertRigid() → *RIGIDLINK 출력
```

---

## 4. 좌표계/각도 계산 (CalcAngle)

### 기본 좌표계 매핑

| 座標系                | 인덱스 | 수직 요소 각도 | 비수직 요소 각도 |
| --------------------- | ------ | -------------- | ---------------- |
| Y軸                   | 0      | 180            | 0                |
| ベクトル:Global X     | 1      | 0              | 0                |
| ベクトル:Global Y     | 2      | 180            | 0                |
| ベクトル:Global Z     | 3      | 270            | 90               |

### 고급 좌표계

| 접두사                | 설명                    | 예시                              |
| --------------------- | ----------------------- | --------------------------------- |
| 節点:                 | 참조 노드 지정          | `節点:N5`                         |
| ベクトル:Alpha=       | Alpha/Beta 각도 지정    | `ベクトル:Alpha=x,y=z`            |
| ベクトル:X=           | 벡터 좌표 지정          | `ベクトル:X=x,y=z,w=value`        |
| ポイント=             | 포인트 좌표 지정        | `ポイント=x,y=z,w=value`          |

---

## 5. 요소 번호 할당 로직

### VBA (SetElemNo)

```vba
' 1. 최대 요소 번호 검출
For i = 0 To UBound(strData, 2)
  If IsNumeric(strData(0, i)) Then
    If nElemMax < strData(0, i) Then nElemMax = strData(0, i)
  End If
Next i

' 2. 강체 요소도 체크
For i = 0 To UBound(strRigidData, 2)
  If IsNumeric(strRigidData(0, i)) Then
    If nElemMax < strRigidData(0, i) Then nElemMax = strRigidData(0, i)
  End If
Next i

' 3. 비숫자 ID에 번호 할당
nElemMax = nElemMax + 1
For i = 0 To m_ElemData.Count - 1
  If Not IsNumeric(m_ElemData.Keys(i)) Then
    m_ElemData(m_ElemData.Keys(i)) = nElemMax
    nElemMax = nElemMax + 1
  End If
Next i
```

---

## 6. M-φ 요소 감지

Frame 요소의 열 J (row[8])에 `M−φ要素` 또는 `M-φ要素` 값이 있으면 힌지 요소로 처리합니다.

```typescript
// VBA: If strData(8, i) = "M−φ要素" Then dicHingeElem.Add strData(0, i), True
if (elemType === 'M−φ要素' || elemType === 'M-φ要素') {
  hingeElements.add(elemId);
}
```

---

## 7. Context에 저장되는 데이터

| Map               | Key                 | Value                     | 용도                          |
| ----------------- | ------------------- | ------------------------- | ----------------------------- |
| elementMapping    | 요소 ID (string)    | 요소 번호 (number)        | 요소 번호 조회                |
| elementNodes      | 요소 번호 (number)  | {node1, node2}            | 요소 노드 조회                |
| elemNodeNames     | 요소 ID (string)    | {nodeI, nodeJ}            | LoadConverter에서 사용        |
| elementAngles     | 요소 번호 (number)  | 각도 (number)             | 요소 각도 조회                |
| elemNo2MaterialNo | 요소 번호 (number)  | 재료 번호 (number)        | 요소-재료 매핑                |
| rigidElements     | 요소 번호 (number)  | {masterNode, slaveNodes}  | 강체 요소 정보                |
| rigidMasterNode   | 요소 ID (string)    | 마스터 노드 ID (string)   | LoadConverter에서 사용        |
| maxElementNo      | -                   | number                    | 다음 요소 번호 시작점         |

---

## 8. 결론

**✓ \*ELEMENT 변환은 VBA와 완전히 일치합니다.**

- 필요한 시트:
  - Frame: `フレーム要素` (주요), `節点座標`, `材料`, `断面特性ｵﾌﾟｼｮﾝ` (의존)
  - Plane: `平板要素` (주요), `節点座標`, `材料`, `平板断面` (의존)
  - Rigid: `剛体要素` (주요), `節点座標` (의존)
- 처리 경로: 문제 없음
- 누락된 기능: 없음

> **핵심 포인트**:
> 1. **3개의 MCT 블록** 생성 가능 (`*ELEMENT`×2 + `*RIGIDLINK`)
> 2. 요소 번호는 Frame → Rigid 순으로 최대값 검출 후 할당
> 3. Plane 요소 번호는 Frame 이후 이어서 할당 (nElemMax + 1)

---

## 데이터 입력 예제

### Excel 시트 (`フレーム要素`)

|     | B      | C     | D     | E    | F         | G         | H    | I    | J         |
| --- | ------ | ----- | ----- | ---- | --------- | --------- | ---- | ---- | --------- |
| 2   | 要素名称 | i-節点 | j-節点 | 長さ | i-断面    | j-断面    | 座標系 |      | 要素タイプ |
| 3   | E1     | N1    | N2    | 10   | Rect-500  | Rect-500  | Y軸  |      |           |
| 4   | E2     | N2    | N3    | 5    | Rect-500  | Rect-400  | Y軸  |      |           |
| 5   | E3     | N3    | N4    | 3    | H-300     | H-300     | Y軸  |      | M−φ要素   |
| 6   | E4     | N1    | N5    | 8.9  | Rect-500  | Rect-500  | Y軸  |      |           |

### Excel 시트 (`剛体要素`)

|     | B      | C     | D            |
| --- | ------ | ----- | ------------ |
| 2   | 要素名称 | マスター | スレーブ      |
| 3   | R1     | N2    | N6,N7,N8     |
| 4   | R2     | N4    | N9           |

### MCT 출력 결과

```
*ELEMENT    ; Elements
; iEL, TYPE, iMAT, iPRO, iN1, iN2, ANGLE, iSUB,                     ; Frame  Element
1,Beam,1,1,1,2,0,0
2,Beam,1,2,2,3,0,0
3,Beam,2,3,3,4,0,0
4,Beam,1,1,1,5,0,0

*RIGIDLINK    ; Rigid Link
; M-NODE, DOF, S-NODE LIST, GROUP
2,111111,6 7 8,
4,111111,9,
```

### 요소 번호 할당 상세

| 요소 ID | 타입  | 요소 번호 | 설명                  |
| ------- | ----- | --------- | --------------------- |
| E1      | Beam  | 1         | 숫자 아님 → 자동 할당 |
| E2      | Beam  | 2         | 자동 할당             |
| E3      | Beam  | 3         | 자동 할당 (힌지 요소) |
| E4      | Beam  | 4         | 자동 할당             |
| R1      | Rigid | -         | 요소 번호 미할당      |
| R2      | Rigid | -         | 요소 번호 미할당      |

### 의존 관계 요약

```
フレーム要素 ──┬── 節点座標 (노드 번호)
              ├── 材料 (재료 번호, sect2Material 경유)
              └── 断面特性ｵﾌﾟｼｮﾝ (단면 번호)

平板要素 ──┬── 節点座標 (노드 번호)
          ├── 材料 (재료 번호)
          └── 平板断面 (두께 번호)

剛体要素 ──── 節点座標 (노드 번호)
```
