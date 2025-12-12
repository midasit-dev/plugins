import MoaStack from "@midasit-dev/moaui/Components/Stack";
import Typography from "@midasit-dev/moaui/Components/Typography";
import * as React from "react";
import { useRecoilState } from "recoil";
import { setStateUpdate } from "../../utils";
import { ListComponent } from "../ListComponents";

import { Button, DropList, GuideBox, Panel, Scrollbars, VerifyUtil } from "@midasit-dev/moaui";

import { Switch } from "@mui/material";
import { DataLoader } from "../../Workers/DataLoader";
import { VarBeamForcesMomentsByMember, VarBeamForcesMomentsComp, VarBeamForcesMomentsOuputLocation, VarBeamForcesMomentsOuputSectionLocation, VarBeamForcesMomentsPart, VarBeamForcesMomentsShowTrussForce, VarPreviewNode, VarPrintImportData } from "../var";
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

export const BeamForcesMoments = React.forwardRef((props, ref) => {
    const [doUpdate, setDoUpdate] = React.useState("");


    const [part, setPart] = useRecoilState(VarBeamForcesMomentsPart);

    const itemsComp = ["Fx", "Fy", "Fz", "Mx", "My", "Mz", "Mb", "Mt", "Mw",];
    const [comp, setComp] = useRecoilState(VarBeamForcesMomentsComp);

    const itemsShowTruss = ["Show"];
    const [showTruss, setShowTruss] = useRecoilState(VarBeamForcesMomentsShowTrussForce);

    const itemsOutputLocation = ["I", "Center", "J"];
    const [outputLocation, setOutputLocation] = useRecoilState(VarBeamForcesMomentsOuputLocation);

    const itemsOutputSectionLocation = ["By Section", "Abs Max", "Min/Max", "All"];
    const [outputSectionLocation, setOutputSectionLocation] = useRecoilState(VarBeamForcesMomentsOuputSectionLocation);

    const [byMember, setByMember] = useRecoilState(VarBeamForcesMomentsByMember);



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
            ShowTrussForces: showTruss.includes("Show"),
            OutputLocation: outputLocation,
            OutputSectionLocation: outputSectionLocation[0],
            ByMember: byMember,

        }
        if (!copy["DB"])
            copy["DB"] = {};
        copy["DB"]["Forces - Beam Forces/Moments"] = node;

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
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden' // Ensure the Panel does not overflow
                }}
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
                    <GuideBox spacing={1} width={'97%'}>
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
                                label={"Truss Forces"}
                                userData={itemsShowTruss}
                                checkList={showTruss}
                                setCheckList={(l) => setStateUpdate(setShowTruss, l)}
                                {...updateKit}
                            />
                        </GuideBox>
                        <GuideBox width={'100%'} row horSpaceBetween verCenter>
                            <Typography variant="body2">Value Options</Typography>
                            <GuideBox row verCenter>
                                <Typography variant="body2">By Member</Typography>
                                <Switch checked={byMember} onChange={(event, checked) => setByMember(checked)} />
                            </GuideBox>
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


                    </GuideBox>
                </Scrollbars>
            </Panel>
                <MoaStack width={'100%'} direction="row" justifyContent={"right"} spacing={1}>
                    <Button onClick={handleSaveClick}>Save</Button>
                </MoaStack>
        </GuideBox>
    );
});
