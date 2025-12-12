import { Button } from '@midasit-dev/moaui';
import { useCallback, useEffect, useRef, useState } from "react";
import { useRecoilState } from "recoil";
import { __read } from "tslib";
import { UpdateCurrent } from "../DB/SaveUtils";
import { VarBeamDiagramFidlity, VarBeamDiagramFill, VarBeamDiagramsByMember, VarBeamDiagramScale, VarBeamDiagramsComp, VarBeamDiagramsOuputLocation, VarBeamDiagramsOuputSectionLocation, VarBeamDiagramsPart, VarBeamDiagramsShowTrussForce, VarBeamForcesMomentsByMember, VarBeamForcesMomentsComp, VarBeamForcesMomentsOuputLocation, VarBeamForcesMomentsOuputSectionLocation, VarBeamForcesMomentsPart, VarBeamForcesMomentsShowTrussForce, VarBeamStressesCombined, VarBeamStressesComp, VarBeamStressesComp7th, VarBeamStressesDiagramCombined, VarBeamStressesDiagramComp, VarBeamStressesDiagramComp7th, VarBeamStressesDiagramFill, VarBeamStressesDiagramOuputLocation, VarBeamStressesDiagramOuputSectionLocation, VarBeamStressesDiagramPart, VarBeamStressesDiagramScale, VarBeamStressesOuputLocation, VarBeamStressesOuputSectionLocation, VarBeamStressesPart, VarBeamStressesPSCComp, VarBeamStressesPSCComp7th, VarBeamStressesPSCFill, VarBeamStressesPSCOuputLocation, VarBeamStressesPSCOuputSectionLocation, VarBeamStressesPSCScale, VarBeamStressesPSCSectionPosition, VarContourColorTable, VarContourFill, VarContourNColor, VarContourUse, VarCuttingDiagramDispOptions, VarCuttingDiagramLines, VarCuttingDiagramPlanes, VarCuttingDiagramReverse, VarCuttingDiagramScaleFactor, VarCuttingDiagramType, VarCuttingDiagramUse, VarCuttingDiagramValueOptions, VarDeformAdditional, VarDeformDeformationType, VarDeformDisp, VarDeformedShapeComp, VarDeformedShapeLocal, VarDeformedTimeHistoryFunctionType, VarDeformETC, VarDeformScaleFactor, VarDeformUse, VarDispContourComp, VarDispContourLocal, VarDispContourTimeHistoryFunctionType, VarDisplayArrowScaleFactor, VarDispOptContour, VarDispOptUse, VarDispOptValueMax, VarLegendDecimalPoints, VarLegendExp, VarLegendPosition, VarLegendUse, VarMovingLoadBeamForcesMomentsComp, VarMovingLoadBeamForcesMomentsParts, VarMovingLoadBeamStressesComp, VarMovingLoadBeamStressesParts, VarMovingLoadBeamStressesPosition, VarMovingLoadDecimalPoint, VarMovingLoadETC, VarMovingLoadLoadValues, VarMovingLoadPlateForcesMomentsComp, VarMovingLoadPlateForcesMomentsParts, VarMovingLoadReactionComp, VarMovingLoadReactionLocal, VarMovingLoadScaleFactor, VarMovingLoadUse, VarMovingLoadValueType, VarPlaneStressPlateStressesActiveOnly, VarPlaneStressPlateStressesAvgNodal, VarPlaneStressPlateStressesComp, VarPlaneStressPlateStressesPrintAxis, VarPlaneStressPlateStressesSurface, VarPlaneStressPlateStressesUCSName, VarPlaneStressPlateStressesUseUCS, VarPlateForcesMomentsActiveOnly, VarPlateForcesMomentsAvgNodal, VarPlateForcesMomentsComp, VarPlateForcesMomentsPrintAxis, VarPlateForcesMomentsUCSName, VarPlateForcesMomentsUseUCS, VarPreviewNode, VarPrintImportData, VarReactionComp, VarReactionLocal, VarTrussForcesForceFilter, VarTrussForcesOutputSectionLocation, VarValueCS, VarValueDecimalPoints, VarValueExp, VarValueLimitScale, VarValueMinMax, VarValueNonlinear, VarValueOrientation, VarValueUse, VarVibrationModeShapesComp, VarViewActive, VarViewActiveElemIds, VarViewActiveGroup, VarViewActiveNodeIds, VarViewActiveUse, VarViewHidden, VarViewViewAngleH, VarViewViewAngleV, VarViewViewType, VarViewViewUse } from "../var";
var UploadButton = function (props) {
    var onAfterUpload = props.onAfterUpload, buttonProps = props.buttonProps, buttonName = props.buttonName;
    var onClick = props.onClick;
    var inputRef = useRef(null);
    var _a = __read(useState(null), 2), uploadedData = _a[0], setUploadedData = _a[1];
    var _b = __read(useState(null), 2), fileName = _b[0], setFileName = _b[1];
    var handleClick = useCallback(function () {
        if (inputRef.current) {
            inputRef.current.click();
        }
    }, []);

    const [previewNode, setPreviewNode] = useRecoilState(VarPreviewNode);
    const [importData, setImportData] = useRecoilState(VarPrintImportData);

    const [compRe, setCompRe] = useRecoilState(VarReactionComp);
    const [localRe, setLocalRe] = useRecoilState(VarReactionLocal);

    const loadReaction = (json) => {
        var data = json["Reaction"];
        if (!data)
            return;
        setCompRe(data["Component"]);
        if (data["Local"])
            setLocalRe("Local (if defined)");
    };

    const [compDS, setCompDS] = useRecoilState(VarDeformedShapeComp);
    const [localDS, setLocalDS] = useRecoilState(VarDeformedShapeLocal);
    const [timeHistoryTypeDS, setTimeHistoryTypeDS] = useRecoilState(VarDeformedTimeHistoryFunctionType)

    const loadDeformedShape = (json) => {
        var data = json["Deformations - Deformed Shape"];
        if (!data)
            return;
        setCompDS(data["Component"]);
        if (data["Local"])
            setLocalDS("Local (if defined)");
        setTimeHistoryTypeDS([data["TimeHistoryFunctionType"]]);
    }

    const [compDC, setCompDC] = useRecoilState(VarDispContourComp);
    const [localDC, setLocalDC] = useRecoilState(VarDispContourLocal);

    const [timeHistoryTypeDC, setTimeHistoryTypeDC] = useRecoilState(VarDispContourTimeHistoryFunctionType);

    const loadDisplacementContour = (json) => {
        var data = json["Deformations - Displacement Contour"];
        if (!data)
            return;
        setCompDC(data["Component"]);
        if (data["Local"])
            setLocalDC("Local (if defined)");
        setTimeHistoryTypeDC([data["TimeHistoryFunctionType"]]);
    };

    const [compTS, setCompTS] = useRecoilState(VarTrussForcesForceFilter);
    const [outputSectionTS, setOutputSectionTS] = useRecoilState(VarTrussForcesOutputSectionLocation);

    const loadTrussForce = (json) => {
        var data = json["Forces - Truss Forces"];
        if (!data)
            return;
        setCompTS(data["Force Filter"]);
        setOutputSectionTS([data["Output Section Location"]]);
    };

    const boolToArray = (array) => {
        const items = [];
        for (let i = 0; i < array.length; i += 2) {

            const value = array[i];
            const str = array[i + 1];
            if (value)
                items.push(str);
        }
        return items;

    };

    const [partBF, setPartBF] = useRecoilState(VarBeamForcesMomentsPart);
    const [compBF, setCompBF] = useRecoilState(VarBeamForcesMomentsComp);
    const [showTrussBF, setShowTrussBF] = useRecoilState(VarBeamForcesMomentsShowTrussForce);
    const [outputLocationBF, setOutputLocationBF] = useRecoilState(VarBeamForcesMomentsOuputLocation);
    const [outputSectionLocationBF, setOutputSectionLocationBF] = useRecoilState(VarBeamForcesMomentsOuputSectionLocation);
    const [byMemberBF, setByMemberBF] = useRecoilState(VarBeamForcesMomentsByMember);

    const loadBeamForce = (json) => {
        var data = json["Forces - Beam Forces/Moments"];
        if (!data)
            return;
        setPartBF(data["Part"]);
        setCompBF(data["Component"]);
        setShowTrussBF(boolToArray([data["ShowTrussForces"], "Show"]));
        setOutputLocationBF(data["OutputLocation"]);
        setOutputSectionLocationBF([data["OutputSectionLocation"]]);
        setByMemberBF(data["ByMember"]);
    };

    const [partBD, setPartBD] = useRecoilState(VarBeamDiagramsPart);
    const [compBD, setCompBD] = useRecoilState(VarBeamDiagramsComp);
    const [showTrussBD, setShowTrussBD] = useRecoilState(VarBeamDiagramsShowTrussForce);
    const [outputLocationBD, setOutputLocationBD] = useRecoilState(VarBeamDiagramsOuputLocation);
    const [outputSectionLocationBD, setOutputSectionLocationBD] = useRecoilState(VarBeamDiagramsOuputSectionLocation);
    const [byMemberBD, setByMemberBD] = useRecoilState(VarBeamDiagramsByMember);
    const [fidelityBD, setFidelityBD] = useRecoilState(VarBeamDiagramFidlity)
    const [fillBD, setFillBD] = useRecoilState(VarBeamDiagramFill)
    const [scaleBD, setScaleBD] = useRecoilState(VarBeamDiagramScale);

    const loadBeamDiagram = (json) => {
        var data = json["Forces - Beam Diagrams"];
        if (!data)
            return;
        setPartBD(data["Part"]);
        setCompBD(data["Component"]);
        setShowTrussBD(boolToArray([data["ShowTrussForces"], "Show", data["OnlyTrussForces"], "Truss Only"]));
        setOutputLocationBD(data["OutputLocation"]);
        setOutputSectionLocationBD([data["OutputSectionLocation"]]);
        setByMemberBD(data["ByMember"]);
        setScaleBD(data["Scale"]);
        setFidelityBD([data["Fidelity"]]);
        setFillBD([data["Fill"]]);
    };

    const [compPF, setCompPF] = useRecoilState(VarPlateForcesMomentsComp);
    const [avgNodalPF, setAvgNodalPF] = useRecoilState(VarPlateForcesMomentsAvgNodal);
    const [activeOnlyPF, setActiveOnlyPF] = useRecoilState(VarPlateForcesMomentsActiveOnly);
    const [useUCSPF, setUseUCSPF] = useRecoilState(VarPlateForcesMomentsUseUCS);
    const [uCSNamePF, setUCSNamePF] = useRecoilState(VarPlateForcesMomentsUCSName);
    const [printAxisPF, setPrintAxisPF] = useRecoilState(VarPlateForcesMomentsPrintAxis);

    const loadPlateForce = (json) => {
        var data = json["Forces - Plate Forces/Moments"];
        if (!data)
            return;
        setCompPF(data["Component"]);
        setAvgNodalPF([data["Avg.CalcMethod"]]);
        setActiveOnlyPF(data["Avg.NodalActiveOnly"]);
        setUseUCSPF([data["UseUCS"]]);
        setUCSNamePF([data["UCSName"]]);
        setPrintAxisPF(boolToArray([data["PrintUCSAxis"], "Print UCS Axis"]));
    };

    const [partBS, setPartBS] = useRecoilState(VarBeamStressesPart);
    const [compBS, setCompBS] = useRecoilState(VarBeamStressesComp);
    const [comp7thBS, setComp7thBS] = useRecoilState(VarBeamStressesComp7th);
    const [combinedBS, setCombinedBS] = useRecoilState(VarBeamStressesCombined);
    const [outputLocationBS, setOutputLocationBS] = useRecoilState(VarBeamStressesOuputLocation);
    const [outputSectionLocationBS, setOutputSectionLocationBS] = useRecoilState(VarBeamStressesOuputSectionLocation);

    const loadBeamStresses = (json) => {
        var data = json["Stresses - Beam Stresses"];
        if (!data)
            return;
        setPartBS(data["Part"]);
        setCompBS(data["Component"]);
        setComp7thBS([data["Component7th"]]);
        setCombinedBS([data["SectionPosition"]]);
        setOutputSectionLocationBS([data["OutputSectionLocation"]]);
        setOutputLocationBS(data["OutputLocation"]);
    };

    const [partBSD, setPartBSD] = useRecoilState(VarBeamStressesDiagramPart);
    const [compBSD, setCompBSD] = useRecoilState(VarBeamStressesDiagramComp);
    const [comp7thBSD, setComp7thBSD] = useRecoilState(VarBeamStressesDiagramComp7th);
    const [combinedBSD, setCombinedBSD] = useRecoilState(VarBeamStressesDiagramCombined);
    const [outputLocationBSD, setOutputLocationBSD] = useRecoilState(VarBeamStressesDiagramOuputLocation);
    const [outputSectionLocationBSD, setOutputSectionLocationBSD] = useRecoilState(VarBeamStressesDiagramOuputSectionLocation);
    const [fillBSD, setFillBSD] = useRecoilState(VarBeamStressesDiagramFill)
    const [scaleBSD, setScaleBSD] = useRecoilState(VarBeamStressesDiagramScale);

    const loadBeamStressesDiagram = (json) => {
        var data = json["Stresses - Beam Stresses Diagram"];
        if (!data)
            return;
        setPartBSD(data["Part"]);
        setCompBSD(data["Component"]);
        setComp7thBSD([data["Component7th"]]);
        setCombinedBSD([data["SectionPosition"]]);
        setOutputSectionLocationBSD([data["OutputSectionLocation"]]);
        setOutputLocationBSD(data["OutputLocation"]);
        setScaleBSD(data["Scale"]);
        setFillBSD([data["Fill"]]);
    };

    const [posBSP, setPosBSP] = useRecoilState(VarBeamStressesPSCSectionPosition);
    const [compBSP, setCompBSP] = useRecoilState(VarBeamStressesPSCComp);
    const [comp7thBSP, setComp7thBSP] = useRecoilState(VarBeamStressesPSCComp7th);
    const [outputLocationBSP, setOutputLocationBSP] = useRecoilState(VarBeamStressesPSCOuputLocation);
    const [outputSectionLocationBSP, setOutputSectionLocationBSP] = useRecoilState(VarBeamStressesPSCOuputSectionLocation);
    const [fillBSP, setFillBSP] = useRecoilState(VarBeamStressesPSCFill)
    const [scaleBSP, setScaleBSP] = useRecoilState(VarBeamStressesPSCScale);

    const loadBeamStressesPSC = (json) => {
        var data = json["Stresses - Beam Stresses(PSC)"];
        if (!data)
            return;
        setCompBSP(data["Component"]);
        setComp7thBSP([data["Component7th"]]);
        setPosBSP([data["SectionPosition"]]);
        setOutputSectionLocationBSP([data["OutputSectionLocation"]]);
        setOutputLocationBSP(data["OutputLocation"]);
        setScaleBSP(data["Scale"]);
        setFillBSP([data["Fill"]]);
    };

    const [compPS, setCompPS] = useRecoilState(VarPlaneStressPlateStressesComp);
    const [avgNodalPS, setAvgNodalPS] = useRecoilState(VarPlaneStressPlateStressesAvgNodal);
    const [surfacePS, setSurfacePS] = useRecoilState(VarPlaneStressPlateStressesSurface);
    const [activeOnlyPS, setActiveOnlyPS] = useRecoilState(VarPlaneStressPlateStressesActiveOnly);
    const [useUCSPS, setUseUCSPS] = useRecoilState(VarPlaneStressPlateStressesUseUCS);
    const [uCSNamePS, setUCSNamePS] = useRecoilState(VarPlaneStressPlateStressesUCSName);
    const [printAxisPS, setPrintAxisPS] = useRecoilState(VarPlaneStressPlateStressesPrintAxis);

    const loadPlateStresses = (json) => {
        var data = json["Stresses - Plane-Stress/Plate Stresses"];
        if (!data)
            return;
        setCompPS(data["Component"]);
        setAvgNodalPS([data["Avg.CalcMethod"]]);
        setActiveOnlyPS(data["Avg.NodalActiveOnly"]);
        setSurfacePS([data["Surface"]]);
        setUseUCSPS([data["UseUCS"]]);
        setUCSNamePS([data["UCSName"]]);
        setPrintAxisPS(boolToArray([data["PrintUCSAxis"], "Print UCS Axis"]));
    };

    const [compMR, setCompMR] = useRecoilState(VarMovingLoadReactionComp);
    const [localMR, setLocalMR] = useRecoilState(VarMovingLoadReactionLocal);

    const loadMVReaction = (json) => {
        var data = json["Moving Load Tracer - Reaction"];
        if (!data)
            return;
        setCompMR(data["Component"]);
        if (data["Local"])
            setLocalMR("Local (if defined)");
    };

    const [partMBF, setPartMBF] = useRecoilState(VarMovingLoadBeamForcesMomentsParts);
    const [compMBF, setCompMBF] = useRecoilState(VarMovingLoadBeamForcesMomentsComp);

    const loadMVBeamForce = (json) => {
        var data = json["Moving Load Tracer - Beam Forces/Moments"];
        if (!data)
            return;
        setCompMBF(data["Component"]);
        setPartMBF(data["Parts"]);
    };


    const [partsMVP, setPartsMVP] = useRecoilState(VarMovingLoadPlateForcesMomentsParts);
    const [compMVP, setCompMVP] = useRecoilState(VarMovingLoadPlateForcesMomentsComp);

    const loadMVPlateForce = (json) => {
        var data = json["Moving Load Tracer - Plate Forces/Moments"];
        if (!data)
            return;
        setCompMVP(data["Component"]);
        setPartsMVP(data["Parts"]);
    };

    const [partsMVS, setPartsMVS] = useRecoilState(VarMovingLoadBeamStressesParts);
    const [compMVS, setCompMVS] = useRecoilState(VarMovingLoadBeamStressesComp);
    const [posMVS, setPosMVS] = useRecoilState(VarMovingLoadBeamStressesPosition);

    const loadMVBeamStress = (json) => {
        var data = json["Moving Load Tracer - Beam Stresses"];
        if (!data)
            return;
        setCompMVS(data["Component"]);
        setPartsMVS(data["Parts"]);
        setPosMVS([data["Position"]]);
    };

    const [compVMS, setCompVMS] = useRecoilState(VarVibrationModeShapesComp);

    const loadModeShapes = (json) => {
        var data = json["Mode Shapes - Vibration Mode Shapes"];
        if (!data)
            return;
        setCompVMS(data["Component"]);
    };

    const [useContour, setUseContour] = useRecoilState(VarContourUse);
    const [arrowScaleFactorContour, setArrowScaleFactorContour] = useRecoilState(VarDisplayArrowScaleFactor);
    const [nColorContour, setNColorContour] = useRecoilState(VarContourNColor);
    const [colorTableContour, setColorTableContour] = useRecoilState(VarContourColorTable);
    const [fillContour, setFillContour] = useRecoilState(VarContourFill);

    const loadContour = (json) => {
        var data = json["Contour"];
        if (!data)
            return;
        setUseContour(data["Active"]);
        setArrowScaleFactorContour(data["ArrowScaleFactor"]);
        setNColorContour([data["NumberOfColor"]]);
        setColorTableContour([data["ColorTable"]]);
        setFillContour(boolToArray([data["ContourFill"], "Contour Fill", data["GradientFill"], "Gradient Fill"]));

    };

    const [useValue, setUseValue] = useRecoilState(VarValueUse);
    const [minMaxValue, setMinMaxValue] = useRecoilState(VarValueMinMax);
    const [limitScaleValue, setLimitScaleValue] = useRecoilState(VarValueLimitScale);
    const [decimalPointsValue, setDecimalPointsValue] = useRecoilState(VarValueDecimalPoints);
    const [orientationValue, setOrientationValue] = useRecoilState(VarValueOrientation);
    const [nonlinearValue, setNonlinearValue] = useRecoilState(VarValueNonlinear);
    const [csValue, setCSValue] = useRecoilState(VarValueCS);
    const [notationValue, setNotationValue] = useRecoilState(VarValueExp);

    const loadValue = (json) => {
        var data = json["Value"];
        if (!data)
            return;
        setUseValue(data["Active"]);
        setMinMaxValue(data["MinMaxType"]);
        setLimitScaleValue(data["LimitScale"]);
        setNotationValue(boolToArray([data["Exponential"], "Exponential"]));
        setDecimalPointsValue(data["DecimalPoints"]);
        setOrientationValue([data["Orientation"]]);
        setCSValue(boolToArray([data["CurrentStepForce"], "Current Step Force"]));
        setNonlinearValue(boolToArray([data["YieldPoint"], "Yield Point"]));
    };

    const [useLegend, setUseLegend] = useRecoilState(VarLegendUse);
    const [positionLegend, setPositionLegend] = useRecoilState(VarLegendPosition);
    const [expLegend, setExpLegend] = useRecoilState(VarLegendExp);
    const [decimalPointsLegend, setDecimalPointsLegend] = useRecoilState(VarLegendDecimalPoints);

    const loadLegend = (json) => {
        var data = json["Legend"];
        if (!data)
            return;
        setUseLegend(data["Active"]);
        setPositionLegend([data["Position"]]);
        setExpLegend([data["RankValueType"]]);
        setDecimalPointsLegend(data["DecimalPoints"]);
    };

    const [useDeform, setUseDeform] = useRecoilState(VarDeformUse);
    const [scaleFactorDeform, setScaleFactorDeform] = useRecoilState(VarDeformScaleFactor);
    const [deformTypeDeform, setDeformTypeDeform] = useRecoilState(VarDeformDeformationType);
    const [dispDeform, setDispDeform] = useRecoilState(VarDeformDisp);
    const [etcDeform, setEtcDeform] = useRecoilState(VarDeformETC)
    const [addtionalDeform, setAddtionalDeform] = useRecoilState(VarDeformAdditional);

    const loadDeform = (json) => {
        var data = json["Deform"];
        if (!data)
            return;
        setUseDeform(data["Active"]);
        setDeformTypeDeform([data["DeformationType"]]);
        setDispDeform(boolToArray([data["RealDisplacement"], "Real Displacement", data["RelativeDisplacement"], "Relative Displacement"]));
        setScaleFactorDeform(data["ScaleFactor"]);
        setEtcDeform(boolToArray([data["CurrentStepDisp"], "Current Step Displ.", data["Stage/StepRealDisp"], "Stage/Step Real Displ."]));
        setAddtionalDeform(boolToArray([data["Undeformed"], "Undeformed"]));
    };


    const [useDisp, setUseDisp] = useRecoilState(VarDispOptUse);
    const [contourDisp, setContourDisp] = useRecoilState(VarDispOptContour);
    const [valueMaxDisp, setValueMaxDisp] = useRecoilState(VarDispOptValueMax);

    const loadDispOpt = (json) => {
        var data = json["Displacement Option"];
        if (!data)
            return;
        setUseDisp(data["Active"]);
        setContourDisp(boolToArray([data["ElementCenter"], "Element Center"]));
        setValueMaxDisp(boolToArray([data["ValueMax"], "Max"]));
    };


    const [useAL, setUseAL] = useRecoilState(VarMovingLoadUse);
    const [scaleFactorAL, setScaleFactorAL] = useRecoilState(VarMovingLoadScaleFactor);
    const [useLoadValueAL, setUseLoadVaalueAL] = useRecoilState(VarMovingLoadLoadValues);
    const [valueTypeAL, setValueTypeAL] = useRecoilState(VarMovingLoadValueType);
    const [decimalPointAL, setDecimalPointAL] = useRecoilState(VarMovingLoadDecimalPoint);
    const [etcAL, setEtcAL] = useRecoilState(VarMovingLoadETC);

    const loadAppliedLoad = (json) => {
        var data = json["Applied Loads"];
        if (!data)
            return;
        setUseAL(data["Active"]);
        setScaleFactorAL(data["ScaleFactor"]);
        setUseLoadVaalueAL([data["LoadValues"]]);
        setValueTypeAL([data["ValueType"]]);
        setDecimalPointAL(data["DecimalPoint"]);
        setEtcAL(boolToArray([data["IncludeImpactFactor"], "Include Impact factor", data["IncludePsiFactor"], "Include Psi Factor"]));
    };

    const [useCD, setUseCD] = useRecoilState(VarCuttingDiagramUse);
    const [typeCD, setTypeCD] = useRecoilState(VarCuttingDiagramType);
    const [linesCD, setLineCD] = useRecoilState(VarCuttingDiagramLines);
    const [planesCD, setPlanesCD] = useRecoilState(VarCuttingDiagramPlanes);
    const [dispOptionsCD, setDispOptionsCD] = useRecoilState(VarCuttingDiagramDispOptions);
    const [valueOptionsCD, setValueOptionsCD] = useRecoilState(VarCuttingDiagramValueOptions);
    const [scaleCD, setScaleCD] = useRecoilState(VarCuttingDiagramScaleFactor);
    const [reverseCD, setReverseCD] = useRecoilState(VarCuttingDiagramReverse);

    const loadCuttingDiagram = (json) => {
        var data = json["Cutting Diagram"];
        if (!data)
            return;
        setUseCD(data["Active"]);
        setTypeCD([data["CuttingType"]]);
        setLineCD(data["CuttingLines"]);
        setPlanesCD(data["CuttingPlanes"]);
        setDispOptionsCD(data["NormalToPlane"] ? ["Normal"] : ["In Plane"]);
        setReverseCD(data["Reverse"]);
        setScaleCD(data["ScaleFactor"]);
        setValueOptionsCD(boolToArray([data["ValueOutput"], "Value Output", data["MinMaxOnly"], "MinMax Only"]));
    };

    const [useActiveView, setUseActiveView] = useRecoilState(VarViewActiveUse);
    const [activeView, setActiveView] = useRecoilState(VarViewActive);
    const [elemIdsView, setElemIdsView] = useRecoilState(VarViewActiveElemIds);
    const [nodeIdsView, setNodeIdsView] = useRecoilState(VarViewActiveNodeIds);
    const [selectedGroupView, setSelectedGroupView] = useRecoilState(VarViewActiveGroup);

    const [useViewView, setUseViewView] = useRecoilState(VarViewViewUse);
    const [viewView, setViewView] = useRecoilState(VarViewViewType);
    const [angleHView, setAngleHView] = useRecoilState(VarViewViewAngleH);
    const [angleVView, setAngleVView] = useRecoilState(VarViewViewAngleV);
    const [hiddenView, setHiddenView] = useRecoilState(VarViewHidden);

    const loadViewActive = (json) => {

        var data = json["Active"];
        if (!data)
            return;
        setUseActiveView(data["Use"]);
        setActiveView(data["Active"]);
        if (data["Active"] == "Active") {
            setElemIdsView(data["ElemIds"]);
            setNodeIdsView(data["NodeIds"]);
        }
        else if (data["Active"] == "Identity") {
            setSelectedGroupView(data["Group"]);
        }
    };

    const loadViewView = (json) => {

        var data = json["View"];
        if (!data)
            return;
        setUseViewView(data["Use"]);
        setViewView(data["View"]);
        setAngleHView(data["AngleH"]);
        setAngleVView(data["AngleV"]);
    };

    const loadViewHidden = (json) => {

        var data = json["Hidden"];
        if (!data)
            return;
        setHiddenView(data);
    };



    const handleAfterUpload = (data) => {
        const { DB, TypeOfDisplay, View } = data;
        const newData = {};
        if (DB != undefined) {
            newData["DB"] = DB;
        }
        if (TypeOfDisplay != undefined) {
            newData["TypeOfDisplay"] = TypeOfDisplay;
        }
        if (View != undefined) {
            newData["View"] = View;
        }
        setPreviewNode(newData);

        UpdateCurrent(newData, importData, setImportData);

        if (DB) {
            loadReaction(DB);
            loadDeformedShape(DB);
            loadDisplacementContour(DB);

            loadTrussForce(DB);
            loadBeamForce(DB);
            loadBeamDiagram(DB);
            loadPlateForce(DB);

            loadBeamStresses(DB);
            loadBeamStressesDiagram(DB);
            loadBeamStressesPSC(DB);
            loadPlateStresses(DB);

            loadMVReaction(DB);
            loadMVBeamForce(DB);
            loadMVPlateForce(DB);
            loadMVBeamStress(DB);

            loadModeShapes(DB);
        }
        if (TypeOfDisplay) {
            loadContour(TypeOfDisplay);
            loadValue(TypeOfDisplay);
            loadLegend(TypeOfDisplay);
            loadDeform(TypeOfDisplay);
            loadDispOpt(TypeOfDisplay);
            loadAppliedLoad(TypeOfDisplay);
            loadCuttingDiagram(TypeOfDisplay);
        }
        if (View) {

            loadViewActive(View);
            loadViewView(View);
            loadViewHidden(View);
        }

    };




    var handleUpload = useCallback(function (e) {
        var file = e.target.files[0];
        if (!file)
            return;
        var reader = new FileReader();
        reader.onload = function (e) {
            try {
                if (!e.target)
                    return;
                if (e.target.result === null)
                    return;
                if (e.target.result instanceof ArrayBuffer)
                    return;
                var data = JSON.parse(e.target.result);

                setUploadedData(data);
            }
            catch (error) {
                console.error("Error parsing JSON file:", error);
            }
        };
        reader.readAsText(file);
        setFileName(file.name);
    }, []);
    useEffect(function () {
        if (uploadedData && onAfterUpload) {
            onAfterUpload(uploadedData, fileName);
        }
        if (uploadedData)
            handleAfterUpload(uploadedData);

    }, [uploadedData, setUploadedData]);//재귀호출로 인한 수정
    return (
    <label htmlFor="upload-button" style={{ width: "100%", height: "100%" }}>
        <input
            ref={inputRef}
            id="upload-button"
            type="file"
            onChange={handleUpload}
            style={{ display: "none" }}
        />
        <Button
            onClick={handleClick}
            width="100%"
            height="100%"
            {...buttonProps}
        >
            {buttonName ?? "Upload"}
        </Button>
    </label>
);
};
export default UploadButton;
