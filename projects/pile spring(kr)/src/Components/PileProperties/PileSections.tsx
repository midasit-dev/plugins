import { useState } from 'react';
import {GuideBox, 
    TabGroup,
    Tab,
} from '@midasit-dev/moaui';
import {useRecoilState, useRecoilValue} from 'recoil';
import { CompositeTypeCheck } from '../variables';
import BasicSection from './BasicSection';
import Composite from './CompositeSection';
import Reinforced from './Reinforced';
import { useTranslation } from 'react-i18next';

// Pile Section 입력 창
function PileSections(){

    const { t:translate, i18n: internationalization} = useTranslation();
    const [tabName,setTabName] = useState("Basic")

    const handelChange = (event:any, newvalue: string)=>{
        setTabName(newvalue)
    }
    
    // 하부말뚝 설정 check 변수
    const compositePileTypeCheck = useRecoilValue(CompositeTypeCheck);
    
    return(
        <GuideBox>
            <GuideBox width='100%' height={290}>
                <TabGroup
                    value={tabName}
                    onChange={handelChange}
                    minWidth={50}
                    minHeight={12}
                    tabProps={{
                        minWidth: 80,
                        minHeight: 28,
                        fontSize: 'small'
                    }}
                >
                    <Tab value="Basic" label={translate('Basic_Section_Title')} fontSize={'small'}/>
                    <Tab value="Double" label={translate('Composite_Section_Title')} disabled={!compositePileTypeCheck} />
                    <Tab value="Composite" label={translate('Reinforced_Section_Title')}/>
                    
                </TabGroup>
                {tabName === "Basic" && <BasicSection/>}
                {tabName === "Double" && <Composite/>}
                {tabName === "Composite" && <Reinforced />}
            </GuideBox>
            
        </GuideBox>
        
    );
}

export default PileSections;