/**
 *		                                                                         __      
 *		                                                                        /\ \__   
 *		  ___     ___     ___ ___     _____     ___     ___       __     ___    \ \ ,_\  
 *		 /'___\  / __`\ /' __` __`\  /\ '__`\  / __`\ /' _ `\   /'__`\ /' _ `\   \ \ \/  
 *		/\ \__/ /\ \L\ \/\ \/\ \/\ \ \ \ \L\ \/\ \L\ \/\ \/\ \ /\  __/ /\ \/\ \   \ \ \_ 
 *		\ \____\\ \____/\ \_\ \_\ \_\ \ \ ,__/\ \____/\ \_\ \_\\ \____\\ \_\ \_\   \ \__\
 *		 \/____/ \/___/  \/_/\/_/\/_/  \ \ \/  \/___/  \/_/\/_/ \/____/ \/_/\/_/    \/__/
 *		                                \ \_\                                            
 *		                                 \/_/                                            
 */

import {
    GuideBox,
    Panel,
    Scrollbars,
    Typography
} from "@midasit-dev/moaui";
import { useState } from "react";
import { useRecoilState } from "recoil";

import MoaStack from "@midasit-dev/moaui/Components/Stack";
import { IconButton } from "@mui/material";
import { SimpleTreeView, TreeItem } from '@mui/x-tree-view';
import DownloadButton2 from "./Custom/DownloadButton2";
import { VarPreviewNode } from "./var";

//  import DBTab from "./DBTab"
//  import ViewTab from "./ViewTab"
//  import ConcreteBasic from "./ConcreteBasic";
//  import TimeDependentBasic from "./TimeDependentBasic";

const PreviewComponent = () => {
    const [bp_Node, setBP_Node] = useRecoilState(VarPreviewNode);
    const [selectedLabel, setSelectedLabel] = useState(''); // 선택된 노드의 label을 저장하기 위한 상태

    // 최상위 노드의 고정 순서 정의
    const topLevelOrder = [
        'Model',
        'DB', 
        'TypeOfDisplay',
        'View',
        // 'Element',
        // 'LoadCase',
        // 'Analysis',
        // 'Result'
        // 원하는 순서대로 키 이름을 추가하세요
    ];

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
        var newBpNode = JSON.parse(JSON.stringify(bp_Node));
        deleteKey(newBpNode, key);
        setBP_Node(newBpNode);
    };

    // 노드의 label을 저장하는 객체
    const labelMap = {};

    // 키들을 정렬하는 함수 (간단한 알파벳 순 정렬의 경우)
    // const getSortedEntries = (data) => {
    //     return Object.entries(data).sort(([a], [b]) => a.localeCompare(b));
    // };

    // 키들을 고정된 순서로 정렬하는 함수
    const getSortedEntries = (data, isTopLevel = false) => {
        const entries = Object.entries(data);
        
        if (isTopLevel && topLevelOrder.length > 0) {
            // 최상위 레벨의 경우 미리 정의된 순서 사용
            const sortedEntries = [];
            
            // 1. 먼저 정의된 순서대로 추가
            topLevelOrder.forEach(key => {
                const entry = entries.find(([k]) => k === key);
                if (entry) {
                    sortedEntries.push(entry);
                }
            });
            
            // 2. 정의되지 않은 키들을 알파벳 순으로 뒤에 추가
            const remainingEntries = entries
                .filter(([key]) => !topLevelOrder.includes(key))
                .sort(([a], [b]) => a.localeCompare(b));
            
            return [...sortedEntries, ...remainingEntries];
        } else {
            return entries;
            // 하위 레벨의 경우 알파벳 순 정렬 (또는 원본 순서 유지)
            return entries.sort(([a], [b]) => a.localeCompare(b));
        }
    };

    const renderTreeItems = (data, nodeIdPrefix = '', isTopLevel = false) => {
        const sortedEntries = getSortedEntries(data, isTopLevel);
        
        return sortedEntries.map(([key, value], index) => {
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
                        {renderTreeItems(value, `${nodeId}-`, false)}
                    </TreeItem>
                );
            } else {
                return <TreeItem key={nodeId} itemId={nodeId} label={`${key}: ${value}`} />;
            }
        });
    };

    const handleNodeSelect = (event, itemId) => {
        // labelMap에서 선택된 nodeId에 해당하는 label 값을 찾아 상태를 업데이트함
        setSelectedLabel(labelMap[itemId]);
        console.log("Selected label:", selectedLabel);
    };

    return (
        <GuideBox verSpaceBetween show padding={2} spacing={1.5} width={'100%'}>
            <Typography variant="body2">File List</Typography>
            <Panel
                width="100%"
                height={'100%'}
                variant="shadow2"
                padding={0}
                spacing={2}
                border='1px solid #eee'
            >
                <Scrollbars
                    width={'100%'}
                    height={'585px'}
                    autoHide
                >
                    <SimpleTreeView defaultExpandedItems={['root']} >
                        {renderTreeItems(bp_Node, '', true)}
                    </SimpleTreeView>
                </Scrollbars>
            </Panel>
<MoaStack width={'100%'} direction="row" justifyContent={"space-between"} spacing={1}>
    {/* <div style={{ flex: 1 }}>
        <UploadButton buttonName="Import Json" />
    </div> */}
    <div style={{ flex: 1 }}>
        <DownloadButton2 valueToDownload={bp_Node} buttonName="Result Category Export Json" />
    </div>
</MoaStack>
        </GuideBox>
    );
};

export default PreviewComponent;