import MoaStack from "@midasit-dev/moaui/Components/Stack";
import Typography from "@midasit-dev/moaui/Components/Typography";
import * as React from "react";
import { useRecoilState } from "recoil";
import { setStateUpdate } from "../../utils";
import { ListComponent } from "../ListComponents";
import { VarDeformAdditional, VarDeformDeformationType, VarDeformDisp, VarDeformETC, VarDeformScaleFactor, VarDeformUse, VarPreviewNode, VarPrintImportData } from "../var";

import { Button, GuideBox, Panel, Switch, TextField } from "@midasit-dev/moaui";
import { convertToNumber } from "../CommonUtils";
import { UpdateCurrent } from "../DB/SaveUtils";

export const Deformation = React.forwardRef((props, ref) => {

    const [doUpdate, setDoUpdate] = React.useState("");

    const [use, setUse] = useRecoilState(VarDeformUse);
    const [scaleFactor, setScaleFactor] = useRecoilState(VarDeformScaleFactor);

    const itemsDeformType = ["Nodal Deform", "Real Deform"];
    const [deformType, setDeformType] = useRecoilState(VarDeformDeformationType);

    const itemsDisp = ["Real Displacement", "Relative Displacement"];
    const [disp, setDisp] = useRecoilState(VarDeformDisp);

    const itemsETC = ["Current Step Displ.", "Stage/Step Real Displ."]
    const [etc, setEtc] = useRecoilState(VarDeformETC)

    const itemsAddtional = ["Undeformed"];
    const [addtional, setAddtional] = useRecoilState(VarDeformAdditional);

    const updateKit = { doUpdate: doUpdate, setDoUpdate: setDoUpdate };

    const [previewNode, setPreviewNode] = useRecoilState(VarPreviewNode);
    const [importData, setImportData] = useRecoilState(VarPrintImportData);

    const handleSaveClick = () => {
        const copy = JSON.parse(JSON.stringify(previewNode));
        const node = {
            Active: use,
            DeformationType: deformType[0],
            RealDisplacement: disp.includes("Real Displacement"),
            RelativeDisplacement: disp.includes("Relative Displacement"),
            ScaleFactor: convertToNumber(scaleFactor),
            CurrentStepDisp: etc.includes("Current Step Displ."),
            "Stage/StepRealDisp": etc.includes("Stage/Step Real Displ."),
            Undeformed: addtional.includes("Undeformed"),

        }
        if (!copy["TypeOfDisplay"])
            copy["TypeOfDisplay"] = {};
        copy["TypeOfDisplay"]["Deform"] = node;

        setPreviewNode(copy);

        UpdateCurrent(copy, importData, setImportData);
    };

    return (
        <GuideBox height={'100%'} row={false} verSpaceBetween spacing={1}>
            <MoaStack width={'100%'} height={'100%'} spacing={1}>
                <GuideBox row horSpaceBetween verCenter>
                    <Typography variant="body2">Deformation </Typography>
                    <Switch label="Active" checked={use} onChange={(event, checked) => setUse(checked)} />
                </GuideBox>
                <Panel
                    width="100%" height={'100%'} variant="shadow2" border={'1px solid #eee'} >
                    <GuideBox width={'100%'} spacing={0.5} >
                        <Typography variant="body2">Deformation Details</Typography>
                        <GuideBox width={'100%'} row spacing={0.5}>
                            <ListComponent
                                width={'33%'}
                                label="Deformation Type"
                                userData={itemsDeformType}
                                checkList={deformType}
                                setCheckList={(l) => setStateUpdate(setDeformType, l)}
                                {...updateKit}
                                singleSelect
                            />
                            <ListComponent
                                width={'33%'}
                                label="Displacement"
                                userData={itemsDisp}
                                checkList={disp}
                                setCheckList={(l) => setStateUpdate(setDisp, l)}
                                {...updateKit}
                                footer={(
                                    <GuideBox horLeft padding={1} spacing={0.5} >
                                        <Typography color="disable" variant="body2">Deformation Scale Factor</Typography>
                                        <TextField titlePosition="label" value={scaleFactor} onChange={(e) => setScaleFactor(e.target.value)} />
                                    </GuideBox>
                                )}
                            />

                        </GuideBox>
                        <Typography variant="body2">Options</Typography>
                        <GuideBox width={'100%'} row spacing={0.5}>
                            <ListComponent
                                width={'33%'}
                                label="Construction Stage"
                                userData={itemsETC}
                                checkList={etc}
                                setCheckList={(l) => setStateUpdate(setEtc, l)}
                                {...updateKit}
                            />
                            <ListComponent
                                width={'33%'}
                                label="Additional"
                                userData={itemsAddtional}
                                checkList={addtional}
                                setCheckList={(l) => setStateUpdate(setAddtional, l)}
                                {...updateKit}
                            />
                        </GuideBox>
                    </GuideBox>
                </Panel>

            </MoaStack>
                <MoaStack width={'100%'} direction="row" justifyContent={"right"} spacing={1}>
                    <Button onClick={handleSaveClick}>Save</Button>
                </MoaStack>
        </GuideBox >
    );
});
