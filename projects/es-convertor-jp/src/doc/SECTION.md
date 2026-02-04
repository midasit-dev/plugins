# *SECTION 변환 검증

## 1. VBA 흐름

### 1.1 호출 위치 (main.bas)
- `Class055_NumbSect.GetNumbSect` → `m_Sect2Material`에 단면명→재료명 매핑
- `Class060_SectElem.ReadSectElem_SectName(dicSectName)` → 미등록 단면명 제거
- `Class060_SectElem.ReadSectElem(dicMatlYoung, dicSectYoung, dicSectName)` → 단면→재료 매핑 추가
- `Class070_Sect.ReadSect_SectName(dicSectName)` → Young률/형상 정보 수집
- `Class070_Sect.ChangeSect(dicSectAll, dicSectYoung, bSect)` → MCT 출력

### 1.2 데이터 읽기 (Class070_Sect)
- 시트명: `"断面特性ｵﾌﾟｼｮﾝ"`
- 읽기 범위: Row 4~, Col 2~30 (B~AD, 29개 열)
- 주요 필드:
  - strData(0) = 단면명
  - strData(2) = Young률
  - strData(4) = 면적(AREA)
  - strData(5) = Iyy
  - strData(6) = Izz
  - strData(10) = CzP
  - strData(11) = CzM
  - strData(12) = CyM
  - strData(13) = CyP
  - strData(17) = 오프셋 여부 ("TRUE"/"FALSE")
  - strData(18), (19) = 오프셋 값
  - strData(21) = 형상 추가 정보
  - strData(24) = Ixx
  - strData(28) = 단면 형상명

### 1.3 데이터 가공

#### 단면 형상 매핑 (dicSectList)
```
山形断面→L, 溝形断面→C, H-断面→H, T-断面→T, ボックス断面→B, パイプ断面→P,
2山形断面→2L, 2溝形断面→2C, 矩形→SB, 円形→SR, 中空八角形→OCT, 八角形→SOCT,
矩形-八角形→ROCT, 中空小判形→TRK, 小判形→STRK, 半小判形→HTRK, ""→SB
```

#### VALUE 단면 (i-j 동일)
4줄 출력:
1. `{번호},VALUE,{이름},{OFFSET},NO,NO,{형상},BUILT,0,0,0,0,0,0,0,0,0`
2. `{AREA},0,0,{Ixx},{Iyy},{Izz}`
3. `{CyP},{CyM},{CzP},{CzM},0,0,0,0,{CyM},{CzM}`
4. `{-CyM},{CyP},{CyP},{-CyM},{CzP},{CzP},{-CzM},{-CzM},0,0`

#### TAPERED 단면 (i-j 상이)
9줄 출력:
1. `{번호},TAPERED,{이름(TAP)},{OFFSET},NO,NO,NO,{형상},1,1,VALUE`
2. `0,0,0,0,0,0,0,0`
3. i단면 면적: `{AREA},0,0,{Ixx},{Iyy},{Izz}`
4. i단면 C값: `{CyP},{CyM},{CzP},{CzM},0,0,0,0,0,0`
5. i단면 Y/Z: `{-CyM},{CyP},{CyP},{-CyM},{CzP},{CzP},{-CzM},{-CzM},0,0`
6. `0,0,0,0,0,0,0,0`
7. j단면 면적 (위와 동일 구조)
8. j단면 C값
9. j단면 Y/Z

### 1.4 MCT 출력
- VALUE와 TAPERED를 별도 열에 출력
- 각각 별도의 코멘트 헤더

---

## 2. TypeScript 흐름

### 2.1 호출 위치 (MCTGenerator.ts)
- Line 79-83: `parseNumbSectData()` → sect2Material 매핑
- Line 129-134: SectElem에서 sect2Material 추가
- Line 158-187: `convertSections()` → MCT 출력

### 2.2 데이터 읽기
- `getSheetDataForConversion(sheets, SHEET_NAMES.SECT)` 사용
- rawData[i]로 동일한 열 인덱스 접근

### 2.3 데이터 가공

#### 단면 형상 매핑 (SECTION_SHAPES)
- VBA dicSectList와 완전 동일 (16개 항목 + 빈값→SB)

#### VALUE 단면 (generateValueSection)
- 4줄 출력, 동일한 필드 매핑

#### TAPERED 단면 (generateTaperedSection)
- 9줄 출력, 동일한 필드 매핑

#### 단면 번호 할당
- `sectionPairs`를 순회하며 순번 할당

### 2.4 MCT 출력
- VALUE, TAPERED 별도 배열로 관리
- MCTGenerator에서 각각 별도 출력

---

## 3. 비교 분석

### 3.1 동일한 부분
| 항목 | VBA | TypeScript | 일치 |
|------|-----|-----------|------|
| 코멘트 헤더 (VALUE 6줄) | 동일 | 동일 | O |
| 코멘트 헤더 (TAPERED 10줄) | 동일 | 동일 | O |
| 단면 형상 매핑 16+1개 | 동일 | 동일 | O |
| VALUE Line 1 구조 | 동일 | 동일 | O |
| VALUE Line 2 (AREA,0,0,Ixx,Iyy,Izz) | 동일 | 동일 | O |
| VALUE Line 3 (CyP,CyM,CzP,CzM,0,0,0,0,CyM,CzM) | 동일 | 동일 | O |
| VALUE Line 4 (-CyM,CyP,CyP,-CyM,CzP,CzP,-CzM,-CzM,0,0) | 동일 | 동일 | O |
| TAPERED 9줄 구조 | 동일 | 동일 | O |
| OFFSET 처리 | TRUE→LT, FALSE→CC | 동일 | O |
| 단면명 truncation | 28자 제한, ‾ 구분 | 28자 제한, ~ 구분 | O (구분자만 다름) |

### 3.2 차이점
| 항목 | VBA | TypeScript | 영향 |
|------|-----|-----------|------|
| TAPERED Line 4 Cy,Cz | 마지막 2개 `0, 0` | 마지막 2개 `0, 0` | **없음** - 동일 |
| VALUE Line 3 Cy,Cz | `{CyM},{CzM}` | `{cyM},{czM}` | **없음** - 동일 |
| 단면명 구분자 | `‾` (전각) | `~` (반각) | **낮음** - 표시만 다름 |
| Young률 저장 | dicSectYoung에 저장 | sectYoung Map에 저장 | **없음** - 내부 참조 |

### 3.3 차이로 인한 MCT 결과 영향
- VALUE/TAPERED 단면의 모든 수치 필드가 동일하게 매핑
- 단면 형상 매핑이 완전 일치
- 단면명 truncation 로직도 동일 (구분자 문자만 다름)

---

## 4. 결론
**PASS** - *SECTION 변환 로직은 VBA와 TypeScript가 기능적으로 동일. VALUE/TAPERED 모두 동일한 4줄/9줄 구조, 동일한 필드 매핑. 단면 형상 매핑 17개 완전 일치.
