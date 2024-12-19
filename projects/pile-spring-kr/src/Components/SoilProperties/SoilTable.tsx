import React, { useEffect } from 'react';
import {GuideBox, 
IconButton, Icon, DataGrid
} from '@midasit-dev/moaui';
import {} from '@mui/material';

import {useRecoilState, useRecoilValue} from 'recoil';
import {SoilData, CalVsiState, LiquefactionState, SlopeEffectState, GroundLevel} from '../variables';
import { useTranslation } from 'react-i18next';

function SoilTable(){

    const { t:translate, i18n: internationalization} = useTranslation();

    //Table 배열 형식
    interface Row {
        id: number;
        LayerNo : number;
        LayerType : string;
        LayerDepth : number;
        Depth : number;
        AvgNValue : number;
        // c : number;
        // pi : number;
        gamma : number;
        aE0 : number;
        aE0_Seis : number;
        vd : number;
        Vsi : number;
        ED : number;
        DE : number;
        Length : number;
    }

    //Vsi Editable 상태
    const VsiEditable = useRecoilValue(CalVsiState)
    //Liquirefaction 상태
    const DEEditable = useRecoilValue(LiquefactionState)

    //SlopeEffect 상태
    const SlopeEffect = useRecoilValue(SlopeEffectState)

    const [soilData, setSoilData] = useRecoilState(SoilData)
    
    const groundLevel = useRecoilValue(GroundLevel)
    const columns: any = [
        {field : 'LayerNo', headerName : translate('Soil_Table_No'), width : 50, editable : true, sortable : false},
        {field : 'LayerType',  headerName : translate('Soil_Table_Type') ,width : 100, editable : true, sortable : false, 
        type : 'singleSelect', valueOptions : [{value : 'SoilType_Clay', label : translate('SoilType_Clay')}, {value : "SoilType_Sand", label : translate('SoilType_Sand')},{value : "SoilType_Sandstone", label : translate('SoilType_Sandstone')}]
        },
        {field : 'LayerDepth', headerName : translate('Soil_Table_Level'), width : 100, editable : false, sortable : false,  valueFormatter: (params: any) => params.value.toFixed(3)},
        {field : 'Depth', headerName : translate('Soil_Table_Depth'), width : 80, editable : true, sortable : false},
        {field : 'AvgNValue', headerName : translate('Soil_Table_AvgN'), width : 80, editable : true, sortable : false},
        // {field : 'c', 
        // width : 70, 
        // editable : true, 
        // sortable : false,
        // renderHeader: (params: any) => (
        //     <div style={{lineHeight:'1', textAlign: 'center'}}>
        //         c<br/>(kN/m²)
        //     </div>
        // )
        // },
        // {field : 'pi',  headerName : '\u03C6(°)',width : 50, editable : true, sortable : false},
        {field : 'gamma',  
        width : 70, 
        editable : true, 
        sortable : false,
        renderHeader: (params: any) => (
            <div style={{lineHeight:'1', textAlign: 'center'}}>
                γ<br/>(kN/m³)
            </div>
        )
        },
        {field : 'aE0',  
        width : 80, 
        editable : true, 
        sortable : false,
        renderHeader: (params: any) => (
            <div style={{lineHeight:'1', textAlign: 'center'}}>
                {translate('Soil_Table_AE0_Normal')}<br/>(kN/m²)
            </div>
        )
        },
        {field : 'aE0_Seis',  
        width : 80, 
        editable : true, 
        sortable : false,
        renderHeader: (params: any) => (
            <div style={{lineHeight:'1', textAlign: 'center'}}>
                {translate('Soil_Table_AE0_Seismic')}<br/>(kN/m²)
            </div>
        )
        },
        {field : 'vd',  
        width : 50, 
        editable : true, 
        sortable : false,
        renderHeader: (params: any) => (
            <>ν<span style={{verticalAlign: "sub", fontSize: "smaller"}}>d</span></>
        )
        },
        {field : 'Vsi', 
        width : 80, 
        editable : !VsiEditable, 
        sortable : false,
        renderHeader: (params: any) => (
            <div style={{lineHeight:'1', textAlign: 'center'}}>
                Vₛᵢ<br/>(m/s)
            </div>
        ),
        // 입력값이 숫자가 아닐 경우 0 반환
        // 
        valueFormatter: (params: any) => {
            if (isNaN(params.value)){
                return 0
            }
            Number(params.value).toFixed(3)
        }
        },
        
        {field : 'ED',
        width : 80, 
        editable : false, 
        sortable : false,
        renderHeader: (params: any) => (
            <div style={{lineHeight:'1', textAlign: 'center'}}>
                E<span style={{verticalAlign: "sub", fontSize: "smaller"}}>D</span><br/>(kN/m²)
            </div>
        ),
        valueFormatter: (params: any) => {
            params.value.toFixed(3)}
        },
        {field : 'DE',  
        width : 50, 
        editable : DEEditable, 
        sortable : false,
        renderHeader: (params: any) => (
            <>D<span style={{verticalAlign: "sub", fontSize: "smaller"}}>E</span></>
        )
        },
        {field : 'Length', 
        width : 80, 
        editable : SlopeEffect, 
        sortable : false,
        renderHeader: (params: any) => (
            <div style={{lineHeight:'1', textAlign: 'center'}}>
                {translate('Soil_Table_Length')}<br/>(m)
            </div>
        )
        }
    ]
    
    // DataGrid에 행 추가
    const handleAddClick = () => {
        const newRowIndex = soilData.length + 1;
        let gamma = 18
        let newVsi = 0
        if (VsiEditable == true){
            newVsi = (100* Math.pow(10,(1/3)))
        }
        let Gd = gamma/9.8 * Math.pow(0.8*newVsi,2)
        let Ed = 2*(1+0.5)*Gd

        const lastRow = soilData.length > 0 ? soilData[soilData.length - 1] : null;
        const newLayerDepth = lastRow ? lastRow.LayerDepth - lastRow.Depth : 0;   

        const newRow = { 
            id: newRowIndex, 
            LayerNo: newRowIndex,
            LayerType: 'SoilType_Clay', 
            LayerDepth : newLayerDepth,
            Depth : 10,
            AvgNValue : 10,
            // c : 0,
            // pi : 0,
            gamma : gamma,
            aE0 : 14000,
            aE0_Seis : 28000,
            vd : 0.5,
            Vsi : Number(newVsi),
            ED : Number(Ed),
            DE : 1,
            Length : 1,
        };
        setSoilData(prevRows => [...prevRows, newRow]);
    };
    // DataGrid 행 삭제
    const handelRemoveClick = () => {
        setSoilData((prevRows: Row[]) => prevRows.slice(0, prevRows.length - 1));
    }

    // DataGird 값 변경 시 SoilData 업데이트
    const processRowUpdateHandler = React.useCallback((newRow: any) => {
        
        // Vsi 값 자동 계산, false일 경우 입력했던 값이 반환됨
        if (VsiEditable == true){
            let newVsi
            if (newRow.LayerType === 'SoilType_Clay'){
                newVsi = 100* Math.pow(Math.min(newRow.AvgNValue, 25),(1/3))
                newRow.Vsi = Number(newVsi)
            }
            else if (newRow.LayerType === 'SoilType_Sand' || newRow.LayerType === 'SoilType_Sandstone'){
                newVsi = 80* Math.pow(Math.min(newRow.AvgNValue, 50),(1/3))
                newRow.Vsi = Number(newVsi)
            }
        }
        else {
            newRow.Vsi = Number(newRow.Vsi)
        }
        
        //ED 값 자동 계산
        let Vsd = 0
        if (newRow.Vsi < 300){
            Vsd = 0.8*newRow.Vsi
        }
        else {
            Vsd = newRow.Vsi
        }
        let Gd = newRow.gamma/9.8 * Math.pow(Vsd,2)
        newRow.ED = Number((2*(1+Number(newRow.vd))*Gd))

        let updatedRow:any = []
        let TopLevel = groundLevel
        // TopLevel 에 따른 Table 전체 Level 정리
        setSoilData((prev) => {
            const newRows = prev.map((row) => {
            if (row.id === newRow.id) {
                updatedRow = { ...newRow, LayerDepth : Number(Number(TopLevel)) }; 
                TopLevel = TopLevel - newRow.Depth;
                return updatedRow;
            } else {
                const newRow = { ...row, LayerDepth: Number(Number(TopLevel)) };
                TopLevel = TopLevel - row.Depth;
                return newRow;
            }
            });
            
            return newRows;
        });

        return updatedRow;
	}, [setSoilData, VsiEditable]);

    // LayerDepth 값 자동 계산
    useEffect(() => {
        let TopLevel = groundLevel
        let newData = []
        for (let i = 0; i < soilData.length; i++) {
            let updatedItem = { ...soilData[i] };
            updatedItem.LayerDepth = Number(Number(TopLevel))
            TopLevel = TopLevel - updatedItem.Depth;
            newData.push(updatedItem);
        }
        setSoilData(newData)
    },[groundLevel])

    return(
        <GuideBox>
            <GuideBox width = {800} row horRight spacing={1}>
                <IconButton transparent
                onClick={handleAddClick}>
                    <Icon iconName = "Add" />
                </IconButton>
                <IconButton transparent
                onClick = {handelRemoveClick}>
                    <Icon iconName = "Remove" />
                </IconButton>
            </GuideBox>
            <div style={{ height: 410, width: 800}}>
                <DataGrid
                    columnHeaderHeight={60}
                    rowHeight={80}  
                    disableColumnMenu
                    disableColumnFilter
                    hideFooter
                    processRowUpdate={processRowUpdateHandler}
                    columns={columns}
                    rows = {soilData}
                    onProcessRowUpdateError={(error) => {
                        console.error('Error while updating row:', error);
                        // 추가적인 예외 처리 로직을 추가할 수 있습니다.
                    }}
                ></DataGrid>
            </div>
        </GuideBox>
    )
}

export default SoilTable