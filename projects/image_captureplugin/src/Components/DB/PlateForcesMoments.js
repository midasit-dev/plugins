import { Button, GuideBox, Panel, Scrollbars, Stack, VerifyUtil } from "@midasit-dev/moaui";
import Checkbox from "@midasit-dev/moaui/Components/Check";
import MoaStack from "@midasit-dev/moaui/Components/Stack";
import Typography from "@midasit-dev/moaui/Components/Typography";
import * as React from "react";
import { useRecoilState } from "recoil";
import { setStateUpdate } from "../../utils";
import { DataLoader } from "../../Workers/DataLoader";
import { ListComponent } from "../ListComponents";
import { VarPlateForcesMomentsActiveOnly, VarPlateForcesMomentsAvgNodal, VarPlateForcesMomentsComp, VarPlateForcesMomentsPrintAxis, VarPlateForcesMomentsUCSName, VarPlateForcesMomentsUseUCS, VarPreviewNode, VarPrintImportData } from "../var";
import { UpdateCurrent } from "./SaveUtils";

const awaiter = async (setPending, setListData, func, cmd) => {
    try {
        setPending(true);
        if (VerifyUtil.getMapiKey() !== "") setListData(await func(cmd));
        setPending(false);
    } catch (_) {
        console.log(_);
    }
};

export const PlateForcesMoments = React.forwardRef((props, ref) => {
    const [doUpdate, setDoUpdate] = React.useState("");

    const itemsComp = ["Fxx", "Fyy", "Fxy", "Fmax", "Fmin", "FMax", "Mxx", "Myy", "Mxy", "Mmax", "Mmin", "MMax", "Vxx", "Vyy", "VMax"];
    const [comp, setComp] = useRecoilState(VarPlateForcesMomentsComp);

    const itemsAvgNodal = ["Element", "Avg. Nodal"];
    const [avgNodal, setAvgNodal] = useRecoilState(VarPlateForcesMomentsAvgNodal);

    const itemsActiveOnly = ["Active Only"];
    const [activeOnly, setActiveOnly] = useRecoilState(VarPlateForcesMomentsActiveOnly);

    const itemsUseUCS = ["Local", "UCS"];
    const [useUCS, setUseUCS] = useRecoilState(VarPlateForcesMomentsUseUCS);

    const [itemsUCSName, setItemsUCSName] = React.useState(["Current UCS"]); //useRecoilState(VarPlateForcesMomentsUCSNameItems);
    const [uCSName, setUCSName] = useRecoilState(VarPlateForcesMomentsUCSName);

    const itemsPrintAxis = ["Print UCS Axis"];
    const [printAxis, setPrintAxis] = useRecoilState(VarPlateForcesMomentsPrintAxis);

    const updateKit = { doUpdate: doUpdate, setDoUpdate: setDoUpdate };

    const [previewNode, setPreviewNode] = useRecoilState(VarPreviewNode);
    const [importData, setImportData] = useRecoilState(VarPrintImportData);

    const [isPending, setPending] = React.useState(false);

    const [nucs, setNUCS] = React.useState([]);

    React.useEffect(() => {
        const loadNUCS = async () => {
            await awaiter(setPending, setNUCS, DataLoader, "/DB/NUCS");
        };

        loadNUCS();
    }, []);

    React.useEffect(() => {
        if (nucs && nucs["NUCS"]) {
            const items = ["Current UCS"];
            const map = new Map(Object.entries(nucs["NUCS"]));
            for (const [key, value] of map) {
                items.push(value.NAME);
            }
            setItemsUCSName(items);
        }
    }, [nucs]);

    const handleSaveClick = () => {
        const copy = JSON.parse(JSON.stringify(previewNode));
        const node = {
            Component: comp,
            "Avg.CalcMethod": avgNodal[0],
            "Avg.NodalActiveOnly": activeOnly,
            UseUCS: useUCS[0],
            UCSName: uCSName[0],
            PrintUCSAxis: printAxis.includes("Print UCS Axis"),
        };
        if (!copy["DB"]) copy["DB"] = {};
        copy["DB"]["Forces - Plate Forces/Moments"] = node;

        setPreviewNode(copy);

        UpdateCurrent(copy, importData, setImportData);
    };

    const footerContent = (
        <Stack>
            <GuideBox horLeft padding={1.5}>
                <Typography color="disable" variant="body2">Avg.Nodal</Typography>

                <GuideBox width={"100%"} row verCenter horSpaceBetween padding={0.5}>
                    <Typography>Active Only</Typography>
                    <Checkbox checked={activeOnly} onChange={(e, checked) => setActiveOnly(checked)} />
                </GuideBox>
            </GuideBox>
        </Stack>
    );

    return (
        <GuideBox height={"100%"} row={false} verSpaceBetween spacing={1}>
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
                <Scrollbars width={"100%"} height={"492px"}>
                    <GuideBox spacing={1} width={"97%"}>
                        <Typography variant="body2">Component</Typography>
                        <GuideBox row={true} spacing={0.25} width="100%" height="100%">
                            <ListComponent
                                width={"33%"}
                                label={"Component"}
                                userData={itemsComp}
                                checkList={comp}
                                setCheckList={(l) => setStateUpdate(setComp, l)}
                                {...updateKit}
                            />
                            <ListComponent
                                width={"33%"}
                                label={"Avg. Calc Method"}
                                userData={itemsAvgNodal}
                                checkList={avgNodal}
                                setCheckList={(l) => setStateUpdate(setAvgNodal, l)}
                                {...updateKit}
                                singleSelect
                                footer={footerContent}
                            />
                            {/* <ListComponent
                                width={"33%"}
                                label={"Avg. Nodal"}
                                userData={itemsActiveOnly}
                                checkList={activeOnly}
                                setCheckList={(l) => setStateUpdate(setActiveOnly, l)}
                                {...updateKit}
                            /> */}
                        </GuideBox>
                        <Typography variant="body2">UCS Option</Typography>
                        <GuideBox row={true} spacing={0.25} width="100%" height="100%">
                            <ListComponent
                                width={"33%"}
                                label={"Use UCS"}
                                userData={itemsUseUCS}
                                checkList={useUCS}
                                setCheckList={(l) => setStateUpdate(setUseUCS, l)}
                                {...updateKit}
                                singleSelect
                            />
                            <ListComponent
                                width={"33%"}
                                label={"UCS Name"}
                                userData={itemsUCSName}
                                checkList={uCSName}
                                setCheckList={(l) => setStateUpdate(setUCSName, l)}
                                {...updateKit}
                                singleSelect
                                allowNone
                            />
                            <ListComponent
                                width={"33%"}
                                label={"Print UCS Axis"}
                                userData={itemsPrintAxis}
                                checkList={printAxis}
                                setCheckList={(l) => setStateUpdate(setPrintAxis, l)}
                                {...updateKit}
                            />
                        </GuideBox>
                    </GuideBox>
                </Scrollbars>
            </Panel>
                <MoaStack width={'100%'} direction="row" justifyContent={"right"} spacing={1}>
                    <Button onClick={handleSaveClick}>Save</Button>
                </MoaStack>
        </GuideBox>
    );
});
