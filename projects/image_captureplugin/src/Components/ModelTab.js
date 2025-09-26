import MoaStack from "@midasit-dev/moaui/Components/Stack";
import Typography from "@midasit-dev/moaui/Components/Typography";
import * as React from "react";
import { useRecoilState } from "recoil";

import { Button, DropList, GuideBox, Panel, Switch, TextField, VerifyUtil } from "@midasit-dev/moaui";

import ImageTextButton from "./ImageTextButton";
import { VarModelPreviewNode, VarModelPreviewSelected, VarModelViewActive, VarModelViewActiveElemIds, VarModelViewActiveGroup, VarModelViewActiveNodeIds, VarModelViewActiveUse, VarModelViewDesc, VarModelViewFloorOption, VarModelViewHidden, VarModelViewPropName, VarModelViewUseDesc, VarModelViewViewAngleH, VarModelViewViewAngleV, VarModelViewViewType, VarModelViewViewUse, VarModelViewWallMark, VarPrintImportData } from "./var";

import { Checkbox } from "@mui/material";
import { DataLoader } from "../Workers/DataLoader";
import { UpdateCurrent } from "./DB/SaveUtils";

const awaiter = async (setPending, setListData, func, cmd) => {
    try {
        setPending(true);
        if (VerifyUtil.getMapiKey() !== "") setListData(await func(cmd));
        setPending(false);
    } catch (_) {
        console.log(_);
    }
};

export const ModelTab = React.forwardRef((props, ref) => {
    const [openFormDlg, setOpenFormDlg] = React.useState(false);
    React.useEffect(() => {
        if (!VerifyUtil.isExistQueryStrings('redirectTo') && !VerifyUtil.isExistQueryStrings('mapiKey')) {
            setOpenFormDlg(true);
        }
    }, []);

    const [selectData, setSelectData] = React.useState([]);
    const [groupData, setGroupData] = React.useState([]);
    const [groups, setGroups] = React.useState([]);
    const [storData, setStorData] = React.useState([]);
    const [stors, setStors] = React.useState([]);

    const [isPending, setPending] = React.useState(false);

    // Floor 체크박스 상태 추가
    const [floorOption, setFloorOption] = useRecoilState(VarModelViewFloorOption);

    //React.useEffect(() => {}, []);React
    const [useActive, setUseActive] = useRecoilState(VarModelViewActiveUse);
    const [active, setActive] = useRecoilState(VarModelViewActive);
    const [elemIds, setElemIds] = useRecoilState(VarModelViewActiveElemIds);
    const [nodeIds, setNodeIds] = useRecoilState(VarModelViewActiveNodeIds);
    const [selectedGroup, setSelectedGroup] = useRecoilState(VarModelViewActiveGroup);

    const [useView, setUseView] = useRecoilState(VarModelViewViewUse);
    const [view, setView] = useRecoilState(VarModelViewViewType);
    const [angleH, setAngleH] = useRecoilState(VarModelViewViewAngleH);
    const [angleV, setAngleV] = useRecoilState(VarModelViewViewAngleV);
    const [hidden, setHidden] = useRecoilState(VarModelViewHidden);
    const [propName, setPropName] = useRecoilState(VarModelViewPropName);
    const [wallMark, setWallMark] = useRecoilState(VarModelViewWallMark);
    const [useDesc, setUseDesc] = useRecoilState(VarModelViewUseDesc);
    const [desc, setDesc] = useRecoilState(VarModelViewDesc);

    const [previewNode, setPreviewNode] = useRecoilState(VarModelPreviewNode);
    const [previewSelected, setPreviewSelected] = useRecoilState(VarModelPreviewSelected);
    const [importData, setImportData] = useRecoilState(VarPrintImportData);

    // 체크박스 활성화 여부 확인 (모든 상태가 초기화된 후에 정의)
    const isFloorCheckboxEnabled = React.useMemo(() => {
        if (!selectedGroup) return false;
        return stors.some(stor => stor.STORY_NAME === selectedGroup);
    }, [selectedGroup, stors]);

    // Floor 옵션 체크박스 핸들러
    const handleFloorOptionChange = (option) => {
        // 체크박스가 비활성화된 경우 동작하지 않음
                
            // 다른 옵션 선택
            setFloorOption(option);
        
    };

    const handleSaveClick = () => {        
        const copy = JSON.parse(JSON.stringify(previewNode));

        const node = {};
        if (useActive) {
            const node1 = {
                Use: useActive,
                Active: active
            };

            if (active == "Active") {
                node1["ElemIds"] = elemIds;
                node1["NodeIds"] = nodeIds;
            }
            else if (active == "Identity") {
                node1["Group"] = selectedGroup;
                node1["IdentityType"]   = "Group";                                    
                if(isFloorCheckboxEnabled){                 
                 node1["IdentityType"]   = "Story";                                    
                 node1["FloorOption"] = floorOption;
                }                
            }

            node["Active"] = node1;
        }

        if (useView) {
            const nodeView = {
                Use: useView,
                View: view,
                AngleH: angleH,
                AngleV: angleV
            };

            node["View"] = nodeView;

        }
        if (hidden) {
            node["Hidden"] = hidden;
        }
        if (propName) {
            node["PropName"] = propName;
        }
        if (wallMark) {
            node["WallMark"] = wallMark;
        }
        if (useDesc) {
            node["UseDesc"] = useDesc;
            node["Desc"] = desc;
        }

        var name = "Model";
        var index = "";
        var counter = 1;

        while (copy[name + index] != null) {
            index = counter;
            counter++;
        }

        copy[name + index] = node;

        setPreviewNode(copy);

        UpdateCurrent(copy, importData, setImportData);
    };

    const handleModifyClick = () => {
        if(previewSelected == "")
            return;
        const copy = JSON.parse(JSON.stringify(previewNode));

        const node = {};
        if (useActive) {
            const node1 = {
                Use: useActive,
                Active: active
            };

            if (active == "Active") {
                node1["ElemIds"] = elemIds;
                node1["NodeIds"] = nodeIds;
            }
            else if (active == "Identity") {
                node1["Group"] = selectedGroup;
                node1["IdentityType"]   = "Group";                                    
                if(isFloorCheckboxEnabled){                 
                 node1["IdentityType"]   = "Story";                                    
                 node1["FloorOption"] = floorOption;
                }                
            }

            node["Active"] = node1;
        }

        if (useView) {
            const nodeView = {
                Use: useView,
                View: view,
                AngleH: angleH,
                AngleV: angleV
            };

            node["View"] = nodeView;

        }
        if (hidden) {
            node["Hidden"] = hidden;
        }
        if (propName) {
            node["PropName"] = propName;
        }
        if (wallMark) {
            node["WallMark"] = wallMark;
        }
        if (useDesc) {
            node["UseDesc"] = useDesc;
            node["Desc"] = desc;
        }

        copy[previewSelected] = node;

        setPreviewNode(copy);

        UpdateCurrent(copy, importData, setImportData);
    };

    React.useEffect(() => {
        const loadGroup = async () => {
            await awaiter(setPending, setGroupData, DataLoader, "/DB/GRUP");
        };

        loadGroup();

        const loadStory = async () => {
            await awaiter(setPending, setStorData, DataLoader, "/DB/STOR");
        };

        loadStory();

    }, []);

    React.useEffect(() => {
    if(previewSelected == "")
        return;
    var currentNode = previewNode[previewSelected];
    if( currentNode === undefined)
        return;
    
    // 선택된 노드의 데이터를 UI 상태에 로드
    
    // Active 관련 데이터 로드
    if (currentNode.Active) {
        setUseActive(currentNode.Active.Use || false);
        setActive(currentNode.Active.Active || "All");
        
        if (currentNode.Active.Active === "Active") {
            setElemIds(currentNode.Active.ElemIds || []);
            setNodeIds(currentNode.Active.NodeIds || []);
        } else if (currentNode.Active.Active === "Identity") {
            setSelectedGroup(currentNode.Active.Group || "");
            // Floor 옵션 로드 (Story 타입인 경우)
            if (currentNode.Active.IdentityType === "Story") {
                setFloorOption(currentNode.Active.FloorOption || "");
            } else {
                setFloorOption("");
            }
        }
    } else {
        // Active 데이터가 없는 경우 초기화
        setUseActive(false);
        setActive("All");
        setElemIds([]);
        setNodeIds([]);
        setSelectedGroup("");
        setFloorOption("");
    }
    
    // View 관련 데이터 로드
    if (currentNode.View) {
        setUseView(currentNode.View.Use || false);
        setView(currentNode.View.View || "iso");
        setAngleH(currentNode.View.AngleH || 0);
        setAngleV(currentNode.View.AngleV || 0);
    } else {
        setUseView(false);
        setView("iso");
        setAngleH(30);
        setAngleV(15);
    }
    
    // 기타 옵션들 로드
    setHidden(currentNode.Hidden || false);
    setPropName(currentNode.PropName || false);
    setWallMark(currentNode.WallMark || false);
    setUseDesc(currentNode.UseDesc || false);
    setDesc(currentNode.Desc || "");

    }, [previewSelected, setPreviewSelected]);



    React.useEffect(()=>{
        if(active != "Identity"){
            setSelectedGroup("");
            setFloorOption("");

        }else{

        }

    }, [active, setActive]);

    const HandleActiveBySelect = () => {
        awaiter(setPending, setSelectData, DataLoader, "/VIEW/SELECT");
    }

    React.useEffect(() => {
        const select = selectData["SELECT"];
        if (select === undefined)
            return;

        const nodeList = select["NODE_LIST"];
        const elemList = select["ELEM_LIST"];
        setElemIds(elemList);
        setNodeIds(nodeList);

    }, [selectData, setSelectData]);

    React.useEffect(() => {
        if (groupData.GRUP === undefined)
            return;

        const entries = Object.entries(groupData.GRUP);

        // map을 사용하여 NAME 값을 추출
        setGroups(entries.map(([key, value]) => value));
    }, [groupData, setGroupData]);

    React.useEffect(() => {
        if (storData.STOR === undefined)
            return;

        const entries = Object.entries(storData.STOR);

        // map을 사용하여 NAME 값을 추출
        setStors(entries.map(([key, value]) => value));
    }, [storData, setStorData]);
    

    const clearIds = () => {
        setElemIds([]);
        setNodeIds([]);
    };

    const HandleView = (viewType) => {

        setView(viewType);

        switch (viewType) {
            case "iso":
                setAngleH(30);
                setAngleV(15);
                break;
            case "top":
                setAngleH(0);
                setAngleV(90);
                break;
            case "bottom":
                setAngleH(0);
                setAngleV(-90);
                break;
            case "left":
                setAngleH(90);
                setAngleV(0);
                break;
            case "right":
                setAngleH(-90);
                setAngleV(0);
                break;
            case "front":
                setAngleH(0);
                setAngleV(0);
                break;
            case "back":
                setAngleH(180);
                setAngleV(0);
                break;
            case "user":

                break;
        }
    }

    return (

        <Panel
            width="100%"
            height='100%'
            variant="shadow2"
            border={
                // isClickedLcomTableCell ? 
                // `1px solid ${Color.primaryNegative.enable_strock}` : 
                '1px solid #eee'
            }
        >
            <GuideBox height={'100%'} row={false} verSpaceBetween spacing={1}>
                <MoaStack width={'100%'} height={'100%'} spacing={1}>
                    <Panel width="100%" padding={1}>
                        <GuideBox row horSpaceBetween verCenter>
                            <Typography variant="body2">Active</Typography>
                            <Switch label="Active" checked={useActive} onChange={(event, checked) => { setUseActive(checked) }} />
                        </GuideBox>
                        <GuideBox row horSpaceBetween>
                            <ImageTextButton iconSrc="svg/ico24_view_activities_activeall.svg" text="Active All" isActive={active == "All"} onClick={() => { setActive("All"); clearIds(); }} />
                            <ImageTextButton iconSrc="svg/ico24_view_activities_active.svg" text="Active by Node/Element" isActive={active == "Active"} onClick={() => { setActive("Active"); HandleActiveBySelect(); }} />
                            <ImageTextButton iconSrc="svg/ico24_view_activities_activeidentity.svg" text="Active by Identity" isActive={active == "Identity"} onClick={() => { setActive("Identity"); clearIds(); }} />
                        </GuideBox>
                        <GuideBox width={'100%'} row horSpaceBetween verCenter>
                            <Typography >Elem IDs</Typography>
                            <TextField width={'300px'} value={elemIds}  ></TextField>
                        </GuideBox>
                        <GuideBox width={'100%'} row horSpaceBetween verCenter>
                            <Typography >Node IDs</Typography>
                            <TextField width={'300px'} value={nodeIds}></TextField>
                        </GuideBox>
                        <GuideBox width={'100%'} row horSpaceBetween verCenter>
                            <Typography >Identity</Typography>
                            <DropList itemList={() => {
                                let map = new Map();
                                for (const value of groups) {
                                    map.set(value.NAME, value.NAME);
                                }
                                for (const value of stors) {
                                    map.set(value.STORY_NAME, value.STORY_NAME);
                                }
                                return map;
                            }} width={'300px'} value={selectedGroup} onChange={(e) => setSelectedGroup(e.target.value)} ></DropList>                            
                        </GuideBox>
                        <GuideBox width="100%" row horRight verCenter>
                            <Checkbox 
                                checked={floorOption === "floor"}
                                disabled={!isFloorCheckboxEnabled}
                                onChange={() => handleFloorOptionChange("floor")}
                            />
                            <Typography>Floor</Typography>
                            <Checkbox 
                                checked={floorOption === "above"}
                                disabled={!isFloorCheckboxEnabled}
                                onChange={() => handleFloorOptionChange("above")}
                            />
                            <Typography>+Above</Typography>
                            <Checkbox 
                                checked={floorOption === "below"}
                                disabled={!isFloorCheckboxEnabled}
                                onChange={() => handleFloorOptionChange("below")}
                            />
                            <Typography>+Below</Typography>
                            <Checkbox 
                                checked={floorOption === "both"}
                                disabled={!isFloorCheckboxEnabled}
                                onChange={() => handleFloorOptionChange("both")}
                            />
                            <Typography>+Both</Typography>
                        </GuideBox>

                    </Panel>
                    <Panel width="100%" padding={1}>
                        <GuideBox row horSpaceBetween verCenter>
                            <Typography variant="body2">View</Typography>
                            <Switch label="Active" checked={useView} onChange={(event, checked) => { setUseView(checked) }} />
                        </GuideBox>
                        <GuideBox row horCenter>
                            <ImageTextButton iconSrc="svg/ico24_view_dynamicview_iso.svg" text="Iso View" isActive={view == "iso"} onClick={() => { HandleView("iso"); }} />
                            <ImageTextButton iconSrc="svg/ico24_view_dynamicview_top-z.svg" text="Top View" isActive={view == "top"} onClick={() => { HandleView("top"); }} />
                            <ImageTextButton iconSrc="svg/ico24_view_dynamicview_bottom-z.svg" text="Bottom View" isActive={view == "bottom"} onClick={() => { HandleView("bottom"); }} />
                            <ImageTextButton iconSrc="svg/ico24_view_dynamicview_left-x.svg" text="Left View" isActive={view == "left"} onClick={() => { HandleView("left"); }} />
                            <ImageTextButton iconSrc="svg/ico24_view_dynamicview_right-x.svg" text="Right View" isActive={view == "right"} onClick={() => { HandleView("right"); }} />
                            <ImageTextButton iconSrc="svg/ico24_view_dynamicview_front-y.svg" text="Front View" isActive={view == "front"} onClick={() => { HandleView("front"); }} />
                            <ImageTextButton iconSrc="svg/ico24_view_dynamicview_rear-y.svg" text="Back View" isActive={view == "back"} onClick={() => { HandleView("back"); }} />
                            <ImageTextButton iconSrc="svg/ico24_view_dynamicview_angle.svg" text="User View" isActive={view == "user"} onClick={() => { HandleView("user"); }} />
                        </GuideBox>
                        <GuideBox width={'100%'} row horSpaceBetween verCenter>
                            <Typography >Angle H</Typography>
                            <TextField width={'100%'} value={angleH} onChange={(e) => setAngleH(e.target.value)}></TextField>
                        </GuideBox>
                        <GuideBox width={'100%'} row horSpaceBetween verCenter>
                            <Typography >Angle V</Typography>
                            <TextField width={'100%'} value={angleV} onChange={(e) => setAngleV(e.target.value)}></TextField>
                        </GuideBox>

                    </Panel>
                    <Panel width="100%" padding={1}>
                        <GuideBox row horSpaceBetween verCenter>
                            <Typography variant="body2">Hidden Option</Typography>
                            <Switch label="Active" checked={hidden} onChange={(event, checked) => { setHidden(checked) }} />
                        </GuideBox>
                        <GuideBox row horSpaceBetween verCenter>
                            <Typography variant="body2">Property Name</Typography>
                            <Switch label="Active" checked={propName} onChange={(event, checked) => { setPropName(checked) }} />
                        </GuideBox>
                        <GuideBox row horSpaceBetween verCenter>
                            <Typography variant="body2">Wall Mark(only GEN NX)</Typography>
                            <Switch label="Active" checked={wallMark} onChange={(event, checked) => { setWallMark(checked) }} />
                        </GuideBox>
                        <GuideBox row horSpaceBetween verCenter>
                            <Typography variant="body2">Description</Typography>
                            <TextField width={'300px'} value={desc} onChange={(e)=> setDesc(e.target.value)}></TextField>                      
                            <Switch label="Active" checked={useDesc} onChange={(event, checked) => { setUseDesc(checked) }} />
                        </GuideBox>
                    </Panel>
                </MoaStack >
                <MoaStack width={'100%'} direction="row" justifyContent={"right"} spacing={1}>
                    <Button onClick={handleModifyClick}>Modify</Button>
                    <Button onClick={handleSaveClick}>Save</Button>
                </MoaStack>
            </GuideBox>
        </Panel>

    );
});