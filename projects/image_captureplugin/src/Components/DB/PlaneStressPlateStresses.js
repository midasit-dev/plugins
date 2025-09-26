import MoaStack from "@midasit-dev/moaui/Components/Stack";
import Typography from "@midasit-dev/moaui/Components/Typography";
import * as React from "react";
import { useRecoilState } from "recoil";
import { setStateUpdate } from "../../utils";
import { ListComponent } from "../ListComponents";

import { Button, GuideBox, Panel, Scrollbars, VerifyUtil } from "@midasit-dev/moaui";

import Checkbox from "@midasit-dev/moaui/Components/Check";
import { DataLoader } from "../../Workers/DataLoader";
import { VarPlaneStressPlateStressesActiveOnly, VarPlaneStressPlateStressesAvgNodal, VarPlaneStressPlateStressesComp, VarPlaneStressPlateStressesPrintAxis, VarPlaneStressPlateStressesSurface, VarPlaneStressPlateStressesUCSName, VarPlaneStressPlateStressesUseUCS, VarPreviewNode, VarPrintImportData } from "../var";
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


export const PlaneStressPlateStresses = React.forwardRef((props, ref) => {
    const [doUpdate, setDoUpdate] = React.useState("");

    const itemsComp = ["Sig-xx", "Sig-yy", "Sig-zz",
        "Sig-xy", "Sig-yz", "Sig-xz",
        "Sig-max", "Sig-min", "Sig-eff",
        "Max-Shear"];
    const [comp, setComp] = useRecoilState(VarPlaneStressPlateStressesComp);

    const itemsAvgNodal = ["Element", "Avg. Nodal"];
    const [avgNodal, setAvgNodal] = useRecoilState(VarPlaneStressPlateStressesAvgNodal);

    const itemsSurface = ["Top", "Bottom", "Both Sides", "Abs Max"];
    const [surface, setSurface] = useRecoilState(VarPlaneStressPlateStressesSurface);

    const [activeOnly, setActiveOnly] = useRecoilState(VarPlaneStressPlateStressesActiveOnly);

    const itemsUseUCS = ["Local", "UCS"];
    const [useUCS, setUseUCS] = useRecoilState(VarPlaneStressPlateStressesUseUCS);

    const [itemsUCSName, setItemsUCSName] = React.useState(["Current UCS"]); //useRecoilState(VarPlateForcesMomentsUCSNameItems);
    const [uCSName, setUCSName] = useRecoilState(VarPlaneStressPlateStressesUCSName);

    const itemsPrintAxis = ["Print UCS Axis"];
    const [printAxis, setPrintAxis] = useRecoilState(VarPlaneStressPlateStressesPrintAxis);

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
            Surface: surface[0],
            UseUCS: useUCS[0],
            UCSName: uCSName[0],
            PrintUCSAxis: printAxis.includes("Print UCS Axis"),

        }
        if (!copy["DB"])
            copy["DB"] = {};
        copy["DB"]["Stresses - Plane-Stress/Plate Stresses"] = node;

        setPreviewNode(copy);

        UpdateCurrent(copy, importData, setImportData);
    };

    const footerContent = (
        <MoaStack>
            <GuideBox horLeft padding={1.5}>
                <Typography color="disable" variant="body2">Avg.Nodal</Typography>

                <GuideBox width={"100%"} row verCenter horSpaceBetween padding={0.5}>
                    <Typography>Active Only</Typography>
                    <Checkbox checked={activeOnly} onChange={(e, checked) => setActiveOnly(checked)} />
                </GuideBox>
            </GuideBox>
        </MoaStack>
    );


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
                    <GuideBox width={'97%'} spacing={1}>
                        <Typography variant="body2">Component</Typography>
                        <GuideBox row={true} spacing={0.25} width='100%' height="100%">
                            <ListComponent
                                width={'33%'}
                                label={"Component"}
                                userData={itemsComp}
                                checkList={comp}
                                setCheckList={(l) => setStateUpdate(setComp, l)}
                                {...updateKit}
                            />
                            <ListComponent
                                width={'33%'}
                                label={"Avg. Calc Method"}
                                userData={itemsAvgNodal}
                                checkList={avgNodal}
                                setCheckList={(l) => setStateUpdate(setAvgNodal, l)}
                                {...updateKit}
                                singleSelect
                                footer={footerContent}
                            />
                            <ListComponent
                                width={'33%'}
                                label={"Surface"}
                                userData={itemsSurface}
                                checkList={surface}
                                setCheckList={(l) => setStateUpdate(setSurface, l)}
                                {...updateKit}
                                singleSelect
                            />
                        </GuideBox>
                        <GuideBox row={true} spacing={0.25} width='100%' height="100%">

                        </GuideBox>
                        <Typography variant="body2">UCS Option</Typography>
                        <GuideBox row={true} spacing={0.25} width='100%' height="100%">
                            <ListComponent
                                width={'33%'}
                                label={"Use UCS"}
                                userData={itemsUseUCS}
                                checkList={useUCS}
                                setCheckList={(l) => setStateUpdate(setUseUCS, l)}
                                {...updateKit}
                                singleSelect
                            />
                            <ListComponent
                                width={'33%'}
                                label={"UCS Name"}
                                userData={itemsUCSName}
                                checkList={uCSName}
                                setCheckList={(l) => setStateUpdate(setUCSName, l)}
                                {...updateKit}
                                singleSelect
                                allowNone
                            />
                            <ListComponent
                                width={'33%'}
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
