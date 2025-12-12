import MoaStack from "@midasit-dev/moaui/Components/Stack";
import Typography from "@midasit-dev/moaui/Components/Typography";
import * as React from "react";
import { useRecoilState } from "recoil";
import { setStateUpdate } from "../../utils";
import { ListComponent } from "../ListComponents";

import { Button, DropList, GuideBox, Panel, Scrollbars, TextField, VerifyUtil } from "@midasit-dev/moaui";

import { DataLoader } from "../../Workers/DataLoader";
import { convertToNumber } from "../CommonUtils";
import { VarBeamStressesDiagramCombined, VarBeamStressesDiagramComp, VarBeamStressesDiagramComp7th, VarBeamStressesDiagramFill, VarBeamStressesDiagramOuputLocation, VarBeamStressesDiagramOuputSectionLocation, VarBeamStressesDiagramPart, VarBeamStressesDiagramScale, VarPreviewNode, VarPrintImportData } from "../var";
import { UpdateCurrent } from "./SaveUtils";

const awaiter = async (setPending, setListData, func, cmd) => {
    try {
        setPending(true);
        if (VerifyUtil.getMapiKey() !== "") setListData(await func(cmd));
        setPending(false);
    } catch (_) {
        console.log(_);
    }
};

export const BeamStressesDiagram = React.forwardRef((props, ref) => {
    const [doUpdate, setDoUpdate] = React.useState("");

    const [part, setPart] = useRecoilState(VarBeamStressesDiagramPart);

    const itemsComp = ["Sax", "Ssy", "Ssz", "Sby", "Sbz", "Combined", "7th DOF"];
    const [comp, setComp] = useRecoilState(VarBeamStressesDiagramComp);

    const itemsComp7th = ["Sax(Warping)", "Ssy(Mt)", "Ssy(Mw)", "Ssz(Mt)", "Ssz(Mw)", "Combined(Ssy)", "Combined(Ssz)"];
    const [comp7th, setComp7th] = useRecoilState(VarBeamStressesDiagramComp7th);

    const itemsCombined = ["Maximum", "1(-y,+z)", "2(+y,+z)", "4(-y,-z)", "3(+y,-z)"];
    const [combined, setCombined] = useRecoilState(VarBeamStressesDiagramCombined);

    const itemsOutputLocation = ["I", "Center", "J"];
    const [outputLocation, setOutputLocation] = useRecoilState(VarBeamStressesDiagramOuputLocation);

    const itemsOutputSectionLocation = ["By Section", "Abs Max", "Min/Max", "All"];
    const [outputSectionLocation, setOutputSectionLocation] = useRecoilState(VarBeamStressesDiagramOuputSectionLocation);

    const itemsFill = ["No Fill", "Line Fill", "Solid Fill"];
    const [fill, setFill] = useRecoilState(VarBeamStressesDiagramFill)

    const [scale, setScale] = useRecoilState(VarBeamStressesDiagramScale);

    const updateKit = { doUpdate: doUpdate, setDoUpdate: setDoUpdate };

    const [previewNode, setPreviewNode] = useRecoilState(VarPreviewNode);
    const [importData, setImportData] = useRecoilState(VarPrintImportData);

    const [itemsPart, setItemsPart] = React.useState(["Total"]);
    const [isPending, setPending] = React.useState(false);
    const [cs, setCS] = React.useState([]);
    React.useEffect(() => {
        const loadFromDB = async () => {
            await awaiter(setPending, setCS, DataLoader, "/DB/CSCS");
        };

        loadFromDB();
    }, []);

    React.useEffect(() => {
        if (cs && cs["CSCS"]) {
            let maxCount = 0;
            const map = new Map(Object.entries(cs["CSCS"]));
            for (const [key, value] of map) {
                const partInfo = value["vPARTINFO"];
                if (partInfo) {
                    const stages = [];
                    for (const info of partInfo) {
                        const stage = info.CSTAGE;
                        if (stages.includes(stage))
                            continue;
                        stages.push(stage);
                    }
                    maxCount = Math.max(stages.length, maxCount);
                }
            }
            const items = ["Total"];
            for (var i = 1; i <= maxCount; i++) {
                items.push("Part " + i);
            }
            setItemsPart(items);
        }
    }, [cs]);

    const handleSaveClick = () => {
        const copy = JSON.parse(JSON.stringify(previewNode));
        const node = {
            Part: part,
            Component: comp,
            Component7th: comp7th[0],
            SectionPosition: combined[0],
            OutputSectionLocation: outputSectionLocation[0],
            OutputLocation: outputLocation,
            Scale: convertToNumber(scale),
            Fill: fill[0],

        }
        if (!copy["DB"])
            copy["DB"] = {};
        copy["DB"]["Stresses - Beam Stresses Diagram"] = node;

        setPreviewNode(copy);

        UpdateCurrent(copy, importData, setImportData);
    };


    return (
        <GuideBox height={'100%'} row={false} verSpaceBetween spacing={1}>
            <Panel
                width="100%"
                height="100%"
                variant="shadow2"
                padding={0}
                border={
                    // isClickedLcomTableCell ? 
                    // `1px solid ${Color.primaryNegative.enable_strock}` : 
                    '1px solid #eee'
                }
            >
                <Scrollbars
                    width={'100%'}
                    height={'492px'}
                    autoHide
                >
                    <GuideBox width={'97%'} spacing={1}>
                        <GuideBox width={'100%'} row horSpaceBetween verCenter>
                            <Typography variant="body2">Component</Typography>
                            <GuideBox row verCenter spacing={1} >
                                <Typography >Parts</Typography>
                                <DropList itemList={() => {
                                    let map = new Map();
                                    for (const value of itemsPart) {
                                        map.set(value, value);
                                    }
                                    return map;
                                }} width={'150px'} value={part} onChange={(e) => setPart(e.target.value)} ></DropList>
                            </GuideBox>
                        </GuideBox>
                        <GuideBox row={true} spacing={0.25} width='100%' height="100%">
                            <ListComponent
                                width={'33%'}
                                label={"Component"}
                                userData={itemsComp}
                                checkList={comp}
                                setCheckList={(l) => setStateUpdate(setComp, l)}
                                {...updateKit}
                            />
                            <ListComponent
                                width={'33%'}
                                label={"7th DOF"}
                                userData={itemsComp7th}
                                checkList={comp7th}
                                setCheckList={(l) => setStateUpdate(setComp7th, l)}
                                {...updateKit}
                                singleSelect
                                allowNone
                            />
                            <ListComponent
                                width={'33%'}
                                label={"Section Position"}
                                userData={itemsCombined}
                                checkList={combined}
                                setCheckList={(l) => setStateUpdate(setCombined, l)}
                                {...updateKit}
                                singleSelect
                            />
                        </GuideBox>
                        <GuideBox width={'100%'} row horSpaceBetween verCenter>
                            <Typography variant="body2">Value Options</Typography>
                        </GuideBox>
                        <GuideBox row={true} spacing={0.25} width='100%' height="100%">
                            <ListComponent
                                width={'33%'}
                                label={"Output Section Location"}
                                userData={itemsOutputSectionLocation}
                                checkList={outputSectionLocation}
                                setCheckList={(l) => setStateUpdate(setOutputSectionLocation, l)}
                                {...updateKit}
                                singleSelect
                            />
                            <ListComponent
                                width={'33%'}
                                label={"Output Location"}
                                userData={itemsOutputLocation}
                                checkList={outputLocation}
                                setCheckList={(l) => setStateUpdate(setOutputLocation, l)}
                                {...updateKit}
                            />
                        </GuideBox>
                        <GuideBox width={'100%'} row horSpaceBetween verCenter>
                            <Typography variant="body2">Display Options</Typography>
                            <GuideBox row verCenter spacing={1}>
                                <Typography variant="body2">Scale of Diagram</Typography>
                                <TextField value={scale} onChange={(e) => setScale(e.target.value)} />
                            </GuideBox>
                        </GuideBox>
                        <GuideBox row={true} spacing={0.25} width='100%' height="100%">
                            <ListComponent
                                width={'33%'}
                                label={"Fill"}
                                userData={itemsFill}
                                checkList={fill}
                                setCheckList={(l) => setStateUpdate(setFill, l)}
                                {...updateKit}
                                singleSelect
                            />
                        </GuideBox>


                    </GuideBox>
                </Scrollbars>
            </Panel>
                <MoaStack width={'100%'} direction="row" justifyContent={"right"} spacing={1}>
                    <Button onClick={handleSaveClick}>Save</Button>
                </MoaStack>
        </GuideBox>
    );
});
