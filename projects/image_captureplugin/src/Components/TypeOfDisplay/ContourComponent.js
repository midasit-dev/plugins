import MoaStack from "@midasit-dev/moaui/Components/Stack";
import Typography from "@midasit-dev/moaui/Components/Typography";
import * as React from "react";
import { useRecoilState } from "recoil";
import { VarContourColorTable, VarContourFill, VarContourNColor, VarContourUse, VarDisplayArrowScaleFactor, VarPreviewNode, VarPrintImportData } from "../var";

import { Button, GuideBox, Panel, Switch, TextField } from "@midasit-dev/moaui";
import { setStateUpdate } from "../../utils";
import { convertToNumber } from "../CommonUtils";
import { UpdateCurrent } from "../DB/SaveUtils";
import { ListComponent } from "../ListComponents";




export const ContourComponent = React.forwardRef((props, ref) => {

    const [doUpdate, setDoUpdate] = React.useState("");

    const updateKit = { doUpdate: doUpdate, setDoUpdate: setDoUpdate };

    const [use, setUse] = useRecoilState(VarContourUse);
    const [arrowScaleFactor, setArrowScaleFactor] = useRecoilState(VarDisplayArrowScaleFactor);

    const itemsNColor = [6, 12, 18, 24];
    const [nColor, setNColor] = useRecoilState(VarContourNColor);
    const itemsColorTable = ["VRGB", "RGB", "RBG", "Gray Scaled"];
    const [colorTable, setColorTable] = useRecoilState(VarContourColorTable);

    const itemsFill = ["Contour Fill", "Gradient Fill"];
    const [fill, setFill] = useRecoilState(VarContourFill);


    const [previewNode, setPreviewNode] = useRecoilState(VarPreviewNode);
    const [importData, setImportData] = useRecoilState(VarPrintImportData);

    const handleSaveClick = () => {
        const copy = JSON.parse(JSON.stringify(previewNode));
        const node = {
            Active: use,
            ArrowScaleFactor: convertToNumber(arrowScaleFactor),
            NumberOfColor: nColor[0],
            ColorTable: colorTable[0],
            ContourFill: fill.includes("Contour Fill"),
            GradientFill: fill.includes("Gradient Fill"),

        }
        if (!copy["TypeOfDisplay"])
            copy["TypeOfDisplay"] = {};
        copy["TypeOfDisplay"]["Contour"] = node;

        setPreviewNode(copy);

        UpdateCurrent(copy, importData, setImportData);
    };

    return (
        <GuideBox height={'100%'} row={false} verSpaceBetween spacing={1}>
            <MoaStack width={'100%'} height={'100%'} spacing={1}>
                <GuideBox row horSpaceBetween verCenter>
                    <Typography variant="body2">Contour</Typography>
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
                        <Typography variant="body2">Contour Details</Typography>
                        <GuideBox width={'100%'} row horSpaceBetween spacing={0.5}>
                            <ListComponent
                                userData={itemsNColor}
                                checkList={nColor}
                                label={"Number of Color"}
                                setCheckList={(l) => setStateUpdate(setNColor, l)}
                                {...updateKit}
                                singleSelect
                            />
                            <ListComponent
                                userData={itemsColorTable}
                                checkList={colorTable}
                                label={"Color Table"}
                                setCheckList={(l) => setStateUpdate(setColorTable, l)}
                                {...updateKit}
                                singleSelect
                            />
                            <ListComponent
                                userData={itemsFill}
                                checkList={fill}
                                label={"Options"}
                                setCheckList={(l) => setStateUpdate(setFill, l)}
                                {...updateKit}
                            />
                        </GuideBox>
                        <Typography variant="body2">Options</Typography>
                        <GuideBox width={'33%'}>
                            <TextField title="Arrow Scale Factor" titlePosition="label" value={arrowScaleFactor} onChange={(e) => setArrowScaleFactor(e.target.value)} />
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
