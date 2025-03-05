import * as React from "react";
import { GuideBox, Panel, Switch,DropList} from "@midasit-dev/moaui";
import Sep from "@midasit-dev/moaui/Components/Separator";
import { useSnackbar, SnackbarProvider } from "notistack";
import { midasAPI } from "./Function/Common";
import { VerifyUtil, VerifyDialog } from "@midasit-dev/moaui";
import { Check,Typography,Scrollbars,Stack,TextField } from "@midasit-dev/moaui";
import { Button } from "@midasit-dev/moaui";
import { useEffect } from "react";
import { useState } from "react";
import * as XLSX from 'xlsx';
import ComponentsDialogHelpIconButton from "./Function/ComponentsDialogHelpIconButton";


function App() {
  const [showDialog, setDialogShowState] = useState(false);
  const [selectedCheckboxes, setSelectedCheckboxes] = useState([]);
  const [selectedCheckboxForces, setSelectedCheckboxForces] = useState(["Axial"]);
  const [comb, setComb] = useState({});
  const [elem, setelement] = useState({});
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const [selectedCheckboxParts, setSelectedCheckboxParts] = useState(["I"]);
  let combData = [];
  const [checkedComb, setCheckedComb] = useState([]);
  const [fileName, setFileName] = useState(""); 
  const [sheetNames, setSheetNames] = useState([]); // State variable to store sheet names
  const [selectedSheet, setSelectedSheet] = useState(new Map());  // State variable to store selected sheet
  const [isDropdownDisabled, setIsDropdownDisabled] = useState(false);
  const [isSwitchChecked,setIsSwitchChecked] = useState(false); // State variable to disable dropdown
  const [fileContent, setFileContent] = useState(null);
  const [cellRange, setCellRange] = useState("A1");
  const handleCheckboxChange = (name) => {
    if (selectedCheckboxes.includes(name)) {
      setSelectedCheckboxes(
        selectedCheckboxes.filter((checkbox) => checkbox !== name)
      );
    } else {
      setSelectedCheckboxes([...selectedCheckboxes, name]);
    }
  };
  const handleCellRangeChange = (event) => {
    setCellRange(event.target.value);
  };
  const handleCheckboxForces = (name) => {
    if (selectedCheckboxForces.includes(name)) {
      setSelectedCheckboxForces(
        selectedCheckboxForces.filter((checkbox) => checkbox !== name)
      );
    } else {
      setSelectedCheckboxForces([...selectedCheckboxForces, name]);
    }
  };
  const handleCheckboxPartsChange = (name) => {
    if (selectedCheckboxParts.includes(name)) {
      setSelectedCheckboxParts(
        selectedCheckboxParts.filter((checkbox) => checkbox !== name)
      );
    } else {
      setSelectedCheckboxParts([...selectedCheckboxParts, name]);
    }
  };
  const Refresh = () => {
    console.log("Refresh button clicked");
    setSelectedCheckboxes([]);
    setComb({});
    setFileContent(null); // Reset fileContent to null
    setCellRange("A1"); // Reset cellRange to "A1"
    setFileName(""); // Reset fileName to empty string
    setSheetNames([]); // Reset sheetNames to empty array
    if (isSwitchChecked) {
      const event = {
        bubbles: true,
        cancelable: true,
        currentTarget: {
          checked: false,
        },
        defaultPrevented: false,
        eventPhase: 3,
        isDefaultPrevented: () => false,
        isPropagationStopped: () => false,
        isTrusted: true,
        nativeEvent: {
          isTrusted: true,
        },
        target: {
          checked: false,
        },
        timeStamp: Date.now(),
        type: "change",
        _reactName: "onChange",
        _targetInst: null,
      };
      handleSwitchChange(event);
    }
    // messageShown = false;
    importLoadCombinations();
  };

  const importLoadCombinations = async () => {
    await fetchData();
    let elements = await fetchElement();
    let messageShown = false;
    // while (elements && elements.length === 0) {
    //   if (!messageShown) {
    //     enqueueSnackbar("Please Select an Element", {
    //       variant: "error",
    //       anchorOrigin: {
    //         vertical: "top",
    //         horizontal: "center",
    //       },
    //       autoHideDuration: 5000, 
    //     });
    //     messageShown = true;
    //   }
    //   console.log("Retrying fetchElement...");
    //   elements = await fetchElement();
    // }
    if (elements && elements.length === 0) {
      console.error("Max retries reached. Unable to fetch elements.");
    }
  };
  let messageShown = false;
  async function fetchElement() {
    try {
      const response = await midasAPI("GET", "/view/select");

      if (response.error) {
        console.error(`Error fetching element data: ${response.error.message}`);
        return null;
      }

      const elements = response["SELECT"]["ELEM_LIST"];
      console.log("Elements:", elements);
      if (elements.length === 0) {
        if (!messageShown) {
          enqueueSnackbar("Please Select an Element", {
            variant: "error",
            anchorOrigin: {
              vertical: "top",
              horizontal: "center",
            },
            autoHideDuration: 5000,
          });
          messageShown = true;
        }
        setelement([" "]);
        return [];
      }
      setelement(elements);
      return elements;
    } catch (error) {
      console.error("Error fetching data:", error);
      return null;
    }
  }
  const startPolling = (interval = 1000) => {
    setInterval(async () => {
      await fetchElement();
    }, interval);
  };
  async function get_force() {
    const unitsResponse = await midasAPI("GET", "/db/unit", {});
  console.log(unitsResponse);

  // Extract DIST and FORCE values
  const { DIST, FORCE } = unitsResponse.UNIT["1"];
  console.log(`DIST: ${DIST}, FORCE: ${FORCE}`);

    if ((elem.length === 0 || (elem.length === 1 && elem[0] === " "))&& selectedCheckboxes.length === 0) {
      enqueueSnackbar("Please Select Element & Select Load Combination Checkboxes ", {
        variant: "error",
        anchorOrigin: {
          vertical: "top",
          horizontal: "center",
        },
      });
      return;
    }
    if (elem.length === 0 || (elem.length === 1 && elem[0] === " ")){
      enqueueSnackbar("Please select an element", {
        variant: "error",
        anchorOrigin: {
          vertical: "top",
          horizontal: "center",
        },
      });
      return;
    }
    if (selectedCheckboxes.length === 0) {
      enqueueSnackbar("Please select Load Combination", {
        variant: "error",
        anchorOrigin: {
          vertical: "top",
          horizontal: "center",
        },
      });
      return;
    }
  
    const processCheckboxes = (checkboxes) => {
      const prefixes = ["CB", "CBC", "CBS", "CBSC"];
      const suffixes = ["max", "min"];
      let processed = [];
      checkboxes.forEach((checkbox) => {
        prefixes.forEach((prefix) => {
          suffixes.forEach((suffix) => {
            processed.push(`${checkbox}(${prefix}:${suffix})`);
          });
        });
      });
      return processed;
    };
  
    const processParts = (parts) => {
      return parts.map(part => `Part${part}`);
    };
  
    const processedCheckboxes = processCheckboxes(selectedCheckboxes);
    const processedParts = processParts(selectedCheckboxParts);
    console.log(processedCheckboxes);
    console.log(processedParts);
    const jsonData = {
      "Argument": {
        "TABLE_NAME": "BeamForceViewByMaxValue",
        "TABLE_TYPE": "BEAMFORCEVBM",
        "EXPORT_PATH": "C:\\MIDAS\\Result\\Output.JSON",
        "UNIT": {
          "FORCE": FORCE,
          "DIST": DIST
        },
        "STYLES": {
          "FORMAT": "Fixed",
          "PLACE": 12
        },
        "COMPONENTS": [
          "Elem",
          "Load",
          "Part",
          "Component",
          "Axial",
          "Shear-y",
          "Shear-z",
          "Torsion",
          "Moment-y",
          "Moment-z"
        ],
        "NODE_ELEMS": {
          "KEYS": elementArray
        },
        "LOAD_CASE_NAMES": processedCheckboxes,
        "PARTS": processedParts,
        "ITEM_TO_DISPLAY": selectedCheckboxForces
      }
    };
    console.log("json",jsonData);
    const response = await midasAPI("POST", "/post/table", jsonData);
    console.log(response);
    if (!response || !response.BeamForceViewByMaxValue || !response.BeamForceViewByMaxValue.DATA) {
      enqueueSnackbar("Please run the analysis", {
        variant: "error",
        anchorOrigin: {
          vertical: "top",
          horizontal: "center",
        },
        autoHideDuration: 5000, // Set display time to 5 seconds
      });
      return;
    }
    if (response && response.BeamForceViewByMaxValue && response.BeamForceViewByMaxValue.DATA) {
      const data = response.BeamForceViewByMaxValue.DATA;
      const modifiedHeaders = response.BeamForceViewByMaxValue.HEAD;
      const headers = modifiedHeaders.map(header => {
        if (header === "Axial" || header === "Shear-y" || header === "Shear-z") {
          return `${header} (${FORCE})`;
        } else if (header === "Torsion" || header === "Moment-y" || header === "Moment-z") {
          return `${header} (${FORCE}-${DIST})`;
        }
        return header;
      });
    
      console.log(modifiedHeaders);
      console.log(headers);
      let workbook = fileContent;
      let worksheet;
  
      if (isSwitchChecked) {
          const fileset = sheetNames[selectedSheet];
          if (fileset === "New Sheet") {
            // Create a new sheet if "New Sheet" is selected
            worksheet = XLSX.utils.aoa_to_sheet([]);
            XLSX.utils.book_append_sheet(workbook, worksheet, "New Sheet");
          } else {
            if (!workbook.Sheets[fileset]) {
              throw new Error(`Sheet ${selectedSheet} does not exist in the workbook.`);
            }
            worksheet = workbook.Sheets[fileset];
          }
          const aoaData = [headers, ...data];
          const upperCaseCellRange = cellRange.toUpperCase();
          XLSX.utils.sheet_add_aoa(worksheet, aoaData, { origin: upperCaseCellRange });
  
          // Set column widths
          const startCell = XLSX.utils.decode_cell(cellRange);
          const startRow = startCell.r;
          const startCol = startCell.c;
        
          // Set column widths starting from the startCol
          const colWidths = [];
          // for (let i = 0; i < startCol; i++) {
          //   colWidths.push({ wch: 10 }); // Default width for columns before startCol
          // }
          for (let i = startCol; i < startCol + headers.length; i++) {
            colWidths[i] = { wch: 30 };  // Set width to 30 characters for columns starting from startCol
          }
          worksheet['!cols'] = colWidths;
        
          worksheet['!rows'] = worksheet['!rows'] || [];
          worksheet['!rows'][startRow] = { hpt: 40 }; // Set height to 40 points
        
  
          headers.forEach((header, index) => {
            const cellAddress = XLSX.utils.encode_cell({ r: startRow, c: startCol + index });
            if (!worksheet[cellAddress]) return;
            if (!worksheet[cellAddress].s) worksheet[cellAddress].s = {};
            worksheet[cellAddress].s.font = {
              bold: true,
              color: { rgb: "FFFFFF" },
              sz: 16 // Set font size to 16
            };
            worksheet[cellAddress].s.fill = {
              fgColor: { rgb: "000000" } // Set background color to black
            };
            worksheet[cellAddress].s.alignment = {
              vertical: "center",
              horizontal: "center"
            };
          });
          try {
            XLSX.writeFile(workbook, fileName);
          } catch (error) {
            console.error("Error saving the file:", error);
            enqueueSnackbar("Error saving the file. Please try again.", {
              variant: "error",
              anchorOrigin: {
                vertical: "top",
                horizontal: "center",
              },
              autoHideDuration: 5000,
            });
          }
      } else {
        workbook = XLSX.utils.book_new();
        worksheet = XLSX.utils.aoa_to_sheet([headers, ...data]);
        const colWidths = headers.map(() => ({ wch: 20 })); 
        worksheet['!cols'] = colWidths;
        worksheet['!rows'] = [{ hpt: 30 }]; 
  
        headers.forEach((header, index) => {
          const cellAddress = XLSX.utils.encode_cell({ r: 0, c: index });
          if (!worksheet[cellAddress]) return;
          if (!worksheet[cellAddress].s) worksheet[cellAddress].s = {};
          worksheet[cellAddress].s.font = {
            bold: true,
            color: { rgb: "FFFFFF" },
            sz: 16
          };
          worksheet[cellAddress].s.fill = {
            fgColor: { rgb: "000000" }
          };
          worksheet[cellAddress].s.alignment = {
            vertical: "center",
            horizontal: "center"
          };
        });
        XLSX.utils.book_append_sheet(workbook, worksheet, "BeamForceData");
        XLSX.writeFile(workbook, "BeamForceData.xlsx");  
      }
    }
  }
  async function fetchData() {
    const endpointsDataKeys = [
      { endpoint: "/db/lcom-gen", dataKey: "LCOM-GEN" },
      { endpoint: "/db/lcom-conc", dataKey: "LCOM-CONC" },
      { endpoint: "/db/lcom-src", dataKey: "LCOM-SRC" },
      { endpoint: "/db/lcom-steel", dataKey: "LCOM-STEEL" },
      { endpoint: "/db/lcom-stlcomp", dataKey: "LCOM-STLCOMP" },
    ];
    let allData = [];
    let check = false;

      for (const { endpoint, dataKey } of endpointsDataKeys) {
        const response = await midasAPI("GET", endpoint);
        console.log(response);
        if (response && !response.error && response.message !== "") {
          let responseData = response[dataKey];
          if (!Array.isArray(responseData)) {
            responseData = Object.values(responseData);
          }
          const keys = Object.keys(response[dataKey]);
          const lastindex = parseInt(keys[keys.length - 1]);
          console.log(lastindex);
          responseData.forEach((item) => {
            combData.push({ name: item.NAME, endpoint, lastindex: lastindex });
          });
          if (allData.length > 0) {
            const lastElement = allData[0];
            const lastNumber = Object.keys(lastElement).length - 1;
            for (let index = 0; index < responseData.length; index++) {
              const item = responseData[index];
              item.someProperty = lastNumber + index + 1;
              allData.push(item);
            }
          } else {
            allData = allData.concat(responseData);
            console.log(allData);
          }
          check = true;
          console.log(`Data from ${endpoint}:`, responseData);
        }
      }
      if (check) {
        setComb(allData);
        return null;
      }
   
    if (combArray.length === 0) {
      enqueueSnackbar("Please Define Load Combination", {
        variant: "error",
        anchorOrigin: {
          vertical: "top",
          horizontal: "center",
        },
      });
      return;
    }
    fetchElement();
  }

  useEffect(() => {
    if (
      !VerifyUtil.isExistQueryStrings("redirectTo") &&
      !VerifyUtil.isExistQueryStrings("mapiKey")
    ) {
      setDialogShowState(true);
      return;
    }
    const loadingMessage = enqueueSnackbar("Fetching data, please wait...", {
      variant: "info",
      persist: true,
      anchorOrigin: {
        vertical: "top",
        horizontal: "center",
      },
    });
  
    // Call importLoadCombinations and dismiss the loading message once complete
    importLoadCombinations().finally(() => {
      // Dismiss the loading message
       closeSnackbar(loadingMessage);
    });
    startPolling(1000);
  }, []);
  const combArray = Object.values(comb);
  console.log(comb);
  console.log(combArray);
  const elementArray = Object.values(elem);
  console.log(elementArray);
  console.log("checkedComb",checkedComb);
  const handleButtonClick = () => {
    document.getElementById('fileInput').click();
  };
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    console.log('Selected file:', file);
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      
      const workbook = XLSX.read(data, { type: 'array' });
      setFileContent(workbook);
      const sheetNames = workbook.SheetNames;
      setSheetNames([...sheetNames, "New Sheet"]); // Add "New Sheet" option
    };
    reader.readAsArrayBuffer(file);
  };
  const handleSheetChange = (event) => {
    const selected = event.target.value;
    setSelectedSheet(selected);
    if (fileName && selected) {
      setIsDropdownDisabled(true); // Disable dropdown after selection
    }
  };
  const sheetNamesMap = new Map(sheetNames.map((name, index) => [name, index]));
  const handleSwitchChange = (event) => {
    setIsSwitchChecked(event.target.checked);
  };
  console.log(selectedCheckboxes);
  console.log(selectedCheckboxParts);
  console.log(selectedCheckboxForces);
  return (
    <div className="App">
      {showDialog && <VerifyDialog />}
      <GuideBox padding={2} center>
        <GuideBox  show={4} width={520} height={440} overflow="visible" column fill="0">
        <Panel width={520} height={400} variant="box" flexItem backgroundColor="white" >
        <Panel width="230px" height="380px" variant="shadow" marginBottom="10px" >
			  <Typography variant="h1" color="primary">
  Load Combination
</Typography>
<div style={{height: '10px'}}></div>
<TextField 
			width="200px"
			placeholder=""
			title=""
			titlePosition="left"
			disabled={false}
			placeholder="SELECED LOAD COMBINATIONS"
			error={false}
      value={selectedCheckboxes.join(', ')}
      marginBottom={5}
		/>
    <div style={{height: '10px'}}></div>
<Scrollbars
  height={240}
  outline="shadow"
  title="Select Load Combination"
  titleColor="disable"
  titleVariant="body1"
  width={200}
>
  <Stack spacing={1}>
  {combArray.map((comb, index) => (
      <Check key={index} name={comb.NAME} onChange={() => handleCheckboxChange(comb.NAME)}/>
    ))}
  </Stack>
</Scrollbars>
		</Panel>
    <Panel width="290px" height="380px" variant="shadow" >
			<Panel width="255px" height="40px" variant="box" flexItem >
      <div style={{ marginRight: '16px', marginTop: '8px', fontSize: '14px' }}>
  Elements_ID
</div>
      <TextField 
			width="130px"
			placeholder="SELECTED ELEMENTS"
			title=""
			titlePosition="left"
			// disabled={false}
			defaultValue=""
			error={false}
      value={elementArray.join(', ')}
		/>
      </Panel>
      <Panel width="255px" height="40px" variant="box" flexItem >
      <div style={{ marginRight: '24px', marginTop: '8px', fontSize: '14px' }}>
  Parts
</div>
      <Panel width="130px" height="40px" variant="box" flexItem >
      <Check name="I" checked={selectedCheckboxParts.includes("I")} onChange={() => handleCheckboxPartsChange("I")} marginTop={1} />
<Check
name="J"
onChange={() => handleCheckboxPartsChange("J")}
/> </Panel>
      </Panel>
      <Panel width="245px" height="140px"variant="shadow" marginTop={1} disabled={true} >
      <div style={{ fontSize: '14px', color: 'grey', textAlign: 'left' }}>Select Components to Display</div>
      <Panel width="220px" height="105px" variant="box" flexItem marginTop={0} marginLeft={0}>
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
      <div style={{ display: 'flex'}}>
      <Check name="Axial" checked={selectedCheckboxForces.includes("Axial")} onChange={() => handleCheckboxForces("Axial")} />
        <div style={{width: '62px'}}></div>
        <Check name="Torsion" onChange={() => handleCheckboxForces("Torsion")} />
      </div>
      <div style={{ display: 'flex' }}>
        <Check name="Shear-y" onChange={() => handleCheckboxForces("Shear-y")} />
        <div style={{width: '45px'}}></div>
        <Check name="Shear-z" onChange={() => handleCheckboxForces("Shear-z")} />
      </div>
      <div style={{ display: 'flex' ,justifyContent: 'space-between' }}>
        <Check name="Moment-y" onChange={() => handleCheckboxForces("Moment-y")} />
        <div style={{width: '31.5px'}}></div>
        <Check name="Moment-z" onChange={() => handleCheckboxForces("Moment-z")} />
      </div>
    </div>
  </Panel>
      </Panel>
      <Panel width="245px" height="129px"variant="shadow" marginTop={0.4} marginLeft={0} backgroundColor={isSwitchChecked ? 'white' : '#f0f0f0'} >
        <Panel width="245px" height="20px" variant="box" flexItem marginBottom={0}>
        <Switch
        label="Select Excel file to import data"
  onChange={handleSwitchChange}
/>
        </Panel>
      <Panel width="245x" height="40px" variant="box" flexItem marginTop={1}>
                {sheetNames.length === 0 ? (
                  <>
                    <Button
                      variant="contained"
                      color="normal"
                      width="110px"
                      onClick={handleButtonClick}
                      disabled={!isSwitchChecked} 
                    >
                      Choose File
                    </Button>
                    <input
                      type="file"
                      id="fileInput"
                      style={{ display: 'none' }}
                      onChange={handleFileChange}
                      disabled={!isSwitchChecked} 
                      accept=".xls,.xlsx"
                    />
                  </>
                ) : (
                  <DropList
                    itemList={sheetNamesMap}
                    width="150px"
                    value={selectedSheet}
                    onChange={(e) => handleSheetChange(e)}
                    disabled={!isSwitchChecked || isDropdownDisabled}
                  />
                )}   
                  <div style={{ fontSize: '12px', height: '20px', marginTop: '5px', width: '120px',marginBottom: "20px" }}>
  {fileName
    ? `${fileName}`
    : "No file chosen"}
</div>
              </Panel>
              <Panel width="245x" height="50px" variant="box" flexItem marginTop={0}>
              <div style={{ fontSize: '13px', height: '20px', marginTop: '5px' }}> 
                Enter cell range
              </div>
              <TextField 
			width="80px"
			placeholder="A1"
			title=""
			titlePosition="left"
			disabled={!isSwitchChecked}
			defaultValue=""
			error={false}
      value={cellRange}
      onChange={handleCellRangeChange}
		/>
              </Panel>
      </Panel>
		</Panel>
        </Panel>
        <Panel width="520px" height="50px" variant="box" backgroundColor="white" flexItem >
        <Button
  color="normal"
  onClick={Refresh}
  width="auto"
>
  Refresh
</Button>
<div style={{ width:"120px" }}></div>
<Button
  color="normal"
  onClick={get_force}
  width="auto"
>
  Get Forces
</Button>
<div style={{ width:"120px" }}></div>
<ComponentsDialogHelpIconButton />
        </Panel>
       </GuideBox>
      </GuideBox>
    </div>
  );
}
export default App;
