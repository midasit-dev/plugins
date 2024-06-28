import { useEffect } from 'react';
import { useState } from 'react';
import {GuideBox, 
    Typography,
    Panel,
    Check,
    Button,
    TextFieldV2,
    DropList
} from '@midasit-dev/moaui';
import PopupButtonComponent from '../NewComponents/PopupButtonComponent';
import PileInitialSettings from './PileInitialSettings';
import PileSections from './PileSections';
import AddComposites from './AddComposites';
import PileChart from '../Chart/PileChart';
import PileLocation from './PileLocation';
import PileTable from './PileTable'
import TypoGraphyTextField from '../NewComponents/TypoGraphyTextField';
import {useRecoilState, useRecoilValue, useResetRecoilState} from 'recoil';
import { useSnackbar } from 'notistack';
import {  ProjectName, FoundationWidth, SideLength,
    PileName, PileType, PileLength, ConstructionMethod, HeadCondition, BottomCondition, Steel_Dia_Title, Steel_Cor_Title, Steel_Title, ConcreteModulus_Title,
    CompositeTypeCheck, CompPileType, CompStartLength,
    Concrete_Diameter,Concrete_Thickness, Concrete_Modulus, Steel_Diameter, Steel_Thickness, Steel_Modulus, Steel_Cor_Thickness,
    CompConcrete_Diameter, CompConcrete_Thickness, CompConcrete_Modulus, CompSteel_Diameter, CompSteel_Thickness, CompSteel_Modulus, CompSteel_Cor_Thickness,
    ReinforcedMethod, ReinforcedStartLength, ReinforcedEndLength, OuterThickness, OuterModulus, InnerThickness, InnerModulus, InnerInputState,
    Major_Start_Point, Minor_Start_Point, Major_Space, Major_Degree, Minor_Degree,
    PileTableData, PileDataSelector, SelectedRow, TopLevel, Force_Point_X, Force_Point_Y, Langauge

} from '../variables';
import { CalculatePileCenterCoordinates, CalculatePileDegree, ExtractNumbers} from '../../utils_pyscript';
import { TextField } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { use } from 'i18next';

function PileProperties(){

    // 언어팩 변수
    const { t:translate, i18n: internationalization} = useTranslation();
    const [language, setLanguage] = useRecoilState(Langauge)

    const LanguageList:any = [
        ['kr', 'kr'],
        ['jp', 'jp'],
    ]

    const handleLanguageChange = (e:any) => {
        setLanguage(e.target.value)
        internationalization.changeLanguage(e.target.value);
    }

    useEffect(() => {
        internationalization.changeLanguage(language);
    }
    , [language])

    const { enqueueSnackbar } = useSnackbar();

    // Recoil 변수
    const pileName = useRecoilValue(PileName)
    const pileLength = useRecoilValue(PileLength)
    const pileType = useRecoilValue(PileType)

    const compPileType = useRecoilValue(CompPileType)
    const compStartLength = useRecoilValue(CompStartLength)

    const concreteDiameter = useRecoilValue(Concrete_Diameter)
    const concreteThickness = useRecoilValue(Concrete_Thickness)
    const concreteModulus = useRecoilValue(Concrete_Modulus)
    const steelDiameter = useRecoilValue(Steel_Diameter)
    const steelThickness = useRecoilValue(Steel_Thickness)
    const steelModulus = useRecoilValue(Steel_Modulus)
    const steelCorThickness = useRecoilValue(Steel_Cor_Thickness)

    const compConcreteDiameter = useRecoilValue(CompConcrete_Diameter)
    const compConcreteThickness = useRecoilValue(CompConcrete_Thickness)
    const compConcreteModulus = useRecoilValue(CompConcrete_Modulus)
    const compSteelDiameter = useRecoilValue(CompSteel_Diameter)
    const compSteelThickness = useRecoilValue(CompSteel_Thickness)
    const compSteelModulus = useRecoilValue(CompSteel_Modulus)
    const compSteelCorThickness = useRecoilValue(CompSteel_Cor_Thickness)

    const reinforcedStartLength = useRecoilValue(ReinforcedStartLength)
    const reinforcedEndLength = useRecoilValue(ReinforcedEndLength)
    const outerThickness = useRecoilValue(OuterThickness)
    const outerMoudlus = useRecoilValue(OuterModulus)
    const innerThickness = useRecoilValue(InnerThickness)
    const innerMoudlus = useRecoilValue(InnerModulus)
    const innerInputState = useRecoilValue(InnerInputState)

    const majorStartPoint = useRecoilValue(Major_Start_Point)
    const minorStartPoint = useRecoilValue(Minor_Start_Point)
    const majorSpace = useRecoilValue(Major_Space)
    const majorDegree = useRecoilValue(Major_Degree)
    const minorDegree = useRecoilValue(Minor_Degree)
    
    // Recoil 변수 초기화
    const ResetPileName = useResetRecoilState(PileName)
    const ResetPileLength = useResetRecoilState(PileLength)
    const ResetPileType = useResetRecoilState(PileType)
    const ResetConstructionMethod = useResetRecoilState(ConstructionMethod)
    const ResetHeadCondition = useResetRecoilState(HeadCondition)
    const ResetBottomCondition = useResetRecoilState(BottomCondition)
    const ResetSteelDiaTitle = useResetRecoilState(Steel_Dia_Title)
    const ResetSteelCorTitle = useResetRecoilState(Steel_Cor_Title)
    const ResetSteelTitle = useResetRecoilState(Steel_Title)
    const ResetConcreteModulusTitle = useResetRecoilState(ConcreteModulus_Title)

    const ResetConcreteDiameter = useResetRecoilState(Concrete_Diameter)
    const ResetConcreteThickness = useResetRecoilState(Concrete_Thickness)
    const ResetConcreteModulus = useResetRecoilState(Concrete_Modulus)
    const ResetSteelDiameter = useResetRecoilState(Steel_Diameter)
    const ResetSteelThickness = useResetRecoilState(Steel_Thickness)
    const ResetSteelModulus = useResetRecoilState(Steel_Modulus)
    const ResetSteelCorThickness = useResetRecoilState(Steel_Cor_Thickness)

    const ResetCompositeTypeCheck = useResetRecoilState(CompositeTypeCheck)
    const ResetCompPileType = useResetRecoilState(CompPileType)
    const ResetCompStartLength = useResetRecoilState(CompStartLength)

    const ResetCompConcreteDiameter = useResetRecoilState(CompConcrete_Diameter)
    const ResetCompConcreteThickness = useResetRecoilState(CompConcrete_Thickness)
    const ResetCompConcreteModulus = useResetRecoilState(CompConcrete_Modulus)
    const ResetCompSteelDiameter = useResetRecoilState(CompSteel_Diameter)
    const ResetCompSteelThickness = useResetRecoilState(CompSteel_Thickness)
    const ResetCompSteelModulus = useResetRecoilState(CompSteel_Modulus)
    const ResetCompSteelCorThickness = useResetRecoilState(CompSteel_Cor_Thickness)

    const ResetReinforcedMethod = useResetRecoilState(ReinforcedMethod)
    const ResetReinforcedStartLength = useResetRecoilState(ReinforcedStartLength)
    const ResetReinforcedEndLength = useResetRecoilState(ReinforcedEndLength)
    const ResetOuterThickness = useResetRecoilState(OuterThickness)
    const ResetOuterModulus = useResetRecoilState(OuterModulus)
    const ResetInnerThickness = useResetRecoilState(InnerThickness)
    const ResetInnerModulus = useResetRecoilState(InnerModulus)
    const ResetInnerInputState = useResetRecoilState(InnerInputState)

    const ResetMajorStartPoint = useResetRecoilState(Major_Start_Point)
    const ResetMinorStartPoint = useResetRecoilState(Minor_Start_Point)
    const ResetMajorSpace = useResetRecoilState(Major_Space)
    const ResetMajorDegree = useResetRecoilState(Major_Degree)
    const ResetMinorDegree = useResetRecoilState(Minor_Degree)

    // 말뚝정보 변수
    const [projectName, setProjectName] = useRecoilState(ProjectName)
    const [foundationWidth, setFoundationWidth] = useRecoilState(FoundationWidth)
    const [sideLength, setSideLength] = useRecoilState(SideLength)
    const [toplevel, setTopLevel] = useRecoilState(TopLevel)
    const [force_Point_X, setForce_Point_X] = useRecoilState(Force_Point_X)
    const [force_Point_Y, setForce_Point_Y] = useRecoilState(Force_Point_Y)

    // 하부말뚝설정 변수
    const [compositeTypeCheck, setCopositeTypeCheck] = useRecoilState(CompositeTypeCheck);
    const handleCompositePileType = (e:any) => {
        setCopositeTypeCheck(e.target.checked);
        if (e.target.checked === false){
            ResetCompPileType()
            ResetCompStartLength()
            ResetCompConcreteDiameter()
            ResetCompConcreteThickness()
            ResetCompConcreteModulus()
            ResetCompSteelDiameter()
            ResetCompSteelThickness()
            ResetCompSteelModulus()
            ResetCompSteelCorThickness()
        }
    }

    // PileTable 변수
    const [selectedRow, setSelectedRow] = useRecoilState(SelectedRow)
    const [pileTableData, setPileTableData] = useRecoilState(PileTableData)
    
    // 입력된 모든 값들을 Selector로 가져옴, pileTableData에 저장함
    const pileData = useRecoilValue(PileDataSelector)
    
    // 말뚝 배치도 출력 함수
    const [openRight, setOpenRight] = useState(false);
    const popupRightProps = {
        show: true,
        fill: '1',
        x: 350,
        y: 0,
        width: 250,
        height: 500,
    }
    
    //ErrorCheck
    const ErrorCheck = () => {
        
        // 말둑 기본설정
        if (pileName === ''){
            enqueueSnackbar(translate('Error_PileName'), {variant: 'error',autoHideDuration: 3000})
            return true
        }

        if (pileLength <= 0 ){
            enqueueSnackbar(translate('Error_PileLength'), {variant: 'error', autoHideDuration: 3000})
            return true
        }
        // 하부 말뚝 설정
        if (compositeTypeCheck == true){
            if (Number(compStartLength) < 0){
                enqueueSnackbar(translate('Error_CompStartLength'), {variant: 'error', autoHideDuration: 3000})
                return true
            }
            if (Number(compStartLength) > Number(pileLength)){
                enqueueSnackbar(translate('Error_CompStartLength2'), {variant: 'error', autoHideDuration: 3000})
                return true
            }
        }

        //기본 말뚝 단면
        if (pileType === '현장타설말뚝'){
            if (Number(concreteDiameter) <= 0){
                enqueueSnackbar(translate('Error_Concrete_Diameter'), {variant: 'error', autoHideDuration: 3000})
                return true
            }
            if (Number(concreteModulus) <= 0){
                enqueueSnackbar(translate('Error_Concrete_Modulus'), {variant: 'error', autoHideDuration: 3000})
                return true
            }
            if (Number(steelDiameter) <= 0){
                enqueueSnackbar(translate('Error_Steel_Diameter'), {variant: 'error', autoHideDuration: 3000})
                return true
            }
            if (Number(steelModulus) <= 0){
                enqueueSnackbar(translate('Error_Steel_Modulus'), {variant: 'error', autoHideDuration: 3000})
                return true
            }
        }
        
        if (pileType === 'PHC말뚝'){
            if (Number(concreteDiameter) <= 0){
                enqueueSnackbar(translate('Error_Concrete_Diameter'), {variant: 'error', autoHideDuration: 3000})
                return true
            }
            if (Number(concreteThickness) <= 0){
                enqueueSnackbar(translate('Error_Concrete_Thickness'), {variant: 'error', autoHideDuration: 3000})
                return true
            }
            if (Number(concreteModulus) <= 0){
                enqueueSnackbar(translate('Error_Concrete_Modulus'), {variant: 'error', autoHideDuration: 3000})
                return true
            }
            if (Number(steelDiameter) <= 0){
                enqueueSnackbar(translate('Error_PC_Steel_Area'), {variant: 'error', autoHideDuration: 3000})
                return true
            }
            if (Number(steelModulus )<= 0){
                enqueueSnackbar(translate('Error_PC_Steel_Modulus'), {variant: 'error', autoHideDuration: 3000})
                return true
            }
            if (Number(steelCorThickness) < 0){
                enqueueSnackbar(translate('Error_PC_Steel_Cor'), {variant: 'error', autoHideDuration: 3000})
                return true
            }
        }

        if (pileType === 'SC말뚝'){
            if (Number(concreteDiameter) <= 0){
                enqueueSnackbar(translate('Error_Concrete_Diameter'), {variant: 'error', autoHideDuration: 3000})
                return true
            }
            if (Number(concreteThickness) <= 0){
                enqueueSnackbar(translate('Error_Concrete_Thickness'), {variant: 'error', autoHideDuration: 3000})
                return true
            }
            if (Number(concreteModulus) <= 0){
                enqueueSnackbar(translate('Error_Concrete_Modulus'), {variant: 'error', autoHideDuration: 3000})
                return true
            }
            if (Number(steelThickness) <= 0){
                enqueueSnackbar(translate('Error_Pipe_Thickness'), {variant: 'error', autoHideDuration: 3000})
                return true
            }
            if (Number(steelModulus) <= 0){
                enqueueSnackbar(translate('Error_Pipe_Modulus'), {variant: 'error', autoHideDuration: 3000})
                return true
            }
            if (Number(steelCorThickness) < 0){
                enqueueSnackbar(translate('Error_Pipe_Cor'), {variant: 'error', autoHideDuration: 3000})
                return true
            }
        }
        
        if (pileType === '강관말뚝'){
            if (Number(steelDiameter) <= 0){
                enqueueSnackbar(translate('Error_Pipe_Diameter'), {variant: 'error', autoHideDuration: 3000})
                return true
            }
            if (Number(steelThickness) <= 0){
                enqueueSnackbar(translate('Error_Pipe_Thickness'), {variant: 'error', autoHideDuration: 3000})
                return true
            }
            if (Number(steelModulus) <= 0){
                enqueueSnackbar(translate('Error_Pipe_Modulus'), {variant: 'error', autoHideDuration: 3000})
                return true
            }
            if (Number(steelCorThickness) < 0){
                enqueueSnackbar(translate('Error_Pipe_Cor'), {variant: 'error', autoHideDuration: 3000})
                return true
            }
        }

        if (pileType === '소일시멘트말뚝'){
            if (Number(concreteDiameter) <= 0){
                enqueueSnackbar(translate('Error_SoilCement_Diameter'), {variant: 'error', autoHideDuration: 3000})
                return true
            }
            if (Number(concreteModulus) <= 0){
                enqueueSnackbar(translate('Error_SoilCement_Modulus'), {variant: 'error', autoHideDuration: 3000})
                return true
            }
            if (Number(steelDiameter) <= 0){
                enqueueSnackbar(translate('Error_Pipe_Diameter'), {variant: 'error', autoHideDuration: 3000})
                return true
            }
            if (Number(steelThickness) <= 0){
                enqueueSnackbar(translate('Error_Pipe_Thickness'), {variant: 'error', autoHideDuration: 3000})
                return true
            }
            if (Number(steelModulus) <= 0){
                enqueueSnackbar(translate('Error_Pipe_Modulus'), {variant: 'error', autoHideDuration: 3000})
                return true
            }
            if (Number(steelCorThickness) < 0){
                enqueueSnackbar(translate('Error_Pipe_Cor'), {variant: 'error', autoHideDuration: 3000})
                return true
            }
        }
        
        if (isNaN(concreteModulus)){
            enqueueSnackbar(translate('Error_Concrete_Modulus_isNum'), {variant: 'error', autoHideDuration: 3000})
            return true
        }

        if (isNaN(steelModulus)){
            enqueueSnackbar(translate('Error_Steel_modulus_isNum'), {variant: 'error', autoHideDuration: 3000})
            return true
        }

        if (compositeTypeCheck == true){
            if (compPileType === '현장타설말뚝'){
                if (Number(compConcreteDiameter) <= 0){
                    enqueueSnackbar(translate('Error_Comp_Concrete_Diameter'), {variant: 'error', autoHideDuration: 3000})
                    return true
                }
                if (Number(compConcreteModulus) <= 0){
                    enqueueSnackbar(translate('Error_Comp_Concrete_Modulus'), {variant: 'error', autoHideDuration: 3000})
                    return true
                }
                if (Number(compSteelDiameter) <= 0){
                    enqueueSnackbar(translate('Error_Comp_Steel_Diameter'), {variant: 'error', autoHideDuration: 3000})
                    return true
                }
                if (Number(compSteelModulus) <= 0){
                    enqueueSnackbar(translate('Error_Comp_Steel_Modulus'), {variant: 'error', autoHideDuration: 3000})
                    return true
                }
            }

            if (compPileType === 'PHC말뚝'){
                if (Number(compConcreteDiameter) <= 0){
                    enqueueSnackbar(translate('Error_Comp_Concrete_Diameter'), {variant: 'error', autoHideDuration: 3000})
                    return true
                }
                if (Number(compConcreteThickness) <= 0){
                    enqueueSnackbar(translate('Error_Comp_Concrete_Thickness'), {variant: 'error', autoHideDuration: 3000})
                    return true
                }
                if (Number(compConcreteModulus) <= 0){
                    enqueueSnackbar(translate('Error_Comp_Concrete_Modulus'), {variant: 'error', autoHideDuration: 3000})
                    return true
                }
                if (Number(compSteelDiameter) <= 0){
                    enqueueSnackbar(translate('Error_Comp_PC_Steel_Area'), {variant: 'error', autoHideDuration: 3000})
                    return true
                }
                if (Number(compSteelModulus) <= 0){
                    enqueueSnackbar(translate('Error_Comp_PC_Steel_Modulus'), {variant: 'error', autoHideDuration: 3000})
                    return true
                }
                if (Number(compSteelCorThickness) < 0){
                    enqueueSnackbar(translate('Error_Comp_PC_Steel_Cor'), {variant: 'error', autoHideDuration: 3000})
                    return true
                }
            }

            if (compPileType === 'SC말뚝'){
                if (Number(compConcreteDiameter) <= 0){
                    enqueueSnackbar(translate('Error_Comp_Concrete_Diameter'), {variant: 'error', autoHideDuration: 3000})
                    return true
                }
                if (Number(compConcreteThickness) <= 0){
                    enqueueSnackbar(translate('Error_Comp_Concrete_Thickness'), {variant: 'error', autoHideDuration: 3000})
                    return true
                }
                if (Number(compConcreteModulus) <= 0){
                    enqueueSnackbar(translate('Error_Comp_Concrete_Modulus'), {variant: 'error', autoHideDuration: 3000})
                    return true
                }
                if (Number(compSteelThickness) <= 0){
                    enqueueSnackbar(translate('Error_Comp_Pipe_Thickness'), {variant: 'error', autoHideDuration: 3000})
                    return true
                }
                if (Number(compSteelModulus) <= 0){
                    enqueueSnackbar(translate('Error_Comp_Pipe_Modulus'), {variant: 'error', autoHideDuration: 3000})
                    return true
                }
                if (Number(compSteelCorThickness) < 0){
                    enqueueSnackbar(translate('Error_Comp_Pipe_Cor'), {variant: 'error', autoHideDuration: 3000})
                    return true
                }
            }

            if (compPileType === '강관말뚝'){
                if (Number(compSteelDiameter) <= 0){
                    enqueueSnackbar(translate('Error_Comp_Pipe_Diameter'), {variant: 'error', autoHideDuration: 3000})
                    return true
                }
                if (Number(compSteelThickness) <= 0){
                    enqueueSnackbar(translate('Error_Comp_Pipe_Thickness'), {variant: 'error', autoHideDuration: 3000})
                    return true
                }
                if (Number(compSteelModulus) <= 0){
                    enqueueSnackbar(translate('Error_Comp_Pipe_Modulus'), {variant: 'error', autoHideDuration: 3000})
                    return true
                }
                if (Number(compSteelCorThickness) < 0){
                    enqueueSnackbar(translate('Error_Comp_PC_Steel_Cor'), {variant: 'error', autoHideDuration: 3000})
                    return true
                }
            }

            if (compPileType === '소일시멘트말뚝'){
                if (Number(compConcreteDiameter) <= 0){
                    enqueueSnackbar(translate('Error_Comp_SoilCement_Diameter'), {variant: 'error', autoHideDuration: 3000})
                    return true
                }
                if (Number(compConcreteModulus) <= 0){
                    enqueueSnackbar(translate('Error_Comp_SoilCement_Modulus'), {variant: 'error', autoHideDuration: 3000})
                    return true
                }
                if (Number(compSteelDiameter) <= 0){
                    enqueueSnackbar(translate('Error_Comp_Pipe_Diameter'), {variant: 'error', autoHideDuration: 3000})
                    return true
                }
                if (Number(compSteelThickness) <= 0){
                    enqueueSnackbar(translate('Error_Comp_Pipe_Thickness'), {variant: 'error', autoHideDuration: 3000})
                    return true
                }
                if (Number(compSteelModulus) <= 0){
                    enqueueSnackbar(translate('Error_Comp_Pipe_Modulus'), {variant: 'error', autoHideDuration: 3000})
                    return true
                }
                if (Number(compSteelCorThickness) < 0){
                    enqueueSnackbar(translate('Error_Comp_Pipe_Cor'), {variant: 'error', autoHideDuration: 3000})
                    return true
                }
            }
        }

        if (isNaN(compConcreteModulus)){
            enqueueSnackbar(translate('Error_Comp_Concrete_Modulus_isNum'), {variant: 'error', autoHideDuration: 3000})
            return true
        }

        if (isNaN(compSteelModulus)){
            enqueueSnackbar(translate('Error_Comp_Steel_modulus_isNum'), {variant: 'error', autoHideDuration: 3000})
            return true
        }

        // 보강 단면
        if (!(Number(reinforcedStartLength) == 0 && Number(reinforcedEndLength) == 0)){
            if (Number(reinforcedStartLength) < 0){
                enqueueSnackbar(translate('Error_Reinforced_StartLength'), {variant: 'error', autoHideDuration: 3000})
                return true
            }
            if (Number(reinforcedEndLength) < 0){
                enqueueSnackbar(translate('Error_Reinforced_EndLength'), {variant: 'error', autoHideDuration: 3000})
                return true
            }
            if (Number(reinforcedStartLength) >= Number(reinforcedEndLength)){
                enqueueSnackbar(translate('Error_Reinforced_StartEndLength'), {variant: 'error', autoHideDuration: 3000})
                return true
            }
            if (Number(reinforcedEndLength) > pileLength){
                enqueueSnackbar(translate('Error_Reinforced_EndLength2'), {variant: 'error', autoHideDuration: 3000})
                return true
            }
            if (Number(outerThickness) <= 0){
                enqueueSnackbar(translate('Error_Reinforced_Outer_Thickness'), {variant: 'error', autoHideDuration: 3000})
                return true
            }
            if (Number(outerMoudlus) <= 0){
                enqueueSnackbar(translate('Error_Reinforced_Outer_Modulus'), {variant: 'error', autoHideDuration: 3000})
                return true
            }
            if (innerInputState === true){
                if (Number(innerThickness) <= 0){
                    enqueueSnackbar(translate('Error_Reinforced_Inner_Thickness'), {variant: 'error', autoHideDuration: 3000})
                    return true
                }
                if (Number(innerMoudlus) <= 0){
                    enqueueSnackbar(translate('Error_Reinforced_Inner_Modulus'), {variant: 'error', autoHideDuration: 3000})
                    return true
                }
            }
        }
        

        // 말뚝 배치
        if (Number(majorStartPoint) < 0){
            enqueueSnackbar(translate('Error_Pile_XLoc'), {variant: 'error', autoHideDuration: 3000})
            return true
        }
        else if (Number(majorStartPoint) > Number(sideLength)){
            enqueueSnackbar(translate('Error_Pile_YLoc'), {variant: 'error', autoHideDuration: 3000})
            return true
        }

        if (Number(minorStartPoint) < 0){
            enqueueSnackbar(translate('Error_Pile_YLoc2'), {variant: 'error', autoHideDuration: 3000})
            return true
        }
        else if (Number(minorStartPoint) > Number(foundationWidth)){
            enqueueSnackbar(translate('Error_Pile_YLoc3'), {variant: 'error', autoHideDuration: 3000})
            return true
        }

        // 말뚝 개수 확인
        let majorSpaceNumbers = 0
        if (majorSpace == '' || majorSpace == '0')
            majorSpaceNumbers = 1
        else
            majorSpaceNumbers = (ExtractNumbers(majorSpace)).length + 1
        const majorDegreeNumbers = (ExtractNumbers(majorDegree)).length
        const minorDegreeNumbers = (ExtractNumbers(minorDegree)).length

        if (majorSpaceNumbers !== majorDegreeNumbers || majorSpaceNumbers !== minorDegreeNumbers || majorDegreeNumbers !== minorDegreeNumbers){
            enqueueSnackbar(translate('Error_Space_Degree'), {variant: 'error', autoHideDuration: 3000})
            enqueueSnackbar(translate('Error_Space_Degree_Guide1') + majorSpaceNumbers, {variant: 'error', autoHideDuration: 5000})
            enqueueSnackbar(translate('Error_Space_Degree_Guide2') + majorDegreeNumbers, {variant: 'error', autoHideDuration: 5000})
            enqueueSnackbar(translate('Error_Space_Degreee_Guide3') + minorDegreeNumbers, {variant: 'error', autoHideDuration: 5000})
            return true
        }
        
    }

    // Reset 함수
    const Reset = () => {
        ResetPileName()
        ResetPileLength()
        ResetPileType()
        ResetConstructionMethod()
        ResetHeadCondition()
        ResetBottomCondition()
        ResetSteelDiaTitle()
        ResetSteelCorTitle()
        ResetSteelTitle()
        ResetConcreteModulusTitle()

        ResetConcreteDiameter()
        ResetConcreteThickness()
        ResetConcreteModulus()
        ResetSteelDiameter()
        ResetSteelThickness()
        ResetSteelModulus()
        ResetSteelCorThickness()

        ResetCompositeTypeCheck()
        ResetCompPileType()
        ResetCompStartLength()

        ResetCompConcreteDiameter()
        ResetCompConcreteThickness()
        ResetCompConcreteModulus()
        ResetCompSteelDiameter()
        ResetCompSteelThickness()
        ResetCompSteelModulus()
        ResetCompSteelCorThickness()

        ResetReinforcedMethod()
        ResetReinforcedStartLength()
        ResetReinforcedEndLength()
        ResetOuterThickness()
        ResetOuterModulus()
        ResetInnerThickness()
        ResetInnerModulus()
        ResetInnerInputState()

        ResetMajorStartPoint()
        ResetMinorStartPoint()
        ResetMajorSpace()
        ResetMajorDegree()
        ResetMinorDegree()


    }

    // PiletableData 추가
    const AddDataButtonClick = (e:any) => {
        if (ErrorCheck()){
            return
        }
        // PileTableData 원본 데이터 추가
        setPileTableData([...pileTableData, pileData])
        enqueueSnackbar(translate('Success_Add_Pile'), {variant: 'success', autoHideDuration: 3000})
    }

    // PileTable 데이터 삭제
    const DeleteDataButtonClick = (e:any) => {
        const indexToRemove = selectedRow
        const updatedPileTableData = pileTableData.filter((_, index) => index !== indexToRemove)
        setPileTableData(updatedPileTableData)

        Reset()

        enqueueSnackbar(translate('Success_Delete_Pile'), {variant: 'success', autoHideDuration: 3000})
    }

    // PileTable 데이터 수정
    const UpdateDataButtonClick = (e:any) => {
        const indexToUpdate = selectedRow
        const updatedPileTableData = pileTableData.map((data, index) => {
            if (index === indexToUpdate) {
                return pileData
            }
            return data
        })

        setPileTableData(updatedPileTableData)

        setSelectedRow(pileTableData.length-1)

        enqueueSnackbar(translate('Success_Modify_Pile'), {variant: 'success', autoHideDuration: 3000})
    }

    const handleChangeTopLevel = (e:any) => {
        const inputValue = e.target.value;
        if (!Number.isNaN(Number(inputValue))){
            setTopLevel(inputValue);
        }
        else{
            setTopLevel(0);
        }
    }

    const handleChangeForcePointX = (e:any) => {
        const inputValue = e.target.value;
        if (!Number.isNaN(Number(inputValue))){
            setForce_Point_X(inputValue);
        }
        else{
            setForce_Point_X(0);
        }
    }

    const handleChangeForcePointY = (e:any) => {
        const inputValue = e.target.value;
        if (!Number.isNaN(Number(inputValue))){
            setForce_Point_Y(inputValue);
        }
        else{
            setForce_Point_Y(0);
        }
    }

    return(
        <GuideBox width="auto" marginRight={1} marginBottom={1}>
            <GuideBox row spacing={1} verCenter>
                <GuideBox row verCenter width={690}>
                    <Typography variant='h1' margin={1} verBottom horCenter>
                        {translate('Project_Name')}
                    </Typography>
                    <TextFieldV2 
                    onChange={(e:any) => {setProjectName(e.target.value)}}
                    value={projectName}
                    />
                </GuideBox>
                <GuideBox row verCenter spacing={1}>
                    <Typography>Language : </Typography>
                    <DropList 
                        itemList={LanguageList}
                        value={language}
                        defaultValue={"kr"}
                        onChange={handleLanguageChange}
                    />
                </GuideBox>
            </GuideBox>
            <Typography variant='h1' margin={1}>
                {translate('Pile_Info')}
            </Typography>
                <Panel variant='shadow' width={820} paddingLeft={2} paddingTop={0.5}>
                    <Typography variant='h1'>{translate('Footing_Dimension')}</Typography>
                    <GuideBox row width='100' verCenter>
                        <GuideBox row width='100'>
                            <TypoGraphyTextField                                                                                                                                                                                                                                                                                                       
                                title = {translate('Xdir_Dim')}
                                height = {30}
                                width = {120}
                                textFieldWidth = {40}
                                value = {foundationWidth}
                                onChange = {(e:any) => {setFoundationWidth(e.target.value);}}
                                placeholder = ''
                        />
                        </GuideBox>
                        <GuideBox row padding={1} width='100'>
                            <TypoGraphyTextField
                                title = {translate('Ydir_Dim')}
                                height = {30}
                                width = {110}
                                textFieldWidth = {40}
                                value = {sideLength}
                                onChange = {(e:any) => {setSideLength(e.target.value);}}
                                placeholder = ''
                                />
                        </GuideBox>
                        <GuideBox row padding={1 }>
                            <TypoGraphyTextField
                                title = {translate('Top_Level')}
                                height = {30}
                                width = {110}
                                textFieldWidth = {40}
                                value = {toplevel}
                                onChange = {handleChangeTopLevel}
                                placeholder = ''
                                defaultValue = {0}
                                />
                        </GuideBox>
                        <GuideBox row padding={1 }>
                            <TypoGraphyTextField
                                title = {translate('X_Force_Point')}
                                height = {30}
                                width = {170}
                                textFieldWidth = {40}
                                value = {force_Point_X}
                                onChange = {handleChangeForcePointX}
                                placeholder = ''
                                defaultValue = {0}
                                />
                        </GuideBox>
                        <GuideBox row padding={1 }>
                            <TypoGraphyTextField
                                title = {translate('Y_Force_Point')}
                                height = {30}
                                width = {190}
                                textFieldWidth = {40}
                                value = {force_Point_Y}
                                onChange = {handleChangeForcePointY}
                                placeholder = ''
                                defaultValue = {0}
                                />
                        </GuideBox>
                    </GuideBox>
            </Panel>

            <Typography variant='h1' padding={1}>
                {translate('Pile_Setting')}
            </Typography>
            <GuideBox row>
                <Panel padding ={1} variant='shadow' width = {820} height = {415}>
                    <GuideBox row spacing = {1} padding={1} width='100'>
                        <GuideBox>
                            <GuideBox>
                                <Typography variant='h1'>{translate('Initial_Setting')}</Typography>
                                <Panel width={320} height={210}>
                                    <PileInitialSettings />
                                </Panel>
                            </GuideBox>
                            <GuideBox marginTop={1}>
                                <GuideBox row horLeft verCenter>
                                    <Check checked={compositeTypeCheck} onChange={handleCompositePileType}/>
                                    <Typography variant='h1' verCenter>{translate('Composite_Setting')}</Typography>
                                </GuideBox>
                            </GuideBox>
                            <Panel width={320} height={100}>
                                <AddComposites />
                            </Panel>
                        </GuideBox>
                        <GuideBox >
                            <GuideBox >
                                <Typography variant='h1'>{translate('Section_Setting')}</Typography>
                                    <Panel padding={1} variant='shadow' width={460} height={210}>
                                        <PileSections />
                                    </Panel>
                                <GuideBox marginTop={2}>
                                        <GuideBox row verCenter>
                                            <GuideBox width={100}>
                                                <Typography variant='h1'>{translate('Pile_Arrangement')}</Typography> 
                                            </GuideBox>
                                            <GuideBox width={360} row horRight>
                                                <Typography variant='h1'>{translate('Pile_View')}</Typography> 
                                                <PopupButtonComponent direction = 'Right' open={openRight} setOpen={setOpenRight}/>
                                            </GuideBox>
                                        </GuideBox>
                                    <Panel padding={1} variant='shadow' width={460} height={100}>  
                                        <PileLocation/>
                                    </Panel>
                                </GuideBox>
                            </GuideBox>
                        </GuideBox>
                        
                    </GuideBox>
                    <GuideBox row marginLeft={1} horRight  width={790}height={50} spacing={1}>
                        <Button variant='outlined'
                            onClick={AddDataButtonClick}>
                            {translate('Pile_Add_Button')}
                        </Button>
                        <Button variant='outlined'
                        onClick={UpdateDataButtonClick}>
                            {translate('Pile_Modify_Button')}
                        </Button>
                        <Button variant='outlined'
                        onClick={DeleteDataButtonClick}>
                            {translate('Pile_Delete_Button')}
                        </Button>
                    </GuideBox>
                </Panel>

                {openRight && <PileChart {...popupRightProps} closeHandler={() => setOpenRight(false)} />}

            </GuideBox>
            <Typography variant='h1' padding={1}>
                {translate('Pile_Arrangement_Table')}
            </Typography>
            <Panel padding={1} variant='shadow' width={820} height={170}>
                <PileTable />
            </Panel>
        </GuideBox>
    );
};

export default PileProperties

