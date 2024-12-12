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
import ComponentsPanelTypographyDropList from './Components/ComponentsPanelTypographyDropList';
import ComponentsButtonLoading from './Components/ComponentsButtonLoading';
import { Scrollbars } from '@midasit-dev/moaui';
import ComponentsDialogHelpIconButton from './Components/ComponentsDialogHelpIconButton';
import { midasAPI } from "./Function/Common";
import { VerifyUtil, VerifyDialog } from "@midasit-dev/moaui";
import ExcelJS from 'exceljs';  
import { saveAs } from 'file-saver';
import { extractProtocolDomainPort } from '@midasit-dev/moaui/Authentication/VerifyUtil';

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
const [values, setValues] = useState({
  "Generate envelop load combinations in midas": false,
  "Generate inactive load combinations in midas": false,
});
console.log(values);
const [exportLoading, setExportLoading] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const [generateLoading, setGenerateLoading] = useState(false);
const { enqueueSnackbar } = useSnackbar();
  const toggleLoadCaseDropdown = (index) => {
    setLoadCaseDropdownIndex(loadCaseDropdownIndex === index ? -1 : index);
  };
  const toggleSignDropdown = (index) => {
    setSignDropdownIndex(signDropdownIndex === index ? null : index);
  };
  
  const handleLoadCaseOptionSelect = (loadCombinationIndex, loadCaseIndex, selectedLoadCase) => {
    const updatedLoadCombinations = [...loadCombinations];
    updatedLoadCombinations[loadCombinationIndex].loadCases[loadCaseIndex].loadCaseName = selectedLoadCase;
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

    // Initialize loadNames with useState
    let [loadNames, setLoadNames] = useState([
      "Dead Load",
      "Tendon Primary",
      "Creep Primary",
      "Shrinkage Primary",
      "Tendon Secondary",
      "Creep Secondary",
      "Shrinkage Secondary",
    ]);
    let [loadNames_key, setLoadNames_key] = useState(
      loadNames.map(name => ({ key: "CS", name }))
    );
  
    // Fetch load cases using useEffect
    useEffect(() => {
      (async function importLoadCases() {
        try {
          const stct = await midasAPI("GET", "/db/stct");
          const stldData = await midasAPI("GET", "/db/stld");
          const smlc = await midasAPI("GET", "/db/smlc");
          const mvldid = await midasAPI("GET", "/db/mvldid");
          const mvld = await midasAPI("GET", "/db/mvld");
          const mvldch = await midasAPI("GET", "/db/mvldch");
          const mvldeu = await midasAPI("GET", "/db/mvldeu");
          const mvldbs = await midasAPI("GET", "/db/mvldbs");
          const mvldpl = await midasAPI("GET", "/db/mvldpl");
          const splc = await midasAPI("GET", "/db/splc");  //respose spectrum load cases
  
          const newLoadNames = [...loadNames]; // Create a copy of the existing loadNames
          const newLoadCasesWithKeys = [...loadNames_key];
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
    
          // Process STLD and store keys with names
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
           // Process MVLD and store keys with names
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

        // Process MVLDCH and store keys with names
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

        // Process MVLDEU and store keys with names
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
          setLoadNames(newLoadNames);
          setLoadNames_key(newLoadCasesWithKeys);
        } catch (error) {
          console.error('Error fetching load cases:', error);
        }
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
  const cleanedLoadCaseName = loadCaseName.replace(/\s*\((CB|ST|CS|CBC|MV)\)$/, '');
  for (const combo of combinations) {
    if (cleanedLoadCaseName === combo.loadCombination) {
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

function createCombinations(loadCases, strengthCombination, combinations, loadNames, result, value, factor, sign, dimension = 1, factorIndexArray = []) {
  // Initialize factorArray with dynamic dimensions
  let factorArray = createNDimensionalArray(dimension);
  const cleanedLoadCaseName = loadCases.loadCaseName.replace(/\s*\((CB|ST|CS|CBC|MV|SM|RS)\)$/, '');
  if (loadNames.includes(cleanedLoadCaseName)) {
    // If loadCaseName exists in loadNames
    for (let i = 1; i <= 5; i++) {
      const factorKey = `factor${i}`;
      let multipliedFactor = loadCases[factorKey] * value;
      if (i === factor) {
        multipliedFactor = loadCases[factorKey] !== undefined && loadCases[factorKey] !== "" ? loadCases[factorKey] * value : 1;
      }
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
    
    // Push the new loadCaseObj into the 'Add' array
    result["Add"].push(loadCaseObj);
  } else {
    const modifyName = getLoadCaseFactors(loadCases.loadCaseName, combinations);
    const newLoadCases = combinations.find(combo => combo.loadCombination === modifyName.loadCombination);
    if (newLoadCases && Array.isArray(newLoadCases.loadCases)) {
      if (newLoadCases.type === "Either") {
        result["Either"] = result["Either"] || [];
        const eitherResult = [];
        for (let factorIndex = 1; factorIndex <= 5; factorIndex++) {
          const tempArray = [];
          newLoadCases.loadCases.forEach(eitherLoadCase => {
            const currentFactorValue = eitherLoadCase[`factor${factorIndex}`];
            if (currentFactorValue === undefined) return;
            const newSign = multiplySigns(sign, eitherLoadCase.sign || '+');
            const eitherLoadCaseName = eitherLoadCase.loadCaseName.replace(/\s*\((CB|ST|CS|CBC|MV|SM|RS)\)$/, '');
            if (loadNames.includes(eitherLoadCaseName)) {
              if (factorIndex === 1) {
                // Reinitialize factorArray for dynamic dimensions
                factorArray = createNDimensionalArray(dimension);
                for (let i = 1; i <= 5; i++) {
                  const factorKey = `factor${i}`;
                  let multipliedFactor = eitherLoadCase[factorKey] * value;
                  multipliedFactor = eitherLoadCase[factorKey] !== undefined && eitherLoadCase[factorKey] !== "" ? eitherLoadCase[factorKey] * value : undefined;
                  // const previousFactor = factorIndexArray.length > 0 ? factorIndexArray[factorIndexArray.length - 1 -1] - 1: i - 1;
                  // const indices = [i - 1, factor - 1].concat(new Array(dimension - 2).fill(previousFactor)); // Adjust for `n` dimensions
                  // Remove the last value from factorIndexArray
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
                eitherLoadCase,
                strengthCombination,
                combinations,
                loadNames,
                tempArray,
                currentFactorValue * value,
                factorIndex,
                newSign,
                dimension + 1,// Increment dimension for recursive calls
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
            const currentFactorValue = addLoadCase[`factor${factorIndex}`];
            if (currentFactorValue === undefined) return;
            const newSign = multiplySigns(sign, addLoadCase.sign || '+');
            const addLoadCaseName = addLoadCase.loadCaseName.replace(/\s*\((CB|ST|CS|CBC|MV|SM|RS)\)$/, '');
            if (loadNames.includes(addLoadCaseName)) {
              if (factorIndex === 1) {
                factorArray = createNDimensionalArray(dimension);
                for (let i = 1; i <= 5; i++) {
                  const factorKey = `factor${i}`;
                  let multipliedFactor = addLoadCase[factorKey] * value;
                  multipliedFactor = addLoadCase[factorKey] !== undefined && addLoadCase[factorKey] !== "" ? addLoadCase[factorKey] * value : undefined;
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
                  loadCaseName: addLoadCase.loadCaseName,
                  sign: newSign,
                  factor: factorArray
                };
                tempArray_add.push(loadCaseObj);
              }
            } else {
              createCombinations(
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
            const currentFactorValue = envelopeLoadCase[`factor${factorIndex}`];
            if (currentFactorValue === undefined) return;
            const newSign = multiplySigns(sign, envelopeLoadCase.sign || '+');
            if (loadNames.includes(envelopeLoadCase.loadCaseName)) {
              if (factorIndex === 1) {
                factorArray = createNDimensionalArray(dimension);
                for (let i = 1; i <= 5; i++) {
                  const factorKey = `factor${i}`;
                  let multipliedFactor = envelopeLoadCase[factorKey] * value;
                  multipliedFactor = envelopeLoadCase[factorKey] !== undefined && envelopeLoadCase[factorKey] !== "" ? envelopeLoadCase[factorKey] * value : undefined;

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
    // We are at the deepest dimension; assign the multiplied factor
    factorArray[indices[0]] = multipliedFactor;
  } else {
    // Recurse deeper by checking the next dimension
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
  if (sign1 === '∓' && sign2 === '±') return '∓'; // ∓ * ± = ∓
  if (sign1 === '∓' && sign2 === '∓') return '±'; // ∓ * ∓ = ±

  // Default to '+' if no match found
  return '+';
}
// To store the first key
  function combineAddEither(inputObj) {
    let eitherArray = []; 
    let addObj = []; 
    let envelopeObj = [];
    let firstKey = null; // To store the first key
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
    function processKeyValuePairs(obj, parentKey) {
      
      // Loop through each key-value pair in the object
      for (const [key, value] of Object.entries(obj)) {
        if (!firstKey) {
          firstKey = key;
        }
        if (key === 'Add' || key === 'Either' || key === 'Envelope') {
          parentKey = key;
        }
        // Push the current parentKey into the lastvalue array
    if (parentKey) {
      lastvalue.push(parentKey);
    }
        if (Array.isArray(value)) {
          let temp = [];
          value.forEach((subArrayOrItem) => {
            if (Array.isArray(subArrayOrItem)) {
              // If the current value is a nested array, loop through the inner array
              subArrayOrItem.forEach((item) => {
                if (typeof item === 'object' && item !== null && Object.keys(item).length > 0) {
                  // Check if the item has 'Add' or 'Either' and make the recursive call if needed
                  if (item.Add || item.Either || item.Envelope) {
                    processKeyValuePairs(item, parentKey); // Recursive call for nested 'Add' or 'Either'
                  } else {
                    temp.push({
                      ...item,
                      previousKey: lastvalue.length > 0 ? lastvalue[lastvalue.length - 1] : null
                  });
                  }
                }
              });
            } else if (typeof subArrayOrItem === 'object' && subArrayOrItem !== null) {
              // If subArrayOrItem is a direct object (not an array)
              const newObj = {};
              // Loop through each property of the subArrayOrItem object
              for (const [itemKey, itemValue] of Object.entries(subArrayOrItem)) {
                newObj[itemKey] = itemValue; // Add each property to the new object
                // If the object contains "Add" or "Either", process it again
                if (itemKey === 'Add' || itemKey === 'Either' || itemKey === 'Envelope') {
                  processKeyValuePairs(subArrayOrItem, parentKey); // Recursive call
                }
              }
              temp.push({
                ...newObj,
                previousKey: lastvalue.length > 0 ? lastvalue[lastvalue.length - 1] : null
            });
             } 
            else {
              // If the value is not an object, call processObject recursively
              processObject(subArrayOrItem, parentKey);
            }
          });
          console.log("lastvalue",lastvalue);
          secondLastKey = lastvalue.length > 1 ? lastvalue[lastvalue.length - 2] : null;
          
          if (parentKey === 'Either' || (parentKey === 'Add' && firstKey === 'Either')) {
            eitherArray.push(temp);
          } else if (parentKey === 'Add' && (!firstKey || firstKey === 'Add')) {
            addObj.push(temp);
          } else if (parentKey === 'Envelope' || (parentKey === 'Add' && firstKey === 'Envelope')) {
            envelopeObj.push(temp);
          } }
         else if (typeof value === 'object' && value !== null) {
          processObject(value, key);
        }
      }
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
      let tempArray = []; // Temporary array for the current subArray
      let loadCaseNames = []; // Store the loadCaseName of the current object
      let additionalArray = []; // Additional array to collect matches

      subArray.forEach((item, itemIndex) => {
          if (item === null) return;
          tempArray = [];
          let temp = [];
          let previousKey = item.previousKey || null; // Retrieve the previousKey

          if (typeof item === 'object' && item !== null && Object.keys(item).length > 0) {
              Object.keys(item).forEach((key) => {
                  if (!isNaN(Number(key))) {
                      // Extract loadCaseName, sign, and factor properties if the key is a number
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
                          if (Array.isArray(item.factor)) {
                              // Ensure factor values are numbers or undefined
                              item.factor = item.factor.map((value) => (isNaN(value) ? undefined : value));
                          }
                          temp.push({
                              loadCaseName: item.loadCaseName,
                              sign: item.sign,
                              factor: item.factor,
                              previousKey, // Add previousKey to each entry
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
              if (typeof nextItem === 'object' && nextItem !== null && Object.keys(nextItem).length > 0) {
                  Object.keys(nextItem).forEach((nextKey) => {
                      if (nextItem[nextKey] && nextItem[nextKey].loadCaseName) {
                          loadCaseName_temp.push(nextItem[nextKey].loadCaseName);
                      }
                  });
              }
              if (arraysAreEqual(loadCaseNames, loadCaseName_temp)) {
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
                  if (typeof nextItem === 'object' && nextItem !== null && Object.keys(nextItem).length > 0) {
                      Object.keys(nextItem).forEach((nextKey) => {
                          if (nextItem[nextKey] && nextItem[nextKey].loadCaseName) {
                              loadCaseName_temp.push(nextItem[nextKey].loadCaseName);
                          }
                      });
                  }

                  if (arraysAreEqual(loadCaseNames, loadCaseName_temp)) {
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

function findStrengthCombinations(combinations) {
  return combinations.filter(combo => 
    combo.active === "Strength" || combo.active === "Service"
  );
}
async function generateBasicCombinations(loadCombinations) {
  const strengthCombinations = findStrengthCombinations(loadCombinations);
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
  let allFinalCombinations = [];
  let combinationCounter = 0; 
  let last_value;
  let backupCivilCom = { Assign: {} };
  // Iterate over each strengthCombination
  for (const strengthCombination of strengthCombinations) {
    combinationCounter =  combinationCounter + allFinalCombinations.length;
    allFinalCombinations = [];
    const comb_name = strengthCombination.loadCombination;
    const type = strengthCombination.type;
    
    const factorArray = [];
    // Iterate over each loadCase within the strengthCombination
    for (let factor = 1; factor <= 5; factor++) {
      let factorCombinations = [];
    for (const loadCase of strengthCombination.loadCases) {
      const factors = [];
      for (let factor = 1; factor <= 5; factor++) {
        const factorKey = `factor${factor}`;
        if (factorKey in loadCase) {
          // Extract the specific factor value
          const factorValue = loadCase[factorKey];
          factors.push({ factor, value: factorValue });
        } else {
          factors.push({ factor, value: 1 });
        }
        // Check if all factors are undefined, and if so, set factor1 to 1
        const allFactorsUndefined = factors.every(f => f.value === undefined || f.value === "");
        if (allFactorsUndefined) {
          const factor1 = factors.find(f => f.factor === 1);
          if (factor1) {
            factor1.value = 1;
          }
        }
      }
      const sign = loadCase.sign || '+';
      console.log(factors);
        const factorObject = factors.find(f => f.factor === factor);
        // Check if the factor value is defined
        if (factorObject && factorObject.value !== undefined  && factorObject.value !== "") {
          const new_11 = createCombinations(loadCase, strengthCombination, loadCombinations, loadNames, [], factorObject.value, factor, sign);
          console.log(new_11);
          // Combine and permute the results
          const result11 = combineAddEither([new_11]);
          console.log(result11);
          const finalCombinations_sign = permutation_sign(result11);
          console.log(finalCombinations_sign);
          const fact = join_factor(finalCombinations_sign);
          console.log(fact);
          factorCombinations.push(fact);
        }
      }
      factorArray.push(factorCombinations);
    }
    console.log(factorArray); // Logs the full factorArray for reference
// Initialize an array to hold the joined combinations
const joinedCombinations = [];
// Iterate over each subarray within factorArray
for (const subArray of factorArray) {
  // Send each subarray to the join function
  const joinedResult = join(subArray);
  // Push the result into joinedCombinations
  joinedCombinations.push(joinedResult);
}
console.log(joinedCombinations);

    if (type === 'Add') {
      let joinedComb = [];
      // Recursive helper function to generate combinations from joinArray
      function combineArrays(arrays, index = 0, currentCombination = []) {
        if (index === arrays.length) {
          // If we've combined arrays from all groups, push the result
          joinedComb.push([...currentCombination]);
          return;
        }
        for (const subArray of arrays[index]) {
          // Combine the current subArray with the ongoing combination
          currentCombination.push(...subArray);
          combineArrays(arrays, index + 1, currentCombination);
          // Backtrack to explore other combinations
          currentCombination.length -= subArray.length;
        }
      }
      for (const subArray of joinedCombinations) {
      if  (subArray.length > 0) {
      combineArrays(subArray);
      allFinalCombinations.push(...joinedComb);
      joinedComb = []
      } 
    }
   
      allFinalCombinations.forEach((combArray, idx) => {
        const combinationName = `${comb_name}_${idx + 1}`; // comb_name_arraynumber
        // Prepare the vCOMB structure for this combination
        let vCOMB = combArray.map((comb) => {
          const cleanedLoadCaseName = comb.loadCaseName.replace(/\s*\((CB|ST|CS|CBC|MV|SM|RS)\)$/, '');;
          // Extract the value inside the parentheses if present
  const match = comb.loadCaseName.match(/\((CB|ST|CS|CBC|MV|SM|RS)\)$/);

  // Use the value from parentheses if present, otherwise derive from loadNames_key
  const analysisType = match
    ? match[1] // Use the value in parentheses (e.g., CB, ST, CS, CBC)
    : (() => {
        const matchingEntry = loadNames_key.find(entry => entry.name === comb.loadCaseName);
        return matchingEntry ? matchingEntry.key : "ST"; // Use matching key if found, otherwise "ST"
      })();
          return {
            "ANAL": analysisType,
            "LCNAME": cleanedLoadCaseName, // Assuming comb has a property `loadCaseName`
            "FACTOR": (comb.sign === "+" ? 1 : -1) * comb.factor // Assuming comb has properties `sign` and `factor`
          };
        });
        // console.log(`vCOMB for combination ${combinationName}:`, vCOMB);
        backupCivilCom.Assign[`${idx + 1 + combinationCounter + initial_lc}`] = {
          "NAME": combinationName,
          "ACTIVE": "ACTIVE",
          "bCB": false,
          "iTYPE": 0,
          "vCOMB": vCOMB
      };
      setCivilCom({ Assign: { ...backupCivilCom.Assign } });
      last_value = idx + 1 + combinationCounter;
      });
  }
    if (type === "Either") {
      const concatenatedArray = joinedCombinations.flat();
      console.log(concatenatedArray);
      concatenatedArray.forEach((combArray) => {
        combArray.forEach(subArray => allFinalCombinations.push(subArray));
      });
    
      // Now, iterate over allFinalCombinations to create and set vCOMB for each combination
      allFinalCombinations.forEach((combArray, idx) => {
        combinationCounter++;
        const combinationName = `${comb_name}_${idx + 1}`; // comb_name_arraynumber
        // Prepare the vCOMB structure for this combination
        let vCOMB = combArray.map((comb) => {
          const cleanedLoadCaseName = comb.loadCaseName.replace(/\s*\((CB|ST|CS|CBC|MV|SM|RS)\)$/, '');;
          // Extract the value inside the parentheses if present
  const match = comb.loadCaseName.match(/\((CB|ST|CS|CBC|MV|SM|RS)\)$/);

  // Use the value from parentheses if present, otherwise derive from loadNames_key
  const analysisType = match
    ? match[1] // Use the value in parentheses (e.g., CB, ST, CS, CBC)
    : (() => {
        const matchingEntry = loadNames_key.find(entry => entry.name === comb.loadCaseName);
        return matchingEntry ? matchingEntry.key : "ST"; // Use matching key if found, otherwise "ST"
      })();
          return {
            "ANAL": analysisType,
            "LCNAME": cleanedLoadCaseName, // Assuming comb has a property `loadCaseName`
            "FACTOR": (comb.sign === "+" ? 1 : -1) * comb.factor // Assuming comb has properties `sign` and `factor`
          };
        });
        // console.log(`vCOMB for combination ${combinationName}:`, vCOMB);
        backupCivilCom.Assign[`${idx + 1 + combinationCounter + initial_lc}`] = {
          "NAME": combinationName,
          "ACTIVE": "ACTIVE",
          "bCB": false,
          "iTYPE": 0,
          "vCOMB": vCOMB
      };
      
      // Then, update the state with setCivilCom
      setCivilCom({ Assign: { ...backupCivilCom.Assign } });
      last_value = idx + 1 + combinationCounter + initial_lc;
      });
    }
    if (values["Generate envelop load combinations in midas"]) {
      console.log("Generating envelope load combinations...");
    
      const combinationName = `${comb_name}_Env`;
      let allVCombEntries = [];
      // console.log("BACKUP",backupCivilCom);
      // Loop through each combination entry in civilCom.Assign
      for (const key in backupCivilCom.Assign) {
        const assignEntry = backupCivilCom.Assign[key];
        if (assignEntry) {
          // Extract the name part before the underscore
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
            "ANAL": endpoint,  // Using ANAL from the first entry in vCOMB if available, else default to "ST"
            "LCNAME": assignEntry.NAME,  // Storing just the base name (before the underscore)
            "FACTOR": 1
          };
          allVCombEntries.push(vCombObject);
        }
      }
      setCivilComeEnv(prevState => {
        const newAssign = { ...prevState.Assign };
        newAssign[`${last_value + 1}`] = {
          "NAME": combinationName,
          "ACTIVE": "STRENGTH",
          "bCB": true,
          "iTYPE": 1,
          "vCOMB": allVCombEntries
        };
        return { ...prevState, Assign: newAssign };
      });
    } 
  }
  let inactiveCombinations = [];
let inactive_combo = [];

if (values["Generate inactive load combinations in midas"]) {
  let all_inactive = [];
  // Filter out inactive combinations
  inactiveCombinations = loadCombinations.filter(combination => combination.active === "Inactive");
  console.log(inactiveCombinations);

  if (inactiveCombinations.length === 0) {
    console.warn("No combinations with active set to 'Inactive' found.");
  } else {
    // Process each inactive combination
    for (const inactiveCombination of inactiveCombinations) {
      let addObj = [];
      let eitherArray = [];
      let envelopeObj = [];
      const comb_name = inactiveCombination.loadCombination;
      const type = inactiveCombination.type;

      console.log(inactiveCombination);
      const result = { comb_name, type, factors: [] };
      let factorCombination = [];
      
      let factor_combos = [];
      // Iterate through each loadCase
      for (const loadCase of inactiveCombination.loadCases) {
        let new_combo = [];
        const loadCaseName = loadCase.loadCaseName; // Assuming loadCaseName is a property
        if (loadNames.includes(loadCaseName)) {
          // If loadCase is in loadNames, directly store it in the result
          if (!result.factors) {
            result.factors = []; // Initialize if not already present
          }
          result.factors.push(loadCase);
        } else {
          // Otherwise, process factors for this loadCase
          const factors = [];

          for (let factorNum = 1; factorNum <= 5; factorNum++) {
            const factorKey = `factor${factorNum}`;
            const factorValue = loadCase[factorKey]; // Default to 1 if undefined
            factors.push({ factor: factorNum, value: factorValue });
          }

          // Loop through each factor (1 to 5)
          for (let factor = 1; factor <= 5; factor++) {
            const sign = loadCase.sign || '+';
            const factorObject = factors.find(f => f.factor === factor);

            if (factorObject && factorObject.value !== undefined && factorObject.value !== "" && factorObject.value !== null && factorObject.value != 0) {
              // Call createCombinations for the current factor
              const newCombination = createCombinations(
                loadCase,
                inactiveCombination,
                loadCombinations,
                loadNames,
                [], // Base cases or additional data
                factorObject.value,
                factor,
                sign
              );
              console.log("New Combination for Factor:", factor, newCombination);
              new_combo.push(newCombination);
              console.log(new_combo);

              // Store the result in the corresponding combination
              if (!result.factors) {
                result.factors = [];
              }
            }
          }
        }
        const combine = combineAddEither(new_combo);
      const sign_combo = permutation_sign(combine);
      let factor_combo = join_factor(sign_combo);
      console.log(factor_combo);
      factor_combos.push(factor_combo);
      console.log(factor_combos);
      }
      
      for (const subArray of factor_combos) {
        const combo_join = join(factor_combos);
        factorCombination.push(combo_join); // Push the result
      }
      console.log(factorCombination);
      if (type === 'Add') {
        let joinedComb = [];
        // Recursive helper function to generate combinations from joinArray
        function combineArrays(arrays, index = 0, currentCombination = []) {
          if (index === arrays.length) {
            // If we've combined arrays from all groups, push the result
            joinedComb.push([...currentCombination]);
            return;
          }
          for (const subArray of arrays[index]) {
            // Combine the current subArray with the ongoing combination
            currentCombination.push(...subArray);
            combineArrays(arrays, index + 1, currentCombination);
            // Backtrack to explore other combinations
            currentCombination.length -= subArray.length;
          }
        }
        for (const subArray of factorCombination) {
       
  if (subArray.length > 0) {
    // Pass the flattened subArray to combineArrays
    combineArrays(subArray);
    
    // Push the joined combinations to the all_inactive array
    all_inactive.push(...joinedComb);
    
    // Reset joinedComb for the next iteration
    joinedComb = [];
  }
      }
     
        all_inactive.forEach((combArray, idx) => {
          const combinationName = `${comb_name}_${idx + 1}`; // comb_name_arraynumber
          // Prepare the vCOMB structure for this combination
          let vCOMB = combArray.map((comb) => {
            // Search for the matching key in loadNames_key
            const matchingEntry = loadNames_key.find(entry => entry.name === comb.loadCaseName);
            const analysisType = matchingEntry ? matchingEntry.key : "ST"; // Use matching key if found, otherwise "ST"
            return {
              "ANAL": analysisType,
              "LCNAME": comb.loadCaseName, // Assuming comb has a property `loadCaseName`
              "FACTOR": (comb.sign === "+" ? 1 : -1) * comb.factor // Assuming comb has properties `sign` and `factor`
            };
          });
          // console.log(`vCOMB for combination ${combinationName}:`, vCOMB);
          backupCivilCom.Assign[`${idx + 1 + combinationCounter}`] = {
            "NAME": combinationName,
            "ACTIVE": "ACTIVE",
            "bCB": false,
            "iTYPE": 0,
            "vCOMB": vCOMB
        };
        setCivilCom({ Assign: { ...backupCivilCom.Assign } });
        });
    }
      if (type === "Either") {
        const concatenatedArray = factorCombination.flat();
        console.log(concatenatedArray);
        concatenatedArray.forEach((combArray) => {
          combArray.forEach(subArray => allFinalCombinations.push(subArray));
        });
      
        // Now, iterate over allFinalCombinations to create and set vCOMB for each combination
        all_inactive.forEach((combArray, idx) => {
          combinationCounter++;
          const combinationName = `${comb_name}_${idx + 1}`; // comb_name_arraynumber
          // Prepare the vCOMB structure for this combination
          let vCOMB = combArray.map((comb) => {
            // Search for the matching key in loadNames_key
            const matchingEntry = loadNames_key.find(entry => entry.name === comb.loadCaseName);
            const analysisType = matchingEntry ? matchingEntry.key : "ST"; // Use matching key if found, otherwise "ST"
            return {
              "ANAL": analysisType,
              "LCNAME": comb.loadCaseName, // Assuming comb has a property `loadCaseName`
              "FACTOR": (comb.sign === "+" ? 1 : -1) * comb.factor // Assuming comb has properties `sign` and `factor`
            };
          });
          // console.log(`vCOMB for combination ${combinationName}:`, vCOMB);
          backupCivilCom.Assign[`${idx + 1 + combinationCounter}`] = {
            "NAME": combinationName,
            "ACTIVE": "ACTIVE",
            "bCB": false,
            "iTYPE": 0,
            "vCOMB": vCOMB
        };
        setCivilCom({ Assign: { ...backupCivilCom.Assign } });
        });
      }
      if (all_inactive.length > 0) {
        // Filter out null or undefined entries in factorCombination
        const validCombinations = factorCombination.filter(subArray => subArray.length > 0);
        // Check if validCombinations has entries before pushing
        if (validCombinations.length > 0) {
          result.factors.push(...validCombinations); // Add only valid combinations to factors
        }
        else {
          // Push valid factors to respective arrays based on the result type
          if (result.factors && result.factors.length > 0) {
            if (result.type === "Add") {
              addObj.push(...result.factors);
            } else if (result.type === "Either") {
              eitherArray.push(...result.factors);
            } else if (result.type === "Envelope") {
              envelopeObj.push(...result.factors);
            }
          }
          const combinedArray = {
            eitherArray: [[[[...eitherArray]]]], // Wrap in one more array
            addObj: [[[[...addObj]]]],           // Wrap in one more array
            envelopeObj: [[[[...envelopeObj]]]]    // Wrap in one more array
          };
        
          // Pass combinedArray to permutation_sign
          const processedResult = permutation_sign(combinedArray);
        
          // Log the processed result
          console.log("Processed Result:", processedResult);
        
          // Flatten the arrays for each object in processedResult using flat(4)
          const flattenedAddObj = processedResult.addObj.flat(3);
          const flattenedEitherArray = processedResult.eitherArray.flat(3);
          const flattenedEnvelopeObj = processedResult.envelopeObj.flat(3);
        
          // Initialize an array to hold valid factors
          const validFactors = [];
        
          validFactors.push(...flattenedAddObj, ...flattenedEitherArray, ...flattenedEnvelopeObj);
          result.factors = validFactors;
          // Log the result.factors after processing
          console.log("Result Factors:", result.factors);
        }
      }
      console.log("Final Result for Combination:", comb_name, result);
      const transformedFactors = [];

      const allFactorKeys = [...new Set(
        result.factors
            .flatMap(subArray => {
                if (subArray && Object.keys(subArray).length > 0) { // Ensure subArray is valid
                    return Object.keys(subArray)                  // Flatten the keys of valid subArrays
                } else {
                    return []; // If subArray is invalid or empty, return an empty array
                }
            })
            .filter(key => key.startsWith('factor'))             // Keep only keys starting with 'factor'
    )];
    
    if (allFactorKeys.length > 0) {
      allFactorKeys.forEach((factorKey) => {
          const subArrayForKey = []; // Group subarrays for the current factor key
  
          // Process each subArray for the current factor key
          result.factors.forEach((subArray) => {
              const processedSubArray = {
                  loadCaseName: subArray.loadCaseName,
                  sign: subArray.sign,
                  factor: subArray[factorKey], // Handle undefined factor values
              };
  
              // Add the processed object to the current factor key group if valid
              if (processedSubArray.factor !== undefined && processedSubArray.factor !== "") {
                  subArrayForKey.push(processedSubArray);
              }
          });
  
          // Add the group to transformedFactors if it contains valid data
          if (subArrayForKey.length > 0) {
              transformedFactors.push(subArrayForKey);
          }
      });
  
      // Update result.factors with transformed factors
      result.factors = transformedFactors;
  } 
      inactive_combo.push(result);
    }
  }
}
  console.log("inactive_combo",inactive_combo);
  console.log(allFinalCombinations);
  return allFinalCombinations;
}

console.log("Civil",civilCom);
console.log("Civil_env",civilComEnv);
function join_factor(finalCombinations_sign) {
  // Helper function to recursively flatten nested arrays
  const deepFlatten = (arr) => {
    if (Array.isArray(arr)) {
      return arr.reduce((flat, item) => {
        if (Array.isArray(item)) {
          // If the item is an array, flatten it individually
          return flat.concat(deepFlatten(item));
        } else {
          // Otherwise, just add the item
          return flat.concat(item);
        }
      }, []);
    } else {
      return [arr];
    }
  };

  // Recursive helper function to merge factor arrays regardless of their dimensionality
  const mergeFactors = (target, source) => {
    if (Array.isArray(source)) {
      for (let i = 0; i < source.length; i++) {
        if (Array.isArray(source[i])) {
          // Ensure the target array exists and is initialized at this depth
          if (!target[i]) {
            target[i] = [];
          }
          // Recursively merge deeper dimensions
          mergeFactors(target[i], source[i]);
        } else {
          // At the deepest level, copy non-undefined values from the source
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

    // Flatten eitherArray
    if (Array.isArray(eitherArray)) {
      eitherArray.forEach((arr) => {
        if (Array.isArray(arr)) {
          const groupedArray = []; // To group subarrays together
          arr.forEach((subArr) => {
            if (Array.isArray(subArr)) {
              // Flatten each subarray and push it into the grouped array
              groupedArray.push(deepFlatten(subArr));
            } else {
              // If it's not a subarray, directly push it
              groupedArray.push(subArr);
            }
          });
          // Push the grouped array as a single entry into the final output
          if (groupedArray.length > 0) {
            flattenedEitherArray.push(groupedArray);
          }
        } else {
          // If the current element is not an array, directly push it
          flattenedEitherArray.push(arr);
        }
      });
    }
    // Flatten addObj
    if (Array.isArray(addObj) && addObj.length > 0) {
      addObj.forEach(mainArray => {
        if (Array.isArray(mainArray)) {
          // Wrap each mainArray into a separate array
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
                for (let i = 0; i < length; i++) {
                  let combinedArray = [];
                  currentArray.forEach(subArray => {
                    if (Array.isArray(subArray) && subArray[i]) {
                      combinedArray.push(subArray[i]);
                    } else {
                      combinedArray.push(subArray);
                    }
                  });
                  mainArrayGroup.push([...deepFlatten(combinedArray)]);
                  combinedArray = [];
                }
              }
            }
          } else {
            mainArray.forEach(currentArray => {
              // Check if the currentArray has any elements before proceeding
              if (currentArray.length > 0) {
                const length = currentArray[0].length;
                for (let i = 0; i < length; i++) {
                  let combinedArray = [];
                  currentArray.forEach(subArray => {
                    if (Array.isArray(subArray) && subArray[i]) {
                      combinedArray.push(subArray[i]);
                    }
                  });
                  mainArrayGroup.push([...deepFlatten(combinedArray)]);
                  combinedArray = [];
                }
              }
            });
          }
          
          // Push the processed mainArrayGroup into flattenedAddObj
          flattenedAddObj.push(mainArrayGroup);
        }
      });
    }
    
    // Flatten envelopeObj
    if (Array.isArray(envelopeObj)) {
      envelopeObj.forEach(arr => {
        if (Array.isArray(arr)) {
          const groupedArray = []; // To group subarrays together
          arr.forEach((subArr) => {
            if (Array.isArray(subArr)) {
              // Flatten each subarray and push it into the grouped array
              groupedArray.push(deepFlatten(subArr));
            } else {
              // If it's not a subarray, directly push it
              groupedArray.push(subArr);
            }
          });
          // Push the grouped array as a single entry into the final output
          if (groupedArray.length > 0) {
            flattenedEnvelopeObj.push(groupedArray);
          }
        } else {
          // If the current element is not an array, directly push it
          flattenedEnvelopeObj.push(arr);
        }
      });
    }
    const combinedResults = {};
    const combineFactors = (items) => {
      let combinedResult = {};
      items.forEach(item => {
        if (item && typeof item === 'object' && item.loadCaseName && item.factor) {
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
        itemArray.forEach(subArray => {
          Object.keys(subArray).forEach(key => {
            const factor = subArray[key].factor;
            if (Array.isArray(factor)) {
              subArray[key].factor = normalizeFactors(factor);
            }
          });
        });
      });
    };

    // Final common arrays
    const commonArray_add = flattenedAddObj.map(mainArray => {
      // Check if mainArray is valid (not empty and is an array)
      if (Array.isArray(mainArray) && mainArray.length > 0) {
        // Process each subarray in the mainArray
        return mainArray.map(subArray => {
          // Check if subArray is valid before applying combineFactors
          return Array.isArray(subArray) ? combineFactors([subArray]) : subArray;
        });
      } else {
      }
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
  const extractedFactorsStore = {};
  for (const combination of factorCombinations) {
    const join = [];
    const { add, either, envelope,firstKey,secondLastKey } = combination;
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
    
          // Ensure i is within bounds of the flattened array
          if (flattenedArray.length > i) {
            return flattenedArray[i];
          }
        }
      }
      return undefined;
    }
    function extractFactorsFromObject(factorObj, factorIndex, i) {
      const extractedFactors = [];
      for (const key in factorObj) {
        if (factorObj.hasOwnProperty(key)) {
          const { loadCaseName, sign, factor } = factorObj[key];
          const factorValue = getSingleFactor(factor, factorIndex, i); 
          if (factorValue !== undefined && factorValue !== 0 && factorValue !== null) {
            extractedFactors.push({ loadCaseName, sign, factor: factorValue });
          }
        }
      }
      if (!extractedFactorsStore[factorIndex]) {
        extractedFactorsStore[factorIndex] = [];
      }
      extractedFactorsStore[factorIndex][i] = extractedFactors;
      return extractedFactors;
    }
    function combineMatchingFactors(either, factorIndex, i) {
      const combinedResult = [];
      const extractedFactors = either.flatMap(arr => {
        if (Array.isArray(arr) && arr.length > 1) {
          // Split each subarray into separate arrays
            return arr.flatMap(subArray => {
              const flattenedArr = Array.isArray(subArray) ? subArray.flat() : [subArray];
              return flattenedArr.flatMap(factorObj => {
                if (Array.isArray(factorObj)) {
                  return factorObj.map(innerObj => extractFactorsFromObject(innerObj, factorIndex, i));
                } else {
                  return [extractFactorsFromObject(factorObj, factorIndex, i)];
                }
              });
            });
        } else {
          // Handle arrays with a single element or non-array elements
          const flattenedArr = Array.isArray(arr) ? arr.flat() : [arr];
          return flattenedArr.flatMap(factorObj => {
            if (Array.isArray(factorObj)) {
              return factorObj.flatMap(innerObj => extractFactorsFromObject(innerObj, factorIndex, i));
            } else {
              return [extractFactorsFromObject(factorObj, factorIndex, i)];
            }
          });
        }
      });
    
      // Restructure to split subarrays into individual arrays
      const correctedOutput = extractedFactors.flatMap(subArray =>
        Array.isArray(subArray) ? subArray.map(item => [item]) : [[subArray]]
      );
    
      if (!extractedFactorsStore[factorIndex]) {
        extractedFactorsStore[factorIndex] = [];
      }
      extractedFactorsStore[factorIndex][i] = correctedOutput;
    
      function generateCombinations(arrays, temp = [], index = 0) {
        // const filteredArrays = arrays.filter(array => Array.isArray(array) && array.length > 0);
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
      generateCombinations(extractedFactors);
      return combinedResult;
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
    
    // Helper function to determine array depth
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
    
    function combineLoadCases(either, add, envelope) {
      const allCombinations = [];
      const addmulti = [];
      // Step 1: Loop through each factor and i
      const factorLimit = either.length;
      const maxI = getMaxIValue(either, add);
      console.log(maxI);
      for (let factorIndex = 0; factorIndex < 5; factorIndex++) {
        console.log(factorIndex);
        for (let i = 0; i < maxI; i++) {
          let factorCombinations = [];
          if (firstKey === "Either" || firstKey === "Envelope") {
            
            either.forEach(eitherArray => {
              if (Array.isArray(eitherArray)) {
                // Directly pass eitherArray to combineMatchingFactors
                let result = combineMatchingFactors(eitherArray, factorIndex, i);
                factorCombinations.push(...result); // Combine results
              } else {
                // If not an array, process as a single object wrapped in an array
                let result = combineMatchingFactors([eitherArray], factorIndex, i);
                factorCombinations.push(...result);
              }
            });
            console.log(factorCombinations);
          } else if (firstKey === "Add") {
            factorCombinations = combineMatchingFactors(either, factorIndex, i);
            console.log(factorCombinations);
          }
          // Step 2: Iterate through the 'add' arrays
          add.forEach(addArray => {
            if (Array.isArray(addArray) && addArray.length > 0) {
              factorCombinations.forEach(factorCombination => {
                let combinedResult = []
                const addresult = [];
                addArray.forEach(item => {
                  Object.keys(item).forEach(key => {
                    const value = item[key];
                    const loadCaseName = value.loadCaseName;
                    const sign = value.sign;
                    const factor = value.factor;
                    const factorValue = getSingleFactor(factor, factorIndex, i);
                    
                    if (factorValue !== undefined && factorValue !== null) {
                      combinedResult.push({ loadCaseName, sign, factor: factorValue });
                    }
                  });
                });
                if (combinedResult.length > 0) {
                  combinedResult.push(...factorCombination);
                  allCombinations.push(combinedResult);
                }
              });
            }
          });
          const nonEmptyFactorCombinations = factorCombinations.filter(factor => factor.length > 0);
          if (add.length === 0 && nonEmptyFactorCombinations.length > 0) {
            allCombinations.push(...factorCombinations);
          }
        }
      }
      console.log('Extracted Factors:', extractedFactorsStore);
      console.log('All Combinations:', allCombinations);
      const extractedValues = Object.values(extractedFactorsStore);
const mergeArray = [];
// Helper function to generate permutations
function getCustomCombinations(arrays,arrays_1) {
  const result = [];
  const filteredArrays = arrays.filter(
    arr => arr.some(subArray => subArray.length > 0)
  );
  const flatArrays1 = arrays_1.flat();
  function buildCombination(currentCombination, currentIndex) {
    // Base case: if we've built a combination using elements from all non-empty arrays, add it to the result
    if (currentIndex === filteredArrays.length) {
      result.push([...currentCombination]);
      return;
    }

    // If the current array is empty, skip to the next one
    if (filteredArrays[currentIndex].length === 0) {
      buildCombination(currentCombination, currentIndex + 1);
      return;
    }
    if (currentIndex === 0) {
      filteredArrays[currentIndex].forEach((subArray, index) => {
        if (filteredArrays[currentIndex + 1] !==  undefined) {
          // Pair the subArray from the current index with the opposite element in the next array
          const nextSubArray = filteredArrays[currentIndex + 1][filteredArrays[currentIndex + 1].length - 1 - index];
          currentCombination.push(subArray, nextSubArray); // Add both subarrays to the combination
          buildCombination(currentCombination, currentIndex + 2); // Skip to the next index
          currentCombination.pop(); // Backtrack to try the next combination
          currentCombination.pop(); // Backtrack for the paired subarray
        }
      });
    }
  }
  // Start the recursive process with an empty combination and from the first index
  buildCombination([], 0);
  filteredArrays.forEach(filteredArray => {
    if (JSON.stringify(filteredArray) !== JSON.stringify(flatArrays1)) {
      result.push(filteredArray);
    }
  });

  return result;
}

// Outer loop iterating over j
for (let j = 0; j < 5; j++) {
  let iterationArray = [];

  // Nested loop over i, treating it as the primary fixed element array
  for (let i = 0; i < 5; i++) {
    const baseInnerArray = extractedValues[i][j]; // Array for the fixed element
    const fixedElement = baseInnerArray[0]; // First element of i-th array for fixed position
    // Initialize elementsToPermute with rest of elements in the current i-th array
    let elementsToPermute = [baseInnerArray.slice(1)];
    let elementsToPermute_first = [baseInnerArray.slice(1)];
    // Additional loop for other `i` values (0 to 4), except the current `i`
    for (let k = 0; k < 5; k++) {
      if (k === i) continue; // Skip the current i index to avoid repetition
      const additionalArray = extractedValues[k][j];
      if (additionalArray && additionalArray.length > 1) {
        const nonEmptyElements = additionalArray.slice(1).filter(subArr => subArr.length > 0);
        elementsToPermute.push(nonEmptyElements);
      }
    }
    // Generate permutations for elementsToPermute and merge with fixedElement
    console.log(elementsToPermute);
    const permutations = getCustomCombinations(elementsToPermute,elementsToPermute_first);
    permutations.forEach(perm => {
      const mergedInnerArray = [fixedElement, ...perm];
      if (mergedInnerArray.every(el => el && el.length > 0)) {
        iterationArray.push(mergedInnerArray);
      }
    });
  }
  // Append iterationArray to mergeArray if it contains results
  if (iterationArray.length > 0) {
    mergeArray.push([...iterationArray]);
  }
}
console.log(mergeArray);
      function generateCombinations(arrays, tempResult = [], index = 0, finalCombinations = []) {
        // Base case: If we've processed all arrays, push the combination to finalCombinations
        if (index === arrays.length) {
          finalCombinations.push([...tempResult]);
          return;
        }
        if (Array.isArray(arrays[index])) {
          for (const item of arrays[index]) {
            tempResult.push(item);  // Add the item to the current combination
            generateCombinations(arrays, tempResult, index + 1, finalCombinations);  // Recursively process the next array
            tempResult.pop();  // Backtrack: remove the last item before the next iteration
          }
        } else {
          console.error(`Expected an array at index ${index} but found:`, arrays[index]);
        }
      
        return finalCombinations;  // Return all combinations generated
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
      let addresult = {};  // Use an object to store results by factorIndex and i

for (let factorIndex = 0; factorIndex < 5; factorIndex++) {
  for (let i = 0; i < 5; i++) {
    // Initialize a place to store results for this factorIndex and i
    if (!addresult[factorIndex]) {
      addresult[factorIndex] = {};
    }
    // This will store the addmultiResult for the current factorIndex and i
    addresult[factorIndex][i] = [];
    
    // Iterate over add array
    add.forEach(addArray => {
      if (Array.isArray(addArray) && addArray.length > 0) {
        let addmultiResult = [];  // To store the combination for this addArray, factorIndex, and i
        
        // Loop over each item in the addArray
        addArray.forEach(item => {
          Object.keys(item).forEach(key => {
            const value = item[key];
            const loadCaseName = value.loadCaseName;
            const sign = value.sign;
            const factor = value.factor;
            
            // Get the factor value using the function
            const factorValue = getSingleFactor(factor, factorIndex, i);
            
            // Check if the factorValue is valid
            if (factorValue !== undefined && factorValue !== null) {
              addmultiResult.push({ loadCaseName, sign, factor: factorValue });
            }
          });
        });
        
        // Only push the result if there are items in addmultiResult
        if (addmultiResult.length > 0) {
          addresult[factorIndex][i].push(addmultiResult);  // Store result for the current factorIndex and i
        }
      }
    });
  }
}
console.log(addresult);
let allCombinations_multi = []; // To store the final results
// Loop through each main array in combinedResult
combinedResult.forEach((mainArray) => {
  // Loop through each inner array in mainArray
  mainArray.forEach((innerArray) => {
    let combinedSet = [];
    Object.keys(addresult).forEach((key) => {
      const addArray = addresult[key];
        innerArray.forEach((subArray, index) => {
          const correspondingAddSubArray = addArray[key]; // Get the matching subarray from addArray
          // Only combine if both subarrays exist
          if (subArray && correspondingAddSubArray) {
            // Iterate through each subarray inside correspondingAddSubArray
            correspondingAddSubArray.forEach((addSubArray) => {
              // Merge the subArray from innerArray with each subarray from correspondingAddSubArray
              const combinedArray = [
                ...subArray, // Spread elements from the main subArray
                ...addSubArray // Spread elements from the current addSubArray
              ];
              combinedSet.push(combinedArray); // Add the combined result to combinedSet
            });
          }
        });
      // }
    });
    // Push the combined set for this innerArray into the main results array
    allCombinations_multi.push(combinedSet);
  });
});
console.log(allCombinations_multi);
const flattenedCombinations = allCombinations_multi.flat(1);

const joinedCombinations = [...flattenedCombinations, ...allCombinations];

// Log the joined array
console.log(joinedCombinations);

  return joinedCombinations;
}
    if (either && either.length > 0 || envelope &&  envelope.length > 0) {
  // Combine either and envelope into a single array
  const combinedLoadCases = [...(either || []), ...(envelope || [])];

  // Use the combined array in combineLoadCases
  const combined = combineLoadCases(combinedLoadCases, add, envelope);

      eitherJoin.push(...combined);
      joinArray.push(eitherJoin);
    }

    const addJoin = [];
    if (either.length === 0 && envelope.length === 0 && add.length > 0) {
      const combined = [];
      
      for (let factorIndex = 0; factorIndex < 5; factorIndex++) {
        for (let i = 0; i < 5; i++) {
          let allCombinations = [];
          let shouldBreak = false; // Flag to determine whether to break the outer loop
    
          add.forEach(addArray => {
            // Variable to hold combinations for each addArray separately
            let subArrayCombination = [];
    
            if (Array.isArray(addArray) && addArray.length > 0) {
              addArray.forEach(item => {
                Object.keys(item).forEach(key => {
                  const value = item[key];
                  const loadCaseName = value.loadCaseName;
                  const sign = value.sign;
                  const factor = value.factor[factorIndex];
                  let factorValue;
    
                  if (Array.isArray(factor)) {
                    factorValue = getSingleFactor(factor, factorIndex, i);
                  } else {
                    factorValue = factor;
                  }
    
                  // Check if factorValue is valid and non-zero, then push it into subArrayCombination
                  if (factorValue !== undefined) {
                    const combinedResult = { loadCaseName, sign, factor: factorValue };
                    subArrayCombination.push(combinedResult);
    
                    if (!Array.isArray(factor)) {
                      // Set the flag to true for non-array factors and exit inner loops
                      shouldBreak = true;
                      return; // Exit the innermost loop
                    }
                  }
                });
              });
            }
    
            // After processing the entire addArray, add subArrayCombination to allCombinations
            if (subArrayCombination.length > 0) {
              allCombinations.push(subArrayCombination);
            }
    
            if (shouldBreak) {
              return; // Break out of the forEach loop as well
            }
          });
    
          // Push allCombinations to combined if it has entries
          if (allCombinations.length > 0) {
            combined.push(allCombinations);
          }
    
          if (shouldBreak) {
            break; // Break out of the 'i' loop
          }
        }
      }
      addJoin.push(...combined);
      const flattenedAddJoin = addJoin.flat(1); // Flatten by one level
      
      // Push the flattened array to joinArray
      joinArray.push(flattenedAddJoin);
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
                  temp.push([...combination, ...newItem]);
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
                  temp.push([...combination, ...newItem]);
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
          innerArr.splice(objIndex, 1); // Remove the empty obj from innerArr
          objIndex--; // Adjust the index after removal to avoid skipping elements
        } else {
          obj.length = 0;
          obj.push(...temp); // Push modified combinations to obj
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
                  temp.push([...combination, ...newItem]);
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
          innerArr.splice(objIndex, 1); // Remove the empty obj from innerArr
          objIndex--; // Adjust the index after removal to avoid skipping elements
        } else {
          obj.length = 0;
          obj.push(...temp); // Push modified combinations to obj
        }
      }
    }
  }
  }
  console.log({ addObj, eitherArray, envelopeObj,firstKey });
  return { addObj, eitherArray,envelopeObj ,firstKey,secondLastKey};
}

async function Generate_Load_Combination() {
  const uniqueFactorData = removeDuplicateFactors(loadCombinations);
  setLoadCombinations(uniqueFactorData);
  console.log(uniqueFactorData);
  console.log(loadCombinations);
  const basicCombinations = generateBasicCombinations(loadCombinations);
  console.log(basicCombinations);
  setGenerateLoading(false);
}
const isGeneratingRef = useRef(false);
async function generateEnvelopeLoadCombination() {
  if (Object.keys(civilCom.Assign).length === 0) {
    console.log("civilCom.Assign is empty, no combinations to process.");
    return;
  }

  // Prevent duplicate calls
  if (isGeneratingRef.current) return;

  isGeneratingRef.current = true; // Set the flag

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
    isGeneratingRef.current = false; // Reset the flag
    civilCom.Assign = {};
    civilComEnv.Assign = {};
    console.log("civilCom has been refreshed:", civilCom);
    console.log("civilComEnv has been refreshed:", civilComEnv);
  }
}

if (Object.keys(civilCom.Assign).length > 0 && !isGeneratingRef.current) {
  generateEnvelopeLoadCombination();
}


const toggleExcelReader = () => {
  fileInputRef.current.click();
};
const handleImportClick = () => {
  setImportLoading(true);

  // Simulate file selection process
  toggleExcelReader();

  // Simulate a delay to represent the file handling process
  setTimeout(() => {
    setImportLoading(false); // Reset loading state
  }, 5000); // Replace this with your actual import logic
};
const [loadCombinations, setLoadCombinations] = useState(
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
  // Ensure there is always an additional empty row at the end
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
const removeDuplicateFactors = (data) => {
  return data.map((combination) => {
    // Only process loadCases if type is "Either"
    if (combination.type === "Either" || combination.type === "Envelope") {
      const updatedLoadCases = combination.loadCases.map((loadCase) => {
        const factors = [
          loadCase.factor1,
          loadCase.factor2,
          loadCase.factor3,
          loadCase.factor4,
          loadCase.factor5,
        ];

        // Remove duplicates by creating a Set, then convert back to an array
        const uniqueFactors = Array.from(new Set(factors));

        // Map unique factors back to loadCase properties
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
    // Return the combination as-is if type is not "Either"
    return combination;
  });
};

const handleFileChange = (event) => {
  const file = event.target.files[0];
  const reader = new FileReader();

  reader.onload = (e) => {
    const binaryStr = e.target.result;
    const workbook = XLSX.read(binaryStr, { type: 'binary' });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    console.log('Raw JSON Data:', jsonData); 
    const formattedData = [];
    let currentLoadCombination = null;

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
  
    // Check if the selectedLoadCombinationIndex is valid
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
	<div className="App" >
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
      boxShadow: '0px -4px 5px -4px grey' // Adds a shadow effect to the top border
    }}> 
    <Scrollbars height={360} width={280}>

               {loadCombinations.map((combo, index) => (
      <div key={index} style={{ display: 'flex', flexDirection: 'row', borderBottom: '1px solid #ccc', cursor: 'pointer', backgroundColor: selectedLoadCombinationIndex === index ? '#f0f0f0' : 'white' }} onClick={() => handleLoadCombinationClick(index)}>
        <div style={{ flex: '0 0 110px', padding: '5px', borderRight: '1px solid #ccc', color: 'black' }}>
                      {index === loadCombinations.length - 1 ? (
                        <input
                          type="text"
                          value={inputValue}
                          onChange={(e) =>
                            handleInputChange(index, 'loadCombination', e.target.value)
                          }
                          onBlur={() =>
                            handleLoadCombinationChange(index, 'loadCombination', inputValue)
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
                        <Typography>{combo.loadCombination}</Typography>
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
              <Typography>{combo.active}</Typography>
              {activeDropdownIndex === index && (
                <div
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
                  <div onClick={() => handleOptionSelect(index, 'Active')}><Typography>Active</Typography></div>
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
                      <Typography>{combo.type}</Typography>
                      {typeDropdownIndex === index && (
                        <div
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
                                backgroundColor: option === <Typography>combo.type</Typography> ? '#f0f0f0' : 'white'
                              }}
                            >
                              <Typography>{option}</Typography>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    </div>
                ))}
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
  marginTop: '3px', // Adjust margin-bottom as per your requirement
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
    loadCombinations[selectedLoadCombinationIndex].loadCases.map((loadCase, loadCaseIndex) => (
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
  <div style={{ position: 'absolute', backgroundColor: 'white', border: '1px solid #ccc', zIndex: 1, top: '100%', left: 0, right: 0 }}>
    <Scrollbars height={150} width="100%"> {/* Applying the Scrollbars component */}
      {/* <Stack spacing={1}> */}
        {[
          ...loadNames_key.map((item) => `${item.name}(${item.key})`), 
           ...loadCombinations.map((combination) => combination.loadCombination)
  ]
  .filter((name, nameIndex) => nameIndex !== selectedLoadCombinationIndex) // Filter out the name at the current index
  .map((name) => (
    <div
      key={name} // Using name as the key
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
            <div style={{ position: 'absolute', backgroundColor: 'white', border: '1px solid #ccc', zIndex: 1, top: '100%', left: 0, right: 0 }}>
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
    ))}
    {/* {selectedLoadCombinationIndex >= 0 && ( */}
    <div style={{ display: "flex", alignItems: "center" , width: "40%", marginLeft: "110px" }}>
    {Buttons.NodeButton("contained", "Add Row", handleAddLoadCase)}
    {Buttons.NodeButton("contained", "Delete Row", handleDeleteRow)}
    </div>
  {/* )} */}
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

{generateLoading ? (
     Buttons.SubButton("contained", "Generating")
) : (
  Buttons.SubButton("contained", "Generate Load Combination", Generate_Load_Combination)
)}

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