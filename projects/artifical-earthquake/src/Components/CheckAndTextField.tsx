import {
    GuideBox,
    Check,
    TextField,
    Color,
} from '@midasit-dev/moaui';
import React from 'react';
import { debounce } from 'lodash';

const CompCheckAndTextField = (props: any) => {
    const {
        title,
        width,
        stateChk,
        setStateChk,
        stateTxt,
        setStateTxt,
        error,
        blueTitle = false,
        placeholder = 'Input value ...',
    } = props;

    const [valueChk, setValueChk] = React.useState(stateChk);
    const [valueTxt, setValueTxt] = React.useState(stateTxt);

    //for 디바운스!
    React.useEffect(() => {
        const debounceSetValue = debounce((newValue) => {
            setStateTxt(newValue);
        }, 500);

        debounceSetValue(valueTxt);

        // Cleanup the debounce function on component unmount
        return () => {
            debounceSetValue.cancel();
        };
    }, [valueTxt, setStateTxt]);

    return (
        <GuideBox width="100%" row horSpaceBetween>
            <GuideBox width="inherit" row horSpaceBetween verCenter height={30}>
                <Check name={title} checked={valueChk} onChange={function noRefCheck(e: any) {
                    setValueChk(e.target.checked);
                    if (e.target.checked) {                        
                        setValueTxt(valueTxt);
                    }
                }} />
                <TextField
                    error={error}
                    width={width}
                    height={30}
                    placeholder={placeholder}
                    onChange={(e: any) => setValueTxt(e.target.value)}
                    value={valueTxt}
                    disabled={!valueChk}
                />
            </GuideBox>
        </GuideBox>
    );
}

export default CompCheckAndTextField;