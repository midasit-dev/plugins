# *ELEMENT (Beam) 변환 검증

## 1. VBA 흐름

### 1.1 호출 위치 (main.bas)
- Line 277: `Set clsFrame = New Class020_Frame` (초기화)
- Line 405: `clsFrame.ReadFrame_Sectname(dicSectName, dicDblPnt, dicDblNode_Z)` (단면명 수집, 2중노드 처리)
- Line 432: `clsFrame.ReadFrame(dicSectAll)` (단면 i-j 페어 수집)
- Line 435: `clsFrame.SetElemNo(nElemMax, strRigid)` (요소 번호 할당)
- Line 446: `clsFrame.ChangeFrame(dicHingeElem)` (MCT 출력)

### 1.2 데이터 읽기
- 시트명: `"フレーム要素"`
- 읽기 범위: Row 3~, Col 2~11 (B~K, 10개 열)
  - strData(0) = 요소명(ID)
  - strData(1) = 노드1명
  - strData(2) = 노드2명
  - strData(3) = (미사용)
  - strData(4) = i단면명
  - strData(5) = j단면명
  - strData(6) = 요소 좌표계 문자열
  - strData(7) = (미사용)
  - strData(8) = 요소 타입 (예: "M−φ要素")
  - strData(9) = (미사용)

### 1.3 데이터 가공

#### 요소 번호 매핑 (SetElemNo)
1. 프레임+강체 요소에서 숫자형 ID의 최대값(`nElemMax`) 검출
2. 비숫자형 요소 ID에 `nElemMax+1`부터 순번 부여
3. `m_ElemData` 딕셔너리에 매핑

#### 각도 계산 (CalcAngle in ChangeFrame)
- 좌표계 문자열에 따른 분기:
  - `"Y軸"` → `dBeta[nHor][0]` (수직:180, 수평:0)
  - `"ベクトル:Global X"` → `dBeta[nHor][1]` (0)
  - `"ベクトル:Global Y"` → `dBeta[nHor][2]` (수직:180, 수평:0)
  - `"ベクトル:Global Z"` → `dBeta[nHor][3]` (수직:270, 수평:90)
  - `"節点:xxx"` → `GetNodeNo2Angle()`로 계산
  - `"ベクトル:Alpha=..."` → α,β 파싱 → 참조벡터 생성 → `GetAngle()`
  - `"ベクトル:X=..."`, `"ポイント=..."` → 벡터 파싱 → `GetAngle()`
- **Format**: `Format(dAngle, "0.00")` (소수점 2자리)

#### M-φ要素 판별
- `strData(8, i) = "M−φ要素"` 이면 `dicHingeElem`에 추가

### 1.4 MCT 출력
```
*ELEMENT    ; Elements
; iEL, TYPE, iMAT, iPRO, iN1, iN2, ANGLE, iSUB,                     ; Frame  Element
{요소번호},Beam,{재료번호},{단면번호},{노드1번호},{노드2번호},{각도},0
```

---

## 2. TypeScript 흐름

### 2.1 호출 위치 (MCTGenerator.ts)
- Line 117-126: `readFrameSectionNames()` (단면명 수집, elementNodes 매핑)
- Line 209-211: `setElementNumbers()` (요소 번호 할당)
- Line 216-221: `convertFrames()` (MCT 출력)

### 2.2 데이터 읽기
- `getSheetDataForConversion(sheets, SHEET_NAMES.FRAME)` 사용
- row[0]~row[9]로 동일한 데이터 접근

### 2.3 데이터 가공

#### 요소 번호 매핑 (setElementNumbers)
- VBA와 동일한 2단계: 숫자형 max 검출 → 비숫자형 순번 부여
- 강체 요소도 max 검출에 포함

#### 각도 계산 (calcAngle)
- 동일한 좌표계 분기 구현
- `COORD_SYSTEMS`, `BETA_ANGLES` 테이블 사용
- `VECTOR_PREFIXES` 배열로 접두사 매칭
- `formatNumber(angle, 2)` → `parseFloat()`로 소수점 2자리

#### M-φ要素 판별
- 전각/반각 대시 모두 처리: `'M−φ要素' || 'M-φ要素'`

### 2.4 MCT 출력
```
*ELEMENT    ; Elements
; iEL, TYPE, iMAT, iPRO, iN1, iN2, ANGLE, iSUB,                     ; Frame  Element
{요소번호},Beam,{재료번호},{단면번호},{노드1번호},{노드2번호},{각도},0
```

---

## 3. 비교 분석

### 3.1 동일한 부분
| 항목 | VBA | TypeScript | 일치 |
|------|-----|-----------|------|
| MCT 헤더/코멘트 | 동일 | 동일 | O |
| 데이터 형식 | `번호,Beam,재료,단면,N1,N2,각도,0` | 동일 | O |
| 요소 번호 매핑 | 숫자max+1부터 | 동일 | O |
| 강체 요소 max 검출 | 포함 | 포함 | O |
| BETA_ANGLES 테이블 | `[180,0,180,270]`/`[0,0,0,90]` | 동일 | O |
| 좌표계 분기 4가지 | Y軸/Global X/Y/Z | 동일 | O |
| 절점 참조 각도 | `GetNodeNo2Angle()` | `calculateElementAngle()` | O |
| 각도 포맷 | `Format(dAngle, "0.00")` | `formatNumber(angle, 2)` | O |

### 3.2 차이점
| 항목 | VBA | TypeScript | 영향 |
|------|-----|-----------|------|
| M-φ要素 판별 | 전각 대시만 체크 `"M−φ要素"` | 전각+반각 대시 모두 체크 | **없음** - TS가 더 안전 |
| Alpha 각도 파싱 | `vBuf(2)=alpha`, `vBuf2(0)=beta` | `parts[2]=alpha`, `xyParts[0]=beta` | **없음** - 동일 로직 |
| 벡터/포인트 파싱 | `vect.y=vBuf(3)`, `vect.z=-1*vBuf2(0)` (PlnElm판) vs `vect.y=vBuf2(0)`, `vect.z=vBuf(3)` (Frame판) | `refVector={x:xParts[0], y:yParts[0], z:parts[3]}` | **주의** - 아래 상세 분석 참조 |
| CalcAngle 결과 | `GetAngle(nNo1, nNo2, vect)` 호출 후 결과 사용 | `calculateElementAngle()` 호출 | **없음** - 동일 함수 |

### 3.3 벡터/포인트 파싱 상세 비교
VBA Frame의 CalcAngle에서 벡터/포인트 분기 (i=2,3):
```vba
vect.x = vBuf3(0)      ' =의 첫번째 값
vect.y = vBuf2(0)      ' =의 두번째 값 (쉼표 앞)
vect.z = vBuf(3)       ' =의 네번째 값
```

TypeScript:
```typescript
refVector.x = xParts[0]   // =의 첫번째 값 (쉼표 앞)
refVector.y = yParts[0]   // =의 두번째 값 (쉼표 앞)
refVector.z = parts[3]    // =의 네번째 값
```

이 매핑은 동일함. VBA에서 `vBuf = Split(strElmCoord, "=")`이므로:
- `vBuf3 = Split(vBuf(1), ",")`  → vBuf3(0) = 첫번째 '=' 뒤 ',' 앞 값
- `vBuf2 = Split(vBuf(2), ",")`  → vBuf2(0) = 두번째 '=' 뒤 ',' 앞 값
- `vBuf(3)` = 세번째 '=' 뒤 값

TS에서도 동일하게 파싱하고 있음.

### 3.4 차이로 인한 MCT 결과 영향
- 기능적으로 동일한 MCT 출력 생성
- M-φ 판별에서 TS가 반각 대시도 처리하여 더 강건

---

## 4. 결론
**PASS** - *ELEMENT (Beam) 변환 로직은 VBA와 TypeScript가 기능적으로 동일. 각도 계산, 요소 번호 매핑, MCT 출력 형식 모두 일치.
