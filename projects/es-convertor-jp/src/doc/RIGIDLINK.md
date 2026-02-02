# \*RIGIDLINK MCT 변환 분석

## 개요

ES(Engineer Studio) 엑셀의 `剛体要素` 시트를 MIDAS Civil NX의 `*RIGIDLINK` 섹션으로 변환

> **참고**: 강체 요소는 마스터 노드와 슬레이브 노드를 연결하여 변위를 구속합니다.
> DOF(자유도)는 항상 `111111` (모든 자유도 구속)입니다.

---

## 1. 필요한 데이터 시트

### 주요 시트

| 항목    | VBA               | TypeScript        | 상태 |
| ------- | ----------------- | ----------------- | ---- |
| 시트명  | `m_Sheet_Rigid`   | `剛体要素`        | ✓    |
| 시작 행 | 3 (nReadSTRow)    | 3                 | ✓    |
| 열 범위 | B~D (2~4)         | B~D (2~4)         | ✓    |

### 열 구조

| 열  | 인덱스  | VBA 변수       | TypeScript     | 설명                       |
| --- | ------- | -------------- | -------------- | -------------------------- |
| B   | row[0]  | strData(0, j)  | elemId         | 要素名称                   |
| C   | row[1]  | strData(1, j)  | masterNodeId   | マスター節点               |
| D   | row[2]  | strData(2, j)  | slaveNodesStr  | スレーブ節点 (カンマ区切り) |

### 의존 시트

| 시트명       | TypeScript 상수 | 용도                          | 필수 여부 |
| ------------ | --------------- | ----------------------------- | --------- |
| `節点座標`   | `NODE`          | 노드 번호 매핑                | **필수**  |

> **주의**: `節点座標` 시트가 없으면 노드 번호를 조회할 수 없어 변환 불가

---

## 2. 출력 구조

### MCT 형식

```
*RIGIDLINK    ; Rigid Link
; M-NODE, DOF, S-NODE LIST, GROUP
2,111111,6 7 8,
4,111111,9,
```

### 필드 설명

| 필드        | 설명                    | 소스                              |
| ----------- | ----------------------- | --------------------------------- |
| M-NODE      | 마스터 노드 번호        | nodeMapping.get(masterNodeId)     |
| DOF         | 자유도 구속 문자열      | 항상 `111111`                     |
| S-NODE LIST | 슬레이브 노드 목록      | nodeMapping (공백 구분)           |
| GROUP       | 그룹 이름               | 항상 빈값                         |

### DOF 문자열 의미

```
111111
││││││
│││││└─ Rz (Z축 회전)
││││└── Ry (Y축 회전)
│││└─── Rx (X축 회전)
││└──── Dz (Z축 변위)
│└───── Dy (Y축 변위)
└────── Dx (X축 변위)

1 = 구속, 0 = 자유
```

> **VBA 동작**: 항상 `111111` 사용 (모든 자유도 구속)

---

## 3. 처리 경로

### VBA (Class040_Rigid.cls)

```
1. ReadRigid() → 시트에서 B3:D~ 데이터 읽기, strRigidData 반환
2. ChangeRigid() → MCT 출력
   a. m_dicRigidElem에 요소ID → 마스터노드 저장
   b. 슬레이브 노드가 있으면 *RIGIDLINK 출력
   c. 슬레이브 노드 목록은 공백으로 구분
   d. DOF는 항상 "111111"
   e. GROUP은 항상 빈값
```

### TypeScript (RigidConverter.ts)

```
1. readRigidData() → 빈 행 제거하여 데이터 반환
2. convertRigid() → MCT 출력
   a. 마스터 노드 번호 조회 (nodeMapping)
   b. 슬레이브 노드가 없으면 스킵
   c. 슬레이브 노드 번호 목록 생성 (공백 구분)
   d. context.rigidElements에 저장
   e. context.rigidMasterNode에 저장 (LoadConverter용)
```

### 처리 경로 비교

| 단계                | VBA                        | TypeScript                  | 상태 |
| ------------------- | -------------------------- | --------------------------- | ---- |
| 데이터 읽기         | ReadRigid                  | readRigidData               | ✓    |
| 요소-마스터 저장    | m_dicRigidElem             | rigidMasterNode             | ✓    |
| 슬레이브 파싱       | Split(strData(2,j), ",")   | split(',')                  | ✓    |
| 노드 번호 조회      | m_NodeData()               | nodeMapping.get()           | ✓    |
| 슬레이브 연결       | 공백 구분                  | join(' ')                   | ✓    |
| DOF 설정            | "111111" (고정)            | '111111' (고정)             | ✓    |

---

## 4. 슬레이브 노드 처리

### VBA 코드 (lines 100-104)

```vba
vBuf = Split(strData(2, j), ",")
strBuf(i) = m_NodeData(vBuf(0))
For k = 1 To UBound(vBuf)
  strBuf(i) = strBuf(i) & " " & m_NodeData(vBuf(k))
Next k
```

### TypeScript 코드

```typescript
const slaveNodeIds = slaveNodesStr.split(',').map(n => n.trim()).filter(n => n.length > 0);
const slaveNodeNos: number[] = [];

for (const slaveId of slaveNodeIds) {
  const slaveNo = context.nodeMapping.get(slaveId) || 0;
  if (slaveNo > 0) {
    slaveNodeNos.push(slaveNo);
  }
}

const slaveListStr = slaveNodeNos.join(' ');
```

---

## 5. 스킵 조건

다음 조건에서는 해당 행이 스킵됩니다:

| 조건                              | VBA                          | TypeScript                     |
| --------------------------------- | ---------------------------- | ------------------------------ |
| 슬레이브 노드 없음                | `Len(strData(2, j)) = 0`     | `slaveNodesStr.length === 0`   |
| 마스터 노드 매핑 없음             | -                            | `masterNodeNo === 0`           |
| 유효한 슬레이브 노드 없음         | -                            | `slaveNodeNos.length === 0`    |

---

## 6. Context에 저장되는 데이터

| Map             | Key                 | Value                     | 용도                          |
| --------------- | ------------------- | ------------------------- | ----------------------------- |
| rigidElements   | 요소 번호 (number)  | {masterNode, slaveNodes}  | 강체 요소 정보 조회           |
| rigidMasterNode | 요소 ID (string)    | 마스터 노드 ID (string)   | LoadConverter에서 사용        |

### 유틸리티 함수

| 함수              | 설명                                    |
| ----------------- | --------------------------------------- |
| `isSlaveNode()`   | 노드가 슬레이브인지 확인, 마스터 반환   |
| `isMasterNode()`  | 노드가 마스터인지 확인                  |
| `getRigidElement()` | 요소 ID로 강체 정보 조회              |

---

## 7. VBA와 차이점

| 항목              | VBA                      | TypeScript                  | 영향      |
| ----------------- | ------------------------ | --------------------------- | --------- |
| 마스터 노드 검증  | 없음 (항상 진행)         | 0이면 스킵                  | 안전성 ↑  |
| 슬레이브 노드 검증| 없음 (항상 진행)         | 유효한 노드만 포함          | 안전성 ↑  |
| Context 저장      | m_dicRigidElem만         | rigidElements + rigidMasterNode | 확장성 ↑ |

---

## 8. 결론

**✓ \*RIGIDLINK 변환은 VBA와 완전히 일치합니다.**

- 필요한 시트: `剛体要素` (주요), `節点座標` (의존)
- 처리 경로: 문제 없음
- 누락된 기능: 없음
- TypeScript 개선: 노드 검증 추가

> **핵심 포인트**:
> 1. DOF는 항상 `111111` (모든 자유도 구속)
> 2. 슬레이브 노드 목록은 **공백**으로 구분
> 3. GROUP은 항상 빈값

---

## 데이터 입력 예제

### Excel 시트 (`剛体要素`)

|     | B      | C     | D            |
| --- | ------ | ----- | ------------ |
| 2   | 要素名称 | マスター節点 | スレーブ節点 |
| 3   | R1     | N2    | N6,N7,N8     |
| 4   | R2     | N4    | N9           |
| 5   | R3     | N5    |              |

### 설명

- 행 2: 헤더 (변환 시 무시됨)
- 행 3~: 데이터 시작 (nReadSTRow = 3)
- 열 범위: B~D (nReadSTCol=2, nReadEDCol=4)
- R1: N2(마스터)에 N6, N7, N8(슬레이브) 연결
- R2: N4(마스터)에 N9(슬레이브) 연결
- R3: 슬레이브 없음 → **스킵됨**

### MCT 출력 결과

```
*RIGIDLINK    ; Rigid Link
; M-NODE, DOF, S-NODE LIST, GROUP
2,111111,6 7 8,
4,111111,9,
```

### 변환 상세

| 요소 ID | 마스터 (ES) | 마스터 (MCT) | 슬레이브 (ES) | 슬레이브 (MCT) | 출력 여부 |
| ------- | ----------- | ------------ | ------------- | -------------- | --------- |
| R1      | N2          | 2            | N6,N7,N8      | 6 7 8          | ✓         |
| R2      | N4          | 4            | N9            | 9              | ✓         |
| R3      | N5          | -            | (없음)        | -              | ✗ 스킵    |

### 노드 매핑 예시

| 노드 ID (ES) | 노드 번호 (MCT) |
| ------------ | --------------- |
| N1           | 1               |
| N2           | 2               |
| N3           | 3               |
| N4           | 4               |
| N5           | 5               |
| N6           | 6               |
| N7           | 7               |
| N8           | 8               |
| N9           | 9               |

### 의존 관계

```
剛体要素 ──── 節点座標 (노드 번호 매핑)
```
