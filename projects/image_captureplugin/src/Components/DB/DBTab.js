import MoaDroplist from "@midasit-dev/moaui/Components/DropList";
import MoaStack from "@midasit-dev/moaui/Components/Stack";
import Typography from "@midasit-dev/moaui/Components/Typography";
import * as React from "react";
import { useRecoilState } from "recoil";

import { GuideBox, Panel } from "@midasit-dev/moaui";

import { ReactionComponent } from "./ReactionComponent";

import ImageTextButton from "../ImageTextButton";
import { VarDBCurrent } from "../var";
import { BeamDiagrams } from "./BeamDiagrams";
import { BeamForcesMoments } from "./BeamForcesMoments";
import { BeamStresses } from "./BeamStresses";
import { BeamStressesDiagram } from "./BeamStressesDiagram";
import { BeamStressesPSC } from "./BeamStressesPSC";
import { DeformedShape } from "./DeformedShape";
import { DisplacementContour } from "./DisplacementContour";
import { MovingLoadBeamForcesMoments } from "./MovingLoadBeamForcesMoments";
import { MovingLoadBeamStresses } from "./MovingLoadBeamStresses";
import { MovingLoadPlateForcesMoments } from "./MovingLoadPlateForcesMoments";
import { MovingLoadReaction } from "./MovingLoadReaction";
import { PlaneStressPlateStresses } from "./PlaneStressPlateStresses";
import { PlateForcesMoments } from "./PlateForcesMoments";
import { TrussForces } from "./TrussForces";
import { VibrationModeShapes } from "./VibrationModeShapes";

export const DBTab = React.forwardRef((props, ref) => {

    const dropListItems = {
        Reaction: ["Reaction - Forces/Moments"],
        Deformation: ["Deformations - Deformed Shape", "Deformations - Displacement Contour"],
        Forces: ["Forces - Truss Forces", "Forces - Beam Forces/Moments", "Forces - Beam Diagrams", "Forces - Plate Forces/Moments"],
        Stresses: ["Stresses - Beam Stresses", "Stresses - Beam Stresses Diagram", "Stresses - Beam Stresses(PSC)", "Stresses - Plane-Stress/Plate Stresses",],
        MovingLoadTracer: ["Moving Load Tracer - Reactions", "Moving Load Tracer - Beam Forces/Moments", "Moving Load Tracer - Plate Forces/Moments", "Moving Load Tracer - Beam Stresses"],
        ModeShapes: ["Mode Shapes - Vibration Mode Shapes"],
    }

    const [dropListValue, setDropListValue] = React.useState({
        Reaction: dropListItems["Reaction"][0],
        Deformation: dropListItems["Deformation"][0],
        Forces: dropListItems["Forces"][0],
        Stresses: dropListItems["Stresses"][0],
        MovingLoadTracer: dropListItems["MovingLoadTracer"][0],
        ModeShapes: dropListItems["ModeShapes"][0],
    });

    const [doUpdate, setDoUpdate] = useRecoilState(VarDBCurrent);
    const handleComboChanged = (e) => {
        const value = e.target.value;

        const clone = JSON.parse(JSON.stringify(dropListValue));
        clone[doUpdate] = value;

        setDropListValue(clone);


    }
    return (

        <Panel
            width={'100%'}
            height={'100%'}
            variant="shadow2"
            border={
                // isClickedLcomTableCell ? 
                // `1px solid ${Color.primaryNegative.enable_strock}` : 
                '1px solid #eee'
            }
        >
            <GuideBox height={'100%'}>
                <MoaStack width="100%" height="100%" spacing={1}>
                    <Typography variant="body2">Result Category</Typography>

                    <GuideBox row spacing={1} horSpaceBetween>
                        <ImageTextButton iconSrc="svg/ico24_results_results_reactions.svg" text="Reactions" isActive={doUpdate == "Reaction"} onClick={() => { setDoUpdate("Reaction"); }} />
                        <ImageTextButton iconSrc="svg/ico24_results_results_deformations.svg" text="Deformations" isActive={doUpdate == "Deformation"} onClick={() => { setDoUpdate("Deformation"); }} />
                        <ImageTextButton iconSrc="svg/ico24_results_results_forces.svg" text="Forces" isActive={doUpdate == "Forces"} onClick={() => { setDoUpdate("Forces"); }} />
                        <ImageTextButton iconSrc="svg/ico24_results_results_stresses.svg" text="Stresses" isActive={doUpdate == "Stresses"} onClick={() => { setDoUpdate("Stresses"); }} />
                        <ImageTextButton iconSrc="svg/ico24_results_movingload_movingtracer.svg" text="Moving Tracer" isActive={doUpdate == "MovingLoadTracer"} onClick={() => { setDoUpdate("MovingLoadTracer"); }} />
                        <ImageTextButton iconSrc="svg/ico24_results_modeshape_modeshapes.svg" text="Mode Shapes" isActive={doUpdate == "ModeShapes"} onClick={() => { setDoUpdate("ModeShapes"); }} />
                    </GuideBox>

                    <MoaDroplist
                        title="Active"
                        width="100%"
                        itemList={() => {
                            let map = new Map();
                            for (const value of dropListItems[doUpdate]) {
                                map.set(value, value);
                            }
                            return map;
                        }}
                        value={dropListValue[doUpdate]}
                        onChange={handleComboChanged}
                    />


                    {dropListValue[doUpdate] == dropListItems["Reaction"][0] && (<ReactionComponent />)}
                    {dropListValue[doUpdate] == dropListItems["Deformation"][0] && (<DeformedShape />)}
                    {dropListValue[doUpdate] == dropListItems["Deformation"][1] && (<DisplacementContour />)}
                    {dropListValue[doUpdate] == dropListItems["Forces"][0] && (<TrussForces />)}
                    {dropListValue[doUpdate] == dropListItems["Forces"][1] && (<BeamForcesMoments />)}
                    {dropListValue[doUpdate] == dropListItems["Forces"][2] && (<BeamDiagrams />)}
                    {dropListValue[doUpdate] == dropListItems["Forces"][3] && (<PlateForcesMoments />)}
                    {dropListValue[doUpdate] == dropListItems["Stresses"][0] && (<BeamStresses />)}
                    {dropListValue[doUpdate] == dropListItems["Stresses"][1] && (<BeamStressesDiagram />)}
                    {dropListValue[doUpdate] == dropListItems["Stresses"][2] && (<BeamStressesPSC />)}
                    {dropListValue[doUpdate] == dropListItems["Stresses"][3] && (<PlaneStressPlateStresses />)}
                    {dropListValue[doUpdate] == dropListItems["MovingLoadTracer"][0] && (<MovingLoadReaction />)}
                    {dropListValue[doUpdate] == dropListItems["MovingLoadTracer"][1] && (<MovingLoadBeamForcesMoments />)}
                    {dropListValue[doUpdate] == dropListItems["MovingLoadTracer"][2] && (<MovingLoadPlateForcesMoments />)}
                    {dropListValue[doUpdate] == dropListItems["MovingLoadTracer"][3] && (<MovingLoadBeamStresses />)}
                    {dropListValue[doUpdate] == dropListItems["ModeShapes"][0] && (<VibrationModeShapes />)}


                </MoaStack>
            </GuideBox>
        </Panel>

    );
});
