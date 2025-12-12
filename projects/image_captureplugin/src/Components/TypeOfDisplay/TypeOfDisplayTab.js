import MoaStack from "@midasit-dev/moaui/Components/Stack";
import Typography from "@midasit-dev/moaui/Components/Typography";
import * as React from "react";

import { GuideBox, Panel } from "@midasit-dev/moaui";

import { LegendComponent } from "./LegendComponent";
import { ValueComponent } from "./ValueComponent";


import { useRecoilState } from "recoil";
import ImageTextButton from "../ImageTextButton";
import { VarTypeOfDisplayCurrent } from "../var";
import { AppliedLoads } from "./AppliedLoads";
import { ContourComponent } from "./ContourComponent";
import { CuttingDiagram } from "./CuttingDiagram";
import { Deformation } from "./Deformation";
import { DisplacementOption } from "./DisplacmentOption";

export const TypeOfDisplayTab = React.forwardRef((props, ref) => {

    const dropListItems = {
        Reaction: ["Force/Moments"],
        Deformation: ["Shape", "Displacement"]
    }

    const dropListValue = {
        Reaction: "Force/Moments",
        Deformation: "Shape"
    }

    //React.useEffect(() => {}, []);
    const [doUpdate, setDoUpdate] = useRecoilState(VarTypeOfDisplayCurrent);
    return (
        <Panel
            width="100%"
            height={'100%'}
            variant="shadow2"
            border={
                // isClickedLcomTableCell ? 
                // `1px solid ${Color.primaryNegative.enable_strock}` : 
                '1px solid #eee'
            }
        >
            <GuideBox height={'100%'} spacing={2}>
                <MoaStack width="100%" height="100%" spacing={1}>
                    <Typography variant="body2">Result Category</Typography>

                    <MoaStack direction="row" spacing={0.25}>
                        <ImageTextButton iconSrc="svg/Contour.svg" text="Contour" isActive={doUpdate == "Contour"} onClick={() => { setDoUpdate("Contour"); }} />
                        <ImageTextButton iconSrc="svg/Value.svg" text="Value" isActive={doUpdate == "Value"} onClick={() => { setDoUpdate("Value"); }} />
                        <ImageTextButton iconSrc="svg/Legend.svg" text="Legend" isActive={doUpdate == "Legend"} onClick={() => { setDoUpdate("Legend"); }} />
                        <ImageTextButton iconSrc="svg/Deform.svg" text="Deform" isActive={doUpdate == "Deform"} onClick={() => { setDoUpdate("Deform"); }} />
                        <ImageTextButton iconSrc="svg/DisplacementOption.svg" text="Disp. Option" isActive={doUpdate == "DisplacementOption"} onClick={() => { setDoUpdate("DisplacementOption"); }} />
                        <ImageTextButton iconSrc="svg/AppliedLoads.svg" text="Applied Loads" isActive={doUpdate == "AppliedLoads"} onClick={() => { setDoUpdate("AppliedLoads"); }} />
                        <ImageTextButton iconSrc="svg/CuttingDiagram.svg" text="Cutting Diagram" isActive={doUpdate == "CuttingDiagram"} onClick={() => { setDoUpdate("CuttingDiagram"); }} />
                    </MoaStack>
                    {doUpdate == "Contour" && (<ContourComponent />)}
                    {doUpdate == "Value" && (<ValueComponent />)}
                    {doUpdate == "Legend" && (<LegendComponent />)}
                    {doUpdate == "Deform" && (<Deformation />)}
                    {doUpdate == "DisplacementOption" && (<DisplacementOption />)}
                    {doUpdate == "AppliedLoads" && (<AppliedLoads />)}
                    {doUpdate == "CuttingDiagram" && (<CuttingDiagram />)}

                </MoaStack>
            </GuideBox>
        </Panel>
    );
});
