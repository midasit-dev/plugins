import MoaStack from "@midasit-dev/moaui/Components/Stack";
import Typography from "@midasit-dev/moaui/Components/Typography";
import * as React from "react";
import { useRecoilState } from "recoil";
import { setStateUpdate } from "../../utils";
import { ListComponent } from "../ListComponents";

import { Button, GuideBox, Panel } from "@midasit-dev/moaui";

import { VarPreviewNode, VarPrintImportData, VarReactionComp, VarReactionLocal } from "../var";
import { UpdateCurrent } from "./SaveUtils";

export const ReactionComponent = React.forwardRef((props, ref) => {
    const [doUpdate, setDoUpdate] = React.useState("");

    const itemsComp = ["FX", "FY", "FZ", "FXYZ", "MX", "MY", "MZ", "MXYZ", "Mb"];
    const itemsEtc = ["Local (if defined)"];

    const [comp, setComp] = useRecoilState(VarReactionComp);
    const [local, setLocal] = useRecoilState(VarReactionLocal);

    const updateKit = { doUpdate: doUpdate, setDoUpdate: setDoUpdate };

    const [previewNode, setPreviewNode] = useRecoilState(VarPreviewNode);
    const [importData, setImportData] = useRecoilState(VarPrintImportData);

    const handleSaveClick = () => {
        const copy = JSON.parse(JSON.stringify(previewNode));
        const node = {
            Component: comp,
            Local: local.includes("Local (if defined)"),
        }
        if (!copy["DB"])
            copy["DB"] = {};
        copy["DB"]["Reaction"] = node;

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
                    </GuideBox>


                </GuideBox>
            </Panel>
                <MoaStack width={'100%'} direction="row" justifyContent={"right"} spacing={1}>
                    <Button onClick={handleSaveClick}>Save</Button>
                </MoaStack>
        </GuideBox>
    );
});
