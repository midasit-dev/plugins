import MoaStack from "@midasit-dev/moaui/Components/Stack";
import Typography from "@midasit-dev/moaui/Components/Typography";
import * as React from "react";
import { useRecoilState } from "recoil";
import { setStateUpdate } from "../../utils";
import { ListComponent } from "../ListComponents";
import { VarCuttingDiagramDispOptions, VarCuttingDiagramLines, VarCuttingDiagramPlanes, VarCuttingDiagramReverse, VarCuttingDiagramScaleFactor, VarCuttingDiagramType, VarCuttingDiagramUse, VarCuttingDiagramValueOptions, VarPreviewNode, VarPrintImportData } from "../var";

import { Button, GuideBox, Panel, Switch, TextField, VerifyUtil } from "@midasit-dev/moaui";
import { UpdateCurrent } from "../DB/SaveUtils";

import Checkbox from "@midasit-dev/moaui/Components/Check";
import { DataLoader } from "../../Workers/DataLoader";
import { convertToNumber } from "../CommonUtils";

const awaiter = async (setPending, setListData, func, cmd) => {
    try {
        setPending(true);
        if (VerifyUtil.getMapiKey() !== "") setListData(await func(cmd));
        setPending(false);
    } catch (_) {
        console.log(_);
    }
};


export const CuttingDiagram = React.forwardRef((props, ref) => {

    const [doUpdate, setDoUpdate] = React.useState("");

    const [use, setUse] = useRecoilState(VarCuttingDiagramUse);


    const itemsType = ["Cutting Line", "Cutting Plane"];
    const [type, setType] = useRecoilState(VarCuttingDiagramType);

    const [itemsLine, setItemsLine] = React.useState([]);
    const [itemsPlane, setItemsPlane] = React.useState([]);

    const [lines, setLine] = useRecoilState(VarCuttingDiagramLines);
    const [planes, setPlanes] = useRecoilState(VarCuttingDiagramPlanes);

    const itemsDispOption = ["Normal", "In Plane"];
    const [dispOptions, setDispOptions] = useRecoilState(VarCuttingDiagramDispOptions);

    const itemsValueOption = ["Value Output", "MinMax Only"];
    const [valueOptions, setValueOptions] = useRecoilState(VarCuttingDiagramValueOptions);

    const [scale, setScale] = useRecoilState(VarCuttingDiagramScaleFactor);
    const [reverse, setReverse] = useRecoilState(VarCuttingDiagramReverse);

    const updateKit = { doUpdate: doUpdate, setDoUpdate: setDoUpdate };

    const [previewNode, setPreviewNode] = useRecoilState(VarPreviewNode);
    const [importData, setImportData] = useRecoilState(VarPrintImportData);

    const [isPending, setPending] = React.useState(false);
    const [nucs, setNUCS] = React.useState([]);
    const [cutl, setCUTL] = React.useState([]);

    React.useEffect(() => {
        const loadNUCS = async () => {
            await awaiter(setPending, setNUCS, DataLoader, "/DB/NUCS");
        };

        loadNUCS();

        const loadCUTL = async () => {
            await awaiter(setPending, setCUTL, DataLoader, "/DB/CUTL");
        };

        loadCUTL();
    }, []);

    React.useEffect(() => {
        if (nucs && nucs["NUCS"]) {
            const items = ["UCS x-y Plane","UCS x-z Plane","UCS y-z Plane"];
            const map = new Map(Object.entries(nucs["NUCS"]));
            for (const [key, value] of map) {
                items.push(value.NAME);
            }
            setItemsPlane(items);
        }
    }, [nucs]);

    
    React.useEffect(() => {
        if (cutl && cutl["CUTL"]) {
            const items = [];
            const map = new Map(Object.entries(cutl["CUTL"]));
            for (const [key, value] of map) {
                items.push(value.NAME);
            }
            setItemsLine(items);
        }
    }, [cutl]);

    const handleSaveClick = () => {
        const copy = JSON.parse(JSON.stringify(previewNode));
        const node = {
            Active: use,
            CuttingType: type[0],
            CuttingLines: lines,
            CuttingPlanes: planes,
            NormalToPlane: dispOptions.includes("Normal"),
            Reverse: reverse,
            ScaleFactor: convertToNumber(scale),
            ValueOutput: valueOptions.includes("Value Output"),
            MinMaxOnly: valueOptions.includes("MinMax Only"),
        }
        if (!copy["TypeOfDisplay"])
            copy["TypeOfDisplay"] = {};
        copy["TypeOfDisplay"]["Cutting Diagram"] = node;

        setPreviewNode(copy);

        UpdateCurrent(copy, importData, setImportData);
    };

    return (
        <GuideBox height={'100%'} row={false} verSpaceBetween spacing={1}>
            <MoaStack width={'100%'} height={'100%'} spacing={1}>
                <GuideBox row horSpaceBetween verCenter>
                    <Typography variant="body2">Cutting Diagram</Typography>
                    <Switch label="Active" checked={use} onChange={(event, checked) => setUse(checked)} />
                </GuideBox>
                <Panel
                    width="100%" height={'100%'} variant="shadow2" border={'1px solid #eee'}>
                    <GuideBox width={'100%'} spacing={0.5} >
                        <Typography variant="body2">Cutting Name</Typography>
                        <GuideBox width={'100%'} row spacing={0.5}>
                            <ListComponent
                                width={'33%'}
                                label="Cutting Type"
                                userData={itemsType}
                                checkList={type}
                                setCheckList={(l) => setStateUpdate(setType, l)}
                                {...updateKit}
                                singleSelect
                            />
                            <ListComponent
                                width={'33%'}
                                label="Defined Cutting Lines"
                                userData={itemsLine}
                                checkList={lines}
                                setCheckList={(l) => setStateUpdate(setLine, l)}
                                {...updateKit}
                            />
                            <ListComponent
                                width={'33%'}
                                label="Defined Cutting Planes"
                                userData={itemsPlane}
                                checkList={planes}
                                setCheckList={(l) => setStateUpdate(setPlanes, l)}
                                {...updateKit}
                            />
                        </GuideBox>
                        <GuideBox width={'100%'} row spacing={0.5}>
                            <ListComponent
                                width={'33%'}
                                label="Display Options"
                                userData={itemsDispOption}
                                checkList={dispOptions}
                                setCheckList={(l) => setStateUpdate(setDispOptions, l)}
                                {...updateKit}
                                singleSelect
                                footer={(
                                    <GuideBox horLeft padding={1} spacing={0.5} >
                                        <GuideBox width={"100%"} row verCenter horSpaceBetween padding={1}>
                                            <Typography>Reverse</Typography>
                                            <Checkbox checked={reverse} onChange={(e, checked) => setReverse(checked)} />
                                        </GuideBox>
                                        <Typography color="disable" variant="body2">Scale Factor</Typography>
                                        <TextField
                                            titlePosition="label"
                                            value={scale}
                                            onChange={(e) => setScale(e.target.value)}
                                        />
                                    </GuideBox>
                                )}
                            />
                            <ListComponent
                                width={'33%'}
                                label="Value Options"
                                userData={itemsValueOption}
                                checkList={valueOptions}
                                setCheckList={(l) => setStateUpdate(setValueOptions, l)}
                                {...updateKit}
                            />

                        </GuideBox>
                    </GuideBox>
                </Panel>

            </MoaStack>
                <MoaStack width={'100%'} direction="row" justifyContent={"right"} spacing={1}>
                    <Button onClick={handleSaveClick}>Save</Button>
                </MoaStack>
        </GuideBox>
    );
});
