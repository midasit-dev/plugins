import {GuideBox, 
    Typography,
    Panel,
} from '@midasit-dev/moaui';
import {useRecoilState, useRecoilValue} from 'recoil';
import {CompPileType, Concrete_Diameter, CompConcrete_Diameter, CompConcrete_Modulus, CompConcrete_Thickness, CompSteel_Title, CompConcrete_Title,
    CompSteel_Diameter, CompSteel_Modulus, CompSteel_Thickness, CompSteel_Dia_Title, CompSteel_Cor_Title, CompSteel_Cor_Thickness, CompConcreteModulus_Title} from '../variables';
import TypoGraphyTextField from '../NewComponents/TypoGraphyTextField';
import { useTranslation } from 'react-i18next';

function Composite(){
    
    const { t:translate, i18n: internationalization} = useTranslation();
    const compPileType = useRecoilValue(CompPileType);
    const compSteelDiaTitle = useRecoilValue(CompSteel_Dia_Title);
    const compSteelCorTitle = useRecoilValue(CompSteel_Cor_Title);
    const compSteelTitle = useRecoilValue(CompSteel_Title)
    const compConcreteTitle = useRecoilValue(CompConcrete_Title);
    const compConcreteModulusTitle = useRecoilValue(CompConcreteModulus_Title);

    const [compConcreteDiameter, setConcreteDiameter] = useRecoilState(CompConcrete_Diameter);
    const [compConcreteModulus, setCompConcreteModulus] = useRecoilState(CompConcrete_Modulus);
    const [compConcreteThickness, setCompConcreteThickness] = useRecoilState(CompConcrete_Thickness);

    const [compSteelDiameter, setCompSteelDiameter] = useRecoilState(CompSteel_Diameter);
    const [compSteelThickness, setCompSteelThickness] = useRecoilState(CompSteel_Thickness);
    const [compSteelModulus, setCompSteelModulus] = useRecoilState(CompSteel_Modulus);
    const [compSteelCorThickness, setCompSteelCorThickness] = useRecoilState(CompSteel_Cor_Thickness);

    const handleChangeConcreteDiameter = (e:any) => {
        const inputValue = e.target.value;
        if (!Number.isNaN(Number(inputValue))){
            setConcreteDiameter(e.target.value);
        }
        else{
            setConcreteDiameter(0);
        }
    }

    const handleChangeConcreteThickness = (e:any) => {
        const inputValue = e.target.value;
        if (!Number.isNaN(Number(inputValue))){
            setCompConcreteThickness(e.target.value);
        }
        else{
            setCompConcreteThickness(0);
        }
    }

    const handleChangeConcreteModulus = (e:any) => {
        const inputValue = e.target.value;
        setCompConcreteModulus(inputValue);
    }

    const handleChangeSteelDiameter = (e:any) => {
        const inputValue = e.target.value;
        if (!Number.isNaN(Number(inputValue))){
            setCompSteelDiameter(e.target.value);
        }
        else{
            setCompSteelDiameter(0);
        }
    }

    const handleChangeSteelThickness = (e:any) => {
        const inputValue = e.target.value;
        if (!Number.isNaN(Number(inputValue))){
            setCompSteelThickness(e.target.value);
        }
        else{
            setCompSteelThickness(0);
        }
    }

    const handleChangeSteelModulus = (e:any) => {
        const inputValue = e.target.value;
        setCompSteelModulus(e.target.value);
    }

    const handleChangeSteelCorThickness = (e:any) => {
        const inputValue = e.target.value;
        if (!Number.isNaN(Number(inputValue))){
            setCompSteelCorThickness(e.target.value);
        }
        else{
            setCompSteelCorThickness(0);
        }
    }


    return(
        <GuideBox width='100%'>
            <GuideBox row spacing={1}>
                <GuideBox>
                    <Typography variant='h1' paddingTop={1} paddingLeft={1}>
                    {compConcreteTitle}
                    </Typography>
                    <Panel padding={1} variant='shadow' width={210}>
                        <TypoGraphyTextField
                            title = {translate('Composite_Concrete_Diamter')}
                            width = {200}
                            textFieldWidth = {100}
                            placeholder = ''
                            disabled = {(compPileType === '강관말뚝') ? true : false}
                            value = {compConcreteDiameter}
                            onChange = {handleChangeConcreteDiameter}
                        />
                        <TypoGraphyTextField
                            title = {translate('Composite_Concrete_Thickness')}
                            width = {200}
                            textFieldWidth = {100}
                            placeholder = ''
                            disabled = {(compPileType === '현장타설말뚝' ||compPileType === '강관말뚝' || compPileType === '소일시멘트말뚝') ? true : false}
                            value = {compConcreteThickness}
                            onChange = {handleChangeConcreteThickness}
                        />
                        <TypoGraphyTextField
                            title = {compConcreteModulusTitle}
                            width = {200}
                            textFieldWidth = {100}
                            placeholder = ''
                            disabled = {(compPileType === '강관말뚝') ? true : false}
                            value = {compConcreteModulus}
                            onChange = {handleChangeConcreteModulus}
                        />
                    </Panel>
                </GuideBox>
                <GuideBox>
                    <Typography variant='h1' paddingTop={1} paddingLeft={1}>
                        {compSteelTitle}
                    </Typography>
                    <Panel padding={1} variant='shadow' width={210}>
                        <TypoGraphyTextField
                            title = {compSteelDiaTitle}
                            width = {200}
                            textFieldWidth = {100}
                            placeholder = ''
                            disabled = {(compPileType === 'SC말뚝') ? true : false}
                            value = {compSteelDiameter}
                            onChange = {handleChangeSteelDiameter}
                        />
                        <TypoGraphyTextField
                            title = {translate('Composite_Steel_Thickness')}
                            width = {200}
                            textFieldWidth = {100}
                            placeholder = ''
                            disabled = {(compPileType === '현장타설말뚝') || (compPileType ==='PHC말뚝') ? true : false}
                            value = {compSteelThickness}
                            onChange = {handleChangeSteelThickness}
                        />
                        <TypoGraphyTextField
                            title = {translate('Composite_Steel_Modulus')}
                            width = {200}
                            textFieldWidth = {100}
                            placeholder = ''
                            value = {compSteelModulus}
                            onChange = {handleChangeSteelModulus}
                        />
                        <TypoGraphyTextField 
                            title = {compSteelCorTitle}
                            width = {200}
                            textFieldWidth = {100}
                            placeholder = ''
                            disabled = {(compPileType === '현장타설말뚝') ? true : false}
                            value = {compSteelCorThickness}
                            onChange = {handleChangeSteelCorThickness}
                        />
                        </Panel>
                </GuideBox>   
            </GuideBox>
        </GuideBox>
    );
}

export default Composite;