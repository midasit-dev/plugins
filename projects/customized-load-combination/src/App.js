import './App.css';
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { GuideBox } from '@midasit-dev/moaui';
import * as Buttons from './Components/Buttons';
import { CheckGroup,Check } from '@midasit-dev/moaui';
import Sep from "@midasit-dev/moaui/Components/Separator";
import ExcelReader from './Components/ExcelReader';
import * as XLSX from 'xlsx';
import { useSnackbar, SnackbarProvider } from "notistack";
import { Panel } from '@midasit-dev/moaui';
import { Typography } from '@midasit-dev/moaui';
import { ComponentsPanelTypographyDropList} from './Components/ComponentsPanelTypographyDropList';
import { Scrollbars } from '@midasit-dev/moaui';
import ComponentsDialogHelpIconButton from './Components/ComponentsDialogHelpIconButton';
import { midasAPI } from "./Function/Common";
import { VerifyUtil, VerifyDialog } from "@midasit-dev/moaui";
import ExcelJS from 'exceljs';  
import { saveAs } from 'file-saver';
import { join, join_factor } from './utils/joinUtils';

function App() {
const [selectedLoadCombinationIndex, setSelectedLoadCombinationIndex] = useState(-1);
const [typeDropdownIndex, setTypeDropdownIndex] = useState(-1); 
const [showDialog, setDialogShowState] = React.useState(false);
const [inputValue, setInputValue] = useState('');
const fileInputRef = useRef(null); 
const [loadCaseDropdownIndex, setLoadCaseDropdownIndex] = useState(-1);
const [signDropdownIndex, setSignDropdownIndex] = useState(null);
const [editingFactor, setEditingFactor] = useState({ index: null, factor: null });
const [selectedDropListValue, setSelectedDropListValue] = useState(1);
const [isAddingLoadCase, setIsAddingLoadCase] = useState(false);
const [isDeletingRow, setIsDeletingRow] = useState(false);
const [civilComEnv, setCivilComeEnv] = useState({ "Assign": {} });
const [civilCom, setCivilCom] = useState({ "Assign": {} });
const [civilComEnvValues, setCivilComEnvValues] = useState({ "Assign": {} });
const [values, setValues] = useState({
  "Generate envelop load combinations in midas": false,
  "Generate inactive load combinations in midas": false,
});
let [all_loadCaseNames,setall_loadCaseNames] = useState([]);
const [exportLoading, setExportLoading] = useState(false);
const [importLoading, setImportLoading] = useState(false);
const [isGenerating, setIsGenerating] = useState(false);
const { enqueueSnackbar } = useSnackbar();


  const toggleLoadCaseDropdown = (index) => {
    setLoadCaseDropdownIndex(loadCaseDropdownIndex === index ? -1 : index);
  };
  const toggleSignDropdown = (index) => {
    setSignDropdownIndex(signDropdownIndex === index ? null : index);
  };
    
  const handleLoadCaseOptionSelect = (loadCombinationIndex, loadCaseIndex, selectedLoadCase) => {
    if (
      loadCombinationIndex === null || 
      loadCaseIndex === null || 
      !Array.isArray(loadCombinations) || 
      !loadCombinations[loadCombinationIndex] || 
      !Array.isArray(loadCombinations[loadCombinationIndex].loadCases) || 
      !loadCombinations[loadCombinationIndex].loadCases[loadCaseIndex]
    ) {
      // console.error("Invalid loadCombinationIndex or loadCaseIndex.");
      return;
    }
  
    const updatedLoadCombinations = [...loadCombinations];
    updatedLoadCombinations[loadCombinationIndex].loadCases[loadCaseIndex].loadCaseName = selectedLoadCase || null; // Allow null value
    setLoadCombinations(updatedLoadCombinations);
    setLoadCaseDropdownIndex(-1);
  };
  
  const handleSignOptionSelect = (combinationIndex, caseIndex, sign) => {
    const updatedLoadCombinations = [...loadCombinations];
    updatedLoadCombinations[combinationIndex].loadCases[caseIndex].sign = sign;
    setLoadCombinations(updatedLoadCombinations);
    setSignDropdownIndex(null);
  };
  const handleFactorClick = (index, factor) => {
    setEditingFactor({ index, factor });
  };
  const handleDropListChange = (newValue) => {
    setSelectedDropListValue(newValue);
    console.log("Selected Value: ", newValue);
  };
  const handleFactorBlur = (combinationIndex, loadCaseIndex, factorKey, newValue) => {
    console.log('Updating:', {
      combinationIndex,
      loadCaseIndex,
      factorKey,
      newValue,
    });
    const trimmedValue = newValue.trim();
    const updatedValue = isNaN(parseFloat(trimmedValue)) ? undefined : parseFloat(trimmedValue);
  
    setLoadCombinations((prevLoadCombinations) => {
      const updatedCombinations = prevLoadCombinations.map((combination, cIndex) => {
        if (cIndex === combinationIndex) {
          const updatedLoadCases = combination.loadCases.map((loadCase, lcIndex) => {
            if (lcIndex === loadCaseIndex) {
              return {
                ...loadCase,
                [factorKey]: updatedValue,
              };
            }
            return loadCase;
          });
  
          return {
            ...combination,
            loadCases: updatedLoadCases,
          };
        }
        return combination;
      });
  
      return updatedCombinations;
    });
  };
let defaultLoadNames = [];
let defaultLoadNamesKey = [];


 let [loadNames, setLoadNames] = useState(defaultLoadNames);
 let [loadNames_key, setLoadNames_key] = useState(defaultLoadNamesKey);
 
  
    // Fetch load cases using useEffect
    useEffect(() => {
      (async function importLoadCases() {
        const initializeLoadNames = async () => {
          let stag = await midasAPI("GET", "/db/stag");
        
          if (stag && stag.hasOwnProperty("STAG")) {
            defaultLoadNames = [
              "Dead Load",
              "Tendon Primary",
              "Creep Primary",
              "Shrinkage Primary",
              "Tendon Secondary",
              "Creep Secondary",
              "Shrinkage Secondary",
            ];
            defaultLoadNamesKey = defaultLoadNames.map(name => ({ key: "CS", name }));
          }
        }; 
        initializeLoadNames();
        let stct; let stldData; let smlc; let mvldid; let mvld; let mvldeu; let mvldch; let mvldbs; let mvldpl; let splc;
          // stag = await midasAPI("GET","/db/stag");
          stct = await midasAPI("GET", "/db/stct");
          stldData = await midasAPI("GET", "/db/stld");
          smlc = await midasAPI("GET", "/db/smlc");
          mvldid = await midasAPI("GET", "/db/mvldid");
          mvld = await midasAPI("GET", "/db/mvld");
          mvldch = await midasAPI("GET", "/db/mvldch");
          mvldeu = await midasAPI("GET", "/db/mvldeu");
          mvldbs = await midasAPI("GET", "/db/mvldbs");
          mvldpl = await midasAPI("GET", "/db/mvldpl");
          splc = await midasAPI("GET", "/db/splc");  //respose spectrum load cases
          const errorMessage = { error: { message: "client does not exist" } };
          const variables = [stct, stldData, smlc, mvldid, mvld, mvldch, mvldeu, mvldbs, mvldpl, splc];
          const allHaveError = variables.every(
            (variable) => JSON.stringify(variable) === JSON.stringify(errorMessage)
           );
           if (allHaveError) {
              enqueueSnackbar("client does not exist : Please connect with your Midas API", {
                    variant: "error",
                    anchorOrigin: { vertical: "top", horizontal: "center" },
                  })
            return;
           }
          let newLoadNames = [...defaultLoadNames];
          const newLoadCasesWithKeys = [...defaultLoadNamesKey];
          if (stct && stct.STCT) {
            for (const key in stct.STCT) {
              const item = stct.STCT[key];
              if (item.vEREC) {
                item.vEREC.forEach((erec) => {
                  if (erec.LTYPECC) {
                    newLoadNames.push(erec.LTYPECC);
                    newLoadCasesWithKeys.push({ key: 'CS', name: erec.LTYPECC });
                  }
                });
              }
            }
          }
    
          if (stldData && Object.keys(stldData)[0].length > 0) {
            const stldKeys = Object.keys(stldData)[0];
            if (stldKeys && stldKeys.length > 0) {
              for (const key in stldData[stldKeys]) {
                if (stldData[stldKeys].hasOwnProperty(key)) {
                  const name = stldData[stldKeys][key].NAME;
                  newLoadNames.push(name);
                  newLoadCasesWithKeys.push({ key: 'ST', name });
                }
              }
            }
          }
    
          // Process SMLC
          if (smlc && smlc.SMLC) {
            for (const key in smlc.SMLC) {
              const item = smlc.SMLC[key];
              if (item.NAME) {
                newLoadNames.push(item.NAME);
                newLoadCasesWithKeys.push({ key: 'SM', name: item.NAME });
              }
            }
          }
    
          // Process MVLDID
          if (mvldid && mvldid.MVLDID) {
            for (const key in mvldid.MVLDID) {
              if (mvldid.MVLDID.hasOwnProperty(key)) {
                const item = mvldid.MVLDID[key];
                if (item && item.LCNAME) {
                  newLoadNames.push(item.LCNAME);
                  newLoadCasesWithKeys.push({ key: 'MV', name: item.LCNAME });
                }
              }
            }
          }
        if (mvld && mvld.MVLD) {
          for (const key in mvld.MVLD) {
            if (mvld.MVLD.hasOwnProperty(key)) {
              const item = mvld.MVLD[key];
              if (item && item.LCNAME) {
                newLoadNames.push(item.LCNAME);
                newLoadCasesWithKeys.push({ key: 'MV', name: item.LCNAME });
              }
            }
          }
        }
        if (mvldch && mvldch.MVLDCH) {
          for (const key in mvldch.MVLDCH) {
            if (mvldch.MVLDCH.hasOwnProperty(key)) {
              const item = mvldch.MVLDCH[key];
              if (item && item.LCNAME) {
                newLoadNames.push(item.LCNAME);
                newLoadCasesWithKeys.push({ key: 'MV', name: item.LCNAME });
              }
            }
          }
        }
        if (mvldeu && mvldeu.MVLDEU) {
          for (const key in mvldeu.MVLDEU) {
            if (mvldeu.MVLDEU.hasOwnProperty(key)) {
              const item = mvldeu.MVLDEU[key];
              if (item && item.LCNAME) {
                newLoadNames.push(item.LCNAME);
                newLoadCasesWithKeys.push({ key: 'MV', name: item.LCNAME });
              }
            }
          }
        }

        // Process MVLDBS and store keys with names
        if (mvldbs && mvldbs.MVLDBS) {
          for (const key in mvldbs.MVLDBS) {
            if (mvldbs.MVLDBS.hasOwnProperty(key)) {
              const item = mvldbs.MVLDBS[key];
              if (item && item.LCNAME) {
                newLoadNames.push(item.LCNAME);
                newLoadCasesWithKeys.push({ key: 'MV', name: item.LCNAME });
              }
            }
          }
        }

        // Process MVLDPL and store keys with names
        if (mvldpl && mvldpl.MVLDPL) {
          for (const key in mvldpl.MVLDPL) {
            if (mvldpl.MVLDPL.hasOwnProperty(key)) {
              const item = mvldpl.MVLDPL[key];
              if (item && item.LCNAME) {
                newLoadNames.push(item.LCNAME);
                newLoadCasesWithKeys.push({ key: 'MV', name: item.LCNAME });
              }
            }
          }
        }

        // Process SPLC and store keys with names
        if (splc && splc.SPLC) {
          for (const key in splc.SPLC) {
            const item = splc.SPLC[key];
            if (item.NAME) {
              newLoadNames.push(item.NAME);
              newLoadCasesWithKeys.push({ key: 'RS', name: item.NAME });
            }
          }
        }
        newLoadNames = newLoadNames.filter((name) => name !== undefined);

        if (!errorMessage) {
        if (JSON.stringify(newLoadNames) === JSON.stringify(loadNames)) {
          enqueueSnackbar("Please define load cases", {
            variant: "error",
            anchorOrigin: { vertical: "top", horizontal: "center" },
          });
          return;
        } }
          setLoadNames(newLoadNames);
          setLoadNames_key(newLoadCasesWithKeys);
      })();
    }, []); // Empty dependency array to run once on mount
    console.log(loadNames);
    console.log(loadNames_key);

function importLoadCombinationInput(data) {
  setLoadCombinations(data);
}
  const handleLoadCombinationClick = (index) => {
    console.log("index", index)
    setSelectedLoadCombinationIndex(index);
  };
  console.log(selectedDropListValue);
 const exportToExcel = () => {
  setExportLoading(true);
  try {
    // Remove duplicates from loadNames
    loadNames = Array.from(new Set(loadNames));
    console.log(loadNames, civilCom, loadCombinations);

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Load Combinations');

    // Set column widths
    worksheet.getColumn('A').width = 25;
    worksheet.getColumn('D').width = 30;

    // Add headers to the first row
    const headers = [
      'Load Combination', 'Active', 'Type', 'Load Cases', 'Sign',
      'Factor 1', 'Factor 2', 'Factor 3', 'Factor 4', 'Factor 5'
    ];
    headers.forEach((header, idx) => {
      worksheet.getCell(1, idx + 1).value = header;
    });
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).alignment = { horizontal: 'center', vertical: 'middle' };

    let rowIndex = 2;
    let alternateColorToggle = true;

    loadCombinations.forEach((combination) => {
      const { loadCombination, active, type, loadCases } = combination;
      const numberOfLoadCases = loadCases.length;
      const startRow = rowIndex;
      const endRow = rowIndex + numberOfLoadCases - 1;

      // Alternate row background color
      const backgroundColor = alternateColorToggle ? 'FFCCFFCC' : 'FFD3D3D3';
      for (let i = startRow; i <= endRow; i++) {
        worksheet.getRow(i).eachCell((cell) => {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: backgroundColor },
          };
        });
      }
      alternateColorToggle = !alternateColorToggle;

      // Merge and set values for Load Combination, Active, Type columns
      worksheet.mergeCells(`A${startRow}:A${endRow}`);
      worksheet.getCell(`A${startRow}`).value = loadCombination;
      worksheet.getCell(`A${startRow}`).alignment = { horizontal: 'center', vertical: 'middle' };

      worksheet.mergeCells(`B${startRow}:B${endRow}`);
      worksheet.getCell(`B${startRow}`).value = active;
      worksheet.getCell(`B${startRow}`).alignment = { horizontal: 'center', vertical: 'middle' };

      worksheet.mergeCells(`C${startRow}:C${endRow}`);
      worksheet.getCell(`C${startRow}`).value = type;
      worksheet.getCell(`C${startRow}`).alignment = { horizontal: 'center', vertical: 'middle' };

        // Write each load case row and apply borders
      for (let i = 0; i < loadCases.length; i++) {
        const loadCase = loadCases[i];
        const excelRow = worksheet.getRow(rowIndex);

        worksheet.getCell(`D${rowIndex}`).value = loadCase.loadCaseName;
        worksheet.getCell(`E${rowIndex}`).value = loadCase.sign;
        worksheet.getCell(`F${rowIndex}`).value = loadCase.factor1 !== undefined ? loadCase.factor1 : '';
        worksheet.getCell(`G${rowIndex}`).value = loadCase.factor2 !== undefined ? loadCase.factor2 : '';
        worksheet.getCell(`H${rowIndex}`).value = loadCase.factor3 !== undefined ? loadCase.factor3 : '';
        worksheet.getCell(`I${rowIndex}`).value = loadCase.factor4 !== undefined ? loadCase.factor4 : '';
        worksheet.getCell(`J${rowIndex}`).value = loadCase.factor5 !== undefined ? loadCase.factor5 : '';

        // Add outer border to each cell in the row
        for (let col = 1; col <= 10; col++) {
          worksheet.getCell(rowIndex, col).border = {
            top: { style: 'thin' }, // Top border thicker for first row of combination
            // left: { style: 'thin' },
            bottom: { style:'thin' }, // Bottom border thicker for last row
            // right: { style: 'thin' }
          };
        }
        rowIndex++;
      }

      // Add a thicker border below each combination for separation
      for (let col = 1; col <= 10; col++) {
        worksheet.getCell(endRow, col).border = {
          ...worksheet.getCell(endRow, col).border,
          bottom: { style: 'thin' }
        };
      }
    });

    // Save the workbook as an Excel file
    workbook.xlsx.writeBuffer()
      .then((buffer) => {
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        saveAs(blob, 'Load_Combination_Input.xlsx');
      })
      .catch((err) => {
        console.error('Error creating Excel file:', err);
      });
  } catch (error) {
    console.error("Error exporting:", error);
  } finally {
    setExportLoading(false);
  }
};
 
function getLoadCaseFactors(loadCaseName, combinations) {
  const cleanedLoadCaseName = loadCaseName.replace(/\s*\((CB|ST|CS|CBC|MV|RS|CBR|CBSC|CBS)\)$/, '');
  for (const combo of combinations) {
    if (cleanedLoadCaseName === combo?.loadCombination) {
      return combo;
    }
  }
  return null;
}  
function handleSignCases(sign, loadCase, factor) {  
  const result = [];
  if (sign === "+") {
    result.push({ name: loadCase.loadCaseName, sign: "+", factor });
  } else if (sign === "-") {
    result.push({ name: loadCase.loadCaseName, sign: "-", factor });   
  } else if (sign === "±") {
    result.push(
      { name: loadCase.loadCaseName, sign: "+", factor },
      { name: loadCase.loadCaseName, sign: "-", factor }
    );
  }
  return result;
}
// Helper function to create an n-dimensional array
function createNDimensionalArray(dimensions, fillValue = undefined) {
  if (dimensions <= 0) return fillValue;
  return new Array(5).fill(undefined).map(() => createNDimensionalArray(dimensions - 1, fillValue));
}

function createCombinations(type,loadCases, strengthCombination, combinations, loadNames, result, value, factor, sign, dimension = 1, factorIndexArray = []) {
  let factorArray = createNDimensionalArray(dimension);
  const cleanedLoadCaseName = loadCases.loadCaseName.replace(/\s*\((CB|ST|CS|CBC|MV|SM|RS|CBR|CBSC|CBS)\)$/, '');
  if (loadNames.includes(cleanedLoadCaseName) || 
  (type === "Envelope" && getLoadCaseFactors(loadCases.loadCaseName, combinations)?.type === "Add")) {
    for (let i = 1; i <= 5; i++) {
      const factorKey = `factor${i}`; let multipliedFactor;
      if (dimension === 1) {
         multipliedFactor = loadCases[factorKey];
      } else {
         multipliedFactor = loadCases[factorKey] * value;
      }
      if (i === factor) {
        multipliedFactor = loadCases[factorKey] !== undefined && loadCases[factorKey] !== "" ? multipliedFactor : 1;
      }
 if (dimension === 1) {
  // In 1D array, we simply set the value at the first index
  setFactorArrayValue(factorArray, multipliedFactor, 1, dimension, [i - 1]);
}
else if (dimension === 2) {
  setFactorArrayValue(factorArray, multipliedFactor, 1, dimension, [i - 1, factor - 1]);
}

else if (dimension > 2) {
  let previousFactorArray = [...factorIndexArray]; 
  previousFactorArray.pop(); 
  let previousFactor = previousFactorArray.length > 0 
    ? previousFactorArray 
    : [i - 1]; 
  const indices = [i - 1, factor - 1].concat(
    new Array(dimension - 2).fill(previousFactor[previousFactor.length - 1] - 1)
  );
  setFactorArrayValue(factorArray, multipliedFactor, 1, dimension, indices);
}
}
    const loadCaseObj = {
      loadCaseName: loadCases.loadCaseName,
      sign: sign,
      factor: factorArray
    };
    if (!result["Add"]) {
      result["Add"] = [];
    }
    result["Add"].push(loadCaseObj);
  } else {  
    const modifyName = getLoadCaseFactors(loadCases?.loadCaseName, combinations);
    const newLoadCases = combinations.find(combo => combo?.loadCombination === modifyName?.loadCombination);
    if (newLoadCases && Array.isArray(newLoadCases.loadCases)) {
      if (newLoadCases.type === "Either") {
        result["Either"] = result["Either"] || [];
        const eitherResult = [];
        for (let factorIndex = 1; factorIndex <= 5; factorIndex++) {
          const tempArray = [];
          newLoadCases.loadCases.forEach(eitherLoadCase => {
            let currentFactorValue;
           if (eitherLoadCase.hasOwnProperty('factor')) {
              currentFactorValue = eitherLoadCase.factor[0][factorIndex - 1];
            } else {
               currentFactorValue = eitherLoadCase[`factor${factorIndex}`];
            }
            if (currentFactorValue === undefined && eitherLoadCase[`factor${factorIndex}`] !== undefined) {
              currentFactorValue = eitherLoadCase[`factor${factorIndex}`];
            };
            if (currentFactorValue === undefined) return;
            const newSign = multiplySigns(sign, eitherLoadCase.sign || '+');
            const eitherLoadCaseName = eitherLoadCase.loadCaseName.replace(/\s*\((CB|ST|CS|CBC|MV|SM|RS|CBR|CBSC|CBS)\)$/, '');
            if (loadNames.includes(eitherLoadCaseName)) {
              if (factorIndex === 1) {
                factorArray = createNDimensionalArray(dimension);
                for (let i = 1; i <= 5; i++) {
                  let factorKey;
if (eitherLoadCase.hasOwnProperty('factor') && Array.isArray(eitherLoadCase.factor[0])) {
    factorKey = eitherLoadCase.factor[0][i - 1];
} else {
    factorKey = `factor${i}`;
}
let multipliedFactor;
if (typeof factorKey === "number") {
    multipliedFactor = factorKey * value;
} else {
  multipliedFactor = eitherLoadCase[factorKey] !== undefined && eitherLoadCase[factorKey] !== "" ? eitherLoadCase[factorKey] * value : undefined;
}

 // Handling dimension 1
 if (dimension === 1) {
  // In 1D array, we simply set the value at the first index
  setFactorArrayValue(factorArray, multipliedFactor, 1, dimension, [i - 1]);
}
// Handling dimension 2
else if (dimension === 2) {
  // In 2D array, set the value at the correct row and column (i-1, factor-1)
  setFactorArrayValue(factorArray, multipliedFactor, 1, dimension, [i - 1, factor - 1]);
}
// Handling dimensions greater than 2
else if (dimension > 2) {
  // Adjust for `n` dimensions
  let previousFactorArray = [...factorIndexArray]; // Create a shallow copy of the array
  previousFactorArray.pop(); // Remove the last value

  // Fill `previousFactor` array based on dimension - 2
  let previousFactor = previousFactorArray.length > 0 
    ? previousFactorArray 
    : [i - 1]; // If factorIndexArray is empty, use [i - 1] as default

  // Create indices, adjusting for `n` dimensions
  const indices = [i - 1, factor - 1].concat(
    new Array(dimension - 2).fill(previousFactor[previousFactor.length - 1] -1)
  );
  setFactorArrayValue(factorArray, multipliedFactor, 1, dimension, indices);
}
}
                const loadCaseObj = {
                  loadCaseName: eitherLoadCase.loadCaseName,
                  sign: newSign,
                  factor: factorArray
                };
                tempArray.push(loadCaseObj);
              }
            } else {
              createCombinations(
                type,
                eitherLoadCase,
                strengthCombination,
                combinations,
                loadNames,
                tempArray,
                currentFactorValue * value,
                factorIndex,
                newSign,
                dimension + 1,
                [...factorIndexArray, factorIndex]
              );
            }
          });
          eitherResult.push(tempArray);
        }
        result["Either"].push(eitherResult);
      } else if (newLoadCases.type === "Add") {
        result["Add"] = result["Add"] || [];
        let addResult = [];
        for (let factorIndex = 1; factorIndex <= 5; factorIndex++) {
          let tempArray_add = [];
          newLoadCases.loadCases.forEach(addLoadCase => {
            let currentFactorValue;
           if (addLoadCase.hasOwnProperty('factor')) {
              currentFactorValue = addLoadCase.factor[0][factorIndex - 1];
            } else {
               currentFactorValue = addLoadCase[`factor${factorIndex}`];
            }
            if (currentFactorValue === undefined && addLoadCase[`factor${factorIndex}`] !== undefined) {
              currentFactorValue = addLoadCase[`factor${factorIndex}`];
            };
            if (currentFactorValue === undefined) return;
            const newSign = multiplySigns(sign, addLoadCase.sign || '+');
            const addLoadCaseName = addLoadCase.loadCaseName.replace(/\s*\((CB|ST|CS|CBC|MV|SM|RS|CBR|CBSC|CBS)\)$/, '');
            if (loadNames.includes(addLoadCaseName) || 
            (type === "Envelope" && getLoadCaseFactors(addLoadCase.loadCaseName, combinations)?.type === "Add")) {
              if (factorIndex === 1) {
                factorArray = createNDimensionalArray(dimension);
                for (let i = 1; i <= 5; i++) {
                  let factorKey;
if (addLoadCase.hasOwnProperty('factor') && Array.isArray(addLoadCase.factor[0])) {
    factorKey = addLoadCase.factor[0][i - 1];
} else {
    factorKey = `factor${i}`;
}
let multipliedFactor;
if (typeof factorKey === "number") {
    multipliedFactor = factorKey * value;
} else {
  multipliedFactor = addLoadCase[factorKey] !== undefined && addLoadCase[factorKey] !== "" ? addLoadCase[factorKey] * value : undefined;
}

      if (dimension === 1) {
        // In 1D array, we simply set the value at the first index
        setFactorArrayValue(factorArray, multipliedFactor, 1, dimension, [i - 1]);
      }
      else if (dimension === 2) {
        // In 2D array, set the value at the correct row and column (i-1, factor-1)
        setFactorArrayValue(factorArray, multipliedFactor, 1, dimension, [i - 1, factor - 1]);
      }
      else if (dimension > 2) {
        let previousFactorArray = [...factorIndexArray]; 
        previousFactorArray.pop(); 
        let previousFactor = previousFactorArray.length > 0 
          ? previousFactorArray 
          : [i - 1]; 
        const indices = [i - 1, factor - 1].concat(
          new Array(dimension - 2).fill(previousFactor[previousFactor.length - 1] -1)
        );
        setFactorArrayValue(factorArray, multipliedFactor, 1, dimension, indices);
      }
    }
                const loadCaseObj = {
                  loadCaseName: addLoadCase.loadCaseName,
                  sign: newSign,
                  factor: factorArray
                };
                tempArray_add.push(loadCaseObj);
              }
            } else {
              createCombinations(
                type,
                addLoadCase,
                strengthCombination,
                combinations,
                loadNames,
                tempArray_add,
                currentFactorValue * value,
                factorIndex,
                newSign,
                dimension + 1,// Increment dimension for recursive calls
                [...factorIndexArray, factorIndex] 
              );
            }
          });
          addResult.push(tempArray_add);
        }
        result["Add"].push(addResult);
      }else if (newLoadCases.type === "Envelope") {
        result["Envelope"] = result["Envelope"] || [];
        let envelopeResult = [];
        for (let factorIndex = 1; factorIndex <= 5; factorIndex++) {
          let tempArray_envelope = [];
          newLoadCases.loadCases.forEach(envelopeLoadCase => {
            let currentFactorValue;
            if (envelopeLoadCase.hasOwnProperty('factor')) {
               currentFactorValue = envelopeLoadCase.factor[0][factorIndex - 1];
             } else {
                currentFactorValue = envelopeLoadCase[`factor${factorIndex}`];
             }
             if (currentFactorValue === undefined && envelopeLoadCase[`factor${factorIndex}`] !== undefined) {
              currentFactorValue = envelopeLoadCase[`factor${factorIndex}`];
            };
             if (currentFactorValue === undefined) return;
            const newSign = multiplySigns(sign, envelopeLoadCase.sign || '+');
            if (loadNames.includes(envelopeLoadCase.loadCaseName.replace(/\s*\((CB|ST|CS|CBC|MV|SM|RS|CBR|CBSC|CBS)\)$/, ''))) {
              if (factorIndex === 1) {
                factorArray = createNDimensionalArray(dimension);
                for (let i = 1; i <= 5; i++) {
                  let factorKey;
                  if (envelopeLoadCase.hasOwnProperty('factor') && Array.isArray(envelopeLoadCase.factor[0])) {
                      factorKey = envelopeLoadCase.factor[0][i - 1];
                  } else {
                      factorKey = `factor${i}`;
                  }
                  let multipliedFactor;
                  if (typeof factorKey === "number") {
                      multipliedFactor = factorKey * value;
                  } else {
                    multipliedFactor = envelopeLoadCase[factorKey] !== undefined && envelopeLoadCase[factorKey] !== "" ? envelopeLoadCase[factorKey] * value : undefined;
                  }
                  if (dimension === 1) {
                    setFactorArrayValue(factorArray, multipliedFactor, 1, dimension, [i - 1]);
                  } else if (dimension === 2) {
                    setFactorArrayValue(factorArray, multipliedFactor, 1, dimension, [i - 1, factor - 1]);
                  } else if (dimension > 2) {
                    let previousFactorArray = [...factorIndexArray];
                    previousFactorArray.pop();
                    let previousFactor = previousFactorArray.length > 0 ? previousFactorArray : [i - 1];
                    const indices = [i - 1, factor - 1].concat(
                      new Array(dimension - 2).fill(previousFactor[previousFactor.length - 1] - 1)
                    );
                    setFactorArrayValue(factorArray, multipliedFactor, 1, dimension, indices);
                  }
                }
                const loadCaseObj = {
                  loadCaseName: envelopeLoadCase.loadCaseName,
                  sign: newSign,
                  factor: factorArray
                };
                tempArray_envelope.push(loadCaseObj);
              }
            } else {
              createCombinations(
                type,
                envelopeLoadCase,
                strengthCombination,
                combinations,
                loadNames,
                tempArray_envelope,
                currentFactorValue * value,
                factorIndex,
                newSign,
                dimension + 1,
                [...factorIndexArray, factorIndex]
              );
            }
          });
          envelopeResult.push(tempArray_envelope);
        }
        result["Envelope"].push(envelopeResult);
      }
    }
  }
  console.log(factorIndexArray);
  console.log(result);  
  return result;
}
function setFactorArrayValue(factorArray, multipliedFactor, currentDimension, maxDimension, indices) {
  if (currentDimension === maxDimension) {
    factorArray[indices[0]] = multipliedFactor;
  } else {
    let nextArray = factorArray[indices[0]];
    setFactorArrayValue(nextArray, multipliedFactor, currentDimension + 1, maxDimension, indices.slice(1));
  }
}

function multiplySigns(sign1, sign2) {
  // Handle basic sign multiplication
  if ((sign1 === '+' && sign2 === '+') || (sign2 === '+' && sign1 === '+')) return '+';
  if ((sign1 === '+' && sign2 === '-') || (sign2 === '+' && sign1 === '-')) return '-';
  if ((sign1 === '-' && sign2 === '+') || (sign2 === '-' && sign1 === '+')) return '-';
  if ((sign1 === '-' && sign2 === '-') || (sign2 === '-' && sign1 === '-')) return '+';

  // Handle combinations with +,-
  if ((sign1 === '+,-' && sign2 === '+') || (sign2 === '+,-' && sign1 === '+')) return '+,-';
  if ((sign1 === '+,-' && sign2 === '-') || (sign2 === '+,-' && sign1 === '-')) return '-,+';
  if ((sign1 === '-' && sign2 === '+,-') || (sign2 === '-' && sign1 === '+,-')) return '-,+';
  if ((sign1 === '+,-' && sign2 === '+,-')) return '+,-';

  // Handle combinations with -,+
  if ((sign1 === '-,+' && sign2 === '+') || (sign2 === '-,+' && sign1 === '+')) return '-,+';
  if ((sign1 === '-,+' && sign2 === '-') || (sign2 === '-,+' && sign1 === '-')) return '+,-';
  if ((sign1 === '+' && sign2 === '-,+') || (sign2 === '+' && sign1 === '-,+')) return '+,-';
  if ((sign1 === '-' && sign2 === '-,+') || (sign2 === '-' && sign1 === '-,+')) return '+,-';
  if ((sign1 === '+,-' && sign2 === '-,+') || (sign2 === '+,-' && sign1 === '-,+')) return '+,-';
  if ((sign1 === '-,+' && sign2 === '+,-') || (sign2 === '-,+' && sign1 === '+,-')) return '+,-';
  if ((sign1 === '-,+' && sign2 === '-,+')) return '+,-';

  // Handle combinations with ±
  if ((sign1 === '±' && sign2 === '+') || (sign2 === '±' && sign1 === '+')) return '±'; // ± * + = ±
  if ((sign1 === '±' && sign2 === '-') || (sign2 === '±' && sign1 === '-')) return '∓'; // ± * - = ∓
  if ((sign1 === '±' && sign2 === '+,-') || (sign2 === '±' && sign1 === '+,-')) return '±'; // ± * +,- = ±
  if ((sign1 === '±' && sign2 === '-,+') || (sign2 === '±' && sign1 === '-,+')) return '∓'; // ± * -,+ = ∓
  if (sign1 === '±' && sign2 === '±') return '±'; // ± * ± = ±
  if (sign1 === '±' && sign2 === '∓') return '∓'; // ± * ∓ = ∓

  // Handle combinations with ∓ (inverse of ±)
  if ((sign1 === '∓' && sign2 === '+') || (sign2 === '∓' && sign1 === '+')) return '∓'; // ∓ * + = ∓
  if ((sign1 === '∓' && sign2 === '-') || (sign2 === '∓' && sign1 === '-')) return '±'; // ∓ * - = ±
  if ((sign1 === '∓' && sign2 === '+,-') || (sign2 === '∓' && sign1 === '+,-')) return '∓'; // ∓ * +,- = ∓
  if ((sign1 === '∓' && sign2 === '-,+') || (sign2 === '∓' && sign1 === '-,+')) return '±'; // ∓ * -,+ = ±
  if (sign1 === '∓' && sign2 === '±') return '∓'; 
  if (sign1 === '∓' && sign2 === '∓') return '±'; 
  return '+';
}
function combineAddEither(inputObj) {
  let eitherArray = []; 
  let addObj = []; 
  let envelopeObj = [];
  let firstKey = null; 
  let secondLastKey = null;
  let lastvalue = [];
  function processObject(obj, parentKey = null) {
    if (Array.isArray(obj)) {
      obj.forEach((value) => {
        if (typeof value === 'object' && value !== null) {
          processKeyValuePairs(value, parentKey);
    }
      });}
    else {
      processKeyValuePairs(obj, parentKey);
    }
  }
  function processKeyValuePairs(obj, parentKey, keyStack = []) {
    // Maintain a stack to track the hierarchy of keys
    if (parentKey) keyStack.push(parentKey);
  
    // Loop through each key-value pair in the object
    for (const [key, value] of Object.entries(obj)) {
      if (!firstKey) {
        firstKey = key;
      }
  
      // Update parentKey if the current key is "Add", "Either", or "Envelope"
      if (key === "Add" || key === "Either" || key === "Envelope") {
        parentKey = key;
        keyStack.push(key);
      }
      if (keyStack.length > 1) {
        lastvalue.push(keyStack[keyStack.length - 2]);
      }
  
      if (Array.isArray(value)) {
        let temp = [];
        value.forEach((subArrayOrItem) => {
          if (Array.isArray(subArrayOrItem)) {
            subArrayOrItem.forEach((item) => {
              if (typeof item === "object" && item !== null && Object.keys(item).length > 0) {
                const specialKeys = Object.keys(item).filter(key =>
                  key === "Add" || key === "Either" || key === "Envelope"
                );
                const regularKeys = Object.keys(item).filter(key =>
                  key !== "Add" && key !== "Either" && key !== "Envelope"
                );
                specialKeys.forEach(specialKey => {
                  const specialItem = {
                    [specialKey]: item[specialKey],
                    parentKeys: [...keyStack],
                  };
                  processKeyValuePairs(specialItem, parentKey, [...keyStack]);
                });
                if (regularKeys.length > 0) {
                  const regularItem = {};
                  regularKeys.forEach(key => {
                    regularItem[key] = item[key];
                  });
  
                  const combinedItem = {
                    ...regularItem,
                    specialKeys: specialKeys.map(specialKey => ({
                      [specialKey]: item[specialKey],
                    parentKeys: [...keyStack], 
                    }))
                  };
  
                  if (parentKey == "Either") {
                    temp.push({
                      ...regularItem,
                      ...combinedItem,
                      previousKey: keyStack.length > 1 ? keyStack[keyStack.length - 2] : null,
                    });
                  } else {
                    temp.push({
                      ...regularItem,
                      ...combinedItem,
                      previousKey: keyStack.length > 1 ? keyStack[keyStack.length - 3] : null,
                    });
                  }
                }
              }
            });
          } else if (typeof subArrayOrItem === "object" && subArrayOrItem !== null) {
            const hasSpecialKeys = Object.keys(subArrayOrItem).some(key =>
              key === "Add" || key === "Either" || key === "Envelope"
            );
  
            if (hasSpecialKeys) {
              const specialKeys = Object.keys(subArrayOrItem).filter(key =>
                key === "Add" || key === "Either" || key === "Envelope"
              );
              const regularKeys = Object.keys(subArrayOrItem).filter(key =>
                key !== "Add" && key !== "Either" && key !== "Envelope"
              );
  
              const specialItem = {};
              specialKeys.forEach(key => {
                specialItem[key] = subArrayOrItem[key];
                specialItem.parentKeys = [...keyStack];
              });
  
              const regularItem = {};
              regularKeys.forEach(key => {
                regularItem[key] = subArrayOrItem[key];
              });
  
              temp.push({
                ...specialItem,
                ...regularItem,
                previousKey: keyStack.length > 1 ? keyStack[keyStack.length - 3] : null,   
              });
            } else {
              temp.push({
                ...subArrayOrItem,
                previousKey: keyStack.length > 1 ? keyStack[keyStack.length - 3] : null,
              });
            }
          }
        });
  
        console.log("lastvalue", lastvalue);
        secondLastKey = keyStack.length > 1 ? keyStack[keyStack.length - 2] : null;
  
        if (parentKey === "Either" || (parentKey === "Add" && firstKey === "Either" && secondLastKey !== "Either") && temp.length > 0) {
          eitherArray.push(temp);
        } else if (parentKey === "Add" && (!firstKey || firstKey === "Add" || firstKey === "Envelope" || secondLastKey === "Either") && temp.length > 0) {
          addObj.push(temp);
        } else if (parentKey === "Envelope" || (parentKey === "Add" && firstKey === "Envelope") && temp.length > 0) {
          envelopeObj.push(temp);   
        }
      } else if (typeof value === "object" && value !== null) {
        processObject(value, key, [...keyStack]);
      }
    }
    if (parentKey) keyStack.pop();
  }

  
function arraysAreEqual(arr1, arr2) {
  if (arr1.length !== arr2.length) return false;
  for (let i = 0; i < arr1.length; i++) {
      if (arr1[i] !== arr2[i]) return false;
  }
  return true;
}

function multipleFactor(input) {
  const addObj = [];

  input.forEach((subArray, subArrayIndex) => {
    let tempArray = []; 
    let loadCaseNames = []; 
    let additionalArray = []; 

    subArray.forEach((item, itemIndex) => {
      if (item === null) return;
      tempArray = [];
      let temp = [];
      let previousKey = item.previousKey || null; // Retrieve the previousKey

      if (typeof item === "object" && item !== null && Object.keys(item).length > 0) {
        Object.keys(item).forEach((key) => {
          if (key === "specialKeys") {
            temp.push({
              specialKeys: item.specialKeys, 
              previousKey,
            });
          } else if (!isNaN(Number(key))) {
            if (item[key] && item[key].loadCaseName && item[key].sign && item[key].factor) {
              loadCaseNames.push(item[key].loadCaseName);
              temp.push({
                loadCaseName: item[key].loadCaseName,
                sign: item[key].sign,
                factor: item[key].factor,
                previousKey, // Add previousKey to each entry
              });
            }
          } else {
            if (item.loadCaseName && item.sign && item.factor) {
              function cleanFactorValues(factor) {
                if (Array.isArray(factor)) {
                  return factor.map((value) => (Array.isArray(value) ? cleanFactorValues(value) : (isNaN(value) ? undefined : value)));
                }
                return isNaN(factor) ? undefined : factor;
              }
              
              if (Array.isArray(item.factor)) {
                // Ensure factor values are numbers or undefined in multi-dimensional arrays
                item.factor = cleanFactorValues(item.factor);
              }
              temp.push({
                loadCaseName: item.loadCaseName,
                sign: item.sign,
                factor: item.factor,
                previousKey,
              });
            }
          }
        });
      }
      tempArray.push(temp);

      for (let nextIndex = itemIndex + 1; nextIndex < subArray.length; nextIndex++) {
        let nextItem = subArray[nextIndex];
        if (nextItem === null) continue;

        let loadCaseName_temp = [];
        if (typeof nextItem === "object" && nextItem !== null && Object.keys(nextItem).length > 0) {
          Object.keys(nextItem).forEach((nextKey) => {
            if (nextItem[nextKey] && nextItem[nextKey].loadCaseName) {
              loadCaseName_temp.push(nextItem[nextKey].loadCaseName);
            }
          });
        }
        if (arraysAreEqual(loadCaseNames, loadCaseName_temp) && loadCaseNames.length > 0 && loadCaseName_temp.length > 0) {
          let matchArray = [];
          temp = [];
          Object.keys(nextItem).forEach((nextKey) => {
            if (
              nextItem[nextKey] &&
              nextItem[nextKey].loadCaseName &&
              nextItem[nextKey].sign &&
              nextItem[nextKey].factor
            ) {
              temp.push({
                loadCaseName: nextItem[nextKey].loadCaseName,
                sign: nextItem[nextKey].sign,
                factor: nextItem[nextKey].factor,
                previousKey: nextItem.previousKey || null, // Preserve the next item's previousKey
              });
            }
          });
          tempArray.push(temp);
          subArray[nextIndex] = null;
        }
      }

      for (let nextSubArrayIndex = subArrayIndex + 1; nextSubArrayIndex < input.length; nextSubArrayIndex++) {
        let nextSubArray = input[nextSubArrayIndex];

        nextSubArray.forEach((nextItem, nextItemIndex) => {
          if (nextItem === null) return;

          let loadCaseName_temp = [];
          if (typeof nextItem === "object" && nextItem !== null && Object.keys(nextItem).length > 0) {
            Object.keys(nextItem).forEach((nextKey) => {
              if (nextItem[nextKey] && nextItem[nextKey].loadCaseName) {
                loadCaseName_temp.push(nextItem[nextKey].loadCaseName);
              }
            });
          }

          if (arraysAreEqual(loadCaseNames, loadCaseName_temp) && loadCaseNames.length > 0 && loadCaseName_temp.length > 0) {
            let matchArray = [];
            temp = [];
            Object.keys(nextItem).forEach((nextKey) => {
              if (
                nextItem[nextKey] &&
                nextItem[nextKey].loadCaseName &&
                nextItem[nextKey].sign &&
                nextItem[nextKey].factor
              ) {
                temp.push({
                  loadCaseName: nextItem[nextKey].loadCaseName,
                  sign: nextItem[nextKey].sign,
                  factor: nextItem[nextKey].factor,
                  previousKey: nextItem.previousKey || null, // Preserve the next item's previousKey
                });
              }
            });
            tempArray.push(temp);
            nextSubArray[nextItemIndex] = null;
          }
        });
      }
      additionalArray.push(tempArray);
      loadCaseNames = [];
    });
    addObj.push(additionalArray.length > 0 ? additionalArray : tempArray);
  });
  return addObj;
}
processObject(inputObj);
console.log(eitherArray);
console.log(addObj);
eitherArray = multipleFactor(eitherArray);
addObj = multipleFactor(addObj);
envelopeObj = multipleFactor(envelopeObj);
console.log({ firstKey, addObj, eitherArray, envelopeObj });  
return { secondLastKey, firstKey, eitherArray, addObj , envelopeObj };
}

function findStrengthCombinations(combinations, filteredCombinations) {
  let strengthCombinations = [];
  if (filteredCombinations.length > 0) {
    filteredCombinations.forEach((filteredObj) => {
      let new_combo = [];
      combinations.forEach((combo) => {
        if (
          combo.active === filteredObj.active &&
          combo.loadCombination === filteredObj.loadCombination &&
          combo.type === filteredObj.type &&
          filteredObj.loadCases.every((filteredLoadCase, i) => 
            filteredLoadCase.loadCaseName === combo.loadCases[i].loadCaseName &&
            filteredLoadCase.sign === combo.loadCases[i].sign &&
            filteredLoadCase.factor1 === combo.loadCases[i].factor1 &&
            filteredLoadCase.factor2 === combo.loadCases[i].factor2 &&
            filteredLoadCase.factor3 === combo.loadCases[i].factor3 &&
            filteredLoadCase.factor4 === combo.loadCases[i].factor4 &&
            filteredLoadCase.factor5 === combo.loadCases[i].factor5 
          )
        ) {
          new_combo.push(combo);
        }
      });
      const indexOfFilteredCombination = combinations.findIndex((combo) =>
        new_combo.includes(combo)
      );
      if (indexOfFilteredCombination !== -1) {
        combinations.slice(0, indexOfFilteredCombination).forEach((combo) => {
          strengthCombinations.push(combo); 
        });
      }
    });
  }
  if (values["Generate inactive load combinations in midas"]) {
    combinations.filter(combo => 
      combo?.active === "Strength" || combo?.active === "Service" || combo?.active === "Inactive"
    ).forEach((combo) => {
      strengthCombinations.push(combo); // Push each filtered combo
    });
  } else {
    combinations.filter(combo => 
      combo?.active === "Strength" || combo?.active === "Service"
    ).forEach((combo) => {
      strengthCombinations.push(combo); // Push each filtered combo
    });
  }
  return strengthCombinations; 
}

async function generateBasicCombinations(loadCombinations) {
  const filteredCombinations = loadCombinations.filter(
    (comb) =>
      (comb.active === "Service" || comb.active === "Strength" || comb.active === "Inactive") &&
      comb.type === "Envelope"
  );  
  let strengthCombinations = findStrengthCombinations(loadCombinations,filteredCombinations);
  strengthCombinations = [...strengthCombinations, ...filteredCombinations];
const service_combo = strengthCombinations
.filter(combination => combination.active === 'Service')
.map(combination => combination.loadCombination);
  console.log(service_combo); 
  strengthCombinations = strengthCombinations.filter((value, index, self) =>
    index === self.findIndex(t => 
      t.loadCombination === value.loadCombination && 
      t.active === value.active && 
      t.type === value.type && 
      JSON.stringify(t.loadCases) === JSON.stringify(value.loadCases)
    )
  );
  if (!strengthCombinations || strengthCombinations.length === 0) {
    if (values["Generate inactive load combinations in midas"]) {
    enqueueSnackbar("Please select at least one Load Combination of Strength/Service/Inactive Active type", {
      variant: "error",
      anchorOrigin: { vertical: "top", horizontal: "center" },
    });
  } else {
    enqueueSnackbar("Please select at least one Load Combination Strength/Service Active type", {
      variant: "error",
      anchorOrigin: { vertical: "top", horizontal: "center" },
    });
  } return;
  }
  const inactiveCombinations = loadCombinations.filter(combo => combo?.active === "Inactive");
  
  const loadCombinationValues = inactiveCombinations.map(combo => combo?.loadCombination);
  console.log("Inactive Load Combinations:", loadCombinationValues);
  if (strengthCombinations.length === 0) {
    console.error("No combinations with active set to 'Strength' found.");
  }
  let endpoint = '';
    let check = '';
    switch (selectedDropListValue) {
      case 1:
        endpoint = '/db/lcom-steel';
        check = 'LCOM-STEEL';
        break;
      case 2:
        endpoint = '/db/lcom-conc';
        check = 'LCOM-CONC';
        break;
      case 3:
        endpoint = '/db/lcom-src';
        check = 'LCOM-SRC';
        break;
      case 4:
        endpoint = '/db/lcom-stlcomp';
        check = 'LCOM-STLCOMP';
        break;
      default:
        console.error("Invalid selectedDropListValue:", selectedDropListValue);
        return;
    }

  const load_combo = await midasAPI("GET", endpoint,{});
  console.log(load_combo);
  let initial_lc = 0;
  if(load_combo && load_combo[check] && !load_combo[check].hasOwnProperty('message')){
    initial_lc = Object.keys(load_combo[check]).length;
  } 
  let allFinalCombinations = []; let allEnv = [];
  let combinationCounter = 0;   let env_count = 0;
  let last_value;   let backupCivilCom = { Assign: {} }; let backupCivilComev = { Assign: {} }; let backupCivilCom_env = { Assign: {} };
  for (const strengthCombination of strengthCombinations) {
    combinationCounter =  combinationCounter + allFinalCombinations.length + env_count;
    allFinalCombinations = [];
    
    const comb_name = strengthCombination.loadCombination;
    const type = strengthCombination.type;
    const factorArray = [];
    
     let joinedCombinations = [];
    for (let factor = 1; factor <= 5; factor++) {
      let new_combo = []; let result = [];  
      let factorCombinations = [];
      if (strengthCombination.loadCases.length === 0) {
        enqueueSnackbar("Please define Load Case for the selected Combination", {
          variant: "error",
          anchorOrigin: { vertical: "top", horizontal: "center" },
        });
        return; 
      }
      const loadCaseNames = new Set();
      for (const loadCase of strengthCombination.loadCases) {
        if (loadCaseNames.has(loadCase.loadCaseName)) {
          enqueueSnackbar("Duplicate Load Cases are not allowed in the same Combination", {
            variant: "error",
            anchorOrigin: { vertical: "top", horizontal: "center" },
          });
          return; 
        }
        if (loadCase.loadCaseName !== undefined && loadCase.loadCaseName !== "") {
        loadCaseNames.add(loadCase.loadCaseName);
        }
    }
    for (const loadCase of strengthCombination.loadCases) {
      if (!loadCase.loadCaseName && strengthCombination.loadCases.length === 1) {
        enqueueSnackbar("Please define Load Case for the selected Combination", {  
          variant: "error",
          anchorOrigin: { vertical: "top", horizontal: "center" },
        });
        return; 
    }
      const factors = [];
      for (let factor = 1; factor <= 5; factor++) {
        const factorKey = `factor${factor}`;
        if (factorKey in loadCase) {      
          const factorValue = loadCase[factorKey];
          factors.push({ factor, value: factorValue });
        } else {
          factors.push({ factor, value: 1 });
        }
        const allFactorsUndefined = factors.every(f => f.value === undefined || f.value === "");
        if (allFactorsUndefined) {
          const factor1 = factors.find(f => f.factor === 1);
          if (factor1) {
            factor1.value = 1;
          }
        }
      }
      console.log(factors);
      const factorObject = factors.find(f => f.factor === factor);
      if (factorObject && factorObject.value !== undefined  && factorObject.value !== "" && loadCase.loadCaseName !== undefined) {
      const loadCaseName = loadCase.loadCaseName.replace(/\s*\((CB|ST|CS|CBC|MV|SM|RS|CBR|CBSC|CBS)\)$/, '');
      // if (factor === 1) {
        if (loadNames.includes(loadCaseName)) {
          if (!result[type]) {
              result[type] = [];
          }
          let factors = Array(5).fill(0);
for (let i = 0; i < 5; i++) {
  if (i === factor - 1) {
    factors[i] = loadCase[`factor${i + 1}`] || 0;
  } else {
    factors[i] = 0;
  }
}
const nDimensionalArray = createNDimensionalArray(0, factors);
        if (!loadCase.hasOwnProperty('factor')) {
        loadCase['factor'] = undefined;
        }
        loadCase.factor = nDimensionalArray;
        new_combo.push(loadCase);
      }
      // } 
      if ((!loadNames.includes(loadCaseName))) {
          const sign = loadCase.sign || '+';
          const new_11 = createCombinations(type,loadCase, strengthCombination, loadCombinations, loadNames, [], factorObject.value, factor, sign);
          console.log(new_11);
          const result11 = combineAddEither([new_11]);
          console.log(result11);
          const finalCombinations_sign = permutation_sign(result11);
          console.log(finalCombinations_sign);
          const fact = join_factor(finalCombinations_sign);
          console.log(fact);
          factorCombinations.push(fact);
      }
      } 
    }
    if (new_combo.length > 0) {
    result[type].push([new_combo]);
    }
    if (Object.keys(result).length > 0) {
      console.log(result);
      const result11 = combineAddEither([result]);
      console.log(result11);
      const finalCombinations_sign = permutation_sign(result11);
      console.log(finalCombinations_sign);
      const fact = join_factor(finalCombinations_sign);
      console.log(fact);
      factorCombinations.push(fact);
      }
      factorArray.push(factorCombinations);
      console.log(result);
      console.log(factorArray); 
} 
for (const subArray of factorArray) {
  const joinedResult = join(subArray);
  joinedCombinations.push(joinedResult);
}
console.log(joinedCombinations);
    if (type === 'Add') {
      let joinedComb = [];
      function combineArrays(arrays, index = 0, currentCombination = []) {
        if (index === arrays.length) {
          joinedComb.push([...currentCombination]);
          return;
        }
        for (const subArray of arrays[index]) {
          currentCombination.push(...subArray);
          combineArrays(arrays, index + 1, currentCombination);
          currentCombination.length -= subArray.length;
        }
      }
      for (const subArray of joinedCombinations) {
      if  (subArray.length > 0) {
      const filteredSubArray = subArray.filter(arr => arr.length > 0);
      combineArrays(filteredSubArray);
       for (const comb of joinedComb) {
      // Check for deep equality using JSON.stringify
      if (!allFinalCombinations.some(existing => JSON.stringify(existing) === JSON.stringify(comb))) {
        allFinalCombinations.push(comb);
      }
    }
      joinedComb = []
      } 
    }
      allFinalCombinations.forEach((combArray, idx) => {
        const combinationName = `${comb_name}_${idx + 1}`;
        const active = loadCombinationValues.includes(comb_name) 
        ? "INACTIVE" 
        : service_combo.includes(comb_name) 
          ? "SERVICE"
          : "ACTIVE";
        let vCOMB = combArray.map((comb) => {
          const cleanedLoadCaseName = comb.loadCaseName.replace(/\s*\((CB|ST|CS|CBC|MV|SM|RS|CBR|CBSC|CBS)\)$/, '');
          const match = comb.loadCaseName.match(/\((CB|ST|CS|CBC|MV|SM|RS|CBR|CBSC|CBS)\)$/);
          const analysisType = match
    ? match[1] 
    : (() => {
        const matchingEntry = loadNames_key.find(entry => entry.name === comb.loadCaseName);
        return matchingEntry ? matchingEntry.key : "ST"; 
      })();
          return {
            "ANAL": analysisType,
            "LCNAME": cleanedLoadCaseName,
            "FACTOR": (comb.sign === "+" ? 1 : -1) * comb.factor 
          };
        });
        // console.log(`vCOMB for combination ${combinationName}:`, vCOMB);
        backupCivilCom.Assign[`${idx + 1 + combinationCounter + initial_lc}`] = {
          "NAME": combinationName,
          "ACTIVE": active,
          "bCB": false,
          "iTYPE": 0,
          "vCOMB": vCOMB
      };
      setCivilCom({ Assign: { ...backupCivilCom.Assign } });
      last_value = idx + 1 + combinationCounter ;
      });
  }
    if (type === "Either" || type === "Envelope") {
      const concatenatedArray = joinedCombinations.flat();
      console.log(concatenatedArray);
      concatenatedArray.forEach((combArray) => {
       combArray.forEach(subArray => {
    if (!allFinalCombinations.some(existing => JSON.stringify(existing) === JSON.stringify(subArray))) {
      allFinalCombinations.push(subArray);
    }
  });
      });
      if (type === "Envelope") {
        const manipulatedCombinations = [];
        let endpoint = '';
        switch (selectedDropListValue) {
          case 1:
            endpoint = 'CBS';
            break;
          case 2:
            endpoint = 'CBC';
            break;
          case 3:
            endpoint = 'CBR';
            break;
          case 4:
            endpoint = 'CBSC';
            break;
        }
      
        allFinalCombinations.forEach((combArray) => {
          combArray.forEach((comb) => {
            const loadCaseName = comb.loadCaseName.replace(/\s*\((CB|ST|CS|CBC|MV|SM|RS|CBR|CBSC|CBS)\)$/, '');
            const occurrences = [
              ...Object.values(backupCivilCom.Assign),
              ...Object.values(backupCivilComev.Assign)
            ].filter(
              (assign) => assign.NAME.replace(/_\d+$/, "") === loadCaseName
            ).length;
            if (occurrences > 0) {
            for (let i = 0; i < Math.max(occurrences, 1); i++) {
              const updatedComb = { ...comb, loadCaseName: `${loadCaseName}_${i + 1} (${endpoint})` };
              manipulatedCombinations.push([updatedComb]);
            }
          } else {
            manipulatedCombinations.push([comb]);
          }
          });
        });
        if (manipulatedCombinations.length > 0) {
        allFinalCombinations = manipulatedCombinations;
        }
      }
      allFinalCombinations.forEach((combArray, idx) => {
        combinationCounter++;
        const combinationName = `${comb_name}_${idx + 1}`; 
        const active = loadCombinationValues.includes(comb_name) 
        ? "INACTIVE" 
        : service_combo.includes(comb_name) 
          ? "SERVICE"
          : "ACTIVE";
        let vCOMB = combArray.map((comb) => {
          const cleanedLoadCaseName = comb.loadCaseName.replace(/\s*\((CB|ST|CS|CBC|MV|SM|RS|CBR|CBSC|CBS)\)$/, '');
          // Extract the value inside the parentheses if present
  const match = comb.loadCaseName.match(/\((CB|ST|CS|CBC|MV|SM|RS|CBR|CBSC|CBS)\)$/);
  // Use the value from parentheses if present, otherwise derive from loadNames_key
  const analysisType = match
    ? match[1] // Use the value in parentheses (e.g., CB, ST, CS, CBC)
    : (() => {
        const matchingEntry = loadNames_key.find(entry => entry.name === comb.loadCaseName);
        return matchingEntry ? matchingEntry.key : "ST"; 
      })();
          return {
            "ANAL": analysisType,
            "LCNAME": cleanedLoadCaseName,
            "FACTOR": (comb.sign === "+" ? 1 : -1) * comb.factor 
          };
        });
        if (type === "Envelope") {
        backupCivilComev.Assign[`${idx + 1 + combinationCounter + initial_lc}`] = {
          "NAME": combinationName,
          "ACTIVE": active,
          "bCB": false,
          "iTYPE": 0,
          "vCOMB": vCOMB
      };
    } else{
        backupCivilCom.Assign[`${idx + 1 + combinationCounter + initial_lc}`] = {
          "NAME": combinationName,
          "ACTIVE": active,
          "bCB": false,
          "iTYPE": 0,
          "vCOMB": vCOMB
      };
    }
      setCivilCom({ Assign: { ...backupCivilCom.Assign } });
      setCivilComEnvValues({ Assign: { ...backupCivilComev.Assign } });
      last_value = idx + 1 + combinationCounter;
      });
    }
    if (values["Generate envelop load combinations in midas"]) {
      env_count = env_count + 1;
      console.log("Generating envelope load combinations...");
      const combinationName = `${comb_name}_Env`;
      const active = loadCombinationValues.includes(comb_name) 
        ? "INACTIVE" 
        : service_combo.includes(comb_name) 
          ? "SERVICE"
          : "ACTIVE";
      let allVCombEntries = [];
      for (const key in backupCivilCom.Assign) {
        // allVCombEntries = []
        let assignEntry = backupCivilCom.Assign[key];
       
        if (assignEntry && !allEnv.includes(assignEntry)) {
          let endpoint = '';
          let check = '';
          switch (selectedDropListValue) {
            case 1:
              endpoint = 'CBS';
              break;
            case 2:
              endpoint = 'CBC';
              break;
            case 3:
              endpoint = 'CBR';
              break;
            case 4:
              endpoint = 'CBSC';
              break;
          }
          
          const vCombObject = {
            "ANAL": endpoint,  
            "LCNAME": assignEntry.NAME,
            "FACTOR": 1
          };
          allVCombEntries.push(vCombObject);
        }
        allEnv.push(assignEntry);
      }
      backupCivilCom_env.Assign[`${last_value + 1}`] = {
        "NAME": combinationName,
        "ACTIVE": active,
        "bCB": false,
        "iTYPE": 0,
        "vCOMB": allVCombEntries
    };
    } 
    setCivilComeEnv({ Assign: { ...backupCivilCom_env.Assign } });
  }
  console.log( "allcomb",allFinalCombinations);
  return allFinalCombinations;
}
console.log("env", civilComEnvValues);
console.log("Civil",civilCom);
console.log("Civil_env",civilComEnv);

function permutation_sign(result11) {
  const { addObj, eitherArray, envelopeObj, firstKey, secondLastKey } = result11;
  let finalCombinations = [];
  
  function generateCombinations(arrays) {
    const results = [];
    function recurse(currentCombo, depth) {
      if (depth === arrays.length) {
        results.push([...currentCombo]);
        return;
      }
      for (let i = 0; i < arrays[depth].length; i++) {
        currentCombo.push(arrays[depth][i]);
        recurse(currentCombo, depth + 1);
        currentCombo.pop();
      }
    }
    recurse([], 0);
    return results;
  }
  for (let addArrIndex = 0; addArrIndex < addObj.length; addArrIndex++) {
    let addArr = addObj[addArrIndex]; 
    for (let innerArrIndex = 0; innerArrIndex < addArr.length; innerArrIndex++) {
      let innerArr = addArr[innerArrIndex];      
      for (let objIndex = 0; objIndex < innerArr.length; objIndex++) {
        let obj = innerArr[objIndex];
        let positiveArray = [];
        let negativeArray = [];
        let dummyArray = [];
        let dummy = [];
        let new_temp = [];
        let temp = [];

        for (const item of obj) {
          dummy = [];
          if (item.sign === "+,-" || item.sign === "-,+") {
            const positiveObj = { ...item, sign: "+" };
            const negativeObj = { ...item, sign: "-" };
            positiveArray.push(positiveObj);
            negativeArray.push(negativeObj);
          } else if (item.sign === "±" || item.sign === "∓") {
            const positiveObj = { ...item, sign: "+" };
            const negativeObj = { ...item, sign: "-" };
            dummy.push(positiveObj);
            dummy.push(negativeObj);
            dummyArray.push(dummy);
          } else {
            new_temp.push({ ...item });
          }
        }

        if (dummyArray.length > 0) {
          const combinations = generateCombinations(dummyArray);
          
          if (positiveArray.length > 0 && negativeArray.length > 0) {
            for (const combination of combinations) {
              const combinedWithPositive = [...positiveArray, ...combination];
              const combinedWithNegative = [...negativeArray, ...combination];

              if (new_temp.length > 0) {
                for (const newItem of new_temp) {
                  const newItemArray = Array.isArray(newItem) ? newItem : [newItem];
                  temp.push([...combinedWithPositive, ...newItemArray]);
                  temp.push([...combinedWithNegative, ...newItemArray]);
                }
              } else {
                temp.push(combinedWithPositive);
                temp.push(combinedWithNegative);
              }
            }
          } else {
            for (const combination of combinations) {
              if (new_temp.length > 0) {
                for (const newItem of new_temp) {
                  if (Array.isArray(newItem)) {
                    temp.push([...combination, ...newItem]);
                  } else {
                    temp.push([...combination, newItem]);
                  }
                }
              } else {
                temp.push(combination);
              }
            }
          }
        } else {
          if (new_temp.length > 0) {
            const combinedNewItems = new_temp.flatMap(item => (typeof item === "object" ? [item] : item));
            if (positiveArray.length > 0 && negativeArray.length > 0) {
                temp.push([...positiveArray, ...combinedNewItems]);
                temp.push([...negativeArray, ...combinedNewItems]);
            } else if (positiveArray.length > 0) {
                temp.push([...positiveArray, ...combinedNewItems]);
            } else if (negativeArray.length > 0) {
                temp.push([...negativeArray, ...combinedNewItems]);
            } else {
                temp.push(combinedNewItems);
            }
        } else {
            if (positiveArray.length > 0) {
                temp.push([...positiveArray]);
            }
            if (negativeArray.length > 0) {
                temp.push([...negativeArray]);
            }
        }
        }
        if (temp.length === 0) {
          innerArr.splice(objIndex, 1); // Remove the empty obj from innerArr
          objIndex--; // Adjust the index after removal to avoid skipping elements
        } else {
          obj.length = 0;
          obj.push(...temp); // Push modified combinations to obj
        }
      }
    }
  }
  if (eitherArray !== undefined) {
  for (let eitherArrIndex = 0; eitherArrIndex < eitherArray.length; eitherArrIndex++) {
    let eitherArr = eitherArray[eitherArrIndex]; 
    for (let innerArrIndex = 0; innerArrIndex < eitherArr.length; innerArrIndex++) {
      let innerArr = eitherArr[innerArrIndex]; 
      
      for (let objIndex = 0; objIndex < innerArr.length; objIndex++) {
        let obj = innerArr[objIndex];
        let positiveArray = [];
        let negativeArray = [];
        let dummyArray = [];
        let dummy = [];
        let new_temp = [];
        let temp = [];

        for (const item of obj) {
          dummy = [];
          if (item.sign === "+,-" || item.sign === "-,+") {
            const positiveObj = { ...item, sign: "+" };
            const negativeObj = { ...item, sign: "-" };
            positiveArray.push(positiveObj);
            negativeArray.push(negativeObj);
          } else if (item.sign === "±" || item.sign === "∓") {
            const positiveObj = { ...item, sign: "+" };
            const negativeObj = { ...item, sign: "-" };
            dummy.push(positiveObj);
            dummy.push(negativeObj);
            dummyArray.push(dummy);
          } else {
            new_temp.push({ ...item });
          }
        }

        if (dummyArray.length > 0) {
          const combinations = generateCombinations(dummyArray);  
          if (positiveArray.length > 0 && negativeArray.length > 0) {
            for (const combination of combinations) {
              const combinedWithPositive = [...positiveArray, ...combination];
              const combinedWithNegative = [...negativeArray, ...combination];

              if (new_temp.length > 0) {
                for (const newItem of new_temp) {
                  const newItemArray = Array.isArray(newItem) ? newItem : [newItem];
                  temp.push([...combinedWithPositive, ...newItemArray]);
                  temp.push([...combinedWithNegative, ...newItemArray]);
                }
              } else {
                temp.push(combinedWithPositive);
                temp.push(combinedWithNegative);
              }
            }
          } else {
            for (const combination of combinations) {
              if (new_temp.length > 0) {
                for (const newItem of new_temp) {
                  if (typeof newItem !== 'object' || Array.isArray(newItem)) {
                    temp.push([...combination, ...newItem]);
                  } else {
                    // If newItem is not iterable, push it directly with combination
                    temp.push([...combination, newItem]);
                  }
                }
              } else {
                temp.push(combination);
              }
            }
          }
        } else {
          if (new_temp.length > 0) {
            for (const newItem of new_temp) {
              if (positiveArray.length > 0 && negativeArray.length > 0) {
                if (typeof newItem !== "object") {
                temp.push([...positiveArray, ...newItem]);
                temp.push([...negativeArray, ...newItem]);
                } else {
                  temp.push([...positiveArray]);
                  temp.push([...negativeArray]);
                }
              } else {
                temp.push(newItem);
              }
            }
          } else {
            if (positiveArray.length > 0) {
              temp.push([...positiveArray]);
            }
            if (negativeArray.length > 0) {
              temp.push([...negativeArray]);
            }
          }
        }
        if (temp.length === 0) {
          innerArr.splice(objIndex, 1); 
          objIndex--; 
        } else {
          obj.length = 0;
          obj.push(...temp);
        }
      }
    }
  }
  }
  if (envelopeObj !== undefined) {
  for (let EnvArrIndex = 0; EnvArrIndex < envelopeObj.length; EnvArrIndex++) {
    let EnvArr = envelopeObj[EnvArrIndex]; 
    for (let innerArrIndex = 0; innerArrIndex < EnvArr.length; innerArrIndex++) {
      let innerArr = EnvArr[innerArrIndex];      
      for (let objIndex = 0; objIndex < innerArr.length; objIndex++) {
        let obj = innerArr[objIndex];
        let positiveArray = [];
        let negativeArray = [];
        let dummyArray = [];
        let dummy = [];
        let new_temp = [];
        let temp = [];

        for (const item of obj) {
          dummy = [];
          if (item.sign === "+,-" || item.sign === "-,+") {
            const positiveObj = { ...item, sign: "+" };
            const negativeObj = { ...item, sign: "-" };
            positiveArray.push(positiveObj);
            negativeArray.push(negativeObj);
          } else if (item.sign === "±") {
            const positiveObj = { ...item, sign: "+" };
            const negativeObj = { ...item, sign: "-" };
            dummy.push(positiveObj);
            dummy.push(negativeObj);
            dummyArray.push(dummy);
          } else {
            new_temp.push({ ...item });
          }
        }

        if (dummyArray.length > 0) {
          const combinations = generateCombinations(dummyArray);
          
          if (positiveArray.length > 0 && negativeArray.length > 0) {
            for (const combination of combinations) {
              const combinedWithPositive = [...positiveArray, ...combination];
              const combinedWithNegative = [...negativeArray, ...combination];

              if (new_temp.length > 0) {
                for (const newItem of new_temp) {
                  const newItemArray = Array.isArray(newItem) ? newItem : [newItem];
                  temp.push([...combinedWithPositive, ...newItemArray]);
                  temp.push([...combinedWithNegative, ...newItemArray]);
                }
              } else {
                temp.push(combinedWithPositive);
                temp.push(combinedWithNegative);
              }
            }
          } else {
            for (const combination of combinations) {
              if (new_temp.length > 0) {
                for (const newItem of new_temp) {
                  // Check if newItem is iterable (i.e., an array)
                  if (Array.isArray(newItem)) {
                    temp.push([...combination, ...newItem]);
                  } else {
                    // If newItem is not iterable, push it directly with combination
                    temp.push([...combination, newItem]);
                  }
                }
              } else {
                temp.push(combination);
              }
            }
          }
        } else {
          if (new_temp.length > 0) {
            for (const newItem of new_temp) {
              if (positiveArray.length > 0 && negativeArray.length > 0) {
                temp.push([...positiveArray, ...newItem]);
                temp.push([...negativeArray, ...newItem]);
              } else {
                temp.push(newItem);
              }
            }
          } else {
            if (positiveArray.length > 0) {
              temp.push([...positiveArray]);
            }
            if (negativeArray.length > 0) {
              temp.push([...negativeArray]);
            }
          }
        }
        if (temp.length === 0) {
          innerArr.splice(objIndex, 1); 
          objIndex--;
        } else {
          obj.length = 0;
          obj.push(...temp); 
        }
      }
    }
  }
  }
  console.log({ addObj, eitherArray, envelopeObj,firstKey });
  return { addObj, eitherArray,envelopeObj ,firstKey,secondLastKey};
}
useEffect(() => {
  console.log("Generating Load Combination4", isGenerating);
}, [isGenerating]);

async function Generate_Load_Combination() {
  setIsGenerating(true, () => {
    console.log("Generating Load Combination3", isGenerating);
  });
  setIsGenerating((pre)=>true);
  console.log("Generating Load Combination", isGenerating);
    const cleanedLoadNames = all_loadCaseNames.map((name) =>
      name.replace(/\s*\((CB|ST|CS|CBC|MV|RS|CBR|CBSC|CBS|SM|CO)\)$/, '')
    );
    const allIncluded = cleanedLoadNames.every((name) => loadNames.includes(name));
    if (!allIncluded) {
      enqueueSnackbar("Load cases are not defined", {
        variant: "error",
        anchorOrigin: { vertical: "top", horizontal: "center" },
      });
      setIsGenerating(false);
      return; 
    }
    console.log(loadCombinations);
    const basicCombinations = generateBasicCombinations(loadCombinations);
    console.log(basicCombinations);
    setIsGenerating(false, () => {
      console.log("Generating Load Combination3", isGenerating);
    });
    setIsGenerating((pre)=>false);
 
}

console.log("Generating Load Combination2", isGenerating);
const isGeneratingRef = useRef(false);
async function generateEnvelopeLoadCombination() {
  if (Object.keys(civilCom.Assign).length === 0) {
    console.log("civilCom.Assign is empty, no combinations to process.");
    return;
  }
  if (isGeneratingRef.current) return;

  isGeneratingRef.current = true; 

  try {
    const civilComJson = JSON.stringify(civilCom, null, 2);
    console.log(civilComJson);
    console.log(civilCom);

    let endpoint = '';
    let check = '';
    switch (selectedDropListValue) {
      case 1:
        endpoint = '/db/lcom-steel';
        check = 'LCOM-STEEL';
        break;
      case 2:
        endpoint = '/db/lcom-conc';
        check = 'LCOM-CONC';
        break;
      case 3:
        endpoint = '/db/lcom-src';
        check = 'LCOM-SRC';
        break;
      case 4:
        endpoint = '/db/lcom-stlcomp';
        check = 'LCOM-STLCOMP';
        break;
      default:
        console.error("Invalid selectedDropListValue:", selectedDropListValue);
        return;
    }
    const response = await midasAPI("PUT", endpoint, civilCom);
    console.log(response);
    if(values['Generate envelop load combinations in midas']) {
      const response_env = await midasAPI("PUT", endpoint, civilComEnv);
      console.log(response_env);
    }
    const response_env = await midasAPI("PUT", endpoint, civilComEnvValues);
    console.log(response_env);
    if (response && response[check]) {
      enqueueSnackbar("Load-Combination Generated Successfully", {
        variant: "success",
        anchorOrigin: { vertical: "top", horizontal: "center" },
      });
    } else {
      enqueueSnackbar("Failed to Generate Load-Combination", {
        variant: "error",
        anchorOrigin: { vertical: "top", horizontal: "center" },
      });
    }
  } catch (error) {
    console.error("Error generating load combination:", error);
    enqueueSnackbar("An error occurred while generating Load-Combination", {
      variant: "error",
      anchorOrigin: { vertical: "top", horizontal: "center" },
    });
  } finally {
    isGeneratingRef.current = false; 
    setIsGenerating(false);
    civilCom.Assign = {};
    civilComEnv.Assign = {};
    civilComEnvValues.Assign = {};
    console.log("civilCom has been refreshed:", civilCom);
    console.log("civilComEnv has been refreshed:", civilComEnv);
    console.log("civilComEnvValues has been refreshed:", civilComEnvValues);
  }
}

if (Object.keys(civilCom.Assign).length > 0 && !isGeneratingRef.current) {
  generateEnvelopeLoadCombination();
}

  let dropdownRef = useRef();
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        toggleSignDropdown(null); 
        toggleTypeDropdown(null);
        toggleDropdown(null);
      }
    };
    document.addEventListener('click', handleOutsideClick);
    return () => {
      document.removeEventListener('click', handleOutsideClick);
    };
  }, []);
const toggleExcelReader = () => {
  fileInputRef.current.click();
};
const handleImportClick = () => {
  try {
  setImportLoading(true);
  toggleExcelReader();
  setTimeout(() => {
    setImportLoading(false); 
  }, 5000); 
} catch(error) {
  console.error("Error importing excel file:", error);
  // if (snackbarCounter === 0) {
    enqueueSnackbar("Load Cases are not defined", {
      // key: `snackbar-${snackbarCounter++}`, 
      variant: "error",
      anchorOrigin: { vertical: "top", horizontal: "center" },
    });
  // }
}
};
let [loadCombinations, setLoadCombinations] = useState(
  [
    { loadCombination: '', active: '', type: '', loadCases: [{
              loadCaseName: '',
              sign: '',
              factor1: '',
              factor2: '',
              factor3: '',
              factor4: '',
              factor5: ''
}]
}
]);
useEffect(() => {
  const lastCombination = loadCombinations[loadCombinations.length - 1];
  if (lastCombination && (
    lastCombination.loadCombination !== '' || 
    lastCombination.active !== '' || 
    lastCombination.type !== '' || 
    lastCombination.loadCases.some(loadCase => (
      loadCase.loadCaseName !== '' ||
      loadCase.sign !== '' ||
      loadCase.factor1 !== '' ||
      loadCase.factor2 !== '' ||                  
      loadCase.factor3 !== '' ||
      loadCase.factor4 !== '' ||
      loadCase.factor5 !== ''
    ))
  )) {
    setLoadCombinations([
      ...loadCombinations, 
      {
        loadCombination: '',
        active: '',
        type: '',
        loadCases: [{
          loadCaseName: '',
          sign: '',
          factor1: '',
          factor2: '',
          factor3: '',
          factor4: '',
          factor5: ''
        }]
      }
    ]);
    setInputValue('');
  }
}, [loadCombinations]);
let removeDuplicateFactors = (data) => {
  return data.map((combination) => {
    if (combination?.type === "Either" || combination?.type === "Envelope") {
      const updatedLoadCases = combination.loadCases.map((loadCase) => {
        const factors = [
          loadCase.factor1,
          loadCase.factor2,
          loadCase.factor3,
          loadCase.factor4,
          loadCase.factor5,
        ];
        const uniqueFactors = Array.from(new Set(factors));
        return {
          ...loadCase,
          factor1: uniqueFactors[0] || undefined,
          factor2: uniqueFactors[1] || undefined,
          factor3: uniqueFactors[2] || undefined,
          factor4: uniqueFactors[3] || undefined,
          factor5: uniqueFactors[4] || undefined,
        };
      });
      return {
        ...combination,
        loadCases: updatedLoadCases,
      };
    } 
    if (combination?.type === "Add") {
      const updatedLoadCases = combination.loadCases.map((loadCase) => {
        const factors = [
          loadCase.factor1,
          loadCase.factor2,
          loadCase.factor3,
          loadCase.factor4,
          loadCase.factor5,
        ];
        return {
          ...loadCase,
          factor1: loadCase.factor1,
          factor2: loadCase.factor2,
          factor3: loadCase.factor3,
          factor4: loadCase.factor4,
          factor5: loadCase.factor5
        };
      });
      return {
        ...combination,
        loadCases: updatedLoadCases,
      };
    }
  });
};

const handleFileChange = (event) => {
  all_loadCaseNames = [];
  const file = event.target.files[0];
  const reader = new FileReader();

  reader.onload = (e) => {
    const binaryStr = e.target.result;
    const workbook = XLSX.read(binaryStr, { type: 'binary' });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    console.log('Raw JSON Data:', jsonData);
    if (!jsonData[0] || jsonData[0][0] !== "Load Combination" || jsonData[0][1] !== "Active" || jsonData[0][2] !== "Type" || jsonData[0][3] !== "Load Cases" || jsonData[0][4] !== "Sign" || jsonData[0][5] !== "Factor 1" || jsonData[0][6] !== "Factor 2" || jsonData[0][7] !== "Factor 3" || jsonData[0][8] !== "Factor 4" || jsonData[0][9] !== "Factor 5") {
      enqueueSnackbar("Please upload the correct format of Excel file", {
        variant: "error",
        anchorOrigin: { vertical: "top", horizontal: "center" },
      });
      return; 
    } 
    const formattedData = [];
    let currentLoadCombination = null;
    const loadcombinationName = [];
    jsonData.slice(1).forEach(row => {
      const loadCombination = row[0] || currentLoadCombination.loadCombination;
      const active = row[1] || currentLoadCombination.active;
      const type = row[2] || currentLoadCombination.type;
      const loadCaseName = row[3];
      const sign = row[4];
      const factor1 = row[5] !== undefined ? row[5] : "";
      const factor2 = row[6] !== undefined ? row[6] : "";
      const factor3 = row[7] !== undefined ? row[7] : "";
      const factor4 = row[8] !== undefined ? row[8] : "";
      const factor5 = row[9] !== undefined ? row[9] : "";
      if (loadCaseName && loadCaseName !== undefined) {
        all_loadCaseNames.push(loadCaseName);
      }
      if (loadCombination) {
        loadcombinationName.push(loadCombination);
      }
      if (loadCombination) {
        if (!currentLoadCombination || currentLoadCombination.loadCombination !== loadCombination) {
          currentLoadCombination = {
            loadCombination,
            active,
            type,
            loadCases: []
          };
          formattedData.push(currentLoadCombination);
        }
        currentLoadCombination.loadCases.push({
          loadCaseName,
          sign,
          factor1,
          factor2,
          factor3,
          factor4,
          factor5
        });
      }
    });
    console.log("Stored Load Case Names:", all_loadCaseNames);
    all_loadCaseNames = all_loadCaseNames.map((name) =>
      name.replace(/\s*\((CB|ST|CS|CBC|MV|RS|CBR|CBSC|CBS|SM)\)$/, '')
    );
    all_loadCaseNames = all_loadCaseNames.filter(name => !loadcombinationName.includes(name));
    console.log("Updated Load Case Names:", all_loadCaseNames);
    setall_loadCaseNames(all_loadCaseNames);
    console.log('Formatted Data:', formattedData); 
    setLoadCombinations(formattedData);
  };
  reader.readAsBinaryString(file);
};
console.log(loadCombinations);

const [activeDropdownIndex, setActiveDropdownIndex] = useState(-1); 

  const toggleDropdown = (index) => {
    setActiveDropdownIndex(index === activeDropdownIndex ? null : index);
  };
  const toggleTypeDropdown = (index) => {
    setTypeDropdownIndex(index === typeDropdownIndex ? null : index);
  };
  
  
  const handleOptionSelect = (index, option) => {
    handleLoadCombinationChange(index, 'active', option);
    setActiveDropdownIndex(null);
  };

  const handleTypeOptionSelect = (index, option) => {
    handleLoadCombinationChange(index, 'type', option);
    setTypeDropdownIndex(null);
  };

  const handleLoadCombinationChange = (index, field, value) => {
    setLoadCombinations((prevLoadCombinations) => {
      const updatedLoadCombinations = [...prevLoadCombinations];
      updatedLoadCombinations[index][field] = value;
      return updatedLoadCombinations;
    });
  };
  const debounce = (func, delay) => {
    let debounceTimer;
    return function (...args) {
      const context = this;
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => func.apply(context, args), delay);
    };
  };
  const debouncedHandleLoadCombinationChange = useCallback(
    debounce((index, field, value) => {
      handleLoadCombinationChange(index, field, value);
    }, 1000),
    []
  );
  const handleInputChange = (index, field, value) => {
    setInputValue(value);
    debouncedHandleLoadCombinationChange(index, field, value);
    const updatedLoadCombinations = [...loadCombinations];
     updatedLoadCombinations[index][field] = value; // Update the specific field
     setLoadCombinations(updatedLoadCombinations);
  };
  const handleDelete = (index) => {
    try {
      if (!loadCombinations || loadCombinations.length === 0 || loadCombinations[index].loadCombination === "") {
        throw new Error("No load combinations available to delete.");
      }
      const updatedLoadCombinations = loadCombinations.filter((_, i) => i !== index); // Remove the item at the given index
      if(updatedLoadCombinations.length !== 0) {
      setLoadCombinations(updatedLoadCombinations); // Update the state with the new array
      }
    } catch (error) {
      console.error("Error deleting load combination:", error.message);
    }
  };
  
  
  React.useEffect(() => {
    if (
      !VerifyUtil.isExistQueryStrings("redirectTo") &&
      !VerifyUtil.isExistQueryStrings("mapiKey")
    ) {
      setDialogShowState(true);
    }
  }, []);
  console.log(loadNames);
  console.log(loadCombinations);
  function handleAddLoadCase() {
    // Prevent multiple clicks within a short time
    if (isAddingLoadCase) return;
  
    setIsAddingLoadCase(true);
  
    console.log('selectedLoadCombinationIndex', selectedLoadCombinationIndex);
  
    if (selectedLoadCombinationIndex >= 0 && selectedLoadCombinationIndex < loadCombinations.length) {
      const newLoadCase = {                               
        loadCaseName: "",
        sign: "",
        factor1: undefined,
        factor2: undefined,
        factor3: undefined,
        factor4: undefined,
        factor5: undefined
      };

      let updatedCombinations = [...loadCombinations];
      updatedCombinations[selectedLoadCombinationIndex].loadCases.push(newLoadCase);

      setLoadCombinations(updatedCombinations);
    } else {
      console.error('Invalid selectedLoadCombinationIndex');
    }
  
    setIsAddingLoadCase(false); // Reset flag after some time
  }
  function handleDeleteRow() {
    // Prevent multiple clicks within a short time
    if (isDeletingRow) return;
  
    setIsDeletingRow(true);
  
    console.log('selectedLoadCombinationIndex', selectedLoadCombinationIndex);
  
    // Check if the selectedLoadCombinationIndex is valid
    if (selectedLoadCombinationIndex >= 0 && selectedLoadCombinationIndex < loadCombinations.length) {
      let updatedCombinations = [...loadCombinations];
  
      // Only delete if there are load cases in the selected combination
      if (updatedCombinations[selectedLoadCombinationIndex].loadCases.length > 0) {
        updatedCombinations[selectedLoadCombinationIndex].loadCases.pop(); // Remove the last load case
        setLoadCombinations(updatedCombinations);
      } else {
        console.error('No load cases to delete');
      }
    } else {
      console.error('Invalid selectedLoadCombinationIndex');
    }
  
    setIsDeletingRow(false); // Reset flag after some time
  }
  // Handle checkbox changes by updating the state
  const handleCheckboxChange = (e, checked) => {
    const event = e;
    setValues((prevValues) => ({
      ...prevValues,
      [event.target.name]: checked,
    }));
  };
  console.log(selectedLoadCombinationIndex);
  function handledeleterow(selectedLoadCombinationIndex, loadCaseIndex) {
  setLoadCombinations(prevCombinations => {
    // Clone the combinations array
    const updatedCombinations = [...prevCombinations];
    // Clone the loadCases array for the selected combination
    const updatedLoadCases = [...updatedCombinations[selectedLoadCombinationIndex].loadCases];
    // Remove the row at loadCaseIndex
    updatedLoadCases.splice(loadCaseIndex, 1);
    // Update the combination's loadCases
    updatedCombinations[selectedLoadCombinationIndex] = {
      ...updatedCombinations[selectedLoadCombinationIndex],
      loadCases: updatedLoadCases
    };
    return updatedCombinations;
  });
}
  return (
	<div className="App" style={{cursor : 'pointer'}}>
    {showDialog && <VerifyDialog />}
		<GuideBox
			padding={2}
			center
		>
      {/* <div style={{ backgroundColor: '#d3d3d3', width: '830px', height: '500px', display: 'flex'}}> */}
      <Panel width="800px" height="540px" flexItem>
        {/* <div style={{ width: '300px', height: '500px', display: 'flex', flexDirection: 'column',margin:'10px'}}> */}
        <Panel width="300px" height="540px" variant="shadow2" marginLeft='20px'>
         <div style={{width: '130px', height: '20px', color: 'black',paddingTop:'2.5px'}}><Typography variant="h1" color="primary" size="small">
         Load Combination List
</Typography></div>
         <div style={{ display: 'flex', flexDirection: 'row', backgroundColor: 'white', color: 'black',fontSize:'12px',width:'280px', height: '20px',borderTopLeftRadius: '10px', borderTopRightRadius: '10px'}}>
         {/* <Panel width="280px" height="20px" variant="shadow2"> */}
         <div style={{ flex: '0 0 127px', paddingLeft:'2px' }}>Load Combination</div>
          <Sep direction='vertical' margin='2px'/>
         <div style={{ flex: '1 1 auto' }}>Active</div>
        <Sep direction='vertical' margin='2px'/>
        <div style={{ flex: '1 1 auto' }}>Type</div>
        </div>
      <div style={{
      width: '280px',
      height: '370px',
      backgroundColor: 'white',
      marginBottom: '20px',
      marginTop:'2px',
      borderTop: '2px solid #ccc', // Adds a greyish line to the top border
      boxShadow: '0px -4px 5px -4px grey',// Adds a shadow effect to the top border
    }}> 
    <Scrollbars height={360} width={280}>

               {loadCombinations.map((combo, index) => {
                 if (combo.loadCombination && combo.loadCombination !== '---' && !combo.active) {
                  combo.active = 'Strength';
              }
              if (combo.loadCombination && combo.loadCombination !== '---' && !combo.type) {
                  combo.type = 'Add';
              }
              return (
      <div key={index} style={{ display: 'flex', flexDirection: 'row', borderBottom: '1px solid #ccc', cursor: 'pointer', backgroundColor: selectedLoadCombinationIndex === index ? '#f0f0f0' : 'white' }} onClick={() => handleLoadCombinationClick(index)}>
     <div style={{ flex: '0 0 110px', padding: '5px', borderRight: '1px solid #ccc', color: 'black', display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
  {/* First div with input or Typography */}
  <div style={{ flex: 1 }}>
    {selectedLoadCombinationIndex === index ? ( // Render input if this is the active row
      <input
        type="text"
        value={combo?.loadCombination}
        onChange={(e) =>
          handleInputChange(index, 'loadCombination', e.target.value)
        }
        placeholder=" "
        style={{
          width: '100%',
          border: 'none',
          outline: 'none',
          backgroundColor: 'transparent',
        }}
      />
    ) : (
      <Typography
        onDoubleClick={() => handleLoadCombinationClick(index)} // Allow double-click to edit
        style={{ cursor: 'text' }}
      >
        {combo?.loadCombination || '---'} 
      </Typography>
    )}
  </div>

  {selectedLoadCombinationIndex === index && (
  <div
    style={{
      padding: '0px',
      color: 'black',
      cursor: 'pointer',
      display: 'flex',
      justifyContent: 'center', 
      alignItems: 'center', 
      width: '10px', 
      height: '20px', 
    }}
    onClick={(e) => {
      e.stopPropagation();
      handleDelete(index); 
    }}
  >
    <Typography style={{ color: 'red', fontSize: '12px' }}>🗑️</Typography>
  </div>
  )}
</div>

        <div 
              style={{
                flex: '1 1 65px',
                padding: '5px',
                borderRight: '1px solid #ccc',
                color: 'black',
                cursor: 'pointer',
                position: 'relative'
              }}
              onClick={(e) => {
                e.stopPropagation();
                toggleDropdown(index);
              }}
            >
              <Typography>{combo?.active}</Typography>
              {activeDropdownIndex === index && (
                <div
                ref={dropdownRef} 
                  style={{
                    position: 'absolute',
                    backgroundColor: 'white',
                    border: '1px solid #ccc',
                    zIndex: 1,
                    top: '100%',
                    left: 0,
                    minWidth: '100%',
                  }}
                >
                  <div onClick={() => handleOptionSelect(index, 'Inactive')}><Typography>Inactive</Typography></div>
                  <div onClick={() => handleOptionSelect(index, 'Local')}><Typography>Local</Typography></div>
                  <div onClick={() => handleOptionSelect(index, 'Strength')}><Typography>Strength</Typography></div>
                  <div onClick={() => handleOptionSelect(index, 'Service')}><Typography>Service</Typography></div>
                </div>
                 )}
            </div>
        {/* <div style={{ flex: '1 1 40px', padding: '5px', color: 'black' }}><Typography>{combo.type}</Typography></div> */}
        <div
                      
                      style={{
                        flex: '1 1 50px',
                        padding: '5px',
                        color: 'black',
                        cursor: 'pointer',
                        position: 'relative'
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleTypeDropdown(index);
                      }}
                    >
                      <Typography>{combo?.type}</Typography>
                      {typeDropdownIndex === index && (
                        <div
                        ref={dropdownRef}
                          style={{
                            position: 'absolute',
                            backgroundColor: 'white',
                            border: '1px solid #ccc',
                            zIndex: 1,
                            top: '100%',
                            left: 0,
                            right: 0
                          }}
                        >
                          {['Add', 'Either', 'Envelope'].map((option, optionIndex) => (
                            <div
                              key={optionIndex}
                              onClick={() => handleTypeOptionSelect(index, option)}
                              style={{
                                padding: '5px',
                                cursor: 'pointer',
                                backgroundColor: option === <Typography>combo?.type</Typography> ? '#f0f0f0' : 'white'
                              }}
                            >
                              <Typography>{option}</Typography>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    </div>
              );
            })}
              </Scrollbars>
      </div>
      
      <CheckGroup>
        <Check name="Generate envelop load combinations in midas" checked={values.test1} onChange={handleCheckboxChange} />
        <Check name="Generate inactive load combinations in midas" checked={values.test2} onChange={handleCheckboxChange} />
      </CheckGroup>
<ComponentsPanelTypographyDropList 
          selectedValue={selectedDropListValue} 
          onValueChange={handleDropListChange} 
        />
</Panel>

<Panel width={7500000} height={540} marginRight="20px">
 <div style={{display: 'flex',flexDirection:'row' ,justifyContent: 'space-between',width: '450px', height: '20px', color: 'black', fontSize: '12px',paddingTop:'2px',paddingBottom:'0px',marginBottom:'0px'}}>
  <Typography variant="h1" color="primary" size="small" textalign="centre">Load Cases & Factors</Typography> 
  <div style={{
  display: 'flex',
  alignItems: 'flex-end',
  marginTop: '3px', 
}}><ComponentsDialogHelpIconButton /></div>
  </div>
      <div style={{ display: 'flex', flexDirection: 'row', backgroundColor: 'white', color: 'black',fontSize:'12px', height: '20px',borderTopLeftRadius: '10px', borderTopRightRadius: '10px'}}>
      <div style={{ flex: '0 0 150px'}}>Load Case</div>
      <Sep direction='vertical' margin='2px'/>
      <div style={{ flex: '1 1 auto' }}>Sign</div>
      <Sep direction='vertical' margin='2px'/>
      <div style={{ flex: '1 1 auto' }}>Factor1</div>
      <Sep direction='vertical' margin='2px'/>
      <div style={{ flex: '1 1 auto' }}>Factor2</div>
      <Sep direction='vertical' margin='2px'/>
      <div style={{ flex: '1 1 auto' }}>Factor3</div>
      <Sep direction='vertical' margin='2px'/>
      <div style={{ flex: '1 1 auto' }}>Factor4</div>
      <Sep direction='vertical' margin='2px'/>
      <div style={{ flex: '1 1 auto' }}>Factor5</div>
      </div>
      <div style={{
      width: '450px',
      height: '450px',
      backgroundColor: 'white',
      marginBottom: '20px',
      marginTop:'2px',
      borderTop: '2px solid #ccc',
      boxShadow: '0px -4px 5px -4px grey'
    }}>
         <Scrollbars height={450} width={460}>
  {selectedLoadCombinationIndex >= 0 &&
    loadCombinations[selectedLoadCombinationIndex].loadCases.map((loadCase, loadCaseIndex) => {
      // Automatically set the sign value to '+' if loadCase.loadCaseName is available
      if (loadCase.loadCaseName && !loadCase.sign) {
        loadCase.sign = '+';
      }

      return (
        <div key={loadCaseIndex} style={{ display: 'flex', flexDirection: 'row', borderBottom: '1px solid #ccc' }}>
          <div
            style={{ flex: '0 0 132px', padding: '5px', borderRight: '1px solid #ccc', color: 'black', position: 'relative' }}
            onClick={(e) => {
              e.stopPropagation();
              toggleLoadCaseDropdown(loadCaseIndex);
            }}
          >
            <Typography
             style={{ cursor: 'pointer' }}
             onClick={() => setLoadCaseDropdownIndex(loadCaseIndex)}
            >{loadCase.loadCaseName}</Typography>
            {loadCaseDropdownIndex === loadCaseIndex && (
              <div style={{ position: 'absolute', backgroundColor: 'white', border: '1px solid #ccc', zIndex: 1, top: '100%', left: 0, right: 0, cursor: 'pointer' }}>
                <Scrollbars height={150} width="100%">
                  {[
                    ...loadNames_key.map((item) => `${item.name}(${item.key})`),
                    ...loadCombinations.slice(0, selectedLoadCombinationIndex).map((combination) => 
                      `${combination.loadCombination}`
                    )
                  ].map((name) => (
                    <div
                      ref={dropdownRef}
                      key={name}
                      onClick={() => handleLoadCaseOptionSelect(selectedLoadCombinationIndex, loadCaseIndex, name)}
                      style={{
                        padding: '5px',
                        cursor: 'pointer',
                        backgroundColor: name === loadCase.loadCaseName ? '#f0f0f0' : 'white'
                      }}
                    >
                      <Typography>{name}</Typography>
                    </div>
                  ))}
                   {/* Delete option */}
      <div
        style={{
          padding: '5px',
          cursor: 'pointer',
          color: 'red',
          borderTop: '1px solid #eee'
        }}
        onClick={() => handledeleterow(selectedLoadCombinationIndex, loadCaseIndex)}
      >
         <Typography style={{ color: 'red', fontSize: '14px' }}>🗑️</Typography>
      </div>
                </Scrollbars>
              </div>
            )}
          </div>
          <div
            style={{ flex: '1 1 25px', padding: '5px', borderRight: '1px solid #ccc', color: 'black', position: 'relative' }}
            onClick={(e) => {
              e.stopPropagation();
              toggleSignDropdown(loadCaseIndex);
            }}
          >
            <Typography>{loadCase.sign}</Typography>
            {signDropdownIndex === loadCaseIndex && (
              <div ref={dropdownRef} style={{ position: 'absolute', backgroundColor: 'white', border: '1px solid #ccc', zIndex: 1, top: '100%', left: 0, right: 0 }}>
                {['+', '-', '+,-', '±'].map((signOption, signIndex) => (
                  <div
                    key={signIndex}
                    onClick={() => handleSignOptionSelect(selectedLoadCombinationIndex, loadCaseIndex, signOption)}
                    style={{ padding: '5px', cursor: 'pointer', backgroundColor: signOption === loadCase.sign ? '#f0f0f0' : 'white' }}
                  >
                    <Typography>{signOption}</Typography>
                  </div>
                ))}
              </div>
            )}
          </div>
          {['factor1', 'factor2', 'factor3', 'factor4', 'factor5'].map((factorKey, factorIndex) => (
            <div
              key={factorIndex}
              style={{ flex: '1 1 30px', padding: '5px', borderRight: '1px solid #ccc', color: 'black', cursor: 'text', fontSize: '12px' }}
              contentEditable
              suppressContentEditableWarning
              onBlur={(e) => handleFactorBlur(selectedLoadCombinationIndex, loadCaseIndex, factorKey, e.currentTarget.textContent)}
              onKeyDown={(e) => {
      if (e.key === 'Enter') {
    e.preventDefault();
    const current = e.currentTarget;
    const parent = current.parentElement;
    const nextRow = parent.nextSibling;
    if (nextRow) {
      // Find all editable cells in the next row
      const editables = nextRow.querySelectorAll('[contenteditable="true"]');
      // Find the index of the current cell in its row
      const cells = Array.from(parent.children).filter(
        el => el.getAttribute('contenteditable') === 'true'
      );
      const currentIndex = cells.indexOf(current);
      // Focus the cell at the same index in the next row, if it exists
      if (editables[currentIndex]) {
        editables[currentIndex].focus();
      }
    }
  }
   // PageDown: move to same column, next row
  if (e.key === 'PageDown') {
    e.preventDefault();
    const current = e.currentTarget;
    const parent = current.parentElement;
    const nextRow = parent.nextSibling;
    if (nextRow) {
      const editables = nextRow.querySelectorAll('[contenteditable="true"]');
      const cells = Array.from(parent.children).filter(
        el => el.getAttribute('contenteditable') === 'true'
      );
      const currentIndex = cells.indexOf(current);
      if (editables[currentIndex]) {
        editables[currentIndex].focus();
      }
    }
  }
  // PageUp: move to same column, previous row
  if (e.key === 'PageUp') {
    e.preventDefault();
    const current = e.currentTarget;
    const parent = current.parentElement;
    const prevRow = parent.previousSibling;
    if (prevRow) {
      const editables = prevRow.querySelectorAll('[contenteditable="true"]');
      const cells = Array.from(parent.children).filter(
        el => el.getAttribute('contenteditable') === 'true'
      );
      const currentIndex = cells.indexOf(current);
      if (editables[currentIndex]) {
        editables[currentIndex].focus();
      }
    }
  }
  // PageRight: move to next cell in the same row
  if (e.key === 'PageRight') {
    e.preventDefault();
    const current = e.currentTarget;
    const parent = current.parentElement;
    const cells = Array.from(parent.children).filter(
      el => el.getAttribute('contenteditable') === 'true'
    );
    const currentIndex = cells.indexOf(current);
    if (cells[currentIndex + 1]) {
      cells[currentIndex + 1].focus();
    }
  }
  // PageLeft: move to previous cell in the same row
  if (e.key === 'PageLeft') {
    e.preventDefault();
    const current = e.currentTarget;
    const parent = current.parentElement;
    const cells = Array.from(parent.children).filter(
      el => el.getAttribute('contenteditable') === 'true'
    );
    const currentIndex = cells.indexOf(current);
    if (cells[currentIndex - 1]) {
      cells[currentIndex - 1].focus();
    }
  }
    }}
            >
              {loadCase[factorKey] !== undefined ? loadCase[factorKey] : " "}
            </div>
          ))}
        </div>
      );
    })}
  <div style={{ display: "flex", alignItems: "center", width: "55%", marginLeft: "110px" }}>
    {Buttons.NodeButton("contained", "Add Row", handleAddLoadCase)}
    {Buttons.NodeButton("contained", "Delete Row", handleDeleteRow)}
  </div>
</Scrollbars>
        </div>
  </Panel>
  </Panel>
      <div style={{  width: '780px', height: '25px', display: 'flex', flexDirection: 'row', justifyContent: 'space-evenly', backgroundColor: 'white', padding: '10px'}}>
      {Buttons.SubButton("contained", "Export Load Combination", exportToExcel, exportLoading)}

{importLoading ? (
     Buttons.SubButton("contained", "Importing")
) : (
  Buttons.SubButton("contained", "Import Load Combination", handleImportClick)
)}

{Buttons.SubButton("contained", isGenerating ? "Generating..." : "Generate Load Combination", Generate_Load_Combination)}

      </div>
      <ExcelReader onImport={importLoadCombinationInput} handleFileChange={handleFileChange} />
      <input
          type="file"
          ref={fileInputRef}
          style={{ display: 'none' }}
          onChange={handleFileChange}
        /> 
      {/* </Panel> */}

		</GuideBox>
	</div>
  );
}

export default App;