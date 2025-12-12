import MoaStack from "@midasit-dev/moaui/Components/Stack";
import Typography from "@midasit-dev/moaui/Components/Typography";
import * as React from "react";
import { useRecoilState } from "recoil";
import { setStateUpdate } from "../../utils";
import { ListComponent } from "../ListComponents";

import { Button, GuideBox, Panel, Scrollbars, TextField, VerifyUtil } from "@midasit-dev/moaui";

import { convertToNumber } from "../CommonUtils";
import { VarBeamStressesPSCComp, VarBeamStressesPSCComp7th, VarBeamStressesPSCFill, VarBeamStressesPSCOuputLocation, VarBeamStressesPSCOuputSectionLocation, VarBeamStressesPSCScale, VarBeamStressesPSCSectionPosition, VarPreviewNode, VarPrintImportData } from "../var";
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

export const BeamStressesPSC = React.forwardRef((props, ref) => {
    const [doUpdate, setDoUpdate] = React.useState("");

    const itemsPos = ["Position 1", "Position 2", "Position 3",
        "Position 4", "Position 5", "Position 6", "Position 7", "Position 8",
        "Position 9", "Position 10", "Position 11", "Position 12", "Position 13",
        "Position 14", "Position 15", "Position 16",
        "Max", "Min", "Max/Min", "Abs Max"];
    const [pos, setPos] = useRecoilState(VarBeamStressesPSCSectionPosition);

    const itemsComp = ["Sig-xx(Axial)", "Sig-xx(Moment-y)", "Sig-xx(Moment-z)",
        "Sig-xx(Bar)", "Sig-xx(Summation)", "Sig-zz",
        "Sig-xz(Shear)", "Sig-xz(torsion)", "Sig-xz(bar)",
        "Sig-Is(shear)", "Sig-Is(shear+torsion)", "Sig-Ps1", "Sig-Ps2", "7th-DOF"];
    const [comp, setComp] = useRecoilState(VarBeamStressesPSCComp);

    const itemsComp7th = ["Sax(Warping)", "Ssy(Mt)", "Ssy(Mw)", "Ssz(Mt)", "Ssz(Mw)", "Combined(Ssy)", "Combined(Ssz)"];
    const [comp7th, setComp7th] = useRecoilState(VarBeamStressesPSCComp7th);

    const itemsOutputLocation = ["I", "Center", "J"];
    const [outputLocation, setOutputLocation] = useRecoilState(VarBeamStressesPSCOuputLocation);

    const itemsOutputSectionLocation = ["By Section", "Abs Max", "Min/Max", "All"];
    const [outputSectionLocation, setOutputSectionLocation] = useRecoilState(VarBeamStressesPSCOuputSectionLocation);

    const updateKit = { doUpdate: doUpdate, setDoUpdate: setDoUpdate };

    const itemsFill = ["No Fill", "Line Fill", "Solid Fill"];
    const [fill, setFill] = useRecoilState(VarBeamStressesPSCFill)

    const [scale, setScale] = useRecoilState(VarBeamStressesPSCScale);

    const [previewNode, setPreviewNode] = useRecoilState(VarPreviewNode);
    const [importData, setImportData] = useRecoilState(VarPrintImportData);

    const handleSaveClick = () => {
        const copy = JSON.parse(JSON.stringify(previewNode));
        const node = {
            Component: comp,
            Component7th: comp7th[0],
            SectionPosition: pos[0],
            OutputSectionLocation: outputSectionLocation[0],
            OutputLocation: outputLocation,
            Scale: convertToNumber(scale),
            Fill: fill[0],

        }
        if (!copy["DB"])
            copy["DB"] = {};
        copy["DB"]["Stresses - Beam Stresses(PSC)"] = node;

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
                        <Typography variant="body2">Component</Typography>
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
                                userData={itemsPos}
                                checkList={pos}
                                setCheckList={(l) => setStateUpdate(setPos, l)}
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
