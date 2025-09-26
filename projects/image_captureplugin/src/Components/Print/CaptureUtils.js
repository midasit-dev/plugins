// captureUtils.js
//import { GetValue } from './utils'; // 필요한 경우 유틸리티 함수도 분리합니다.

import { convertToNumber } from "../CommonUtils";


const GetValue = (defaultValue, input, keys, func) => {
    if (input == null)
        return defaultValue;
    let result = input;
    for (const key of keys) {
        if (!(key in result))
            return defaultValue;
        result = result[key];
    }

    if (func != undefined) {
        return func(result);
    }

    return result;
};

export const GetDefaultJson = (value, printH, printV) => {
    const setHidden = GetValue(false, value, ["View", "Hidden"]);
    const useActive = GetValue(false, value, ["View", "Active", "Use"]);
    const activeMode = GetValue("All", value, ["View", "Active", "Active"]);
    const nodeList = GetValue([], value, ["View", "Active", "NodeIds"]);
    const elemList = GetValue("", value, ["View", "Active", "ElemIds"]);
    const group = GetValue([], value, ["View", "Active", "Group"]);
    const useView = GetValue(false, value, ["View", "View", "Use"]);
    const angleH = GetValue(30, value, ["View", "View", "AngleH"]);
    const angleV = GetValue(15, value, ["View", "View", "AngleV"]);

    const floorOption = GetValue("", value, [ "View","Active", "FloorOption"]);
    const identityType = GetValue("", value, [ "View","Active", "IdentityType"]);

    const contourUse = GetValue(false, value, ["TypeOfDisplay", "Contour", "Active"]);
    const contourNumOfColor = GetValue(12, value, ["TypeOfDisplay", "Contour", "NumberOfColor"]);
    const contourColorType = GetValue("VRGB", value, ["TypeOfDisplay", "Contour", "ColorTable"]);
    const contourGradFill = GetValue(false, value, ["TypeOfDisplay", "Contour", "GradientFill"]);
    const contourFill = GetValue(true, value, ["TypeOfDisplay", "Contour", "ContourFill"]);




    const legendUse = GetValue(false, value, ["TypeOfDisplay", "Legend", "Active"]);
    const legendPosition = GetValue("left", value, ["TypeOfDisplay", "Legend", "Position"]);
    const legendValueExp = GetValue(true, value, ["TypeOfDisplay", "Legend", "RankValueType"], (e) => { return e === "Exponential" });
    const legendDPt = GetValue(0, value, ["TypeOfDisplay", "Legend", "DecimalPoints"]);

    const valueUse = GetValue(false, value, ["TypeOfDisplay", "Value", "Active"]);
    const valueDPt = GetValue(0, value, ["TypeOfDisplay", "Value", "DecimalPoints"]);
    const valueValueExp = GetValue(false, value, ["TypeOfDisplay", "Value", "Exponential"]);
    const valueMinMaxType = GetValue("Min & Max", value, ["TypeOfDisplay", "Value", "MinMaxType"]);
    const valueMinMaxOnly = valueMinMaxType != "All";// true;// GetValue(false, value, ["TypeOfDisplay", "Value", "MinMaxOnly"]);
    const valueLimitScale = GetValue(0, value, ["TypeOfDisplay", "Value", "LimitScale"]);
    const valueOriention = GetValue(0, value, ["TypeOfDisplay", "Value", "Orientation"]);



    const deformUse = GetValue(false, value, ["TypeOfDisplay", "Deform", "Active"]);
    const deformScale = GetValue(1, value, ["TypeOfDisplay", "Deform", "ScaleFactor"]);
    const deformRelDisp = GetValue(false, value, ["TypeOfDisplay", "Deform", "RealDisplacement"]);
    const deformRealDisp = GetValue(false, value, ["TypeOfDisplay", "Deform", "RelativeDisplacement"]);
    const deformRealDeform = GetValue(false, value, ["TypeOfDisplay", "Deform", "Active"], (e) => { return e == "Real Deform" });

    const dispUse = GetValue(false, value, ["TypeOfDisplay", "Displacement Option", "Active"]);
    const dispElementCenter = GetValue(false, value, ["TypeOfDisplay", "Displacement Option", "ElementCenter"]);
    const dispMaxValue = GetValue(false, value, ["TypeOfDisplay", "Displacement Option", "ValueMax"]);

    const arrowScale = GetValue(1, value, ["TypeOfDisplay", "Contour", "ArrowScaleFactor"]);
    const undeformed = GetValue(1, value, ["TypeOfDisplay", "Deform", "Undeformed"]);
    const curStepDisp = GetValue(1, value, ["TypeOfDisplay", "Deform", "CurrentStepDisp"]);
    const stageStepRealDisp = GetValue(1, value, ["TypeOfDisplay", "Deform", "Stage/StepRealDisp"]);
    const curStepForce = GetValue(false, value, ["TypeOfDisplay", "Value", "CurrentStepForce"]);
    const yieldPoint = GetValue(false, value, ["TypeOfDisplay", "Value", "YieldPoint"]);

    const appLoadUse = GetValue(false, value, ["TypeOfDisplay", "Applied Loads", "Active"]);
    const appLoadScale = GetValue(1, value, ["TypeOfDisplay", "Applied Loads", "ScaleFactor"]);
    const appLoadLoadValues = GetValue("Arrow Only", value, ["TypeOfDisplay", "Applied Loads", "LoadValues"]) == "Load Values";
    const appLoadValueType = GetValue("Exponential", value, ["TypeOfDisplay", "Applied Loads", "ValueType"]);
    const appLoadDecimalPt = GetValue(0, value, ["TypeOfDisplay", "Applied Loads", "DecimalPoint"]);

    const includeImpackFactor = GetValue(0, value, ["TypeOfDisplay", "Applied Loads", "IncludeImpackFactor"]);
    const includePsiFactor = GetValue(0, value, ["TypeOfDisplay", "Applied Loads", "IncludePsiFactor"]);

    const cuttingDiagramUse = GetValue(false, value, ["TypeOfDisplay", "Cutting Diagram", "Active"]);
    const cuttingDiagramType = GetValue("line", value, ["TypeOfDisplay", "Cutting Diagram", "CuttingType"],
        ((e) => {
            return e == "Cutting Line" ? "line" : "plane";
        }));
    const cuttingDiagramLines = GetValue([], value, ["TypeOfDisplay", "Cutting Diagram", "CuttingLines"]);
    let cuttingDiagramPlanes = GetValue([], value, ["TypeOfDisplay", "Cutting Diagram", "CuttingPlanes"]);

    const indexXY = cuttingDiagramPlanes.indexOf("UCS x-y Plane");
    if (indexXY >= 0)
        cuttingDiagramPlanes[indexXY] = "XY";

    const indexXZ = cuttingDiagramPlanes.indexOf("UCS x-z Plane");
    if (indexXZ >= 0)
        cuttingDiagramPlanes[indexXZ] = "XZ";

    const indexYZ = cuttingDiagramPlanes.indexOf("UCS y-z Plane");
    if (indexYZ >= 0)
        cuttingDiagramPlanes[indexYZ] = "XZ";


    const cuttingDiagramNormal = GetValue(false, value, ["TypeOfDisplay", "Cutting Diagram", "NormalToPlane"]);
    const cuttingDiagramReverse = GetValue(false, value, ["TypeOfDisplay", "Cutting Diagram", "Reverse"]);
    const cuttingDiagramScale = GetValue(0, value, ["TypeOfDisplay", "Cutting Diagram", "ScaleFactor"]);
    const cuttingDiagramValueOutput = GetValue(false, value, ["TypeOfDisplay", "Cutting Diagram", "ValueOutput"]);
    const cuttingDiagramMinMaxOnly = GetValue(false, value, ["TypeOfDisplay", "Cutting Diagram", "MinMaxOnly"]);

    const json = {
        "SET_MODE": "post",
        "SET_HIDDEN": setHidden,
        "EXPORT_PATH": "C:\\MIDAS\\CaptureTest\\image.jpg",
        "HEIGHT": Number(printV),
        "WIDTH": Number(printH),        
        "RESULT_GRAPHIC": {
            "CURRENT_MODE": "beam diagrams",
            "LOAD_CASE_COMB": {},
            "COMPONENTS": {},
            "TYPE_OF_DISPLAY": {
                "CONTOUR": {
                    "OPT_CHECK": contourUse,
                    "NUM_OF_COLOR": contourNumOfColor,
                    "COLOR_TYPE": contourColorType,
                    "OPTIONS": {
                        "GRADIENT_FILL": contourGradFill,
                        "CONTOUR_FILL": contourFill
                    }
                },
                "LEGEND": {
                    "OPT_CHECK": legendUse,
                    "POSITION": legendPosition,
                    "VALUE_EXP": legendValueExp,
                    "DECIMAL_PT": legendDPt
                },
                "VALUES": {
                    "OPT_CHECK": valueUse,
                    "DECIMAL_PT": valueDPt,
                    "VALUE_EXP": valueValueExp,
                    "SET_ORIENT": valueOriention
                },
                "DEFORM": {
                    "OPT_CHECK": deformUse,
                    "SCALE_FACTOR": deformScale,
                    "REL_DISP": deformRelDisp,
                    "REAL_DISP": deformRealDisp,
                    "REAL_DEFORM": deformRealDeform
                },
                "DISP_OPT": {
                    "OPT_CHECK": dispUse,
                    "ELEMENT_CENTER": dispElementCenter,
                    "VALUE_MAX": dispMaxValue
                },
                "UNDEFORMED": {
                    "OPT_CHECK": undeformed,
                },
                "APPLIED_LOADS": {
                    "OPT_CHECK": appLoadUse,
                    "SCALE_FACTOR": appLoadScale,
                    "OPT_LOAD_VALUES": appLoadLoadValues,
                    "VALUE_TYPE": appLoadValueType,
                    "VALUE_DECIMAL_PT": appLoadDecimalPt
                },
                "CUTTING_DIAGRAM": {
                    "OPT_CHECK": cuttingDiagramUse,
                    "CUTTING_MODE": cuttingDiagramType,
                    // "CUTTING_NAME": [
                    //     "Cut-Line #1"
                    // ],
                    "NORMAL_TO_PLANE": cuttingDiagramNormal,
                    "SCALE_FACTOR": cuttingDiagramScale,
                    "REVERSE": cuttingDiagramReverse,
                    "VALUE_OUTPUT": cuttingDiagramValueOutput,
                    "MINMAX_ONLY": cuttingDiagramMinMaxOnly
                },
                "ARROW_SCALE_FACTOR": arrowScale,
                "OPT_CUR_STEP_DISPLACEMENT": curStepDisp,
                "OPT_STAGE_STEP_REAL_DISPLACEMENT": stageStepRealDisp,
                "OPT_CUR_STEP_FORCE": curStepForce,
                "YIELD_POINT": {
                    "OPT_CHECK" : yieldPoint,
                },
                //"OPT_INCLUDING_CAMBER_DISPLACEMENT": true,
                "OPT_INCLUDE_IMPACT_FACTOR": includeImpackFactor,
                "OPT_INCLUDE_PSI_FACTOR": includePsiFactor,
            }
        }
    };

    if (cuttingDiagramUse) {
        if (cuttingDiagramType == "line") {
            json["RESULT_GRAPHIC"]["TYPE_OF_DISPLAY"]["CUTTING_DIAGRAM"]["CUTTING_NAME"] = cuttingDiagramLines;
        } else {
            json["RESULT_GRAPHIC"]["TYPE_OF_DISPLAY"]["CUTTING_DIAGRAM"]["CUTTING_NAME"] = cuttingDiagramPlanes;
        }
    }
    if (valueMinMaxOnly) {
        json["RESULT_GRAPHIC"]["TYPE_OF_DISPLAY"]["VALUES"]["MINMAX_ONLY"] = {
            "MAXMIN": valueMinMaxType,
            "LIMIT_SCALE": valueLimitScale
        };
    }
    if (useActive) {
        const jsonActive = {
            "ACTIVE_MODE": activeMode,
        };
        if (activeMode === "Active") {
            jsonActive["N_LIST"] = nodeList;
            jsonActive["E_LIST"] = elemList;
        }
        if (activeMode === "Identity") {
            jsonActive["IDENTITY_TYPE"] = identityType
            jsonActive["IDENTITY_LIST"] = [group];
            if(floorOption != ""){
                jsonActive["STORY_ACTIVE"] = floorOption;
            }
        }
        json["ACTIVE"] = jsonActive;
    }
    if (useView) {
        const jsonView = {
            "HORIZONTAL": Number(angleH),
            "VERTICAL": Number(angleV)
        };
        json["ANGLE"] = jsonView;
    }
    return json;
};

export const GetDefaultJsonModel = (value, printH, printV) => {
    const setHidden = GetValue(false, value, [ "Hidden"]);
    const setPropName = GetValue(false, value, [ "PropName"]);
    const setWallMark = GetValue(false, value, [ "WallMark"]);
    const setDesc = GetValue(false, value, [ "Desc"]);
    const setUseDesc = GetValue(false, value, [ "UseDesc"]);
    const useActive = GetValue(false, value, [ "Active", "Use"]);
    const activeMode = GetValue("All", value, [ "Active", "Active"]);
    const nodeList = GetValue([], value, [ "Active", "NodeIds"]);
    const elemList = GetValue("", value, [ "Active", "ElemIds"]);
    const group = GetValue([], value, [ "Active", "Group"]);
    const useView = GetValue(false, value, [ "View", "Use"]);
    const angleH = GetValue(30, value, [ "View", "AngleH"]);
    const angleV = GetValue(15, value, [ "View", "AngleV"]);

    const floorOption = GetValue("", value, [ "Active", "FloorOption"]);
    const identityType = GetValue("", value, [ "Active", "IdentityType"]);

    const json = {
        "SET_MODE": "post",
        "SET_HIDDEN": setHidden,
        "EXPORT_PATH": "C:\\MIDAS\\CaptureTest\\image.jpg",
        "HEIGHT": Number(printV),
        "WIDTH": Number(printH),        
    };
    
    
    json["DISPLAY"] = {
        "PROPERTY":{
            "PROPERTY_NAME" : setPropName
        },
        "DESIGN":{
            "WALL_MARK":setWallMark
        },        
    }
    if(setUseDesc){
        json["DISPLAY"]["VIEW"]={
            "DESCRIPTION" : setDesc
        }

    }


    if (useActive) {
        const jsonActive = {
            "ACTIVE_MODE": activeMode,
        };
        if (activeMode === "Active") {
            jsonActive["N_LIST"] = nodeList;
            jsonActive["E_LIST"] = elemList;
        }
        if (activeMode === "Identity") {
            jsonActive["IDENTITY_TYPE"] = identityType
            jsonActive["IDENTITY_LIST"] = [group];
            if(floorOption != ""){
                jsonActive["STORY_ACTIVE"] = floorOption;
            }
        }
        json["ACTIVE"] = jsonActive;
    }
    if (useView) {
        const jsonView = {
            "HORIZONTAL": Number(angleH),
            "VERTICAL": Number(angleV)
        };
        json["ANGLE"] = jsonView;
    }
    return json;
};

export const BuildReaction = (value, json, lcInfo, savePath) => {
    const db = value["DB"];
    if (db == null) return [];
    const reaction = db["Reaction"];
    if (reaction == null) return [];
    const comps = reaction["Component"];
    if (comps == null) return [];

    const local = reaction["Local"];
    const result = [];

    for (const lc of lcInfo.LCS) {

        for (const comp of comps) {
            const newJson = JSON.parse(JSON.stringify(json));
            const jsonResultGraphic = newJson["RESULT_GRAPHIC"];
            jsonResultGraphic["CURRENT_MODE"] = "reaction forces/moments";

            const jsonComp = {
                COMP: comp,
                OPT_LOCAL_CHECK: local
            };
            jsonResultGraphic["COMPONENTS"] = jsonComp;

            const jsonComb = {
                TYPE: lc.type,
                NAME: lc.name,
            };
            if (lc.minmax)
                jsonComb["MINMAX"] = lc.minmax;
            if (lcInfo.CS)
                newJson["STAGE_NAME"] = lcInfo.CS;
            if (lcInfo.STEP)
                jsonComb["STEP_INDEX"] = lcInfo.STEP;

            jsonResultGraphic["LOAD_CASE_COMB"] = jsonComb;
            const fileName = "Reaction_ForcesMoments_" + lc.fullname + "_" + comp + ".jpg";
            const imagePath = savePath + fileName;
            newJson["EXPORT_PATH"] = imagePath;
            newJson["RESULT_GRAPHIC"] = jsonResultGraphic;

            var newJson2 = JSON.parse(JSON.stringify({ Argument: newJson }));
            result.push(newJson2);
        }
    }
    return result;
};

export const BuildDeformedShape = (value, json, lcInfo, savePath) => {
    const db = value["DB"];
    if (db == null) return [];
    const item = db["Deformations - Deformed Shape"];
    if (item == null) return [];
    const comps = item["Component"];
    if (comps == null) return [];

    const local = item["Local"];
    const funcType = item["TimeHistoryFunctionType"];
    const result = [];

    for (const lc of lcInfo.LCS) {

        for (const comp of comps) {
            const newJson = JSON.parse(JSON.stringify(json));
            const jsonResultGraphic = newJson["RESULT_GRAPHIC"];
            jsonResultGraphic["CURRENT_MODE"] = "Deformed Shape";

            const jsonComp = {
                COMP: comp,
                OPT_LOCAL_CHECK: local
            };
            jsonResultGraphic["COMPONENTS"] = jsonComp;

            const jsonComb = {
                TYPE: lc.type,
                NAME: lc.name,
                TH_OPTION: funcType,
            };
            if (lc.minmax)
                jsonComb["MINMAX"] = lc.minmax;
            if (lcInfo.CS)
                newJson["STAGE_NAME"] = lcInfo.CS;
            if (lcInfo.STEP)
                jsonComb["STEP_INDEX"] = lcInfo.STEP;

            jsonResultGraphic["LOAD_CASE_COMB"] = jsonComb;
            const fileName = "Deformation_DeformedShape_" + lc.fullname + "_" + comp + ".jpg";
            const imagePath = savePath + fileName;
            newJson["EXPORT_PATH"] = imagePath;
            newJson["RESULT_GRAPHIC"] = jsonResultGraphic;

            var newJson2 = JSON.parse(JSON.stringify({ Argument: newJson }));
            result.push(newJson2);
        }
    }
    return result;
};

export const BuildDispContour = (value, json, lcInfo, savePath) => {
    const db = value["DB"];
    if (db == null) return [];
    const item = db["Deformations - Displacement Contour"];
    if (item == null) return [];
    const comps = item["Component"];
    if (comps == null) return [];

    const local = item["Local"];
    const funcType = item["TimeHistoryFunctionType"];
    const result = [];

    for (const lc of lcInfo.LCS) {

        for (const comp of comps) {
            const newJson = JSON.parse(JSON.stringify(json));
            const jsonResultGraphic = newJson["RESULT_GRAPHIC"];
            jsonResultGraphic["CURRENT_MODE"] = "Displacement Contour";

            const jsonComp = {
                COMP: comp,
                OPT_LOCAL_CHECK: local
            };
            jsonResultGraphic["COMPONENTS"] = jsonComp;

            const jsonComb = {
                TYPE: lc.type,
                NAME: lc.name,
                TH_OPTION: funcType,
            };
            if (lc.minmax)
                jsonComb["MINMAX"] = lc.minmax;
            if (lcInfo.CS)
                newJson["STAGE_NAME"] = lcInfo.CS;
            if (lcInfo.STEP)
                jsonComb["STEP_INDEX"] = lcInfo.STEP;

            jsonResultGraphic["LOAD_CASE_COMB"] = jsonComb;
            const fileName = "Deformation_DisplacementContour_" + lc.fullname + "_" + comp + ".jpg";
            const imagePath = savePath + fileName;
            newJson["EXPORT_PATH"] = imagePath;
            newJson["RESULT_GRAPHIC"] = jsonResultGraphic;

            var newJson2 = JSON.parse(JSON.stringify({ Argument: newJson }));
            result.push(newJson2);
        }
    }
    return result;
};

export const BuildTrussForces = (value, json, lcInfo, savePath) => {
    const db = value["DB"];
    if (db == null) return [];
    const item = db["Forces - Truss Forces"];
    if (item == null) return [];
    const comps = item["Force Filter"];
    if (comps == null) return [];

    const outSectLoc = item["Output Section Location"];
    const result = [];

    for (const lc of lcInfo.LCS) {

        for (const comp of comps) {
            const newJson = JSON.parse(JSON.stringify(json));
            const jsonResultGraphic = newJson["RESULT_GRAPHIC"];
            jsonResultGraphic["CURRENT_MODE"] = "Truss Forces";

            const jsonComp = {
                COMP: comp,
            };
            jsonResultGraphic["COMPONENTS"] = jsonComp;

            const jsonOutSectLoc = {
                OPT_I_J_MAX_ALL: outSectLoc,
            };
            jsonResultGraphic["OUTPUT_SECT_LOCATION"] = jsonOutSectLoc;
            const jsonComb = {
                TYPE: lc.type,
                NAME: lc.name,
            };
            if (lc.minmax)
                jsonComb["MINMAX"] = lc.minmax;
            if (lcInfo.CS)
                newJson["STAGE_NAME"] = lcInfo.CS;
            if (lcInfo.STEP)
                jsonComb["STEP_INDEX"] = lcInfo.STEP;

            jsonResultGraphic["LOAD_CASE_COMB"] = jsonComb;
            const fileName = "Forces_TrussForces_" + lc.fullname + "_" + comp + ".jpg";
            const imagePath = savePath + fileName;
            newJson["EXPORT_PATH"] = imagePath;
            newJson["RESULT_GRAPHIC"] = jsonResultGraphic;

            var newJson2 = JSON.parse(JSON.stringify({ Argument: newJson }));
            result.push(newJson2);
        }
    }
    return result;
};

export const BuildBeamForcesMoments = (value, json, lcInfo, savePath) => {
    const db = value["DB"];
    if (db == null) return [];
    const item = db["Forces - Beam Forces/Moments"];
    if (item == null) return [];
    const comps = item["Component"];
    if (comps == null) return [];

    const outSectLoc = item["OutputSectionLocation"];
    let outLoc = item["OuputLocation"];
    if (!outLoc) {
        outLoc = [];
    }
    if (outSectLoc == "All") {
        outLoc = ["I", "Center", "J"];
    }
    const show = item["ShowTrussForces"];
    const byMember = item["ByMember"];
    const part = item["Part"];
    const result = [];


    for (const lc of lcInfo.LCS) {

        for (const comp of comps) {
            const newJson = JSON.parse(JSON.stringify(json));
            const jsonResultGraphic = newJson["RESULT_GRAPHIC"];
            jsonResultGraphic["CURRENT_MODE"] = "Beam Forces/Moments";

            const jsonComp = {
                PART: part,
                COMP: comp,
                "OPT_SHOW_TRUSS_FORCES": show
            };
            jsonResultGraphic["COMPONENTS"] = jsonComp;

            const jsonOutSectLoc = {
                "OPT_I": outLoc.includes("I"),
                "OPT_CENTER_MID": outLoc.includes("Center"),
                "OPE_J": outLoc.includes("J"),
                "OPT_BY_MEMBER": byMember
            };
            if (outSectLoc != "By Section") {
                jsonOutSectLoc["OPT_MAX_MINMAX_ALL"] = outSectLoc;
            }

            jsonResultGraphic["OUTPUT_SECT_LOCATION"] = jsonOutSectLoc;
            const jsonComb = {
                TYPE: lc.type,
                NAME: lc.name,
            };
            if (lc.minmax)
                jsonComb["MINMAX"] = lc.minmax;
            if (lcInfo.CS)
                newJson["STAGE_NAME"] = lcInfo.CS;
            if (lcInfo.STEP)
                jsonComb["STEP_INDEX"] = lcInfo.STEP;

            jsonResultGraphic["LOAD_CASE_COMB"] = jsonComb;
            const fileName = "Forces_BeamForcesMoments_" + lc.fullname + "_" + comp + ".jpg";
            const imagePath = savePath + fileName;
            newJson["EXPORT_PATH"] = imagePath;
            newJson["RESULT_GRAPHIC"] = jsonResultGraphic;

            var newJson2 = JSON.parse(JSON.stringify({ Argument: newJson }));
            result.push(newJson2);
        }
    }
    return result;
};

export const BuildBeamDiagrams = (value, json, lcInfo, savePath) => {
    const db = value["DB"];
    if (db == null) return [];
    const item = db["Forces - Beam Diagrams"];
    if (item == null) return [];
    const comps = item["Component"];
    if (comps == null) return [];

    const outSectLoc = item["OutputSectionLocation"];
    let outLoc = item["OuputLocation"];
    if (!outLoc) {
        outLoc = [];
    }
    if (outSectLoc == "All") {
        outLoc = ["I", "Center", "J"];
    }
    const show = item["ShowTrussForces"];
    const onlyTruss = item["OnlyTrussForces"];
    const byMember = item["ByMember"];
    const part = item["Part"];
    const fidelity = item["Fidelity"];
    const fill = item["Fill"];
    const scale = item["Scale"];
    const result = [];


    for (const lc of lcInfo.LCS) {

        for (const comp of comps) {
            const newJson = JSON.parse(JSON.stringify(json));
            const jsonResultGraphic = newJson["RESULT_GRAPHIC"];
            jsonResultGraphic["CURRENT_MODE"] = "Beam Diagrams";

            const jsonComp = {
                PART: part,
                COMP: comp,
                "OPT_SHOW_TRUSS_FORCES": show,
                "OPT_ONLY_TRUSS_FORCES": onlyTruss,
            };
            jsonResultGraphic["COMPONENTS"] = jsonComp;

            const dispOption = {
                "FIDELITY": fidelity,
                "FILL": fill,
                "SCALE": scale,
            };
            jsonResultGraphic["DISPLAY_OPTIONS"] = dispOption;

            const jsonOutSectLoc = {
                "OPT_I": outLoc.includes("I"),
                "OPT_CENTER_MID": outLoc.includes("Center"),
                "OPE_J": outLoc.includes("J"),
                "OPT_BY_MEMBER": byMember
            };
            if (outSectLoc != "By Section") {
                jsonOutSectLoc["OPT_MAX_MINMAX_ALL"] = outSectLoc;
            }

            jsonResultGraphic["OUTPUT_SECT_LOCATION"] = jsonOutSectLoc;
            const jsonComb = {
                TYPE: lc.type,
                NAME: lc.name,
            };
            if (lc.minmax)
                jsonComb["MINMAX"] = lc.minmax;
            if (lcInfo.CS)
                newJson["STAGE_NAME"] = lcInfo.CS;
            if (lcInfo.STEP)
                jsonComb["STEP_INDEX"] = lcInfo.STEP;

            jsonResultGraphic["LOAD_CASE_COMB"] = jsonComb;
            const fileName = "Forces_BeamDiagrams_" + lc.fullname + "_" + comp + ".jpg";
            const imagePath = savePath + fileName;
            newJson["EXPORT_PATH"] = imagePath;
            newJson["RESULT_GRAPHIC"] = jsonResultGraphic;

            var newJson2 = JSON.parse(JSON.stringify({ Argument: newJson }));
            result.push(newJson2);
        }
    }
    return result;
};


export const BuildPlateForcesMoments = (value, json, lcInfo, savePath) => {
    const db = value["DB"];
    if (db == null) return [];
    const item = db["Forces - Plate Forces/Moments"];
    if (item == null) return [];
    const comps = item["Component"];
    if (comps == null) return [];

    const avgCalcMethod = item["Avg.CalcMethod"];
    const activeOnly = item["Avg.NodalActiveOnly"];
    const useUCS = item["UseUCS"];
    const ucsNAME = item["UCSName"];
    const print = item["PrintUCSAxis"];

    const result = [];

    for (const lc of lcInfo.LCS) {

        for (const comp of comps) {
            const newJson = JSON.parse(JSON.stringify(json));
            const jsonResultGraphic = newJson["RESULT_GRAPHIC"];
            jsonResultGraphic["CURRENT_MODE"] = "Plate Forces/Moments";

            const jsonComp = {
                COMP: comp,
            };
            jsonResultGraphic["COMPONENTS"] = jsonComp;

            const options = {
                "LOCAL_UCS": {
                    "TYPE": useUCS,
                },
                "AVERAGE_NODAL": {
                    "TYPE": avgCalcMethod,
                }
            };
            if (useUCS == "UCS") {
                options["LOCAL_UCS"]["UCS_NAME"] = ucsNAME;
                options["LOCAL_UCS"]["OPT_PRINT_UCS_AXIS"] = print;
            }
            if (avgCalcMethod == "Avg. Nodal") {
                options["AVERAGE_NODAL"]["OPT_ACTIVE_ONLY"] = activeOnly;
            }
            jsonResultGraphic["OPTIONS"] = options;
            const jsonComb = {
                TYPE: lc.type,
                NAME: lc.name,
            };
            if (lc.minmax)
                jsonComb["MINMAX"] = lc.minmax;
            if (lcInfo.CS)
                newJson["STAGE_NAME"] = lcInfo.CS;
            if (lcInfo.STEP)
                jsonComb["STEP_INDEX"] = lcInfo.STEP;

            jsonResultGraphic["LOAD_CASE_COMB"] = jsonComb;
            const fileName = "Forces_PlateForcesMoments_" + lc.fullname + "_" + comp + ".jpg";
            const imagePath = savePath + fileName;
            newJson["EXPORT_PATH"] = imagePath;
            newJson["RESULT_GRAPHIC"] = jsonResultGraphic;

            var newJson2 = JSON.parse(JSON.stringify({ Argument: newJson }));
            result.push(newJson2);
        }
    }
    return result;
};

export const BuildBeamStresses = (value, json, lcInfo, savePath) => {
    const db = value["DB"];
    if (db == null) return [];
    const item = db["Stresses - Beam Stresses"];
    if (item == null) return [];
    const comps = item["Component"];
    if (comps == null) return [];

    const outSectLoc = item["OutputSectionLocation"];
    let outLoc = item["OuputLocation"];
    if (!outLoc) {
        outLoc = [];
    }
    if (outSectLoc == "All") {
        outLoc = ["I", "Center", "J"];

    }
    const sectPos = item["SectionPosition"];
    const component7th = item["Component7th"];
    const part = item["Part"];

    const result = [];


    for (const lc of lcInfo.LCS) {

        for (const comp of comps) {
            const newJson = JSON.parse(JSON.stringify(json));
            const jsonResultGraphic = newJson["RESULT_GRAPHIC"];
            jsonResultGraphic["CURRENT_MODE"] = "Beam Stresses";

            const jsonComp = {
                PART: part,
                COMP: comp,
                "COMP_7TH_DOF": component7th,
                "COMP_SUB": sectPos,
            };
            jsonResultGraphic["COMPONENTS"] = jsonComp;

            const jsonOutSectLoc = {
                "OPT_I": outLoc.includes("I"),
                "OPT_CENTER_MID": outLoc.includes("Center"),
                "OPE_J": outLoc.includes("J"),
            };
            if (outSectLoc != "By Section") {
                jsonOutSectLoc["OPT_MAX_MINMAX_ALL"] = outSectLoc;
            }

            jsonResultGraphic["OUTPUT_SECT_LOCATION"] = jsonOutSectLoc;
            const jsonComb = {
                TYPE: lc.type,
                NAME: lc.name,
            };
            if (lc.minmax)
                jsonComb["MINMAX"] = lc.minmax;
            if (lcInfo.CS)
                newJson["STAGE_NAME"] = lcInfo.CS;
            if (lcInfo.STEP)
                jsonComb["STEP_INDEX"] = lcInfo.STEP;

            jsonResultGraphic["LOAD_CASE_COMB"] = jsonComb;
            const fileName = "Stresses_BeamStresses_" + lc.fullname + "_" + comp + ".jpg";
            const imagePath = savePath + fileName;
            newJson["EXPORT_PATH"] = imagePath;
            newJson["RESULT_GRAPHIC"] = jsonResultGraphic;

            var newJson2 = JSON.parse(JSON.stringify({ Argument: newJson }));
            result.push(newJson2);
        }
    }
    return result;
};

export const BuildBeamStressesDiagram = (value, json, lcInfo, savePath) => {
    const db = value["DB"];
    if (db == null) return [];
    const item = db["Stresses - Beam Stresses Diagram"];
    if (item == null) return [];
    const comps = item["Component"];
    if (comps == null) return [];

    const outSectLoc = item["OutputSectionLocation"];
    let outLoc = item["OuputLocation"];
    if (!outLoc) {
        outLoc = [];
    }
    if (outSectLoc == "All") {
        outLoc = ["I", "Center", "J"];

    }
    const sectPos = item["SectionPosition"];
    const component7th = item["Component7th"];
    const part = item["Part"];

    const fill = item["Fill"];
    const scale = item["Scale"];

    const result = [];


    for (const lc of lcInfo.LCS) {

        for (const comp of comps) {
            const newJson = JSON.parse(JSON.stringify(json));
            const jsonResultGraphic = newJson["RESULT_GRAPHIC"];
            jsonResultGraphic["CURRENT_MODE"] = "Beam Stresses Diagram";

            const jsonComp = {
                PART: part,
                COMP: comp,
                "COMP_7TH_DOF": component7th,
                "COMP_SUB": sectPos,
            };
            jsonResultGraphic["COMPONENTS"] = jsonComp;

            const jsonOutSectLoc = {
                "OPT_I": outLoc.includes("I"),
                "OPT_CENTER_MID": outLoc.includes("Center"),
                "OPE_J": outLoc.includes("J"),
            };
            if (outSectLoc != "By Section") {
                jsonOutSectLoc["OPT_MAX_MINMAX_ALL"] = outSectLoc;
            }

            jsonResultGraphic["OUTPUT_SECT_LOCATION"] = jsonOutSectLoc;

            const dispOption = {
                "FILL": fill,
                "SCALE": scale,
            };
            jsonResultGraphic["DISPLAY_OPTIONS"] = dispOption;

            const jsonComb = {
                TYPE: lc.type,
                NAME: lc.name,
            };
            if (lc.minmax)
                jsonComb["MINMAX"] = lc.minmax;
            if (lcInfo.CS)
                newJson["STAGE_NAME"] = lcInfo.CS;
            if (lcInfo.STEP)
                jsonComb["STEP_INDEX"] = lcInfo.STEP;

            jsonResultGraphic["LOAD_CASE_COMB"] = jsonComb;
            const fileName = "Stresses_BeamStressesDiagram_" + lc.fullname + "_" + comp + ".jpg";
            const imagePath = savePath + fileName;
            newJson["EXPORT_PATH"] = imagePath;
            newJson["RESULT_GRAPHIC"] = jsonResultGraphic;

            var newJson2 = JSON.parse(JSON.stringify({ Argument: newJson }));
            result.push(newJson2);
        }
    }
    return result;
};

export const BuildBeamStressesPSC = (value, json, lcInfo, savePath) => {
    const db = value["DB"];
    if (db == null) return [];
    const item = db["Stresses - Beam Stresses(PSC)"];
    if (item == null) return [];
    const comps = item["Component"];
    if (comps == null) return [];

    const outSectLoc = item["OutputSectionLocation"];
    let outLoc = item["OuputLocation"];
    if (!outLoc) {
        outLoc = [];
    }
    if (outSectLoc == "All") {
        outLoc = ["I", "Center", "J"];

    }
    const sectPos = item["SectionPosition"];
    const component7th = item["Component7th"];

    const fill = item["Fill"];
    const scale = item["Scale"];

    const result = [];


    for (const lc of lcInfo.LCS) {

        for (const comp of comps) {
            const newJson = JSON.parse(JSON.stringify(json));
            const jsonResultGraphic = newJson["RESULT_GRAPHIC"];
            jsonResultGraphic["CURRENT_MODE"] = "Beam Stresses (PSC)";

            const jsonComp = {
                COMP: comp,
                "COMP_7TH_DOF": component7th,
                "COMP_SUB": sectPos,
            };
            jsonResultGraphic["COMPONENTS"] = jsonComp;

            const jsonOutSectLoc = {
                "OPT_I": outLoc.includes("I"),
                "OPT_CENTER_MID": outLoc.includes("Center"),
                "OPE_J": outLoc.includes("J"),
            };
            if (outSectLoc != "By Section") {
                jsonOutSectLoc["OPT_MAX_MINMAX_ALL"] = outSectLoc;
            }

            jsonResultGraphic["OUTPUT_SECT_LOCATION"] = jsonOutSectLoc;

            const dispOption = {
                "FILL": fill,
                "SCALE": scale,
            };
            jsonResultGraphic["DISPLAY_OPTIONS"] = dispOption;

            const jsonComb = {
                TYPE: lc.type,
                NAME: lc.name,
            };
            if (lc.minmax)
                jsonComb["MINMAX"] = lc.minmax;
            if (lcInfo.CS)
                newJson["STAGE_NAME"] = lcInfo.CS;
            if (lcInfo.STEP)
                jsonComb["STEP_INDEX"] = lcInfo.STEP;

            jsonResultGraphic["LOAD_CASE_COMB"] = jsonComb;
            const fileName = "Stresses_BeamStressesPSC_" + lc.fullname + "_" + comp + ".jpg";
            const imagePath = savePath + fileName;
            newJson["EXPORT_PATH"] = imagePath;
            newJson["RESULT_GRAPHIC"] = jsonResultGraphic;

            var newJson2 = JSON.parse(JSON.stringify({ Argument: newJson }));
            result.push(newJson2);
        }
    }
    return result;
};

export const BuildPlaneStressPlateStresses = (value, json, lcInfo, savePath) => {
    const db = value["DB"];
    if (db == null) return [];
    const item = db["Stresses - Plane-Stress/Plate Stresses"];
    if (item == null) return [];
    const comps = item["Component"];
    if (comps == null) return [];

    const avgCalcMethod = item["Avg.CalcMethod"];
    const activeOnly = item["Avg.NodalActiveOnly"];
    const useUCS = item["UscUCS"];
    const ucsNAME = item["UCSName"];
    const print = item["PrintUCSAxis"];

    const surface = item["Surface"];

    const result = [];

    for (const lc of lcInfo.LCS) {

        for (const comp of comps) {
            const newJson = JSON.parse(JSON.stringify(json));
            const jsonResultGraphic = newJson["RESULT_GRAPHIC"];
            jsonResultGraphic["CURRENT_MODE"] = "Plane-Stress/Plate Stresses";

            const jsonComp = {
                COMP: comp,
            };
            jsonResultGraphic["COMPONENTS"] = jsonComp;

            const options = {
                "LOCAL_UCS": {
                    "TYPE": useUCS,
                },
                "AVERAGE_NODAL": {
                    "TYPE": avgCalcMethod,
                },
                SURFACE: surface,
            };
            if (useUCS == "UCS") {
                options["LOCAL_UCS"]["UCS_NAME"] = ucsNAME;
                options["LOCAL_UCS"]["OPT_PRINT_UCS_AXIS"] = print;
            }
            if (avgCalcMethod == "Avg. Nodal") {
                options["AVERAGE_NODAL"]["OPT_ACTIVE_ONLY"] = activeOnly;
            }
            jsonResultGraphic["OPTIONS"] = options;
            const jsonComb = {
                TYPE: lc.type,
                NAME: lc.name,
            };
            if (lc.minmax)
                jsonComb["MINMAX"] = lc.minmax;
            if (lcInfo.CS)
                newJson["STAGE_NAME"] = lcInfo.CS;
            if (lcInfo.STEP)
                jsonComb["STEP_INDEX"] = lcInfo.STEP;

            jsonResultGraphic["LOAD_CASE_COMB"] = jsonComb;
            const fileName = "Stress_PlaneStressPlateStresses_" + lc.fullname + "_" + comp + ".jpg";
            const imagePath = savePath + fileName;
            newJson["EXPORT_PATH"] = imagePath;
            newJson["RESULT_GRAPHIC"] = jsonResultGraphic;

            var newJson2 = JSON.parse(JSON.stringify({ Argument: newJson }));
            result.push(newJson2);
        }
    }
    return result;
};

function parseString(str) {
    const type = str.split('(').slice(-1)[0].split(')')[0];
    let name = str.slice(0, -(type.length + 2));
    let fullname = str;
    let minmax;
    if (name.startsWith('[')) {
        const parts = name.split(']');
        minmax = parts[0].slice(1);  // 대괄호를 제거한 첫 번째 부분을 minmax에 설정
        name = parts.slice(1).join(']');  // 나머지 부분을 name에 설정
    }

    return { name, type, minmax, fullname };
}

export const BuildMVRaction = (value, json, lcInfo, savePath) => {
    const db = value["DB"];
    if (db == null) return [];
    const item = db["Moving Load Tracer - Reaction"];
    if (item == null) return [];
    const comps = item["Component"];
    if (comps == null) return [];


    const local = item["Local"];

    const result = [];

    for (const lc of lcInfo.LCS) {

        for (const comp of comps) {
            const newJson = JSON.parse(JSON.stringify(json));
            const jsonResultGraphic = newJson["RESULT_GRAPHIC"];
            jsonResultGraphic["CURRENT_MODE"] = "MVLTRC_Reactions";

            const jsonComp = {
                COMP: comp,
                "OPT_LOCAL_CHECK": local,
            };
            jsonResultGraphic["COMPONENTS"] = jsonComp;

            const jsonComb = {
                TYPE: lc.type,
                NAME: lc.name,

            };
            if (lcInfo.MVELEMKEY)
                jsonComb.KEY_NODE_ELEM = convertToNumber(lcInfo.MVELEMKEY);

            if (lc.minmax)
                jsonComb["MINMAX"] = lc.minmax;
            if (lcInfo.CS)
                newJson["STAGE_NAME"] = lcInfo.CS;
            if (lcInfo.STEP)
                jsonComb["STEP_INDEX"] = lcInfo.STEP;

            jsonResultGraphic["LOAD_CASE_COMB"] = jsonComb;
            const fileName = "MovingLoadTracer_Reactions_" + lc.fullname + "_" + comp + ".jpg";
            const imagePath = savePath + fileName;
            newJson["EXPORT_PATH"] = imagePath;
            newJson["RESULT_GRAPHIC"] = jsonResultGraphic;

            var newJson2 = JSON.parse(JSON.stringify({ Argument: newJson }));
            result.push(newJson2);
        }
    }
    return result;
};

export const BuildMVBeamForcesMoments = (value, json, lcInfo, savePath) => {
    const db = value["DB"];
    if (db == null) return [];
    const item = db["Moving Load Tracer - Beam Forces/Moments"];
    if (item == null) return [];
    const comps = item["Component"];
    if (comps == null) return [];


    const parts = item["Parts"];

    const result = [];

    for (const lc of lcInfo.LCS) {

        for (const comp of comps) {
            const newJson = JSON.parse(JSON.stringify(json));
            const jsonResultGraphic = newJson["RESULT_GRAPHIC"];
            jsonResultGraphic["CURRENT_MODE"] = "MVLTRC_Beam Forces/Moments";

            const jsonComp = {
                COMP: comp,
                "PART": parts,
            };
            jsonResultGraphic["COMPONENTS"] = jsonComp;

            const jsonComb = {
                TYPE: lc.type,
                NAME: lc.name,
            };
            if (lcInfo.MVELEMKEY)
                jsonComb.KEY_NODE_ELEM = convertToNumber(lcInfo.MVELEMKEY);

            if (lc.minmax)
                jsonComb["MINMAX"] = lc.minmax;
            if (lcInfo.CS)
                newJson["STAGE_NAME"] = lcInfo.CS;
            if (lcInfo.STEP)
                jsonComb["STEP_INDEX"] = lcInfo.STEP;

            jsonResultGraphic["LOAD_CASE_COMB"] = jsonComb;
            const fileName = "MovingLoadTracer_BeamForcesMoments_" + lc.fullname + "_" + comp + ".jpg";
            const imagePath = savePath + fileName;
            newJson["EXPORT_PATH"] = imagePath;
            newJson["RESULT_GRAPHIC"] = jsonResultGraphic;

            var newJson2 = JSON.parse(JSON.stringify({ Argument: newJson }));
            result.push(newJson2);
        }
    }
    return result;
};

export const BuildMVPlateForcesMoments = (value, json, lcInfo, savePath) => {
    const db = value["DB"];
    if (db == null) return [];
    const item = db["Moving Load Tracer - Plate Forces/Moments"];
    if (item == null) return [];
    const comps = item["Component"];
    if (comps == null) return [];


    const parts = item["Parts"];

    const result = [];

    for (const lc of lcInfo.LCS) {

        for (const comp of comps) {
            const newJson = JSON.parse(JSON.stringify(json));
            const jsonResultGraphic = newJson["RESULT_GRAPHIC"];
            jsonResultGraphic["CURRENT_MODE"] = "MVLTRC_Plate Forces/Moments";

            const jsonComp = {
                COMP: comp,
                "PART": parts,
            };
            jsonResultGraphic["COMPONENTS"] = jsonComp;

            const jsonComb = {
                TYPE: lc.type,
                NAME: lc.name,
            };
            if (lcInfo.MVELEMKEY)
                jsonComb.KEY_NODE_ELEM = convertToNumber(lcInfo.MVELEMKEY);

            if (lc.minmax)
                jsonComb["MINMAX"] = lc.minmax;
            if (lcInfo.CS)
                newJson["STAGE_NAME"] = lcInfo.CS;
            if (lcInfo.STEP)
                jsonComb["STEP_INDEX"] = lcInfo.STEP;

            jsonResultGraphic["LOAD_CASE_COMB"] = jsonComb;
            const fileName = "MovingLoadTracer_PlateForcesMoments_" + lc.fullname + "_" + comp + ".jpg";
            const imagePath = savePath + fileName;
            newJson["EXPORT_PATH"] = imagePath;
            newJson["RESULT_GRAPHIC"] = jsonResultGraphic;

            var newJson2 = JSON.parse(JSON.stringify({ Argument: newJson }));
            result.push(newJson2);
        }
    }
    return result;
};

export const BuildMVBeamStresses = (value, json, lcInfo, savePath) => {
    const db = value["DB"];
    if (db == null) return [];
    const item = db["Moving Load Tracer - Beam Stresses"];
    if (item == null) return [];
    const comps = item["Component"];
    if (comps == null) return [];

    const compSub = item["Position"];


    const parts = item["Parts"];

    const result = [];

    for (const lc of lcInfo.LCS) {

        for (const comp of comps) {
            const newJson = JSON.parse(JSON.stringify(json));
            const jsonResultGraphic = newJson["RESULT_GRAPHIC"];
            jsonResultGraphic["CURRENT_MODE"] = "MVLTRC_Beam Stresses";

            const jsonComp = {
                //API 문제로 인해 Comp / COmp Sub가 반대
                COMP: compSub,
                COMP_SUB: comp,
                "PART": parts,
            };
            jsonResultGraphic["COMPONENTS"] = jsonComp;

            const jsonComb = {
                TYPE: lc.type,
                NAME: lc.name,
            };
            if (lcInfo.MVELEMKEY)
                jsonComb.KEY_NODE_ELEM = convertToNumber(lcInfo.MVELEMKEY);
            if (lc.minmax)
                jsonComb["MINMAX"] = lc.minmax;
            if (lcInfo.CS)
                newJson["STAGE_NAME"] = lcInfo.CS;
            if (lcInfo.STEP)
                jsonComb["STEP_INDEX"] = lcInfo.STEP;

            jsonResultGraphic["LOAD_CASE_COMB"] = jsonComb;
            const fileName = "MovingLoadTracer_BeamStresses_" + lc.fullname + "_" + comp + ".jpg";
            const imagePath = savePath + fileName;
            newJson["EXPORT_PATH"] = imagePath;
            newJson["RESULT_GRAPHIC"] = jsonResultGraphic;

            var newJson2 = JSON.parse(JSON.stringify({ Argument: newJson }));
            result.push(newJson2);
        }
    }
    return result;
};

export const BuildModeShapes = (value, json, lcInfo, savePath) => {
    const db = value["DB"];
    if (db == null) return [];
    const item = db["Mode Shapes - Vibration Mode Shapes"];
    if (item == null) return [];
    const comps = item["Component"];
    if (comps == null) return [];


    const result = [];

    for (const lc of lcInfo.MDLCS) {

        for (const comp of comps) {
            const newJson = JSON.parse(JSON.stringify(json));
            const jsonResultGraphic = newJson["RESULT_GRAPHIC"];
            jsonResultGraphic["CURRENT_MODE"] = "Vibration Mode Shapes";

            const jsonComp = {
                COMP: comp,
            };
            jsonResultGraphic["COMPONENTS"] = jsonComp;

            const jsonComb = {
                NAME: lc.name,
            };

            jsonResultGraphic["LOAD_CASE_COMB"] = jsonComb;

            if (jsonResultGraphic["TYPE_OF_DISPLAY"] === undefined)
                jsonResultGraphic["TYPE_OF_DISPLAY"] = {};
            //jsonResultGraphic["TYPE_OF_DISPLAY"]["MODE_SHAPE"] = true;
            jsonResultGraphic["TYPE_OF_DISPLAY"]["CONTOUR"] = true;

            const fileName = "ModeShapes_VibrationModeShapes_" + lc.fullname + "_" + comp + ".jpg";
            const imagePath = savePath + fileName;
            newJson["EXPORT_PATH"] = imagePath;
            newJson["RESULT_GRAPHIC"] = jsonResultGraphic;

            var newJson2 = JSON.parse(JSON.stringify({ Argument: newJson }));
            result.push(newJson2);
        }
    }
    return result;
};

export const BuildCaptureJsonDatas = (printData, printH, printV, savePath) => {
    const map = new Map(Object.entries(printData));
    const result = [];

    for (const [key, value] of map) {
        const defaultJson = GetDefaultJson(value, printH, printV);
        const lcDatas = [];
        const modeLcDatas = []
        let step;
        let elemKey;
        let cs;
        if (value["LoadCombination"]) {
            const lcs = value["LoadCombination"]["LC"];

            for (const lcName of lcs) {
                const lc = parseString(lcName);
                if (lc.type == "MD")
                    modeLcDatas.push(lc);
                else
                    lcDatas.push(lc);
            }
            step = value["LoadCombination"]["Step"];
            cs = value["LoadCombination"]["CS"];
            elemKey = value["LoadCombination"]["MovingLoadKeyElement"];
        }
        const lcInfo = {
            LCS: lcDatas,
            MDLCS: modeLcDatas,
            CS: cs,
            STEP: step,
            MVELEMKEY: elemKey,
        }

        for (const item of BuildReaction(value, defaultJson, lcInfo, savePath)) { result.push(item); }

        for (const item of BuildDeformedShape(value, defaultJson, lcInfo, savePath)) { result.push(item); }
        for (const item of BuildDispContour(value, defaultJson, lcInfo, savePath)) { result.push(item); }

        for (const item of BuildTrussForces(value, defaultJson, lcInfo, savePath)) { result.push(item); }
        for (const item of BuildBeamForcesMoments(value, defaultJson, lcInfo, savePath)) { result.push(item); }
        for (const item of BuildBeamDiagrams(value, defaultJson, lcInfo, savePath)) { result.push(item); }
        for (const item of BuildPlateForcesMoments(value, defaultJson, lcInfo, savePath)) { result.push(item); }

        for (const item of BuildBeamStresses(value, defaultJson, lcInfo, savePath)) { result.push(item); }
        for (const item of BuildBeamStressesDiagram(value, defaultJson, lcInfo, savePath)) { result.push(item); }
        for (const item of BuildBeamStressesPSC(value, defaultJson, lcInfo, savePath)) { result.push(item); }
        for (const item of BuildPlaneStressPlateStresses(value, defaultJson, lcInfo, savePath)) { result.push(item); }

        for (const item of BuildMVRaction(value, defaultJson, lcInfo, savePath)) { result.push(item); }
        for (const item of BuildMVBeamForcesMoments(value, defaultJson, lcInfo, savePath)) { result.push(item); }
        for (const item of BuildMVPlateForcesMoments(value, defaultJson, lcInfo, savePath)) { result.push(item); }
        for (const item of BuildMVBeamStresses(value, defaultJson, lcInfo, savePath)) { result.push(item); }

        for (const item of BuildModeShapes(value, defaultJson, lcInfo, savePath)) { result.push(item); }

    }
    return result;
};

export const BuildCaptureJsonDatasModel = (previewData, printH, printV, savePath) => {

    const map = new Map(Object.entries(previewData));
    const result = [];

    for (const [key, value] of map) {
        const defaultJson = GetDefaultJsonModel(value, printH, printV);
        const fileName = key + ".jpg";
        const imagePath = savePath + fileName;
        defaultJson["EXPORT_PATH"] = imagePath;
        result.push({"Argument":defaultJson});        
    }
    return result;
};
