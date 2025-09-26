import MoaStack from "@midasit-dev/moaui/Components/Stack";
import Typography from "@midasit-dev/moaui/Components/Typography";
import * as React from "react";
import { useRecoilState } from "recoil";
import { setStateUpdate } from "../../utils";
import { ListComponent } from "../ListComponents";
import { VarDispOptContour, VarDispOptUse, VarDispOptValueMax, VarPreviewNode, VarPrintImportData } from "../var";

import { Button, GuideBox, Panel, Switch } from "@midasit-dev/moaui";
import { UpdateCurrent } from "../DB/SaveUtils";

export const DisplacementOption = React.forwardRef((props, ref) => {

    const [doUpdate, setDoUpdate] = React.useState("");

    const [use, setUse] = useRecoilState(VarDispOptUse);

    const itemsContour = ["Element Center"];
    const [contour, setContour] = useRecoilState(VarDispOptContour);

    const itemsValueMax = ["Max", "Element Center"];
    const [valueMax, setValueMax] = useRecoilState(VarDispOptValueMax);

    const updateKit = { doUpdate: doUpdate, setDoUpdate: setDoUpdate };

    const [previewNode, setPreviewNode] = useRecoilState(VarPreviewNode);
    const [importData, setImportData] = useRecoilState(VarPrintImportData);

    const handleSaveClick = () => {
        const copy = JSON.parse(JSON.stringify(previewNode));
        const node = {
            Active: use,
            ElementCenter: contour.includes("Element Center"),
            ValueMax: valueMax.includes("Max"),

        }
        if (!copy["TypeOfDisplay"])
            copy["TypeOfDisplay"] = {};
        copy["TypeOfDisplay"]["Displacement Option"] = node;

        setPreviewNode(copy);

        UpdateCurrent(copy, importData, setImportData);
    };


    return (
        <GuideBox height={'100%'} row={false} verSpaceBetween spacing={1}>
            <MoaStack width={'100%'} height={'100%'} spacing={1}>
                <GuideBox row horSpaceBetween verCenter>
                    <Typography variant="body2">Displacement  Option</Typography>
                    <Switch label="Active" checked={use} onChange={(event, checked) => setUse(checked)} />
                </GuideBox>
                <Panel
                    width="100%" height={'100%'} variant="shadow2" border={'1px solid #eee'}            >
                    <Typography variant="body2">Displacement  Option Detail</Typography>
                    <GuideBox spacing={0.5} row>
                        <ListComponent
                            width={'33%'}
                            label="Contour"
                            userData={itemsContour}
                            checkList={contour}
                            setCheckList={(l) => setStateUpdate(setContour, l)}
                            {...updateKit}
                        />
                        <ListComponent
                            width={'33%'}
                            label="Value"
                            userData={itemsValueMax}
                            checkList={valueMax}
                            setCheckList={(l) => setStateUpdate(setValueMax, l)}
                            {...updateKit}
                            singleSelect
                        />


                    </GuideBox>
                </Panel>

            </MoaStack>
                <MoaStack width={'100%'} direction="row" justifyContent={"right"} spacing={1}>
                    <Button onClick={handleSaveClick}>Save</Button>
                </MoaStack>
        </GuideBox>
    );
});
