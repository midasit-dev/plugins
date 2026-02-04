# *STLDCASE / *CONLOAD / *SPDISP / *BEAMLOAD / *ELTEMPER 변환 검증

## 1. VBA 흐름

### 1.1 호출 위치 (main.bas)

```vba
' main.bas Line 471
If ChangeSheetName.Exists(m_Sheet_Load) Then Call clsLoad.ChangeLoad
```

- `m_Sheet_Load = "荷重値"` (main.bas Line 49)
- `Class190_Load` 인스턴스가 `ChangeLoad` 메서드 하나로 5개 MCT 명령어를 모두 생성
- MCT 시트의 컬럼별 출력:
  - `m_LOAD_COL = 96` → `*STLDCASE`
  - `m_CONLOAD_COL = 101` → `*CONLOAD`
  - `m_SPDISP_COL = 106` → `*SPDISP`
  - `m_BEAMLOAD_COL = 111` → `*BEAMLOAD`
  - `m_ELTEMPER_COL = 116` → `*ELTEMPER`

### 1.2 데이터 읽기

- 시트 `荷重値`에서 Row 3부터 읽음 (`nReadSTRow = 3`)
- 컬럼 범위: B~T (col 2~20), 총 19컬럼
- `GetData()` 호출로 `strData(0..18, 0..N)` 2차원 배열에 저장

**컬럼 매핑 (strData 인덱스 → 의미):**

| 인덱스 | VBA 사용처 | 의미 |
|--------|-----------|------|
| 0 | 미사용 (원래 STLDCASE용) | (불명) |
| 1 | `strData(1,i)` = 하중 유형 | 節点-集中荷重, 剛体要素荷重 등 |
| 2 | `strData(2,i)` = 하중 케이스명 | 하중 케이스 이름 |
| 3 | `strData(3,i)` = 작용 유형 | 並進荷重 / モーメント |
| 4 | `strData(4,i)` = 대상 | 노드/요소명 (쉼표 구분) |
| 5 | `strData(5,i)` = P1 | 하중값1 |
| 6 | `strData(6,i)` = P2 | 하중값2 |
| 7-10 | 미사용 | - |
| 11 | `strData(11,i)` = 편심 | 편심값 |
| 12 | `strData(12,i)` = 좌표 유형 | 球座標指定 등 (CalcVecter에서 사용) |
| 13 | `strData(13,i)` = 방향 | 全体 X/Y/Z, ベクトル指定 등 |
| 14 | `strData(14,i)` = 벡터X | X성분 또는 "モーメント" |
| 15 | `strData(15,i)` = 벡터Y | Y성분 |
| 16 | `strData(16,i)` = 벡터Z | Z성분 |
| 17 | `strData(17,i)` = Alpha | 구좌표 Alpha 각도 |
| 18 | `strData(18,i)` = Beta | 구좌표 Beta 각도 |

### 1.3 데이터 가공

#### 1.3.1 하중 유형 분류 (`dicType`)

```vba
dicType.Add "節点-集中荷重", 1        → *CONLOAD
dicType.Add "剛体要素荷重", 2         → *CONLOAD
dicType.Add "節点-強制変位", 3        → *SPDISP
dicType.Add "フレーム要素-集中荷重", 4  → *BEAMLOAD (CONLOAD/CONMOMENT)
dicType.Add "フレーム要素-分布荷重（単独）", 5  → *BEAMLOAD (UNILOAD/UNIMOMENT)
dicType.Add "フレーム要素-分布荷重（連続）", 6  → *BEAMLOAD (LINE)
dicType.Add "フレーム要素-射影長荷重", 7  → *BEAMLOAD (YES projection)
dicType.Add "温度荷重", 8             → *ELTEMPER
```

#### 1.3.2 노드/요소명 → 번호 변환

- Type 1,3: `m_NodeData(노드명)` → 노드 번호
- Type 2 (강체): `m_dicRigidElem(요소명)` → 노드명 → `m_NodeData(노드명)` → 번호
- Type 8 (온도): `m_ElemData(요소명)` → 요소 번호

#### 1.3.3 좌표 변환 (`CalcVecter`)

**핵심 변환 로직 - ES좌표 → MIDAS좌표 (Y-Z swap):**

```vba
' VBA CalcVecter:
If strData(14, nCnt) = "モーメント" Then
  strLoad = strNoData & "," & vBuf(0) & "," & -1# * vBuf(2) & "," & vBuf(1)
Else
  strLoad = vBuf(0) & "," & -1# * vBuf(2) & "," & vBuf(1) & "," & strNoData
End If
```

변환 규칙: `(X, Y, Z)_ES → (X, -Z, Y)_MIDAS`

**구좌표 처리 (球座標指定):**
- `strData(12, nCnt) = "球座標指定"` 일 때 Alpha/Beta 각도에서 벡터 계산
- `cos(Beta)*cos(Alpha)`, `cos(Beta)*sin(Alpha)`, `sin(Beta)`

#### 1.3.4 방향 매핑 (`dicDir` - SetBeamLoad에서)

```vba
dicDir.Add "全体 X", "GX"
dicDir.Add "全体 Y", "GZ"    ' ES Y → MIDAS Z
dicDir.Add "全体 Z", "GY"    ' ES Z → MIDAS Y
dicDir.Add "要素 X", "LX"
dicDir.Add "要素 Y", "LZ"    ' ES Y → MIDAS Z
dicDir.Add "要素 Z", "LY"    ' ES Z → MIDAS Y
```

GY/LY 방향일 때 부호 반전:
```vba
If strDir = "GY" Or strDir = "LY" Then
  dP1(k) = dP1(k) * -1#
  dP2(k) = dP2(k) * -1#
End If
```

#### 1.3.5 편심 처리 (`GetECCEN`)

- 편심값이 0이면 `"NO,,,,"`
- `GX`, `GZ`, `GY` 방향에 따라 요소 각도(`m_ElemAngle`)를 참조하여 `LY`/`LZ` 결정
- 출력: `"YES,0,{eccDir},{ecc},{ecc},NO"`

#### 1.3.6 삼각형 하중 (P1=0, P2!=0)

- `SortElem`으로 요소 체인 정렬 후 전체 길이(`dAll`) 계산
- 좌표계 지정 시: `dBaseLoad = P2 / dAll`, 각 요소별 누적 길이로 하중값 계산
- 벡터 지정 시: `CalcVecter(VALUE2)` → 6성분 분해, 요소별 누적 길이로 분배

#### 1.3.7 SPDISP 방향 처리

- `strData(13, nCnt)` (= DIRECTION 컬럼)이 `"ベクトル指定"` 또는 `"球座標指定"` 이면 → CalcVecter 호출
- 그렇지 않으면 `dicVecterType`으로 6성분 중 해당 위치에 1 세팅 → 값 곱하기

### 1.4 MCT 출력

각 하중 유형별 `*USE-STLD` 래퍼로 감싸서 출력:

```
*USE-STLD, {하중케이스명}
(빈줄)
*CONLOAD    ; Nodal Loads
; NODE_LIST, FX, FY, FZ, MX, MY, MZ, GROUP,STRTYPENAME
{데이터행들}
(빈줄)
; End of data for load case [{이름}] -------------------------
(빈줄)
```

**각 명령어 출력 형식:**

| MCT 명령어 | 데이터 형식 |
|------------|-------------|
| `*STLDCASE` | `{케이스명},USER,` |
| `*CONLOAD` | `{노드},{FX},{FY},{FZ},{MX},{MY},{MZ},,` |
| `*SPDISP` | `{노드},{FLAG},{Dx},{Dy},{Dz},{Rx},{Ry},{Rz},` |
| `*BEAMLOAD` | `{요소},{CMD},{TYPE},{DIR},{PROJ},{ECCEN},{VALUE},{ADD}` |
| `*ELTEMPER` | `{요소},{온도},` |

---

## 2. TypeScript 흐름

### 2.1 호출 위치 (MCTGenerator.ts)

```typescript
// MCTGenerator.ts Lines 453-479
if (hasSheet(sheets, SHEET_NAMES.LOAD)) {
  const loadData = getSheetDataForConversion(sheets, SHEET_NAMES.LOAD);
  const loadResult = convertLoads(loadData, context);
  // 5개 결과를 mctLines에 push
}
```

- `convertLoads()` 함수가 `LoadConversionResult` 반환 (5개 string[] 배열)
- 각 배열이 2줄 초과일 때만 mctLines에 추가

### 2.2 데이터 읽기

- `getSheetDataForConversion()`으로 시트 데이터를 `(string|number)[][]` 배열로 변환
- `COL` 상수 객체로 컬럼 인덱스 매핑 (VBA와 동일한 0~18 인덱스)

```typescript
const COL = {
  UNKNOWN: 0,
  LOAD_TYPE: 1,      // 하중 유형
  LOAD_CASE: 2,      // 하중 케이스명
  ACTION_TYPE: 3,    // 작용 유형
  TARGET: 4,         // 대상 노드/요소명
  VALUE1: 5,         // P1
  VALUE2: 6,         // P2
  // 7-10: VALUE3~VALUE6
  ECCENTRICITY: 11,  // 편심값
  COORD_TYPE: 12,    // 좌표 유형
  DIRECTION: 13,     // 방향
  VECTOR_X: 14,      // 벡터 X
  VECTOR_Y: 15,      // 벡터 Y
  VECTOR_Z: 16,      // 벡터 Z
  ALPHA: 17,         // Alpha 각도
  BETA: 18,          // Beta 각도
};
```

### 2.3 데이터 가공

#### 2.3.1 하중 유형 분류

`LOAD_TYPES` 딕셔너리에 기본 일본어 + 가타카나 변형(ノード) + 괄호 변형까지 등록.
`normalizeJapaneseText()`로 대시/괄호 정규화 후 매칭.

```typescript
const LOAD_TYPES: Record<string, number> = {
  '節点-集中荷重': 1,
  'ノード-集中荷重': 1,     // 변형 추가
  '剛体要素荷重': 2,
  '節点-強制変位': 3,
  'ノード-強制変位': 3,     // 변형 추가
  'フレーム要素-集中荷重': 4,
  'フレーム要素-分布荷重(単独)': 5,
  'フレーム要素-分布荷重(連続)': 6,
  'フレーム要素-射影長荷重': 7,
  'フレーム要素-射影面荷重': 7,  // 변형 추가
  '温度荷重': 8,
};
```

#### 2.3.2 노드/요소명 → 번호 변환

- `context.nodeMapping` → 노드명 → 번호
- `context.rigidMasterNode` → 강체 마스터 노드 조회
- `context.elementMapping` → 요소명 → 번호

#### 2.3.3 좌표 변환 (`calcVecter`)

VBA와 동일한 Y-Z swap 로직:
```typescript
if (vectorX === 'モーメント') {
  strLoad = `${strNoData},${vBuf[0]},${-1 * vBuf[2]},${vBuf[1]}`;
  strFlag = `000${vFlagBuf[0]}${vFlagBuf[2]}${vFlagBuf[1]}`;
} else {
  strLoad = `${vBuf[0]},${-1 * vBuf[2]},${vBuf[1]},${strNoData}`;
  strFlag = `${vFlagBuf[0]}${vFlagBuf[2]}${vFlagBuf[1]}000`;
}
```

#### 2.3.4 방향 매핑

VBA와 동일:
```typescript
const DIR_MAP = {
  '全体 X': 'GX',
  '全体 Y': 'GZ',
  '全体 Z': 'GY',
  '要素 X': 'LX',
  '要素 Y': 'LZ',
  '要素 Z': 'LY',
};
```

#### 2.3.5 편심 / 삼각형 하중 / SPDISP

VBA와 동일한 로직으로 구현.

### 2.4 MCT 출력

VBA와 동일한 `*USE-STLD` 래퍼 구조. 5개 배열을 `MCTGenerator.ts`에서 순서대로 mctLines에 추가.

---

## 3. 비교 분석

### 3.1 동일한 부분

| 항목 | 설명 |
|------|------|
| 하중 유형 분류 | 8가지 유형 분류 완전 일치 (1~8) |
| 좌표 변환 (Y-Z swap) | CalcVecter: `(X,-Z,Y)` 변환 동일 |
| 방향 매핑 | `DIR_MAP` = VBA `dicDir` 완전 일치 |
| 부호 반전 | GY/LY 방향 부호 반전 동일 |
| 편심 처리 | `getECCEN` = VBA `GetECCEN` 로직 동일 |
| STLDCASE 생성 | `dicLoadName` 키 순회 → `{케이스명},USER,` 동일 |
| CONLOAD 생성 | CalcVecter → `{노드},{FX,FY,FZ,MX,MY,MZ},,` 동일 |
| SPDISP 생성 | 방향별 6성분 플래그/값 설정 동일 |
| BEAMLOAD 생성 | CMD/TYPE/DIR/PROJ/ECCEN/VALUE 조합 동일 |
| ELTEMPER 생성 | `{요소},{온도},` 동일 |
| 삼각형 하중 | P1=0,P2!=0 → SortElem → 누적 길이 분배 동일 |
| 벡터 하중 | CalcVecter → 6성분 분해 → 요소별 분배 동일 |
| 요소 체인 정렬 | `SortElem` / `sortElem` → I-J 노드 연결 체인 동일 |
| 출력 래퍼 | `*USE-STLD, {name}` + 코멘트 + 데이터 + End 동일 |
| GetStringGen | 복수 노드 시 따옴표 래핑 동일 |

### 3.2 차이점

#### 차이점 1: 구좌표 조건 문자열 (CalcVecter)

| 항목 | VBA | TypeScript |
|------|-----|-----------|
| 조건 | `strData(12, nCnt) = "球座標指定"` | `coordType === '座標指定'` |
| 컬럼 | `strData(12)` = COORD_TYPE | `row[COL.COORD_TYPE]` (12) |

- **VBA**: `"球座標指定"` (구좌표 지정)을 체크
- **TS**: `"座標指定"` (좌표 지정)을 체크
- **분석**: TypeScript가 `"球"` 글자를 누락했을 가능성. 다만 실제 엑셀 데이터에서 이 컬럼에 어떤 값이 오는지에 따라 영향이 달라짐. `"球座標指定"` 데이터가 입력되면 TS에서는 매칭 실패로 일반 벡터 모드가 적용되어 Alpha/Beta 각도 기반 계산이 수행되지 않음.

#### 차이점 2: SPDISP 벡터 유형 체크

| 항목 | VBA | TypeScript |
|------|-----|-----------|
| 벡터 조건 | `"ベクトル指定"` 또는 `"球座標指定"` | `"ベクトル指定"` 또는 `"座標指定"` |
| 컬럼 | `strData(13)` = DIRECTION | `row[COL.DIRECTION]` (13) |

- VBA의 SetSpDisp에서 `strVecterType = strData(13, nCnt)`를 읽고 `"球座標指定"` 과 비교
- TS는 동일 컬럼(13)에서 읽지만 `"座標指定"`과 비교
- **영향**: 차이점 1과 동일한 원인. 구좌표 데이터가 있을 경우 SPDISP에서도 벡터 모드 분기가 달라질 수 있음.

#### 차이점 3: STLDCASE 출력 들여쓰기

| 항목 | VBA | TypeScript |
|------|-----|-----------|
| STLDCASE 행 | `strData(0,i) & ",USER,"` | `   ${lcName},USER,` (3칸 들여쓰기) |

- TS는 3칸 공백 들여쓰기 추가
- **영향**: MCT 파서가 공백을 무시하므로 기능적 영향 없음

#### 차이점 4: CONLOAD/SPDISP/BEAMLOAD/ELTEMPER 데이터행 들여쓰기

| 항목 | VBA | TypeScript |
|------|-----|-----------|
| 데이터행 | 들여쓰기 없음 | `   ${line}` (3칸 들여쓰기) |

- **영향**: MCT 파서가 공백을 무시하므로 기능적 영향 없음

#### 차이점 5: 하중 유형 변형 대응

| 항목 | VBA | TypeScript |
|------|-----|-----------|
| 가타카나 변형 | 미지원 | `ノード-集中荷重`, `ノード-強制変位` 추가 |
| 괄호 변형 | 전각만 (`（）`) | 전각→반각 정규화 |
| 사영하중 변형 | `射影長荷重`만 | `射影面荷重`도 추가 |
| 대시 정규화 | 없음 | 유니코드 대시 정규화 함수 |

- **영향**: TS가 더 넓은 범위의 입력을 수용함. VBA에서는 정확한 문자열만 매칭됨. 기능적으로 TS가 상위호환.

#### 차이점 6: 강체 요소 노드 조회 경로

| 항목 | VBA | TypeScript |
|------|-----|-----------|
| 조회 | `m_NodeData(m_dicRigidElem(요소명))` | `context.rigidMasterNode` 또는 fallback |

- VBA: `m_dicRigidElem`으로 요소명→노드명, `m_NodeData`로 노드명→번호
- TS: `context.rigidMasterNode.get(nodeName)`으로 직접 마스터 노드 조회, 실패 시 `context.rigidElements` fallback
- **영향**: `rigidMasterNode` 맵이 VBA의 `m_dicRigidElem` 역할을 올바르게 대체하면 결과 동일. 맵 빌드 시점의 데이터 일관성에 의존.

#### 차이점 7: 빈 줄 출력 패턴

| 항목 | VBA | TypeScript |
|------|-----|-----------|
| `*USE-STLD` 후 | `nRowCnt + 2` (빈줄 1개) | `push('')` (빈줄 1개) |
| End 코멘트 후 | `nRowCnt + 2` (빈줄 1개) | `push('')` (빈줄 1개) |

- 대체로 동일하나, VBA는 `nRowCnt`를 2씩 증가시키는 방식으로 빈줄을 만들고, TS는 명시적 `push('')`
- **영향**: MCT 파서가 빈줄을 무시하므로 기능적 영향 없음

#### 차이점 8: sortElem의 nEnd 미사용

| 항목 | VBA | TypeScript |
|------|-----|-----------|
| nEnd 변수 | 선언 및 설정됨 (미사용) | 선언되지 않음 |

- VBA에서 `nEnd`는 설정되지만 실제로 사용되지 않으므로 TS에서 생략한 것은 올바름.
- **영향**: 없음

### 3.3 차이로 인한 MCT 결과 영향

#### 영향 있는 차이

| 차이점 | 영향도 | 설명 |
|--------|--------|------|
| 차이점 1 (球座標指定 vs 座標指定) | **중간** | 구좌표 입력 데이터가 있을 경우 CalcVecter에서 Alpha/Beta 각도 기반 벡터 계산이 실행되지 않아 하중 방향이 잘못될 수 있음. 단, 실제 데이터에서 이 기능을 사용하는 케이스가 드물 수 있음. |
| 차이점 2 (SPDISP 球座標指定) | **중간** | 차이점 1과 동일한 원인/영향. SPDISP에서 구좌표 모드 진입이 불가능. |

#### 영향 없는 차이

| 차이점 | 이유 |
|--------|------|
| 차이점 3, 4 (들여쓰기) | MCT 파서가 선행 공백 무시 |
| 차이점 5 (변형 대응) | TS가 상위호환, 추가 매칭만 있음 |
| 차이점 6 (강체 조회) | 맵 구조만 다르고 결과 동일 (올바르게 빌드된 경우) |
| 차이점 7 (빈줄) | MCT 파서가 빈줄 무시 |
| 차이점 8 (nEnd) | VBA에서도 미사용 변수 |

---

## 4. 결론

**PASS (조건부)**

핵심 변환 로직(좌표 변환, 방향 매핑, 부호 반전, 편심 처리, 삼각형 하중 분배, 요소 체인 정렬)은 VBA와 TypeScript가 완전히 일치한다.

### 수정 이력
- **2025-01 수정 완료**: `球座標指定` 문자열 2곳 수정 — LoadConverter.ts에서:
  - CalcVecter 내 `coordType === '座標指定'` → `coordType === '球座標指定'` 수정
  - SetSpDisp 내 `'座標指定'` → `'球座標指定'` 수정

### 잔여 주의사항

1. **강체 요소 매핑 경로 확인 (차이점 6)**
   - VBA의 `m_dicRigidElem(요소명)` → 노드명 경로와 TS의 `context.rigidMasterNode` 맵이 동일한 결과를 생성하는지 검증 필요
   - 특히 강체 요소에 CONLOAD가 적용되는 실제 예제로 테스트 권장
