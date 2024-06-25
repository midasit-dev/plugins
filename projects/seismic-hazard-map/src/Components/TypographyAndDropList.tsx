import {
    GuideBox,
    Typography,
    DropList,
    Color,
} from '@midasit-dev/moaui';
import React from 'react';
import { debounce } from 'lodash';

const CompTypographyAndDropList = (props: any) => {
    const {
        title,
        state,
        setState,
        droplist,
        blueTitle = false,
        width,
    } = props;

    const [value, setValue] = React.useState(state);

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
        <GuideBox width="inherit" row horSpaceBetween verCenter height={30}>
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
                onChange={(e: any) => setValue(e.target.value)}
                listWidth={200}
            />
        </GuideBox>
    );
}

export default CompTypographyAndDropList;