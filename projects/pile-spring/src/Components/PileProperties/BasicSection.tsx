import {GuideBox, 
    Typography,
    Panel,
} from '@midasit-dev/moaui';
import {useRecoilState, useRecoilValue} from 'recoil';
import {PileType, Concrete_Diameter, Concrete_Modulus, Concrete_Thickness, ConcreteModulus_Title,
    Steel_Diameter, Steel_Modulus, Steel_Thickness, Steel_Dia_Title, Steel_Cor_Title, Steel_Cor_Thickness, Steel_Title, Concrete_Title} from '../variables';
import TypoGraphyTextField from '../NewComponents/TypoGraphyTextField';
import { useTranslation } from 'react-i18next';

function BasicSection(){

    const { t:translate, i18n: internationalization} = useTranslation();
    const pileType = useRecoilValue(PileType);
    const steelDiaTitle = useRecoilValue(Steel_Dia_Title);
    const concreteModulusTitle = useRecoilValue(ConcreteModulus_Title);
    const steelCorTitle = useRecoilValue(Steel_Cor_Title);
    const steelTitle = useRecoilValue(Steel_Title)
    const concreteTitle = useRecoilValue(Concrete_Title);
    const [concreteDiameter, setConcreteDiameter] = useRecoilState(Concrete_Diameter);
    const [concreteThickness, setConcreteThickness] = useRecoilState(Concrete_Thickness);
    const [concreteModulus, setConcreteModulus] = useRecoilState(Concrete_Modulus);

    const [steelCaseDiameter, setSteelCaseDiameter] = useRecoilState(Steel_Diameter);
    const [steelCaseThickness, setSteelCaseThickness] = useRecoilState(Steel_Thickness);
    const [steelCaseModulus, setSteelCaseModulus] = useRecoilState(Steel_Modulus);
    const [steelCorthickness, setSteelCorthickness] = useRecoilState(Steel_Cor_Thickness);

    // 콘크리트 직경 입력값 에러 처리
    const handleChangeConcreteDiameter = (e:any) => {
        const inputValue = e.target.value;
        if (!Number.isNaN(Number(inputValue))){
            setConcreteDiameter(inputValue);
        }
        else{
            setConcreteDiameter(0);
        }
    }

    // 콘크리트 두께 입력값 에러 처리
    const handleChangeConcreteThickness = (e:any) => {
        const inputValue = e.target.value;
        if (!Number.isNaN(Number(inputValue))){
            setConcreteThickness(inputValue);
        }
        else{
            setConcreteThickness(0);
        }
    }

    // 콘크리트 탄성계수 입력값 에러 처리
    const handleChangeConcreteModulus = (e:any) => {
        const inputValue = e.target.value;
        setConcreteModulus(inputValue);
    }

    // 강관 직경 입력값 에러 처리
    const handleChangeSteelDiameter = (e:any) => {
        const inputValue = e.target.value;
        if (!Number.isNaN(Number(inputValue))){
            setSteelCaseDiameter(inputValue);
        }
        else{
            setSteelCaseDiameter(0);
        }
    }

    // 강관 두께 입력값 에러 처리
    const handleChangeSteelThickness = (e:any) => {
        const inputValue = e.target.value;
        if (!Number.isNaN(Number(inputValue))){
            setSteelCaseThickness(inputValue);
        }
        else{
            setSteelCaseThickness(0);
        }
    }

    // 강관 탄성계수 입력값 에러 처리
    const handleChangeSteelModulus = (e:any) => {
        const inputValue = e.target.value;
        setSteelCaseModulus(inputValue);
    }

    // 강관 부식대 입력값 에러 처리
    const handleChangeSteelCorThickness = (e:any) => {
        const inputValue = e.target.value;
        if (!Number.isNaN(Number(inputValue))){
            setSteelCorthickness(inputValue);
        }
        else{
            setSteelCorthickness(0);
        }
    }


    return(
        <GuideBox width='100%'>
            <GuideBox row spacing={1}>
                <GuideBox>
                    <Typography variant='h1' paddingTop={1} paddingLeft={1}>
                    {concreteTitle}
                    </Typography>
                        <Panel padding={1} variant='shadow' width={210}>
                            <TypoGraphyTextField
                                title = {translate('Basic_Concrete_Diamter')}
                                width = {200}
                                textFieldWidth = {100}
                                // 강관말뚝인 경우 직경 입력받지 않음
                                disabled = {(pileType === '강관말뚝') ? true : false}
                                filled = {(pileType === '강관말뚝') ? true : false}
                                value = {concreteDiameter}
                                onChange = {handleChangeConcreteDiameter}
                                placeholder = ''
                                type = 'number'
                            />
                            <TypoGraphyTextField
                                title = {translate('Basic_Concrete_Thickness')}
                                width = {200}
                                textFieldWidth = {100}
                                placeholder = ''
                                // PHC 및 SC 말뚝인 경우만 입력받음
                                disabled = {(pileType === '현장타설말뚝' || pileType === '강관말뚝' || pileType === '소일시멘트말뚝') ? true : false}
                                value = {concreteThickness}
                                onChange = {handleChangeConcreteThickness}
                                type = 'number'
                                
                            />
                            <TypoGraphyTextField
                                title = {concreteModulusTitle}
                                width = {200}
                                textFieldWidth = {100}
                                placeholder = ''
                                // 강관 말뚝은 입력받지 않음
                                disabled = {(pileType === '강관말뚝') ? true : false}
                                value = {concreteModulus}
                                onChange = {handleChangeConcreteModulus}
                                type = 'number'
                            />
                        </Panel>

                </GuideBox>
                <GuideBox>
                    <Typography variant='h1' paddingTop={1} paddingLeft={1}>
                        {steelTitle}
                    </Typography>
                    <Panel padding={1} variant='shadow' width={210}>
                        <TypoGraphyTextField
                            title = {steelDiaTitle}
                            width = {200}
                            textFieldWidth = {100}
                            placeholder = ''
                            disabled = {(pileType === 'SC말뚝') ? true : false}
                            value = {steelCaseDiameter}
                            onChange = {handleChangeSteelDiameter}
                            type = 'number'
                        />
                        <TypoGraphyTextField
                            title = {translate('Basic_Steel_Thickness')}
                            width = {200}
                            textFieldWidth = {100}
                            placeholder = ''
                            disabled = {(pileType === '현장타설말뚝') || (pileType ==='PHC말뚝') ? true : false}
                            value = {steelCaseThickness}
                            onChange = {handleChangeSteelThickness}
                            type = 'number'
                        />
                        <TypoGraphyTextField
                            title = {translate('Basic_Steel_Modulus')}
                            width = {200}
                            textFieldWidth = {100}
                            placeholder = ''
                            value = {steelCaseModulus}
                            onChange = {handleChangeSteelModulus}
                            type = 'number'
                        />
                        <TypoGraphyTextField
                            title = {steelCorTitle}
                            width = {200}
                            textFieldWidth = {100}
                            placeholder = ''
                            disabled = {(pileType === '현장타설말뚝') ? true : false}
                            value = {steelCorthickness}
                            onChange = {handleChangeSteelCorThickness}
                            type = 'number'
                        />
                        
                    </Panel>
                    
                </GuideBox>
            </GuideBox>
        </GuideBox>
    );
}

export default BasicSection;