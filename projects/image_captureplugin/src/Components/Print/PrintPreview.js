import {
    Button,
    GuideBox,
    Panel,
    TextField,
    Typography,
    VerifyUtil
} from "@midasit-dev/moaui";
import { IconButton } from "@mui/material";
import { SimpleTreeView, TreeItem } from "@mui/x-tree-view";
import { useState } from "react";
import { useRecoilState } from "recoil";
import { CaptureWorker } from "../../Workers/CaptureWorker";
import { VarLoadCombination, VarModelPreviewNode, VarPrintData, VarPrintSavePath, VarPrintSelectedLC, VarPrintSizeH, VarPrintSizeV } from "../var";
import { BuildCaptureJsonDatas, BuildCaptureJsonDatasModel } from "./CaptureUtils";
import { PrintSize } from "./PrintSize";

export const awaiter = async (func, json) => {
    try {
        if (VerifyUtil.getMapiKey() !== "") await func(json);
    } catch (_) {
        console.log(_);
    }
};

const PrintPreview = () => {
    const [savePath, setSavePath] = useRecoilState(VarPrintSavePath);
    const [printData, setPrintData] = useRecoilState(VarPrintData);
    const [modelPreviewMode, setModelPreviewMode] = useRecoilState(VarModelPreviewNode);
    const [isPrintSizeVisible, setPrintSizeVisible] = useState(false);
    const [printH, setPrintH] = useRecoilState(VarPrintSizeH);
    const [printV, setPrintV] = useRecoilState(VarPrintSizeV);
    const [lc, setLc] = useRecoilState(VarLoadCombination);
    const [selected, setSelected] = useRecoilState(VarPrintSelectedLC);

    const [json, setJson] = useState([]);

    const handlePrint = () => {
        //트리에 체크박스 반영후 작업 예정
        // var newData = [];
        // for (const item of selected) {
        //     if (printData[item]) {
        //         newData[item] = printData[item];
        //     }
        // }
        let path = savePath;
        if(!path.endsWith("\\"))
            path += "\\";

        const datas = BuildCaptureJsonDatas(printData, printH, printV, path);
        const datasModel = BuildCaptureJsonDatasModel(modelPreviewMode, printH, printV, path);
        const merge  = datas.concat(datasModel)
        setJson(merge);
        if (merge == null) return;
        for (const json of merge) {
            awaiter(CaptureWorker, JSON.stringify(json));
        }
    };

    const deleteKey = (obj, keyToDelete) => {
        for (let key in obj) {
            if (obj.hasOwnProperty(key)) {
                if (key === keyToDelete) {
                    delete obj[key];
                } else if (typeof obj[key] === 'object' && obj[key] !== null) {
                    deleteKey(obj[key], keyToDelete);
                }
            }
        }
    }

    const handleDelete = (key) => () => {
        var newBpNode = JSON.parse(JSON.stringify(printData));
        deleteKey(newBpNode, key);
        setPrintData(newBpNode);
    };

    // 노드의 label을 저장하는 객체
    const labelMap = {};
    const renderTreeItems = (data, nodeIdPrefix = '') =>
        Object.entries(data).map(([key, value], index) => {
            const nodeId = `${nodeIdPrefix}${key}-${index}`;
            labelMap[nodeId] = key; // nodeId와 label 매핑

            if (typeof value === 'object' && !Array.isArray(value) && value !== null) {
                return (
                    <TreeItem key={nodeId} itemId={nodeId} label={
                        <GuideBox row verCenter horSpaceBetween >
                            <GuideBox row horLeft verCenter padding={0}>
                                {/* <Checkbox /> */}
                                <Typography>{key}</Typography>
                            </GuideBox>
                            <IconButton edge="end" aria-label="delete" transparent onClick={handleDelete(key)}>
                                <img src={"svg/Delete.svg"} alt="icon" className="icon" />
                            </IconButton>
                        </GuideBox>}>
                        {renderTreeItems(value, `${nodeId}-`)}
                    </TreeItem>
                );
            } else {
                return <TreeItem key={nodeId} itemId={nodeId} label={`${key}: ${value}`} />;
            }
        });

    const handleDeleteModel = (key) => () => {
        var newBpNode = JSON.parse(JSON.stringify(modelPreviewMode));
        deleteKey(newBpNode, key);
        setModelPreviewMode(newBpNode);
    };
    
    const renderTreeItemsModel = (data, nodeIdPrefix = '') =>
        Object.entries(data).map(([key, value], index) => {
            const nodeId = `${nodeIdPrefix}${key}-${index}`;
            labelMap[nodeId] = key; // nodeId와 label 매핑

            if (typeof value === 'object' && !Array.isArray(value) && value !== null) {
                return (
                    <TreeItem key={nodeId} itemId={nodeId} label={
                        <GuideBox row verCenter horSpaceBetween >
                            <GuideBox row horLeft verCenter padding={0}>
                                {/* <Checkbox /> */}
                                <Typography>{key}</Typography>
                            </GuideBox>
                            <IconButton edge="end" aria-label="delete" transparent onClick={handleDeleteModel(key)}>
                                <img src={"svg/Delete.svg"} alt="icon" className="icon" />
                            </IconButton>
                        </GuideBox>}>
                        {renderTreeItems(value, `${nodeId}-`)}
                    </TreeItem>
                );
            } else {
                return <TreeItem key={nodeId} itemId={nodeId} label={`${key}: ${value}`} />;
            }
        });

    // PrintSize가 표시될 때 패널 높이를 동적으로 조절
    const getPanelHeight = () => {
        return isPrintSizeVisible ? '400px' : '550px';
    };

    return (
        <GuideBox verSpaceBetween show padding={3} spacing={1} width={'100%'} height={'100%'}>
            <Typography variant="h1">Print File</Typography>
            <Panel
                width="100%"
                height={getPanelHeight()}
                variant="shadow2"
                padding={0}
                border={'1px solid #eee'}
            >
                <GuideBox width={'100%'} height={'100%'} row={false} spacing={0}>
                    {/* Model 영역 (상단 50%) */}
                    <GuideBox width={'100%'} height={'50%'} padding={1}>
                        <Typography variant="h2" paddingBottom={1}>Model</Typography>
                        <div 
                            style={{ 
                                width: '100%',
                                height: 'calc(100% - 40px)',
                                overflow: 'auto',
                                position: 'relative'
                            }}
                        >
                            <div style={{ 
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                overflow: 'auto'
                            }}>
                                <SimpleTreeView 
                                    defaultExpandedItems={['root']}
                                    sx={{ 
                                        width: '95%',
                                        minHeight: 0,
                                        '& ul': {
                                            margin: 0,
                                            padding: 0
                                        },
                                        '& .MuiTreeItem-root': {
                                            margin: 0,
                                            padding: 0
                                        },
                                        '& .MuiTreeItem-content': {
                                            margin: 0
                                        },
                                        '& .MuiTreeItem-group': {
                                            margin: 0,
                                            marginLeft: '20px'
                                        }
                                    }}
                                >
                                    {renderTreeItemsModel(modelPreviewMode)}
                                </SimpleTreeView>
                            </div>
                        </div>
                    </GuideBox>
                    
                    {/* 구분선 */}
                    <GuideBox 
                        width={'100%'} 
                        height={'1px'} 
                        style={{ backgroundColor: '#eee' }} 
                    />
                    
                    {/* Result Category 영역 (하단 50%) */}
                    <GuideBox width={'100%'} height={'50%'} padding={1}>
                        <Typography variant="h2" paddingBottom={1}>Result Category</Typography>
                        <div 
                            style={{ 
                                width: '100%',
                                height: 'calc(100% - 40px)',
                                overflow: 'auto',
                                position: 'relative'
                            }}
                        >
                            <div style={{ 
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                overflow: 'auto'
                            }}>
                                <SimpleTreeView 
                                    defaultExpandedItems={['root']}
                                    sx={{ 
                                        width: '95%',
                                        minHeight: 0,
                                        '& ul': {
                                            margin: 0,
                                            padding: 0
                                        },
                                        '& .MuiTreeItem-root': {
                                            margin: 0,
                                            padding: 0
                                        },
                                        '& .MuiTreeItem-content': {
                                            margin: 0
                                        },
                                        '& .MuiTreeItem-group': {
                                            margin: 0,
                                            marginLeft: '20px'
                                        }
                                    }}
                                >
                                    {renderTreeItems(printData)}
                                </SimpleTreeView>
                            </div>
                        </div></GuideBox>
                </GuideBox>
            </Panel>
            
            <GuideBox spacing={1} width={'100%'}>
                {isPrintSizeVisible && (        <PrintSize width={'100%'} />)}
                <TextField width={'273px'} value={savePath} onChange={(e) => setSavePath(e.target.value)}/>
                <Button width={"100%"} onClick={() => setPrintSizeVisible(!isPrintSizeVisible)}>{"Print Size"}</Button>
                <Button width={"100%"} onClick={handlePrint}>Print Start</Button>
                {/* <DownloadButton2 width={"100%"} valueToDownload={json} buttonName="Test Json File"/> */}
            </GuideBox>
        </GuideBox>
    );
};

export default PrintPreview;