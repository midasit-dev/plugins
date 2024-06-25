import React, { useEffect } from 'react';
import { useRecoilState } from 'recoil';
import { 
	GuideBox, 
	Panel,
	TemplatesDualComponentsTypographyDropListSpaceBetween,
  Typography,
  Radio,
  RadioGroup,
  DataGrid,
  Button,
  TemplatesFunctionalComponentsDownloadButton as DownloadButton,
  TemplatesFunctionalComponentsUploadButton as UploadButton,
} from '@midasit-dev/moaui';
import BoringHole from './BoringHoleTable';
import LayerTable from './LayerTable';
import StructureGroup from './StructureGroup';
import { BH_Columns, BH_TableRows, LayerData, BH_Counter, Layer_Counter } from '../variables';
function Inputwindow(){

  const [BHColumns, setBHColumns] = useRecoilState(BH_Columns);
  const [BHRows, setBHRows] = useRecoilState(BH_TableRows);
  const [LayerDataList, setLayerDataList] = useRecoilState(LayerData);
  const [BH_Count, setBH_Count] = useRecoilState(BH_Counter);
  const [Layer_Count, setLayer_Cout] = useRecoilState(Layer_Counter);
  const SoilPTypeList = [
    ['Rankine', 0],
    ['Coulomb', 1],
  ]

  // BHColumns, BHRows, LayerDataList를 합쳐 다운로드할 데이터를 만든다.
  // 데이터는 json 형식으로 만들어진다.
  const DataforDownload = {
    BHColumns: BHColumns,
    BHRows: BHRows,
    LayerDataList: LayerDataList,
    BHCount : BH_Count,
    LayerCount : Layer_Count
  }

  const uploadData = (data: any) => {
    setBHColumns(data.BHColumns)
    setBHRows(data.BHRows)
    setLayerDataList(data.LayerDataList)
    setBH_Count(data.BHCount)
    setLayer_Cout(data.LayerCount)
  }
  return(
    <GuideBox width={550} spacing={1}>
      <TemplatesDualComponentsTypographyDropListSpaceBetween
        title="토압 종류"
        items = {SoilPTypeList}
      />
      <GuideBox row verCenter spacing={1}>
        <Typography variant='h1'> 지하 수위 고려 </Typography>
        <RadioGroup defaultValue="Consider" row>
          <Radio name="w/ Water Level" value = "Consider" />
          <Radio name="w/o Water Level" value= "Unconsider" />
        </RadioGroup>
      </GuideBox>
      <BoringHole />
      <LayerTable />
      <GuideBox row spacing={1}>
      <DownloadButton
            valueToDownload={DataforDownload}
            buttonProps={{
              color: "normal",
            }}
            buttonName="다운로드"
          />
          <UploadButton
            onAfterUpload={uploadData}
            buttonProps={{
              color: "normal",
            }}
            buttonName="업로드"
          />
      </GuideBox>
    </GuideBox>
  )
}

export default Inputwindow;