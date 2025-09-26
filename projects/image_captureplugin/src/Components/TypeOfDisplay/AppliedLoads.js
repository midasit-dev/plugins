import MoaStack from "@midasit-dev/moaui/Components/Stack";
import Typography from "@midasit-dev/moaui/Components/Typography";
import * as React from "react";
import { useRecoilState } from "recoil";
import { setStateUpdate } from "../../utils";
import { ListComponent } from "../ListComponents";
import { VarMovingLoadDecimalPoint, VarMovingLoadETC, VarMovingLoadLoadValues, VarMovingLoadScaleFactor, VarMovingLoadUse, VarMovingLoadValueType, VarPreviewNode, VarPrintImportData } from "../var";

import { Button, GuideBox, Panel, Switch, TextField } from "@midasit-dev/moaui";
import { convertToNumber } from "../CommonUtils";
import { UpdateCurrent } from "../DB/SaveUtils";

export const AppliedLoads = React.forwardRef((props, ref) => {

    const [doUpdate, setDoUpdate] = React.useState("");

    const [use, setUse] = useRecoilState(VarMovingLoadUse);

    const [scaleFactor, setScaleFactor] = useRecoilState(VarMovingLoadScaleFactor);
    const itemsLoadValue = ["Arrow Only", "Load Values"];
    const [useLoadValue, setUseLoadVaalue] = useRecoilState(VarMovingLoadLoadValues);
    const itemsValueType = ["Exponential", "Fixed"];
    const [valueType, setValueType] = useRecoilState(VarMovingLoadValueType);
    const [decimalPoint, setDecimalPoint] = useRecoilState(VarMovingLoadDecimalPoint);

    const itemsETC = ["Include Impact factor", "Include Psi Factor"];
    const [etc, setEtc] = useRecoilState(VarMovingLoadETC);

    const updateKit = { doUpdate: doUpdate, setDoUpdate: setDoUpdate };

    const [previewNode, setPreviewNode] = useRecoilState(VarPreviewNode);
    const [importData, setImportData] = useRecoilState(VarPrintImportData);

    const handleSaveClick = () => {
        const copy = JSON.parse(JSON.stringify(previewNode));
        const node = {
            Active: use,
            ScaleFactor: convertToNumber(scaleFactor),
            LoadValues: useLoadValue[0],
            ValueType: valueType[0],
            DecimalPoint: convertToNumber(decimalPoint),
            IncludeImpactFactor: etc.includes("Include Impact factor"),
            IncludePsiFactor: etc.includes("Include Psi Factor"),


        }
        if (!copy["TypeOfDisplay"])
            copy["TypeOfDisplay"] = {};
        copy["TypeOfDisplay"]["Applied Loads"] = node;

        setPreviewNode(copy);

        UpdateCurrent(copy, importData, setImportData);
    };

    return (
        <GuideBox height={'100%'} row={false} verSpaceBetween spacing={1}>
            <MoaStack width={'100%'} height={'100%'} spacing={1}>
                <GuideBox row horSpaceBetween verCenter>
                    <Typography variant="body2">Applied Loads</Typography>
                    <Switch label="Active" checked={use} onChange={(event, checked) => setUse(checked)} />
                </GuideBox>
                <Panel
                    width="100%" height={'100%'} variant="shadow2" border={'1px solid #eee'}>
                    <GuideBox width={'100%'} spacing={0.5} >
                        <Typography variant="body2">Moving Load Tracer Details</Typography>
                        <GuideBox width={'100%'} row spacing={0.5}>
                            <ListComponent
                                width={'33%'}
                                label="Load Values"
                                userData={itemsLoadValue}
                                checkList={useLoadValue}
                                setCheckList={(l) => setStateUpdate(setUseLoadVaalue, l)}
                                {...updateKit}
                                singleSelect
                                footer={(
                                    <GuideBox horLeft padding={1} spacing={0.5} >
                                        <Typography color="disable" variant="body2">Arrow Scale Factor</Typography>
                                        <TextField
                                            titlePosition="label"
                                            value={scaleFactor}
                                            onChange={(e) => setScaleFactor(e.target.value)}
                                        />
                                    </GuideBox>
                                )}
                            />
                            <ListComponent
                                width={'33%'}
                                label="Value Type"
                                userData={itemsValueType}
                                checkList={valueType}
                                setCheckList={(l) => setStateUpdate(setValueType, l)}
                                {...updateKit}
                                singleSelect
                                footer={(
                                    <GuideBox horLeft padding={1} spacing={0.5} >
                                        <Typography color="disable" variant="body2">Decimal Point</Typography>
                                        <TextField
                                            titlePosition="label"
                                            value={decimalPoint}
                                            onChange={(e) => setDecimalPoint(e.target.value)}
                                        />
                                    </GuideBox>
                                )}
                            />

                        </GuideBox>
                        <GuideBox row spacing={1} width={'100%'}>
                            <ListComponent
                                width={'33%'}
                                label="ETC"
                                userData={itemsETC}
                                checkList={etc}
                                setCheckList={(l) => setStateUpdate(setEtc, l)}
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
