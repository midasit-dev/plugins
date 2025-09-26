import MoaStack from "@midasit-dev/moaui/Components/Stack";
import Typography from "@midasit-dev/moaui/Components/Typography";
import * as React from "react";
import { useRecoilState } from "recoil";
import { setStateUpdate } from "../../utils";
import { ListComponent } from "../ListComponents";
import { VarPreviewNode, VarPrintImportData, VarValueCS, VarValueDecimalPoints, VarValueExp, VarValueLimitScale, VarValueMinMax, VarValueNonlinear, VarValueOrientation, VarValueUse } from "../var";

import { Button, GuideBox, Panel, Switch, TextField } from "@midasit-dev/moaui";
import { convertToNumber } from "../CommonUtils";
import { UpdateCurrent } from "../DB/SaveUtils";


export const ValueComponent = React.forwardRef((props, ref) => {

    const [doUpdate, setDoUpdate] = React.useState("");

    const [use, setUse] = useRecoilState(VarValueUse);
    const [minMax, setMinMax] = useRecoilState(VarValueMinMax);
    const [limitScale, setLimitScale] = useRecoilState(VarValueLimitScale);
    const [decimalPoints, setDecimalPoints] = useRecoilState(VarValueDecimalPoints);
    //const [exp, setExp] = useRecoilState(VarValueExp);
    const [orientation, setOrientation] = useRecoilState(VarValueOrientation);

    const itemsMinMax = ["All", "Min & Max", "Abs Max", "Max", "Min"];
    const orientationItems = [0, 15, 30, 45, 60, 75, 90, 105, 120, 135, 150, 165, 180]

    const itmesNonlinear = ["Yield Point"];
    const [nonlinear, setNonlinear] = useRecoilState(VarValueNonlinear);

    const itemsCS = ["Current Step Force"];
    const [cs, setCS] = useRecoilState(VarValueCS);

    const itemsNotation = ["Exponential", "Fixed"];
    const [notation, setNotation] = useRecoilState(VarValueExp);

    const updateKit = { doUpdate: doUpdate, setDoUpdate: setDoUpdate };

    const [previewNode, setPreviewNode] = useRecoilState(VarPreviewNode);
    const [importData, setImportData] = useRecoilState(VarPrintImportData);

    const handleSaveClick = () => {
        const copy = JSON.parse(JSON.stringify(previewNode));
        const node = {
            Active: use,
            MinMaxType: minMax,
            LimitScale: convertToNumber(limitScale),
            Exponential: notation.includes("Exponential"),
            DecimalPoints: convertToNumber(decimalPoints),
            Orientation: orientation[0],
            CurrentStepForce: cs.includes("Current Step Force"),
            YieldPoint: nonlinear.includes("Yield Point"),

        }
        if (!copy["TypeOfDisplay"])
            copy["TypeOfDisplay"] = {};
        copy["TypeOfDisplay"]["Value"] = node;

        setPreviewNode(copy);

        UpdateCurrent(copy, importData, setImportData);
    };

    const footerMinMax = (
        <GuideBox horLeft padding={1} spacing={0.5} >
            <Typography color="disable" variant="body2">Limit Scale(%)</Typography>
            <TextField
                titlePosition="label"
                value={limitScale}
                onChange={(e) => setLimitScale(e.target.value)}
            />
        </GuideBox>
    );

    return (
        <GuideBox height={'100%'} row={false} verSpaceBetween spacing={1}>
            <MoaStack width={'100%'} height={'100%'} spacing={1}>
                <GuideBox row horSpaceBetween verCenter>
                    <Typography variant="body2">Value</Typography>
                    <Switch label="Active" checked={use} onChange={(event, checked) => setUse(checked)} />
                </GuideBox>

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
                    <GuideBox width={'100%'} spacing={0.5} >
                        <Typography variant="body2">Value Output Details</Typography>
                        <GuideBox width={'100%'} row spacing={0.5}>
                            <ListComponent
                                width={'33%'}
                                userData={itemsMinMax}
                                checkList={minMax}
                                label={"Min Max Type"}
                                setCheckList={(l) => setStateUpdate(setMinMax, l)}
                                {...updateKit}
                                singleSelect
                                footer={footerMinMax}
                            />
                            <ListComponent
                                width={'33%'}
                                userData={itemsNotation}
                                checkList={notation}
                                label={"Notation"}
                                setCheckList={(l) => setStateUpdate(setNotation, l)}
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
                            <ListComponent
                                width={'33%'}
                                userData={orientationItems}
                                checkList={orientation}
                                label={"Orientation"}
                                setCheckList={(l) => setStateUpdate(setOrientation, l)}
                                {...updateKit}
                                singleSelect
                            />
                        </GuideBox>
                        <Typography variant="body2">Options</Typography>
                        <GuideBox row spacing={0.5} width={'100%'}>
                            <ListComponent
                                width={'33%'}
                                userData={itemsCS}
                                checkList={cs}
                                label={"Construction Stage"}
                                setCheckList={(l) => setStateUpdate(setCS, l)}
                                {...updateKit}
                            />
                            <ListComponent
                                width={'33%'}
                                userData={itmesNonlinear}
                                checkList={nonlinear}
                                label={"Nonlinear"}
                                setCheckList={(l) => setStateUpdate(setNonlinear, l)}
                                {...updateKit}
                            />
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
