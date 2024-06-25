import React from 'react';
import { useRecoilState } from 'recoil';
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
import {BH_Columns, BH_Counter, BH_TableRows, Layer_Counter} from '../variables'
import { set } from 'lodash';

function BoringHole () {

  interface Row {
    id: number;
    Index: string;
    BH1: any;
    [key: string]: any;
  }

  const [BHColumns, setBHColumns] = useRecoilState(BH_Columns);
  const [BH_Count, setBH_Count] = useRecoilState(BH_Counter);
  const [BHTableRows, setBHTableRows] = useRecoilState(BH_TableRows);
  
  const handleAddBorehole = () => {
    const newColumn = { field: `BH${BH_Count + 1}`, headerName: `BH ${BH_Count + 1}`, width: 80, editable: true };
    setBHColumns((prevColumns) => [...prevColumns, newColumn]);
    setBH_Count(BH_Count + 1);

    const new_BH_TableRows = BHTableRows.map((item) => {
      return { ...item, [`BH${BH_Count + 1}`]: 0 };
    }
    );
    setBHTableRows(new_BH_TableRows);
  }

  const handleDeleteBorehole = () => {
    if (BH_Count > 1) {
      const newColumns = BHColumns.slice(0, BHColumns.length - 1);
      setBHColumns(newColumns);
      setBH_Count(BH_Count - 1);

      const new_BH_TableRows = BHTableRows.map((item) => {
        const newItem:any = { ...item };
        delete newItem[`BH${BH_Count}`];
        return newItem;
      });
      setBHTableRows(new_BH_TableRows);
    }
  }


  const processRowUpdateHandler = React.useCallback((updatedRow: Row) => {
    
    const updatedRows = BHTableRows.map((row) =>
      row.id === updatedRow.id ? { ...updatedRow } : row
    );
    setBHTableRows(updatedRows);
    return updatedRow;
  }, [BHTableRows]);
  
  return (
    <GuideBox width={550} spacing={1}>
      <GuideBox width={550} row horSpaceBetween verCenter>
        <Typography variant='h1' > Boring Hole Data </Typography>
        <GuideBox row horRight verCenter spacing={1}>
          <Button
          variant='outlined'
          onClick={handleAddBorehole}
          >
            Add B.H.
          </Button>
          <Button
          variant='outlined'
          onClick={handleDeleteBorehole}
          >
            Delete B.H.
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
          columns={BHColumns}
          rows = {BHTableRows}
          onProcessRowUpdateError={(error) => {
              console.error('Error while updating row:', error);
              // 추가적인 예외 처리 로직을 추가할 수 있습니다.
          }}
      ></DataGrid>
      </div>
      
    </GuideBox>
  )
}

export default BoringHole;