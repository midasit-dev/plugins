import Typography from "@midasit-dev/moaui/Components/Typography";


import { GuideBox, Panel } from "@midasit-dev/moaui";
import Stack from "@midasit-dev/moaui/Components/Stack";
import * as React from "react";
import { useRecoilState } from "recoil";
import LCComponents from "../../LCComponents/LCComponents";
import { VarModelPreviewNode, VarPreviewNode, VarPrintData, VarPrintImportData, VarPrintSelected } from "../var";


import ChipButton from "../ChipButton";
import AddFileButton from "../Custom/AddFileButton";
import CheckboxList from "../Custom/CheckboxList";
//import { GridListComponents } from "../LCComponents/GridListComponents";






export const PrintTab = React.forwardRef((props, ref) => {

    const [bp_Node, setBP_Node] = useRecoilState(VarModelPreviewNode);
    const [isPopupVisible, setPopupVisible] = React.useState(false);
    const [previewNode, setPreviewNode] = useRecoilState(VarPreviewNode);
    const [importData, setImportData] = useRecoilState(VarPrintImportData);
    const [printData, setPrintData] = useRecoilState(VarPrintData);
    const [selected, setSelected] = useRecoilState(VarPrintSelected);
    const [selectedPrint, setSelectedPrint] = React.useState([]);
    //const [lcs, setLcs] = useRecoilState(VarLoadCombination);
    // React.useEffect(() => {
    //     const newData = JSON.parse(JSON.stringify(importData));
    //     newData["Current"] = previewNode;
    //     setImportData(newData);
    // }, [setPreviewNode]);
    const handleSaveClick = (lcs) => {


        if (lcs && lcs["LC"] && lcs["LC"].length > 0) {
            const newPrintData = JSON.parse(JSON.stringify(printData));
            var map = new Map(Object.entries(importData));

            const lcNames = lcs["LC"];

            for (const key of selected) {

                if (!map.has(key)) {
                    continue;
                }
                const value = importData[key];
                const copy = JSON.parse(JSON.stringify(value));
                //const jsonLc = {};
                // for (const lc of lcNames) {
                //     jsonLc[lc] = "";
                // }
                copy["LoadCombination"] = lcs;
                newPrintData[key] = copy;

            }
            setPrintData(newPrintData);
        }

    };

    const handleButtonClick = (lcs) => {
        setPopupVisible(false);
        handleSaveClick(lcs);
    };


    const handleAfterUpload = (data, fileName) => {

        if (data["DB"] == undefined) return;
        const newData = JSON.parse(JSON.stringify(importData));

        newData[fileName] = data;


        setImportData(newData);
    };


    const handleClearTree = () => {
        setImportData({});
    }

    const handleCurrentClick = () => {
        setImportData({ Current: previewNode });
    }

    const handleOnClick = () => {
        const a = 10;
    }
    const handleModelAfterUpload = (data, fileName) => {

        var newBpNode = JSON.parse(JSON.stringify(data));    
        setBP_Node(newBpNode);
    };

    return (
        <Panel
            width="100%"
            height={'100%'}
            variant="shadow2"
            backgroundColor="#F5F5F5"
            padding={2}
            border={
                // isClickedLcomTableCell ? 
                // `1px solid ${Color.primaryNegative.enable_strock}` : 
                '1px solid #eee'
            }
        >

            <Stack width="100%" height="100%" padding={1} spacing={1}>
                <GuideBox row verCenter horSpaceBetween>
                    <Typography variant="h1">File List</Typography>
                </GuideBox>
                <GuideBox height={'100%'} verSpaceBetween spacing={2}>
                    <Panel
                        width="100%"
                        height="550px"
                        variant="shadow2"
                        border={
                            // isClickedLcomTableCell ? 
                            // `1px solid ${Color.primaryNegative.enable_strock}` : 
                            '1px solid #eee'
                        }
                    >
                        <GuideBox height={'100%'} verSpaceBetween spacing={1}>
                            <CheckboxList jsonObject={importData} setJsonObject={setImportData} selected={selected} setSelected={setSelected} />
                            <GuideBox width={'100%'} horCenter verBottom>
                                <ChipButton iconSrc={"svg/ico24_results_combination_loadcombination.svg"} onClick={setPopupVisible} label="Select Load Case" color="#FFFFFF" bgColor="#1E2429"></ChipButton>
                            </GuideBox>
                        </GuideBox>
                    </Panel>
                    <Stack width={'100%'} direction="column" justifyContent={"flex-start"} spacing={1}>                                                     
                        <AddFileButton onAfterUpload={handleModelAfterUpload} buttonName="MODEL View Import Json" />                             
                        <AddFileButton onClick={handleOnClick} onAfterUpload={handleAfterUpload} buttonName="Result Category Import Json" />                     
                    </Stack>
                    {isPopupVisible && <LCComponents onClose={handleButtonClick}></LCComponents>}
                </GuideBox>
            </Stack>
        </Panel>
    );
});
