# CLAUDE.md — ES→MCT Converter

## 프로젝트 목표

Engineer's Studio(ES)의 Raw 텍스트 데이터를 MIDAS Civil NX의 MCT 형식으로 변환하는 웹 앱.
**`src/basicVBA/`의 VBA 코드가 생성하는 MCT와 100% 동일한 출력을 만드는 것이 절대 목표.**

## 기술 스택

- TypeScript (strict), React, npm
- UI: MUI Material — 디자인(색상/보더/간격)은 `node_modules/@moaui/` 토큰 참조
- 데이터 그리드: ag-grid
- 상태 관리: React Context + useReducer
- Excel I/O: SheetJS (`xlsx`)
- **moaui 컴포넌트 직접 사용 금지, 디자인 토큰만 참조**

## 핵심 규칙

1. **템플릿 프로젝트를 건드리지 않는다.** 새로 작성하는 코드는 모두 `src/es-mct/` 폴더 안에서만 작업한다. 기존 템플릿 파일(vite.config, tsconfig, 기존 컴포넌트 등)은 수정하지 않는다. 마지막에 `App.tsx`에서 `src/es-mct/`의 메인 컴포넌트를 import해서 렌더링하는 것으로 연결한다.
2. **VBA를 먼저 읽어라.** converter 작성 전 반드시 `src/basicVBA/cls/`, `bas/` 해당 파일을 읽는다. VBA는 Shift-JIS(CP932) 인코딩이다.
3. **VBA 로직을 "개선"하지 않는다.** 소수점 자릿수, 콤마 위치, 줄바꿈까지 원본과 동일해야 한다.
4. **converter는 순수 함수.** `src/es-mct/converters/`에 React 의존성 금지. UI와 완전 분리.
5. **매 작업 후 빌드하지 않는다.** "빌드해줘"라고 할 때만 빌드.
6. **UI 기본 구조는 `src/design/UI_Mockup.jsx`를 참고한다.**

## 프로젝트 구조

```
src/
├── basicVBA/            # 원본 VBA 소스 (읽기 전용 참조)
│   ├── cls/             # Class010~200 (.cls)
│   ├── bas/             # main.bas, UNIT.bas
│   └── xlsm/            # DataChange_9.xlsm
├── design/              # UI 목업 참조용
│   └── UI_Mockup.jsx
│
├── es-mct/              # ⭐ 새로 작성하는 모든 코드는 여기에
│   ├── types/           # 타입 정의 (es, mct, grid)
│   ├── context/         # ConverterContext (VBA 전역 Dictionary → Map)
│   ├── converters/      # VBA Class → TS 순수 함수 (1:1 대응)
│   │   ├── utils/       # unit, coordinate, angle, naming, stringGen
│   │   └── orchestrator.ts
│   ├── components/      # layout, grid, modal, common
│   ├── hooks/           # useExcelImport, useExcelExport, useMctConvert
│   ├── theme/           # MUI 테마 (moaui 토큰 기반)
│   ├── constants/       # tabs, mctCommands
│   └── App.tsx          # es-mct 메인 컴포넌트
│
└── App.tsx              # 템플릿 원본 — es-mct/App.tsx만 import해서 렌더링
```

## VBA → TS 패턴

| VBA                   | TypeScript                                  |
| --------------------- | ------------------------------------------- |
| 전역 Dictionary       | Context state의 `Map<string, T>`            |
| Class + strData()     | converter 함수 입력 파라미터                |
| GetData() (시트 읽기) | Context에서 탭 데이터 가져오기              |
| vWriteData → mct 시트 | converter return 값 (문자열 배열)           |
| On Error Resume Next  | try-catch + console.warn (조용히 무시 금지) |

## 코딩 컨벤션

- VBA 원본과 대응 관계 주석 필수: `// VBA: Class010_Node.cls > ChangeNode()`
- VBA 일본어 주석은 한국어로 번역
- `any` 타입 사용 금지
- 파일명: camelCase.ts / 컴포넌트: PascalCase.tsx
