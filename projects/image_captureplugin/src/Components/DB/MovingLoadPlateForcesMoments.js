import MoaStack from "@midasit-dev/moaui/Components/Stack";
import Typography from "@midasit-dev/moaui/Components/Typography";
import * as React from "react";
import { useRecoilState } from "recoil";
import { setStateUpdate } from "../../utils";
import { ListComponent } from "../ListComponents";

import { Button, DropList, GuideBox, Panel } from "@midasit-dev/moaui";

import { VarMovingLoadPlateForcesMomentsComp, VarMovingLoadPlateForcesMomentsParts, VarPreviewNode, VarPrintImportData } from "../var";
import { UpdateCurrent } from "./SaveUtils";

export const MovingLoadPlateForcesMoments = React.forwardRef((props, ref) => {
    const [doUpdate, setDoUpdate] = React.useState("");

    const itemsParts = ["cent", "i", "j", "k", "l"];
    const [parts, setParts] = useRecoilState(VarMovingLoadPlateForcesMomentsParts);

    const itemsComp = ["Fxx", "Fyy", "Fxy", "Mxx", "Myy", "Mxy", "Vxx", "Vyy"];
    const [comp, setComp] = useRecoilState(VarMovingLoadPlateForcesMomentsComp);

    const updateKit = { doUpdate: doUpdate, setDoUpdate: setDoUpdate };

    const [previewNode, setPreviewNode] = useRecoilState(VarPreviewNode);
    const [importData, setImportData] = useRecoilState(VarPrintImportData);

    const handleSaveClick = () => {
        const copy = JSON.parse(JSON.stringify(previewNode));
        const node = {
            Parts: parts,
            Component: comp,
        }
        if (!copy["DB"])
            copy["DB"] = {};
        copy["DB"]["Moving Load Tracer - Plate Forces/Moments"] = node;

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
                <GuideBox spacing={1}>
                    <GuideBox width={'100%'} row horSpaceBetween verCenter>
                        <Typography variant="body2">Component</Typography>
                        <GuideBox row verCenter spacing={1} >
                            <Typography >Parts</Typography>
                            <DropList itemList={() => {
                                let map = new Map();
                                for (const value of itemsParts) {
                                    map.set(value, value);
                                }
                                return map;
                            }} width={'150px'} value={parts} onChange={(e) => setParts(e.target.value)} ></DropList>
                        </GuideBox>
                    </GuideBox>
                    <GuideBox row={true} spacing={0.25} width='100%' height="100%">
                        <ListComponent
                            width={'33%'}
                            label={"Components"}
                            userData={itemsComp}
                            checkList={comp}
                            setCheckList={(l) => setStateUpdate(setComp, l)}
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
