import { atom } from 'recoil';

//DB

export const VarDBCurrent = atom({ key: 'VarDBCurrent', default: "Reaction" });
export const VarTypeOfDisplayCurrent = atom({ key: 'VarTypeOfDisplayCurrent', default: "Contour" });

export const VarReactionComp = atom({ key: 'VarReactionComp', default: ["FX"] });
export const VarReactionLocal = atom({ key: 'VarReactionLocal', default: [] });


export const VarDeformedShapeComp = atom({ key: 'VarDeformedShapeComp', default: ["DX"] });
export const VarDeformedShapeLocal = atom({ key: 'VarDeformedShapeLocal', default: [] });
export const VarDeformedTimeHistoryFunctionType = atom({ key: 'VarDeformedTimeHistoryFunctionType', default: [] });

export const VarDispContourComp = atom({ key: 'VarDispContourComp', default: ["DX"] });
export const VarDispContourLocal = atom({ key: 'VarDispContourLocal', default: [] });
export const VarDispContourTimeHistoryFunctionType = atom({ key: 'VarDispContourTimeHistoryFunctionType', default: [] });

export const VarTrussForcesForceFilter = atom({ key: 'VarTrussForcesForceFilter', default: ["All"] });
export const VarTrussForcesOutputSectionLocation = atom({ key: 'VarTrussForcesOutputSectionLocation', default: ["I"] });

export const VarBeamForcesMomentsPart = atom({ key: 'VarBeamForcesMomentsPart', default: "Total" });
export const VarBeamForcesMomentsComp = atom({ key: 'VarBeamForcesMomentsComp', default: ["Fx"] });
export const VarBeamForcesMomentsShowTrussForce = atom({ key: 'VarBeamForcesMomentsShowTrussForce', default: [] });

export const VarBeamForcesMomentsOuputLocation = atom({ key: 'VarBeamForcesMomentsOuputLocation', default: [] });
export const VarBeamForcesMomentsOuputSectionLocation = atom({ key: 'VarBeamForcesMomentsOuputSectionLocation', default: ["By Section"] });
export const VarBeamForcesMomentsByMember = atom({ key: 'VarBeamForcesMomentsByMember', default: false });

export const VarBeamDiagramsPart = atom({ key: 'VarBeamDiagramsPart', default: "Total" });
export const VarBeamDiagramsComp = atom({ key: 'VarBeamDiagramsComp', default: ["Fx"] });
export const VarBeamDiagramsShowTrussForce = atom({ key: 'VarBeamDiagramsShowTrussForce', default: [] });

export const VarBeamDiagramsOuputLocation = atom({ key: 'VarBeamDiagramsOuputLocation', default: [] });
export const VarBeamDiagramsOuputSectionLocation = atom({ key: 'VarBeamDiagramsOuputSectionLocation', default: ["By Section"] });
export const VarBeamDiagramsByMember = atom({ key: 'VarBeamDiagramsByMember', default: false });
export const VarBeamDiagramFidlity = atom({ key: 'VarBeamDiagramFidlity', default: ["5 Points"] });
export const VarBeamDiagramFill = atom({ key: 'VarBeamDiagramFill', default: ["Solid Fill"] });
export const VarBeamDiagramScale = atom({ key: 'VarBeamDiagramScale', default: 1.0 });

export const VarPlateForcesMomentsComp = atom({ key: 'VarPlateForcesMomentsComp', default: ["Fxx"] });
export const VarPlateForcesMomentsAvgNodal = atom({ key: 'VarPlateForcesMomentsAvgNodal', default: ["Element"] });
export const VarPlateForcesMomentsActiveOnly = atom({ key: 'VarPlateForcesMomentsActiveOnly', default: false });

export const VarPlateForcesMomentsUseUCS = atom({ key: 'VarPlateForcesMomentsUseUCS', default: ["Local"] });
export const VarPlateForcesMomentsUCSNameItems = atom({ key: 'VarPlateForcesMomentsUCSNameItems', default: ["Current UCS"] });
export const VarPlateForcesMomentsUCSName = atom({ key: 'VarPlateForcesMomentsUCSName', default: [] });
export const VarPlateForcesMomentsPrintAxis = atom({ key: 'VarPlateForcesMomentsPrintAxis', default: [] });


export const VarBeamStressesPart = atom({ key: 'VarBeamStressesPart', default: "Total" });
export const VarBeamStressesComp = atom({ key: 'VarBeamStressesComp', default: ["Sax"] });
export const VarBeamStressesComp7th = atom({ key: 'VarBeamStressesComp7th', default: [] });
export const VarBeamStressesCombined = atom({ key: 'VarBeamStressesCombined', default: ["Maximum"] });

export const VarBeamStressesOuputLocation = atom({ key: 'VarBeamStressesOuputLocation', default: [] });
export const VarBeamStressesOuputSectionLocation = atom({ key: 'VarBeamStressesOuputSectionLocation', default: ["Max"] });

export const VarBeamStressesDiagramPart = atom({ key: 'VarBeamStressesDiagramPart', default: "Total" });
export const VarBeamStressesDiagramComp = atom({ key: 'VarBeamStressesDiagramComp', default: ["Sax"] });
export const VarBeamStressesDiagramComp7th = atom({ key: 'VarBeamStressesDiagramComp7th', default: [] });
export const VarBeamStressesDiagramCombined = atom({ key: 'VarBeamStressesDiagramCombined', default: ["Maximum"] });

export const VarBeamStressesDiagramOuputLocation = atom({ key: 'VarBeamStressesDiagramOuputLocation', default: [] });
export const VarBeamStressesDiagramOuputSectionLocation = atom({ key: 'VarBeamStressesDiagramOuputSectionLocation', default: ["By Section"] });

export const VarBeamStressesDiagramFill = atom({ key: 'VarBeamStressesDiagramFill', default: ["Solid Fill"] });
export const VarBeamStressesDiagramScale = atom({ key: 'VarBeamStressesDiagramScale', default: 1.0 });

export const VarBeamStressesPSCSectionPosition = atom({ key: 'VarBeamStressesPSCSectionPosition', default: ["Position 1"] });
export const VarBeamStressesPSCComp = atom({ key: 'VarBeamStressesPSCComp', default: ["Sig-xx(Axial)"] });
export const VarBeamStressesPSCComp7th = atom({ key: 'VarBeamStressesPSCComp7th', default: [] });

export const VarBeamStressesPSCOuputLocation = atom({ key: 'VarBeamStressesPSCOuputLocation', default: [] });
export const VarBeamStressesPSCOuputSectionLocation = atom({ key: 'VarBeamStressesPSCOuputSectionLocation', default: ["By Section"] });

export const VarBeamStressesPSCFill = atom({ key: 'VarBeamStressesPSCFill', default: ["Solid Fill"] });
export const VarBeamStressesPSCScale = atom({ key: 'VarBeamStressesPSCScale', default: 1.0 });

export const VarPlaneStressPlateStressesComp = atom({ key: 'VarPlaneStressPlateStressesComp', default: ["Sig-xx"] });
export const VarPlaneStressPlateStressesAvgNodal = atom({ key: 'VarPlaneStressPlateStressesAvgNodal', default: ["Element"] });
export const VarPlaneStressPlateStressesSurface = atom({ key: 'VarPlaneStressPlateStressesSurface', default: ["Top"] });
export const VarPlaneStressPlateStressesActiveOnly = atom({ key: 'VarPlaneStressPlateStressesActiveOnly', default: false });

export const VarPlaneStressPlateStressesUseUCS = atom({ key: 'VarPlaneStressPlateStressesUseUCS', default: ["UCS"] });
export const VarPlaneStressPlateStressesUCSName = atom({ key: 'VarPlaneStressPlateStressesUCSName', default: [] });
export const VarPlaneStressPlateStressesPrintAxis = atom({ key: 'VarPlaneStressPlateStressesPrintAxis', default: [] });

export const VarVibrationModeShapesComp = atom({ key: 'VarVibrationModeShapesComp', default: ["Md-X"] });

export const VarMovingLoadReactionComp = atom({ key: 'VarMovingLoadReactionComp', default: ["FX"] });
export const VarMovingLoadReactionLocal = atom({ key: 'VarMovingLoadReactionLocal', default: [] });

export const VarMovingLoadBeamForcesMomentsComp = atom({ key: 'VarMovingLoadBeamForcesMomentsComp', default: ["FX"] });
export const VarMovingLoadBeamForcesMomentsParts = atom({ key: 'VarMovingLoadBeamForcesMomentsParts', default: "i" });

export const VarMovingLoadPlateForcesMomentsComp = atom({ key: 'VarMovingLoadPlateForcesMomentsComp', default: ["Fxx"] });
export const VarMovingLoadPlateForcesMomentsParts = atom({ key: 'VarMovingLoadPlateForcesMomentsParts', default: "i" });

export const VarMovingLoadBeamStressesComp = atom({ key: 'VarMovingLoadBeamStressesComp', default: ["Combined(Normal)"] });
export const VarMovingLoadBeamStressesPosition = atom({ key: 'VarMovingLoadBeamStressesPosition', default: ["1(-y,+z)"] });
export const VarMovingLoadBeamStressesParts = atom({ key: 'VarMovingLoadBeamStressesParts', default: "i" });

//Type of Display

export const VarContourUse = atom({ key: 'VarContourUse', default: true });
export const VarContourFill = atom({ key: 'VarContourFill', default: ["Contour Fill"] });

export const VarContourNColor = atom({ key: 'VarContourNColor', default: [12] });
export const VarContourColorTable = atom({ key: 'VarContourColorTable', default: ["VRGB"] });


export const VarValueUse = atom({ key: 'VarValueUse', default: true });
export const VarValueExp = atom({ key: 'VarValueExp', default: ["Fixed"] });
export const VarValueDecimalPoints = atom({ key: 'VarValueDecimalPoints', default: 1 });
export const VarValueMinMaxOnly = atom({ key: 'VarValueMinMaxOnly', default: true });
export const VarValueMinMax = atom({ key: 'VarValueMinMax', default: ["Min & Max"] });
export const VarValueLimitScale = atom({ key: 'VarValueLimitScale', default: 1 });
export const VarValueOrientation = atom({ key: 'VarValueOrientation', default: [0] });




export const VarLegendUse = atom({ key: 'VarLegendUse', default: true });
export const VarLegendPosition = atom({ key: 'VarLegendPosition', default: ["Left"] });
export const VarLegendExp = atom({ key: 'VarLegendExp', default: ["Exponential"] });
export const VarLegendDecimalPoints = atom({ key: 'VarLegendDecimalPoints', default: 0 });

export const VarDisplayArrowScaleFactor = atom({ key: 'VarDisplayArrowScaleFactor', default: 1.0 });

export const VarValueNonlinear = atom({ key: 'VarValueNonlinear', default: [] });
export const VarValueCS = atom({ key: 'VarValueCS', default: [] });

export const VarDeformUse = atom({ key: 'VarDeformUse', default: true });
export const VarDeformScaleFactor = atom({ key: 'VarDeformScaleFactor', default: 1.0 });
export const VarDeformDeformationType = atom({ key: 'VarDeformDeformationType', default: ["Nodal Deform"] });
export const VarDeformDisp = atom({ key: 'VarDeformDisp', default: [] });
export const VarDeformETC = atom({ key: 'VarDeformETC', default: [] });
export const VarDeformAdditional = atom({ key: 'VarDeformAdditional', default: [] });

export const VarDispOptUse = atom({ key: 'VarDispOptUse', default: true });
export const VarDispOptContour = atom({ key: 'VarDispOptContour', default: [] });
export const VarDispOptValueMax = atom({ key: 'VarDispOptValueMax', default: ["Element Center"] });

export const VarMovingLoadUse = atom({ key: 'VarMovingLoadUse', default: true });
export const VarMovingLoadScaleFactor = atom({ key: 'VarMovingLoadScaleFactor', default: 1.0 });
export const VarMovingLoadLoadValues = atom({ key: 'VarMovingLoadLoadValues', default: ["Arrow Only"] });
export const VarMovingLoadValueType = atom({ key: 'VarMovingLoadValueType', default: ["Exponential"] });
export const VarMovingLoadDecimalPoint = atom({ key: 'VarMovingLoadDecimalPoint', default: 1 });
export const VarMovingLoadETC = atom({ key: 'VarMovingLoadETC', default: [] });

export const VarCuttingDiagramUse = atom({ key: 'VarCuttingDiagramUse', default: true });

export const VarCuttingDiagramType = atom({ key: 'VarCuttingDiagramType', default: ["Cutting Line"] });
export const VarCuttingDiagramLines = atom({ key: 'VarCuttingDiagramLines', default: [] });
export const VarCuttingDiagramPlanes = atom({ key: 'VarCuttingDiagramPlanes', default: [] });
export const VarCuttingDiagramDispOptions = atom({ key: 'VarCuttingDiagramDispOptions', default: ["Normal"] });
export const VarCuttingDiagramValueOptions = atom({ key: 'VarCuttingDiagramVlaueOptions', default: [] });
export const VarCuttingDiagramScaleFactor = atom({ key: 'VarCuttingDiagramScaleFactor', default: 0.0 });
export const VarCuttingDiagramReverse = atom({ key: 'VarCuttingDiagramReverse', default: false });



//View
export const VarViewActiveUse = atom({ key: 'VarViewActiveUse', default: false });
export const VarViewActive = atom({ key: 'VarViewActive', default: "All" });
export const VarViewActiveElemIds = atom({ key: 'VarViewActiveElemIds', default: [] });
export const VarViewActiveNodeIds = atom({ key: 'VarViewActiveNodeIds', default: [] });
export const VarViewActiveGroup = atom({ key: 'VarViewActiveGroup', default: "" });
export const VarViewViewUse = atom({ key: 'VarViewViewUse', default: false });
export const VarViewViewType = atom({ key: 'VarViewViewType', default: "iso" });
export const VarViewViewAngleH = atom({ key: 'VarViewViewAngleH', default: 30 });
export const VarViewViewAngleV = atom({ key: 'VarViewViewAngleV', default: 15 });
export const VarViewHidden = atom({ key: 'VarViewHidden', default: false });

//View
export const VarModelViewActiveUse = atom({ key: 'VarModelViewActiveUse', default: false });
export const VarModelViewActive = atom({ key: 'VarModelViewActive', default: "All" });
export const VarModelViewActiveElemIds = atom({ key: 'VarModelViewActiveElemIds', default: [] });
export const VarModelViewActiveNodeIds = atom({ key: 'VarModelViewActiveNodeIds', default: [] });
export const VarModelViewActiveGroup = atom({ key: 'VarModelViewActiveGroup', default: "" });
export const VarModelViewViewUse = atom({ key: 'VarModelViewViewUse', default: false });
export const VarModelViewViewType = atom({ key: 'VarModelViewViewType', default: "iso" });
export const VarModelViewViewAngleH = atom({ key: 'VarModelViewViewAngleH', default: 30 });
export const VarModelViewViewAngleV = atom({ key: 'VarModelViewViewAngleV', default: 15 });
export const VarModelViewHidden = atom({ key: 'VarModelViewHidden', default: false });
export const VarModelViewPropName = atom({ key: 'VarModelViewPropName', default: false });
export const VarModelViewWallMark = atom({ key: 'VarModelViewWallMark', default: false });
export const VarModelViewUseDesc = atom({ key: 'VarModelViewUseDesc', default: false });
export const VarModelViewDesc = atom({ key: 'VarModelViewDesc', default: "" });

export const VarModelViewFloorOption = atom({ key: 'VarModelViewFloorOption', default: "" });

//Print

export const VarPreviewNode = atom({ key: 'VarPreviewNode', default: {} });
export const VarModelPreviewNode = atom({ key: 'VarModelPreviewNode', default: {} });
export const VarModelPreviewSelected = atom({ key: 'VarModelPreviewSelected', default: "" });

export const VarLoadCombination = atom({ key: 'VarLoadCombination', default: [] });
export const VarLCType = atom({ key: 'VarLCType', default: ["General"] });

export const VarPrintSizeH = atom({ key: 'VarPrintSizeH', default: 1920 });

export const VarPrintSizeV = atom({ key: 'VarPrintSizeV', default: 1080 });

export const VarPrintSizeUser = atom({ key: 'VarPrintSizeUser', default: false });
export const VarPrintSize = atom({ key: 'VarPrintSize', default: "A3" });


export const VarPrintData = atom({ key: 'VarPrintData', default: {} });
export const VarModelPrintData = atom({ key: 'VarModelPrintData', default: {} });
export const VarPrintImportData = atom({ key: 'VarPrintImportData', default: {} });
export const VarPrintSavePath = atom({ key: 'VarPrintSavePath', default: "C:\\MIDAS\\CaptureTest\\" });

export const VarPrintSelected = atom({ key: 'VarPrintSelected', default: [] });
export const VarPrintSelectedLC = atom({ key: 'VarPrintSelectedLC', default: [] });

export const VarSelectLCCS = atom({ key: 'VarSelectLCCS', default: undefined });
export const VarSelectLCStep = atom({ key: 'VarSelectLCStep', default: undefined });
export const VarSelectLCType = atom({ key: 'VarSelectLCType', default: "All" });

