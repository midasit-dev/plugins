import {GuideBox, Typography} from '@midasit-dev/moaui';
import { useRecoilValue} from 'recoil';
import {  FoundationWidth, SideLength
} from '../variables';
import { useState } from 'react';
import {Icon, Panel, TabGroup, Tab} from '@midasit-dev/moaui';
import PlanView from './PlanViewCanvas';
import FrontView from './FrontViewCanvas';
import SideView from './SideViewCanvas';
import { useTranslation } from 'react-i18next';

function PileChart(props: any){
    const { t:translate, i18n: internationalization} = useTranslation();
    const {closeHandler, ...otherProps } = props;
    const Width = useRecoilValue(FoundationWidth);
    const Length = useRecoilValue(SideLength);

    const [tabName,setTabName] = useState("PlanView")

    const handelTabChange = (event:React.SyntheticEvent, newvalue: string)=>{
        setTabName(newvalue)
    }
    return(
        
        <GuideBox show marginLeft={1} height={415} width ={370}>
            <Panel width={370} height={415}>
                <GuideBox row width ={350} horSpaceBetween>
                    <Typography variant='h1'>{translate('Pile_View_Title')}</Typography>
                    <Icon iconName='Close' toButton onClick={closeHandler}/>
                </GuideBox>
                <TabGroup
                    value = {tabName}
                    onChange = {handelTabChange}
                    minWidth={35}
                    minHeight={12}
                    tabProps={{
                        minWidth: 60,
                        minHeight: 28,
                        fontSize: 'small'
                    }}
                >
                    <Tab value = "PlanView" label = {translate('Plan_View')}/>
                    <Tab value = "FrontView" label = {translate('Front_View')}/>
                    <Tab value = "SideView" label = {translate('Side_View')}/>
                </TabGroup>
                <GuideBox height={350} width={350}>
                    {tabName === "PlanView" && <PlanView />}
                    {tabName === "FrontView" && <FrontView /> }
                    {tabName === "SideView" && <SideView />}
                </GuideBox>
                
            </Panel>
        </GuideBox>
        
    )
}

export default PileChart;