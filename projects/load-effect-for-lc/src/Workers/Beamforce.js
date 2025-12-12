//Beamforce.js
import { sendData, loadData, hasError, isDemo } from "../utils";
import { POSTBEAMFORCE, DBVARIANT } from "./dictionary";


export const GetBeamforceData = async ({ part, style, unit, element, lcomName, lcomData, hasCS = false, hasMV = false, hasCB=false }) => {
  const DBNAME = POSTBEAMFORCE.PATH;
  

  const LOAD_CASES = [];

  if (hasMV) {
    LOAD_CASES.push(lcomName + "(CB:max)");
    LOAD_CASES.push(lcomName + "(CB:min)");
  } else {
    LOAD_CASES.push(lcomName + "(CB)" );
  }

  if (hasCB) {
    LOAD_CASES.push(lcomName + "(CB:max)");
    LOAD_CASES.push(lcomName + "(CB:min)");
    LOAD_CASES.push(lcomName + "(CB)");
  }

  const body = {
    "Argument": {
        "TABLE_NAME": `${lcomName}`,
        "TABLE_TYPE": "BEAMFORCE",
        "UNIT": {
            "FORCE": unit.force,
            "DIST": unit.dist
        },
        "STYLES": {
            "FORMAT": style.format,
            "PLACE": style.place
        },
        "NODE_ELEMS": {
            "KEYS": [
              Number(element)
            ]
        },
        // "OPT_CS": hasCS,
        "LOAD_CASE_NAMES": LOAD_CASES,
        "PARTS": [
          part
        ]
    }
  };

  const rawData = isDemo()
    ? {
      "empty": {
          "FORCE": "kN",
          "DIST": "m",
          "HEAD": [
              "Index",
              "Elem",
              "Load",
              "Part",
              "Axial",
              "Shear-y",
              "Shear-z",
              "Torsion",
              "Moment-y",
              "Moment-z"
          ],
          "DATA": [
              [
                  "1",
                  "18",
                  "gLCB1(max)",
                  "I[18]",
                  "0.050906521937",
                  "-0.129911489773",
                  "-784.512393146201",
                  "-4373.543448226230",
                  "66779.700754471094",
                  "-2.736792387210"
              ],
              [
                  "2",
                  "18",
                  "gLCB1(min)",
                  "I[18]",
                  "0.043051422083",
                  "-0.153614950757",
                  "-1959.069580646200",
                  "-5371.762270491850",
                  "53606.157660721103",
                  "-3.236269428931"
              ]
          ]
      }
  }
    : await sendData(DBNAME, body, "POST");
  
  if (hasError(rawData)) throw new Error("Cannot generate table data as there is no analysis result.");
  const data = rawData?.[lcomName]?.DATA || rawData?.DATA || [];

  //hasMV = false
  //hasCS = false

  if (data.length === 0) return [];

  const makeBody = (LCOM) => ({
    "Argument": {
        "TABLE_NAME": `${lcomName}`,
        "TABLE_TYPE": "BEAMFORCE",
        "UNIT": {
            "FORCE": unit.force,
            "DIST": unit.dist
        },
        "STYLES": {
            "FORMAT": style.format,
            "PLACE": style.place
        },
        "NODE_ELEMS": {
            "KEYS": [
              Number(element)
            ]
        },
        // "OPT_CS": hasCS,
        "LOAD_CASE_NAMES": LCOM,
        "PARTS": [
          part
        ]
    }
  });

  let FX_DATA = {};
  let FY_DATA = {};
  let FZ_DATA = {};
  let MX_DATA = {};
  let MY_DATA = {};
  let MZ_DATA = {};

  for (const requestLcomItem of lcomData) { // [{NAME, FACTOR, }]
    let requestLcomName = [requestLcomItem.NAME];
    let requestHasMv = requestLcomItem.NAME.includes("(MV)");
    let requestHasCs = requestLcomItem.NAME.includes("(CS)");
    let requestHasCb = requestLcomItem.NAME.includes("(CB)");
   
    if (requestHasMv) {
      requestLcomName = [
        requestLcomItem.NAME,
        requestLcomItem.NAME.replace("(MV)", "(MV:max)"),
        requestLcomItem.NAME.replace("(MV)", "(MV:min)"),
      ];
    }
    if (requestHasCb) {
      requestLcomName = [
        requestLcomItem.NAME,
        requestLcomItem.NAME.replace("(CB)", "(CB:max)"),
        requestLcomItem.NAME.replace("(CB)", "(CB:min)"),
      ]
    }

    let requestBody = makeBody(requestLcomName);
    if (requestHasCs) {
      const stagData = await loadData(DBVARIANT.PATH + DBVARIANT.STAGE);
      if (hasError(stagData)) continue;

      const stageData = stagData[DBVARIANT.STAGE];

      const sortedStageData = Object.entries(stageData).sort((a, b) => a[1]?.NO - b[1]?.NO);
      const lastStage = sortedStageData[sortedStageData.length - 1][1];
      const currentStageName = lastStage.NAME;
      let lastStageSteps = 0;

      if (lastStage?.bSV_STEP) {
          //bSV_STEP이 true인 경우 : first, last로 데이터가 최소 두 개 이상 존재
          lastStageSteps += 2 + (lastStage?.ADD_STEP?.length || 0);
      } else {
          //bSV_STEP이 false인 경우 last + ADD_STEP수만큼 데이터가 한 개 이상 존재
          lastStageSteps += 1 + (lastStage?.ADD_STEP?.length || 0);
      }

      let currentStagePostfix = lastStageSteps.toString().padStart(3, "0");

      requestBody.Argument.OPT_CS = true;
      requestBody.Argument.STAGE_STEP = [
          `${currentStageName}:${currentStagePostfix}(last)`,
          `${currentStageName}:${currentStagePostfix}(最終)`,
      ]
    }

    const result = await sendData(DBNAME, requestBody, "POST");
    
    if (hasError(result)) continue;

    const resultData = result?.[lcomName]?.DATA || result?.DATA || [];

    if (resultData.length === 0) continue;
    console.log("resultData is:",resultData);
    console.log("resultDataLenght",resultData.length)

    console.table({
      requestLcomItem: requestLcomItem.NAME,
      requestHasMv,
      requestHasCs,
      requestHasCb,
    })
    if (requestHasMv) {
      const newName = requestLcomItem.NAME.replace("(MV)", "");
      FX_DATA[newName + "(MV:max)"] = resultData[0][4];
      FY_DATA[newName + "(MV:max)"] = resultData[0][5];
      FZ_DATA[newName + "(MV:max)"] = resultData[0][6];
      MX_DATA[newName + "(MV:max)"] = resultData[0][7];
      MY_DATA[newName + "(MV:max)"] = resultData[0][8];
      MZ_DATA[newName + "(MV:max)"] = resultData[0][9];
      FX_DATA[newName + "(MV:min)"] = resultData[1][4];
      FY_DATA[newName + "(MV:min)"] = resultData[1][5];
      FZ_DATA[newName + "(MV:min)"] = resultData[1][6];
      MX_DATA[newName + "(MV:min)"] = resultData[1][7];
      MY_DATA[newName + "(MV:min)"] = resultData[1][8];
      MZ_DATA[newName + "(MV:min)"] = resultData[1][9];
    } else if (requestHasCs) {
      FX_DATA[requestLcomItem.NAME] = resultData[0][6];
      FY_DATA[requestLcomItem.NAME] = resultData[0][7];
      FZ_DATA[requestLcomItem.NAME] = resultData[0][8];
      MX_DATA[requestLcomItem.NAME] = resultData[0][9];
      MY_DATA[requestLcomItem.NAME] = resultData[0][10];
      MZ_DATA[requestLcomItem.NAME] = resultData[0][11];
    } else if (requestHasCb && resultData.length === 2){
      const newName = requestLcomItem.NAME.replace("(CB)", "");
      FX_DATA[newName + "(CB:max)"] = resultData[0][4];
      FY_DATA[newName + "(CB:max)"] = resultData[0][5];
      FZ_DATA[newName + "(CB:max)"] = resultData[0][6];
      MX_DATA[newName + "(CB:max)"] = resultData[0][7];
      MY_DATA[newName + "(CB:max)"] = resultData[0][8];
      MZ_DATA[newName + "(CB:max)"] = resultData[0][9];
      FX_DATA[newName + "(CB:min)"] = resultData[1][4];
      FY_DATA[newName + "(CB:min)"] = resultData[1][5];
      FZ_DATA[newName + "(CB:min)"] = resultData[1][6];
      MX_DATA[newName + "(CB:min)"] = resultData[1][7];
      MY_DATA[newName + "(CB:min)"] = resultData[1][8];
      MZ_DATA[newName + "(CB:min)"] = resultData[1][9];
    }else {
      FX_DATA[requestLcomItem.NAME] = resultData[0][4];
      FY_DATA[requestLcomItem.NAME] = resultData[0][5];
      FZ_DATA[requestLcomItem.NAME] = resultData[0][6];
      MX_DATA[requestLcomItem.NAME] = resultData[0][7];
      MY_DATA[requestLcomItem.NAME] = resultData[0][8];
      MZ_DATA[requestLcomItem.NAME] = resultData[0][9];
    }
  }
  
  const beamData = data.map((value, index) => {
    return {
      INDEX: value[0],
      ELEMENT: value[1],
      LOAD: value[2],
      I_J: value[3],
      FX: value[4],
      FX_DATA,
      FY: value[5],
      FY_DATA,
      FZ: value[6],
      FZ_DATA,
      MX: value[7],
      MX_DATA,
      MY: value[8],
      MY_DATA,
      MZ: value[9],
      MZ_DATA,
    };
  }
);
  console.log("beamData is:",beamData)

  return beamData;
  
};

