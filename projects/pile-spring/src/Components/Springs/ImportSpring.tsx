import {GuideBox, 
    Typography,
    Panel,
    Radio, RadioGroup,
} from '@midasit-dev/moaui';
import {useRecoilState, useRecoilValue} from 'recoil';
import {ImportType, 
} from '../variables';
import Civil_Cord_System from '../../Civil_Cord_System.png'


export function ExportMatrix(XResult:any, ZResult:any){
    let matrix = [];
    matrix = [XResult[0],ZResult[0],XResult[3],ZResult[5],XResult[5],1000000000000,0,XResult[1],0,XResult[2],0,ZResult[1],-ZResult[2],0,0,ZResult[4],-XResult[4],0,0,0,0]
    return matrix;

}

function ImportSpring(){

    const [importType, setImportType] = useRecoilState(ImportType);

    const SelectType = (e:any, state:any) => {
        setImportType(state);
    }
    
    return(
        <GuideBox marginRight={1} marginBottom={1}>
            <GuideBox>
                <Typography variant='h1' margin={1}>General Spring 입력</Typography>
            </GuideBox>
            <Panel width={820} height={740}>
                <GuideBox spacing={1}>
                    <div>
                        <img src={Civil_Cord_System} alt="Civil_Cord" width="100%"/>
                    </div>
                    <GuideBox width={800} row verCenter spacing={1} horCenter>
                        <Typography variant='h1' >Select Import Type :</Typography>
                        <RadioGroup onChange={SelectType} value = {importType} row spacing={2}>
                            <Radio name = "Type1" value = "Type1"></Radio>
                            <Radio name = "Type2" value = "Type2"></Radio>
                        </RadioGroup>
                    </GuideBox>
                    
                </GuideBox>
            </Panel>
        </GuideBox>
        
    );
}

export default ImportSpring;