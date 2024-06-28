import {SetRecoilState, atom, selector,DefaultValue} from 'recoil';
import {FoundationCoordinates, CalculatePileCoordinates, ExtractNumbers, CalculatePileCenterCoordinates} from '../utils_pyscript';
/** App variables */

export const ProjectName = atom({
    key: 'ProjectName',
    default: 'Project'
});

/** Pile Properties variables */
export const FoundationWidth = atom({
    key: 'Width',
    default: 10
});

export const SideLength = atom({
    key: 'SideLength',
    default: 10
});

export const TopLevel = atom({
    key: 'TopLevel',
    default: 0
});

export const Force_Point_X = atom({
    key: 'Force_Point_X',
    default: 0
});

export const Force_Point_Y = atom({
    key: 'Force_Point_Y',
    default: 0
});
/** Pile Initial Settings variables */

export const PileName = atom({
    key: 'PileName',
    default: ''
});

export const PileLength = atom({
    key: 'PileLength',
    default: 0
});

export const PileType = atom({
    key: 'varPileType',
    default: '현장타설말뚝'
});

export const ConstructionMethod = atom({
    key: 'ConstructionMethod',
    default: '타격말뚝(타격 공법)'
});

export const HeadCondition = atom({
    key: 'HeadCondition',
    default: '강결'
});

export const BottomCondition = atom({
    key: 'BottomCondition',
    default: '자유'
});



/** Basic Section variables */
export const ConcreteModulus_Title = atom({
    key: 'ConcreteModulus_Title',
    default: '탄성계수 (N/mm²)'
});

export const Concrete_Title = atom({
    key: 'Concrete_Title',
    default: '콘크리트'
});

export const Steel_Title = atom({
    key: 'Steel_Title',
    default: '철근'
});

export const Concrete_Diameter = atom({
    key: 'Concrete_Diameter',
    default: 0
});

export const Concrete_Thickness = atom({
    key: 'Concrete_Thickness',
    default: 0
});

export const Concrete_Modulus = atom({
    key: 'Concrete_Modulus',
    default: 0
});

export const Steel_Diameter = atom({
    key: 'SteelCase_Diameter',
    default: 0
});

export const Steel_Thickness = atom({
    key: 'SteelCase_Thickness',
    default: 0
});

export const Steel_Modulus = atom({
    key: 'SteelCase_Modulus',
    default: 0
});

export const Steel_Dia_Title = atom({
    key: 'Steel_Dia_Names',
    default: '단면적 (cm²)'
});

export const Steel_Cor_Title = atom({
    key: 'Steel_Cor_Names',
    default: '부식대 (mm)'
});

export const Steel_Cor_Thickness = atom({
    key: 'Steel_Cor_Thickness',
    default: 0
});

/** Composite Section variables */
export const CompConcreteModulus_Title = atom<string>({
    key: 'CompConcreteModulus_Title',
    default: '탄성계수 (N/mm²)'
});

export const CompConcrete_Title = atom<any>({
    key: 'CompConcrete_Title',
    default: '콘크리트'
});

export const CompSteel_Title = atom<any>({
    key: 'CompSteel_Title',
    default: '철근'
});

export const CompConcrete_Diameter = atom({
    key: 'CompConcrete_Diameter',
    default: 0
});

export const CompConcrete_Thickness = atom({
    key: 'CompConcrete_Thickness',
    default: 0
});

export const CompConcrete_Modulus = atom({
    key: 'CompConcrete_Modulus',
    default: 0
});

export const CompSteel_Diameter = atom({
    key: 'CompSteelCase_Diameter',
    default: 0
});

export const CompSteel_Thickness = atom({
    key: 'CompSteelCase_Thickness',
    default: 0
});

export const CompSteel_Modulus = atom({
    key: 'CompSteelCase_Modulus',
    default: 0
});

export const CompSteel_Dia_Title = atom({
    key: 'CompSteel_Dia_Names',
    default: '단면적 (cm²)'
});

export const CompSteel_Cor_Title = atom({
    key: 'CompSteel_Cor_Names',
    default: '부식대 (mm)'
});

export const CompSteel_Cor_Thickness = atom({
    key: 'CompSteel_Corrthickness',
    default: 0
});



/** Pile Location variables */
export const Major_Ref_Value = atom({
    key: 'Major_Ref_Value',
    default: 1
});

export const Minor_Ref_Value = atom({
    key: 'Minor_Ref_Value',
    default: 1
});

export const Major_Start_Point = atom({
    key: 'Major_Start_Point',
    default: 0
});

export const Minor_Start_Point = atom({
    key: 'Minor_Start_Point',
    default: 0
});

export const Major_Space = atom<any>({
    key: 'Major_Space',
    default: ''
});

export const Major_Degree = atom({
    key : 'Major_Degree',
    default: ''
});

export const Minor_Degree = atom({
    key : 'Minor_Degree',
    default: ''
});

/**Reinforced variables */
export const ReinforcedMethod = atom({
    key: 'ReinforcedMethod',
    default: '피복'
});

export const ReinforcedStartLength = atom({
    key: 'ReinforcedStartLength',
    default: 0
});

export const ReinforcedEndLength = atom({
    key: 'ReinforcedEndLength',
    default: 0
});

export const OuterThickness = atom({
    key: 'OuterThickness',
    default: 0
});

export const OuterModulus = atom({
    key: 'OuterModulus',
    default: 0
});

export const InnerThickness = atom({
    key: 'InnerThickness',
    default: 0
});

export const InnerModulus = atom({
    key: 'InnerModulus',
    default: 0
});

export const InnerInputState = atom({
    key: 'InnerInputState',
    default: false
});

/** AddComposite variables */

export const CompositeTypeCheck = atom({
    key: 'isTabDisabled',
    default: false
});

export const CompPileType = atom({
    key: 'varCompPileType',
    default: '현장타설말뚝'
});

export const CompStartLength = atom({
    key: 'CompStartLength',
    default: 0
});

export const ChartDrawingData = atom({
    key: 'ChartDrawingData',
    default: [] as {}[]
});
export const TotalPileNum = atom({
    key: 'TotalPileNum',
    default: []
})
/** Pile Table variables */
export const PileTableData = atom({
    key: 'PileTableData',
    default: [] as {
        pileName: string, 
        pileLength : number, 
        pileType: string,  
        constructionMethod: string, 
        headCondition: string, 
        bottomCondition: string, 
        
        concreteDiameter: number, 
        concreteThickness: number, 
        concreteModulus: number, 
        steelDiameter: number, 
        steelThickness: number, 
        steelModulus: number, 
        steelCorThickness: number,

        compositeTypeCheck: boolean,
        compStartLength : number,
        
        compPileType: string, 
        compConcreteDiameter: number, 
        compConcreteThickness: number, 
        compConcreteModulus: number, 
        compSteelDiameter: number, 
        compSteelThickness: number, 
        compSteelModulus: number,
        compSteelCorThickness: number,

        reinforcedMethod: string,
        reinforcedStartLength: number,
        reinforcedEndLength: number,
        outerThickness: number,
        outerModulus: number,
        innerThickness: number,
        innerModulus: number,

        majorRefValue: number, 
        minorRefValue: number, 
        majorStartPoint: number, 
        minorStartPoint: number, 
        majorSpace: any
        majorDegree: any,
        minorDegree: any

        PileNums: number
    }[]    
});

export const SelectedRow = atom({
    key: 'SelectedRow',
    default: 0
});


/** Selector */
export const PileDataSelector = selector({
    key : 'PileDataSelector',
    get : ({get}) => {
        const pileName = get(PileName);
        const pileLength = get(PileLength);
        const pileType = get(PileType);
        const constructionMethod = get(ConstructionMethod);
        const headCondition = get(HeadCondition);
        const bottomCondition = get(BottomCondition);

        const concreteDiameter = get(Concrete_Diameter);
        const concreteThickness = get(Concrete_Thickness);
        const concreteModulus = get(Concrete_Modulus);
        const steelDiameter = get(Steel_Diameter);
        const steelThickness = get(Steel_Thickness);
        const steelModulus = get(Steel_Modulus);
        const steelCorThickness = get(Steel_Cor_Thickness);

        const compositeTypeCheck = get(CompositeTypeCheck);
        const compStartLength = get(CompStartLength);

        const compPileType = get(CompPileType);
        const compConcreteDiameter = get(CompConcrete_Diameter);
        const compConcreteThickness = get(CompConcrete_Thickness);
        const compConcreteModulus = get(CompConcrete_Modulus);
        const compSteelDiameter = get(CompSteel_Diameter);
        const compSteelThickness = get(CompSteel_Thickness);
        const compSteelModulus = get(CompSteel_Modulus);
        const compSteelCorThickness = get(CompSteel_Cor_Thickness);

        const reinforcedMethod = get(ReinforcedMethod);
        const reinforcedStartLength = get(ReinforcedStartLength);
        const reinforcedEndLength = get(ReinforcedEndLength);
        const outerThickness = get(OuterThickness);
        const outerModulus = get(OuterModulus);
        const innerThickness = get(InnerThickness);
        const innerModulus = get(InnerModulus);

        const majorRefValue = get(Major_Ref_Value);
        const minorRefValue = get(Minor_Ref_Value);
        const majorStartPoint = get(Major_Start_Point);
        const minorStartPoint = get(Minor_Start_Point);
        const majorSpace = get(Major_Space);
        const majorDegree = get(Major_Degree);
        const minorDegree = get(Minor_Degree);
        
        const forcePointX = get(Force_Point_X);
        const forcePointY = get(Force_Point_Y);
        let PileNums = 0
        if (majorSpace == '' || majorSpace == '0')
            PileNums = 1
        else
            PileNums = (ExtractNumbers(majorSpace)).length + 1
        
        return {
            pileName,
            pileLength,
            pileType,
            constructionMethod,
            headCondition,
            bottomCondition,

            concreteDiameter,
            concreteThickness,
            concreteModulus,
            steelDiameter,
            steelThickness,
            steelModulus,
            steelCorThickness, 
            
            compositeTypeCheck,
            compStartLength,
            
            compPileType,
            compConcreteDiameter,
            compConcreteThickness,
            compConcreteModulus,
            compSteelDiameter,
            compSteelThickness,
            compSteelModulus, 
            compSteelCorThickness, 

            reinforcedMethod,
            reinforcedStartLength,
            reinforcedEndLength,
            outerThickness,
            outerModulus,
            innerThickness,
            innerModulus,

            majorRefValue,
            minorRefValue,
            majorStartPoint,
            minorStartPoint,
            majorSpace,
            majorDegree,
            minorDegree,
            
            PileNums,

            forcePointX,
            forcePointY
        }
    }
})

/** Soil Data Variables */
interface Row {
    id: number;
    LayerNo : number;
    LayerType : string;
    LayerDepth : number;
    Depth : number;
    AvgNValue : number;
    // c : number;
    // pi : number;
    gamma : number;
    aE0 : number;
    aE0_Seis : number;
    vd : number;
    Vsi : number;
    ED : number;
    DE : number;
    Length : number;
}

export const SoilData = atom({
    key: 'SoilData',
    default: [{ id: 1, 
        LayerNo: 1, 
        LayerType: '점성토', 
        LayerDepth : 0, 
        Depth : 10,
        AvgNValue : 10, 
        // c : 0, 
        // pi : 0, 
        gamma : 18, 
        aE0 : 14000, 
        aE0_Seis : 28000, 
        vd : 0.5, 
        Vsi : 0, 
        ED : 0, 
        DE : 1, 
        Length : 1 }] as Row[]
});

/** Soil Settings option */
export const CalVsiState = atom({
    key: 'CalVsiState',
    default: false
});

export const LiquefactionState = atom({
    key: 'LiquefactionState',
    default: false
});

export const SlopeEffectState = atom({
    key: 'SlopeEffectState',
    default: false
});

export const GroupEffectState = atom({
    key: 'GroupEffectState',
    default: false
});

export const GroupEffectValue = atom({
    key: 'GroupEffectValue',
    default: 1
});

/**Soil Properties option */
export const GroundLevel = atom({
    key: 'GroundLevel',
    default: 0
});

export const Waterlevel = atom({
    key: 'Waterlevel',
    default: 0
});

export const DownloadData = selector({
    key : 'DownLoadData',
    get : ({get}) => {
        const projectName = get(ProjectName);
        const piletableData = get(PileTableData);
        const soilData = get(SoilData);
        const topLevel = get(TopLevel);
        const groundLevel = get(GroundLevel);
        const waterlevel = get(Waterlevel);
        const groupEffectValue = get(GroupEffectValue);
        const slopeEffectState = get(SlopeEffectState);
        const foundationWidth = get(FoundationWidth);
        const sideLength = get(SideLength);
        const liquefactionState = get(LiquefactionState);
        const calVsiState = get(CalVsiState);
        const groupEffectState = get(GroupEffectState);
        const forcepointX = get(Force_Point_X);
        const forcepointY = get(Force_Point_Y);
        return {projectName, piletableData, soilData, topLevel, groundLevel, waterlevel, groupEffectValue, slopeEffectState, foundationWidth, sideLength, liquefactionState, calVsiState, groupEffectState, forcepointX, forcepointY}
    }
})

interface ExcelTableRow {
    id : number;
    SheetName: string;
    AreaName: string;
    CellName: string;
    LinkedData : string;
    Value : any;
}

export const ExcelData = atom({
    key: 'ExcelData',
    default: [] as ExcelTableRow[]
});

export const ReportJsonResult = atom({
    key: 'ReportJsonResult',
    default: {} as any
});


export const Beta_Normal_Result = atom({
    key: 'Cal_Beta_Normal',
    default: [] as any
});

export const Beta_Seismic_Result = atom({
    key: 'Cal_Beta_Normal',
    default: [] as any
});

export const Beta_Period_Result = atom({
    key: 'Cal_Beta_Normal',
    default: [] as any
});

export const AlphaHTheta_Result = atom({
    key: 'AlphaHTheta_Result',
    default: [] as any
});

export const KValue_Normal_Result = atom({
    key: 'KValue_Result_Normal',
    default: [] as any
});

export const KValue_Seismic_Result = atom({
    key: 'KValue_Result_Seismic',
    default: [] as any
});

export const KValue_Seismic_liq_Result = atom({
    key: 'KValue_Result_Seismic_liq',
    default: [] as any
});
export const KValue_Period_Result = atom({
    key: 'KValue_Result_Period',
    default: [] as any
});

export const Langauge = atom({
    key: 'Langauge',
    default: 'kr'
})

export const ImportType = atom({
    key: 'ImportType',
    default: 'Type1'
})

export const Matrix_Normal_X_Result = atom({
    key: 'Matrix_Normal_X_Result',
    default: [] as any
})

export const Matrix_Normal_Z_Result = atom({
    key: 'Matrix_Normal_Z_Result',
    default: [] as any
})

export const Matrix_Seismic_X_Result = atom({
    key: 'Matrix_Seismic_X_Result',
    default: [] as any
})

export const Matrix_Seismic_Z_Result = atom({
    key: 'Matrix_Seismic_Z_Result',
    default: [] as any
})

export const Matrix_Seismic_Liq_X_Result = atom({
    key: 'Matrix_Seismic_Liq_X_Result',
    default: [] as any
})

export const Matrix_Seismic_Liq_Z_Result = atom({
    key: 'Matrix_Seismic_Liq_Z_Result',
    default: [] as any
})

export const Matrix_Period_X_Result = atom({
    key: 'Matrix_Period_X_Result',
    default: [] as any
})

export const Matrix_Period_Z_Result = atom({
    key: 'Matrix_Period_Z_Result',
    default: [] as any
})

