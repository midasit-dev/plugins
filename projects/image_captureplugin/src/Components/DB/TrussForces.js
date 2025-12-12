import MoaStack from "@midasit-dev/moaui/Components/Stack";
import Typography from "@midasit-dev/moaui/Components/Typography";
import * as React from "react";
import { useRecoilState } from "recoil";
import { setStateUpdate } from "../../utils";
import { ListComponent } from "../ListComponents";

import { Button, GuideBox, Panel, Scrollbars } from "@midasit-dev/moaui";

import { VarPreviewNode, VarPrintImportData, VarTrussForcesForceFilter, VarTrussForcesOutputSectionLocation } from "../var";
import { UpdateCurrent } from "./SaveUtils";

export const TrussForces = React.forwardRef((props, ref) => {
    const [doUpdate, setDoUpdate] = React.useState("");

    const itemsComp = ["All", "Tens.", "Comp."];
    const [comp, setComp] = useRecoilState(VarTrussForcesForceFilter);

    const itemsOutputSection = ["I", "J", "Max", "All"];
    const [outputSection, setOutputSection] = useRecoilState(VarTrussForcesOutputSectionLocation);



    const updateKit = { doUpdate: doUpdate, setDoUpdate: setDoUpdate };

    const [previewNode, setPreviewNode] = useRecoilState(VarPreviewNode);
    const [importData, setImportData] = useRecoilState(VarPrintImportData);

    const handleSaveClick = () => {
        const copy = JSON.parse(JSON.stringify(previewNode));
        const node = {
            "Force Filter": comp,
            "Output Section Location": outputSection[0],
        }
        if (!copy["DB"])
            copy["DB"] = {};
        copy["DB"]["Forces - Truss Forces"] = node;

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
                    <GuideBox spacing={1}>
                        <Typography variant="body2">Component</Typography>
                        <GuideBox row={true} spacing={0.25} width='100%' height="100%">
                            <ListComponent
                                width={'33%'}
                                label={"Force Filter"}
                                userData={itemsComp}
                                checkList={comp}
                                setCheckList={(l) => setStateUpdate(setComp, l)}
                                {...updateKit}
                            />
                        </GuideBox>
                        <Typography variant="body2">Value Option</Typography>
                        <ListComponent
                            width={'33%'}
                            label={"Output Section Location"}
                            userData={itemsOutputSection}
                            checkList={outputSection}
                            setCheckList={(l) => setStateUpdate(setOutputSection, l)}
                            {...updateKit}
                            singleSelect
                        />
                    </GuideBox>
                </Scrollbars>
            </Panel>
                <MoaStack width={'100%'} direction="row" justifyContent={"right"} spacing={1}>
                    <Button onClick={handleSaveClick}>Save</Button>
                </MoaStack>
        </GuideBox>
    );
});
