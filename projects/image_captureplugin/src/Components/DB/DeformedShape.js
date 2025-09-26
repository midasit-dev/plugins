import MoaStack from "@midasit-dev/moaui/Components/Stack";
import Typography from "@midasit-dev/moaui/Components/Typography";
import * as React from "react";
import { useRecoilState } from "recoil";
import { setStateUpdate } from "../../utils";
import { ListComponent } from "../ListComponents";

import { Button, GuideBox, Panel } from "@midasit-dev/moaui";

import { VarDeformedShapeComp, VarDeformedShapeLocal, VarDeformedTimeHistoryFunctionType, VarPreviewNode, VarPrintImportData } from "../var";
import { UpdateCurrent } from "./SaveUtils";

export const DeformedShape = React.forwardRef((props, ref) => {
    const [doUpdate, setDoUpdate] = React.useState("");

    const itemsComp = ["DX", "DY", "DZ", "DXY", "DYZ", "DXZ", "DXYZ"];
    const itemsEtc = ["Local (if defined)"];
    const itemsTimeHistoryType = ["Displacement", "Velocity", "Acceleration", "Absolute Acceleration"];

    const [comp, setComp] = useRecoilState(VarDeformedShapeComp);
    const [local, setLocal] = useRecoilState(VarDeformedShapeLocal);
    const [timeHistoryType, setTimeHistoryType] = useRecoilState(VarDeformedTimeHistoryFunctionType)

    const updateKit = { doUpdate: doUpdate, setDoUpdate: setDoUpdate };

    const [previewNode, setPreviewNode] = useRecoilState(VarPreviewNode);
    const [importData, setImportData] = useRecoilState(VarPrintImportData);

    const handleSaveClick = () => {
        const copy = JSON.parse(JSON.stringify(previewNode));
        const node = {
            Component: comp,
            Local: local.length > 0,
            TimeHistoryFunctionType: timeHistoryType[0],
        }
        if (!copy["DB"])
            copy["DB"] = {};
        copy["DB"]["Deformations - Deformed Shape"] = node;

        setPreviewNode(copy);

        UpdateCurrent(copy, importData, setImportData);
    };


    return (
        <GuideBox height={'100%'} row={false} verSpaceBetween spacing={1}>
            <Panel
                width="100%"
                height="100%"
                variant="shadow2"
                border={
                    // isClickedLcomTableCell ? 
                    // `1px solid ${Color.primaryNegative.enable_strock}` : 
                    '1px solid #eee'
                }
            >
                <GuideBox spacing={2}>
                    <Typography variant="body2">Component</Typography>
                    <GuideBox row={true} spacing={0.25} width='100%' height="100%">
                        <ListComponent
                            width={'33%'}
                            label={"Components"}
                            userData={itemsComp}
                            checkList={comp}
                            setCheckList={(l) => setStateUpdate(setComp, l)}
                            {...updateKit}
                        />
                        <ListComponent
                            width={'33%'}
                            label={"ETC."}
                            userData={itemsEtc}
                            checkList={local}
                            setCheckList={(l) => setStateUpdate(setLocal, l)}
                            {...updateKit}
                        />
                        <ListComponent
                            width={'33%'}
                            label={"Time History Function Type"}
                            userData={itemsTimeHistoryType}
                            checkList={timeHistoryType}
                            setCheckList={(l) => setStateUpdate(setTimeHistoryType, l)}
                            {...updateKit}
                            singleSelect
                            allowNone

                        />
                    </GuideBox>


                </GuideBox>
            </Panel>
                <MoaStack width={'100%'} direction="row" justifyContent={"right"} spacing={1}>
                    <Button onClick={handleSaveClick}>Save</Button>
                </MoaStack>
        </GuideBox>
    );
});
