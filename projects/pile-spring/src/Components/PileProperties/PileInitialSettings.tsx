import {GuideBox, 
    TemplatesDualComponentsTypographyTextFieldSpaceBetween,
} from '@midasit-dev/moaui';
import TypoGraphyDropList from '../NewComponents/TrypoGraphyDropList';
import {useRecoilState, useRecoilValue, useResetRecoilState} from 'recoil';
import {
    PileName, PileType, PileLength, ConstructionMethod, HeadCondition, BottomCondition, Steel_Dia_Title, Steel_Cor_Title, Steel_Title, Concrete_Title, ConcreteModulus_Title,
    Concrete_Diameter,Concrete_Thickness, Concrete_Modulus, Steel_Diameter, Steel_Thickness, Steel_Modulus, Steel_Cor_Thickness, Langauge
} from '../variables';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

function PileInitialSettings(){
    const { t:translate, i18n: internationalization} = useTranslation();

    const language = useRecoilValue(Langauge)
    const [ListPileType, setListPileType] = useState<any>([])
    const [ListConstructionMethod, setListConstructionMethod ]= useState<any>([])
    const [ListHeadCondition, setListHeadCondition] = useState<any>([])
    const [ListBottomCondition, setListBottomCondition] = useState<any>([])

    const [pileName, setpileName] = useRecoilState(PileName);
    const [pileLengh, setpileLength] = useRecoilState(PileLength);
    const [steelDiaTitle, setSteelDiaTitle] = useRecoilState(Steel_Dia_Title);
    const [pileType, setpileType] = useRecoilState(PileType);
    const [constructionMethod, setconstructionMethod] = useRecoilState(ConstructionMethod);
    const [headCondition, setheadCondition] = useRecoilState(HeadCondition);
    const [bottomCondition, setbottomCondition] = useRecoilState(BottomCondition);
    const [steelCorTitle, setSteelCorTitle] = useRecoilState(Steel_Cor_Title);
    const [steelTitle, setSteelTitle] = useRecoilState(Steel_Title);
    const [concreteTitle, setConcreteTitle] = useRecoilState(Concrete_Title);
    const [concreteModulusTitle, setConcreteModulusTitle] = useRecoilState(ConcreteModulus_Title);
    

    const ResetConcreteDiameter = useResetRecoilState(Concrete_Diameter)
    const ResetConcreteThickness = useResetRecoilState(Concrete_Thickness)
    const ResetConcreteModulus = useResetRecoilState(Concrete_Modulus)
    const ResetSteelDiameter = useResetRecoilState(Steel_Diameter)
    const ResetSteelThickness = useResetRecoilState(Steel_Thickness)
    const ResetSteelModulus = useResetRecoilState(Steel_Modulus)
    const ResetSteelCorThickness = useResetRecoilState(Steel_Cor_Thickness)


    
    const handlePileLengthChange = (e:any) => {
        const inputValue = e.target.value;
        if (!Number.isNaN(Number(inputValue))){
            setpileLength(e.target.value);
        }
        else{
            setpileLength(0);
        }
    }
    
    const handlepileTypeChange = (e:any) => {
        setpileType(e.target.value);
        titleChange(e.target.value)

        ResetConcreteDiameter()
        ResetConcreteThickness()
        ResetConcreteModulus()
        ResetSteelDiameter()
        ResetSteelThickness()
        ResetSteelModulus()
        ResetSteelCorThickness()

    }

    const titleChange = (e:any) =>{
        // 철근 타이틀 : 현장타설말뚝, PHC 말뚝일 경우에는 단면적, 그 외에는 직경
        if (e === '현장타설말뚝' || e=== 'PHC말뚝'){
            setSteelDiaTitle(translate('Basic_Steel_Diamter_Case1'))
        }
        else{
            setSteelDiaTitle(translate('Basic_Steel_Diamter_Case2'))
        }
        
        
        if (e=== 'PHC말뚝'){
            setSteelCorTitle(translate('Basic_Steel_Cor_Case1'))
        }
        else{
            setSteelCorTitle(translate('Basic_Steel_Cor_Case2'))
        }
        // Concrete Title 변경
        // 강관 말뚝, 소일시멘트 말뚝일 경우 소일시멘트, 그 외 콘크리트
        if (e === '강관말뚝' || e === '소일시멘트말뚝'){
            setConcreteTitle(translate('Basic_Concrete_Title_Case2'))
        }
        else{
            setConcreteTitle(translate('Basic_Cocncrete_Title_Case1'))
        }
        // Steel Title 변경
        // 현장타설 말뚝일 경우 철근, PHC 말뚝일경우 PC 강재, 그 외 강관
        if (e === '현장타설말뚝'){
            setSteelTitle(translate('Basic_Steel_Title_Case1'))
        }
        else if (e === 'PHC말뚝'){
            setSteelTitle(translate('Basic_Steel_Title_Case3'))
        }
        else {
            setSteelTitle(translate('Basic_Steel_Title_Case2'))
        }

        // 말뚝 타입이 소일시멘트 말뚝의 경우 콘크리트 탄성계수를 변형계수로 출력
        if (e === '소일시멘트말뚝'){
            setConcreteModulusTitle(translate('Basic_Concrete_Modulus_Case2'))
        }
        else{
            setConcreteModulusTitle(translate('Basic_Concrete_Modulus_Case1'))
        }
    }

    useEffect(() => {
        titleChange(pileType)
        setListPileType(
            [
                [translate('Cast_In_Situ'), '현장타설말뚝'],
                [translate('PHC_Pile'), 'PHC말뚝'],
                [translate('SC_Pile'), 'SC말뚝'],
                [translate('Steel_Pile'), '강관말뚝'],
                [translate('Soil_Cement_Pile'), '소일시멘트말뚝']
            ]
            )
    
            setListHeadCondition(
                [
                    [translate('Head_Condition_Fixed'), '강결'],
                    [translate('Head_Condition_Hinge'), '힌지']
                ]
            )

            setListConstructionMethod(
                [
                    [translate('CM_DropHammer'), '타격말뚝(타격 공법)'],
                    [translate('CM_VibroHammer'), '타격말뚝(바이브러 해머공법)'],
                    [translate('CM_InSitu'), '현장타설말뚝'],
                    [translate('CM_Boring'), '중굴착 말뚝'],
                    [translate('CM_Preboring'), 'preboring 말뚝'],
                    [translate('CM_SoilCement'), '강관 소일시멘트 말뚝'],
                    [translate('CM_Rotate'), '회전말뚝']
                ]
            )

            setListBottomCondition(
                [
                    [translate('Bottom_Condition_Free'), '자유'],
                    [translate('Bottom_Condition_Hinge'), '힌지'],
                    [translate('Bottom_Condition_Fixed'), '고정']
                ]
            )
    },)

        return(
            <GuideBox>
                <TemplatesDualComponentsTypographyTextFieldSpaceBetween
                    title = {translate('Pile_Name')}
                    width = {300}
                    textFieldWidth = {180}
                    placeholder = ''
                    value = {pileName}
                    onChange = {(e:any) => {setpileName(e.target.value);}}/>
                <TemplatesDualComponentsTypographyTextFieldSpaceBetween
                title = {translate('Pile_Length')}
                width = {300}
                textFieldWidth = {180}
                placeholder = ''
                value = {pileLengh}
                onChange = {handlePileLengthChange}/>
                <TypoGraphyDropList
                    title = {translate('Pile_Type')}
                    width = {300}
                    dropListWidth = {180}
                    items = {ListPileType}
                    value = {pileType}
                    onChange = {handlepileTypeChange}/>       
                <TypoGraphyDropList
                    padding = {1}
                    title = {translate('Construction_Method')}
                    width = {300}
                    dropListWidth = {180}
                    items = {ListConstructionMethod}
                    value = {constructionMethod}
                    onChange = {(e:any) => {setconstructionMethod(e.target.value);}}/>
                <TypoGraphyDropList
                    padding = {1}
                    title = {translate('Head_Condition')}
                    width = {300}
                    dropListWidth = {180}
                    items = {ListHeadCondition}
                    value = {headCondition}
                    onChange = {(e:any) => {setheadCondition(e.target.value);}}/>
                <TypoGraphyDropList
                    padding = {1}
                    title = {translate('Bottom_Condition')}
                    width = {300}
                    dropListWidth = {180}
                    items = {ListBottomCondition}
                    value = {bottomCondition}
                    onChange = {(e:any) => {setbottomCondition(e.target.value);}}/>
            </GuideBox>
        );
    };
    
    export default PileInitialSettings
    