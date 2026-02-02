# ES Convertor JP - 변환 흐름도

## 전체 변환 흐름 (Mermaid)

```mermaid
flowchart LR
    subgraph SHEETS["Excel Sheets"]
        direction TB
        S_NODE["節点座標"]
        S_ELEM["要素"]
        S_FULC["支点"]
        S_FULCD["支点詳細"]
        S_SPR["ばね要素"]
        S_SPG6["ばね特性表_6成分概要"]
        S_SPGSYM["ばね特性表_成分一覧(対称)"]
        S_SPGASYM["ばね特性表_成分一覧(非対称)"]
        S_MPHI["M-φ特性表"]
        S_MPHID["M-φ要素詳細"]
        S_LOAD["荷重"]
        S_NMASS["節点質量"]
        S_IFORCE["内力"]
    end

    subgraph CONVERTERS["VBA Converters"]
        direction TB
        C_NODE["Class020_Node"]
        C_ELEM["Class030_Elem"]
        C_FULC["Class160_Fulcrum"]
        C_FULCD["Class170_FulcDetail"]
        C_SPR["Class110_ElemSpring"]
        C_SPG6["Class120_SPG6Comp"]
        C_SPGSYM["Class130_SPGAllSym"]
        C_SPGASYM["Class140_SPGAllASym"]
        C_HNGASS["Class100_Hinge_Ass"]
        C_HNGPRP["Class090_Hinge_Prop"]
        C_LOAD["Class190_Load"]
        C_NMASS["Class050_NodalMass"]
        C_IFORCE["Class200_IniEForce"]
    end

    subgraph MCT["MCT Sections"]
        direction TB
        M_NODE["*NODE"]
        M_ELEM["*ELEMENT"]
        M_CONST["*CONSTRAINT"]
        M_GSPR["*GSPRING"]
        M_GSPRT["*GSPRTYPE"]
        M_NLLINK["*NL-LINK"]
        M_NLPROP["*NL-PROP"]
        M_OILDAMP["*VISCOUS-OIL-DAMPER"]
        M_IHINGEP["*IHINGE-PROP"]
        M_IHINGEA["*IHINGE-ASSIGN"]
        M_LOAD["*BEAMLOAD / *CONLOAD / etc"]
        M_NMASS["*NODALMASS"]
        M_IFORCE["*INI-EFORCE"]
    end

    %% Node/Element
    S_NODE --> C_NODE --> M_NODE
    S_ELEM --> C_ELEM --> M_ELEM

    %% Support (Fulcrum)
    S_FULC --> C_FULC
    C_FULC --> M_CONST
    C_FULC --> M_GSPR
    S_FULCD --> C_FULCD --> M_GSPRT

    %% Spring Elements
    S_SPR --> C_SPR --> M_NLLINK
    S_SPG6 --> C_SPG6
    C_SPG6 -.->|dicSPG6Comp| C_SPGSYM
    C_SPG6 -.->|dicSPG6Comp| C_SPGASYM
    S_SPGSYM --> C_SPGSYM
    C_SPGSYM --> M_NLPROP
    C_SPGSYM --> M_OILDAMP
    S_SPGASYM --> C_SPGASYM --> M_IHINGEP

    %% Hinge
    S_MPHI --> C_HNGASS
    C_HNGASS -.->|dicHYST_yp/zp| C_HNGPRP
    S_MPHID --> C_HNGPRP
    C_HNGPRP --> M_IHINGEP
    C_HNGPRP --> M_IHINGEA

    %% Others
    S_LOAD --> C_LOAD --> M_LOAD
    S_NMASS --> C_NMASS --> M_NMASS
    S_IFORCE --> C_IFORCE --> M_IFORCE
```

---

## 스프링 관련 상세 흐름

```mermaid
flowchart LR
    subgraph SHEETS["Excel Sheets"]
        S1["ばね要素"]
        S2["ばね特性表_6成分概要"]
        S3["ばね特性表_成分一覧(対称)"]
        S4["ばね特性表_成分一覧(非対称)"]
    end

    subgraph CONVERTERS["Converters"]
        C1["Class110_ElemSpring<br/>ChangeElemSpring()"]
        C2["Class120_SPG6Comp<br/>GetHingeSPG6Comp()"]
        C3["Class130_SPGAllSym<br/>ChangeSPGAllSym()"]
        C4["Class140_SPGAllASym<br/>ChangeSPGAllASym()"]
    end

    subgraph MCT["MCT Output"]
        M1["*NL-LINK<br/>(요소 정의)"]
        M2["*NL-PROP<br/>(속성 정의)"]
        M3["*VISCOUS-OIL-DAMPER<br/>(댐퍼 정의)"]
        M4["*IHINGE-PROP<br/>(비대칭 힌지)"]
    end

    S1 --> C1 --> M1
    S2 --> C2
    C2 -.->|dicSPG6Comp<br/>이력유형 판별| C3
    C2 -.->|dicSPG6Comp| C4
    S3 --> C3
    C3 --> M2
    C3 -->|BMR(CD)ダンパー| M3
    S4 --> C4 --> M4

    M1 -.->|GPROP 참조| M2
    M2 -.->|nDamper 참조| M3
    M1 -.->|IEPROP=NL_xxx| M4
```

---

## 지점(Support) 관련 상세 흐름

```mermaid
flowchart LR
    subgraph SHEETS["Excel Sheets"]
        S1["支点"]
        S2["支点詳細"]
    end

    subgraph CONVERTER["Class160_Fulcrum"]
        direction TB
        C1["DOF 체크<br/>(strData 3-8)"]
        C2{"ばね 포함?"}
        C3["GSPRING 출력"]
        C4["CONSTRAINT 출력"]
    end

    subgraph CONVERTER2["Class170_FulcDetail"]
        C5["GSPRTYPE 출력"]
    end

    subgraph MCT["MCT Output"]
        M1["*GSPRING<br/>(스프링 지점)"]
        M2["*CONSTRAINT<br/>(고정 지점)"]
        M3["*GSPRTYPE<br/>(스프링 속성)"]
    end

    S1 --> C1 --> C2
    C2 -->|Yes| C3 --> M1
    C2 -->|No| C4 --> M2
    S2 --> C5 --> M3
    M1 -.->|TYPE-NAME 참조| M3
```

---

## 힌지(Hinge) 관련 상세 흐름

```mermaid
flowchart LR
    subgraph SHEETS["Excel Sheets"]
        S1["M-φ特性表"]
        S2["M-φ要素詳細<br/>(zp/yp 테이블)"]
        S3["ばね特性表_成分一覧<br/>(非対称)"]
    end

    subgraph CONVERTERS["Converters"]
        C1["Class100_Hinge_Ass<br/>ChangeHinge_Ass()"]
        C2["Class090_Hinge_Prop<br/>ChangeHinge_Prop()"]
        C3["Class140_SPGAllASym<br/>ChangeSPGAllASym()"]
    end

    subgraph DICTS["Dictionaries"]
        D1["dicHYST_yp"]
        D2["dicHYST_zp"]
        D3["dicHingeProp"]
    end

    subgraph MCT["MCT Output"]
        M1["*IHINGE-PROP<br/>(프레임용)<br/>MLHP={name}"]
        M2["*IHINGE-ASSIGN"]
        M3["*IHINGE-PROP<br/>(스프링용)<br/>MLHP=NL_{name}"]
    end

    S1 --> C1
    C1 --> D1
    C1 --> D2
    C1 --> D3

    D1 -.-> C2
    D2 -.-> C2
    D3 -.-> C2
    S2 --> C2

    C2 --> M1
    C2 --> M2

    S3 --> C3 --> M3
```

---

## 좌표 변환 흐름

```mermaid
flowchart LR
    subgraph ES["ES 좌표계"]
        E1["X"]
        E2["Y"]
        E3["Z"]
    end

    subgraph TRANSFORM["변환"]
        T1["X → X"]
        T2["Y → Z"]
        T3["Z → -Y"]
    end

    subgraph MCT["MCT 좌표계"]
        M1["X"]
        M2["Y"]
        M3["Z"]
    end

    E1 --> T1 --> M1
    E2 --> T2 --> M3
    E3 --> T3 --> M2
```

```mermaid
flowchart LR
    subgraph ES_DOF["ES DOF 순서"]
        E1["Dx"]
        E2["Dy"]
        E3["Dz"]
        E4["Rx"]
        E5["Ry"]
        E6["Rz"]
    end

    subgraph VSORT["vSPG 배열<br/>[1,3,-2,4,6,-5]"]
        direction TB
    end

    subgraph MCT_DOF["MCT DOF 순서"]
        M1["Dx ← 1"]
        M2["Dy ← 3 (ES Dz)"]
        M3["Dz ← -2 (ES Dy)"]
        M4["Rx ← 4"]
        M5["Ry ← 6 (ES Rz)"]
        M6["Rz ← -5 (ES Ry)"]
    end

    E1 --> M1
    E3 --> M2
    E2 --> M3
    E4 --> M4
    E6 --> M5
    E5 --> M6
```

---

## 전체 시트-MCT 매핑 테이블

| Excel Sheet                      | VBA Class              | MCT Section(s)                    |
| -------------------------------- | ---------------------- | --------------------------------- |
| 節点座標                         | Class020_Node          | \*NODE                            |
| 要素                             | Class030_Elem          | \*ELEMENT                         |
| 支点                             | Class160_Fulcrum       | \*CONSTRAINT, \*GSPRING           |
| 支点詳細                         | Class170_FulcDetail    | \*GSPRTYPE                        |
| ばね要素                         | Class110_ElemSpring    | \*NL-LINK                         |
| ばね特性表\_6成分概要            | Class120_SPG6Comp      | (dicSPG6Comp 생성)                |
| ばね特性表\_成分一覧(対称)       | Class130_SPGAllSym     | \*NL-PROP, \*VISCOUS-OIL-DAMPER   |
| ばね特性表\_成分一覧(非対称)     | Class140_SPGAllASym    | \*IHINGE-PROP                     |
| M-φ特性表                        | Class100_Hinge_Ass     | (dicHYST 생성), \*IHINGE-ASSIGN   |
| M-φ要素詳細                      | Class090_Hinge_Prop    | \*IHINGE-PROP, \*IHINGE-ASSIGN    |
| 荷重                             | Class190_Load          | \*BEAMLOAD, \*CONLOAD, etc        |
| 節点質量                         | Class050_NodalMass     | \*NODALMASS                       |
| 内力                             | Class200_IniEForce     | \*INI-EFORCE                      |

---

## MCT 섹션 간 참조 관계

```mermaid
flowchart TB
    subgraph ELEMENTS["요소 정의"]
        E1["*ELEMENT"]
        E2["*NL-LINK"]
    end

    subgraph PROPERTIES["속성 정의"]
        P1["*NL-PROP"]
        P2["*GSPRTYPE"]
        P3["*IHINGE-PROP<br/>(프레임)"]
        P4["*IHINGE-PROP<br/>(스프링)"]
    end

    subgraph SUPPORTS["지점 정의"]
        S1["*CONSTRAINT"]
        S2["*GSPRING"]
    end

    subgraph SPECIAL["특수 정의"]
        SP1["*VISCOUS-OIL-DAMPER"]
        SP2["*IHINGE-ASSIGN"]
    end

    E2 -->|GPROP| P1
    E2 -->|IEPROP=NL_xxx| P4
    S2 -->|TYPE-NAME| P2
    P1 -->|nDamper| SP1
    E1 -->|ELEM_LIST| SP2
    P3 -->|PROP| SP2
```
