
import { useState, useEffect } from 'react';
import {useRecoilState, useRecoilValue, useResetRecoilState} from 'recoil';
import {GuideBox, 
    Typography,

} from '@midasit-dev/moaui';
import TypoGraphyDropList from '../NewComponents/TrypoGraphyDropList';
import TypoGraphyTextField from '../NewComponents/TypoGraphyTextField';
import {
    CompositeTypeCheck, CompPileType, CompStartLength,
    CompConcrete_Diameter, CompConcrete_Thickness, CompConcrete_Modulus, CompSteel_Diameter, CompSteel_Thickness, CompSteel_Modulus, CompSteel_Cor_Thickness,
    CompSteel_Dia_Title, CompSteel_Cor_Title, CompSteel_Title, CompConcrete_Title, CompConcreteModulus_Title,
} from '../variables';
import { useTranslation } from 'react-i18next';

function AddComposites(){
    // 언어팩 적용 함수
    const { t:translate, i18n: internationalization} = useTranslation();
    const [CompListPileType, setCompListPileType] = useState<any>([])
    

    // 하부말뚝설정 변수
    const compositePileTypeCheck = useRecoilValue(CompositeTypeCheck);
    
    const [compPileType, setCompPileType] = useRecoilState(CompPileType)

    const [compSteelDiaTitle, setCompSteelDiaTitle] = useRecoilState(CompSteel_Dia_Title)
    const [compSteelCorThickness, setCompSteelCorThickness] = useRecoilState(CompSteel_Cor_Thickness)
    const [compSteelCorTitle, setCompSteelCorTitle] = useRecoilState(CompSteel_Cor_Title)
    const [compSteelTitle, setCompSteelTitle] = useRecoilState(CompSteel_Title)
    const [compConcreteTitle, setCompConcreteTitle] = useRecoilState(CompConcrete_Title)
    const [compConcreteModulusTitle, setCompConcreteModulusTitle] = useRecoilState(CompConcreteModulus_Title)

    const [compStartLength, setCompStartLength] = useRecoilState(CompStartLength)

    const ResetCompConcreteDiameter = useResetRecoilState(CompConcrete_Diameter)
    const ResetCompConcreteThickness = useResetRecoilState(CompConcrete_Thickness)
    const ResetCompConcreteModulus = useResetRecoilState(CompConcrete_Modulus)
    const ResetCompSteelDiameter = useResetRecoilState(CompSteel_Diameter)
    const ResetCompSteelThickness = useResetRecoilState(CompSteel_Thickness)
    const ResetCompSteelModulus = useResetRecoilState(CompSteel_Modulus)
    const ResetCompSteelCorThickness = useResetRecoilState(CompSteel_Cor_Thickness)

    // 말뚝 종류에 따른 Title 수정
    const handleCompPileTypeChange = (e:any) => {
        setCompPileType(e.target.value);
        titleChange(e.target.value);
        
        ResetCompConcreteDiameter()
        ResetCompConcreteThickness()
        ResetCompConcreteModulus()
        ResetCompSteelDiameter()
        ResetCompSteelThickness()
        ResetCompSteelModulus()
        ResetCompSteelCorThickness()
    }
    
    const titleChange = (e:any) => {
        // 철근 타이틀 : 현장타설말뚝, PHC 말뚝일 경우에는 단면적, 그 외에는 직경
        // 08.
        if (e === 'Cast_In_Situ' || e=== 'PHC_Pile'){
            setCompSteelDiaTitle(translate('Composite_Steel_Diamter_Case1'))
        }
        else{
            setCompSteelDiaTitle(translate('Composite_Steel_Diamter_Case2'))
        }
        
        
        if (e=== 'PHC_Pile'){
            setCompSteelCorTitle(translate('Composite_Steel_Cor_Case1'))
        }
        else{
            setCompSteelCorTitle(translate('Composite_Steel_Cor_Case2'))
        }
        // Concrete Title 변경
        // 강관 말뚝, 소일시멘트 말뚝일 경우 소일시멘트, 그 외 콘크리트
        if (e === 'Steel_Pile' || e === 'Soil_Cement_Pile'){
            setCompConcreteTitle(translate('Composite_Concrete_Title_Case2'))
        }
        else{
            setCompConcreteTitle(translate('Composite_Concrete_Title_Case1'))
        }
        // Steel Title 변경
        // 현장타설 말뚝일 경우 철근, PHC 말뚝일경우 PC 강재, 그 외 강관
        if (e === 'Cast_In_Situ'){
            setCompSteelTitle(translate('Composite_Steel_Title_Case1'))
        }
        else if (e === 'PHC_Pile'){
            setCompSteelTitle(translate('Composite_Steel_Title_Case3'))
        }
        else {
            setCompSteelTitle(translate('Composite_Steel_Title_Case2'))
        }
        // 말뚝 타입이 소일시멘트 말뚝의 경우 콘크리트 탄성계수를 변형계수로 출력
        if (e === 'Soil_Cement_Pile'){
            setCompConcreteModulusTitle(translate('Composite_Concrete_Modulus_Case2'))
        }
        else{
            setCompConcreteModulusTitle(translate('Composite_Concrete_Modulus_Case1'))
        }
    }

    useEffect(() => {
        titleChange(compPileType)
        setCompListPileType(
            [
                [translate('Cast_In_Situ'), 'Cast_In_Situ'],
                [translate('PHC_Pile'), 'PHC_Pile'],
                [translate('SC_Pile'), 'SC_Pile'],
                [translate('Steel_Pile'), 'Steel_Pile'],
                [translate('Soil_Cement_Pile'), 'Soil_Cement_Pile']
            ]
        )
    },)

    const handleCompStartLengthChange = (e:any) => {
        const inputValue = e.target.value;
        if (!Number.isNaN(Number(inputValue))){
            setCompStartLength(e.target.value);
        }
        else{
            setCompStartLength(0);
        }
        
    }

    return(
        <GuideBox>
            <TypoGraphyDropList 
                title = {translate('Comp_Pile_Type')}
                width = {300}
                dropListWidth = {180}
                items = {CompListPileType}
                value = {compPileType}
                disabled = {compositePileTypeCheck}
                onChange = {handleCompPileTypeChange}
            />
            <TypoGraphyTextField 
                title = {translate('Comp_Pile_Length')}
                placeholder = ''
                disabled = {!compositePileTypeCheck}
                value = {compStartLength.toString()}
                onChange = {handleCompStartLengthChange}
                width = {300}
                textFieldWidth = {180}
            />
            <GuideBox width={300} horRight>
                <Typography> {translate('Comp_Guide_Words')} </Typography>
            </GuideBox>
        </GuideBox>

    );
}

export default AddComposites