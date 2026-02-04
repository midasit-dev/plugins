# *IHINGE-PROP (비대칭 스프링) 변환 검증

> 대상 VBA: `Class140_SPGAllASym.cls`
> 대상 TS : `SPGAllASymConverter.ts`
> MCT 헤더: `*IHINGE-PROP    ; Inelastic Hinge Property`

---

## 1. VBA 흐름

### 1.1 호출 위치 (main.bas)

```vba
' main.bas Line 460-464
If clsSPG6Comp.GetHingeSPG6Comp(dicSPG6Comp) >= 0 Then
  nCnt = GetSpringData              ' m_SprComp() 배열 생성
  Call clsSPGAllSym.ChangeSPGAllSym(dicSPG6Comp)
  Call clsSPGAllASym.ChangeSPGAllASym(dicSPG6Comp)   ' ← 비대칭 변환
End If
```

호출 순서:
1. `Class120_SPG6Comp.GetHingeSPG6Comp` - 6성분 개요 시트에서 `dicSPG6Comp` (스프링이름 -> 인덱스) 딕셔너리 생성, `mct_HYST`, `mct_iSYM`, `mct_HYST2` 값을 `m_SprCompORG`에 설정
2. `GetSpringData` (main.bas Line 1060-1288) - 대칭/비대칭/기타 시트 3개를 순회하며 `m_SprCompORG()` 배열에 D, K, F 데이터를 `strTENS(방향, 점수)` 형태로 파싱. 이후 `m_SprComp = m_SprCompORG` 복사.
3. `ChangeSPGAllSym` - 대칭 스프링 MCT(*NL-PROP) 출력
4. `ChangeSPGAllASym` - 비대칭 스프링 MCT(*IHINGE-PROP) 출력

### 1.2 데이터 읽기

#### GetSpringData에서 비대칭 데이터 파싱 (i=1)

비대칭 시트 `ばね特性表_成分一覧(非対称)` 에서 3개 영역(바이리니어/트리리니어/테트라리니어)의 데이터를 읽음.

```
시트 컬럼 영역:
  바이리니어  : col 2~26  (nRead1STCol=2, nRead1EDCol=26)
  트리리니어  : col 28~56 (nRead2STCol=28, nRead2EDCol=56)
  테트라리니어: col 58~102 (nRead3STCol=58, nRead3EDCol=102)
```

각 영역별 컬럼 매핑 (GetData 함수로 추출 후 0-based strData 배열):

| 타입 | j | 점수 | strTENS(0) 압축 D,K,F | strTENS(1) 인장 D,K,F |
|------|---|------|----------------------|----------------------|
| 바이리니어 | 0 | 2점(m=0..1) | D=m+3, K=m+5, F=m+7 | D=Abs(m+10), K=Abs(m+12), F=Abs(m+14) |
| 트리리니어 | 1 | 3점(m=0..2) | D=m+3, K=m+6, F=m+9 | D=Abs(m+12), K=Abs(m+15), F=Abs(m+18) |
| 테트라리니어 | 2 | 4점(m=0..3) | D=m+5, K=m+9, F=m+16 | D=Abs(m+22), K=Abs(m+26), F=Abs(m+33) |

- 변위(D)는 `ChangeMM_M`(mm -> m 변환)이 적용됨
- strTENS(1)의 값에는 Abs() 적용 (인장측은 음수로 입력될 수 있음)
- `nComponent = 1` (비대칭), `mct_iTYPE = 1` (d-F 고정)
- `mct_SFType = 3 + mct_iTYPE * 2 = 5`
- `mct_dStiff = 1#`

#### TAK 특수 처리 (바이리니어 전용)

```vba
' main.bas Line 1190-1203
If m_SprCompORG(nCnt).SprCompData(n).mct_HYST = "TAK" Then
  ReDim Preserve strTENS(1, j + 2)   ' 2점 → 3점으로 확장
  For m = 1 To 0 Step -1
    For o = 2 To 1 Step -1
      strTENS(m, o) = strTENS(m, o - 1)   ' 뒤로 밀기
    Next o
  Next m
End If
```

TAK 타입인 경우 바이리니어(2점)를 트리리니어(3점)로 확장하여 데이터를 한 칸씩 뒤로 밀어넣는 처리가 있음.

### 1.3 데이터 가공

`ChangeSPGAllASym` 메서드 내부 로직:

1. **dicBearingType 딕셔너리**: 나고야 고속 고무 지점용 베어링 타입 매핑 (H15.10/H13.5 + HDR/LRB/RB + G12/G10)

2. **vSort 배열**: 성분 순서 결정
   ```vba
   vSort = Array(Array(0, 1, 2, 3, 4, 5), _
                 Array(0, 2, 1, 3, 5, 4))
   ```
   - `nSort = 0`: 기본 순서 (참조 부재 없음)
   - `nSort = 1`: `m_dicSpgRef`에 존재하면 (1,2)와 (4,5) 교환

3. **누적 P 계산** (Line 152-160):
   ```vba
   strTENS(nTens, 0).strP = strTENS(nTens, 0).strD * strTENS(nTens, 0).strK
   For l = 1 To UBound(strTENS, 2)
     strTENS(nTens, l).strP = strTENS(nTens, l).strK * _
         (strTENS(nTens, l).strD - strTENS(nTens, l - 1).strD) + strTENS(nTens, l - 1).strP
   Next l
   ```

4. **출력 순서 결정** (VBA 버그 포함):
   ```vba
   nTens = 1
   If m > 0 Then nTens = 0
   ```
   여기서 `m`은 이전 출력 루프의 카운터 변수로, 첫 번째 스프링의 첫 번째 DOF에서만 `m=0`이므로 `nTens=1`(인장 먼저 출력). 이후에는 항상 `m>0`이므로 `nTens=0`(압축 먼저 출력).

### 1.4 MCT 출력

```
*IHINGE-PROP    ; Inelastic Hinge Property
; (13줄의 코멘트 헤더)
MLHP=NL_{스프링이름}, STEEL, SPR, AUTO, I, NONE, SKEL,,     ← Line 1
NO , NO, NO, NO, NO, NO, NO                                  ← Line 2 (DOF 존재 플래그)
{DOF 1~6 라인, 각 YES/NO}                                   ← Lines 3-8
                                                              ← 빈 줄
{DOF 1~6 라인 반복 (J-end 복사)}                             ← Lines 3-8 복사
                                                              ← 빈 줄
0, 0, 0, 0, 0, 0                                             ← 마지막 줄
```

각 DOF 라인 (비선형 데이터가 있는 경우):
```
YES,,{HYST},{iSYM},0, 1,{SFType},{dStiff},{iTYPE},{F/P values},{D values},0.5, 1, 2, 4, 8,{F/P values},{D values},0.5, 1, 2, 4, 8{HYST2}
```

- `mct_iTYPE = 0`이면 F 값 출력, `mct_iTYPE = 1`이면 P(누적하중) 값 출력
- 첫 번째 데이터셋: TENS(또는 COMP), 두 번째 데이터셋: COMP(또는 TENS)
- TTE 타입은 끝에 `0.5, 1` 추가

선형 또는 데이터 없음 → `NO` 출력

---

## 2. TypeScript 흐름

### 2.1 호출 위치 (MCTGenerator.ts)

```typescript
// MCTGenerator.ts Line 333-344
// STEP: Parse ASYMMETRIC data SECOND (VBA i=1)
if (spgAsymBilinear.length > 0 || spgAsymTrilinear.length > 0 ||
    spgAsymTetralinear.length > 0) {
  parseAsymmetricSpringTables(
    { bilinearData, trilinearData, tetralinearData },
    context
  );
}

// MCTGenerator.ts Line 381-391
// IHINGE-PROP 생성
if (context.springCompData.size > 0) {
  const asymResult = convertAsymmetricSprings(
    [],  // 이미 파싱된 springCompData 사용
    context,
    spg6Result.spg6CompMapping
  );
}
```

호출 순서:
1. `parseAsymmetricSpringTables` - 비대칭 데이터 파싱하여 `context.springCompData`에 저장
2. `convertAsymmetricSprings` - `springCompData`에서 MCT *IHINGE-PROP 출력 생성

### 2.2 데이터 읽기

`parseAsymmetricSpringFromRawData` 함수에서 3개 테이블 영역을 추출:

```typescript
TABLE_OFFSETS = {
  BILINEAR:    { start: 0, end: 24 },     // VBA col 2-26
  TRILINEAR:   { start: 26, end: 54 },    // VBA col 28-56
  TETRALINEAR: { start: 56, end: 100 },   // VBA col 58-102
};
```

각 파싱 함수에서의 컬럼 매핑:

| 타입 | 압축(strTENS[0]) D,K,F | 인장(strTENS[1]) D,K,F |
|------|----------------------|----------------------|
| 바이리니어 | D=3+m, K=5+m, F=7+m (m=0..1) | D=Abs(10+m), K=Abs(12+m), F=Abs(14+m) |
| 트리리니어 | D=3+m, K=6+m, F=9+m (m=0..2) | D=Abs(12+m), K=Abs(15+m), F=Abs(18+m) |
| 테트라리니어 | D=5+m, K=9+m, F=16+m (m=0..3) | D=Abs(22+m), K=Abs(26+m), F=Abs(33+m) |

- 변위(D)에 `/1000` 적용 (mm -> m)
- 인장 측에 `Math.abs()` 적용
- `updateSpringCompData`에서 `tensionData[0] = compressionData`, `tensionData[1] = tensionData`로 저장

### 2.3 데이터 가공

`convertAsymmetricSprings` 함수 내부 로직:

1. **BEARING_TYPE_MAP**: VBA `dicBearingType`와 동일한 12개 매핑

2. **V_SORT 배열**: 7개 요소 (인덱스 0-6)
   ```typescript
   V_SORT = [
     [0, 1, 2, 3, 4, 5, 6],  // 기본
     [0, 2, 1, 3, 5, 4, 6],  // 참조 부재
   ];
   ```
   - VBA 원본은 6개 요소(0-5)인데, `For k = 1 To 6`에서 `vSort(nSort)(6)` 접근 시 out-of-bounds. VBA `On Error Resume Next`로 무시됨.
   - TS에서는 인덱스 6을 추가하여 6번 성분도 체크하도록 함.

3. **누적 P 계산** (`calculateCumulativeP`):
   ```typescript
   p[0] = data[0].k * data[0].d
   p[i] = data[i].k * (data[i].d - data[i-1].d) + p[i-1]
   ```

4. **출력 순서 결정** (VBA 버그 에뮬레이션):
   ```typescript
   let isFirstSpringFirstDOF = true;
   // 첫 번째 스프링의 첫 번째 DOF만 TENSION 먼저, 나머지는 COMPRESSION 먼저
   const tensionFirst = isFirstSpringFirstDOF;
   isFirstSpringFirstDOF = false;
   ```

### 2.4 MCT 출력

VBA와 동일한 형식으로 출력:

```
*IHINGE-PROP    ; Inelastic Hinge Property
; (13줄의 코멘트 헤더)
MLHP=NL_{sprName}, STEEL, SPR, AUTO, I, NONE, SKEL,,
NO , NO, NO, NO, NO, NO, NO
{6개 DOF 라인}
(빈 줄)
{6개 DOF 라인 반복 - J-end}
(빈 줄)
0, 0, 0, 0, 0, 0
```

각 DOF 라인 구성:
```typescript
lineParts = [
  'YES,', hystType, iSym, '0, 1', sfType, stiff, iType,
  ...F/P values (TENS or COMP),   // 패딩하여 최소 인덱스 11까지
  ...D values (TENS or COMP),     // 패딩하여 최소 인덱스 15까지
  '0.5, 1, 2, 4, 8',
  ...F/P values (COMP or TENS),   // 패딩하여 최소 인덱스 20까지
  ...D values (COMP or TENS),     // 패딩하여 최소 인덱스 24까지
  '0.5, 1, 2, 4, 8' + mctHyst2,
  // TTE인 경우: '0.5, 1'
];
dofLine = lineParts.join(',');
```

---

## 3. 비교 분석

### 3.1 동일한 부분

| 항목 | VBA | TypeScript | 일치 |
|------|-----|-----------|------|
| MCT 헤더 키워드 | `*IHINGE-PROP` | `*IHINGE-PROP` | O |
| 코멘트 헤더 (13줄) | 동일 | 동일 | O |
| BEARING_TYPE_MAP | 12개 항목 | 12개 항목 | O |
| 바이리니어 컬럼 매핑 | D=m+3, K=m+5, F=m+7 / D=m+10, K=m+12, F=m+14 | 동일 | O |
| 트리리니어 컬럼 매핑 | D=m+3, K=m+6, F=m+9 / D=m+12, K=m+15, F=m+18 | 동일 | O |
| 테트라리니어 컬럼 매핑 | D=m+5, K=m+9, F=m+16 / D=m+22, K=m+26, F=m+33 | 동일 | O |
| Abs() 적용 (인장측) | VBA Abs() | Math.abs() | O |
| mm -> m 변환 | ChangeMM_M | /1000 | O |
| 누적 P 계산 로직 | K*(D-D_prev)+P_prev | 동일 | O |
| Property 헤더 형식 | `MLHP=NL_{name}, STEEL, SPR, AUTO, I, NONE, SKEL,,` | 동일 | O |
| DOF 존재 플래그 | `NO , NO, NO, NO, NO, NO, NO` | 동일 | O |
| J-end 복사 (DOF 라인 반복) | 7줄 복사 | 6줄 복사 (dofLines) | 아래 참조 |
| 마지막 줄 | `0, 0, 0, 0, 0, 0` | 동일 | O |
| mct_iTYPE에 따른 F/P 선택 | iTYPE=0이면 F, 아니면 P | 동일 | O |
| 패딩 인덱스 | 11, 15, 20, 24 | 동일 | O |
| 고정 비율 값 | `0.5, 1, 2, 4, 8` | 동일 | O |
| TTE 추가 값 | `0.5, 1` | 동일 | O |
| HYST2 결합 | `& mct_HYST2` | `+ mctHyst2` | O |
| nSort 결정 | `m_dicSpgRef.Exists` → 1 | `springRefElements?.has` → 1 | O |

### 3.2 차이점

#### 3.2.1 V_SORT 배열 크기 및 DOF 루프 범위

| | VBA | TypeScript |
|---|-----|-----------|
| vSort 크기 | 6개 요소 (인덱스 0-5) | 7개 요소 (인덱스 0-6) |
| DOF 루프 | `For k = 1 To 6` → vSort()(6) 접근 시 OOB, `On Error Resume Next`로 무시 | `for k=1 to 6` → vSort[6]은 6으로 정의됨 |
| 6번 DOF 처리 | OOB 에러로 인해 6번째 DOF 데이터를 가져오지 못함, 이전 strBuf 값이 재사용되거나 빈 값 | 정상적으로 인덱스 6의 컴포넌트 데이터를 조회 |

**영향**: VBA에서는 `vSort(nSort)(6)`이 out-of-bounds이므로 6번째 DOF(k=6) 처리 시 `nAbs` 값이 설정되지 않아 이전 루프의 `nAbs` 값이 유지되거나 에러로 건너뜀. TS에서는 인덱스 6에 값 `6`을 넣어 정상 처리함. 만약 6번째 성분 데이터가 실제로 존재하면 결과가 달라질 수 있음.

#### 3.2.2 J-end 복사 범위

| | VBA | TypeScript |
|---|-----|-----------|
| 복사 범위 | `For k = 0 To 6` (7줄: NO NO + 6 DOF줄의 첫 7줄) | `for (const line of dofLines)` (6줄: DOF줄만) |
| 복사 대상 | `nRepeat` 위치부터 7줄 (Line 2 DOF플래그 포함) | dofLines만 (DOF플래그 미포함) |

**VBA 코드 분석**:
```vba
nRepeat = nRowCnt   ' Line 2 ("NO , NO, ...") 직전 위치
' ... DOF 라인 출력 (6줄) ...
' 빈 줄
For k = 0 To 6
  vWriteData(nRowCnt + k, 0) = vWriteData(nRepeat + k, 0)
Next k
```

`nRepeat`은 `NO , NO, NO, NO, NO, NO, NO` 라인을 출력하기 전에 저장되므로, `vWriteData(nRepeat + 0)` = `NO , NO, ...` (DOF 플래그), `vWriteData(nRepeat + 1..6)` = DOF 라인 6개. 총 7줄을 복사함.

**TS 코드 분석**:
```typescript
// dofLines에는 6개 DOF 라인만 저장
for (const line of dofLines) {
  mctLines.push(line);
}
mctLines.push('');  // 빈 줄
mctLines.push('0, 0, 0, 0, 0, 0');
```

TS에서는 `NO , NO, NO, NO, NO, NO, NO` 라인이 J-end 복사에 포함되지 않음.

**영향**: VBA에서는 J-end 부분에 `NO , NO, ...` 플래그 + 6개 DOF + 빈줄 = 8줄이 출력되고, TS에서는 6개 DOF + 빈줄 = 7줄이 출력됨. **J-end에 DOF 존재 플래그 라인이 누락됨**.

#### 3.2.3 VBA 변수 m의 출력 순서 버그 에뮬레이션

| | VBA | TypeScript |
|---|-----|-----------|
| 구현 | `m` 변수가 출력 루프에서 마지막 값으로 남아 `nTens` 결정에 영향 | `isFirstSpringFirstDOF` 플래그로 첫 DOF만 분기 |

VBA에서 변수 `m`은 두 가지 용도로 사용됨:
- `m = m_SprComp(n).vAngle(...)` (주석 처리됨)
- 출력 루프: `For m = 1 To i: vWriteData(...) = ... & strBuf(m): Next m`

첫 스프링 첫 DOF에서는 출력 루프 진입 전 `m=0`이므로 `nTens=1`(인장 먼저). 이후에는 출력 루프 후 `m=i>0`이므로 `nTens=0`(압축 먼저).

TS에서는 이를 `isFirstSpringFirstDOF` 플래그로 에뮬레이션하고 있으며, 로직적으로 동일함.

#### 3.2.4 TAK 타입 바이리니어 확장 처리

| | VBA | TypeScript |
|---|-----|-----------|
| TAK 확장 | GetSpringData에서 바이리니어 2점 → 3점으로 ReDim Preserve 후 데이터 밀기 | 별도 처리 없음 |

VBA `GetSpringData` (Line 1190-1203)에서 TAK 타입 바이리니어일 때 strTENS 배열을 3점으로 확장하고 데이터를 뒤로 밀어넣는 처리가 있음. TS의 `parseBilinearTable`에는 이에 대응하는 코드가 없음.

**영향**: TAK 타입 바이리니어 스프링이 있을 경우 데이터 포인트 수와 배치가 달라져 MCT 출력이 상이해질 수 있음.

#### 3.2.5 mct_iTYPE 값 처리

| | VBA | TypeScript |
|---|-----|-----------|
| mct_iTYPE 설정 | GetSpringData에서 `mct_iTYPE = 1` 고정 | `updateSpringCompData`에서 `iType = 1` 전달 |
| stiffness 값 | `mct_dStiff = 1#` (단, iTYPE=0이면 strTENS(l,0).strK 사용) | `stiffness = tensionData[0].k` |

VBA에서 비대칭(i=1)의 `mct_iTYPE`는 항상 1로 고정. `mct_dStiff`는 기본 1이지만, `iTYPE=0`일 때만 `strTENS(l,0).strK` 값으로 덮어씀 (Line 1269-1276). iTYPE가 1로 고정이므로 이 분기는 실행되지 않음.

TS에서는 `updateSpringCompData`에서 `mctStiff = stiffness`로 `tensionData[0].k`를 저장하지만, 출력 시 `stiff = 1`로 고정하고 있어 실제 MCT 출력에서 stiffness는 항상 1.

**영향**: MCT 출력의 STIFF 필드는 양쪽 모두 1로 동일. 그러나 내부 데이터 모델에서 `mctStiff` 값이 다름 (VBA=1, TS=tensionData[0].k). 출력에는 영향 없음.

#### 3.2.6 mctSFType 기본값

| | VBA | TypeScript |
|---|-----|-----------|
| sfType 계산 | `3 + mct_iTYPE * 2 = 5` (iTYPE=1 고정이므로) | 기본값 `sfType = compData.mctSFType \|\| 5` |

VBA에서 `mct_SFType = 3 + mct_iTYPE * 2`. iTYPE가 항상 1이므로 SFType은 항상 5. TS에서도 기본값 5를 사용하므로 결과 동일.

#### 3.2.7 LITR 베어링 출력 형식

| | VBA | TypeScript |
|---|-----|-----------|
| 출력 | `YES,,LITR,{type},{height},{area},0.01, YES` | `YES,,LITR,{type},{height},{area},0.01, YES` |

동일한 형식.

### 3.3 차이로 인한 MCT 결과 영향

| 차이점 | 영향도 | 설명 |
|--------|--------|------|
| V_SORT 6번 인덱스 | **낮음~중간** | 6번째 성분(θzl) 데이터가 존재하는 경우에만 영향. VBA에서는 OOB로 인해 이전 DOF 데이터가 재사용되거나 빈 값이 될 수 있고, TS에서는 정상적으로 6번 성분 데이터를 출력. 실제 데이터에 6번 성분이 없으면 영향 없음. |
| J-end DOF 플래그 누락 | **높음** | VBA에서는 J-end 부분에 `NO , NO, NO, NO, NO, NO, NO` 라인이 포함되지만, TS에서는 누락됨. MCT 파서가 이 라인을 필요로 하는 경우 구조적 오류 발생 가능. |
| TAK 바이리니어 확장 | **중간** | TAK 타입 바이리니어 데이터가 있을 경우 점수 불일치 (VBA=3점, TS=2점). TAK 바이리니어 스프링이 없는 모델에서는 영향 없음. |

---

## 4. 결론

- **FAIL** (조건부)

### 주요 문제점

1. **J-end DOF 존재 플래그 라인 누락** (3.2.2): VBA는 J-end 복사 시 `NO , NO, NO, NO, NO, NO, NO` 라인을 포함하여 7줄을 복사하지만, TS는 DOF 라인 6줄만 복사함. MCT 포맷 정합성 문제 발생 가능.

2. **TAK 바이리니어 확장 미구현** (3.2.4): VBA에서 TAK 타입 바이리니어를 3점으로 확장하는 로직이 TS에 없음. TAK + 바이리니어 조합이 있는 모델에서 데이터 불일치.

3. **V_SORT 6번 인덱스 차이** (3.2.1): 경미한 차이지만 6번째 성분 데이터가 존재할 경우 출력이 달라짐.

### 통과 조건

- TAK 타입의 바이리니어 스프링이 없고
- 6번째 성분(θzl) 데이터가 없는 모델에서는
- J-end DOF 플래그 문제만 수정하면 PASS 가능

### 수정 이력
- **2025-01 수정 완료**: J-end DOF 존재 플래그 라인 추가 — SPGAllASymConverter.ts에서 J-end 복사 시 `NO , NO, NO, NO, NO, NO, NO` 라인을 DOF 라인 앞에 추가하여 VBA와 동일한 7줄 복사(DOF플래그 + 6 DOF) 구조로 수정.
- **2025-01 수정 완료**: TAK 바이리니어 2점 → 3점 확장 로직 구현 — VBA의 `ReDim Preserve strTENS(1, j+2)` + 데이터 후방 이동 로직을 TypeScript에서 동일하게 구현.

### 잔여 주의사항
1. **V_SORT 6번 인덱스**: VBA에서는 6개 요소 배열에 인덱스 6 접근 시 OOB 에러 → `On Error Resume Next`로 무시. TS에서는 인덱스 6에 값 6을 넣어 정상 처리. 6번째 성분 데이터가 실제로 존재하는 경우 결과가 달라질 수 있으나, 실제 데이터에서는 영향 미미.
