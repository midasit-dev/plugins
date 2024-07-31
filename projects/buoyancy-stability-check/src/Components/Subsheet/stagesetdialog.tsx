import React from 'react';
import { Dialog, Button, Typography, GuideBox } from "@midasit-dev/moaui";
import { useRecoilState } from 'recoil';
import { TextField } from '@mui/material'
import {
  TextFieldV2, Panel, DataGrid, Icon
} from '@midasit-dev/moaui';
import {
  constructionDataState, topelementstate, bottomelementstate, 
  exwallelementstate, inwallelementstate
} from '../variables';
import { selectElemList } from '../../utils_pyscript';
import { useSnackbar } from "notistack";

interface StagesetDialogProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  onStageSetAdded: () => void; // 새로운 콜백 함수 추가
  onComplete?: () => void;  // 새로운 prop 추가
}

const StagesetDialog: React.FC<StagesetDialogProps> = ({ open, setOpen, onStageSetAdded }) => {
    const [, setCloseMsg] = React.useState('');
    const [rows, setRows] = useRecoilState(constructionDataState);
    const [stageName, setStageName] = React.useState('');
    const { enqueueSnackbar } = useSnackbar();
    const [topslabelement, settopslabelement] = useRecoilState(topelementstate);
    const [bottomslabelement, setbottomslabelement] = useRecoilState(bottomelementstate);
    const [exwallelement, setexwallelement] = useRecoilState(exwallelementstate);
    const [inwallelement, setinwallelement] = useRecoilState(inwallelementstate);

    const ElemFetching = () => {
        // selectNodeList 함수를 호출하여 노드 목록을 가져옴
        const response = selectElemList();
        
        // response 객체에 'error' 속성이 있는지 확인하여 오류 처리
        if (response.hasOwnProperty('error')){
            console.error(response['error']);
        }
        
        // response가 유효하지 않으면 빈 배열을 반환
        if (!response) return [];
        
        // response가 유효하면 그 값을 반환
        return response;
      }
  
      const onClicktopelement = () => {
        const FetchingResult = ElemFetching();
        if (FetchingResult.length === 0){
          enqueueSnackbar('There is no elem to select.', {variant: 'error', autoHideDuration: 3000})
        }
        settopslabelement(FetchingResult.join(','));
      }
  
      const onClickbottomelement = () => {
        const FetchingResult = ElemFetching();
        if (FetchingResult.length === 0){
          enqueueSnackbar('There is no elem to select.', {variant: 'error', autoHideDuration: 3000})
        }
        setbottomslabelement(FetchingResult.join(','));
      }
      const onClickexwallelement = () => {
        const FetchingResult = ElemFetching();
        if (FetchingResult.length === 0){
          enqueueSnackbar('There is no elem to select.', {variant: 'error', autoHideDuration: 3000})
        }
        setexwallelement(FetchingResult.join(','));
      }
  
      const onClickinwallelement = () => {
        const FetchingResult = ElemFetching();
        if (FetchingResult.length === 0){
          enqueueSnackbar('There is no elem to select.', {variant: 'error', autoHideDuration: 3000})
        }
        setinwallelement(FetchingResult.join(','));
      }
  
  
        const addRow = () => {

          if (!bottomslabelement.trim()) {
            enqueueSnackbar('Bottom slab must be selected.', {variant: 'error', autoHideDuration: 3000});
            return;
          }
          if (!exwallelement.trim()) {
            enqueueSnackbar('External wall must be selected.', {variant: 'error', autoHideDuration: 3000});
            return;
          }
          if (bottomslabelement.trim() === exwallelement.trim()) {
            enqueueSnackbar('Bottom slab and External wall cannot be the same.', {variant: 'error', autoHideDuration: 3000});
            return;
          }
        const newRow = {
          id: rows.length + 1,
          name: stageName,
          top: topslabelement,
          bottom: bottomslabelement,
          extWall: exwallelement,
          intStr: inwallelement,
        };
  
        setRows([...rows, newRow]);
        // Reset input fields
        setStageName('');
        settopslabelement('');
        setbottomslabelement('');
        setexwallelement('');
        setinwallelement('');
        onStageSetAdded();
      };
      
      const deleteRow = (id: any) => {
        setRows(rows.filter((row:any) => row.id !== id));
      };
      const colwidth = 59;
      const columns = [
        { field: 'id', headerName: 'No', width: 10, sortable: false },
        { field: 'name', headerName: 'Name', width: colwidth, sortable: false },
        { field: 'top', headerName: 'Top', width: colwidth, sortable: false },
        { field: 'bottom', headerName: 'Bottom', width: colwidth, sortable: false },
        { field: 'extWall', headerName: 'Ext. Wall', width: colwidth, sortable: false },
        { field: 'intStr', headerName: 'Int. Str', width: colwidth, sortable: false },
        {
          field: 'actions',
          headerName: '',
          width: 10,
          sortable: false,
          renderCell: (params:any) => (
            <div style={{ cursor: 'pointer' }} onClick={() => deleteRow(params.row.id)}> 
            <Icon iconName="Delete" />
          </div>
          )
        }
      ];
      
  
      return (
        <>
            <Dialog
                open={open}
                setOpen={setOpen}
                // headerIcon={<Icon iconName="info" />}
                headerTitle="Construction Stage Set"
                onClose={() => {
                    setCloseMsg('Construction Stage Set closed!');
                }}
            >
                                <GuideBox width={430} height={590} marginLeft={1}>
                                    {/* Stageset 컴포넌트의 내용을 여기에 넣습니다 */}
                                    <GuideBox marginTop={1}>
                                        <Typography variant="h1">Add Construction Set</Typography>
                                        <GuideBox row horLeft spacing={2} verCenter marginLeft={2}>
                                            <GuideBox width={150}>
                                                <Typography>Construction Stage Name: </Typography>
                                            </GuideBox>
                                            <GuideBox horLeft width={200}>
                                                <TextFieldV2
                                                    placeholder="Enter name"
                                                    value={stageName}
                                                    onChange={(e) => setStageName(e.target.value)}
                                                    inputAlign="center"
                                                    width={220}
                                                />
                                            </GuideBox>
                                        </GuideBox>
                                    </GuideBox>

                                    
                                    <GuideBox row horLeft spacing={2} verCenter marginLeft={2}>
                                        <GuideBox width={150}>
                                        <Typography>Top Slab: </Typography>
                                        </GuideBox>
                                        <GuideBox horLeft width={200}>
                                        <TextField
                                            size = 'small'
                                            placeholder="Select Element at Midas Civil"
                                            value={topslabelement}
                                            onChange={(e:any) => settopslabelement(e.target.value)}
                                            inputProps={{onClick:onClicktopelement}}
                                            style={{width: 220, height : '30px'}}
                                        />
                                        </GuideBox>
                                    </GuideBox>

                                    <GuideBox row horLeft spacing={2} verCenter marginLeft={2}>
                                        <GuideBox width={150}>
                                        <Typography>Bottom Slab: </Typography>
                                        </GuideBox>
                                        <GuideBox horLeft width={200}>
                                        <TextField
                                            size = 'small'
                                            placeholder="Select Element at Midas Civil"
                                            value={bottomslabelement}
                                            onChange={(e:any) => setbottomslabelement(e.target.value)}
                                            inputProps={{onClick:onClickbottomelement}}
                                            style={{width: 220, height : '30px'}}
                                        />
                                        </GuideBox>
                                    </GuideBox>

                                    <GuideBox row horLeft spacing={2} verCenter marginLeft={2}>
                                        <GuideBox width={150}>
                                        <Typography>External Wall: </Typography>
                                        </GuideBox>
                                        <GuideBox horLeft width={200}>
                                        <TextField
                                            size = 'small'
                                            placeholder="Select Element at Midas Civil"
                                            value={exwallelement}
                                            onChange={(e:any) => setexwallelement(e.target.value)}
                                            inputProps={{onClick:onClickexwallelement}}
                                            style={{width: 220, height : '30px'}}
                                        />
                                        </GuideBox>
                                    </GuideBox>

                                    <GuideBox row horLeft spacing={2} verCenter marginLeft={2}>
                                        <GuideBox width={150}>
                                        <Typography>Internal Wall: </Typography>
                                        </GuideBox>
                                        <GuideBox horLeft width={200}>
                                        <TextField
                                            size = 'small'
                                            placeholder="Select Element at Midas Civil"
                                            value={inwallelement}
                                            onChange={(e:any) => setinwallelement(e.target.value)}
                                            inputProps={{onClick:onClickinwallelement}}
                                            style={{width: 220, height : '30px'}}
                                        />
                                        </GuideBox>
                                    </GuideBox>

                                    <GuideBox width={420} horCenter spacing={2} verCenter marginLeft={2} marginTop={1} marginBottom={1}>
                                        <Button onClick={addRow}>Save</Button>
                                    </GuideBox>
                                    <Panel variant="box" width={400} height={350} padding={0}>
                                        <DataGrid
                                            columnHeaderHeight={40}
                                            rowHeight={40}
                                            disableColumnMenu
                                            disableColumnFilter
                                            hideFooter
                                            columns={columns}
                                            rows={rows}
                                        />
                                    </Panel>
                                </GuideBox>
                                </Dialog>
        </>
    );
}

export default StagesetDialog;
