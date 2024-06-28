import { useEffect } from 'react';
import { useState } from 'react';
import {GuideBox, 
    Typography,
    Panel,
    TemplatesDualComponentsTypographyTextFieldSpaceBetween,
    TextFieldV2
} from '@midasit-dev/moaui';
import {useRecoilState, useRecoilValue} from 'recoil';
import {
    ReinforcedMethod, ReinforcedStartLength, ReinforcedEndLength, OuterThickness, OuterModulus, InnerThickness, InnerModulus, InnerInputState
} from '../variables';
import TypoGraphyDropList from '../NewComponents/TrypoGraphyDropList';
import { useTranslation } from 'react-i18next';

function Reinforced(){
    
    const { t:translate, i18n: internationalization} = useTranslation();
    const [reinforcedMethod, setReinforcedMethod] = useRecoilState(ReinforcedMethod);
    const [reinforcedStartLength, setReinforcedStartLength] = useRecoilState(ReinforcedStartLength);
    const [reinforcedEndLength, setReinforcedEndLength] = useRecoilState(ReinforcedEndLength);
    const [outerThickness, setOuterThickness] = useRecoilState(OuterThickness);
    const [outerMoudlus, setOuterMoudlus] = useRecoilState(OuterModulus);
    const [innerThickness, setInnerThickness] = useRecoilState(InnerThickness);
    const [innerMoudlus, setInnerMoudlus] = useRecoilState(InnerModulus);
    const [innerInputState, setInnerInputState] = useRecoilState(InnerInputState);

    const [ReinforcedList, setReinforcedList] = useState<any>([])
    
    const handleReinforcedMethodChange = (e:any) => {
        if (e.target.value === '피복'){
            setInnerInputState(false);
        }
        else{
            setInnerInputState(true);
        }
        setReinforcedMethod(e.target.value);
    }

    const handleReinforcedStartLengthChange = (e:any) => {
        const inputValue = e.target.value;
        if (!Number.isNaN(Number(inputValue))){
            setReinforcedStartLength(e.target.value);
        }
        else{
            setReinforcedStartLength(0);
        }
    }

    const handleReinforcedEndLengthChange = (e:any) => {
        const inputValue = e.target.value;
        if (!Number.isNaN(Number(inputValue))){
            setReinforcedEndLength(e.target.value);
        }
        else{
            setReinforcedEndLength(0);
        }
    }

    const handleOuterThicknessChange = (e:any) => {
        const inputValue = e.target.value;
        if (!Number.isNaN(Number(inputValue))){
            setOuterThickness(e.target.value);
        }
        else{
            setOuterThickness(0);
        }
    }

    const handleOuterMoudlusChange = (e:any) => {
        setOuterMoudlus(e.target.value);
    }

    const handleInnerThicknessChange = (e:any) => {
        const inputValue = e.target.value;
        if (!Number.isNaN(Number(inputValue))){
            setInnerThickness(e.target.value);
        }
        else{
            setInnerThickness(0);
        }
    }

    const handleInnerMoudlusChange = (e:any) => {
        setInnerMoudlus(e.target.value);
    }

    useEffect(() => {
        setReinforcedList(
            [
                [translate('Reinforced_Method_Outer'),'피복'],
                [translate('Reinforced_Method_Inner_Outer'),'피복+충진']
            ]
        )
    },)

    return(
        <GuideBox width='100%'>
            <Panel padding={1} variant='shadow' width={445}>
                <TypoGraphyDropList 
                    title = {translate('Reinforced_Method')}
                    items = {ReinforcedList}
                    value = {reinforcedMethod}
                    onChange = {handleReinforcedMethodChange}
                    width = {300}
                    dropListWidth = {180}
                />
                <GuideBox row verCenter>
                    <GuideBox width={120}>
                        <Typography>{translate('Reinforced_Loc')}</Typography>
                    </GuideBox>
                    <GuideBox row horRight verCenter spacing={2}>
                        <TextFieldV2  width={70} placeholder = '' value = {reinforcedStartLength.toString()} onChange = {handleReinforcedStartLengthChange}/>
                        <Typography> ~ </Typography>
                        <TextFieldV2  width={70} placeholder = '' value = {reinforcedEndLength.toString()} onChange={handleReinforcedEndLengthChange}/>
                    </GuideBox>
                </GuideBox>
                <GuideBox row paddingTop={1} verCenter spacing={1}>
                    <GuideBox>
                        <Typography variant='h1'>{translate('Reinforced_Outer_Title')}</Typography>
                        
                        <TemplatesDualComponentsTypographyTextFieldSpaceBetween 
                            title = {translate('Reinforced_Thickness')}
                            width = {200}
                            textFieldWidth = {100}
                            placeholder = ''
                            value = {outerThickness}
                            onChange = {handleOuterThicknessChange}
                        />
                        <TemplatesDualComponentsTypographyTextFieldSpaceBetween 
                            title = {translate('Reinforced_Modulus')}
                            width = {200}
                            textFieldWidth = {100}
                            placeholder = ''
                            value = {outerMoudlus}
                            onChange = {handleOuterMoudlusChange}
                        />
                    </GuideBox>
                    <GuideBox>
                        <Typography variant='h1'>{translate('Reinforced_Inner_Title')}</Typography>
                        <TemplatesDualComponentsTypographyTextFieldSpaceBetween 
                            title = {translate('Reinforced_Thickness')}
                            width = {200}
                            textFieldWidth = {100}
                            placeholder = ''
                            value = {innerThickness}
                            onChange = {handleInnerThicknessChange}
                            disabled = {!innerInputState}
                        />
                        <TemplatesDualComponentsTypographyTextFieldSpaceBetween 
                            title = {translate('Reinforced_Modulus')}
                            width = {200}
                            textFieldWidth = {100}
                            placeholder = ''
                            value = {innerMoudlus}
                            onChange = {handleInnerMoudlusChange}
                            disabled = {!innerInputState}
                        />
                    </GuideBox>
                </GuideBox>
            </Panel>
        </GuideBox>
    );
}

export default Reinforced;