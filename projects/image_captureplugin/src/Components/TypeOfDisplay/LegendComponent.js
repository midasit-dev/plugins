import MoaStack from "@midasit-dev/moaui/Components/Stack";
import Typography from "@midasit-dev/moaui/Components/Typography";
import * as React from "react";
import { useRecoilState } from "recoil";
import { setStateUpdate } from "../../utils";
import { ListComponent } from "../ListComponents";
import { VarLegendDecimalPoints, VarLegendExp, VarLegendPosition, VarLegendUse, VarPreviewNode, VarPrintImportData } from "../var";

import { Button, GuideBox, Panel, Switch, TextField } from "@midasit-dev/moaui";
import { convertToNumber } from "../CommonUtils";
import { UpdateCurrent } from "../DB/SaveUtils";

export const LegendComponent = React.forwardRef((props, ref) => {

    const [doUpdate, setDoUpdate] = React.useState("");

    const [use, setUse] = useRecoilState(VarLegendUse);
    const [position, setPosition] = useRecoilState(VarLegendPosition);
    const [exp, setExp] = useRecoilState(VarLegendExp);
    const [decimalPoints, setDecimalPoints] = useRecoilState(VarLegendDecimalPoints);


    const itemsPosition = ["Left", "Right"];
    const itemsExp = ["Exponential", "Fixed"];

    const updateKit = { doUpdate: doUpdate, setDoUpdate: setDoUpdate };

    const [previewNode, setPreviewNode] = useRecoilState(VarPreviewNode);
    const [importData, setImportData] = useRecoilState(VarPrintImportData);

    const handleSaveClick = () => {
        const copy = JSON.parse(JSON.stringify(previewNode));
        const node = {
            Active: use,
            Position: position[0],
            RankValueType: exp[0],
            DecimalPoints: convertToNumber(decimalPoints),


        }
        if (!copy["TypeOfDisplay"])
            copy["TypeOfDisplay"] = {};
        copy["TypeOfDisplay"]["Legend"] = node;

        setPreviewNode(copy);

        UpdateCurrent(copy, importData, setImportData);
    };

    return (
        <GuideBox height={'100%'} row={false} verSpaceBetween spacing={1}>
            <MoaStack width={'100%'} height={'100%'} spacing={1}>
                <GuideBox row horSpaceBetween verCenter>
                    <Typography variant="body2">Legend</Typography>
                    <Switch label="Active" checked={use} onChange={(event, checked) => setUse(checked)} />
                </GuideBox>
                <Panel
                    width="100%" height={'100%'} variant="shadow2" border={'1px solid #eee'}            >
                    <GuideBox width={'100%'} spacing={0.5} >
                        <Typography variant="body2">Legend Details</Typography>
                        <GuideBox width={'100%'} row spacing={0.5}>
                            <ListComponent
                                width={'33%'}
                                label="Legend Position"
                                userData={itemsPosition}
                                checkList={position}
                                setCheckList={(l) => setStateUpdate(setPosition, l)}
                                {...updateKit}
                                singleSelect
                            />
                            <ListComponent
                                label="Rank Value Type"
                                width={'33%'}
                                userData={itemsExp}
                                checkList={exp}
                                setCheckList={(l) => setStateUpdate(setExp, l)}
                                {...updateKit}
                                singleSelect
                                footer={(
                                    <GuideBox horLeft padding={1} spacing={0.5} >
                                        <Typography color="disable" variant="body2">Decimal Points</Typography>
                                        <TextField
                                            titlePosition="label"
                                            value={decimalPoints}
                                            onChange={(e) => setDecimalPoints(e.target.value)}
                                        />
                                    </GuideBox>
                                )}
                            />
                            <GuideBox paddingTop={2} width={'33%'} >

                            </GuideBox>
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
