import {GuideBox, 
    Typography,
    Panel,
    Radio, RadioGroup,
} from '@midasit-dev/moaui';
import {useRecoilState, useRecoilValue} from 'recoil';
import {ImportType, 
} from '../variables';
import Civil_Cord_System from '../../Civil_Cord_System.png'
import Civil_Cord_System_JP from '../../Civil_Cord_System_JP.png'
import { useTranslation } from 'react-i18next';

function ImportSpring(){

    const { t:translate, i18n: internationalization} = useTranslation();

    const [importType, setImportType] = useRecoilState(ImportType);
    let src_Link = Civil_Cord_System;
    if (internationalization.language === 'jp'){
        src_Link = Civil_Cord_System_JP;
    }
    const SelectType = (e:any, state:any) => {
        setImportType(state);
    }
    
    return(
        <GuideBox marginRight={1} marginBottom={1}>
            <GuideBox>
                <Typography variant='h1' margin={1}>{translate("Import_GeneralSpring_Title")}</Typography>
            </GuideBox>
            <Panel width={820} height={740}>
                <GuideBox spacing={1}>
                    <div>
                        <img src={src_Link} alt="Civil_Cord" width="100%"/>
                    </div>
                    <GuideBox width={800} row verCenter spacing={1} horCenter>
                        <Typography variant='h1' >{translate("Select_Import_Type")}</Typography>
                        <RadioGroup onChange={SelectType} value = {importType} row spacing={2}>
                            <Radio name = {translate("Type1")} value = "Type1"></Radio>
                            <Radio name = {translate("Type2")} value = "Type2"></Radio>
                        </RadioGroup>
                    </GuideBox>
                    
                </GuideBox>
            </Panel>
        </GuideBox>
        
    );
}

export default ImportSpring;