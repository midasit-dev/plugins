import React from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import { 
	GuideBox, 
	Panel,
	TemplatesDualComponentsTypographyDropListSpaceBetween,
  Typography,
  Radio,
  RadioGroup,
  DataGrid,
  Button
} from '@midasit-dev/moaui';
import {BH_Columns, BH_Counter, BH_TableRows, Layer_Counter, LayerData} from '../variables'

function LayerTable(){
  interface Row {
    id: number;
    Index: string;
    BH1: any;
    [key: string]: any;
  }

  const [layerData, setLayerData] = useRecoilState(LayerData);
  const [BH_Count, setBH_Count] = useRecoilState(BH_Counter);
  const [BHTableRows, setBHTableRows] = useRecoilState(BH_TableRows);
  const [Layer_Count, setLayer_Cout] = useRecoilState(Layer_Counter);
  const Row_Count = useRecoilValue(Layer_Counter);
  
  const LayerColumns = [
    { field: 'LayerNo', headerName: 'Layer', width: 100, editable: false, sortable : false },
    { field: 'SoilType', headerName: 'SoilType', width: 80, editable: true, sortable : false,
    type: 'singleSelect', valueOptions : [{value : 'Sand', label : "Sand"}, {value : "Clay", label : "Clay"}]},
    { field: 'KH', headerName: 'KH', width: 80, editable: true, sortable : false },
    { field: 'gamma_t', headerName: 'γₜ', width: 80, editable: true, sortable : false },
    { field: 'gamma_sat', headerName: 'γₛₐₜ', width: 80, editable: true, sortable : false },
    { field: 'friction_angle', headerName: 'φ', width: 80, editable: true, sortable : false },
    { field: 'cohesion', headerName: 'C', width: 80, editable: true, sortable : false },
    { field: 'circumference', headerName: 'D', width: 80, editable: true, sortable : false },
  ]

  React.useEffect(() => {
    const LayerNum = Row_Count
    const LayerDataNum = layerData.length
    if (LayerDataNum < LayerNum){
      const newLayerData = JSON.parse(JSON.stringify(layerData))
      newLayerData.push({ id: LayerDataNum+1, LayerNo: LayerDataNum+1, SoilType: 'Sand', KH: 0, gamma_t: 0, gamma_sat: 0, friction_angle: 0, cohesion: 0, circumference: 0 })
      setLayerData(newLayerData)
    }
    else if (LayerDataNum > LayerNum){
      const newLayerData = JSON.parse(JSON.stringify(layerData))
      newLayerData.pop()
      setLayerData(newLayerData)
    }
    
  }, [Row_Count])

  const processRowUpdateHandler = (updatedRow: any) => {
    const updatedRows = layerData.map((row) =>
      row.id === updatedRow.id ? { ...updatedRow } : row
    );
    setLayerData(updatedRows);
    return updatedRow;
  };

  console.log(JSON.stringify(layerData))
  console.log(JSON.stringify(BHTableRows))
  const handleAddLayer = () => {
    const newRows = JSON.parse(JSON.stringify(BHTableRows))
    const newRow:any = { id: Layer_Count + 3, Index: `Layer ${Layer_Count + 1}` };
    
    for(let i = 1; i <= BH_Count; i++){
      newRow[`BH${i}`] = 0;
    }
    newRows[Layer_Count+2]['id'] = Layer_Count + 4;
    newRows.splice(Layer_Count+2,0,newRow)

    setBHTableRows(newRows);
    setLayer_Cout(Layer_Count + 1);

  }

  const handleDeleteLayer = () => {
    if(Layer_Count > 1){
      const newRows: Row[] = BHTableRows.slice();
      newRows.splice(Layer_Count+1, 1)
      setBHTableRows(newRows)
      setLayer_Cout(Layer_Count-1)
    }
  }

  return (
    <GuideBox width={550} spacing={1}>
      <GuideBox width={550} row horSpaceBetween verCenter>
        <Typography variant='h1'> Layer Data </Typography>
        <GuideBox row horRight verCenter spacing={1}>
          <Button
          variant='outlined'
          onClick={handleAddLayer}
          >
            Add Layer
          </Button>
          <Button
          variant='outlined'
          onClick={handleDeleteLayer}
          >
            Delete Layer
          </Button>
        </GuideBox>
      </GuideBox>
      
      <div style={{ height: 155, width: '100%'}}>
        <DataGrid
          columnHeaderHeight={40}
          rowHeight={40}  
          disableColumnMenu
          disableColumnFilter
          hideFooter
          processRowUpdate={processRowUpdateHandler}
          columns={LayerColumns}
          rows = {layerData}
          onProcessRowUpdateError={(error) => {
              console.error('Error while updating row:', error);
              // 추가적인 예외 처리 로직을 추가할 수 있습니다.
          }}
        ></DataGrid>
      </div>
    </GuideBox>
  )
}

export default LayerTable;