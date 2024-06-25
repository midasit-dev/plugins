import {
    GuideBox,
    Typography,
    DropList,
    Color,
} from '@midasit-dev/moaui';
import React from 'react';
import { debounce } from 'lodash';

import { useRecoilState, useRecoilValue } from "recoil";
import {
    VarChartData,
    VarCalcDS,
    VarMessage,
    VarCalcAE,
} from "./variables";

const CompTypographyAndDropList = (props: any) => {
    const {
        title,
        state,
        setState,
        droplist,
        blueTitle = false,
        width,
        disabled = false,
        reSetType,
    } = props;

    const [chartData, setChartData] = useRecoilState(VarChartData);
    const [calcDS, setCalcDS] = useRecoilState(VarCalcDS);
    const [message, setMessage] = useRecoilState(VarMessage);
    const [calcAE,setCalcAE] = useRecoilState(VarCalcAE);

    const [value, setValue] = React.useState(state);

    const ReSetDSData = (reSetType: any) => { 
        const null_data = { id: '', color: '', data: [] };   
        if(reSetType === 1) {
            const new_chartdata = [null_data, null_data, null_data, null_data, null_data, null_data];
            setMessage('');
            setChartData(new_chartdata);
            setCalcDS(false);
            setCalcAE(false);
        }
        else if(reSetType === 2) {
            const new_chartdata = [chartData[0], chartData[1], chartData[2], chartData[3], null_data, null_data];            
            setChartData(new_chartdata);            
            setCalcAE(false);
        }        
    }

    //for 디바운스!
    React.useEffect(() => {
        const debounceSetValue = debounce((newValue) => {
            setState(newValue);
        }, 500);

        debounceSetValue(value);

        // Cleanup the debounce function on component unmount
        return () => {
            debounceSetValue.cancel();
        };
    }, [value, setState]);

    return (
        <GuideBox width="inherit" padding={2} row horSpaceBetween verCenter height={30}>
            <Typography
                verCenter
                variant="h1"
                height={30}
                color={blueTitle ? Color.secondary.main : Color.text.primary}
            >
                {title}
            </Typography>
            <DropList
                width={width}
                itemList={new Map<string, number>(droplist as [string, number][])}
                defaultValue={value}
                value={value}
                onChange={(e: any) => { setValue(e.target.value); ReSetDSData(reSetType); }}
                listWidth={200}                
                disabled={disabled}
            />
        </GuideBox>
    );
}

export default CompTypographyAndDropList;