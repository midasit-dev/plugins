# ES Convertor - Converter Dependencies

## Overview

This document shows the dependency structure between converters in the ES Convertor project.
The converters transform ES (Engineer Studio) Excel data to MIDAS Civil NX MCT format.

## Execution Flow Diagram

```mermaid
flowchart TD
    subgraph Phase1["Phase 1: Data Preparation"]
        NumbSect["SectElemConverter<br/>(parseNumbSectData)"]
        SpringDP["ElemSpringConverter<br/>(getSpringDoublePoints)"]
    end

    subgraph Phase2["Phase 2: Core Structure"]
        Node["NodeConverter<br/>(convertNodes)"]
        Material["MaterialConverter<br/>(convertMaterials)"]
        FrameRead["FrameConverter<br/>(readFrameSectionNames)"]
        SectElem["SectElemConverter<br/>(sect2Material mapping)"]
    end

    subgraph Phase3["Phase 3: Sections"]
        Sect["SectConverter<br/>(convertSections)"]
        PlnSect["PlnSectConverter<br/>(convertPlnSections)"]
    end

    subgraph Phase4["Phase 4: Elements"]
        ElemNum["FrameConverter<br/>(setElementNumbers)"]
        Frame["FrameConverter<br/>(convertFrames)"]
        PlnElm["PlnElmConverter<br/>(convertPlaneElements)"]
        Rigid["RigidConverter<br/>(convertRigid)"]
    end

    subgraph Phase5["Phase 5: Hinges"]
        HingeProp["HingePropConverter<br/>(readHingeProperties)"]
        HingeAss["HingeAssConverter<br/>(convertHingeAssignments)"]
        HingePropOut["HingePropConverter<br/>(convertHingeProperties)"]
    end

    subgraph Phase6["Phase 6: Springs"]
        SPG6["SPG6CompConverter<br/>(parseSPG6CompData)"]
        ElemSpring["ElemSpringConverter<br/>(convertSpringElements)"]
        SPGSym["SPGAllSymConverter<br/>(convertSymmetricSprings)"]
        SPGASym["SPGAllASymConverter<br/>(convertAsymmetricSprings)"]
        SPGOther["SPGAllOtherConverter<br/>(convertOtherSprings)"]
    end

    subgraph Phase7["Phase 7: Supports"]
        Fulcrum["FulcrumConverter<br/>(convertFulcrum)"]
        FulcDetail["FulcDetailConverter<br/>(convertFulcrumDetail)"]
    end

    subgraph Phase8["Phase 8: Loads & Forces"]
        NodalMass["NodalMassConverter<br/>(convertNodalMass)"]
        Load["LoadConverter<br/>(convertLoads)"]
        InternalForce["InternalForceConverter<br/>(convertInternalForce)"]
    end

    %% Phase 1 -> Phase 2
    NumbSect --> Node
    SpringDP --> Node

    %% Phase 2 dependencies
    Node --> FrameRead
    Node --> Material
    FrameRead --> SectElem

    %% Phase 2 -> Phase 3
    SectElem --> Sect
    FrameRead --> Sect
    Material --> Sect

    %% Phase 3 -> Phase 4
    Sect --> ElemNum
    Rigid --> ElemNum
    ElemNum --> Frame
    Frame --> PlnElm
    ElemNum --> Rigid

    %% Phase 4 -> Phase 5
    Frame --> HingeProp
    HingeProp --> HingeAss
    HingeAss --> HingePropOut

    %% Phase 5 -> Phase 6
    Frame --> SPG6
    SPG6 --> ElemSpring
    SPG6 --> SPGSym
    SPG6 --> SPGASym
    SPG6 --> SPGOther

    %% Phase 6 -> Phase 7
    Node --> Fulcrum
    Fulcrum --> FulcDetail

    %% Phase 7 -> Phase 8
    Node --> NodalMass
    Frame --> Load
    Node --> Load
    Frame --> InternalForce
```

## Context Dependencies

The converters share data through a `ConversionContext` object:

```mermaid
flowchart LR
    subgraph Context["ConversionContext (Shared State)"]
        nodeMapping["nodeMapping<br/>Map&lt;string, number&gt;"]
        elementMapping["elementMapping<br/>Map&lt;string, number&gt;"]
        materialMapping["materialMapping<br/>Map&lt;string, number&gt;"]
        sectionMapping["sectionMapping<br/>Map&lt;string, number&gt;"]
        sect2Material["sect2Material<br/>Map&lt;string, string&gt;"]
        esNodeCoords["esNodeCoords<br/>Map&lt;number, Point3D&gt;"]
        elementNodes["elementNodes<br/>Map&lt;number, nodes&gt;"]
        elementAngles["elementAngles<br/>Map&lt;number, number&gt;"]
    end

    NodeConv["NodeConverter"] -->|writes| nodeMapping
    NodeConv -->|writes| esNodeCoords

    MaterialConv["MaterialConverter"] -->|writes| materialMapping

    SectElemConv["SectElemConverter"] -->|writes| sect2Material

    SectConv["SectConverter"] -->|writes| sectionMapping
    SectConv -->|reads| sect2Material

    FrameConv["FrameConverter"] -->|writes| elementMapping
    FrameConv -->|writes| elementNodes
    FrameConv -->|writes| elementAngles
    FrameConv -->|reads| nodeMapping
    FrameConv -->|reads| materialMapping
    FrameConv -->|reads| sectionMapping
    FrameConv -->|reads| sect2Material
    FrameConv -->|reads| esNodeCoords

    LoadConv["LoadConverter"] -->|reads| nodeMapping
    LoadConv -->|reads| elementMapping
    LoadConv -->|reads| elementNodes
    LoadConv -->|reads| elementAngles

    FulcrumConv["FulcrumConverter"] -->|reads| nodeMapping

    SpringConv["ElemSpringConverter"] -->|reads| nodeMapping
    SpringConv -->|reads| elementNodes
```

## Converter-to-VBA Class Mapping

| TypeScript Converter | VBA Class | Sheet Name |
|---------------------|-----------|------------|
| NodeConverter | Class010_Node | 節点座標 |
| FrameConverter | Class020_Frame | フレーム要素 |
| PlnElmConverter | Class030_PlnElm | 平板要素 |
| RigidConverter | Class040_Rigid | 剛体要素 |
| MaterialConverter | Class050_Material | 材料 |
| SectElemConverter | Class055_NumbSect + Class060_SectElem | 数値断面, 断面要素 |
| SectConverter | Class070_Sect | 断面特性ｵﾌﾟｼｮﾝ |
| PlnSectConverter | Class080_PlnSect | 平板断面 |
| HingePropConverter | Class090_Hinge_Prop | M-φ要素詳細 |
| HingeAssConverter | Class100_Hinge_Ass | M-φ特性表 |
| ElemSpringConverter | Class110_ElemSpring | ばね要素 |
| SPG6CompConverter | Class120_SPG6Comp | ばね特性表_6成分概要 |
| SPGAllSymConverter | Class130_SPGAllSym | ばね特性表_成分一覧(対称) |
| SPGAllASymConverter | Class140_SPGAllASym | ばね特性表_成分一覧(非対称) |
| SPGAllOtherConverter | Class150_SPGAllOther | ばね特性表_成分一覧(その他) |
| FulcrumConverter | Class160_Fulcrum | 支点 |
| FulcDetailConverter | Class170_FulcDetail | 支点詳細 |
| NodalMassConverter | Class180_NodalMass | 節点質量 |
| LoadConverter | Class190_Load | 荷重値 |
| InternalForceConverter | Class200_InternalForce | 内力 |

## Data Flow Summary

```mermaid
sequenceDiagram
    participant Excel as ES Excel
    participant Parser as ExcelParser
    participant Gen as MCTGenerator
    participant Conv as Converters
    participant MCT as MCT Output

    Excel->>Parser: Parse .xlsx/.xlsm
    Parser->>Gen: ParseResult (21 sheets)

    Gen->>Conv: Phase 1: NumbSect, SpringDoublePoints
    Conv-->>Gen: Context initialized

    Gen->>Conv: Phase 2: Nodes, Materials, FrameRead
    Conv-->>Gen: nodeMapping, materialMapping

    Gen->>Conv: Phase 3: Sections
    Conv-->>Gen: sectionMapping

    Gen->>Conv: Phase 4: Elements
    Conv-->>Gen: elementMapping, mctLines

    Gen->>Conv: Phase 5-8: Hinges, Springs, Supports, Loads
    Conv-->>Gen: Additional mctLines

    Gen->>MCT: Combine all mctLines
    MCT-->>Gen: Complete MCT text
```
