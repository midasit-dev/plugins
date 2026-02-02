# ES Convertor JP - Project Rules

## Project Overview

ES(Engineer Studio) Excel 파일을 MIDAS Civil NX MCT 포맷으로 변환하는 React/TypeScript 프로젝트.
VBA 매크로(DataChange 9.xlsm)를 TypeScript로 마이그레이션하는 것이 목표.

## 중요 규칙

1. 수정후 빌드 하지 말 것.
2. 수정후 오류가 생기는 지 확인하고 자동으로 체크해서 잡을 것.
3. 기 작성된 기능의 변경은 절대 없을 것!
4. 반드시 VBA의 로직을 확인하고, 이를 완전히 같은 MCT결과를 가져오게 할 것!

## Directory Structure

```
src/
├── basicVBA/                    # 원본 VBA 코드 (참조용)
│   ├── Class/                   # VBA 클래스 파일 (.cls)
│   ├── Forms/                   # VBA 폼 파일 (.frm)
│   ├── Modules/                 # VBA 모듈 파일 (.bas)
│   └── examples/                # 테스트용 엑셀 파일
│       ├── DataChange 9.xlsm    # 규격 파일 (스펙 정의, 빈 템플릿)
│       ├── 3DBox-GroundSpring.xlsm  # 예제 (지반 스프링)
│       ├── Building-3F-Mphi.xlsm    # 예제 (3층 건물, M-phi)
│       └── 斜吊りアーチ橋 1.xlsm     # 예제 (사장교)
├── converters/                  # TypeScript 변환기
├── components/                  # React 컴포넌트
├── types/                       # TypeScript 타입 정의
├── utils/                       # 유틸리티 함수
└── generators/                  # MCT 파일 생성기
```

## VBA to TypeScript Mapping

| VBA Class                  | TypeScript Converter      | Description        |
| -------------------------- | ------------------------- | ------------------ |
| Class010_Node.cls          | NodeConverter.ts          | 노드 데이터 변환   |
| Class020_Frame.cls         | FrameConverter.ts         | 프레임 요소 변환   |
| Class030_PlnElm.cls        | PlnElmConverter.ts        | 평면 요소 변환     |
| Class040_Rigid.cls         | RigidConverter.ts         | 강체 요소 변환     |
| Class050_Material.cls      | MaterialConverter.ts      | 재료 속성 변환     |
| Class055_NumbSect.cls      | SectElemConverter.ts      | 단면 번호 매핑     |
| Class060_SectElem.cls      | SectElemConverter.ts      | 단면 요소 변환     |
| Class070_Sect.cls          | SectConverter.ts          | 단면 속성 변환     |
| Class080_PlnSect.cls       | PlnSectConverter.ts       | 평면 단면 변환     |
| Class090_Hinge_Prop.cls    | HingePropConverter.ts     | 힌지 속성 변환     |
| Class100_Hinge_Ass.cls     | HingeAssConverter.ts      | 힌지 할당 변환     |
| Class110_ElemSpring.cls    | ElemSpringConverter.ts    | 요소 스프링 변환   |
| Class120_SPG6Comp.cls      | SPG6CompConverter.ts      | 6성분 스프링 변환  |
| Class130_SPGAllSym.cls     | SPGAllSymConverter.ts     | 대칭 스프링 변환   |
| Class140_SPGAllASym.cls    | SPGAllASymConverter.ts    | 비대칭 스프링 변환 |
| Class150_SPGAllOther.cls   | SPGAllOtherConverter.ts   | 기타 스프링 변환   |
| Class160_Fulcrum.cls       | FulcrumConverter.ts       | 지점 구속 변환     |
| Class170_FulcDetail.cls    | FulcDetailConverter.ts    | 지점 상세 변환     |
| Class180_NodalMass.cls     | NodalMassConverter.ts     | 절점 질량 변환     |
| Class190_Load.cls          | LoadConverter.ts          | 하중 데이터 변환   |
| Class200_InternalForce.cls | InternalForceConverter.ts | 내력 데이터 변환   |

## VBA File Encoding

VBA 파일(.cls, .bas, .frm)은 **Shift_JIS (CP932)** 인코딩으로 저장되어 있음.
UTF-8로 읽으면 일본어가 깨져 보이므로, 다음 명령어로 읽어야 함:

```bash
iconv -f SHIFT_JIS -t UTF-8 "파일경로"
```
