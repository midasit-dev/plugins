import { useEffect } from 'react';
import { useState } from 'react';
import {GuideBox, 
    Typography,
    TextFieldV2,
    DropList
} from '@midasit-dev/moaui';
import {useRecoilState, useRecoilValue} from 'recoil';
import {Major_Ref_Value, Minor_Ref_Value, Major_Start_Point, Minor_Start_Point, Major_Space, Major_Degree, Minor_Degree} from '../variables';
import { useTranslation } from 'react-i18next';

function PileLocation(){

    const { t:translate, i18n: internationalization} = useTranslation();
    const [MajorRefPointList, setMajorRefPointList] = useState<any>([])
    const [MinorRefPointList, setMinorRefPointList] = useState<any>([])

    const [majorRefValue, setMajorRefValue] = useRecoilState(Major_Ref_Value);
    const [minorRefValue, setMinorRefValue] = useRecoilState(Minor_Ref_Value);

    const [majorStartPoint, setMajorStartPoint] = useRecoilState(Major_Start_Point);
    const [minorStartPoint, setMinorStartPoint] = useRecoilState(Minor_Start_Point);

    const [majorSpace, setMajorSpace] = useRecoilState(Major_Space);

    const [majorDegree, setMajorDegree] = useRecoilState(Major_Degree);
    const [minorDegree, setMinorDegree] = useRecoilState(Minor_Degree);
    
    const handleMajorStartPointChange = (e:any) => {
        const inputValue = e.target.value;
        if (inputValue === '') {
            setMajorStartPoint(0); 
        }
        else if (!Number.isNaN(Number(inputValue))){
            setMajorStartPoint(e.target.value);
        }
        else{
            setMajorStartPoint(0);
        }
    }

    const handleMinorStartPointChange = (e:any) => {
        const inputValue = e.target.value;
        if (inputValue === '') {
            setMinorStartPoint(0); 
        }
        else if (!Number.isNaN(Number(inputValue))){
            setMinorStartPoint(e.target.value);
        }
        else{
            setMinorStartPoint(0);
        }
    }

    const handleMajorSpaceChange = (e:any) => {
        const inputValue = e.target.value;
        if (/^[0-9@,. ]*$/.test(inputValue)) {
            setMajorSpace(inputValue);
        }
        else{
            setMajorSpace('');
        }
    }

    const handleMajorDegreeChange = (e:any) => {
        const inputValue = e.target.value;
        if (/^[0-9@,-. ]*$/.test(inputValue)) {
            setMajorDegree(inputValue);
        }
        else{
            setMajorDegree('');
        }
    }

    const handleMinorDegreeChange = (e:any) => {
        const inputValue = e.target.value;
        if (/^[0-9@,-. ]*$/.test(inputValue)) {
            setMinorDegree(inputValue);
        }
        else{
            setMinorDegree('');
        }
    }

    useEffect(() => {
        setMajorRefPointList([
            // 1이면 우측, 2면 좌측
            [translate('Ref_Point_Right'), 1],
            [translate('Ref_Point_Left'), 2],
        ])

        setMinorRefPointList([
            // 1이면 상단, 2면 하단
            [translate('Ref_Point_Top'), 1],
            [translate('Ref_Point_Bottom'), 2],
        ])

    },) 
    return(
        <GuideBox width='100%' verCenter>
            <GuideBox  horSpaceBetween width={450}>
                <GuideBox row spacing={1}>
                    <GuideBox width={80} horCenter>
                        <Typography variant='body1'></Typography>
                    </GuideBox>
                    <GuideBox width={80} horCenter>
                        <Typography variant='body1'>{translate('Pile_Ref_Point')}</Typography>
                    </GuideBox>
                    <GuideBox width={80} horCenter>
                        <Typography variant='body1'>{translate('Pile_Loc')}</Typography>
                    </GuideBox>
                    <GuideBox width={80} horCenter>
                        <Typography variant='body1'>{translate('Pile_Space')}</Typography>
                    </GuideBox>
                    <GuideBox width={80} horCenter>
                        <Typography variant='body1'>{translate('Pile_Angle')}</Typography>
                    </GuideBox>
                    
                </GuideBox>
            </GuideBox>
            <GuideBox horSpaceBetween>
                <GuideBox row spacing={1}>
                    <GuideBox height={30} width={80} horLeft verCenter>
                        <Typography variant='body1'>{translate('Pile_X_Dir')}</Typography>
                    </GuideBox>
                    <GuideBox height={30} width={80} horCenter verCenter>
                        <DropList itemList={MajorRefPointList} value={majorRefValue} onChange= {(e:any) => {setMajorRefValue(e.target.value);}} width={80} />
                    </GuideBox>
                    <GuideBox height={30} width={80} horCenter verCenter>
                        <TextFieldV2 height={30} width={80} value={majorStartPoint.toString()} onChange= {handleMajorStartPointChange} placeholder = '' />
                    </GuideBox>
                    <GuideBox height={30} width={80} horCenter verCenter>
                    <   TextFieldV2 height={30} width={80} value = {majorSpace.toString()} onChange = {handleMajorSpaceChange} placeholder = '' defaultValue='0'/>
                    </GuideBox>
                    <GuideBox height={30} width={80} horCenter verCenter>
                        <TextFieldV2 height={30} width={80} value = {majorDegree.toString()} onChange = {handleMajorDegreeChange} placeholder = '' defaultValue='0'/>
                    </GuideBox>
                </GuideBox>
            </GuideBox>
            <GuideBox horSpaceBetween>
                <GuideBox row spacing={1}>
                    <GuideBox height={30} width={80} horLeft verCenter>
                        <Typography variant='body1'>{translate('Pile_Y_Dir')}</Typography>
                    </GuideBox>
                    <GuideBox height={30} width={80} horCenter verCenter>
                        <DropList itemList={MinorRefPointList} value={minorRefValue} onChange= {(e:any) => {setMinorRefValue(e.target.value);}} width={80}/>
                    </GuideBox>
                    <GuideBox height={30} width={80} horCenter verCenter>
                        <TextFieldV2 height={30} width={80} value = {minorStartPoint.toString()} onChange = {handleMinorStartPointChange}placeholder = '' />
                    </GuideBox>
                    <GuideBox height={30} width={80} horCenter verCenter>
                        <TextFieldV2 height={30} width={80} placeholder = '' disabled />
                    </GuideBox>
                    <GuideBox height={30} width={80} horCenter verCenter>
                        <TextFieldV2 height={30} width={80} value = {minorDegree.toString()} onChange = {handleMinorDegreeChange} placeholder = '' defaultValue='0'/>
                    </GuideBox>
                </GuideBox>
            </GuideBox>
        </GuideBox>
    );
}

export default PileLocation;