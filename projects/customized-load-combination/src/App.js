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
const addLoadCaseTimeout = useRef(null);
const [civilComEnv, setCivilComeEnv] = useState({ "Assign": {} });
// let [loadNames, setLoadNames] = useState(null);
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
 
  
    // useEffect(() => {
    //   const fetchData = async () => {
    //     try {
    //       const stag = await midasAPI("GET", "/db/stag");
          
    //       if (stag && stag.hasOwnProperty("STAG")) {
    //         const initialLoadNames = [
    //           "Dead Load",
    //           "Tendon Primary",
    //           "Creep Primary",
    //           "Shrinkage Primary",
    //           "Tendon Secondary",
    //           "Creep Secondary",
    //           "Shrinkage Secondary",
    //         ];
  
    //         setLoadNames(initialLoadNames);
    //         setLoadNames_key(initialLoadNames.map(name => ({ key: "CS", name })));
    //       } else {
    //         setLoadNames([]);
    //         setLoadNames_key([]);
    //       }
    //     } catch (error) {
    //       console.error("Error fetching STAG data:", error);
    //       setLoadNames([]);
    //       setLoadNames_key([]);
    //     }
    //   };
  
    //   fetchData();
    // }, []);
  
  
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
        // } catch (error) {
        //   enqueueSnackbar("Error fetching in load cases", {
        //     variant: "error",
        //     anchorOrigin: { vertical: "top", horizontal: "center" },
        //   });
        // }
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
    console.log(loadNames);
    console.log(civilCom);
    console.log(loadCombinations);
    loadNames = Array.from(new Set(loadNames));
    console.log(loadNames);

    const workbook = new ExcelJS.Workbook();

    // Add a new worksheet to the workbook
    const worksheet = workbook.addWorksheet('Load Combinations');
    worksheet.getColumn('A').width = 25; // Increase width of column A
    worksheet.getColumn('D').width = 30; // Increase width of column D

    // Add headers to the first row
    worksheet.getCell('A1').value = 'Load Combination';
    worksheet.getCell('B1').value = 'Active';
    worksheet.getCell('C1').value = 'Type';
    worksheet.getCell('D1').value = 'Load Cases';
    worksheet.getCell('E1').value = 'Sign';
    worksheet.getCell('F1').value = 'Factor 1';
    worksheet.getCell('G1').value = 'Factor 2';
    worksheet.getCell('H1').value = 'Factor 3';
    worksheet.getCell('I1').value = 'Factor 4';
    worksheet.getCell('J1').value = 'Factor 5';
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).alignment = { horizontal: 'center', vertical: 'middle' };

    let rowIndex = 2; // Start from row 2 (since row 1 is for headers)
    let alternateColorToggle = true;
    loadCombinations.forEach((combination) => {
      const loadCombination = combination.loadCombination;
      const active = combination.active;
      const type = combination.type;

      // Calculate the number of rows to merge based on loadCases
      const numberOfLoadCases = combination.loadCases.length;
      const startRow = rowIndex;
      const endRow = rowIndex + numberOfLoadCases - 1;

      // Apply alternating background colors for rows
      const backgroundColor = alternateColorToggle ? 'FFCCFFCC' : 'FFD3D3D3'; // Light green and light grey
      for (let i = startRow; i <= endRow; i++) {
          worksheet.getRow(i).eachCell((cell) => {
              cell.fill = {
                  type: 'pattern',
                  pattern: 'solid',
                  fgColor: { argb: backgroundColor },
              };
          });
      }
      alternateColorToggle = !alternateColorToggle; // Toggle the color for the next combination

      // Merge cells in columns A, B, and C for this load combination
      worksheet.mergeCells(`A${startRow}:A${endRow}`);
      worksheet.getCell(`A${startRow}`).value = loadCombination;
      worksheet.getCell(`A${startRow}`).alignment = { horizontal: 'center', vertical: 'middle' };

      worksheet.mergeCells(`B${startRow}:B${endRow}`);
      worksheet.getCell(`B${startRow}`).value = active;
      worksheet.getCell(`B${startRow}`).alignment = { horizontal: 'center', vertical: 'middle' };

      worksheet.mergeCells(`C${startRow}:C${endRow}`);
      worksheet.getCell(`C${startRow}`).value = type;
      worksheet.getCell(`C${startRow}`).alignment = { horizontal: 'center', vertical: 'middle' };

      // Iterate over each loadCase and add the respective data (Load Cases, Sign, Factors)
      combination.loadCases.forEach((loadCase) => {
          const loadCaseName = loadCase.loadCaseName;
          const sign = loadCase.sign;
          const factor1 = loadCase.factor1;
          const factor2 = loadCase.factor2;
          const factor3 = loadCase.factor3 || ''; // Handle undefined factors
          const factor4 = loadCase.factor4 || '';
          const factor5 = loadCase.factor5 || '';

          // Add the Load Cases, Sign, and Factor values in the corresponding columns
          worksheet.getCell(`D${rowIndex}`).value = loadCaseName;
          worksheet.getCell(`E${rowIndex}`).value = sign;
          worksheet.getCell(`F${rowIndex}`).value = factor1;
          worksheet.getCell(`G${rowIndex}`).value = factor2;
          worksheet.getCell(`H${rowIndex}`).value = factor3;
          worksheet.getCell(`I${rowIndex}`).value = factor4;
          worksheet.getCell(`J${rowIndex}`).value = factor5;

          rowIndex++; // Move to the next row after processing each load case
      });
  });

    // Write the workbook to a buffer and save it as an Excel file
    workbook.xlsx.writeBuffer()
        .then((buffer) => {
            const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            saveAs(blob, 'Load_Combination_Input.xlsx'); // Save the file to the user's system
        })
        .catch((err) => {
            console.error('Error creating Excel file:', err);
        });
      } catch (error) {
        console.error("Error exporting:", error);
      } finally {
        setExportLoading(false);  // Set loading state back to false when done
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
  
        if (parentKey === "Either" || (parentKey === "Add" && firstKey === "Either") && temp.length > 0) {
          eitherArray.push(temp);
        } else if (parentKey === "Add" && (!firstKey || firstKey === "Add" || firstKey === "Envelope") && temp.length > 0) {
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
  // if (values["Generate inactive load combinations in midas"] && inactiveCombinations.length === 0) { 
  //   enqueueSnackbar("Please select at least one Load Combination of Inactive Active type", {
  //     variant: "error",
  //     anchorOrigin: { vertical: "top", horizontal: "center" },
  //   });
  //   return;
  // }
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
        loadCaseNames.add(loadCase.loadCaseName);
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
      if (factorObject && factorObject.value !== undefined  && factorObject.value !== "") {
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
// const uniqueFactors = [...new Set(nDimensionalArray)];
// console.log("Created N-Dimensional Array:", uniqueFactors);
        // for (let i = 1; i <= 5; i++) {
        //    delete loadCase[`factor${i}`];
        //  }
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
      allFinalCombinations.push(...joinedComb);
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
        combArray.forEach(subArray => allFinalCombinations.push(subArray));
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
          "ACTIVE": "ACTIVE",
          "bCB": false,
          "iTYPE": 0,
          "vCOMB": vCOMB
      };
    } else{
        backupCivilCom.Assign[`${idx + 1 + combinationCounter + initial_lc}`] = {
          "NAME": combinationName,
          "ACTIVE": "ACTIVE",
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
        "ACTIVE": "STRENGTH",
        "bCB": false,
        "iTYPE": 0,
        "vCOMB": allVCombEntries
    };
      // setCivilComeEnv(prevState => {
      //   let newAssign = { ...prevState.Assign };
      //   newAssign[`${last_value + 1}`] = {
      //     "NAME": combinationName,
      //     "ACTIVE": "STRENGTH",
      //     "bCB": true,
      //     "iTYPE": 1,
      //     "vCOMB": allVCombEntries
      //   };
      //   return { ...prevState, Assign: newAssign };
      // });
    } 
    setCivilComeEnv({ Assign: { ...backupCivilCom_env.Assign } });
  }
  console.log( "allcomb",allFinalCombinations);
  return allFinalCombinations;
}
console.log("env", civilComEnvValues);
console.log("Civil",civilCom);
console.log("Civil_env",civilComEnv);

function join_factor(finalCombinations_sign) {
  const deepFlatten = (arr) => {
    if (Array.isArray(arr)) {
      return arr.reduce((flat, item) => {
        if (Array.isArray(item)) {
          return flat.concat(deepFlatten(item));
        } else {
          return flat.concat(item);
        }
      }, []);
    } else {
      return [arr];
    }
  };
  const mergeFactors = (target, source) => {
    if (Array.isArray(source)) {
      for (let i = 0; i < source.length; i++) {
        if (Array.isArray(source[i])) {
          if (!target[i]) {
            target[i] = [];
          }
          mergeFactors(target[i], source[i]);
        } else {
          if (source[i] !== undefined) {
            target[i] = source[i] !== undefined ? source[i] : target[i];
          }
        }
      }
    }
  };

  if (typeof finalCombinations_sign === 'object' && finalCombinations_sign !== null) {
    const { addObj, eitherArray, envelopeObj,firstKey,secondLastKey } = finalCombinations_sign;
    let flattenedEitherArray = [], flattenedAddObj = [], flattenedEnvelopeObj = [];

    if (Array.isArray(eitherArray)) {
      eitherArray.forEach((arr) => {
        if (Array.isArray(arr)) {
          const groupedArray = [];
          arr.forEach((subArr) => {
            if (Array.isArray(subArr)) {
              groupedArray.push(deepFlatten(subArr));
            } else {
              groupedArray.push(subArr);
            }
          });
          if (groupedArray.length > 0) {
            flattenedEitherArray.push(groupedArray);
          }
        } else {
          flattenedEitherArray.push(arr);
        }
      });
    }
    // Flatten addObj
    if (Array.isArray(addObj) && addObj.length > 0) {
      addObj.forEach(mainArray => {
        if (Array.isArray(mainArray)) {
          let mainArrayGroup = []; 
          let combinedArray = [];
          if (mainArray.length === 1) {
            const currentArray = mainArray[0];
            if (currentArray.length === 1 && Array.isArray(currentArray[0]) && currentArray[0].every(item => !Array.isArray(item))) {
              combinedArray.push(currentArray);
              mainArrayGroup.push([...deepFlatten(combinedArray)]);
              combinedArray = [];
            } else {
              if (currentArray.length > 0) {
                const length = currentArray[0].length;
                // for (let i = 0; i < length; i++) {
                  let combinedArray = [];
                  for (let i = 0; i < length; i++) {
                    let shouldBreak = false;
                  currentArray.forEach(subArray => {
                    if (Array.isArray(subArray) && subArray.some(item => Array.isArray(item))) {
                      combinedArray.push(subArray[i]);
                    }
                     else {
                      combinedArray.push(subArray);
                      shouldBreak = true;
                    }
                  });
                  mainArrayGroup.push([...deepFlatten(combinedArray)]);
                  combinedArray = [];
                  if (shouldBreak) break; 
                 }
                }
              }
          } else {
            mainArray.forEach(currentArray => {
              if (currentArray.length > 0) {
                  let currentArrayGroup = [];
                  const containsNestedSubArray = currentArray.some(item => {
                      if (Array.isArray(item)) {
                          return item.some(subItem => Array.isArray(subItem));
                      }
                      return false;
                  });
                  if (!containsNestedSubArray) {
                      currentArrayGroup.push([...deepFlatten(currentArray)]);
                  } else {
                      const length = currentArray[0].length;
                      for (let i = 0; i < length; i++) {
                          let combinedArray = [];
                          currentArray.forEach(subArray => {
                              if (Array.isArray(subArray) && subArray[i]) {
                                  combinedArray.push(subArray[i]);
                              }
                          });
                          currentArrayGroup.push([...deepFlatten(combinedArray)]);
                      }
                  }
                  mainArrayGroup.push(currentArrayGroup);
              }
          });         
          }
          flattenedAddObj.push(mainArrayGroup);
        }
      });
  }
    if (Array.isArray(envelopeObj)) {
      envelopeObj.forEach(arr => {
        if (Array.isArray(arr)) {
          const groupedArray = []; 
          arr.forEach((subArr) => {
            if (Array.isArray(subArr)) {
              groupedArray.push(deepFlatten(subArr));
            } else {
              groupedArray.push(subArr);
            }
          });
          if (groupedArray.length > 0) {
            flattenedEnvelopeObj.push(groupedArray);
          }
        } else {
          flattenedEnvelopeObj.push(arr);
        }
      });
    }
    const combinedResults = {};
    const combineFactors = (items) => {
      let combinedResult = {};
      items.forEach(item => {
        if (item && typeof item === 'object') {
          if (item.loadCaseName && item.factor) {
            const key = `${item.loadCaseName}|${item.sign}`;
            if (!combinedResult[key]) {
              combinedResult[key] = {
                loadCaseName: item.loadCaseName,
                sign: item.sign,
                factor: [],
                previousKey: item.previousKey
              };
            }
            mergeFactors(combinedResult[key].factor, item.factor);
          } else if (item.specialKeys) {
            const key = `${item.previousKey}|specialKeys`;
            if (!combinedResult[key]) {
              combinedResult[key] = {
                specialKeys: [],
                previousKey: item.previousKey
              };
            }
            mergeFactors(combinedResult[key].specialKeys, item.specialKeys);
          }
        }
        
      });
      Object.keys(combinedResult).forEach(key => {
        if (!combinedResults[key]) {
          combinedResults[key] = combinedResult[key];
        } else {
          mergeFactors(combinedResults[key].factor, combinedResult[key].factor);
        }
      });
      return combinedResult;
    };

    const processFactorsArray = (commonArray) => {
      commonArray.forEach(itemArray => {
        // Check if itemArray is neither undefined nor an empty string
        if (itemArray && typeof itemArray !== 'string') {
          itemArray.forEach(subArray => {
            Object.keys(subArray).forEach(key => {
              // Check if the key is a number
              if (!isNaN(parseInt(key, 10))) {
                // If key is a number, go deeper into its nested key-value pairs
                const nestedObj = subArray[key];
                Object.keys(nestedObj).forEach(nestedKey => {
                  const factor = nestedObj[nestedKey].factor;
                  if (Array.isArray(factor)) {
                    nestedObj[nestedKey].factor = normalizeFactors(factor);
                  }
                });
              } else {
                // Follow the current process for non-integer keys
                const factor = subArray[key].factor;
                if (Array.isArray(factor)) {
                  subArray[key].factor = normalizeFactors(factor);
                }
              }
            });
          });
        }
      });
    };
    const commonArray_add = flattenedAddObj.map(mainArray => {
      // Check if mainArray is valid (not empty and is an array)
      if (Array.isArray(mainArray) && mainArray.length > 0) {
        if (mainArray.length > 1) {
            // If mainArray has more than one subarray, process each inner array
            return mainArray.map(subArray => {
                // Check if subArray is valid
                if (Array.isArray(subArray)) {
                    // If subArray doesn't contain nested arrays, send directly to combineFactors
                    if (!subArray.some(item => Array.isArray(item))) {
                        return combineFactors(subArray);
                    }
                    return subArray.map(innerArray => {
                        return Array.isArray(innerArray) ? combineFactors(innerArray) : innerArray;
                    });
                }
                return subArray;
            });
        }
        else {
          return mainArray.map(subArray => {
            return Array.isArray(subArray) ? [combineFactors(subArray)] : subArray;
          });
        }
      }
      return [];
    });
    
    const commonArray_Either = flattenedEitherArray.map(item => {
      if (Array.isArray(item)) {
        return item.map(subArray => combineFactors(Array.isArray(subArray) ? subArray : [subArray]));
      } else {
        return [combineFactors([item])];
      }
    });
    const commonArray_Envelope = flattenedEnvelopeObj.map(item => {
      if (Array.isArray(item)) {
        return item.map(subArray => combineFactors(Array.isArray(subArray) ? subArray : [subArray]));
      } else {
        return [combineFactors([item])];
      }
    });

    const normalizeFactors = (factorArray) => {
      if (!Array.isArray(factorArray)) return factorArray;
      return factorArray.map(item => {
        if (typeof item === 'object' && item !== null) {
          const maxKey = Math.max(...Object.keys(item).map(Number));
          for (let index = 0; index <= maxKey; index++) {
            if (!(index in item)) item[index] = undefined;
          }
          return item;
        } else {
          return item === "empty" ? undefined : item;
        }
      });
    };

    processFactorsArray(commonArray_add);
    processFactorsArray(commonArray_Either);
    processFactorsArray(commonArray_Envelope);

    console.log("Final Common Array of Results: Add", commonArray_add);
    console.log("Final Common Array of Results: Either", commonArray_Either);
    console.log("Final Common Array of Results: Envelope", commonArray_Envelope);

    return {
      add: commonArray_add,
      either: commonArray_Either,
      envelope: commonArray_Envelope,
      firstKey,
      secondLastKey
    };
  } else {
    console.error("finalCombinations_sign is not an object or is null:", finalCombinations_sign);
  }
}

function join(factorCombinations) {
  const joinArray = [];
  let extractedFactorsStore = {};
  let extractedFactorsStore_add = {}; let extractedFactorsStore_either = {};
  for (const combination of factorCombinations) {
    const join = [];
    let { add, either, envelope,firstKey,secondLastKey } = combination;
    let add_specialKeys = add;
    let either_specialKeys = either;
    let envelope_specialKeys = envelope;
    add = transformArray(add);
    either = transformArray(either);
    envelope = transformArray(envelope);
    function transformArray(inputArray) {
      // Deep clone the array first
      const processArray = (arr) => {
          return arr.map(item => {
              if (Array.isArray(item)) {
                  return processArray(item);
              } else if (typeof item === 'object' && item !== null) {
                  const newObj = {};
                  for (const key in item) {
                      if (!key.endsWith('|specialKeys')) {
                          newObj[key] = { ...item[key] };
                      }
                  }
                  return newObj;
              }
              return item;
          });
      };
      return processArray(inputArray);
  }
  add = transformArrays(add_specialKeys,add,either);
  either = transformArrays(either_specialKeys,add,either);
  envelope = transformArrays(envelope_specialKeys,add,either);

  function transformArrays(inputArray, add_specialKeys, either_specialKeys) {
    const clonedArray = JSON.parse(JSON.stringify(inputArray));
    clonedArray.forEach((outerArray) => {
      if (Array.isArray(outerArray)) {
        outerArray.forEach((innerArray) => {
          if (innerArray && typeof innerArray === "object") {
            Object.entries(innerArray).forEach(([key, value]) => {
              if (key.includes("|specialKeys")) {
                const specialKeysObject = value;
                if (specialKeysObject && specialKeysObject.specialKeys) {
                  const specialArray = specialKeysObject.specialKeys;
                  const loadcaseNames = [];
                  specialArray.forEach((outerItem) => {
                    if (outerItem && typeof outerItem === "object") {
                      Object.values(outerItem).forEach((nestedArray) => {
                        if (Array.isArray(nestedArray)) {
                          nestedArray.forEach((innerArray) => {
                            if (Array.isArray(innerArray)) {
                              innerArray.forEach((deepNestedItem) => {
                                if (
                                  deepNestedItem &&
                                  typeof deepNestedItem === "object"
                                ) {
                                  if (deepNestedItem.loadCaseName) {
                                    loadcaseNames.push(deepNestedItem.loadCaseName);
                                  } else {
                                    Object.values(deepNestedItem).forEach(
                                      (nestedValue) => {
                                        if (
                                          nestedValue &&
                                          typeof nestedValue === "object"
                                        ) {
                                          if (nestedValue.loadCaseName) {
                                            loadcaseNames.push(
                                              nestedValue.loadCaseName
                                            );
                                          }
                                        }
                                      }
                                    );
                                  }
                                }
                              });
                            }
                          });
                        }
                      });
                    }
                  });
                  console.log("Extracted loadcaseNames:", loadcaseNames);
  
                  let replacementArray = null;
                  let matchedArrayIndex = -1;
                  let matchedKeySource = null; 
                  add_specialKeys.forEach((specialKeyArray, arrayIndex) => {
                    if (Array.isArray(specialKeyArray)) {
                      for (let objectIndex = 0; objectIndex < specialKeyArray.length; objectIndex++) {
                        const specialKeyObject = specialKeyArray[objectIndex];
                        if (specialKeyObject && typeof specialKeyObject === "object") {
                          Object.entries(specialKeyObject).forEach(([key, value]) => {
                            const allLoadCaseNames = []; // Array to store all found loadCaseNames
                  
                            const collectLoadCaseNames = (obj) => {
                              if (obj && typeof obj === "object") {
                                Object.values(obj).forEach((innerValue) => {
                                  if (innerValue && typeof innerValue === "object") {
                                    if (innerValue.loadCaseName) {
                                      allLoadCaseNames.push(innerValue.loadCaseName);
                                    } else {
                                      collectLoadCaseNames(innerValue);
                                    }
                                  }
                                });
                              }
                            };
                  
                            collectLoadCaseNames(value); // Start collecting loadCaseName values
                  
                            if (allLoadCaseNames.some((name) => loadcaseNames.includes(name))) {
                              replacementArray = [specialKeyArray];
                              matchedArrayIndex = arrayIndex;
                              matchedKeySource = "add_specialKeys"; // Mark the source
                            }
                          });
                        }
                      }
                    }
                  });
                  
                  // If no match found in add_specialKeys, check either_specialKeys
                  if (!replacementArray) {
                    either_specialKeys.forEach((specialKeyArray, arrayIndex) => {
                      if (Array.isArray(specialKeyArray)) {
                        for (let objectIndex = 0; objectIndex < specialKeyArray.length; objectIndex++) {
                          const specialKeyObject = specialKeyArray[objectIndex];
                          if (specialKeyObject && typeof specialKeyObject === "object") {
                            Object.entries(specialKeyObject).forEach(([key, value]) => {
                              const allLoadCaseNames = []; // Array to store all found loadCaseNames
                  
                              const collectLoadCaseNames = (obj) => {
                                if (obj && typeof obj === "object") {
                                  Object.values(obj).forEach((innerValue) => {
                                    if (innerValue && typeof innerValue === "object") {
                                      if (innerValue.loadCaseName) {
                                        allLoadCaseNames.push(innerValue.loadCaseName);
                                      } else {
                                        collectLoadCaseNames(innerValue);
                                      }
                                    }
                                  });
                                }
                              };
                  
                              collectLoadCaseNames(value); // Start collecting loadCaseName values
                  
                              if (allLoadCaseNames.some((name) => loadcaseNames.includes(name))) {
                                replacementArray = [specialKeyArray];
                                matchedArrayIndex = arrayIndex;
                                matchedKeySource = "either_specialKeys"; // Mark the source
                              }
                            });
                          }
                        }
                      }
                    });
                  }
                  
                  // Replace the specialKeys array if a match is found
                  if (replacementArray) {
                    if (specialKeysObject && specialKeysObject.hasOwnProperty('specialKeys')) {
                      // Iterate over the key-value pairs in the specialKeys object
                      Object.entries(specialKeysObject.specialKeys).forEach(([key, value]) => {
                        
                        // If the key is one of the specified strings, replace its value
                        if (key === "Add" || key === "Either" || key === "Envelope") {
                          specialKeysObject.specialKeys[key] = replacementArray;  // Replace the value for the specific key
                        }
                    
                        // If the key is a number, inspect its value
                        else if (!isNaN(key)) {
                          // If the value is an object, check for key:value pairs within it
                          if (typeof value === "object" && value !== null) {
                            Object.entries(value).forEach(([nestedKey, nestedValue]) => {
                              // Check for your specific conditions within the nested key-value pair
                              if (nestedKey === "Add" || nestedKey === "Either") {
                                // Replace nested value or take any other action as needed
                                value[nestedKey] = replacementArray;
                              }
                            });
                          }
                        }
                      });
                    }                    
                  
                    // Make the matched specialKeyArray null in its original position
                    if (matchedKeySource === "add_specialKeys") {
                      add_specialKeys[matchedArrayIndex] = null;
                    } else if (matchedKeySource === "either_specialKeys") {
                      either_specialKeys[matchedArrayIndex] = null;
                    }
                  }
                  
                }
              }
            });
          }
        });
      }
    });
  
    return clonedArray;
  }
  
   console.log(add);
   console.log(either);
    const eitherJoin = [];
    const envelopeJoin  = [];
    console.log(either);
    console.log(add);
    console.log(envelope);
    function getSingleFactor(factor, factorIndex, i) {
      if (factor.length > factorIndex) {
        let value = factor[factorIndex];
        if (!Array.isArray(value) && i === 0) {
          return value;
        }
        if (Array.isArray(value) && value.length > 1) {
          const flattenedArray = value.flat();
          if (flattenedArray.length > i) {
            return flattenedArray[i];
          }
        }
      }
      return undefined;
    }
    function extractFactorsFromObject(factorObj, factorIndex, i,type) {
      const extractedFactors = [];
    
      for (const key in factorObj) {
  if (factorObj.hasOwnProperty(key)) {
    if (!isNaN(key)) {
      // Handle numeric keys
      const value = factorObj[key];
      if (value && typeof value === "object") {
        // Process the value recursively or handle it as needed
        extractedFactors.push(...extractFactorsFromObject(value, factorIndex, i,type));
      }
    } 
    else if (key.includes("specialKeys")) {  // General check for any specialKeys
      const { specialKeys } = factorObj[key] || {};
      if (specialKeys && Array.isArray(specialKeys)) {
        Object.entries(specialKeys).forEach(([key, value]) => {
          // Check if the key is 'Add' and if the value is an array
          if (key === "Add" && Array.isArray(value)) {
            // Process each item in the 'Add' array
            value.forEach(item => {
              extractedFactors.push(extractFactorsFromObject(item, factorIndex, i,type));
            });
          }
          
          // Check if the key is a number (like 0, 1, 2, etc.)
          else if (!isNaN(key)) {
            Object.entries(value).forEach(([innerKey, innerValue]) => {
              if (innerKey === "Add" && Array.isArray(innerValue)) {
                innerValue.forEach(item => {
                  if (Array.isArray(item)) {
                    item.forEach(subItem => {
                      extractedFactors.push(extractFactorsFromObject(subItem, factorIndex, i,type));
                    });
                  }
                  else if (item && typeof item === "object") {
                    extractedFactors.push(extractFactorsFromObject(item, factorIndex, i,type));
                  }
                  else {
                  }
                });
              }
            });
          }
        });
        specialKeys.forEach(innerObj => {
          if (innerObj && typeof innerObj === "object") {
            if ('Either' in innerObj) {
              const flattenedInnerObj = Array.isArray(innerObj) ? innerObj.flat(1) : [innerObj];
              extractedFactors.push(...extractFactorsFromObject(flattenedInnerObj, factorIndex, i,type));
            }
          }
        });
      }
    }
    else {
      const { loadCaseName, sign, factor } = factorObj[key];
      let factorValue;
      if (factor !== undefined && factor !== null && factor !== "") {
        factorValue = getSingleFactor(factor, factorIndex, i);
      }
      if (factorValue !== undefined && factorValue !== 0 && factorValue !== null && factorValue !== "") {
        extractedFactors.push({ loadCaseName, sign, factor: factorValue });
      }
    }
  }
}
if (type == "add") {
if (!extractedFactorsStore_add[factorIndex]) {
  extractedFactorsStore_add[factorIndex] = [];
}
extractedFactorsStore_add[factorIndex][i] = extractedFactors;
      return extractedFactors;
} else {
    if (!extractedFactorsStore_either[factorIndex]) {
      extractedFactorsStore_either[factorIndex] = [];
    }
    extractedFactorsStore_either[factorIndex][i] = extractedFactors;
    return extractedFactors;
} 
    }
    function combineMatchingFactors(either, factorIndex, i, either_specialKeys,type,check) {
      console.log(either_specialKeys);
      console.log(either);
      let combinedResult = []; let fullyFlattenedResult = [];
     if(check) {
      const separateExtractedFactors = [];
      either.forEach((arr, arrIndex) => {
          if (Array.isArray(arr)) {
            let extractedFactors;
            if (type === "add") {
              extractedFactors = either.flatMap(arr => {
                const commonArray = [];
                if (Array.isArray(arr) && arr.length > 1) {
                  let combo = [];
                    arr.forEach(subArray => {
                        const flattenedArr = Array.isArray(subArray) ? subArray.flat() : [subArray];
                        const subArrayResults = flattenedArr.flatMap(factorObj => {
                            if (Array.isArray(factorObj)) {
                                return factorObj.map(innerObj => extractFactorsFromObject(innerObj, factorIndex, i,type));
                            } else {
                                return [extractFactorsFromObject(factorObj, factorIndex, i,type)];
                            }
                        });
                        combo.push(subArrayResults);
                    });
                    commonArray.push(combo);
                } else {
                    const flattenedArr = Array.isArray(arr) ? arr.flat() : [arr];
                    const singleArrayResults = flattenedArr.flatMap(factorObj => {
                        if (Array.isArray(factorObj)) {
                            return factorObj.flatMap(innerObj => extractFactorsFromObject(innerObj, factorIndex, i,type));
                        } else {
                            return [extractFactorsFromObject(factorObj, factorIndex, i,type)];
                        }
                    });
                    commonArray.push(singleArrayResults); 
                }
                
                return commonArray;
            });
            
          } else {
            extractedFactors = arr.flatMap(subArray => {
              const flattenedArr = Array.isArray(subArray) ? subArray.flat() : [subArray];
              return flattenedArr.flatMap(factorObj => {
                  if (Array.isArray(factorObj)) {
                      return factorObj.map(innerObj => extractFactorsFromObject(innerObj, factorIndex, i,type));
                  } else {
                      return [extractFactorsFromObject(factorObj, factorIndex, i,type)];
                  }
              });
          });
          }
              separateExtractedFactors.push(extractedFactors);
            
          } else {
              console.warn(`Non-array element encountered in either at index ${arrIndex}, skipping:`, arr);
          }
      });
      if (type == add) {
      if (!extractedFactorsStore_add[factorIndex]) {
        extractedFactorsStore_add[factorIndex] = [];
    }
    extractedFactorsStore_add[factorIndex][i] = separateExtractedFactors;
      } else {
        if (!extractedFactorsStore_either[factorIndex]) {
          extractedFactorsStore_either[factorIndex] = [];
      }
      extractedFactorsStore_either[factorIndex][i] = separateExtractedFactors;
      }
      separateExtractedFactors.forEach((factorsGroup, groupIndex) => {
          const groupCombinedResult = [];
          
          function generateCombinations(arrays, temp = [], index = 0) {
              if (index === arrays.length) {
                  groupCombinedResult.push([...temp]);
                  return;
              }
              for (const item of arrays[index]) {
                  temp.push(item);
                  generateCombinations(arrays, temp, index + 1);
                  temp.pop();
              }
          }
          generateCombinations(factorsGroup);
          if (Array.isArray(groupCombinedResult)) {
              combinedResult.push({
                  groupIndex,
                  combinations: groupCombinedResult.map(innerArray => {
                      if (Array.isArray(innerArray)) {
                          const flattenedArray = [];
                          innerArray.forEach(item => {
                              if (Array.isArray(item)) {
                                  flattenedArray.push(...item);
                              } else {
                                  flattenedArray.push(item);
                              }
                          });
                          return flattenedArray;
                      }
                      return innerArray;
                  }),
              });
          }
      });
     } else {
      let extractedFactors;
      if (type === "add") {
        extractedFactors = either.flatMap(arr => {
          let commonArray = []; 
          
          if (Array.isArray(arr) && arr.length > 1) {
            let combo = [];
              arr.forEach(subArray => {
                  const flattenedArr = Array.isArray(subArray) ? subArray.flat() : [subArray];
                  const subArrayResults = flattenedArr.flatMap(factorObj => {
                      if (Array.isArray(factorObj)) {
                          return factorObj.map(innerObj => extractFactorsFromObject(innerObj, factorIndex, i,type));
                      } else {
                          return [extractFactorsFromObject(factorObj, factorIndex, i,type)];
                      }
                  });
                  combo.push(subArrayResults); 
              });
              commonArray.push(combo); 
          } else {
              const flattenedArr = Array.isArray(arr) ? arr.flat() : [arr];
              const singleArrayResults = flattenedArr.flatMap(factorObj => {
                  if (Array.isArray(factorObj)) {
                      return factorObj.flatMap(innerObj => extractFactorsFromObject(innerObj, factorIndex, i,type));
                  } else {
                      return [extractFactorsFromObject(factorObj, factorIndex, i,type)];
                  }
              });
              commonArray.push(singleArrayResults);
          }
          return commonArray;
      });
      
    } else {
      extractedFactors = either.flatMap(arr => {
        if (Array.isArray(arr) && arr.length > 1) {
          return arr.flatMap(subArray => {
            const flattenedArr = Array.isArray(subArray) ? subArray.flat() : [subArray];
              return flattenedArr.flatMap(factorObj => {
                if (Array.isArray(factorObj)) {
                  return factorObj.map(innerObj => extractFactorsFromObject(innerObj, factorIndex, i,type));
                } else {
                  return [extractFactorsFromObject(factorObj, factorIndex, i,type)];
                }
              });
          });
        } else {
          const flattenedArr = Array.isArray(arr) ? arr.flat() : [arr];
          return flattenedArr.flatMap(factorObj => {
            if (Array.isArray(factorObj)) {
              return factorObj.flatMap(innerObj => extractFactorsFromObject(innerObj, factorIndex, i,type));
            } else {
              return [extractFactorsFromObject(factorObj, factorIndex, i,type)];
            }
          });
        }
      });
    }
    if (type == add) {
      if (!extractedFactorsStore_add[factorIndex]) {
        extractedFactorsStore_add[factorIndex] = [];
      }
      extractedFactorsStore_add[factorIndex][i] = extractedFactors;
    } else {
      if (!extractedFactorsStore_either[factorIndex]) {
        extractedFactorsStore_either[factorIndex] = [];
      }
      extractedFactorsStore_either[factorIndex][i] = extractedFactors;
    }
      function generateCombinations(arrays, temp = [], index = 0) {
        if (type === 'add') {
          function combineSubarrays(subarrays, temp = [], subIndex = 0, currentResult = []) {
            if (subIndex === subarrays.length) {
              currentResult.push([...temp]);
              return;
            }
            for (const item of subarrays[subIndex]) {
              temp.push(item);
              combineSubarrays(subarrays, temp, subIndex + 1, currentResult);
              temp.pop();
            }
          }
          for (const factorArray of arrays) {
            const factorArrayResult = []; 
            if (Array.isArray(factorArray[0])) {
              combineSubarrays(factorArray, [], 0, factorArrayResult);
            } else {
              factorArrayResult.push([...factorArray]);
            }
            combinedResult.push(factorArrayResult);
          }
          function joinAllSubarrays(combinedResult, temp = [], index = 0, result = []) {
            if (index === combinedResult.length) {
              result.push([...temp]); // Push the current combination of subarrays
              return;
            }
            for (const item of combinedResult[index]) {
              temp.push(item); // Add the current item
              joinAllSubarrays(combinedResult, temp, index + 1, result); // Recur for the next array
              temp.pop(); // Backtrack to explore other combinations
            }
          }
          const finalResult = [];
          joinAllSubarrays(combinedResult, [], 0, finalResult);
          const processedResult = finalResult
  .map(array => array.flat()) // Flatten each combination
  .filter(array => array.length > 0); // Remove arrays with zero elements

console.log(processedResult);
if (processedResult.length > 1){
fullyFlattenedResult = processedResult.map(array => array.flat()); 
} else {
  fullyFlattenedResult = processedResult;
}
if (either.flat(1).length === 1) {
  fullyFlattenedResult = [fullyFlattenedResult.flat(Infinity)];
}
console.log(fullyFlattenedResult);

          return;
        }  else {
        if (index === arrays.length) {
          combinedResult.push([...temp]);
          return;
        }
        for (const item of arrays[index]) {
          temp.push(item);
          generateCombinations(arrays, temp, index + 1);
          temp.pop();
        } 
      }
      }
      generateCombinations(extractedFactors);
      if (type === "add") {
      if (Array.isArray(combinedResult)) {
        combinedResult = combinedResult.map(innerArray => {
          if (Array.isArray(innerArray)) {
            const flattenedArray = [];
            innerArray.forEach(item => {
              if (Array.isArray(item)) {
                flattenedArray.push(...item);
              } else {
                flattenedArray.push(item);
              }
            });
            return flattenedArray; 
          }
          return innerArray; 
        });
      } }
     }
     if (type === "add") {
      return fullyFlattenedResult;
     } else {
      return combinedResult;
     }  
  }
  
    function getMaxIValue(either) {
      let maxIValue = 5;  
      either.forEach(arr => {
        arr.forEach(item => {
          Object.keys(item).forEach(key => {
            const subItem = item[key];
            if (subItem && subItem.factor && Array.isArray(subItem.factor)) {
              const factorDepth = getArrayDepth(subItem.factor);
              maxIValue = Math.max(maxIValue, Math.pow(5, factorDepth - 1));
            }
          });
        });
      });
      return maxIValue;
    }
    function getArrayDepth(array) {
      let depth = 1;
      let current = array;
      while (Array.isArray(current[0])) {
        depth += 1;
        current = current[0];
      }
      return depth;
    }
    let maxI;
    if (either !== undefined){
        maxI = getMaxIValue(either, add);
    }
    console.log('Max i value based on dimensionality:', maxI);
    
    function combineLoadCases(either, add, envelope,type) {
      let allCombinations = [];
      const addmulti = [];
      const factorLimit = either.length;
      const maxI = getMaxIValue(either, add);
      console.log(maxI);
      for (let factorIndex = 0; factorIndex < 5; factorIndex++) {
        console.log(factorIndex);
        addmulti[factorIndex] = [];
        for (let i = 0; i < maxI; i++) {
          let check;
          let factorCombinations = [];
          if (firstKey === "Either" || firstKey === "Envelope") {
            let modifiedArray = [];
            let nonModifiedArray = [];
            const modifiedEither = either.map(eitherArray => {
                if (Array.isArray(eitherArray) && eitherArray.length > 0) {
                    const allHaveSamePreviousKey = eitherArray.every(obj => {
                        const previousKeys = Object.values(obj).map(innerObj => innerObj?.previousKey);
                        return previousKeys.every(key => key === previousKeys[0]);
                    });
                    if (allHaveSamePreviousKey && Object.values(eitherArray[0])[0]?.previousKey === "Either") {
                        const separatedArrays = eitherArray.map(obj => [obj]); 
                        modifiedArray.push(...separatedArrays);      
                    } else if (eitherArray.length === 1) {
                        nonModifiedArray.push(eitherArray);
                    }
                }
                return eitherArray;
            }); 
            let combinedArrays = [];
            if (modifiedArray.length > 0 && nonModifiedArray.length > 0) {
                modifiedArray.forEach(modified => {
                    nonModifiedArray.forEach(nonModified => {
                        combinedArrays.push([...modified, ...nonModified]);
                    });
                });
            }
            let result = combineMatchingFactors(combinedArrays, factorIndex, i, either_specialKeys,type,check);
            factorCombinations.push(...result);
            if (combinedArrays.length === 0) {
              factorCombinations = combineMatchingFactors(either,factorIndex,i,either_specialKeys,type,check=false);
            }
            console.log(factorCombinations);
            addmulti[factorIndex][i] = factorCombinations;
        } else if (firstKey === "Add") {
            let modifiedArray = [];
            let nonModifiedArray = [];
            const modifiedEither = either.map(eitherArray => {
                if (Array.isArray(eitherArray) && eitherArray.length > 1) {
                    const allHaveSamePreviousKey = eitherArray.every(obj => {
                        const previousKeys = Object.values(obj).map(innerObj => innerObj?.previousKey);
                        return previousKeys.every(key => key === previousKeys[0]);
                    });
                    if (allHaveSamePreviousKey && Object.values(eitherArray[0])[0]?.previousKey === "Either") {
                        const separatedArrays = eitherArray.map(obj => [obj]); 
                        modifiedArray.push(...separatedArrays); 
                    } 
                }
                else if (
                  eitherArray.length === 1
                ) {
                  nonModifiedArray.push(eitherArray);  
              }
            }); 
            console.log("nonModifiedArray", nonModifiedArray)
            let combinedArrays = [];
        
            if (modifiedArray.length > 0 && nonModifiedArray.length > 0) {
                modifiedArray.forEach(modified => {
                    nonModifiedArray.forEach(nonModified => {
                        combinedArrays.push([...modified, ...nonModified]);
                    });
                });
            }
            let result = combineMatchingFactors(combinedArrays, factorIndex, i, either_specialKeys,type,check=true);
            factorCombinations.push(...result);
            if (combinedArrays.length === 0) {
              factorCombinations = combineMatchingFactors(either,factorIndex,i,either_specialKeys,type,check=false);
            }
            console.log(factorCombinations);
            addmulti[factorIndex][i] = factorCombinations;
        }
        const allComb = [];
        if (type != "add") {
        add.forEach((addArray, arrayIndex) => {
          if (Array.isArray(addArray) && addArray.length > 0) {
            const currentArrayCombinations = [];
            const generateCombinations = (subArrays, index, currentCombination) => {
              if (index === subArrays.length) {
                currentArrayCombinations.push([...currentCombination]);
                return;
              }
              
              const currentSubArray = subArrays[index];
              if (Array.isArray(currentSubArray)) {
                currentSubArray.forEach(item => {
                  currentCombination.push(item);
                  generateCombinations(subArrays, index + 1, currentCombination);
                  currentCombination.pop();
                });
              }
            };
            
            generateCombinations(addArray, 0, []);
            if (currentArrayCombinations.length === 0 && addArray.length > 0) {
              currentArrayCombinations.push(...addArray);
            }
            allComb.push(currentArrayCombinations);
          }
        });}
const finalCombinations = [];
let joinArrays = (arrays, index, currentCombination) => {
  if (index === arrays.length) {
    finalCombinations.push([...currentCombination.flat()]);
    return;
  }
  const currentArray = arrays[index];
  currentArray.forEach(combination => {
    currentCombination.push(combination);
    joinArrays(arrays, index + 1, currentCombination);
    currentCombination.pop();
  });
};
if (allComb.length > 0) {
  joinArrays(allComb, 0, []);
}
        finalCombinations.forEach(combination => {
          factorCombinations.forEach(factorCombination => {
            const combinedResult = [];
            if (Array.isArray(combination)) {
              combination.forEach(item => {
                Object.keys(item).forEach(key => {
                  if (!isNaN(parseInt(key, 10))) {
                    const nestedObj = item[key];
                    Object.keys(nestedObj).forEach(nestedKey => {
                      const nestedValue = nestedObj[nestedKey];
                      const loadCaseName = nestedValue.loadCaseName;
                      const sign = nestedValue.sign;
                      const factor = nestedValue.factor;
                      let factorValue;
                      if (factor !== undefined && factor !== "") {
                        factorValue = getSingleFactor(factor, factorIndex, i);
                      }
                      if (factorValue !== undefined && factorValue !== null && factorValue !== 0 && factor !== "") {
                        combinedResult.push({ loadCaseName, sign, factor: factorValue });
                      }
                    });
                  } else {
                    const value = item[key];
                    const loadCaseName = value.loadCaseName;
                    const sign = value.sign;
                    let factor;
                  if (value.factor !== undefined && value.factor !== null && value.factor !== 0) {
                    factor = value.factor;
                  }
                    let factorValue;
                    if (factor !== undefined && factor !== "") {
                      factorValue = getSingleFactor(factor, factorIndex, i);
                    }
                    if (factorValue !== undefined && factorValue !== null && factorValue !== 0 && factor !== "") {
                      combinedResult.push({ loadCaseName, sign, factor: factorValue });
                    }
                  }
                });
              });
            } else if (typeof combination === "object" && combination !== null) {
              Object.keys(combination).forEach(key => {
                if (!isNaN(parseInt(key, 10))) {
                  const nestedObj = combination[key];
                  Object.keys(nestedObj).forEach(nestedKey => {
                    const nestedValue = nestedObj[nestedKey];
                    const loadCaseName = nestedValue.loadCaseName;
                    const sign = nestedValue.sign;
                    let factor;
                  if (nestedValue.factor !== undefined && nestedValue.factor !== null && nestedValue.factor !== 0) {
                    factor = nestedValue.factor;
                  }
                    let factorValue;
                    if (factor !== undefined && factor !== "") {
                      factorValue = getSingleFactor(factor, factorIndex, i);
                    }
                    if (factorValue !== undefined && factorValue !== null && factorValue !== 0 && factor !== "") {
                      combinedResult.push({ loadCaseName, sign, factor: factorValue });
                    }
                  });
                } else {
                  const value = combination[key];
                  const loadCaseName = value.loadCaseName;
                  const sign = value.sign;
                  let factor;
                  if (value.factor !== undefined && value.factor !== null && value.factor !== 0) {
                    factor = value.factor;
                  }
                  let factorValue;
                  if (factor !== undefined && factor !== "") {
                    factorValue = getSingleFactor(factor, factorIndex, i);
                  }
                  if (factorValue !== undefined && factorValue !== null && factorValue !== 0 && factor !== "") {
                    combinedResult.push({ loadCaseName, sign, factor: factorValue });
                  }
                }
              });
            }
                if (combinedResult.length > 0) {
                  if (factorCombination.combinations) {
                    const extractedCombinations = factorCombination.combinations;
                    extractedCombinations.forEach(innerArray => {
                      const tempCombinedResult = [...combinedResult, ...innerArray];
                      allCombinations.push(tempCombinedResult);
                    });
                  } else {
                    const tempCombinedResult = [...combinedResult, ...factorCombination];
                    allCombinations.push(tempCombinedResult);
                   
                  }
                } else {
                  if (factorCombination.combinations) {
                    const extractedCombinations = factorCombination.combinations;
                    extractedCombinations.forEach(innerArray => {
                      const tempCombinedResult = [...innerArray];
                      allCombinations.push(tempCombinedResult);
                    });
                  } else {
                    const tempCombinedResult = [...factorCombination];
                    allCombinations.push(tempCombinedResult);
                   
                  }
                }
            });
          });
        
          const nonEmptyFactorCombinations = factorCombinations.filter(factor => factor.length > 0);
          if (add.length === 0 && nonEmptyFactorCombinations.length > 0) {
            allCombinations.push(...factorCombinations);
          }
          if (type === "add") {
            factorCombinations.forEach(factorCombination => {
              if (Array.isArray(factorCombination) && factorCombination.some(subArray => Array.isArray(subArray))) {
                // If factorCombination contains subarrays, process each subarray
                factorCombination.forEach(subArray => {
                  if (Array.isArray(subArray) && subArray.length > 0) {
                    allCombinations.push(subArray);
                  }
                });
              } else if (factorCombination.length > 0) {
                allCombinations.push(factorCombination);
              }
            });            
            allCombinations = allCombinations.filter(array => array.length > 0);
          }
        }
      }
      let nestedArrayCount = 0; 
      if (type === "add") {
      outerLoop: for (const [key, value] of Object.entries(extractedFactorsStore_add)) {
        if (Array.isArray(value)) {
          for (const innerArray of value) {
            if (Array.isArray(innerArray) && innerArray.length > 0) {
              if (innerArray.some(item => 
                Array.isArray(item) && item.length > 0 && item.some(subItem => Array.isArray(subItem))
              )) {
                nestedArrayCount += innerArray.length;
                break outerLoop;
              } else {
              }
            }
          }
        }
      } } else {
        outerLoop: for (const [key, value] of Object.entries(extractedFactorsStore_either)) {
          if (Array.isArray(value)) {
            for (const innerArray of value) {
              if (Array.isArray(innerArray) && innerArray.length > 0) {
                if (innerArray.some(item => 
                  Array.isArray(item) && item.length > 0 && item.some(subItem => Array.isArray(subItem))
                )) {
                  nestedArrayCount += innerArray.length;
                  break outerLoop;
                } else {
                }
              }
            }
          }
        }
      }

console.log('Extracted Factors:add', extractedFactorsStore_add);
console.log('Extracted Factors:either', extractedFactorsStore_either);
console.log('All Combinations:', allCombinations);
console.log('Number of Nested Arrays from First Inner Arrays:', nestedArrayCount);
const extractedValues_either = Object.values(extractedFactorsStore_either);
const extractedValues_add = Object.values(extractedFactorsStore_add);
const mergeArray = [];
function getCustomCombinations(arrays,arrays_1) {
  const result = [];
  const filteredArrays = arrays.filter(
    arr => arr.some(subArray => subArray.length > 0)
  );
  const flatArrays1 = arrays_1.flat();
  const arrays1Length = arrays_1.length;
  function buildCombination(currentCombination, currentIndex) {
    if (currentIndex === filteredArrays.length) {
      result.push([...currentCombination]);
      return;
    }
    if (filteredArrays[currentIndex].length === 0) {
      buildCombination(currentCombination, currentIndex + 1);
      return;
    }
    if (currentIndex === 0) {
      filteredArrays[currentIndex].forEach((subArray, index) => {
        if (filteredArrays[currentIndex + 1] !== undefined) {
          const nextSubArray = filteredArrays[currentIndex + 1][filteredArrays[currentIndex + 1].length - 1 - index];
          if (subArray.length > 0 && nextSubArray.length > 0) {
            if (arrays_1.flat(1).length === 1) {
              currentCombination.push(nextSubArray); 
            } else {
              currentCombination.push(subArray, nextSubArray); 
            }
            buildCombination(currentCombination, currentIndex + 2); 
            currentCombination.pop(); 
            currentCombination.pop(); 
          }
        }
      });
    }
  }
  buildCombination([], 0);
  filteredArrays.forEach(filteredArray => {
    if (JSON.stringify(filteredArray) !== JSON.stringify(flatArrays1)) {
      result.push(filteredArray);
    }
  });
  return result;
}
let loopCount = nestedArrayCount > 0 ? nestedArrayCount : 1;
for (let loopIndex = 0; loopIndex < loopCount; loopIndex++) {      
  let iterationArray = [];
for (let j = 0; j < 5; j++) {
  for (let i = 0; i < 5; i++) {
      let baseInnerArray;
      if (type == "add"){
      if ( loopCount === 1) { 
        baseInnerArray = extractedValues_add[i][j];
      } else {
        baseInnerArray = extractedValues_add[i][j][loopIndex]; 
      }} else {
        if ( loopCount === 1) { 
          baseInnerArray = extractedValues_either[i][j];
        } else {
          baseInnerArray = extractedValues_either[i][j][loopIndex]; 
        }
      }
    const fixedElement = baseInnerArray[0];
    let elementsToPermute = [baseInnerArray.slice(1)];
    let elementsToPermute_first = [baseInnerArray.slice(1)];
    for (let k = 0; k < 5; k++) {
      if (k === i) continue;
      let additionalArray;
      if (type == "add"){
      if ( loopCount === 1) { 
        additionalArray = extractedValues_add[k][j];
      } else {
        additionalArray = extractedValues_add[k][j][loopIndex]; 
      } } else { 
        if ( loopCount === 1) { 
          additionalArray = extractedValues_either[k][j];
        } else {
          additionalArray = extractedValues_either[k][j][loopIndex]; 
        }
      }
      if (additionalArray && additionalArray.length > 1) {
        const nonEmptyElements = additionalArray.slice(1);
        elementsToPermute.push(nonEmptyElements);
      }
    }
    console.log(elementsToPermute);
    const permutations = getCustomCombinations(elementsToPermute,elementsToPermute_first);
    permutations.forEach(perm => {
      const mergedInnerArray = [fixedElement, ...perm];
      if (mergedInnerArray.every(el => el && el.length > 0)) {
        iterationArray.push(mergedInnerArray);
      }
    });
  }
}
if (iterationArray.length > 0) {
  mergeArray.push([...iterationArray]);
}
 }
console.log(mergeArray);
      function generateCombinations(arrays, tempResult = [], index = 0, finalCombinations = []) {
        if (index === arrays.length) {
          finalCombinations.push([...tempResult]);
          return;
        }
        if (Array.isArray(arrays[index])) {
          for (const item of arrays[index]) {
            tempResult.push(item); 
            generateCombinations(arrays, tempResult, index + 1, finalCombinations);  
            tempResult.pop();  
          }
        } else {
        }
        return finalCombinations;
      }
      let combinedResult  = [];
      for (const outerArray of mergeArray) {
        let finalCombinations = [];
        let combinations = [];
        for (let subArray of outerArray) {
            combinations = generateCombinations(subArray);
            finalCombinations.push(combinations);
        }
        combinedResult.push(finalCombinations);
      }
      console.log(combinedResult);
      let addresult = {};

for (let factorIndex = 0; factorIndex < 5; factorIndex++) {
  for (let i = 0; i < 5; i++) {
    if (!addresult[factorIndex]) {
      addresult[factorIndex] = {};
    }
    addresult[factorIndex][i] = [];
    let finalResults = [];
    add.forEach(addArray => {
      if (Array.isArray(addArray) && addArray.length > 0) {
        addArray.forEach(item => {
          let itemResults = [];
          if (Array.isArray(item)) {
            item.forEach(subItem => {
              const processedSubItem = processItem(subItem);
              itemResults.push(processedSubItem);
            });
          } else {
            const processedItem = processItem(item); 
            itemResults.push(processedItem);
          }
          finalResults.push(itemResults);
          if (itemResults.length > 0) {
            addresult[factorIndex][i].push(itemResults);
          }
        });
      }
    });
    function processItem(item) {
      let addmultiResult = [];
      Object.keys(item).forEach(key => {
        if (!isNaN(parseInt(key, 10))) {
          const nestedObj = item[key];
          Object.keys(nestedObj).forEach(nestedKey => {
            const nestedValue = nestedObj[nestedKey];
            const loadCaseName = nestedValue.loadCaseName;
            const sign = nestedValue.sign;
            const factor = nestedValue.factor;
            let factorValue;
            if (factor !== undefined && factor !== null && factor !== '') {
              factorValue = getSingleFactor(factor, factorIndex, i);
            }
            if (factorValue !== undefined && factorValue !== null && factorValue !== 0 && factorValue !== '') {
              addmultiResult.push({ loadCaseName, sign, factor: factorValue });
            }
          });
        } else {
          const value = item[key];
          const loadCaseName = value.loadCaseName;
          const sign = value.sign;
          const factor = value.factor;
          let factorValue;
    
          if (factor !== undefined && factor !== null && factor !== '') {
            factorValue = getSingleFactor(factor, factorIndex, i);
          }
    
          if (factorValue !== undefined && factorValue !== null && factorValue !== 0 && factorValue !== '') {
            addmultiResult.push({ loadCaseName, sign, factor: factorValue });
          }
        }
      });
      console.log(addmultiResult);
      return addmultiResult; 
    }
    console.log(finalResults);
  }
}
console.log(addresult);

Object.keys(addresult).forEach((outerKey) => {
  const outerValue = addresult[outerKey];

  // Ensure the outerValue is an object
  if (typeof outerValue === "object" && outerValue !== null) {   
    Object.keys(outerValue).forEach((innerKey) => {
      const innerValue = outerValue[innerKey];
      if (Array.isArray(innerValue) && innerValue.length > 1) {
        const combinedArrays = backtrackAndJoin(innerValue);
        outerValue[innerKey] = combinedArrays;
      }
    });
  }
});
 
console.log("Updated addresult:", addresult);

let allCombinations_multi = []; 
const inputCombination = combinedResult.length > 0 ? combinedResult : addmulti;
if (inputCombination.length > 0 && type !== "add") {
inputCombination.forEach((mainArray,mainIndex) => {
  mainArray.forEach((innerArray, innerIndex) => { 
    let combinedSet = [];
    Object.keys(addresult).forEach((key) => {
      if (Number(key) === mainIndex) {
        return;
      }
      const addArray = addresult[key];
      if (
        typeof addArray === 'object' &&
        addArray !== null &&
        Object.values(addArray).every(item =>
          Array.isArray(item) &&
          item.length > 0 &&
          item.every(subItem =>
            Array.isArray(subItem)
              ? subItem.length > 0 &&
                subItem.every(nestedItem => !Array.isArray(nestedItem) || nestedItem.length > 0)
              : true
          )
        )
      ) {
        innerArray.forEach((subArray, index) => {
          const correspondingAddSubArray = addArray[key];
          if (
            (Array.isArray(subArray) && correspondingAddSubArray) ||
            (subArray.combinations.length > 0 && correspondingAddSubArray)
          ) {
            const modifiedSubArray = backtrackAndJoin(correspondingAddSubArray);
            let combinedArray;
            modifiedSubArray.forEach((nestedArray) => {
              nestedArray.forEach((subSubArray) => {
                if (Array.isArray(subArray)) {
                  combinedArray = [...subArray];
              } else if (typeof subArray === "object" && subArray !== null && subArray.combinations) {
                  combinedArray = [...subArray.combinations];
              } 
                combinedArray.push(...subSubArray);
                combinedSet.push(combinedArray);
              });
              combinedArray = [];
            });
          }
        });
      }
      if (combinedSet.length > 0) {
        allCombinations_multi.push(combinedSet);
      }
      combinedSet = [];
    });
  });
}); }
console.log(allCombinations_multi);
const flattenedCombinations = allCombinations_multi.flat(1);
function backtrackAndJoin(array) {
  let result = [];
  function backtrack(index, current) {
    if (index === array.length) {
      result.push([...current]);
      return;
    }
    array[index].forEach((element) => {
      current.push(element);
      backtrack(index + 1, current);
      current.pop(); 
    });
  }
  backtrack(0, []);
  return result;
}
function flattenArray(arr) {
  return arr.reduce((acc, item) => {
      if (Array.isArray(item)) {
          // Recursively flatten if the item is an array
          acc.push(...flattenArray(item));
      } else {
          acc.push(item);
      }
      return acc;
  }, []);
}
const fullyFlattenedCombinations = flattenedCombinations.map(array => flattenArray(array));
console.log(fullyFlattenedCombinations);
const joinedCombinations = [...fullyFlattenedCombinations, ...allCombinations];
console.log(joinedCombinations);
return joinedCombinations;
}
    if (either && either.length > 0 || envelope &&  envelope.length > 0) {
      let type = "either";
      const combinedLoadCases = [...(either || []), ...(envelope || [])];
      const combined = combineLoadCases(combinedLoadCases, add, envelope,type);
      eitherJoin.push(...combined);
      joinArray.push(eitherJoin);
    }
    const addJoin = [];
    if (either.length === 0 && envelope.length === 0 && add.length > 0) {
      let type = "add";
      const combinedLoadCases = [...add];
      const combined = combineLoadCases(combinedLoadCases, add, envelope,type);
      addJoin.push(...combined);
      joinArray.push(addJoin);
    }
  }
  console.log("Extracted Factors Store: ", extractedFactorsStore);
  return joinArray;
}


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
      name.replace(/\s*\((CB|ST|CS|CBC|MV|RS|CBR|CBSC|CBS)\)$/, '')
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
    let uniqueFactorData = removeDuplicateFactors(loadCombinations);
    setLoadCombinations(uniqueFactorData.filter((i)=>(i)));
    console.log(uniqueFactorData.filter((i)=>(i)));
    console.log(uniqueFactorData);
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
      const factor1 = row[5];
      const factor2 = row[6];
      const factor3 = row[7];
      const factor4 = row[8];
      const factor5 = row[9];
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
      name.replace(/\s*\((CB|ST|CS|CBC|MV|RS|CBR|CBSC|CBS)\)$/, '')
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
            <Typography>{loadCase.loadCaseName}</Typography>
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