# \*MATERIAL MCT 변환 분석

## 개요

ES(Engineer Studio) 엑셀의 `材料` 시트를 MIDAS Civil NX의 `*MATERIAL` 섹션으로 변환

## 1. 필요한 데이터 시트

### 주요 시트

| 항목    | VBA               | TypeScript | 상태 |
| ------- | ----------------- | ---------- | ---- |
| 시트명  | `m_Sheet_Material` | `材料`     | ✓    |
| 시작 행 | 3 (nReadSTRow)    | 3          | ✓    |
| 열 범위 | B~J (2~10)        | B~J (2~10) | ✓    |

### 의존 시트

| 시트명       | 용도                          | 필수 여부 |
| ------------ | ----------------------------- | --------- |
| `節点座標`   | MCT 변환의 기본 시트 (노드 매핑) | **필수**  |

> **주의**: MCT 파일 생성 시 `節点座標` 시트가 없으면 변환 오류 발생

### 열 구조

| 열  | 인덱스 | VBA 변수      | TypeScript     | 설명                |
| --- | ------ | ------------- | -------------- | ------------------- |
| B   | row[0] | strData(0, i) | name           | 材料名称            |
| C   | row[1] | strData(1, i) | type           | 種類 (データベース/ユーザー) |
| D   | row[2] | strData(2, i) | category       | タイプ (材料 종류)  |
| E   | row[3] | strData(3, i) | strength       | 圧縮強度 (N/mm²)    |
| F   | row[4] | strData(4, i) | elasticModulus | E (N/mm²)           |
| G   | row[5] | strData(5, i) | density        | γ (kN/m³)           |
| H   | row[6] | strData(6, i) | thermalCoeff   | α (1/℃)             |
| I   | row[7] | strData(7, i) | -              | 色 (미사용)         |
| J   | row[8] | strData(8, i) | -              | 従属 (미사용)       |

## 2. 처리 경로

### VBA (Class050_Material.cls)

```
1. GetData() → 시트에서 B3:J~ 데이터 읽기
2. 숫자가 아닌 값은 0으로 치환 (열 3~6)
3. 포아송 비 딕셔너리 설정
4. 강도 딕셔너리 설정 (Fc21~Fc80, SS400~SM570)
5. 표준 딕셔너리 설정 (JIS-Civil)
6. 데이터베이스 타입 검증 → 강도 없으면 ユーザー로 변경
7. 탄성계수 단위 변환: N/mm² → kN/m²
8. 탄성계수 0이면 1로 설정
9. MCT 출력 (데이터베이스 or 사용자 정의)
10. 추가 재료 생성 (단면에서 필요한 경우)
```

### TypeScript (MaterialConverter.ts)

```
1. getSheetDataForConversion() → 시트 데이터 가져오기
2. parseMaterialData() → MaterialData[] 파싱
3. 숫자가 아닌 값 검증
4. convertMaterials() 호출
5. 탄성계수 단위 변환: changeN_kN / changeMM2_M2
6. 탄성계수 0이면 1로 설정
7. 데이터베이스 여부 판단 (강도 매핑 확인)
8. MCT 출력
9. 추가 재료 생성 (additionalMaterials)
```

### 처리 경로 비교

| 단계                | VBA                        | TypeScript                  | 상태 |
| ------------------- | -------------------------- | --------------------------- | ---- |
| 데이터 읽기         | GetData                    | getSheetDataForConversion   | ✓    |
| 숫자 검증           | IsNumeric 체크             | isNumeric 체크              | ✓    |
| 포아송 비 매핑      | dicPoisson                 | POISSON_RATIO_MAP           | ✓    |
| 강도 매핑           | dicConc                    | CONCRETE/STEEL_STRENGTH_MAP | ✓    |
| 표준 매핑           | dicStandard                | MATERIAL_STANDARDS          | ✓    |
| 단위 변환           | ChangeN_kN / ChangeMM2_M2  | changeN_kN / changeMM2_M2   | ✓    |
| E=0 처리            | dValue = 1                 | elasticModulus = 1          | ✓    |
| 재료 타입 저장      | m_MatNo2S_or_RC            | matNo2SorRC                 | ✓    |

## 3. 단위 변환

### 탄성계수 변환

```
입력: E (N/mm²)
출력: E (kN/m²)

공식: E_out = E_in * 1000 / 1e-6 = E_in * 1e9

VBA: ChangeN_kN(dValue) / ChangeMM2_M2(1)
TS:  changeN_kN(E) / changeMM2_M2(1)
```

## 4. MCT 출력 형식

### 데이터베이스 재료

```
matNo,TYPE,name,0,0,,C,NO,0.0,1,STANDARD,,STRENGTH_NAME,NO,E
```

예: `1,CONC,21 MPa,0,0,,C,NO,0.0,1,JIS-Civil(RC),,Fc21,NO,23500`

### 사용자 정의 재료

```
matNo,USER,name,0,0,,C,NO,0.0,2,E_converted,POISSON,THERMAL,DENSITY,0
```

예: `1,USER,30 MPa,0,0,,C,NO,0.0,2,28000000000,0.167,0.00001,24.5,0`

## 5. 딕셔너리 매핑

### 포아송 비 (VBA lines 55-60)

| タイプ                     | 포아송 비 |
| -------------------------- | --------- |
| コンクリート材料           | 0.167     |
| 鉄筋材料                   | 0.3       |
| 鋼材料                     | 0.3       |
| 炭素繊維シート（FRP）材料  | 0.46      |

### 콘크리트 강도 (VBA lines 63-73)

| 강도 (N/mm²) | MCT 이름 |
| ------------ | -------- |
| 21           | Fc21     |
| 24           | Fc24     |
| 27           | Fc27     |
| 30           | Fc30     |
| 36           | Fc36     |
| 40           | Fc40     |
| 50           | Fc50     |
| 60           | Fc60     |
| 70           | Fc70     |
| 80           | Fc80     |

### 강재 강도 (VBA lines 74-77)

| 강도 (N/mm²) | MCT 이름 |
| ------------ | -------- |
| 235          | SS400    |
| 315          | SM490    |
| 355          | SM490Y   |
| 450          | SM570    |

### 표준/타입 매핑 (VBA lines 80-83)

| タイプ           | STANDARD       | MCT TYPE |
| ---------------- | -------------- | -------- |
| コンクリート材料 | JIS-Civil(RC)  | CONC     |
| 鋼材料           | JIS-Civil(S)   | STEEL    |
| 鉄筋材料         | JIS-Civil(S)   | STEEL    |

## 6. VBA와 차이점

| 항목              | VBA                    | TypeScript               | 영향      |
| ----------------- | ---------------------- | ------------------------ | --------- |
| 재료명 자르기     | ChangeMatlName         | truncateMaterialName     | 동일 기능 |
| 추가 재료 처리    | dicSect 기반           | additionalMaterials Map  | 동일 기능 |
| 타입 판단         | m_MatNo2S_or_RC        | matNo2SorRC              | 동일 기능 |

## 7. Context에 저장되는 데이터

| Map              | Key              | Value              | 용도                    |
| ---------------- | ---------------- | ------------------ | ----------------------- |
| materialMapping  | 재료명 (string)  | 재료 번호 (number) | 요소에서 재료 번호 조회 |
| matNo2SorRC      | 재료 번호 (number) | "STEEL" \| "RC"  | 힌지 특성 등에서 사용   |
| maxMaterialNo    | -                | number             | 다음 재료 번호 시작점   |

## 8. 결론

**✓ \*MATERIAL 변환은 VBA와 완전히 일치합니다.**

- 필요한 시트: `材料` (주요), `節点座標` (의존)
- 처리 경로: 문제 없음
- 누락된 기능: 없음

> **참고**: `節点座標` 시트는 MCT 파일의 필수 구성요소이므로, MATERIAL 변환 테스트 시에도 반드시 NODE 데이터가 필요합니다.

---

## 데이터 입력 예제

### Excel 시트 (`材料`)

|     | B              | C            | D                  | E    | F      | G    | H        | I        | J    |
| --- | -------------- | ------------ | ------------------ | ---- | ------ | ---- | -------- | -------- | ---- |
| 2   | 材料名称       | 種類         | タイプ             | 圧縮強度 | E      | γ    | α        | 色       | 従属 |
| 3   | Concrete-21    | データベース | コンクリート材料   | 21   | 23500  | 24.5 | 0.00001  | 10527352 | 1    |
| 4   | Steel-SS400    | データベース | 鋼材料             | 235  | 200000 | 77   | 0.000012 | 2642118  | 1    |
| 5   | Rebar-SD295A   | データベース | 鉄筋材料           | 295  | 200000 | 77   | 0.00001  | 2642118  | 1    |
| 6   | Custom-Conc    | ユーザー     | コンクリート材料   | 30   | 28000  | 24.5 | 0.00001  | 8355711  | 1    |
| 7   | FRP-Material   | ユーザー     | 炭素繊維シート（FRP）材料 | 0 | 165000 | 16   | 0.000001 | 255      | 1    |

### 설명

- 행 2: 헤더 (변환 시 무시됨)
- 행 3~: 데이터 시작 (nReadSTRow = 3)
- 열 범위: B~J (nReadSTCol=2, nReadEDCol=10)

### MCT 출력 결과

```
*MATERIAL    ; Material
; iMAT, TYPE, MNAME, SPHEAT, HEATCO, PLAST, TUNIT, bMASS, DAMPRATIO, [DATA1]           ; STEEL, CONC, USER
; [DATA1] : 1, STANDARD, CODE/PRODUCT, DB, USEELAST, ELAST
; [DATA1] : 2, ELAST, POISN, THERMAL, DEN, MASS
1,CONC,Concrete-21,0,0,,C,NO,0.0,1,JIS-Civil(RC),,Fc21,NO,23500
2,STEEL,Steel-SS400,0,0,,C,NO,0.0,1,JIS-Civil(S),,SS400,NO,200000
3,STEEL,Rebar-SD295A,0,0,,C,NO,0.0,1,JIS-Civil(S),,SD295A,NO,200000
4,USER,Custom-Conc,0,0,,C,NO,0.0,2,28000000000,0.167,0.00001,24.5,0
5,USER,FRP-Material,0,0,,C,NO,0.0,2,165000000000,0.46,0.000001,16,0
```

### 예제별 변환 상세

| 재료          | 종류         | タイプ             | MCT TYPE | 출력 형식       |
| ------------- | ------------ | ------------------ | -------- | --------------- |
| Concrete-21   | データベース | コンクリート材料   | CONC     | DB (Fc21)       |
| Steel-SS400   | データベース | 鋼材料             | STEEL    | DB (SS400)      |
| Rebar-SD295A  | データベース | 鉄筋材料           | STEEL    | DB (SD295A)     |
| Custom-Conc   | ユーザー     | コンクリート材料   | USER     | 사용자 정의     |
| FRP-Material  | ユーザー     | FRP材料            | USER     | 사용자 정의     |

### 탄성계수 변환 상세

| 재료          | 입력 E (N/mm²) | 출력 E (kN/m²)      |
| ------------- | -------------- | ------------------- |
| Concrete-21   | 23,500         | 23,500 (DB는 원본)  |
| Steel-SS400   | 200,000        | 200,000 (DB는 원본) |
| Custom-Conc   | 28,000         | 28,000,000,000      |
| FRP-Material  | 165,000        | 165,000,000,000     |

### 포아송 비 적용

| 재료          | タイプ             | 포아송 비 |
| ------------- | ------------------ | --------- |
| Custom-Conc   | コンクリート材料   | 0.167     |
| FRP-Material  | FRP材料            | 0.46      |

### 데이터베이스 vs 사용자 정의 판단

1. **種類 = "データベース"** AND **強度가 매핑에 존재** → 데이터베이스 재료
2. **種類 = "ユーザー"** OR **強度가 매핑에 없음** → 사용자 정의 재료
3. **FRP 재료**는 항상 사용자 정의
