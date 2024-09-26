import {DropList,Grid,Panel,Typography,VerifyUtil, } from "@midasit-dev/moaui";
  import { Radio, RadioGroup } from "@midasit-dev/moaui";
  import React, { useState, useEffect, useRef } from "react";
  import * as Buttons from "./Components/Buttons";
  import ExcelJS from "exceljs";
  import AlertDialogModal from "./AlertDialogModal";
  import { midasAPI } from "./Function/Common";
  import { enqueueSnackbar } from "notistack";
  import { ThetaBeta1 } from "./Function/ThetaBeta";
  import { ThetaBeta2 } from "./Function/ThetaBeta";
  import { TextField } from "@midasit-dev/moaui";
  import { saveAs } from "file-saver";
  import { closeSnackbar } from 'notistack'
  import { useSnackbar, SnackbarProvider } from "notistack";
  import Image from '../src/assets/sg_ag.png';

  
  export const Updatereport = () => {
    const [workbookData, setWorkbookData] = useState(null);
    const [sheetData, setSheetData] = useState([]);
    const [sheetName, setSheetName] = useState("");
    const [cast, setCast] = useState("inplace");
    const [sp, setSp] = useState("ca1");
    const [cvr, setCvr] = useState("ca2");
    const [value, setValue] = useState(1);
    const [SelectWorksheets, setWorksheet] = useState({});
    const [SelectWorksheets2, setWorksheet2] = useState({});
    const [SelectWorksheets3, setWorksheet3] = useState(null);
    const [lc, setLc] = useState({});
    const [item, setItem] = useState(new Map([["Select Load Combination", 1]]));
    const [check, setCheck] = useState(false);
    const [selectedName, setSelectedName] = useState("");
    const [matchedParts, setMatchedParts] = useState([]);
    let [allMatches, setAllMatches] = useState([]);
    const fileInputRef = useRef(null);
    const [buttonText, setButtonText] = useState('Create Report');
    let lcname; let lastWkey;
    let mu_pos ={};
    let mu_neg ={};
    let mr_old_pos={};
    let mr_new_pos = {};
    let mr_old_neg = {};
    let mr_new_neg = {};
    let check_mr_old;
    let check_mr_new;
    let s_m ={};
    let s_n ={};
    let sm_old ={};
    let sm_new ={};
    let sn_old ={};
    let sn_new ={};
    let sxe = {} ;
    let smax_old={}; let smax_new={}; let suse={}; let dc_old={}; let dc_new={}; let beta_m={}; let theta_m ={}; let beta_n ={}; let theta_n ={}; let Av_f={}; let Avr_old={}; let Avr_new={}; let vu={}; let vr_old={}; let vr_new={}; 
    let beta_mo ={}; let beta_no ={}; let theta_no ={}; let theta_mo ={}; let vr_old_n={}; let vr_new_n ={}; let phi_new_m; let phi_new_n;  let suse2={}; let smax_old_2={}; let smax_new_2={}; let dc_old_2={}; let dc_new_2={};let Avr_old_n={}; let Avr_new_n={};
    const action = snackbarId => (
        <>
          <button style={{ backgroundColor: 'transparent', border: 'none',color: 'white', cursor: 'pointer' }} onClick={() => { closeSnackbar(snackbarId) }}>
            Dismiss
          </button>
        </>
      );
  
    console.log(lcname);
    useEffect(() => {
      fetchLc();
    }, []); 
  
 
    console.log(selectedName);
  
    async function onChangeHandler(event) {
      setValue(event.target.value);
      console.log(event.target.value);
      // Find the name corresponding to the selected key
      for (let [name, key] of item.entries()) {
        if (key === event.target.value) {
          setSelectedName(name);
          lcname = name;
          console.log(lcname);
        }
      }
    }
  
    let worksheet;
    let worksheet2;
    let worksheet3;
    const handleFileUpload = async (event) => {
      const file = event.target.files[0];
      const reader = new FileReader();
      reader.onload = async (e) => {
        // await fetchLc();
  
        try {
          let buffer = e.target.result;
          let workbook = new ExcelJS.Workbook();
          await workbook.xlsx.load(buffer);
          let summarySheet = workbook.addWorksheet('Summary');
          let newMatchedParts = [];
          
          // const summaryWorkbook = await fetchAndProcessExcelFile();
          // const summarySheet = summaryWorkbook.getWorksheet('Sheet1');
  
        if (!summarySheet) {
          // throw new Error("Sheet1 not found in Summary_Caltrans.xlsx");
        }
          const regex = /^([0-9]+)_([A-Z])$/;
  
          for (let key in workbook.worksheets) {
            let match = regex.exec(workbook.worksheets[key].name);
            if (match) {
              // match[1] contains the part that matches [0-9]+
              // match[2] contains the part that matches [A-Z]
              newMatchedParts.push({ numberPart: match[1], letterPart: match[2] });
              allMatches.push(match[0]);
              console.log(allMatches);
              worksheet = workbook.worksheets[key];
              setWorksheet((prevState) => ({
                ...prevState,
                [key]: workbook.worksheets[key],
              }));
              const addRichText = (cell) => {
                if (cell && cell.richText) {
                    // Your logic for handling richText
                    console.log('Processing cell with richText:', cell.richText);
                }
            };
    
            // Iterate through each row and cell in the worksheet
            worksheet.eachRow((row) => {
                row.eachCell((cell) => {
                    addRichText(cell);
                });
            });
            }
            setMatchedParts(newMatchedParts); 
            console.log(matchedParts);
            setAllMatches(allMatches);
          }
  
          console.log(matchedParts);
          console.log(allMatches);
           for (let key in workbook.worksheets) {
            const lcb = "StressAtLCB";
            if (workbook.worksheets[key].name === lcb) {
              worksheet2 = workbook.worksheets[key];
              setWorksheet2((prevstate) => ({
                ...prevstate,
                [key]: workbook.worksheets[key],
              }));
            }
          }
         
          console.log(worksheet);
          console.log(worksheet2);
         
  
          if (!worksheet) {
            throw new Error("No worksheets found in the uploaded file");
          } else {
            let cellvalue = worksheet.getRow(3).getCell(3).value;
            if (cellvalue != "AASHTO-LRFD2017") {
              alert("Incorrect file format");
            }
          }
         
        
  
          const indexToLetter = (index) => {
            let letter = "";
            while (index >= 0) {
              letter = String.fromCharCode((index % 26) + 65) + letter;
              index = Math.floor(index / 26) - 1;
            }
            return letter;
          };
  
          let startRowNumbers = [];
          let endRowNumbers = [];
  
          // Find all start and end rows based on values in the first cell
          worksheet.eachRow((row, rowNumber) => {
            if (row.getCell(1).value === "$$strm1") {
              startRowNumbers.push(rowNumber);
            } else if (row.getCell(1).value === "$$theta_max") {
              rowNumber = rowNumber + 1;
              endRowNumbers.push(rowNumber);
            }
          });
  
          if (startRowNumbers.length === 0 || endRowNumbers.length === 0) {
            throw new Error(
              "Could not find the start or end markers ($$strm1 or $$fpo)"
            );
          }
  
          // Ensure we have matching start and end markers
          if (startRowNumbers.length !== endRowNumbers.length) {
            throw new Error(
              "Mismatched number of start ($$strm1) and end ($$fpo) markers."
            );
          }
  
          // Process rows between each startRowNumber and endRowNumber pair
          for (let i = 0; i < startRowNumbers.length; i++) {
            let startRowNumber = startRowNumbers[i];
            let endRowNumber = endRowNumbers[i];
  
            for (
              let rowNumber = startRowNumber + 1;
              rowNumber < endRowNumber;
              rowNumber++
            ) {
              let row = worksheet.getRow(rowNumber);
              row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
                if (!cell.value) {
                  let colLetter = indexToLetter(colNumber - 1);
                  let address = colLetter + rowNumber;
                  row.getCell(colNumber).value = "";
                  row.getCell(colNumber)._address = address;
                }
              });
            }
          }
  
          const lastRowNumber = worksheet2.rowCount;
          const newRowNumber = lastRowNumber + 1;
          const newRow = worksheet2.getRow(newRowNumber);
            worksheet2.mergeCells(newRowNumber, 1, newRowNumber + 1, 14);
            const mergedCell = worksheet2.getCell(newRowNumber, 1);
            mergedCell.value = "Tensile Stress Limits in Prestressed Concrete At Service Limit State after Losses : No tension case    (As per CA-5.9.2.2b-1)";
            mergedCell.font = { bold: true, size: 12 };
            mergedCell.alignment = { vertical: 'middle' };
            newRow.commit();
            setWorkbookData(workbook);
            setSheetName(worksheet.name);
            console.log(workbook);
          for (let key in workbook.worksheets) {
              if (workbook.worksheets[key].name === "Summary") {
                worksheet3 = workbook.worksheets[key];
                setWorksheet3((prevstate) => ({
                  ...prevstate,
                  [key]: workbook.worksheets[key],
                }));
              }
            }
            console.log(worksheet3);
        } catch (error) {
          console.error("Error reading file:", error);
          alert(
            "Error reading file. Please make sure the file is a valid Excel file."
          );
        }
      };
  
      reader.readAsArrayBuffer(file);
    };
    function cot(angleInDegrees) {
        const angleInRadians = angleInDegrees * (Math.PI / 180);
        return 1 / Math.tan(angleInRadians);
    }
    console.log(matchedParts);
    const [ag, setAg] = useState("");
    const [sg, setSg] = useState("");
  
    const handleAgChange = (event) => {
        const value = event.target.value;
        setAg(value);
        if (Number(value) < 0) {
            enqueueSnackbar("Error: Value should always be greater than zero", {
              variant: "error",
              anchorOrigin: {
                vertical: "top",
                horizontal: "center",
              },
              action,
            });
            return;
          }
          if (isNaN(value)) {
            enqueueSnackbar("Error: Please input numeric values only", {
              variant: "error",
              anchorOrigin: {
                vertical: "top",
                horizontal: "center",
              },
              action,
            });
            return;
          }
    };
  
    const handleSgChange = (event) => {
        const value = event.target.value;
        setSg(value);  
       
        if (Number(value) <= 0) {
            enqueueSnackbar("Error: Value should always be greater than zero", {
              variant: "error",
              anchorOrigin: {
                vertical: "top",
                horizontal: "center",
              },
              action,
            });
            return;
          }
          if (isNaN(value)) {
            enqueueSnackbar("Error: Please input numeric values only", {
              variant: "error",
              anchorOrigin: {
                vertical: "top",
                horizontal: "center",
              },
              action,
            });
            return;
          }
      };
    console.log(ag);
    console.log(sg);
    console.log(allMatches);
    async function updatedata(wkey, worksheet) {
      if (!workbookData) return;
      if (!worksheet) {
        throw new Error("No worksheets found in the uploaded file");
      }
      
      let rows = worksheet._rows;
      let mn;
      let mn_neg;
      let phi;
      let mr;
      let mr_neg;
      let dv;
      let dv_min;
      let data = {};
      let Av;
      let Avm;
      let Mmax;
      let Mmin;
      let Ag;
      let St;
      let Sb;
      let Nmax;
      let Nmin;
      let E;
      let fc;
      let Vu1;
      let Vu2;
      let beta1;
      let Vc;
      let Vc_min;
      let Vc1;
      let dc;
      let storedValues = {};
      let pi = null;
      let pi_min = null;
      let s ;
      let s_max;
      let s_min;
      let $$alpha;
      let $$alpha_min;
      let Vp;
      let Vp_min;
      let type;
      let K;
      let a;
      let Vu_max;
      let Vu_min;
      let fy;
      let vu_check;
      let vu_check_min;
      let Mn_i=0;
      let phi_i = 0;
      let Mr_i = 0;
      let M_i = 0;
      let N_i = 0;
      let pi_i = 0;
      let Vp_i = 0;
      let dv_i = 0;
      let Vu1_i = 0;
      let vu_i = 0;
      let sm_i = 0;
      let s_i = 0;
      let Avm_i = 0;
      let Av_i = 0;
      let vc_i = 0;
      let alpha_i = 0;
      let vp_i = 0;
      let Vc_i = 0;
      let a_i = 0;
      let A_i = 0;
      let e_i = 0;
      let sx_i = 0;
      let sxe_i = 0;
      let b_i =  0;
      let theta_i = 0;
      let beta_i = 0;
      let vcvp_i = 0; let vcvp =0;
      let vs_i = 0;
      let t_i = 0;
      let sum_i = 0;
      let vn_i = 0;
      let vr_i = 0;
      let check_i = 0;
      let bv;
      let h;
      let Mcr_i = 0;
      let bs_i = 0;
      let I ;
      let cm;
      let cp;
      let st1_i = 0;
      let chge_i = 0; let dc_i = 0; let d_ci = 0; let V ; let V_min; 
     
      for (let key1 in rows) {
        if (
          rows[key1]._cells[0] != undefined &&
          rows[key1]._cells[0]._value.model.value == "$$type"
        ) {
          let cell2 = getSafeCell(rows[key1], 2);
          if (cell2) {
            let add2 = cell2._address;
            data = { ...data, [add2]: 'CALTRANS' };
          }
          type = "Box";
        
          let cell17 = getSafeCell(rows[key1], 17);
          if (cell17) {
            let add17 = cell17._address;
            let cell17Value = cell17.value !== undefined ? cell17.value : null;
            if (cell17Value === "Composite") {
              type = "Composite";
          }
        }
      }
        console.log(type);
        if (
          rows[key1]._cells[0] != undefined &&
          rows[key1]._cells[0]._value.model.value == "$$H"
        ) {
          h = rows[key1]._cells[27]._value.model.value;
        }
        if (
          rows[key1]._cells[0] != undefined &&
          rows[key1]._cells[0]._value.model.value == "$$d-c"
        ) {
          d_ci = d_ci + 1;
          if (d_ci == 1) {
          dc_old[wkey] = rows[key1]._cells[9].value;
          }
          if (d_ci == 2) {
            dc_old_2[wkey] = rows[key1]._cells[9].value; 
          }
        }
        if (
          rows[key1]._cells[0] != undefined &&
          rows[key1]._cells[0]._value.model.value == "$$vu_n"
        ) {
          vcvp = vcvp + 1;
          if (vcvp == 1) {
          V = rows[key1]._cells[15].value;
          }
          if (vcvp == 2) {
          V_min = rows[key1]._cells[15].value; 
          }
        }
  
        if (
          rows[key1]._cells[0] != undefined &&
          rows[key1]._cells[0]._value.model.value == "$$Mn"
        ) {
          Mn_i = Mn_i + 1;
          if (Mn_i == 1) {
          let location = rows[key1]._cells[19]._value.model.address;
          let value = rows[key1]._cells[19]._value.model.value;
          value = parseFloat(value.toFixed(3));
          data = { ...data, [location]: value };
          mn = value;
          }
          if (Mn_i ==2) {
           let location = rows[key1]._cells[19]._value.model.address;
          let value = rows[key1]._cells[19]._value.model.value;
          value = parseFloat(value.toFixed(3));
          data = { ...data, [location]: value };
          mn_neg = value;
          }
        }
        if (
          rows[key1]._cells[0] != undefined &&
          rows[key1]._cells[0]._value.model.value == "$$Phi"
        ) {
          phi_i = phi_i + 1;
          if (phi_i == 1) {
          let location = rows[key1]._cells[5]._value.model.address;
          if (cast === "inplace") {
            phi_new_m = 0.95;
            data = { ...data, [location]: 0.95 };
            phi = 0.95;
            let equ = rows[key1]._cells[22]._value.model.address;
            let existingValue = rows[key1]._cells[22]._value.model.value;
            // Concatenate the existing value with the new string
            let concatenatedValue = '0.005 ≤εt  ' + '(As per CA- 5.5.4.2)';
            data = { ...data, [equ]: concatenatedValue };
          } else {
            data = { ...data, [location]: 1 };
            phi = 1;
          }
          console.log(phi);
        }
          if (phi_i == 2) {
            let location = rows[key1]._cells[5]._value.model.address;
            if (cast === "inplace") {
              phi_new_n = 0.95;
              data = { ...data, [location]: 0.95 };
              phi = 0.95;
              let equ = rows[key1]._cells[25]._value.model.address;
              data = { ...data, [equ] : '(As per CA- 5.5.4.2)'}
            } else {
              data = { ...data, [location]: 1 };
              phi = 1;
            }
            console.log(phi);
          }
        }
        if (
          rows[key1]._cells[0] != undefined &&
          rows[key1]._cells[0]._value.model.value == "$$bv"
        ) {
          bv = rows[key1]._cells[4]._value.model.value;
        }
        if (
          rows[key1]._cells[0] != undefined &&
          rows[key1]._cells[0]._value.model.value == "$$Mr"
        ) {
          Mr_i = Mr_i + 1;
          if(Mr_i == 1) {
          let location = rows[key1]._cells[5]._value.model.address;
  
          let mu = rows[key1]._cells[17]._value.model.value;
          let value5 = rows[key1]._cells[5]._value.model.value; 
          let check_mr = rows[key1]._cells[29]._value.model.value;
          check_mr_old = check_mr;
          mu_pos[wkey] = mu;
          mr_old_pos[wkey] = rows[key1]._cells[5]._value.model.value;
          mr = value5*phi;
          mr = parseFloat(mr.toFixed(3));
          mr_new_pos[wkey] = mr;
          data = { ...data, [location]: mr };
  
          // location of oK
          if (Math.abs(mr) < Math.abs(Number(mu))) {
            let location1 = rows[key1]._cells[29]._value.model.address;
            let location2 = rows[key1]._cells[13]._value.model.address;
            data = { ...data, [location1]: "NG" };
            data = { ...data, [location2]: "<" };
          }
          else {
              let location1 = rows[key1]._cells[29]._value.model.address;
              let location2 = rows[key1]._cells[13]._value.model.address;
              data = { ...data, [location1]: "OK" };
              data = { ...data, [location2]: "≥" };
          }
         }
         if(Mr_i == 2) {
          let location = rows[key1]._cells[5]._value.model.address;
  
          let mu = rows[key1]._cells[17]._value.model.value;
          let value5 = rows[key1]._cells[5]._value.model.value; 
          mu_neg[wkey] = mu;
          mr_neg = rows[key1]._cells[5]._value.model.value;
          mr_old_neg[wkey] = mr_neg;
          mr_neg = value5*phi;
          mr_neg = parseFloat(mr_neg.toFixed(3));
          mr_new_neg[wkey] = mr_neg;
          data = { ...data, [location]: mr_neg };
  
          // location of oK
          if (Math.abs(mr) < Math.abs(Number(mu))) {
            let location1 = rows[key1]._cells[29]._value.model.address;
            let location2 = rows[key1]._cells[13]._value.model.address;
            data = { ...data, [location1]: "NG" };
            data = { ...data, [location2]: "<" };
          }
          else {
              let location1 = rows[key1]._cells[29]._value.model.address;
              let location2 = rows[key1]._cells[13]._value.model.address;
              data = { ...data, [location1]: "OK" };
              data = { ...data, [location2]: "≥" };
          }
        }
      }
        if (
          getSafeCell(rows[key1], 0) &&
          getSafeCell(rows[key1], 0)._value.model.value === "$$Mcr"
        ) {
          Mcr_i += 1;
        
          let cell5 = getSafeCell(rows[key1], 5);
          let cell13 = getSafeCell(rows[key1], 13);
          let cell29 = getSafeCell(rows[key1], 29);
          let cell21 = getSafeCell(rows[key1], 21);
        
          let add5 = cell5._address;
          let add13 = cell13._address;
          let add29 = cell29._address;
        
          if (Mcr_i === 1) {
            data = { ...data, [add5]: mr_new_pos[wkey]};
        
            if (Math.abs(cell21._value.model.value) < Math.abs(mr_new_pos[wkey])) {
              data = { ...data, [add13]: '≥' };
              data = { ...data, [add29]: 'OK' };
            } else {
              data = { ...data, [add13]: '<' };
              data = { ...data, [add29]: 'NG' };
            }
          }
        
          if (Mcr_i === 2) {
            data = { ...data, [add5]: mr_new_neg[wkey] };
        
            if (Math.abs(cell21._value.model.value) < Math.abs(mr_new_neg[wkey])) {
              data = { ...data, [add13]: '≥' };
              data = { ...data, [add29]: 'OK' };
            } else {
              data = { ...data, [add13]: '<' };
              data = { ...data, [add29]: 'NG' };
            }
          }
        }
        
        if (
          rows[key1]._cells[0] != undefined &&
          rows[key1]._cells[0]._value.model.value == "$$dv"
        ) {
          dv_i = dv_i + 1;
          if (dv_i == 1) {
          dv = rows[key1]._cells[4]._value.model.value;
         }
         if (dv_i == 2) {
            dv_min = rows[key1]._cells[4]._value.model.value;
           }
        }
        if (
          rows[key1]._cells[0] != undefined &&
          rows[key1]._cells[0]._value.model.value == "$$t"
        ) { 
          theta_i = theta_i + 1;
          if( theta_i == 1) {
             theta_mo[wkey] = rows[key1]._cells[13].value;
          }
          if (theta_i == 2) {
            theta_no[wkey]= rows[key1]._cells[13].value ;
          }
        }
  
        if (
          rows[key1]._cells[0] != undefined &&
          rows[key1]._cells[0]._value.model.value == "$$vu"
        ) {
           vu_i = vu_i + 1;
           if (vu_i == 1) {
              vu_check = rows[key1]._cells[11]._value.model.value;
           }
           if (vu_i == 2) {
              vu_check = rows[key1]._cells[11]._value.model.value;
           }
           
        }
        
      if (
        rows[key1]._cells[0] != undefined &&
        rows[key1]._cells[0]._value.model.value == "$$sm"
      ) {
        sm_i = sm_i + 1;
        if (sm_i == 1) {
        sm_old[wkey] = rows[key1]._cells[13]._value.model.value;
        if (sp === "ca1" && vu_check == '<') {         
          let add1 = rows[key1]._cells[6]._value.model.address;
          data = { ...data, [add1]: "Min[0.8dv, 18.0(in.)]" };
          let add2 = rows[key1]._cells[13]._value.model.address;
          // let val=rows[key1]._cells[13]._value.model.value;
          if (0.8 * dv >= 18) {
            data = { ...data, [add2]: 18 };
            sm_new[wkey] = 18;
          } else {
            data = { ...data, [add2]: 0.8 * dv };
            sm_new[wkey] = 0.8 * dv;
          }
          let add27 = rows[key1]._cells[27]._value.model.address;
          data = { ...data,[add27] : '(As per CA-5.7.2.6-1)'}
        }
        
      }
      if (sm_i == 2) {
         sn_old[wkey] = rows[key1]._cells[13]._value.model.value;
          if (sp === "ca1" && vu_check == '<') {    
            let add1 = rows[key1]._cells[6]._value.model.address;
            data = { ...data, [add1]: "Min[0.8dv, 18.0(in.)]" };
            let add2 = rows[key1]._cells[13]._value.model.address;
            // let val=rows[key1]._cells[13]._value.model.value;
            if (0.8 * dv >= 18) {
              data = { ...data, [add2]: 18 };
              sn_new[wkey] = 18;
            } else {
              data = { ...data, [add2]: 0.8 * dv };
              sn_new[wkey] = 0.8 * dv;
            }
            let add27 = rows[key1]._cells[27]._value.model.address;
            data = { ...data,[add27] : '(As per CA-5.7.2.6-1)'}
          }
         
        }
      }
  
      if (
        rows[key1]._cells[0] != undefined &&
        rows[key1]._cells[0]._value.model.value == "$$s"
      ) {
          s_i = s_i + 1;
        if (s_i == 1) {
        s_m[wkey] = rows[key1]._cells[8].value;
        let cell8 = rows[key1]._cells[8];
        s_max = rows[key1]._cells[8].value;
        console.log(s_max);
        }
          if (s_i == 2) {
        s_n[wkey] = rows[key1]._cells[8].value;
        let cell8 = rows[key1]._cells[8];
        s_min = rows[key1]._cells[8].value;
        console.log(s_min);
       }
  
      }
  
       
      if (
        rows[key1]._cells[0] !== undefined &&
        rows[key1]._cells[0]._value.model.value === "$$sx"
      ) {
        // Check if cell 15 exists before assigning its value to K
        if (rows[key1]._cells[15] !== undefined) {
          if (type !== "Composite") {
            K = rows[key1]._cells[15].value;
          }
        }
      }
        if (
          rows[key1]._cells[0] != undefined &&
          rows[key1]._cells[0]._value.model.value == "$$dc"
        ) {
            dc_i = dc_i + 1;
            if (dc_i == 1) {
            smax_old[wkey] = rows[key1]._cells[11].value;
            suse[wkey] = rows[key1]._cells[21].value;
            let val2_new;
           if (cvr === "ca2") {
  
            for (let col = 0; col < rows[key1]._cells.length; col++) {
              if (rows[key1]._cells[col] != undefined) {
                let cellValue = rows[key1]._cells[col]._value.model.value;
                let cellAddress = rows[key1]._cells[col]._value.model.address;
                storedValues[cellAddress] = cellValue;
              }
            }
            let add1 = rows[key1]._cells[8]._value.model.address;
            let add2 = rows[key1]._cells[11]._value.model.address;
            let val2 = rows[key1]._cells[11]._value.model.value;
            let val3 = rows[key1]._cells[21]._value.model.value;
            let add4 = rows[key1]._cells[29]._value.model.address;
            let add5 = rows[key1]._cells[17]._value.model.address;
            let column15Address;
            let column15Value;
            let column15Value_new;
            let column9Address;
            let column9Value;
            let column9Value_new;
  
            // Move to the next row and check for $$B and the next $$dc
            let nextKey1 = parseInt(key1, 10) + 1;
            while (rows[nextKey1]) {
              if (rows[nextKey1]._cells[0] != undefined) {
                if (rows[nextKey1]._cells[0]._value.model.value == "$$B") {
                  // Store the value and address of cell in column 13 for $$B row
                  column15Address = rows[nextKey1]._cells[15]._value.model.address;
                  column15Value = rows[nextKey1]._cells[15]._value.model.value;
                  column15Value_new = (1 + (2.5/(0.7*(h-2.5))));
                  column15Value_new = parseFloat(column15Value_new.toFixed(3));
                  console.log(column15Value_new);
                  storedValues[column15Address] = column15Value;
                  data = { ...data, [column15Address]: column15Value_new };
                }
                if (rows[nextKey1]._cells[0]._value.model.value == "$$d-c") {
                  // Store the value and address of cell in column 9 for $$dc row
                  // dc_old = rows[nextKey1]._cells[11].value;
                  dc_new[wkey] = 2.5;
                  column9Value = rows[nextKey1]._cells[9]._value.model.value;
                  column9Address = rows[nextKey1]._cells[9]._value.model.address;
                  column9Value_new = column9Value - column9Value + 2.5;
                  console.log(column9Value_new);
                  storedValues[column9Address] = column9Value;
                  data = { ...data, [column9Address]: column9Value_new };
                  let add13 = rows[nextKey1]._cells[13]._value.model.address;
                  data = { ...data,[add13] : '(in)                                                                    (As per CA-5.6.7-1)'};
                  break;
                }
              }
              nextKey1++;
            }
            console.log(storedValues);
            val2_new = ((val2 + 3.6) * column15Value) / column15Value_new - 5;
            val2_new = parseFloat(val2_new.toFixed(3));
  
            if (val2_new < 0) {
              val2_new = 0.0;
            }
  
            if (val2_new < val3) {
              data = { ...data, [add4]: "NG" };
              data = { ...data, [add5]: "<" };
            }
  
            data = { ...data, [add1]: "2*2.5" };
            data = { ...data, [add2]: val2_new };
          }
          if (cvr === "ca2") {
            smax_new[wkey] = val2_new;
          }
          else {
            smax_new[wkey] = smax_old[wkey];
          }
        }
        if (dc_i == 2) {
          smax_old_2[wkey] = rows[key1]._cells[11].value;
          suse2[wkey] = rows[key1]._cells[21].value;
          let val2_new;
         if (cvr === "ca2") {

          for (let col = 0; col < rows[key1]._cells.length; col++) {
            if (rows[key1]._cells[col] != undefined) {
              let cellValue = rows[key1]._cells[col]._value.model.value;
              let cellAddress = rows[key1]._cells[col]._value.model.address;
              storedValues[cellAddress] = cellValue;
            }
          }
          let add1 = rows[key1]._cells[8]._value.model.address;
          let add2 = rows[key1]._cells[11]._value.model.address;
          let val2 = rows[key1]._cells[11]._value.model.value;
          let val3 = rows[key1]._cells[21]._value.model.value;
          let add4 = rows[key1]._cells[29]._value.model.address;
          let add5 = rows[key1]._cells[17]._value.model.address;
          let column15Address;
          let column15Value;
          let column15Value_new;
          let column9Address;
          let column9Value;
          let column9Value_new;

          // Move to the next row and check for $$B and the next $$dc
          let nextKey1 = parseInt(key1, 10) + 1;
          while (rows[nextKey1]) {
            if (rows[nextKey1]._cells[0] != undefined) {
              if (rows[nextKey1]._cells[0]._value.model.value == "$$B") {
                // Store the value and address of cell in column 13 for $$B row
                column15Address = rows[nextKey1]._cells[15]._value.model.address;
                column15Value = rows[nextKey1]._cells[15]._value.model.value;
                column15Value_new = (1 + (2.5/(0.7*(h-2.5))));
                column15Value_new = parseFloat(column15Value_new.toFixed(3));
                console.log(column15Value_new);
                storedValues[column15Address] = column15Value;
                data = { ...data, [column15Address]: column15Value_new };
              }
              if (rows[nextKey1]._cells[0]._value.model.value == "$$d-c") {
                // Store the value and address of cell in column 9 for $$dc row
                // dc_old = rows[nextKey1]._cells[11].value;
                dc_new_2[wkey] = 2.5;
                column9Value = rows[nextKey1]._cells[9]._value.model.value;
                column9Address = rows[nextKey1]._cells[9]._value.model.address;
                column9Value_new = column9Value - column9Value + 2.5;
                console.log(column9Value_new);
                storedValues[column9Address] = column9Value;
                data = { ...data, [column9Address]: column9Value_new };
                let add13 = rows[nextKey1]._cells[13]._value.model.address;
                data = { ...data,[add13] : '(in)                                                                    (As per CA-5.6.7-1)'};
                break;
              }
            }
            nextKey1++;
          }
          console.log(storedValues);
          val2_new = ((val2 + 3.6) * column15Value) / column15Value_new - 5;
          val2_new = parseFloat(val2_new.toFixed(3));

          if (val2_new < 0) {
            val2_new = 0.0;
          }

          if (val2_new < val3) {
            data = { ...data, [add4]: "NG" };
            data = { ...data, [add5]: "<" };
          }

          data = { ...data, [add1]: "2*2.5" };
          data = { ...data, [add2]: val2_new };
        }
        if (cvr === "ca2") {
          smax_new_2[wkey] = val2_new;
        }
        else {
          smax_new_2[wkey] = smax_old_2[wkey];
        }
      }
        }
        if (
          rows[key1]._cells[0] != undefined &&
          rows[key1]._cells[0]._value.model.value == "$$a"
        ) {
          let cell8 = rows[key1]._cells[8];
          a = cell8.value;
        }
        // if (
        //   rows[key1]._cells[0] != undefined &&
        //   rows[key1]._cells[0]._value.model.value == "$$a_min"
        // ) {
        //   let cell8 = rows[key1]._cells[8];
        //   a = cell8.value;
        // }
        console.log(a);
        if (
          rows[key1]._cells[0] != undefined &&
          rows[key1]._cells[0]._value.model.value == "$$fy"
        ) {
          if ( type == 'Composite') {
          fy = rows[key1]._cells[6].value;
          }
          else {
            fy = rows[key1]._cells[7].value;
          }
        }
        console.log(fy);
  
        // if (
        //   rows[key1]._cells[0] != undefined &&
        //   rows[key1]._cells[0]._value.model.value == "$$Avm"
        // ) {
        //   if (type == "Composite") {
        //     Avm = rows[key1]._cells[12]._value.model.value;
        //   } else {
        //     Avm = rows[key1]._cells[17]._value.model.value;
        //   }
        // }
        if (
          rows[key1]._cells[0] != undefined &&
          rows[key1]._cells[0]._value.model.value == "$$Av"
        ) {
          Av = rows[key1]._cells[16]._value.model.value;
          Av_f[wkey] = Av;
          s = rows[key1]._cells[20]._value.model.value;
        }
        if (
          rows[key1]._cells[0] != undefined &&
          rows[key1]._cells[0]._value.model.value == "$$M"
        ) {
            M_i = M_i + 1;
            if (M_i == 1) {
          Mmax = rows[key1]._cells[15]._value.model.value;
            }
            if (M_i == 2) {
                Mmin = rows[key1]._cells[15]._value.model.value;
            }
        }
  
        if (
          rows[key1]._cells[0] != undefined &&
          rows[key1]._cells[0]._value.model.value == "$$Ag"
        ) {
          Ag = rows[key1]._cells[27]._value.model.value;
          if (type == 'Box') {
            Ag = rows[key1]._cells[14]._value.model.value;
            h= rows[key1]._cells[4]._value.model.value;
            St = rows[key1]._cells[24]._value.model.value;
          }
        }
        if (
          rows[key1]._cells[0] != undefined &&
          rows[key1]._cells[0]._value.model.value == "$$St"
        ) {
          St = rows[key1]._cells[27]._value.model.value;
        }
        if (
          rows[key1]._cells[0] != undefined &&
          rows[key1]._cells[0]._value.model.value == "$$Sb"
        ) {
          Sb = rows[key1]._cells[27]._value.model.value;
          if(type == 'Box') {
            Sb = rows[key1]._cells[24]._value.model.value;
          }
        }
        if (
          rows[key1]._cells[0] != undefined &&
          rows[key1]._cells[0]._value.model.value == "$$N"
        ) {
          N_i = N_i + 1;
          if ( N_i == 1) {
          Nmax = rows[key1]._cells[15]._value.model.value;
          }
          if ( N_i == 2) {
            Nmin = rows[key1]._cells[15]._value.model.value;
          }
        }
  
        if (
          rows[key1]._cells[0] != undefined &&
          rows[key1]._cells[0]._value.model.value == "$$E"
        ) {
          E = rows[key1]._cells[12]._value.model.value;
          fc = rows[key1]._cells[5]._value.model.value;
          if ( type == 'Box'){
            E = rows[key1]._cells[9]._value.model.value;
            fc = rows[key1]._cells[2]._value.model.value;
          }
        }
        if (
          rows[key1]._cells[0] != undefined &&
          rows[key1]._cells[0]._value.model.value == "$$Vu1"
        ) {
          Vu1_i = Vu1_i + 1;
          if (Vu1_i == 1) {
            if (typeof rows[key1]._cells[14].value === 'string') {
              Vu1 = rows[key1]._cells[10]._value.model.value;
            } else {
              let cell5 = rows[key1]._cells[5];
              let add5 = cell5._address;
              data = { ...data,[add5] : '| Vu - ΦVp |'}
              let key2 = parseInt(key1) + 1;
              let cell51 = rows[key2]._cells[5];
              let add51 = cell51._address;
              data = { ...data, [add51] : 'Φbvdv'}
              let cell8 = rows[key1]._cells[8];
              let add8 = cell8._address;
              data = { ...data,[add8] : " "}
              let cell9 = rows[key1]._cells[9];
              let add9 = cell9._address;
              data = { ...data,[add9] : " "};
              key2 = parseInt(key1) + 1;
              let cell91 = rows[key2]._cells[9];
              let add91 = cell91._address;
              data = { ...data,[add91] : " "};
              let cell13 = rows[key1]._cells[13];
              let add13 = cell13._address;
              let new_vu = Math.abs((V - (pi*Vp)))/(pi*bv*dv);
              new_vu = new_vu.toFixed(5);
              data = { ...data,[add13] : new_vu};
              Vu1 = new_vu;
              let cell27 = rows[key2]._cells[27];
              let add27 = cell27._address;
              data = { ...data,[add27] : '(Eq. 5.7.2.8-1)'};
            }
        }
        if (Vu1_i == 2) {
          if (typeof rows[key1]._cells[14].value === 'string') {
                Vu2 = rows[key1]._cells[10]._value;
              } else {
                let cell5 = rows[key1]._cells[5];
              let add5 = cell5._address;
              data = { ...data,[add5] : '| Vu - ΦVp |'}
              let key2 = parseInt(key1) + 1;
              let cell51 = rows[key2]._cells[5];
              let add51 = cell51._address;
              data = { ...data, [add51] : 'Φbvdv'}
              let cell8 = rows[key1]._cells[8];
              let add8 = cell8._address;
              data = { ...data,[add8] : " "}
              let cell9 = rows[key1]._cells[9];
              let add9 = cell9._address;
              data = { ...data,[add9] : " "}
              key2 = parseInt(key1) + 1;
              let cell91 = rows[key2]._cells[9];
              let add91 = cell91._address;
              data = { ...data,[add91] : " "};
              let cell13 = rows[key1]._cells[13];
              let add13 = cell13._address;
              let new_vu = Math.abs((V_min - (pi_min*Vp_min)))/(pi_min*bv*dv_min);
              new_vu = new_vu.toFixed(5);
              data = { ...data,[add13] : new_vu};
              Vu2 = new_vu;
              let cell27 = rows[key2]._cells[27];
              let add27 = cell27._address;
              data = { ...data,[add27] : '(Eq. 5.7.2.8-1)'};
              }
        }
        }
        if (
          rows[key1]._cells[0] != undefined &&
          rows[key1]._cells[0]._value.model.value == "$$Vc"
        ) {
          Vc = rows[key1]._cells[9]._value.model.value;
          
        }
        if (
          rows[key1]._cells[0] != undefined &&
          rows[key1]._cells[0]._value.model.value == "$$Iy"
        ) {
          I = rows[key1]._cells[27]._value.model.value;
        }
        if (
          rows[key1]._cells[0] != undefined &&
          rows[key1]._cells[0]._value.model.value == "$$Cps"
        ) {
          cp = rows[key1]._cells[27]._value.model.value;
        }
        if (
          rows[key1]._cells[0] != undefined &&
          rows[key1]._cells[0]._value.model.value == "$$Cms"
        ) {
          cm = rows[key1]._cells[27]._value.model.value;
        }
        
        if (
          rows[key1]._cells[0] != undefined &&
          rows[key1]._cells[0]._value.model.value == "$$alpha"
        ) {
          alpha_i = alpha_i + 1;
          if (alpha_i == 1){
          let cell8 = rows[key1]._cells[8];
          $$alpha = rows[key1]._cells[8].value;
          }
          if (alpha_i == 2) {
            let cell8 = rows[key1]._cells[8];
            $$alpha_min = rows[key1]._cells[8].value;
  
          }
        }
       
        if (
          rows[key1]._cells[0] != undefined &&
          rows[key1]._cells[0]._value.model.value == "$$Vp"
        ) {
          vp_i = vp_i + 1;
          if (vp_i == 1) {
          let cell19 = rows[key1]._cells[19];
          Vp = rows[key1]._cells[19].value;
          }
          if(vp_i == 2) {
            let cell19 = rows[key1]._cells[19];
            Vp_min = rows[key1]._cells[19].value;
          }
        }
        if (
          rows[key1]._cells[0] != undefined &&
          rows[key1]._cells[0]._value.model.value == "$$pi"
        ) {
          pi_i = pi_i + 1;
          if (pi_i == 1){
          pi = rows[key1]._cells[15].value;
          }
          if (pi_i == 2){
            pi_min = rows[key1]._cells[15].value;
          }
        }
  
      }
      console.log(Ag);
      console.log(Sb);
      console.log(St);
      console.log(E);
      console.log(fc);
      // console.log(Avm);
      console.log(Av);
      console.log(Mmax);
      console.log(Mmin);
      console.log(Nmax);
      console.log(Nmin);
      console.log(Vu1);
      console.log(Vu2);
      console.log(Vc);
      console.log($$alpha);
      console.log(Vp);
      let Ecm;
      let Etm;
      let Ecn;
      let Etn;
      if ( type == 'Box') {
      Ecm =((-1 * Number(Mmax)) / Number(St) + Number(Nmax) / Number(Ag)) /
        Number(E);
      Ecn =((-1 * Number(Mmin)) / Number(St) + Number(Nmin) / Number(Ag)) /
        Number(E);
      Etm =((1 * Number(Mmax)) / Number(Sb) + Number(Nmax) / Number(Ag)) /
        Number(E);
      Etn =((1 * Number(Mmin)) / Number(Sb) + Number(Nmin) / Number(Ag)) /
        Number(E);
      }
      else {
        Ecm = ((-1 * Number(Mmax) * Number(cp)) / Number(I) + Number(Nmax) / Number(Ag)) /
        Number(E);
      Ecn =((-1 * Number(Mmin) * Number(cp)) / Number(I) + Number(Nmin) / Number(Ag)) /
        Number(E);
      Etm =((1 * Number(Mmax) * Number(cm)) / Number(I) + Number(Nmax) / Number(Ag)) /
        Number(E);
      Etn =((1 * Number(Mmin) * Number(cm) ) / Number(I) + Number(Nmin) / Number(Ag)) /
        Number(E);
      }
      // console.log(Vu1,Vu2,fc)
      let a1 = Number(Vu1) / Number(fc);
      let a2 = Number(Vu2) / Number(fc);
      let Exm = (Ecm + Etm) / 2;
      let Exn = (Ecn + Etn) / 2;
      // console.log(a1,a2, Exm * 1000, Exn * 1000)
      let value1 = ThetaBeta1(Exm * 1000,a1);
      let value2 = ThetaBeta1(Exn * 1000,a2);
      // console.log(value1,value2);
      let theta1 = value1[0];
      let theta2 = value2[0];
      beta1 = value1[1];
      let beta2 = value2[1];
      Vc1 = Vc / beta1;
      Avm = (0.0316 * Math.sqrt(fc) * s * bv) / fy;
      console.log(Avm);
      console.log(theta1, theta2, beta1, beta2);
      let startBlanking = false;
      let beta;
      let beta_min;
      let half_finalResult;
      let finalResult;
      let Vn;
      let Vn_min;
      let Vs;
      let Vs_min;
      let theta_new;
      let theta_new_min;
      let beta_new;
      let beta_new_min; let teta =0; let teta_i =0;
      theta_i = 0;
      function indexToLetter(index) {
        let letter = "";
        while (index >= 0) {
          letter = String.fromCharCode((index % 26) + 65) + letter;
          index = Math.floor(index / 26) - 1;
        }
        return letter;
      }
      let initialValue13 = null;
      let newValue13 = null;
  
      let strm1_i =0;
      let strm_i = 0;
      let fpo_i = 0;
      function getSafeCell(row, index) {
        try {
          if (row && row._cells && row._cells[index] && row._cells[index]._value && row._cells[index]._value.model) {
            return row._cells[index];
          }
        } catch (error) {
          console.error(`Error accessing cell at index ${index}:`, error);
        }
        return null;
      }
      
      // Processing rows
      for (let key1 in rows) {
        let row = rows[key1];
      
        if (getSafeCell(row, 0) && getSafeCell(row, 0)._value.model.value === "Design Condition") {
          let add1 = getSafeCell(row, 0)._value.model.address;
          data = { ...data, [add1]: 'Design Condition for Caltrans Amendment As per AASHTO LRFD Bridge Design' };
        }
        if (
          rows[key1]._cells[0] != undefined &&
          rows[key1]._cells[0]._value.model.value == "$$Amin"
        ) { 
           let cell17 = rows[key1]._cells[17];
           let add17 = cell17._address;
           data = { ...data,[add17] : parseFloat(Avm.toFixed(3))};
           let cell5 = rows[key1]._cells[5];
           let add5 = cell5._address;
           data = { ...data,[add5] : '0.0316'}
           let cell7 = rows[key1]._cells[7];
           let add7 = cell7._address;
           data = { ...data,[add7] : "√f'c"};
           let cell9 = rows[key1]._cells[9];
           let add9 = cell9._address;
           data = { ...data,[add9] : 'x'};
           let cell10 = rows[key1]._cells[10];
           let add10 = cell10._address;
           data = { ...data,[add10] : "bvs"};
           let cell12 = rows[key1]._cells[12];
           let add12 = cell12._address;
           data = { ...data,[add12] : "/"};
           let cell13 = rows[key1]._cells[13];
           let add13 = cell13._address;
           data = { ...data,[add13] : "fy"}
        }
        if (
          rows[key1]._cells[0] != undefined &&
          rows[key1]._cells[0]._value.model.value == "$$Avmin"
        ) {    
           let cell11 = rows[key1]._cells[11];
           let addd11 = cell11._address;
           if (Av >= Avm) {
            data = { ...data, [addd11]: '≥' };
        } else {
            data = { ...data, [addd11]: '<' };
        }
        }
      
        worksheet.eachRow((row, rowNumber) => {
            if (getSafeCell(row, 0) && getSafeCell(row, 0)._value.model.value === "$$strm") {
              strm_i += 1;
              let add1, add2, add12;
          
              // Unmerge cells in the current row if they are merged
              for (let col = 1; col <= 8; col++) {
                let cell = row.getCell(col);
                if (cell.isMerged) {
                  worksheet.unMergeCells(cell.address);
                }
              }
          
              // Merge cells from A to H in the current row
              worksheet.mergeCells(`B${rowNumber}:U${rowNumber}`);
          
              const mergedCell = row.getCell(2);
              const mergedCellValue =
                " 4) Calculation for β and θ                               (As per CA - 5.7.3.4)";
              mergedCell.value = mergedCellValue;
              data = { ...data, [`B${rowNumber}`]: mergedCellValue };
  
              if (strm_i === 1) {
                add1 = getSafeCell(row, 2)._value.model.address;
                add2 = getSafeCell(row, 8)._value.model.address;
                data = { ...data, [add1]: mergedCellValue };
                data = { ...data, [add2]: "" };
              }
          
              if (strm_i === 2) {
                add1 = getSafeCell(row, 2)._value.model.address;
                add2 = getSafeCell(row, 8)._value.model.address;
                data = { ...data, [add1]: mergedCellValue };
                data = { ...data, [add2]: "" };
              }
            }
          });
        if (getSafeCell(row, 0) && getSafeCell(row, 0)._value.model.value === "$$strm1") {
          strm1_i += 1;
        //   if (strm1_i == 1) {
        //   for (let i = 1; i <= 50; i++) {
        //     let cell = getSafeCell(row, i);
        //     if (cell) {
        //       cell._value.model = { value: " " };
        //       cell.style = { font: { underline: false } };
        //     } else {
        //       row._cells[i] = {
        //         _value: {
        //           model: {
        //             value: "dummy",
        //             address: indexToLetter(i) + (parseInt(key1) + 1),
        //           },
        //         },
        //         _address: indexToLetter(i) + (parseInt(key1) + 1),
        //         style: { font: { underline: false } },
        //       };
        //     }
        //   }
    
        //   let nextKey = parseInt(key1) + 1;
        //   while (rows[nextKey] && getSafeCell(rows[nextKey], 0) && getSafeCell(rows[nextKey], 0)._value.model.value !== "$$theta_max") {
        //     for (let i = 1; i <= 50; i++) {
        //       let cell = getSafeCell(rows[nextKey], i);
        //       if (cell) {
        //         cell._value.model = { value: " " };
        //         cell.style = { font: { underline: false } };
        //       } else {
        //         rows[nextKey]._cells[i] = {
        //           _value: {
        //             model: {
        //               value: "dummy",
        //               address: indexToLetter(i) + (nextKey + 1),
        //             },
        //           },
        //           _address: indexToLetter(i) + (nextKey + 1),
        //           style: { font: { underline: false } },

        //         };
        //       }
        //     }
        //     nextKey++;
        //   }
        // }
        if (strm1_i == 1) {
          for (let i = 1; i <= 50; i++) {
            let cell = getSafeCell(row, i);
            if (cell) {
              cell._value.model = { value: " " };
              cell.style = { font: { underline: false } };
            } else {
              row._cells[i] = {
                _value: {
                  model: {
                    value: "dummy",
                    address: indexToLetter(i) + (parseInt(key1) + 1),
                  },
                },
                _address: indexToLetter(i) + (parseInt(key1) + 1),
                style: { font: { underline: false } },
              };
            }
          }
      
          let nextKey = parseInt(key1) + 1;
          while (rows[nextKey] && getSafeCell(rows[nextKey], 0) && getSafeCell(rows[nextKey], 0)._value.model.value !== "$$theta_max") {
            for (let i = 1; i <= 50; i++) {
              let cell = getSafeCell(rows[nextKey], i);
              if (cell) {
                cell._value.model = { value: " " };
                cell.style = { font: { underline: false } };
              } else {
                rows[nextKey]._cells[i] = {
                  _value: {
                    model: {
                      value: "dummy",
                      address: indexToLetter(i) + (nextKey + 1),
                    },
                  },
                  _address: indexToLetter(i) + (nextKey + 1),
                  style: { font: { underline: false } },
                };
              }
            }
            nextKey++;
          }
      
          // Process the row containing $$theta_max
          if (rows[nextKey] && getSafeCell(rows[nextKey], 0) && getSafeCell(rows[nextKey], 0)._value.model.value === "$$theta_max") {
            for (let i = 1; i <= 50; i++) {
              let cell = getSafeCell(rows[nextKey], i);
              if (cell) {
                cell._value.model = { value: " " };
                cell.style = { font: { underline: false } };
              } else {
                rows[nextKey]._cells[i] = {
                  _value: {
                    model: {
                      value: "dummy",
                      address: indexToLetter(i) + (nextKey + 1),
                    },
                  },
                  _address: indexToLetter(i) + (nextKey + 1),
                  style: { font: { underline: false } },
                };
              }
            }
            nextKey++;
          }
      
          // Process one extra row after the $$theta_max row
          if (rows[nextKey]) {
            for (let i = 1; i <= 50; i++) {
              let cell = getSafeCell(rows[nextKey], i);
              if (cell) {
                cell._value.model = { value: " " };
                cell.style = { font: { underline: false } };
              } else {
                rows[nextKey]._cells[i] = {
                  _value: {
                    model: {
                      value: "dummy",
                      address: indexToLetter(i) + (nextKey + 1),
                    },
                  },
                  _address: indexToLetter(i) + (nextKey + 1),
                  style: { font: { underline: false } },
                };
              }
            }
          }
        }

      
        if (strm1_i === 2) {
          for (let i = 1; i <= 50; i++) {
            let cell = getSafeCell(row, i);
            if (cell) {
              cell._value.model = { value: " " };
              cell.style = { font: { underline: false } };
            } else {
              row._cells[i] = {
                _value: {
                  model: {
                    value: "dummy",
                    address: indexToLetter(i) + (parseInt(key1) + 1),
                  },
                },
                _address: indexToLetter(i) + (parseInt(key1) + 1),
                style: { font: { underline: false } },
              };
            }
          }
      
          let nextKey = parseInt(key1) + 1;
          while (rows[nextKey] && getSafeCell(rows[nextKey], 0) && getSafeCell(rows[nextKey], 0)._value.model.value !== "$$theta_max") {
            for (let i = 1; i <= 50; i++) {
              let cell = getSafeCell(rows[nextKey], i);
              if (cell) {
                cell._value.model = { value: " " };
                cell.style = { font: { underline: false } };
              } else {
                rows[nextKey]._cells[i] = {
                  _value: {
                    model: {
                      value: "dummy",
                      address: indexToLetter(i) + (nextKey + 1),
                    },
                  },
                  _address: indexToLetter(i) + (nextKey + 1),
                  style: { font: { underline: false } },
                };
              }
            }
            nextKey++;
          }
      
          // Process the row containing $$theta_max
          if (rows[nextKey] && getSafeCell(rows[nextKey], 0) && getSafeCell(rows[nextKey], 0)._value.model.value === "$$theta_max") {
            for (let i = 1; i <= 50; i++) {
              let cell = getSafeCell(rows[nextKey], i);
              if (cell) {
                cell._value.model = { value: " " };
                cell.style = { font: { underline: false } };
              } else {
                rows[nextKey]._cells[i] = {
                  _value: {
                    model: {
                      value: "dummy",
                      address: indexToLetter(i) + (nextKey + 1),
                    },
                  },
                  _address: indexToLetter(i) + (nextKey + 1),
                  style: { font: { underline: false } },
                };
              }
            }
            nextKey++;
          }
      
          // Process one extra row after the $$theta_max row
          if (rows[nextKey]) {
            for (let i = 1; i <= 50; i++) {
              let cell = getSafeCell(rows[nextKey], i);
              if (cell) {
                cell._value.model = { value: " " };
                cell.style = { font: { underline: false } };
              } else {
                rows[nextKey]._cells[i] = {
                  _value: {
                    model: {
                      value: "dummy",
                      address: indexToLetter(i) + (nextKey + 1),
                    },
                  },
                  _address: indexToLetter(i) + (nextKey + 1),
                  style: { font: { underline: false } },
                };
              }
            }
          }
        }
        }
  
        if (getSafeCell(rows[key1], 0) && getSafeCell(rows[key1], 0)._value.model.value === "$$A") {
          A_i = A_i + 1;
          const cellsToClear = Array.from({ length: 50 }, (_, i) => i + 1);

          // Clear the cell values
          cellsToClear.forEach((col) => {
            let cell = getSafeCell(rows[key1], col);
            if (cell) {
              cell.value = ""; // Clear the cell value
              cell.font = { ...cell.font, underline: 'none' };
            } else {
              console.error(
                `Error: Unable to determine address for rows[key1]._cells[${col}]`
              );
            }
          });

          if (A_i == 1) {
            console.log(rows[key1]._cells);

            let cell = getSafeCell(rows[key1], 4);
            if (cell) {
              data = { ...data, [cell._address]: "Aᵥ" };
            } else {
              console.error(
                "Error: Unable to determine address for rows[key1]._cells[4]"
              );
            }
            // worksheet.mergeCells(`G${key1}:H${key1}`);
            let cell2 = getSafeCell(rows[key1], 6);
            if (cell2) {
              const cellAddress = cell2._address;
              const rowNumber = parseInt(cellAddress.replace(/\D/g, ''), 10); // Extract the row number from the address
            
              // Unmerge cells G and H for the specific row if they are already merged
              try {
                worksheet.unMergeCells(`G${rowNumber}:H${rowNumber}`);
              } catch (error) {
                console.log(`Cells G${rowNumber}:H${rowNumber} were not merged.`);
              }
            
              // Merge cells G and H for the specific row
              worksheet.mergeCells(`G${rowNumber}:H${rowNumber}`);
            
              // Add "Aₘᵢₙ" to the merged cell G and set the alignment to center
              let mergedCell = worksheet.getCell(`G${rowNumber}`);
              mergedCell.value = "Aₘᵢₙ";
              mergedCell.alignment = { vertical: 'middle', horizontal: 'center' };
            
              data = { ...data, [`G${rowNumber}`]: "Aₘᵢₙ" };
            } else {
              console.error(
                "Error: Unable to determine address for rows[key1]._cells[6]"
              );
            }
            

            let cell3 = getSafeCell(rows[key1], 5);
            if (cell3) {
              let comparisonSymbol = Av >= Avm ? "≥" : "<";
              data = { ...data, [cell3._address]: comparisonSymbol };
            } else {
              console.error(
                "Error: Unable to determine address for rows[key1]._cells[5]"
              );
            }
            
          }
          if (A_i == 2) {
            console.log(rows[key1]._cells);

            let cell = getSafeCell(rows[key1], 4);
            if (cell) {
              data = { ...data, [cell._address]: "Aᵥ" };
            } else {
              console.error(
                "Error: Unable to determine address for rows[key1]._cells[4]"
              );
            }

            let cell2 = getSafeCell(rows[key1], 6);
            if (cell2) {
              const cellAddress = cell2._address;
              const rowNumber = parseInt(cellAddress.replace(/\D/g, ''), 10); // Extract the row number from the address
            
              // Unmerge cells G and H for the specific row if they are already merged
              try {
                worksheet.unMergeCells(`G${rowNumber}:H${rowNumber}`);
              } catch (error) {
                console.log(`Cells G${rowNumber}:H${rowNumber} were not merged.`);
              }
            
              // Merge cells G and H for the specific row
              worksheet.mergeCells(`G${rowNumber}:H${rowNumber}`);
            
              // Add "Aₘᵢₙ" to the merged cell G and set the alignment to center
              let mergedCell = worksheet.getCell(`G${rowNumber}`);
              mergedCell.value = "Aₘᵢₙ";
              mergedCell.alignment = { vertical: 'middle', horizontal: 'center' };
            
              data = { ...data, [`G${rowNumber}`]: "Aₘᵢₙ" };
            } else {
              console.error(
                "Error: Unable to determine address for rows[key1]._cells[6]"
              );
            }
            

            let cell3 = getSafeCell(rows[key1], 5);
            if (cell3) {
              let comparisonSymbol = Av >= Avm ? "≥" : "<";
              data = { ...data, [cell3._address]: comparisonSymbol };
            } else {
              console.error(
                "Error: Unable to determine address for rows[key1]._cells[5]"
              );
            }
          }
        }
      
       
        if (getSafeCell(row, 0) && getSafeCell(row, 0)._value.model.value === "$$e") {
          e_i = e_i + 1;
          if (e_i == 1){
          let cell = getSafeCell(row, 4);
          if (cell) {
            data = { ...data, [cell._address]: "εₓ" };
          }
          let cell2 = getSafeCell(row, 5);
          if (cell2) {
            data = { ...data, [cell2._address]: "=" };
          }
          let cell3 = getSafeCell(row, 6);
          if (cell3) {
            let cell3Value = Av >= Avm ? Exm : Etm;
            data = { ...data, [cell3._address]: cell3Value.toFixed(6) };
          }
        }
        if (e_i == 2){
          console.log(rows[key1]._cells);
  
          let cell = getSafeCell(rows[key1], 4);
          if (cell) {
            data = { ...data, [cell._address]: "εₓ" };
          } else {
            console.error("Error: Unable to determine address for rows[key1]._cells[4]");
          }
  
          let cell2 = getSafeCell(rows[key1], 5);
          if (cell2) {
            data = { ...data, [cell2._address]: "=" };
          } else {
            console.error("Error: Unable to determine address for rows[key1]._cells[5]");
          }
  
          let cell3 = getSafeCell(rows[key1], 6);
          if (cell3) {
            let cell3Value = Av >= Avm ? Exn : Etn;
            data = { ...data, [cell3._address]: cell3Value.toFixed(6) };
          }
        }
        }
        if (getSafeCell(rows[key1], 0) && getSafeCell(rows[key1], 0)._value.model.value === "$$sx") {
          sx_i = sx_i + 1;
          if (sx_i === 1) {
            rows[key1]._cells = rows[key1]._cells.map((cell) =>
              cell === "" ? undefined : cell
            );
            console.log(rows[key1]._cells);
        
            let cell = getSafeCell(rows[key1], 4);
            if (cell) {
              data = { ...data, [cell._address]: "sₓ" };
            } else {
              console.error("Error: Unable to determine address for rows[key1]._cells[4]");
            }
        
            let cell2 = getSafeCell(rows[key1], 5);
            if (cell2) {
              data = { ...data, [cell2._address]: "=" };
            } else {
              console.error("Error: Unable to determine address for rows[key1]._cells[5]");
            }
        
            let startCol = 7;
            let endCol = 22;
            let rowNumber = getSafeCell(rows[key1], startCol).row;
            try {
              let mergeRange = worksheet.getCell(
                `${worksheet.getColumn(startCol).letter}${rowNumber}:${worksheet.getColumn(endCol).letter}${rowNumber}`
              );
              if (!mergeRange.isMerged) {
                worksheet.mergeCells(rowNumber, startCol, rowNumber, endCol);
              }
            } catch (error) {
              console.error("Error merging cells: ", error);
            }
        
            let cell3 = worksheet.getCell(rowNumber, startCol);
            if (cell3) {
              let add13 = cell3._address;
              let add15value = dv < sg ? dv : sg;
              if (Av < Avm) {
                data = {
                  ...data,
                  [add13]: `Min| dv, maximum distance between the longitudinal r/f |  = ${add15value} `,
                };
        
                // let cell4 = getSafeCell(rows[key1], 23);
                // if (cell4) {
                //   data = { ...data, [cell4._address]: "=" };
                // } else {
                //   console.error("Error: Unable to determine address for rows[key1]._cells[18]");
                // }
        
                // let cell5 = getSafeCell(rows[key1], 24);
                // if (cell5) {
                //   let add15 = cell5._address;
                //   let add15value = dv < sg ? dv : sg;
                //   data = { ...data, [add15]: add15value };
                // } else {
                //   console.error("Error: Unable to determine address for rows[key1]._cells[19]");
                // }
              } else {
                data = { ...data, [add13]: `Not Required` };
              }
            } else {
              console.error("Error: Unable to determine address for rows[key1]._cells[7]");
            }
          }
        
          if (sx_i === 2) {
            rows[key1]._cells = rows[key1]._cells.map((cell) =>
              cell === "" ? undefined : cell
            );
            console.log(rows[key1]._cells);
        
            let cell = getSafeCell(rows[key1], 4);
            if (cell) {
              data = { ...data, [cell._address]: "sₓ" };
            } else {
              console.error("Error: Unable to determine address for rows[key1]._cells[4]");
            }
        
            let cell2 = getSafeCell(rows[key1], 5);
            if (cell2) {
              data = { ...data, [cell2._address]: "=" };
            } else {
              console.error("Error: Unable to determine address for rows[key1]._cells[5]");
            }
        
            let startCol = 7;
            let endCol = 22;
            let rowNumber = getSafeCell(rows[key1], startCol).row;
            try {
              let mergeRange = worksheet.getCell(
                `${worksheet.getColumn(startCol).letter}${rowNumber}:${worksheet.getColumn(endCol).letter}${rowNumber}`
              );
              if (!mergeRange.isMerged) {
                worksheet.mergeCells(rowNumber, startCol, rowNumber, endCol);
              }
            } catch (error) {
              console.error("Error merging cells: ", error);
            }
        
            let cell3 = worksheet.getCell(rowNumber, startCol);
            if (cell3) {
              let add13 = cell3._address;
              let add15value = dv < sg ? dv : sg;
              if (Av < Avm) {
                data = {
                  ...data,
                  [add13]: `Min| dv, maximum distance between the longitudinal r/f |  = ${add15value} `,
                };

        
                // let cell4 = getSafeCell(rows[key1], 23);
                // if (cell4) {
                //   data = { ...data, [cell4._address]: "=" };
                // } else {
                //   console.error("Error: Unable to determine address for rows[key1]._cells[18]");
                // }
        
                // let cell5 = getSafeCell(rows[key1], 24);
                // if (cell5) {
                //   let add15 = cell5._address;
                //   let add15value = dv < sg ? dv : sg;
                //   data = { ...data, [add15]: add15value };
                // } else {
                //   console.error("Error: Unable to determine address for rows[key1]._cells[19]");
                // }
              } else {
                data = { ...data, [add13]: `Not Required` };
              }
            } else {
              console.error("Error: Unable to determine address for rows[key1]._cells[7]");
            }
          }
        }  
        if (getSafeCell(rows[key1], 0) && getSafeCell(rows[key1], 0)._value.model.value === "$$sxe") {
          sxe_i = sxe_i + 1;
          for (let col = 2; col <= 19; col++) {
            let cell = getSafeCell(rows[key1], col);
            if (!cell || cell._value.model.value === undefined) {
                let address = worksheet.getCell(cell ? cell._address : `${worksheet.getColumn(col).letter}${rows[key1]._number}`)._address;
                data = { ...data, [address]: "" };  // Define the cell with a default value
            }
        }
          let cell5 = getSafeCell(rows[key1], 19);
          if (cell5) {
            let add15 = cell5._address;
            let add15value = dv < sg ? dv : sg;
            // data = { ...data, [add15]: add15value };
            sxe[wkey] = (add15value * 1.38) / (ag + 0.63); 
          } else {
            console.error("Error: Unable to determine address for rows[key1]._cells[19]");
          }
          if (sxe_i === 1) {
            if (wkey == lastWkey) {
            let cell3 = getSafeCell(rows[key1], 4);
            if (cell3) {
              data = { ...data, [cell3._address]: "sₓₑ" };
            }
        
            let cell4 = getSafeCell(rows[key1], 5);
            if (cell4) {
              data = { ...data, [cell4._address]: "=" };
            }
        
            let mergeStartCol = 7;
            let mergeEndCol = 16;
            let mergeRowNumber = getSafeCell(rows[key1], mergeStartCol).row;
            try {
              let mergeRange = worksheet.getCell(
                `${worksheet.getColumn(mergeStartCol).letter}${mergeRowNumber}:${worksheet.getColumn(mergeEndCol).letter}${mergeRowNumber}`
              );
              if (!mergeRange.isMerged) {
                worksheet.mergeCells(mergeRowNumber, mergeStartCol, mergeRowNumber, mergeEndCol);
              }
            } catch (error) {
              console.error("Error merging cells: ", error);
            }
        
            let cell5 = worksheet.getCell(mergeRowNumber, mergeStartCol);
            if (cell5) {
              let add15 = cell5._address;
              if (Av < Avm) {
                data = { ...data, [add15]: sxe[wkey] };
              } else {
                data = { ...data, [add15]: "Not required" };
              }
            } else {
              console.error("Error: Unable to determine address for rows[key1]._cells[7]");
            }


            } else {
               let cell7 = rows[key1]._cells[6];
              let add7 = cell7._address;
             if (Av < Avm) {
                data = { ...data, [add7]: `sₓₑ  =  ${sxe[wkey]}` };
              } else {
                data = { ...data, [add7]: "sₓₑ =  Not Required" };
              }
          }
          }
        
          if (sxe_i === 2) {
            if (wkey == lastWkey) {
            let cell3 = getSafeCell(rows[key1], 4);
            if (cell3) {
              data = { ...data, [cell3._address]: "sₓₑ" };
            }
        
            let cell4 = getSafeCell(rows[key1], 5);
            if (cell4) {
              data = { ...data, [cell4._address]: "=" };
            }
        
            let mergeStartCol = 7;
            let mergeEndCol = 16;
            let mergeRowNumber = getSafeCell(rows[key1], mergeStartCol).row;
            try {
              let mergeRange = worksheet.getCell(
                `${worksheet.getColumn(mergeStartCol).letter}${mergeRowNumber}:${worksheet.getColumn(mergeEndCol).letter}${mergeRowNumber}`
              );
              if (!mergeRange.isMerged) {
                worksheet.mergeCells(mergeRowNumber, mergeStartCol, mergeRowNumber, mergeEndCol);
              }
            } catch (error) {
              console.error("Error merging cells: ", error);
            }
        
            let cell5 = worksheet.getCell(mergeRowNumber, mergeStartCol);
            if (cell5) {
              let add15 = cell5._address;
              if (Av < Avm) {
                data = { ...data, [add15]: sxe[wkey] };
              } else {
                data = { ...data, [add15]: "Not Required" };
              }
            } else {
              console.error("Error: Unable to determine address for rows[key1]._cells[7]");
            }
          }
          else {
            let cell7 = rows[key1]._cells[6];
                let add7 = cell7._address;
               if (Av < Avm) {
                  data = { ...data, [add7]: `sxe  =  ${sxe[wkey]}` };
                } else {
                  data = { ...data, [add7]: "sxe =  Not Required" };
                }
          }
        } 
        }
        
        if (getSafeCell(rows[key1], 0) && getSafeCell(rows[key1], 0)._value.model.value === "$$b") {
          b_i = b_i + 1;
          if (b_i === 1) {
            if (wkey == lastWkey) {
            let cell5 = getSafeCell(rows[key1], 4);
            if (cell5) {
              data = { ...data, [cell5._address]: "β" };
            } else {
              console.error("Error: Unable to determine address for rows[key1]._cells[4]");
            }
          }
          else {
            let cell7 = getSafeCell(rows[key1], 7);
            if (cell7) {
              data = { ...data, [cell7._address]: "β" };
            } else {
              console.error("Error: Unable to determine address for rows[key1]._cells[4]");
            }
          }
          if (wkey == lastWkey) {
            let cell6 = getSafeCell(rows[key1], 5);
            if (cell6) {
              data = { ...data, [cell6._address]: "=" };
            } else {
              console.error("Error: Unable to determine address for rows[key1]._cells[5]");
            }
          } else {
            let cell8 = getSafeCell(rows[key1], 8);
            if (cell8) {
              data = { ...data, [cell8._address]: "=" };
            } else {
              console.error("Error: Unable to determine address for rows[key1]._cells[5]");
            }
          }
          if (wkey == lastWkey) {
            let cell7 = getSafeCell(rows[key1], 6);
            if (cell7) {
              if (Av < Avm) {
                let b_value = ThetaBeta2(Etm * 1000,sxe[wkey]);
                let beta = b_value[1];
                console.log(beta);
                data = { ...data, [cell7._address]: parseFloat(beta.toFixed(2)) };
                beta_new = beta;
                beta_m[wkey] = beta_new;
              } else {
                data = { ...data, [cell7._address]: parseFloat(beta1.toFixed(2)) };
                beta_new = parseFloat(beta1.toFixed(2));
                beta_m[wkey] = beta_new;
              }
            } else {
              console.error("Error: Unable to determine address for rows[key1]._cells[6]");
            }
          } else {
            let cell10 = getSafeCell(rows[key1], 9);
            if (cell10) {
              if (Av < Avm) {
                let b_value = ThetaBeta2(Etm * 1000,sxe[wkey]);
                let beta = b_value[1];
                console.log(beta);
                data = { ...data, [cell10._address]: parseFloat(beta.toFixed(2)) };
                beta_new = beta;
                beta_m[wkey] = beta_new;
              } else {
                data = { ...data, [cell10._address]: parseFloat(beta1.toFixed(2)) };
                beta_new = parseFloat(beta1.toFixed(2));
                beta_m[wkey] = beta_new;
              }
            } else {
              console.error("Error: Unable to determine address for rows[key1]._cells[10]");
            }
          }
            let cell11 = getSafeCell(rows[key1], 11);
            if (cell11) {
              data = { ...data, [cell11._address]: "θ" };
            } else {
              console.error("Error: Unable to determine address for rows[key1]._cells[4]");
            }
        
            let cell12 = getSafeCell(rows[key1], 12);
            if (cell12) {
              data = { ...data, [cell12._address]: "=" };
            } else {
              console.error("Error: Unable to determine address for rows[key1]._cells[5]");
            }
            let cell13 = getSafeCell(rows[key1], 13);
                  if (cell13) {
                    if (Av < Avm) {
                      let theta_value = ThetaBeta2(Etn * 1000,sxe[wkey]);
                      let theta = parseFloat(theta_value[0].toFixed(2));
                      console.log(theta);
                      data = { ...data, [cell13._address]: theta };
                      theta_new = theta;
                      theta_m[wkey] = theta_new;
                    } else {
                      data = { ...data, [cell13._address]: parseFloat(theta2.toFixed(2)) };
                      theta_new = parseFloat(theta2.toFixed(2));
                      theta_m[wkey] = theta_new;
                    }
                  } else {
                    console.error("Error: Unable to determine address for rows[key1]._cells[6]");
                  }
          }
        
          if (b_i === 2) {
            if (wkey == lastWkey) {
            let cell5 = getSafeCell(rows[key1], 4);
            if (cell5) {
              data = { ...data, [cell5._address]: "β" };
            } else {
              console.error("Error: Unable to determine address for rows[key1]._cells[4]");
            }
          } else {
            let cell7 = getSafeCell(rows[key1], 7);
            if (cell7) {
              data = { ...data, [cell7._address]: "β" };
            } else {
              console.error("Error: Unable to determine address for rows[key1]._cells[4]");
            }
          }
          if (wkey == lastWkey) {
          let cell6 = getSafeCell(rows[key1], 5);
            if (cell6) {
              data = { ...data, [cell6._address]: "=" };
            } else {
              console.error("Error: Unable to determine address for rows[key1]._cells[5]");
            }
          } else {
            let cell8 = getSafeCell(rows[key1], 8);
            if (cell8) {
              data = { ...data, [cell8._address]: "=" };
            } else {
              console.error("Error: Unable to determine address for rows[key1]._cells[5]");
            }

          }
          if (wkey == lastWkey) {
            let cell7 = getSafeCell(rows[key1], 6);
            if (cell7) {
              if (Av < Avm) {
                let b_value = ThetaBeta2( Etn * 1000,sxe[wkey]);
                let beta = parseFloat(b_value[1].toFixed(2));
                console.log(beta);
                data = { ...data, [cell7._address]: parseFloat(beta.toFixed(2)) };
                beta_new_min = beta;
                beta_n[wkey] = beta_new_min;
              } else {
                data = { ...data, [cell7._address]: parseFloat(beta2.toFixed(2)) };
                beta_new_min = parseFloat(beta2.toFixed(2));
                beta_n[wkey] = beta_new_min;
              }
            } else {
              console.error("Error: Unable to determine address for rows[key1]._cells[6]");
            }
          } else {
            let cell10 = getSafeCell(rows[key1], 9);
            if (cell10) {
              if (Av < Avm) {
                let b_value = ThetaBeta2( Etn * 1000,sxe[wkey]);
                let beta = parseFloat(b_value[1].toFixed(2));
                console.log(beta);
                data = { ...data, [cell10._address]: parseFloat(beta.toFixed(2)) };
                beta_new_min = beta;
                beta_n[wkey] = beta_new_min;
              } else {
                data = { ...data, [cell10._address]: parseFloat(beta2.toFixed(2)) };
                beta_new_min = parseFloat(beta2.toFixed(2));
                beta_n[wkey] = beta_new_min;
              }
            } else {
              console.error("Error: Unable to determine address for rows[key1]._cells[10]");
            }

          }
            let cell11 = getSafeCell(rows[key1], 11);
            if (cell11) {
              data = { ...data, [cell11._address]: "θ" };
            } else {
              console.error("Error: Unable to determine address for rows[key1]._cells[4]");
            }
        
            let cell12 = getSafeCell(rows[key1], 12);
            if (cell12) {
              data = { ...data, [cell12._address]: "=" };
            } else {
              console.error("Error: Unable to determine address for rows[key1]._cells[5]");
            }
            let cell13 = getSafeCell(rows[key1], 13);
                  if (cell13) {
                    if (Av < Avm) {
                      let theta_value = ThetaBeta2(Etn * 1000,sxe[wkey]);
                      let theta = parseFloat(theta_value[0].toFixed(2));
                      console.log(theta);
                      data = { ...data, [cell13._address]: theta };
                      theta_new_min = theta;
                      theta_n[wkey] = theta_new_min;
                    } else {
                      data = { ...data, [cell13._address]: parseFloat(theta2.toFixed(2)) };
                      theta_new_min = parseFloat(theta2.toFixed(2));
                      theta_n[wkey] = theta_new_min;
                    }
                  } else {
                    console.error("Error: Unable to determine address for rows[key1]._cells[6]");
                  }
          }
        }
        
        if (getSafeCell(rows[key1], 0) && getSafeCell(rows[key1], 0)._value.model.value === "$$theta_max") {
          theta_i = theta_i + 1;
          
          if (theta_i === 1) {
        
            for (let i = 2; i <= 32; i++) {
              let cell = getSafeCell(rows[key1], i);
              if (cell) {
                data = { ...data, [cell._address]: "" };
              } else {
                console.error(`Error: Unable to determine address for rows[key1]._cells[${i}]`);
              }
            }
          }
          if (theta_i === 2) {
        
            for (let i = 2; i <= 32; i++) {
              let cell = getSafeCell(rows[key1], i);
              if (cell) {
                data = { ...data, [cell._address]: "" };
              } else {
                console.error(`Error: Unable to determine address for rows[key1]._cells[${i}]`);
              }
            }
          }
        }
        if (
          getSafeCell(rows[key1], 0) &&
          getSafeCell(rows[key1], 0)._value.model.value === "$$chge"
      ) { 
          chge_i = chge_i + 1;
          if (chge_i == 1) {
           let cell2 = rows[key1]._cells[2];
           let add2 = cell2._address;
           data = { ...data, [add2] : '0.5Φ(Vc+Vp)'};
           let cell11 = rows[key1]._cells[11];
           let add11 = cell11._address;
           data = { ...data, [add11] : 'Φ(Vc+Vp)'};
           let key0 = parseInt(key1) - 1;
          let cell27 = rows[key0]._cells[27];
           let add27 = cell27._address;
           data = { ...data,[add27] : '(See 5.8.2.4)'}
          }
          if (chge_i == 2) {
            let cell2 = rows[key1]._cells[2];
            let add2 = cell2._address;
            data = { ...data, [add2] : '0.5Φ(Vc+Vp)'};
            let cell11 = rows[key1]._cells[11];
            let add11 = cell11._address;
            data = { ...data, [add11] : 'Φ(Vc+Vp)'};
            let key0 = parseInt(key1) - 1;
          let cell27 = rows[key0]._cells[27];
           let add27 = cell27._address;
           data = { ...data,[add27] : '(See 5.8.2.4)'}
           }
      }
        
        if (getSafeCell(rows[key1], 0) && getSafeCell(rows[key1], 0)._value.model.value === "$$beta") {
          beta_i = beta_i + 1;
          if (beta_i === 1) {
            let cell9 = getSafeCell(rows[key1], 9);
            let cell13 = getSafeCell(rows[key1],13);
            if (cell13 && typeof cell13._value.model.value === 'number' && !isNaN(cell13._value.model.value)) {
              let cell13 = getSafeCell(rows[key1],13);
              beta = cell13._value.model.value;
              beta_mo[wkey] = beta;
            } 
            // else {
            //   console.error("Error: Unable to determine address for rows[key1]._cells[9]");
             else {
            if (cell9) {
              beta = cell9._value.model.value;
              beta_mo[wkey] = beta;
            } else {
              console.error("Error: Unable to determine address for rows[key1]._cells[9]");
            }
          }
         }
        
          if (beta_i === 2) {
            let cell9 = getSafeCell(rows[key1], 9);
            let cell13 = getSafeCell(rows[key1],13);
            if (cell13 && typeof cell13._value.model.value === 'number' && !isNaN(cell13._value.model.value)) {
              let cell13 = getSafeCell(rows[key1],13);
              beta_min = cell13._value.model.value;
              beta_no[wkey] = beta;
            } 
            // else {
            //   console.error("Error: Unable to determine address for rows[key1]._cells[9]");
             else {
            if (cell9) {
              beta_min = cell9._value.model.value;
              beta_no[wkey] = beta_min;
            } else {
              console.error("Error: Unable to determine address for rows[key1]._cells[9]");
            }
          }
          }
        }
        
      if (getSafeCell(rows[key1], 0) && getSafeCell(rows[key1], 0)._value.model.value === "$$vc") {
        vc_i = vc_i + 1;
        if (vc_i == 1) {
        let cell13 = getSafeCell(rows[key1], 13);
        let cell9 = getSafeCell(rows[key1], 9);
        let cell5 = getSafeCell(rows[key1], 5);
      
        if (cell5 && cell9 && cell13) {
          let add5 = cell5._address;
          let add9 = cell9._address;
          data = { ...data, [add5]: "0.0316" };
      
          console.log(cell9._value.model.value);
          console.log(rows[key1]);
      
          if (cell13._address) {
            let add13 = cell13._address;
            let initialValue13 = cell13._value.model.value;
      
            let result;
            if (K === undefined || K == '') {
              result = (initialValue13 / beta) * beta1;
            } else {
              result = (initialValue13 / K) * beta1;
            }
      
            cell13._value.model.value = result;
            data = { ...data, [add9]: "β √f'c bvdv" };
            data = { ...data, [add13]: parseFloat(result.toFixed(2)) };
      
            Vc = result; // new Vc value
          } else {
            console.error("Error: Unable to determine address for cell13");
          }
        } else {
          console.error("Error: Unable to determine address for cells[5], [9], or [13]");
        }
        let cell27 = rows[key1]._cells[27];
        let add27 = cell27._address;
        data = { ...data,[add27] : '(Eq. 5.7.3.3-3)'};
      }
      if (vc_i == 2) {
        let cell13 = getSafeCell(rows[key1], 13);
        let cell9 = getSafeCell(rows[key1], 9);
        let cell5 = getSafeCell(rows[key1], 5);
      
        if (cell5 && cell9 && cell13) {
          let add5 = cell5._address;
          let add9 = cell9._address;
          data = { ...data, [add5]: "0.0316" };
      
          console.log(cell9._value.model.value);
          console.log(rows[key1]);
      
          if (cell13._address) {
            let add13 = cell13._address;
            let initialValue13 = cell13._value.model.value;
      
            let result;
            if (K === undefined || K === '') {
              result = (initialValue13 / beta_min) * beta2;
            } else {
              result = (initialValue13 / K) * beta2;
            }
      
            cell13._value.model.value = result;
            data = { ...data, [add9]: "β √f'c bvdv" };
            data = { ...data, [add13]: parseFloat(result.toFixed(2)) };
      
            Vc_min = result; // new Vc_min value
          } else {
            console.error("Error: Unable to determine address for cell13");
          }
        } else {
          console.error("Error: Unable to determine address for cells[5], [9], or [13]");
        }
        let cell27 = rows[key1]._cells[27];
        let add27 = cell27._address;
        data = { ...data,[add27] : '(Eq. 5.7.3.3-3)'};
      }
      }
      
      console.log("Initial Value:", initialValue13);
      console.log("New Value:", Vc);
      if (getSafeCell(rows[key1], 0) && getSafeCell(rows[key1], 0)._value.model.value === "$$(vc+vp)") {
        vcvp_i += 1;
        
        if (vcvp_i === 1) {
          let cell11 = getSafeCell(rows[key1], 11);
          let cell2 = getSafeCell(rows[key1], 2);
      
          if (cell11 && cell11._value.model.value !== undefined) {
            Vu_max = getSafeCell(rows[key1], 20)._value.model.value;
            finalResult = pi * (Vc + Vp);
            half_finalResult = finalResult / 2;
            console.log(finalResult);
            data = { ...data, [cell11._address]: parseFloat(finalResult.toFixed(2)) };
            data = { ...data, [cell2._address]: parseFloat(half_finalResult.toFixed(2)) };
          } else {
            console.error("Error: Unable to retrieve value for rows[key1]._cells[11]");
          }
        }
        if (vcvp_i === 2) {
          let cell11 = getSafeCell(rows[key1], 11);
          let cell2 = getSafeCell(rows[key1], 2);
      
          if (cell11 && cell11._value.model.value !== undefined) {
            Vu_min = getSafeCell(rows[key1], 20)._value.model.value;
            finalResult = pi * (Vc_min + Vp_min);
            half_finalResult = finalResult / 2;
            console.log(finalResult);
            data = { ...data, [cell11._address]: parseFloat(finalResult.toFixed(2)) };
            data = { ...data, [cell2._address]: parseFloat(half_finalResult.toFixed(2)) };
          } else {
            console.error("Error: Unable to retrieve value for rows[key1]._cells[11]");
          }
        }
      }
      if (getSafeCell(rows[key1], 0) && getSafeCell(rows[key1], 0)._value.model.value === "$$check") {
          check_i += 1;
        
          if (check_i === 1) {
            let cell2 = getSafeCell(rows[key1], 2);
            let cell11 = getSafeCell(rows[key1], 11);
            let cell12 = getSafeCell(rows[key1], 12);
            let add2 = cell2._address;
            let add11 = cell11._address;
            let add12 = cell12._address;
            let cell2Value;
        
            if (Math.abs(half_finalResult) > Vu_max) {
              cell2Value = "Vu < 0.5Φ(Vc+Vp)";
              data = { ...data, [add2]: "Vu < 0.5Φ(Vc+Vp)" };
              data = { ...data, [add11]: "∴" };
              data = { ...data, [add12]: "No Shear reinforcing" };
            } else {
              cell2Value = "Vu ≥ 0.5Φ(Vc+Vp)";
              data = { ...data, [add2]: "Vu ≥ 0.5Φ(Vc+Vp)" };
            }
        
            let key2 = parseInt(key1) + 1;
        
            if (cell2Value === "Vu ≥ 0.5Φ(Vc+Vp)") {
              if (getSafeCell(rows[key2], 0) && getSafeCell(rows[key2], 0)._value.model.value === "$$Ar") {
                if (type == 'Box'){
                  let cell5 = rows[key2]._cells[5];
                  let add5 = cell5._address;
                  data = { ...data,[add5] : '{ Vu - Φ(Vc+Vp) }·s'};
                  let key3 = parseInt(key2) + 1;
                  let cell5_3 = rows[key3]._cells[5];
                  let add5_3 = cell5_3._address;
                  data = { ...data,[add5_3] : 'Φ·fy·dv(cotθ+cotα)sinα'};
                }
                let cell13 = getSafeCell(rows[key2], 13);
                let add13 = cell13._address;
                let Av_extra;
                let Avr;
                if(type == 'Composite'){
                  if ( a > 0){
                  Avr = ((Vu_max - finalResult) * s_max) / (pi * fy * dv * (cot(theta_new) + cot(a)) * Math.sin(a));
                  } else {
                   Avr = 0;
                  }
                 } else {
                   if ( $$alpha > 0) {
                   Avr = ((Vu_max - finalResult) * s_max) / (pi * fy * dv * (cot(theta_new) + cot($$alpha)) * Math.sin($$alpha));
                   } else {
                     Avr = 0;
                   }
                 }
                Avr = parseFloat(Avr.toFixed(3));
                console.log(Avr);
                data = { ...data, [add13]: Avr };
        
                for (let i = key2; i <= worksheet.rowCount; i++) {
                  let nextRow = worksheet.getRow(i);
        
                  if (getSafeCell(rows[i], 0) && getSafeCell(rows[i], 0)._value.model.value === "$$Av,req") {
                    Avr_old[wkey] = rows[key2]._cells[13].value;
                    let cell12 = getSafeCell(rows[i], 12);
                    let add12 = cell12._address;
        
                    if (Avm > Avr) {
                      Av_extra = Avm;
                      data = { ...data, [add12]: parseFloat(Avm.toFixed(3)) };
                      Avr_new[wkey] = parseFloat(Avm.toFixed(3));
                    } else {
                      Av_extra = Avr;
                      data = { ...data, [add12]: parseFloat(Avr.toFixed(3)) };
                      Avr_new[wkey] = parseFloat(Avr.toFixed(3));
                    }
                  }
                  if (getSafeCell(rows[i], 0) && getSafeCell(rows[i], 0)._value.model.value === "$$Av,che") { 
                    let cell8 = rows[i]._cells[8];
                    let add8 = cell8._address;
                    data = { ...data,[add8] : parseFloat(Avm.toFixed(3))};
                  }
        
                  if (getSafeCell(rows[i], 0) && getSafeCell(rows[i], 0)._value.model.value === "$$A,v") {
                    let cell11 = getSafeCell(rows[i], 11);
                    let cell29 = getSafeCell(rows[i], 29);
                    let add11 = cell11._address;
                    let add29 = cell29._address;
        
                    if (Av >= Av_extra) {
                      data = { ...data, [add11]: "≥" };
                      data = { ...data, [add29]: "OK" };
                    } else {
                      data = { ...data, [add11]: "<" };
                      data = { ...data, [add29]: "NG" };
                    }
                  }
        
                  if (nextRow.getCell(1).value === "$$A,v") {
                    break;
                  }
                }
              }
               else {
                // let cell13 = getSafeCell(rows[key2], 13);
                // let add13 = cell13._address;
                let Av_extra;
                let Avr;
                if(type == 'Composite'){
                 if ( a > 0){
                 Avr = ((Vu_max - finalResult) * s_max) / (pi * fy * dv * (cot(theta_new) + cot(a)) * Math.sin(a));
                 } else {
                  Avr = 0;
                 }
                } else {
                  if ( $$alpha > 0) {
                  Avr = ((Vu_max - finalResult) * s_max) / (pi * fy * dv * (cot(theta_new) + cot($$alpha)) * Math.sin($$alpha));
                  } else {
                    Avr = 0;
                  }
                }
                Avr = parseFloat(Avr.toFixed(3));
                console.log(Avr);
                    if (Avm > Avr) {
                      Av_extra = Avm;
                      // data = { ...data, [add12]: parseFloat(Avm.toFixed(3)) };
                      Avr_new[wkey] = parseFloat(Avm.toFixed(3));
                    } else {
                      Av_extra = Avr;
                      // data = { ...data, [add12]: parseFloat(Avr.toFixed(3)) };
                      Avr_new[wkey] = parseFloat(Avr.toFixed(3));
                    }
               }
               } else {
              if (getSafeCell(rows[key2], 0) && getSafeCell(rows[key2], 0)._value.model.value === "$$Ar") {
                for (let i = parseInt(key2) + 1; i <= worksheet.rowCount; i++) {
                  let nextRow = worksheet.getRow(i);
                  let cell1 = nextRow.getCell(1);
        
                  if (cell1 && cell1.value === "$$A,v") {
                    nextRow.eachCell({ includeEmpty: true }, (cell) => {
                      cell.value = "";
                    });
                    break;
                  }
        
                  nextRow.eachCell({ includeEmpty: true }, (cell) => {
                    cell.value = "";
                  });
                }
              }
            }
          }
          if (check_i === 2) {
            let cell2 = getSafeCell(rows[key1], 2);
            let cell11 = getSafeCell(rows[key1], 11);
            let cell12 = getSafeCell(rows[key1], 12);
            let add2 = cell2._address;
            let add11 = cell11._address;
            let add12 = cell12._address;
            let cell2Value;
        
            if (Math.abs(half_finalResult) > Vu_max) {
              cell2Value = "Vu < 0.5Φ(Vc+Vp)";
              data = { ...data, [add2]: "Vu < 0.5Φ(Vc+Vp)" };
              data = { ...data, [add11]: "∴" };
              data = { ...data, [add12]: "No Shear reinforcing" };
            } else {
              cell2Value = "Vu ≥0.5Φ(Vc+Vp)";
              data = { ...data, [add2]: "Vu ≥ 0.5Φ(Vc+Vp)" };
            }
        
            let key2 = parseInt(key1) + 1;
        
            if (cell2Value === "0.5Φ(Vc+Vp)") {
              if (getSafeCell(rows[key2], 0) && getSafeCell(rows[key2], 0)._value.model.value === "$$Ar") {
                if (type == 'Box'){
                  let cell5 = rows[key2]._cells[5];
                  let add5 = cell5._address;
                  data = { ...data,[add5] : '{ Vu - Φ(Vc+Vp) }·s'}
                  let key3 = parseInt(key2) + 1;
                  let cell5_3 = rows[key3]._cells[5];
                  let add5_3 = cell5_3._address;
                  data = { ...data,[add5_3] : 'Φ·fy·dv(cotθ+cotα)sinα'}
                }
                let cell13 = getSafeCell(rows[key2], 13);
                let add13 = cell13._address;
                let Av_extra;
                let Avr;
                if(type == 'Composite'){
                  if ( a > 0){
                  Avr = ((Vu_min - finalResult) * s_min) / (pi_min * fy * dv_min * (cot(theta_new_min) + cot(a)) * Math.sin(a));
                  } else {
                   Avr = 0;
                  }
                 } else {
                   if ( $$alpha_min > 0) {
                   Avr = ((Vu_min - finalResult) * s_min) / (pi_min * fy * dv_min * (cot(theta_new_min) + cot($$alpha)) * Math.sin($$alpha));
                   } else {
                     Avr = 0;
                   }
                 }
                Avr = parseFloat(Avr.toFixed(3));
                console.log(Avr);
                data = { ...data, [add13]: Avr };
        
                for (let i = key2; i <= worksheet.rowCount; i++) {
                  let nextRow = worksheet.getRow(i);
        
                  if (getSafeCell(rows[i], 0) && getSafeCell(rows[i], 0)._value.model.value === "$$Av,req") {
                    Avr_old_n[wkey] = rows[key2]._cells[13].value;
                    let cell12 = getSafeCell(rows[i], 12);
                    let add12 = cell12._address;
        
                    if (Avm > Avr) {
                      Av_extra = Avm;
                      data = { ...data, [add12]: parseFloat(Avm.toFixed(3)) };
                      Avr_new_n[wkey] = parseFloat(Avm.toFixed(3));
                    } else {
                      Av_extra = Avr;
                      data = { ...data, [add12]: parseFloat(Avr.toFixed(3)) };
                      Avr_new_n[wkey] = parseFloat(Avr.toFixed(3));
                    }
                  }
                  if (getSafeCell(rows[i], 0) && getSafeCell(rows[i], 0)._value.model.value === "$$Av,che") { 
                    let cell8 = rows[i]._cells[8];
                    let add8 = cell8._address;
                    data = { ...data,[add8] : parseFloat(Avm.toFixed(3))};
                  }
        
                  if (getSafeCell(rows[i], 0) && getSafeCell(rows[i], 0)._value.model.value === "$$A,v") {
                    let cell11 = getSafeCell(rows[i], 11);
                    let cell29 = getSafeCell(rows[i], 29);
                    let add11 = cell11._address;
                    let add29 = cell29._address;
        
                    if (Av >= Av_extra) {
                      data = { ...data, [add11]: "≥" };
                      data = { ...data, [add29]: "OK" };
                    } else {
                      data = { ...data, [add11]: "<" };
                      data = { ...data, [add29]: "NG" };
                    }
                  }
        
                  if (nextRow.getCell(1).value === "$$A,v") {
                    break;
                  }
                }
              }
               else {
                let Av_extra;
                let Avr;
                if(type == 'Composite'){
                  if ( a > 0){
                  Avr = ((Vu_min - finalResult) * s_min) / (pi_min * fy * dv_min * (cot(theta_new_min) + cot(a)) * Math.sin(a));
                  } else {
                   Avr = 0;
                  }
                 } else {
                   if ( $$alpha_min > 0) {
                   Avr = ((Vu_min - finalResult) * s_min) / (pi_min * fy * dv_min * (cot(theta_new_min) + cot($$alpha_min)) * Math.sin($$alpha_min));
                   } else {
                     Avr = 0;
                   }
                 }
                Avr = parseFloat(Avr.toFixed(3));
                console.log(Avr);
        
                    if (Avm > Avr) {
                      Av_extra = Avm;
                      // data = { ...data, [add12]: parseFloat(Avm.toFixed(3)) };
                      Avr_new_n[wkey] = parseFloat(Avm.toFixed(3));
                    } else {
                      Av_extra = Avr;
                      // data = { ...data, [add12]: parseFloat(Avr.toFixed(3)) };
                      Avr_new_n[wkey] = parseFloat(Avr.toFixed(3));
                    }
              }
               } else {
              if (getSafeCell(rows[key2], 0) && getSafeCell(rows[key2], 0)._value.model.value === "$$Ar") {
                for (let i = parseInt(key2) + 1; i <= worksheet.rowCount; i++) {
                  let nextRow = worksheet.getRow(i);
                  let cell1 = nextRow.getCell(1);
        
                  if (cell1 && cell1.value === "$$A,v") {
                    nextRow.eachCell({ includeEmpty: true }, (cell) => {
                      cell.value = "";
                    });
                    break;
                  }
        
                  nextRow.eachCell({ includeEmpty: true }, (cell) => {
                    cell.value = "";
                  });
                }
              }
            }
          }
        }
      if (
        getSafeCell(rows[key1], 0) &&
        getSafeCell(rows[key1], 0)._value.model.value === "$$vs"
    ) {
        vs_i = vs_i + 1;
        if (vs_i === 1) {
            let cell13 = getSafeCell(rows[key1], 13);
            let add13 = cell13 ? cell13._address : null;
            if (add13) {
              if ($$alpha > 0) {
                let cal = ((Av * fy * dv * (cot(theta_new) + cot($$alpha))) * Math.sin($$alpha)) / s_max;
                cal = parseFloat(cal.toFixed(3));
                data = { ...data, [add13]: cal };
                Vs = cal;
              }
              else {
                let cal = 0;
                data = { ...data,[add13]: cal };
                Vs = cal;
              }
            } else {
                console.error("Error: Unable to retrieve address for rows[key1]._cells[13]");
            }
            let cell5 = rows[key1]._cells[5];
            let add5 = cell5._address;
            data = { ...data, [add5] : 'Av·fy·dv(cotθ+cotα)sinα'};
            let key2 = parseInt(key1) + 1;
            let cell27 = rows[key2]._cells[27];
            let add27 = cell27._address;
            data = { ...data,[add27] : '(Eq. 5.7.3.3-4)'}
        }
        if (vs_i === 2) {
            let cell13 = getSafeCell(rows[key1], 13);
            let add13 = cell13 ? cell13._address : null;
            if (add13) {
              if ($$alpha_min > 0) {
                let cal = (Av * fy * dv_min * (cot(theta_new_min) + cot($$alpha_min)) * Math.sin($$alpha_min)) / s_min;
                cal = parseFloat(cal.toFixed(3));
                data = { ...data, [add13]: cal };
                Vs_min = cal;
              }
              else {
                let cal = 0;
                data = { ...data,[add13]: cal};
                Vs_min = cal;
              }
            } else {
                console.error("Error: Unable to retrieve address for rows[key1]._cells[13]");
            }
            let cell5 = rows[key1]._cells[5];
            let add5 = cell5._address;
            data = { ...data, [add5] : 'Av·fy·dv(cotθ+cotα)sinα'};
            let key2 = parseInt(key1) + 1;
            let cell27 = rows[key2]._cells[27];
            let add27 = cell27._address;
            data = { ...data,[add27] : '(Eq. 5.7.3.3-4)'}
        }
    }
    if (
      getSafeCell(rows[key1], 0) &&
      getSafeCell(rows[key1], 0)._value.model.value === "$$sum"
  ) {
      sum_i = sum_i + 1;
      if (sum_i === 1) {
          let cell3 = getSafeCell(rows[key1], 3);
          let add3 = cell3._address;
          data = { ...data,[add3] : 'Vc +Vs +Vp'}
          let cell14 = getSafeCell(rows[key1], 14);
          let add14 = cell14._address;
          data = { ...data,[add14] : "0.25·f'cbvdv + Vp ="};
          let cell7 = getSafeCell(rows[key1], 7);
          let add7 = cell7 ? cell7._address : null;
          if (add7) {
              let sum = Vp + Vc + Vs;
              Vn = sum;
              data = { ...data, [add7]: parseFloat(Vn.toFixed(2)) };
  
              let cell13 = getSafeCell(rows[key1], 13);
              let cell20 = getSafeCell(rows[key1], 20);
              let add13 = cell13 ? cell13._address : null;
              let add20 = cell20 ? cell20._address : null;
              let value20 = cell20 ? cell20.value : null;
              if( type == 'Box') {
                value20 = (0.25*fc*bv*dv) + Vp;
                data = { ...data,[add20] : parseFloat(value20.toFixed(3))};
              }
              if (add13 && value20 !== null) {
                  data = { ...data, [add13]: Vn < value20 ? "≤" : ">" };
                  if (Vn <= value20) {
                    Vn = Vn;
                  } else {
                    Vn = value20;
                  }
              } else {
                  console.error("Error: Unable to retrieve address or value for rows[key1]._cells[20]");
              }
          } else {
              console.error("Error: Unable to retrieve address for rows[key1]._cells[7]");
          }
          let key0 = parseInt(key1) - 1;
          let cell27 = rows[key0]._cells[27];
          let add27 = cell27._address;
          data = { ...data,[add27] : '(Eq. 5.7.3.3-1)'}
      }
  
      if (sum_i === 2) {
          let cell3 = getSafeCell(rows[key1], 3);
          let add3 = cell3._address;
          data = { ...data,[add3] : 'Vc +Vs +Vp'}
          let cell14 = getSafeCell(rows[key1], 14);
          let add14 = cell14._address;
          data = { ...data,[add14] : "0.25·f'cbvdv + Vp ="};
          let cell7 = getSafeCell(rows[key1], 7);
          let add7 = cell7 ? cell7._address : null;
          if (add7) {
              let sum = Vp_min + Vc_min + Vs_min;
              Vn_min = sum;
              data = { ...data, [add7]: parseFloat(Vn_min.toFixed(2)) };
              let cell13 = getSafeCell(rows[key1], 13);
              let cell20 = getSafeCell(rows[key1], 20);
              let add13 = cell13 ? cell13._address : null;
              let add20 = cell20 ? cell20._address : null;
              let value20 = cell20 ? cell20.value : null;
              if( type == 'Box') {
                value20 = (0.25*fc*bv*dv) + Vp;
                data = { ...data,[add20] : parseFloat(value20.toFixed(3))};
              }
  
              if (add13 && value20 !== null) {
                  data = { ...data, [add13]: Vn_min < value20 ? "≤" : ">" };
                  if (Vn_min <= value20) {
                    Vn_min = Vn_min;
                  } else {
                    Vn_min = value20;
                  }
              } else {
                  console.error("Error: Unable to retrieve address or value for rows[key1]._cells[20]");
              }
          } else {
              console.error("Error: Unable to retrieve address for rows[key1]._cells[7]");
          }
          let key0 = parseInt(key1) - 1;
          let cell27 = rows[key0]._cells[27];
          let add27 = cell27._address;
          data = { ...data,[add27] : '(Eq. 5.7.3.3-1)'}
      }
  }
  if (
    rows[key1]._cells[0] != undefined &&
    rows[key1]._cells[0]._value.model.value == "$$t"
  ) {
    t_i = t_i + 1;
    if(t_i == 1) {
      let cell8 = rows[key1]._cells[8];
      let add8 = cell8._address;
      data = { ...data , [add8] : ""}
      // theta_mo = rows[key1]._cells[13].value;
      let cell13 = rows[key1]._cells[13];
      let add13 = cell13._address;
      data = { ...data,[add13] : "  "}
      let cell27 = rows[key1]._cells[27];
      let add27 = getCellAddress(cell27, "dummy_address_27");
      data = { ...data,[add27] : "  "}
    }
    if(t_i == 2) {
      let cell8 = rows[key1]._cells[8];
      let add8 = cell8._address;
      data = { ...data , [add8] : ""}
      // theta_mo = rows[key1]._cells[13].value;
      let cell13 = rows[key1]._cells[13];
      let add13 = cell13._address;
      data = { ...data,[add13] : "   "}
      let cell27 = rows[key1]._cells[27];
      let add27 = getCellAddress(cell27, "dummy_address_27");
      data = { ...data,[add27] : "  "}
    }
    if(t_i == 3) {
      let cell8 = rows[key1]._cells[8];
      let add8 = cell8._address;
      data = { ...data , [add8] : ""}
      let cell13 = rows[key1]._cells[13];
      let add13 = cell13._address;
      data = { ...data,[add13] : "  "}
      let cell27 = rows[key1]._cells[27];
      let add27 = getCellAddress(cell27, "dummy_address_27");
      data = { ...data,[add27] : "  "}
    }
    if(t_i == 4) {
      let cell8 = rows[key1]._cells[8];
      let add8 = cell8._address;
      data = { ...data , [add8] : "####"}
      let cell13 = rows[key1]._cells[13];
      let add13 = cell13._address;
      data = { ...data,[add13] : "  "}
      let cell27 = rows[key1]._cells[27];
      let add27 = getCellAddress(cell27, "dummy_address_27");
      data = { ...data,[add27] : "  "}
    }
        
  }
  if (
    rows[key1]._cells[0] != undefined &&
    rows[key1]._cells[0]._value.model.value == "$$vn"
  ) {
    vn_i = vn_i + 1;
    if (vn_i == 1) {
    let cell5 = rows[key1]._cells[5];
    let add5 = cell5._address;
    let cell11 = rows[key1]._cells[11];
    let add11 = cell11._address;
    if (cell11.value == Vn) {
      data = { ...data,[add5] : "0.25·f'cbvdv+Vp"}; 
    } else {
    data = { ...data,[add5] : 'Vc + Vs +Vp'};
    }
    data = { ...data, [add11]: parseFloat(Vn.toFixed(2)) };
  }
  if (vn_i == 2){
    let cell5 = rows[key1]._cells[5];
    let add5 = cell5._address;
    let cell11 = rows[key1]._cells[11];
    let add11 = cell11._address;
    if (cell11.value == Vn_min) {
      data = { ...data,[add5] : "0.25·f'cbvdv+Vp"}; 
    } else {
    data = { ...data,[add5] : 'Vc + Vs +Vp'};
    }
    data = { ...data, [add11]: parseFloat(Vn_min.toFixed(2)) };
  }
  
  }
    // Removed commented out code for cleanliness
    
    if (
      getSafeCell(rows[key1], 0) &&
      getSafeCell(rows[key1], 0)._value.model.value === "$$vr"
  ) {
    vu[wkey] = rows[key1]._cells[17].value;
   
      vr_i = vr_i + 1;
      if (vr_i === 1) {
        vr_old[wkey] = rows[key1]._cells[8].value;
          let cell8 = getSafeCell(rows[key1], 8);
          let cell17 = getSafeCell(rows[key1], 17);
          let cell29 = getSafeCell(rows[key1], 29);
          let cell16 = getSafeCell(rows[key1], 16);
          let add8 = cell8 ? cell8._address : null;
          let add29 = cell29 ? cell29._address : null;
          let add16 = cell16 ? cell16._address : null;
          let cell17_value = cell17 ? cell17.value : null;
  
          if (add8 && add29 && add16 && cell17_value !== null) {
              let vr = pi * Vn;
              if (vr < cell17_value) {
                  data = { ...data, [add16]: "<" };
                  data = { ...data, [add29]: "NG" };
              } else {
                  data = { ...data, [add16]: "≥" };
                  data = { ...data, [add29]: "OK" };
              }
              data = { ...data, [add8]: parseFloat(vr.toFixed(2)) };
              vr_new[wkey] = parseFloat(vr.toFixed(2));
          } else {
              console.error("Error: Unable to retrieve necessary cell addresses or values for vr_i == 1");
          }
      }
  
      if (vr_i === 2) {
        vr_old_n[wkey] = rows[key1]._cells[8].value;
          let cell8 = getSafeCell(rows[key1], 8);
          let cell17 = getSafeCell(rows[key1], 17);
          let cell29 = getSafeCell(rows[key1], 29);
          let cell16 = getSafeCell(rows[key1], 16);
          let add8 = cell8 ? cell8._address : null;
          let add29 = cell29 ? cell29._address : null;
          let add16 = cell16 ? cell16._address : null;
          let cell17_value = cell17 ? cell17.value : null;
  
          if (add8 && add29 && add16 && cell17_value !== null) {
              let vr_min = pi_min * Vn_min;
              if (vr_min < cell17_value) {
                  data = { ...data, [add16]: "<" };
                  data = { ...data, [add29]: "NG" };
              } else {
                  data = { ...data, [add16]: "≥" };
                  data = { ...data, [add29]: "OK" };
              }
              data = { ...data, [add8]: parseFloat(vr_min.toFixed(2)) };
              vr_new_n[wkey] = parseFloat(vr_min.toFixed(2));
          } else {
              console.error("Error: Unable to retrieve necessary cell addresses or values for vr_i == 2");
          }
      }
  }
 
  }
  for (let key1 in rows) {
    if (
      rows[key1]._cells[0] != undefined &&
      rows[key1]._cells[0]._value.model.value == "$$t") {
        teta = teta + 1;
        if (teta == 1) {
         let cell8 = rows[key1]._cells[8];
         let add8 = cell8._address;
         data = { ...data,[add8] : theta_new};
         let cell13 = rows[key1]._cells[13];
         let add13 = cell13._address;
         data = { ...data,[add13] : theta_new}
        } if (teta == 2) {
          let cell8 = rows[key1]._cells[8];
         let add8 = cell8._address;
         data = { ...data,[add8] : theta_new_min};
         let cell13 = rows[key1]._cells[13];
         let add13 = cell13._address;
         data = { ...data,[add13] : theta_new_min}
        }
     }
     if (
      rows[key1]._cells[0] != undefined &&
      rows[key1]._cells[0]._value.model.value == "$$ti") {
         teta_i = teta_i + 1;
         if (teta_i == 1) {
           let cell8 = rows[key1]._cells[8];
           let add8 = cell8._address;
           data = { ...data,[add8] : theta_new}
           let cell13 = rows[key1]._cells[13];
           let add13 = cell13._address;
           data = { ...data,[add13]: theta_new};
         }
         if (teta_i == 2){
          let cell8 = rows[key1]._cells[8];
          let add8 = cell8._address;
          data = { ...data,[add8] : theta_new_min};
          let cell13 = rows[key1]._cells[13];
           let add13 = cell13._address;
           data = { ...data,[add13]: theta_new_min};
         }
       }

  }
    
      for (let key in data) {
        let match = key.match(/^([A-Za-z]+)(\d+)$/);
        if (match) {
          const row = match[1];
          const col = match[2];
          let value = 0;
          let factor = 1;
          for (let i = row.length - 1; i >= 0; i--) {
            value += (row.charCodeAt(i) - 64) * factor;
            factor *= 26;
          }
          worksheet._rows[col - 1]._cells[value - 1]._value.model.value =
            data[key];
          worksheet._rows[col - 1]._cells[value - 1]._value.model.type = 3;
        }
      }
    //   deleteRowsBetweenMarkers(worksheet);
      for (let key1 in rows) {
        if (
          rows[key1]._cells[0] != undefined &&
          rows[key1]._cells[0]._value.model.value == "$$b_str"  
        ) {
           bs_i = bs_i + 1;
          // Store the starting index for deletion
          if ( bs_i == 1 || bs_i == 2) {
          let startIdx = parseInt(key1);
          let rownumber = 0;
          let endIdx;
  
          // Loop through rows starting from the next row after '$$b_str'
          for (let i = startIdx; i < rows.length; i++) {
            // Check if the current row has the value '$$b_end'
            if (
              rows[i] &&
              rows[i]._cells[0] &&
              rows[i]._cells[0]._value.model.value == "$$b_end"
            ) {
              // Store the ending index for deletion
              endIdx = i;
              // Calculate the number of rows to delete
              rownumber = endIdx - startIdx + 1;
              // Delete rows between '$$b_str' and '$$b_end' (inclusive)
              worksheet._rows.splice(startIdx, rownumber);
              break;
            }
          }
        }
    }
  }
  
      for (let i = 0; i < (rows.length + 15); i++) {
            if (rows[i] && rows[i]._cells && rows[i]._cells[0]) {
            const cellValue = rows[i]._cells[0]?._value?.model?.value;
        
            // Log the cell value for debugging
            console.log(`Row ${i} cell value:`, safeStringify(cellValue));
        
            // Ensure cellValue is a string
            if (cellValue && typeof cellValue === 'string') {
                const charArray = Array.from(cellValue);
        
                if (charArray[0] === '$' && charArray[1] === '$') {
                    rows[i]._cells[0].value = ''; // Make the cell blank
                }
            }
        
            const row = worksheet.getRow(i + 1); // Adjust index based on your worksheet API
            row.getCell(1).value = rows[i]._cells[0]?.value || ''; // Update the cell with the new value or an empty string
            row.commit(); // Commit the changes (if needed by the library you are using)
        } else {
            // Log or handle the case where rows[i] or _cells[0] is undefined
            console.log(`Skipping row ${i} due to undefined or missing _cells property.`);
        }
    }
      workbookData.worksheets[wkey] = worksheet;
      setWorkbookData(workbookData);
      setSheetName(worksheet.name);
      return (type);
    }
    function getSafeCell(row, index) {
        try {
          if (row && row._cells && row._cells[index] && row._cells[index]._value && row._cells[index]._value.model) {
            return row._cells[index];
          }
        } catch (error) {
          console.error(`Error accessing cell at index ${index}:`, error);
        }
        return null;
      }
      function getCellAddress(cell, defaultAddress) {
        if (cell && cell._address) {
            return cell._address;
        } else {
            console.warn(`Cell address is null or undefined, using default: ${defaultAddress}`);
            return defaultAddress;
        }
    }
      function deleteRowsBetweenMarkers(worksheet) {
        for (let i = 1; i <= worksheet.rowCount; i++) {
          let row = worksheet.getRow(i);
          let cell = getSafeCell(row, 0);
      
          if (cell && cell._value.model.value === "$$b_str") {
            // Make the row with "$$b_str" and the next 3 rows blank
            for (let j = 0; j < 4; j++) {
              let currentRow = worksheet.getRow(i + j);
              currentRow.eachCell({ includeEmpty: true }, (cell) => {
                cell.value = null;
              });
            }
          }
        }
      }
function updatedata2(wkey, worksheet2, beamStresses) {
  if (!workbookData) return;
  if (!worksheet2) {
      throw new Error("No worksheets found in the uploaded file");
  }

  const rowCount = worksheet2.rowCount;
  let lastRowNumber = rowCount;

  for (let i = 0; i < beamStresses.BeamStress.DATA.length; i++) {
      const lastRow = worksheet2.getRow(lastRowNumber);
      console.log(`Last row (${lastRowNumber}):`, lastRow);

      const nextRowNumber = lastRowNumber + 1;
      const nextRow = worksheet2.getRow(nextRowNumber);

      let cell3Value = worksheet2.getRow(4).getCell(3).value;

      nextRow.getCell(1).value = beamStresses.BeamStress.DATA[i][1];
      if (cell3Value === '-') {
          let value = beamStresses.BeamStress.DATA[i][3];
          value = value.replace(/\[.*?\]/g, '');
          nextRow.getCell(2).value = value.trim();
      } else {
          nextRow.getCell(2).value = beamStresses.BeamStress.DATA[i][5];
      }
      nextRow.getCell(3).value = cell3Value === '-' ? '-' : 'Girder';
      nextRow.getCell(4).value = 'Tension';
      nextRow.getCell(5).value = selectedName;
      nextRow.getCell(8).value = changeSignAndFormat(beamStresses.BeamStress.DATA[i][12]);
      nextRow.getCell(9).value = changeSignAndFormat(beamStresses.BeamStress.DATA[i][15]);
      nextRow.getCell(10).value = changeSignAndFormat(beamStresses.BeamStress.DATA[i][13]);
      nextRow.getCell(11).value = changeSignAndFormat(beamStresses.BeamStress.DATA[i][14]);
      nextRow.getCell(6).value = calculateAverage(nextRow.getCell(8).value, nextRow.getCell(10).value);
      nextRow.getCell(7).value = calculateAverage(nextRow.getCell(9).value, nextRow.getCell(11).value);
      nextRow.getCell(12).value = findMinValue([nextRow.getCell(8), nextRow.getCell(9), nextRow.getCell(10), nextRow.getCell(11)]);
      nextRow.getCell(13).value = '0';
      nextRow.getCell(14).value = nextRow.getCell(12).value > 0 ? 'OK' : 'NG';

      console.log(`Next row (${nextRowNumber}):`, nextRow);

      lastRowNumber = nextRowNumber;
      nextRow.commit();

      // Additional row logic if cell3Value !== '-'
      if (cell3Value !== '-') {
          const nextRowNumber2 = lastRowNumber + 1;
          const nextRow2 = worksheet2.getRow(nextRowNumber2);

          nextRow2.getCell(1).value = beamStresses.BeamStress.DATA[i][1];
          nextRow2.getCell(2).value = beamStresses.BeamStress.DATA[i][5];
          nextRow2.getCell(3).value = 'Slab';
          nextRow2.getCell(4).value = 'Tension';
          nextRow2.getCell(5).value = selectedName;
          nextRow2.getCell(8).value = changeSignAndFormat(beamStresses.BeamStress.DATA[i][12]);
          nextRow2.getCell(9).value = changeSignAndFormat(beamStresses.BeamStress.DATA[i][15]);
          nextRow2.getCell(10).value = changeSignAndFormat(beamStresses.BeamStress.DATA[i][13]);
          nextRow2.getCell(11).value = changeSignAndFormat(beamStresses.BeamStress.DATA[i][14]);
          nextRow2.getCell(6).value = calculateAverage(nextRow2.getCell(8).value, nextRow2.getCell(10).value);
          nextRow2.getCell(7).value = calculateAverage(nextRow2.getCell(9).value, nextRow2.getCell(11).value);
          nextRow2.getCell(12).value = findMinValue([nextRow2.getCell(8), nextRow2.getCell(9), nextRow2.getCell(10), nextRow2.getCell(11)]);
          nextRow2.getCell(13).value = '0';
          nextRow2.getCell(14).value = nextRow2.getCell(12).value > 0 ? 'OK' : 'NG';

          console.log(`Next row (${nextRowNumber2}):`, nextRow2);
          nextRow2.commit();
          lastRowNumber = nextRowNumber2; // Update lastRowNumber to include this new row
      }
  }
}


    function safeStringify(obj) {
        const cache = new Set();
        return JSON.stringify(obj, (key, value) => {
            if (typeof value === 'object' && value !== null) {
                if (cache.has(value)) {
                    return; // Duplicate reference found, discard key
                }
                cache.add(value); // Store value in our collection
            }
            return value;
        });
    }
    function changeSignAndFormat(value) {
        // Convert the value to a number, change its sign, and format it to two decimal points
        return (-parseFloat(value)).toFixed(2);
    }
  
    function calculateAverage(value1, value2) {
        return ((parseFloat(value1) + parseFloat(value2)) / 2).toFixed(2);
    }
    function findMinValue(cells) {
        return Math.min(...cells.map(cell => parseFloat(cell.value))).toFixed(2);
    }
    
    async function updatedata3(wkey, worksheet3, name,type) {
      console.log(allMatches);
      if (!workbookData) return;
      if (!worksheet3) {
        throw new Error("No worksheets found in the uploaded file");
      }
      console.log(mu_pos[wkey]);
      console.log(type);
      // let type = type.[[pr]]
    
      const formatCell = (cell, value, bgColor = 'FFADD8E6', textColor = 'FF000000', bold = true) => {
        cell.value = value;
        cell.font = { bold: bold, color: { argb: textColor } };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bgColor } };
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        };
      };
      console.log(type);
    
      const formatNumberCell = (cell, value) => {
        cell.value = parseFloat(value).toFixed(3);
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
      };

  
    
      const formatResultCell = (cell, value) => {
        cell.value = value;
        cell.font = { color: { argb: value === "OK" ? 'FF00008B' : 'FFFF0000' } }; // Dark blue for OK, Red for NG
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
      };
      worksheet3.getColumn('A').width = 18;
      // Merge and format cells in the first two rows
      worksheet3.mergeCells('A1:A2');
      formatCell(worksheet3.getCell('A1'), 'Element');
      // worksheet3.mergeCells('B1:G1');
      // formatCell(worksheet3.getCell('B1'), name);
      worksheet3.mergeCells('B1:G1');

// Create the dropdown in the merged cell
const dropdownCell = worksheet3.getCell('B1');
console.log(allMatches);
let formattedMatches = allMatches.join(',');
let dropdownValues = `"${formattedMatches}"`;
console.log(dropdownValues);
console.log(formattedMatches);
dropdownCell.dataValidation = {
    type: 'list',
    allowBlank: true,
    formulae: [`${dropdownValues}`],
    showDropDown: true,
};
dropdownCell.value = allMatches.length > 0 ? allMatches[0] : "Default Value";


if (allMatches.length > 0) {
} else {
    dropdownCell.value = "No Matches Available"; // Fallback if array is empty
}

// Use the original array `allMatches` for indexed mapping
let indexedDropdown = allMatches.map((val, index) => `${index + 1}. ${val}`);
allMatches.forEach((val, index) => {
  worksheet3.getCell(`A${100 + index}`).value = val;
});
console.log(mu_pos);

let muPosKeys = Object.keys(mu_pos); 

muPosKeys.forEach((key, index) => {
 let Key = Number(key);

  // Process the values based on the key
  worksheet3.getCell(`B${100 + index}`).value = mu_pos[Key] || 0;
  worksheet3.getCell(`C${100 + index}`).value = mr_old_pos[Key] || 0;
  worksheet3.getCell(`D${100 + index}`).value = mr_new_pos[Key] || 0;
  worksheet3.getCell(`E${100 + index}`).value = mu_neg[Key] || 0;
  worksheet3.getCell(`F${100 + index}`).value = mr_old_neg[Key] || 0;
  worksheet3.getCell(`G${100 + index}`).value = mr_new_neg[Key] || 0;
  worksheet3.getCell(`H${100 + index}`).value = sm_old[Key] || 0;
  if (sp === 'aa1') {
    worksheet3.getCell(`I${100 + index}`).value = "NA";
  } else {
    worksheet3.getCell(`I${100 + index}`).value = sm_new[Key] || 0 ;
  }
  worksheet3.getCell(`J${100 + index}`).value = s_m[Key] || 0;
  worksheet3.getCell(`K${100 + index}`).value = sn_old[Key] || 0;
  if (sp === 'aa1') {
  worksheet3.getCell(`L${100 + index}`).value = "NA";
  } else {
    worksheet3.getCell(`L${100 + index}`).value = sn_new[Key] || 0;
  }
  worksheet3.getCell(`M${100 + index}`).value = s_n[Key] || 0;
  worksheet3.getCell(`N${100 + index}`).value = dc_old[Key] || 0;
  worksheet3.getCell(`O${100 + index}`).value = smax_old[Key] || 0;
  worksheet3.getCell(`P${100 + index}`).value = suse[Key] || 0;
  if ( cvr === 'aa2') {
    worksheet3.getCell(`Q${100 + index}`).value = "NA";
  } else {
   worksheet3.getCell(`Q${100 + index}`).value = dc_new[Key];
  }
  worksheet3.getCell(`R${100 + index}`).value = smax_new[Key] || 0;
  worksheet3.getCell(`S${100 + index}`).value = beta_mo[Key] || 0;
  worksheet3.getCell(`T${100 + index}`).value = theta_mo[Key] || 0;
  worksheet3.getCell(`U${100 + index}`).value = Av_f[Key] || 0;
  worksheet3.getCell(`V${100 + index}`).value = Avr_old[Key] || 0;
  worksheet3.getCell(`W${100 + index}`).value = vu[Key] || 0;
  worksheet3.getCell(`X${100 + index}`).value = vr_old[Key] || 0;
  worksheet3.getCell(`Y${100 + index}`).value = beta_m[Key] || 0;
  worksheet3.getCell(`Z${100 + index}`).value = theta_m[Key] || 0;
  worksheet3.getCell(`AA${100 + index}`).value = Av_f[Key] || 0;
  worksheet3.getCell(`AB${100 + index}`).value = Avr_new[Key] || 0;
  worksheet3.getCell(`AC${100 + index}`).value = vu[Key] || 0;
  worksheet3.getCell(`AD${100 + index}`).value = vr_new[Key] || 0;
  worksheet3.getCell(`AE${100 + index}`).value = beta_no[Key] || 0;
  worksheet3.getCell(`AF${100 + index}`).value = theta_no[Key] || 0;
  worksheet3.getCell(`AG${100 + index}`).value = Av_f[Key] || 0;
  worksheet3.getCell(`AH${100 + index}`).value = Avr_old_n[Key] || 0;
  worksheet3.getCell(`AI${100 + index}`).value = vu[Key] || 0;
  worksheet3.getCell(`AJ${100 + index}`).value = vr_old_n[Key] || 0;
  worksheet3.getCell(`AK${100 + index}`).value = beta_n[Key] || 0;
  worksheet3.getCell(`AL${100 + index}`).value = theta_n[Key] || 0;
  worksheet3.getCell(`AM${100 + index}`).value = Av_f[Key] || 0;
  worksheet3.getCell(`AN${100 + index}`).value = Avr_new_n[Key] || 0;
  worksheet3.getCell(`AO${100 + index}`).value = vu[Key] || 0;
  worksheet3.getCell(`AP${100 + index}`).value = vr_new_n[Key] || 0; 
  if (type == "Box") {
    worksheet3.getCell(`AQ${100 + index}`).value = dc_old_2[Key] || 0;
    worksheet3.getCell(`AR${100 + index}`).value = smax_old_2[Key] || 0;
    worksheet3.getCell(`AS${100 + index}`).value = suse2[Key] || 0;
    if (cvr === 'aa2') {
      worksheet3.getCell(`AT${100 + index}`).value = "NA";
    } else {
    worksheet3.getCell(`AT${100 + index}`).value = dc_new_2[Key];
    }
    worksheet3.getCell(`AU${100 + index}`).value = smax_new_2[Key] || 0;
  }
});
worksheet3.getCell('B5').value = { formula: `=INDEX(B100:B${99 + allMatches.length}, MATCH($B$1, A100:A${99 + allMatches.length}, 0))` };
worksheet3.getCell('B5').alignment = { horizontal: 'center', vertical: 'middle' };

// Set formula and center alignment for B6
worksheet3.getCell('B6').value = { formula: `=INDEX(C100:C${99 + allMatches.length}, MATCH($B$1, A100:A${99 + allMatches.length}, 0))` };
worksheet3.getCell('B6').alignment = { horizontal: 'center', vertical: 'middle' };

// Set formula and center alignment for E5
worksheet3.getCell('E5').value = { formula: `=INDEX(B100:B${99 + allMatches.length}, MATCH($B$1, A100:A${99 + allMatches.length}, 0))` };
worksheet3.getCell('E5').alignment = { horizontal: 'center', vertical: 'middle' };

// Set formula and center alignment for E6
worksheet3.getCell('E6').value = { formula: `=INDEX(D100:D${99 + allMatches.length}, MATCH($B$1, A100:A${99 + allMatches.length}, 0))` };
worksheet3.getCell('E6').alignment = { horizontal: 'center', vertical: 'middle' };

// Set formula and center alignment for D6
worksheet3.getCell('D6').value = { formula: `=IF(ABS(B6)<ABS(B5),"NG","OK")` };
worksheet3.getCell('D6').alignment = { horizontal: 'center', vertical: 'middle' };

// Set formula and center alignment for G6
worksheet3.getCell('G6').value = { formula: `=IF(ABS(E6)<ABS(E5),"NG","OK")` };
worksheet3.getCell('G6').alignment = { horizontal: 'center', vertical: 'middle' };
// Set formula and center alignment for B9
worksheet3.getCell('B9').value = { formula: `=INDEX(E100:E${99 + allMatches.length}, MATCH($B$1, A100:A${99 + allMatches.length}, 0))` };
worksheet3.getCell('B9').alignment = { horizontal: 'center', vertical: 'middle' };

// Set formula and center alignment for B10
worksheet3.getCell('B10').value = { formula: `=INDEX(F100:F${99 + allMatches.length}, MATCH($B$1, A100:A${99 + allMatches.length}, 0))` };
worksheet3.getCell('B10').alignment = { horizontal: 'center', vertical: 'middle' };

// Set formula and center alignment for E9
worksheet3.getCell('E9').value = { formula: `=INDEX(E100:E${99 + allMatches.length}, MATCH($B$1, A100:A${99 + allMatches.length}, 0))` };
worksheet3.getCell('E9').alignment = { horizontal: 'center', vertical: 'middle' };

// Set formula and center alignment for E10
worksheet3.getCell('E10').value = { formula: `=INDEX(G100:G${99 + allMatches.length}, MATCH($B$1, A100:A${99 + allMatches.length}, 0))` };
worksheet3.getCell('E10').alignment = { horizontal: 'center', vertical: 'middle' };

// Set formula and center alignment for D10
worksheet3.getCell('D10').value = { formula: `=IF(ABS(B10)<ABS(B9),"NG","OK")` };
worksheet3.getCell('D10').alignment = { horizontal: 'center', vertical: 'middle' };

// Set formula and center alignment for G10
worksheet3.getCell('G10').value = { formula: `=IF(ABS(E10)<ABS(E9),"NG","OK")` };
worksheet3.getCell('G10').alignment = { horizontal: 'center', vertical: 'middle' };


// Center-align and set formula for B12
worksheet3.getCell('B12').value = { formula: `=INDEX(H100:H${99 + allMatches.length}, MATCH($B$1, A100:A${99 + allMatches.length}, 0))` };
worksheet3.getCell('B12').alignment = { vertical: 'middle', horizontal: 'center' };

// Center-align and set formula for E12
worksheet3.getCell('E12').value = { formula: `=INDEX(I100:I${99 + allMatches.length}, MATCH($B$1, A100:A${99 + allMatches.length}, 0))` };
worksheet3.getCell('E12').alignment = { vertical: 'middle', horizontal: 'center' };

// Center-align and set formula for B13
worksheet3.getCell('B13').value = { formula: `=INDEX(J100:J${99 + allMatches.length}, MATCH($B$1, A100:A${99 + allMatches.length}, 0))` };
worksheet3.getCell('B13').alignment = { vertical: 'middle', horizontal: 'center' };

// Center-align and set formula for E13
worksheet3.getCell('E13').value = { formula: `=INDEX(J100:J${99 + allMatches.length}, MATCH($B$1, A100:A${99 + allMatches.length}, 0))` };
worksheet3.getCell('E13').alignment = { vertical: 'middle', horizontal: 'center' };

// Center-align and set formula for D13
worksheet3.getCell('D13').value = { formula: `=IF(ABS(B12)<ABS(B13),"NG","OK")` };
worksheet3.getCell('D13').alignment = { vertical: 'middle', horizontal: 'center' };

// Center-align and set formula for G13
if ( sp === 'ca1') {
worksheet3.getCell('G13').value = { formula: `=IF(ABS(E12)<ABS(E13),"NG","OK")` };
worksheet3.getCell('G13').alignment = { vertical: 'middle', horizontal: 'center' };
} else {
  worksheet3.getCell('G13').value = "NA" ;
worksheet3.getCell('G13').alignment = { vertical: 'middle', horizontal: 'center' };
}

// Center-align and set formula for B15
worksheet3.getCell('B15').value = { formula: `=INDEX(K100:K${99 + allMatches.length}, MATCH($B$1, A100:A${99 + allMatches.length}, 0))` };
worksheet3.getCell('B15').alignment = { vertical: 'middle', horizontal: 'center' };

// Center-align and set formula for E15
worksheet3.getCell('E15').value = { formula: `=INDEX(L100:L${99 + allMatches.length}, MATCH($B$1, A100:A${99 + allMatches.length}, 0))` };
worksheet3.getCell('E15').alignment = { vertical: 'middle', horizontal: 'center' };

// Center-align and set formula for B16
worksheet3.getCell('B16').value = { formula: `=INDEX(M100:M${99 + allMatches.length}, MATCH($B$1, A100:A${99 + allMatches.length}, 0))` };
worksheet3.getCell('B16').alignment = { vertical: 'middle', horizontal: 'center' };

// Center-align and set formula for E16
worksheet3.getCell('E16').value = { formula: `=INDEX(M100:M${99 + allMatches.length}, MATCH($B$1, A100:A${99 + allMatches.length}, 0))` };
worksheet3.getCell('E16').alignment = { vertical: 'middle', horizontal: 'center' };

// Center-align and set formula for D16
worksheet3.getCell('D16').value = { formula: `=IF(ABS(B15)<ABS(B16),"NG","OK")` };
worksheet3.getCell('D16').alignment = { vertical: 'middle', horizontal: 'center' };

// Center-align and set formula for G16
if ( sp === 'ca1') {
worksheet3.getCell('G16').value = { formula: `=IF(ABS(E15)<ABS(E16),"NG","OK")` };
worksheet3.getCell('G16').alignment = { vertical: 'middle', horizontal: 'center' };
} else {
worksheet3.getCell('G16').value = "NA";
worksheet3.getCell('G16').alignment = { vertical: 'middle', horizontal: 'center' };
}

// Center-align and set formula for B18
worksheet3.getCell('B18').value = { formula: `=INDEX(N100:N${99 + allMatches.length}, MATCH($B$1, A100:A${99 + allMatches.length}, 0))` };
worksheet3.getCell('B18').alignment = { vertical: 'middle', horizontal: 'center' };

// Center-align and set formula for E18
worksheet3.getCell('E18').value = { formula: `=INDEX(Q100:Q${99 + allMatches.length}, MATCH($B$1, A100:A${99 + allMatches.length}, 0))` };
worksheet3.getCell('E18').alignment = { vertical: 'middle', horizontal: 'center' };

// Center-align and set formula for B19
worksheet3.getCell('B19').value = { formula: `=INDEX(O100:O${99 + allMatches.length}, MATCH($B$1, A100:A${99 + allMatches.length}, 0))` };
worksheet3.getCell('B19').alignment = { vertical: 'middle', horizontal: 'center' };

// Center-align and set formula for E19
worksheet3.getCell('E19').value = { formula: `=INDEX(R100:R${99 + allMatches.length}, MATCH($B$1, A100:A${99 + allMatches.length}, 0))` };
worksheet3.getCell('E19').alignment = { vertical: 'middle', horizontal: 'center' };

// Center-align and set formula for B20
worksheet3.getCell('B20').value = { formula: `=INDEX(P100:P${99 + allMatches.length}, MATCH($B$1, A100:A${99 + allMatches.length}, 0))` };
worksheet3.getCell('B20').alignment = { vertical: 'middle', horizontal: 'center' };

// Center-align and set formula for E20
worksheet3.getCell('E20').value = { formula: `=INDEX(P100:P${99 + allMatches.length}, MATCH($B$1, A100:A${99 + allMatches.length}, 0))` };
worksheet3.getCell('E20').alignment = { vertical: 'middle', horizontal: 'center' };

// Center-align and set formula for D20
worksheet3.getCell('D20').value = { formula: `=IF(ABS(B19)<ABS(B20),"NG","OK")` };
worksheet3.getCell('D20').alignment = { vertical: 'middle', horizontal: 'center' };

// Center-align and set formula for G20
if ( cvr === 'ca2') {
worksheet3.getCell('G20').value = { formula: `=IF(ABS(E19)<ABS(E20),"NG","OK")` };
worksheet3.getCell('G20').alignment = { vertical: 'middle', horizontal: 'center' };
} else {
  worksheet3.getCell('G20').value = "NA";
worksheet3.getCell('G20').alignment = { vertical: 'middle', horizontal: 'center' };
}

if (type == 'Composite') {
  // Set formulas and center-align cells in the Composite type case
  worksheet3.getCell('B22').value = { formula: `=INDEX(S100:S${99 + allMatches.length}, MATCH($B$1, A100:A${99 + allMatches.length}, 0))` };
  worksheet3.getCell('B22').alignment = { vertical: 'middle', horizontal: 'center' };

  worksheet3.getCell('E22').value = { formula: `=INDEX(Y100:Y${99 + allMatches.length}, MATCH($B$1, A100:A${99 + allMatches.length}, 0))` };
  worksheet3.getCell('E22').alignment = { vertical: 'middle', horizontal: 'center' };

  worksheet3.getCell('E23').value = { formula: `=INDEX(Z100:Z${99 + allMatches.length}, MATCH($B$1, A100:A${99 + allMatches.length}, 0))` };
  worksheet3.getCell('E23').alignment = { vertical: 'middle', horizontal: 'center' };

  worksheet3.getCell('B23').value = { formula: `=INDEX(T100:T${99 + allMatches.length}, MATCH($B$1, A100:A${99 + allMatches.length}, 0))` };
  worksheet3.getCell('B23').alignment = { vertical: 'middle', horizontal: 'center' };

  worksheet3.getCell('B24').value = { formula: `=INDEX(U100:U${99 + allMatches.length}, MATCH($B$1, A100:A${99 + allMatches.length}, 0))` };
  worksheet3.getCell('B24').alignment = { vertical: 'middle', horizontal: 'center' };

  worksheet3.getCell('E24').value = { formula: `=INDEX(AA100:AA${99 + allMatches.length}, MATCH($B$1, A100:A${99 + allMatches.length}, 0))` };
  worksheet3.getCell('E24').alignment = { vertical: 'middle', horizontal: 'center' };

  worksheet3.getCell('E25').value = { formula: `=INDEX(AB100:AB${99 + allMatches.length}, MATCH($B$1, A100:A${99 + allMatches.length}, 0))` };
  worksheet3.getCell('E25').alignment = { vertical: 'middle', horizontal: 'center' };

  worksheet3.getCell('B25').value = { formula: `=INDEX(V100:V${99 + allMatches.length}, MATCH($B$1, A100:A${99 + allMatches.length}, 0))` };
  worksheet3.getCell('B25').alignment = { vertical: 'middle', horizontal: 'center' };

  worksheet3.getCell('E26').value = { formula: `=INDEX(AC100:AC${99 + allMatches.length}, MATCH($B$1, A100:A${99 + allMatches.length}, 0))` };
  worksheet3.getCell('E26').alignment = { vertical: 'middle', horizontal: 'center' };

  worksheet3.getCell('B26').value = { formula: `=INDEX(W100:W${99 + allMatches.length}, MATCH($B$1, A100:A${99 + allMatches.length}, 0))` };
  worksheet3.getCell('B26').alignment = { vertical: 'middle', horizontal: 'center' };

  worksheet3.getCell('E27').value = { formula: `=INDEX(AD100:AD${99 + allMatches.length}, MATCH($B$1, A100:A${99 + allMatches.length}, 0))` };
  worksheet3.getCell('E27').alignment = { vertical: 'middle', horizontal: 'center' };

  worksheet3.getCell('B27').value = { formula: `=INDEX(X100:X${99 + allMatches.length}, MATCH($B$1, A100:A${99 + allMatches.length}, 0))` };
  worksheet3.getCell('B27').alignment = { vertical: 'middle', horizontal: 'center' };

  // Set formulas for NG/OK evaluations and center-align
  worksheet3.getCell('D25').value = { formula: `=IF(ABS(B24)<ABS(B25),"NG","OK")` };
  worksheet3.getCell('D25').alignment = { vertical: 'middle', horizontal: 'center' };

  worksheet3.getCell('G25').value = { formula: `=IF(ABS(E24)<ABS(E25),"NG","OK")` };
  worksheet3.getCell('G25').alignment = { vertical: 'middle', horizontal: 'center' };

  worksheet3.getCell('D27').value = { formula: `=IF(ABS(B27)<ABS(B26),"NG","OK")` };
  worksheet3.getCell('D27').alignment = { vertical: 'middle', horizontal: 'center' };

  worksheet3.getCell('G27').value = { formula: `=IF(ABS(E27)<ABS(E26),"NG","OK")` };
  worksheet3.getCell('G27').alignment = { vertical: 'middle', horizontal: 'center' };

  worksheet3.getCell('B29').value = { formula: `=INDEX(AE100:AE${99 + allMatches.length}, MATCH($B$1, A100:A${99 + allMatches.length}, 0))` };
  worksheet3.getCell('B29').alignment = { vertical: 'middle', horizontal: 'center' };

  worksheet3.getCell('E29').value = { formula: `=INDEX(AK100:AK${99 + allMatches.length}, MATCH($B$1, A100:A${99 + allMatches.length}, 0))` };
  worksheet3.getCell('E29').alignment = { vertical: 'middle', horizontal: 'center' };

  worksheet3.getCell('E30').value = { formula: `=INDEX(AL100:AL${99 + allMatches.length}, MATCH($B$1, A100:A${99 + allMatches.length}, 0))` };
  worksheet3.getCell('E30').alignment = { vertical: 'middle', horizontal: 'center' };

  worksheet3.getCell('B30').value = { formula: `=INDEX(AF100:AF${99 + allMatches.length}, MATCH($B$1, A100:A${99 + allMatches.length}, 0))` };
  worksheet3.getCell('B30').alignment = { vertical: 'middle', horizontal: 'center' };

  worksheet3.getCell('B31').value = { formula: `=INDEX(AM100:AM${99 + allMatches.length}, MATCH($B$1, A100:A${99 + allMatches.length}, 0))` };
  worksheet3.getCell('B31').alignment = { vertical: 'middle', horizontal: 'center' };

  worksheet3.getCell('E31').value = { formula: `=INDEX(AG100:AG${99 + allMatches.length}, MATCH($B$1, A100:A${99 + allMatches.length}, 0))` };
  worksheet3.getCell('E31').alignment = { vertical: 'middle', horizontal: 'center' };

  worksheet3.getCell('E32').value = { formula: `=INDEX(AH100:AH${99 + allMatches.length}, MATCH($B$1, A100:A${99 + allMatches.length}, 0))` };
  worksheet3.getCell('E32').alignment = { vertical: 'middle', horizontal: 'center' };

  worksheet3.getCell('B32').value = { formula: `=INDEX(AN100:AN${99 + allMatches.length}, MATCH($B$1, A100:A${99 + allMatches.length}, 0))` };
  worksheet3.getCell('B32').alignment = { vertical: 'middle', horizontal: 'center' };

  worksheet3.getCell('E33').value = { formula: `=INDEX(AI100:AI${99 + allMatches.length}, MATCH($B$1, A100:A${99 + allMatches.length}, 0))` };
  worksheet3.getCell('E33').alignment = { vertical: 'middle', horizontal: 'center' };

  worksheet3.getCell('B33').value = { formula: `=INDEX(AO100:AO${99 + allMatches.length}, MATCH($B$1, A100:A${99 + allMatches.length}, 0))` };
  worksheet3.getCell('B33').alignment = { vertical: 'middle', horizontal: 'center' };

  worksheet3.getCell('E34').value = { formula: `=INDEX(AJ100:AJ${99 + allMatches.length}, MATCH($B$1, A100:A${99 + allMatches.length}, 0))` };
  worksheet3.getCell('E34').alignment = { vertical: 'middle', horizontal: 'center' };

  worksheet3.getCell('B34').value = { formula: `=INDEX(AP100:AP${99 + allMatches.length}, MATCH($B$1, A100:A${99 + allMatches.length}, 0))` };
  worksheet3.getCell('B34').alignment = { vertical: 'middle', horizontal: 'center' };

  // Updated formula for G34 without the AND condition, and center-align
  worksheet3.getCell('G34').value = { formula: `=IF(ABS(E34)<ABS(E33),"NG","OK")` };
  worksheet3.getCell('G34').alignment = { vertical: 'middle', horizontal: 'center' };
}

else {
  worksheet3.getCell('B22').value = { formula: `=INDEX(AQ100:AQ${99 + allMatches.length}, MATCH($B$1, A100:A${99 + allMatches.length}, 0))` };
  worksheet3.getCell('B22').alignment = { vertical: 'middle', horizontal: 'center' };

  worksheet3.getCell('E22').value = { formula: `=INDEX(AT100:AT${99 + allMatches.length}, MATCH($B$1, A100:A${99 + allMatches.length}, 0))` };
  worksheet3.getCell('E22').alignment = { vertical: 'middle', horizontal: 'center' };

  worksheet3.getCell('E23').value = { formula: `=INDEX(AU100:AU${99 + allMatches.length}, MATCH($B$1, A100:A${99 + allMatches.length}, 0))` };
  worksheet3.getCell('E23').alignment = { vertical: 'middle', horizontal: 'center' };

  worksheet3.getCell('B23').value = { formula: `=INDEX(AR100:AR${99 + allMatches.length}, MATCH($B$1, A100:A${99 + allMatches.length}, 0))` };
  worksheet3.getCell('B23').alignment = { vertical: 'middle', horizontal: 'center' };

  worksheet3.getCell('E24').value = { formula: `=INDEX(AS100:AS${99 + allMatches.length}, MATCH($B$1, A100:A${99 + allMatches.length}, 0))` };
  worksheet3.getCell('E24').alignment = { vertical: 'middle', horizontal: 'center' };

  worksheet3.getCell('B24').value = { formula: `=INDEX(AS100:AS${99 + allMatches.length}, MATCH($B$1, A100:A${99 + allMatches.length}, 0))` };
  worksheet3.getCell('B24').alignment = { vertical: 'middle', horizontal: 'center' };

  // Set formulas for NG/OK evaluations and center-align
  worksheet3.getCell('D24').value = { formula: `=IF(ABS(B23)<ABS(B24),"NG","OK")` };
  worksheet3.getCell('D24').alignment = { vertical: 'middle', horizontal: 'center' };
  if (cvr == 'ca2') {
    worksheet3.getCell('G24').value = { formula: `=IF(ABS(E23)<ABS(E24),"NG","OK")` };
    worksheet3.getCell('G24').alignment = { vertical: 'middle', horizontal: 'center' };
  }
  else {
    worksheet3.getCell('G24').value = "NA";
    worksheet3.getCell('G24').alignment = { vertical: 'middle', horizontal: 'center' };
  }

  

  worksheet3.getCell('B26').value = { formula: `=INDEX(S100:S${99 + allMatches.length}, MATCH($B$1, A100:A${99 + allMatches.length}, 0))` };
  worksheet3.getCell('B26').alignment = { vertical: 'middle', horizontal: 'center' };

  worksheet3.getCell('E26').value = { formula: `=INDEX(Y100:Y${99 + allMatches.length}, MATCH($B$1, A100:A${99 + allMatches.length}, 0))` };
  worksheet3.getCell('E26').alignment = { vertical: 'middle', horizontal: 'center' };

  worksheet3.getCell('E27').value = { formula: `=INDEX(Z100:Z${99 + allMatches.length}, MATCH($B$1, A100:A${99 + allMatches.length}, 0))` };
  worksheet3.getCell('E27').alignment = { vertical: 'middle', horizontal: 'center' };

  worksheet3.getCell('B27').value = { formula: `=INDEX(T100:T${99 + allMatches.length}, MATCH($B$1, A100:A${99 + allMatches.length}, 0))` };
  worksheet3.getCell('B27').alignment = { vertical: 'middle', horizontal: 'center' };

  worksheet3.getCell('B28').value = { formula: `=INDEX(U100:U${99 + allMatches.length}, MATCH($B$1, A100:A${99 + allMatches.length}, 0))` };
  worksheet3.getCell('B28').alignment = { vertical: 'middle', horizontal: 'center' };

  worksheet3.getCell('E28').value = { formula: `=INDEX(AA100:AA${99 + allMatches.length}, MATCH($B$1, A100:A${99 + allMatches.length}, 0))` };
  worksheet3.getCell('E28').alignment = { vertical: 'middle', horizontal: 'center' };

  worksheet3.getCell('E29').value = { formula: `=INDEX(AB100:AB${99 + allMatches.length}, MATCH($B$1, A100:A${99 + allMatches.length}, 0))` };
  worksheet3.getCell('E29').alignment = { vertical: 'middle', horizontal: 'center' };

  worksheet3.getCell('B29').value = { formula: `=INDEX(V100:V${99 + allMatches.length}, MATCH($B$1, A100:A${99 + allMatches.length}, 0))` };
  worksheet3.getCell('B29').alignment = { vertical: 'middle', horizontal: 'center' };

  worksheet3.getCell('E30').value = { formula: `=INDEX(AC100:AC${99 + allMatches.length}, MATCH($B$1, A100:A${99 + allMatches.length}, 0))` };
  worksheet3.getCell('E30').alignment = { vertical: 'middle', horizontal: 'center' };

  worksheet3.getCell('B30').value = { formula: `=INDEX(W100:W${99 + allMatches.length}, MATCH($B$1, A100:A${99 + allMatches.length}, 0))` };
  worksheet3.getCell('B30').alignment = { vertical: 'middle', horizontal: 'center' };

  worksheet3.getCell('E31').value = { formula: `=INDEX(AD100:AD${99 + allMatches.length}, MATCH($B$1, A100:A${99 + allMatches.length}, 0))` };
  worksheet3.getCell('E31').alignment = { vertical: 'middle', horizontal: 'center' };

  worksheet3.getCell('B31').value = { formula: `=INDEX(X100:X${99 + allMatches.length}, MATCH($B$1, A100:A${99 + allMatches.length}, 0))` };
  worksheet3.getCell('B31').alignment = { vertical: 'middle', horizontal: 'center' };

  // Set formulas for NG/OK evaluations and center-align
  worksheet3.getCell('D29').value = { formula: `=IF(ABS(B28)<ABS(B29),"NG","OK")` };
  worksheet3.getCell('D29').alignment = { vertical: 'middle', horizontal: 'center' };

  worksheet3.getCell('G29').value = { formula: `=IF(ABS(E28)<ABS(E29),"NG","OK")` };
  worksheet3.getCell('G29').alignment = { vertical: 'middle', horizontal: 'center' };

  worksheet3.getCell('D31').value = { formula: `=IF(ABS(B31)<ABS(B30),"NG","OK")` };
  worksheet3.getCell('D31').alignment = { vertical: 'middle', horizontal: 'center' };

  worksheet3.getCell('G31').value = { formula: `=IF(ABS(E31)<ABS(E30),"NG","OK")` };
  worksheet3.getCell('G31').alignment = { vertical: 'middle', horizontal: 'center' };

  worksheet3.getCell('B33').value = { formula: `=INDEX(AE100:AE${99 + allMatches.length}, MATCH($B$1, A100:A${99 + allMatches.length}, 0))` };
  worksheet3.getCell('B33').alignment = { vertical: 'middle', horizontal: 'center' };

  worksheet3.getCell('E33').value = { formula: `=INDEX(AK100:AK${99 + allMatches.length}, MATCH($B$1, A100:A${99 + allMatches.length}, 0))` };
  worksheet3.getCell('E33').alignment = { vertical: 'middle', horizontal: 'center' };

  worksheet3.getCell('E34').value = { formula: `=INDEX(AL100:AL${99 + allMatches.length}, MATCH($B$1, A100:A${99 + allMatches.length}, 0))` };
  worksheet3.getCell('E34').alignment = { vertical: 'middle', horizontal: 'center' };

  worksheet3.getCell('B34').value = { formula: `=INDEX(AF100:AF${99 + allMatches.length}, MATCH($B$1, A100:A${99 + allMatches.length}, 0))` };
  worksheet3.getCell('B34').alignment = { vertical: 'middle', horizontal: 'center' };

  worksheet3.getCell('B35').value = { formula: `=INDEX(AM100:AM${99 + allMatches.length}, MATCH($B$1, A100:A${99 + allMatches.length}, 0))` };
  worksheet3.getCell('B35').alignment = { vertical: 'middle', horizontal: 'center' };

  worksheet3.getCell('E35').value = { formula: `=INDEX(AG100:AG${99 + allMatches.length}, MATCH($B$1, A100:A${99 + allMatches.length}, 0))` };
  worksheet3.getCell('E35').alignment = { vertical: 'middle', horizontal: 'center' };

  worksheet3.getCell('E36').value = { formula: `=INDEX(AH100:AH${99 + allMatches.length}, MATCH($B$1, A100:A${99 + allMatches.length}, 0))` };
  worksheet3.getCell('E36').alignment = { vertical: 'middle', horizontal: 'center' };

  worksheet3.getCell('B36').value = { formula: `=INDEX(AN100:AN${99 + allMatches.length}, MATCH($B$1, A100:A${99 + allMatches.length}, 0))` };
  worksheet3.getCell('B36').alignment = { vertical: 'middle', horizontal: 'center' };

  worksheet3.getCell('E37').value = { formula: `=INDEX(AI100:AI${99 + allMatches.length}, MATCH($B$1, A100:A${99 + allMatches.length}, 0))` };
  worksheet3.getCell('E37').alignment = { vertical: 'middle', horizontal: 'center' };

  worksheet3.getCell('B37').value = { formula: `=INDEX(AO100:AO${99 + allMatches.length}, MATCH($B$1, A100:A${99 + allMatches.length}, 0))` };
  worksheet3.getCell('B37').alignment = { vertical: 'middle', horizontal: 'center' };

  worksheet3.getCell('E38').value = { formula: `=INDEX(AJ100:AJ${99 + allMatches.length}, MATCH($B$1, A100:A${99 + allMatches.length}, 0))` };
  worksheet3.getCell('E38').alignment = { vertical: 'middle', horizontal: 'center' };

  worksheet3.getCell('B38').value = { formula: `=INDEX(AP100:AP${99 + allMatches.length}, MATCH($B$1, A100:A${99 + allMatches.length}, 0))` };
  worksheet3.getCell('B38').alignment = { vertical: 'middle', horizontal: 'center' };

  // Set formulas for NG/OK evaluations and center-align
  worksheet3.getCell('D36').value = { formula: `=IF(ABS(B35)<ABS(B36),"NG","OK")` };
  worksheet3.getCell('D36').alignment = { vertical: 'middle', horizontal: 'center' };

  worksheet3.getCell('G36').value = { formula: `=IF(ABS(E35)<ABS(E36),"NG","OK")` };
  worksheet3.getCell('G36').alignment = { vertical: 'middle', horizontal: 'center' };

  worksheet3.getCell('D38').value = { formula: `=IF(ABS(B38)<ABS(B37),"NG","OK")` };
  worksheet3.getCell('D38').alignment = { vertical: 'middle', horizontal: 'center' };

  worksheet3.getCell('G38').value = { formula: `=IF(ABS(E38)<ABS(E37),"NG","OK")` };
  worksheet3.getCell('G38').alignment = { vertical: 'middle', horizontal: 'center' };
}






// Format the merged cell
formatCell(dropdownCell, name);
      worksheet3.mergeCells('B2:D2');
      formatCell(worksheet3.getCell('B2'), 'AASTHO');
      worksheet3.mergeCells('E2:G2');
      formatCell(worksheet3.getCell('E2'), 'Caltrans');
      let contentForRows;
      
      if (type == "Composite") {
      const rowsToMerge = [3, 7, 11, 14, 17, 21, 28];
      contentForRows = [
        "1. Factored Resistance: Positive ",
        "2. Factored Resistance: Negative ",
        "3. Maximum spacing for transverse reinforcement: Maximum shear case ",
        "4. Maximum spacing for transverse reinforcement: Minimum shear case ",
        "5. Crack Check ",
        "6. Shear Resistance parameters : Maximum ",
        "7. Shear Resistance parameters : Minimum "
      ];
      rowsToMerge.forEach((row, index) => {
        worksheet3.mergeCells(`A${row}:G${row}`);
        formatCell(worksheet3.getCell(`A${row}`), contentForRows[index], 'FFD3D3D3');  
      });
    } else {
      const rowsToMerge = [3, 7, 11, 14, 17, 21, 25,32];
      contentForRows = [
        "1. Factored Resistance: Positive ",
        "2. Factored Resistance: Negative ",
        "3. Maximum spacing for transverse reinforcement: Maximum shear case ",
        "4. Maximum spacing for transverse reinforcement: Minimum shear case ",
        "5. Crack Check : Top",
        "6. Crack Check : Bottom",
        "7. Shear Resistance parameters : Maximum ",
        "8. Shear Resistance parameters : Minimum "
      ];
      rowsToMerge.forEach((row, index) => {
        worksheet3.mergeCells(`A${row}:G${row}`);
        formatCell(worksheet3.getCell(`A${row}`), contentForRows[index], 'FFD3D3D3');
      });
    }
    
      if (type == 'Composite') {
      const rowsToSkip = [1, 2, 3, 7, 11, 14, 17,21,28];
      for (let i = 1; i <= 34; i++) {
        if (!rowsToSkip.includes(i)) {
          worksheet3.mergeCells(`B${i}:C${i}`);
          worksheet3.mergeCells(`E${i}:F${i}`);
        }
      } 
      } else {
        const rowsToSkip = [1, 2, 3, 7, 11, 14, 17, 21,25,32];
        for (let i = 1; i <= 38; i++) {
          if (!rowsToSkip.includes(i)) {
            worksheet3.mergeCells(`B${i}:C${i}`);
            worksheet3.mergeCells(`E${i}:F${i}`);
          }
        } 
      }
      formatCell(worksheet3.getCell('A4'), "ϕ");
      formatCell(worksheet3.getCell('A5'), "Mu(kips·in)");
      formatCell(worksheet3.getCell('A6'), 'Mr(kips·in)');
      formatCell(worksheet3.getCell('A8'), 'ϕ');
      formatCell(worksheet3.getCell('A9'), 'Mu(kips·in)');
      formatCell(worksheet3.getCell('A10'), 'Mr(kips·in)');
      formatCell(worksheet3.getCell('A12'), 'Smax(in)');
      formatCell(worksheet3.getCell('A13'), 'S(in)');
      formatCell(worksheet3.getCell('A15'), 'Smax(in)');
      formatCell(worksheet3.getCell('A16'), 'S(in)');
      formatCell(worksheet3.getCell('A18'), 'dc(in)');
      formatCell(worksheet3.getCell('A19'), 'smax(in)');
      formatCell(worksheet3.getCell('A20'), 's(in)');
      if (type == "Composite") {
      formatCell(worksheet3.getCell('A22'), 'β');
      formatCell(worksheet3.getCell('A23'), 'θ');
      formatCell(worksheet3.getCell('A24'), 'Av(in²)');
      formatCell(worksheet3.getCell('A25'), 'Av,req(in²)');
      formatCell(worksheet3.getCell('A26'), 'Vu(kips)');
      formatCell(worksheet3.getCell('A27'), 'Vr(kips)');
      formatCell(worksheet3.getCell('A22'), 'β');
      formatCell(worksheet3.getCell('A23'), 'θ');
      formatCell(worksheet3.getCell('A24'), 'Av(in²)');
      formatCell(worksheet3.getCell('A25'), 'Av,req(in²)');
      formatCell(worksheet3.getCell('A26'), 'Vu(kips)');
      formatCell(worksheet3.getCell('A27'), 'Vr(kips)');
      formatCell(worksheet3.getCell('A29'), 'β');
      formatCell(worksheet3.getCell('A30'), 'θ');
      formatCell(worksheet3.getCell('A31'), 'Av(in²)');
      formatCell(worksheet3.getCell('A32'), 'Av,req(in²)');
      formatCell(worksheet3.getCell('A33'), 'Vu(kips)');
      formatCell(worksheet3.getCell('A34'), 'Vr(kips)');
      formatNumberCell(worksheet3.getCell('B4'), 1);
      formatNumberCell(worksheet3.getCell('E4'), phi_new_m);
      formatNumberCell(worksheet3.getCell('B8'), 1);
      formatNumberCell(worksheet3.getCell('E8'), phi_new_n);
      }
      else {
        formatCell(worksheet3.getCell('A22'), 'dc(in)');
        formatCell(worksheet3.getCell('A23'), 'smax(in)');
        formatCell(worksheet3.getCell('A24'), 's(in)');
        formatCell(worksheet3.getCell('A26'), 'β');
        formatCell(worksheet3.getCell('A27'), 'θ');
        formatCell(worksheet3.getCell('A28'), 'Av(in²)');
        formatCell(worksheet3.getCell('A29'), 'Av,req(in²)');
        formatCell(worksheet3.getCell('A30'), 'Vu(kips)');
        formatCell(worksheet3.getCell('A31'), 'Vr(kips)');
        formatCell(worksheet3.getCell('A33'), 'β');
        formatCell(worksheet3.getCell('A34'), 'θ');
        formatCell(worksheet3.getCell('A35'), 'Av(in²)');
        formatCell(worksheet3.getCell('A36'), 'Av,req(in²)');
        formatCell(worksheet3.getCell('A37'), 'Vu(kips)');
        formatCell(worksheet3.getCell('A38'), 'Vr(kips)');
        formatNumberCell(worksheet3.getCell('B4'), 1);
        formatNumberCell(worksheet3.getCell('E4'), phi_new_m);
        formatNumberCell(worksheet3.getCell('B8'), 1);
        formatNumberCell(worksheet3.getCell('E8'), phi_new_n);
      }
      if (type == 'Composite') {
      }
      else {
      }
    }
    
      
  
    async function fetchLc() {
      const endpointsDataKeys = [
        { endpoint: "/db/lcom-gen", dataKey: "LCOM-GEN" },
        { endpoint: "/db/lcom-conc", dataKey: "LCOM-CONC" },
        { endpoint: "/db/lcom-src", dataKey: "LCOM-SRC" },
        { endpoint: "/db/lcom-steel", dataKey: "LCOM-STEEL" },
        { endpoint: "/db/lcom-stlcomp", dataKey: "LCOM-STLCOMP" },
      ];
      let allData = [];
      let check = false;
  
      // try {
      for (const { endpoint, dataKey } of endpointsDataKeys) {
        const response = await midasAPI("GET", endpoint);
        console.log(response);
        if (response && !response.error) {
          let responseData = response[dataKey];
          if (responseData === undefined) {
            console.warn(`Data from ${endpoint} is undefined, skipping.`);
            continue;
          }
          if (!Array.isArray(responseData)) {
            responseData = Object.values(responseData);
          }
          let keys = Object.keys(response[dataKey]);
          const lastindex = parseInt(keys[keys.length - 1]);
          console.log(lastindex);
          responseData.forEach((item) => {
            allData.push({ name: item.NAME, endpoint, lastindex: lastindex });
          });
          if (allData.length > 0) {
            const lastElement = allData[0];
            const lastNumber = Object.keys(lastElement).length - 1;
            for (let index = 0; index < responseData.length; index++) {
              const item = responseData[index];
              item.someProperty = lastNumber + index + 1;
              allData.push(item);
              console.log(allData);
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
        setLc(allData);
      }
      showLc(allData);
      return null;
    }
    function showLc(lc) {
      console.log(lc);
      item.delete("1");
      let newKey = 1;
      for (let key in lc) {
        if (lc[key].ACTIVE === "SERVICE") {
          item.set(lc[key].NAME, newKey.toString());
          newKey++;
        }
      }
  
      setItem(item);
      for (let [name, key] of item.entries()) {
        if (key === "1") {
          setSelectedName(name);
          lcname = name;
          console.log(lcname);
          break;
        }
      }
      console.log(item);
    }
    console.log(item);
    console.log(lcname);
    
    console.log(matchedParts);
    const handleFileDownload = async () => {
        setButtonText('Creating...');
      // fetchLc();
      const combArray = Object.values(lc);
      let beamStresses;
      let beamStresses_box;
      if (combArray.length === 0) {
        enqueueSnackbar("Please Define Load Combination", {
          variant: "error",
          anchorOrigin: {
            vertical: "top",
            horizontal: "center",
          },
          action,
        });
        return;
      }
      // console.log(allMatches);
      console.log(SelectWorksheets);
      console.log(SelectWorksheets2);
      console.log(matchedParts);
      let numberPart = parseInt(matchedParts[0].numberPart, 10);
      let letterPart = matchedParts[0].letterPart;
      let name = numberPart + "_" + letterPart;
      let numberPartsArray = [];
      let partsArray = [];

for (let match of matchedParts) {
  let numberPart = parseInt(match.numberPart, 10);
  let letterPart = match.letterPart;

  // Add the numberPart to the array
  numberPartsArray.push(numberPart);

  // Add the Part with letterPart to the array
  partsArray.push(`Part ${letterPart}`);
}
      console.log(selectedName);
      console.log(name);
      
      const concatenatedValue_cbc = `${selectedName}(CBC)`;
      const concatenatedValue_cbc_max = `${selectedName}(CBC:max)`;
      const concatenatedValue_cb = `${selectedName}(CB)`;
      const concatenatedValue_cd_max = `${selectedName}(CB:max)`;
      const concatenatedValue_cbr = `${selectedName}(CBR)`;
      const concatenatedValue_cbr_max = `${selectedName}(CBR:max)`;
      const concatenatedValue_cbsc = `${selectedName}(CBSC)`;
      const concatenatedValue_cbsc_max = `${selectedName}(CBSC:max)`;
      let box_stresses = {
        "Argument": {
            "TABLE_NAME": "BeamStress",
            "TABLE_TYPE": "BEAMSTRESS",
            "EXPORT_PATH": "C:\\MIDAS\\Result\\Output.JSON",
            "STYLES": {
                "FORMAT": "Fixed",
                "PLACE": 12
            },
            "COMPONENTS": [
                "Elem",
                "Load",
                "Part",
                "Axial",
                "Shear-y",
                "Shear-z",
                "Bend(+y)",
                "Bend(-y)",
                "Bend(+z)",
                "Bend(-z)",
                "Cb(min/max)",
                "Cb1(-y+z)",
                "Cb2(+y+z)",
                "Cb3(+y-z)",
                "Cb4(-y-z)"
            ],
            "NODE_ELEMS": {
                "KEYS": 
                  numberPartsArray
                
            },
            "LOAD_CASE_NAMES": [
              selectedName,
              concatenatedValue_cbc,
              concatenatedValue_cbc_max,
              concatenatedValue_cb,
              concatenatedValue_cd_max,
              concatenatedValue_cbr,
              concatenatedValue_cbr_max,
              concatenatedValue_cbsc,
              concatenatedValue_cbsc_max
            ],
            "PARTS": partsArray
        }
    };
    console.log(box_stresses);
  
      let stresses = {
        "Argument": {
            "TABLE_NAME": "BeamStress",
            "TABLE_TYPE": "COMPSECTBEAMSTRESS",
            "EXPORT_PATH": "C:\\MIDAS\\Result\\Output.JSON",
            "STYLES": {
                "FORMAT": "Fixed",
                "PLACE": 12
            },
            "COMPONENTS": [
                "Elem",
                "DOF",
                "Load",
                "Section Part",
                "Part",
                "Axial",
                "Bend(+y)",
                "Bend(-y)",
                "Bend(+z)",
                "Bend(-z)",
                "Cb(min/max)",
                "Cb1(-y+z)",
                "Cb2(+y+z)",
                "Cb3(+y-z)",
                "Cb4(-y-z)",
                "Sax(Warping)1",
                "Sax(Warping)2",
                "Sax(Warping)3",
                "Sax(Warping)4"
            ],
            "NODE_ELEMS": {
                "KEYS": 
                  numberPartsArray
            },
            "LOAD_CASE_NAMES": [
                selectedName,
                concatenatedValue_cbc,
                concatenatedValue_cbc_max,
                concatenatedValue_cb,
                concatenatedValue_cd_max,
                concatenatedValue_cbr,
                concatenatedValue_cbr_max,
                concatenatedValue_cbsc,
                concatenatedValue_cbsc_max
            ],
            "PARTS": partsArray
        }
    };
    console.log(stresses);
    try {
      beamStresses = await midasAPI("POST", "/post/table", stresses);
      
      if (beamStresses.message === '') {
        beamStresses_box = await midasAPI("POST", "/post/table", box_stresses);
      }
    
      // setBeamStresses(beamStresses);
      console.log(beamStresses);
      console.log(beamStresses_box);

      if (
        beamStresses.error || 
        beamStresses_box.error
      ) {
        enqueueSnackbar("Please run the Analysis", {
          variant: "error",
          anchorOrigin: {
            vertical: "top",
            horizontal: "center",
          },
          action,
        });
        return;
      }
    } catch (error) {
      console.error("Error fetching beam stresses:", error);
    }
    let type;
    console.log(SelectWorksheets);
    for (let wkey in SelectWorksheets) {
      lastWkey = wkey;
      // type =  await (updatedata(wkey, SelectWorksheets[wkey]));
      // console.log(type);
    }
      for (let wkey in SelectWorksheets) {
        // lastWkey = wkey;
        type =  await (updatedata(wkey, SelectWorksheets[wkey]));
        console.log(type);
      }
      console.log(lastWkey);
      console.log(type);
      for (let wkey in SelectWorksheets2) {
        // Check if beamStresses is not null or undefined and has keys
        if (beamStresses.BeamStress && beamStresses.BeamStress.DATA) {
          updatedata2(wkey, SelectWorksheets2[wkey], beamStresses);
        } else {
           updatedata2(wkey, SelectWorksheets2[wkey], beamStresses_box);
        }
      }
      console.log(beamStresses);
      console.log(beamStresses_box);
      
      for (let wkey in SelectWorksheets3) {
          updatedata3(wkey, SelectWorksheets3[wkey],name,type);
        }
      if (!workbookData) return;
      try {
        const worksheet = workbookData.getWorksheet(sheetName);
        const buffer = await workbookData.xlsx.writeBuffer();
        const blob = new Blob([buffer], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
    
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "output.xlsx";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    
        // Show success notification
        enqueueSnackbar("Output file generated successfully!", {
          variant: "success",
          anchorOrigin: {
            vertical: "top",
            horizontal: "center",
          },
          action,
        });
        if (fileInputRef.current) {
            fileInputRef.current.value = null;
          }
          setButtonText('Create Report');
        //   await handleFileDownload;
      } catch (error) {
        // Show error notification
        enqueueSnackbar(`Error generating output file: ${error.message}`, {
          variant: "error",
          anchorOrigin: {
            vertical: "top",
            horizontal: "center",
          },
          action,
        });
        setButtonText('Create Report');
      }
    };
   
  
    const handleDataChange = (rowIndex, colIndex, value) => {
      const newData = [...sheetData];
      newData[rowIndex][colIndex] = value;
      setSheetData(newData);
    };
    function alert() {
      setCheck(true);
    }
  
    return (
      <Panel width={510} height={470} marginTop={3} padding={2} variant="shadow2">
        <Panel width={480} height={200} marginTop={0} variant="shadow2">
        <div style={{ marginTop: "8px" }}>
          <Grid container>
            <Grid item xs={9}>
              <Typography variant="h1">
                {" "}
                Casting Method
              </Typography>
            </Grid>
            <Grid item xs={3}>
              <Typography variant="h1"> (5.5.4.2)</Typography>
            </Grid>
          </Grid>
          {/* <RadioGroup
            margin={1}
            onChange={(e) => setSp(e.target.value)} // Update state variable based on user selection
            value={cast} // Bind the state variable to the RadioGroup
            text=""
          > */}
          <RadioGroup
            margin={1}
            onChange={(e) => setCast(e.target.value)} // Update state variable based on user selection
            value={cast} // Bind the state variable to the RadioGroup
            text=""
          >
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "start",
                justifyContent: "space-between",
                marginTop: "6px",
                marginRight: "5px",
                height: "10px",
                width: "198px",
              }}
            >
              <Radio
                name=" Cast In-Place"
                value="inplace"
                checked={cast === "inplace"}
              />
              <Radio
                name="Precast"
                value="precast"
                checked={cast === "precast"}
              />
            </div>
          </RadioGroup>
        </div>
  
        <div style={{ marginTop: "25px" }}>
          <Grid container>
            <Grid item xs={9}>
              <Typography variant="h1">
                {" "}
                Maximum Spacing of Transverse Reinforcement:
              </Typography>
            </Grid>
            <Grid item xs={3}>
              <Typography variant="h1"> (5.7.2.6.-1)</Typography>
            </Grid>
          </Grid>
          <RadioGroup
            margin={1}
            onChange={(e) => setSp(e.target.value)} // Update state variable based on user selection
            value={cast} // Bind the state variable to the RadioGroup
            text=""
          >
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "start",
                justifyContent: "space-between",
                marginTop: "6px",
                marginRight: "5px",
                height: "10px",
                width: "300px",
              }}
            >
              <Radio name="CA (18 inches)" value="ca1" checked={sp === "ca1"} />
              <Radio
                name="AASHTO LFRD (24 inches)"
                value="aa1"
                checked={sp === "aa1"}
              />
            </div>
          </RadioGroup>
        </div>
  
        <div style={{ marginTop: "25px" }}>
          <Grid container>
            <Grid item xs={9}>
              <Typography variant="h1"> Clear Concrete Cover:</Typography>
            </Grid>
            <Grid item xs={3}>
              <Typography variant="h1"> (5.6.7-1)</Typography>
            </Grid>
          </Grid>
          <RadioGroup
            margin={1}
            onChange={(e) => setCvr(e.target.value)} // Update state variable based on user selection
            value={cast} // Bind the state variable to the RadioGroup
            text=""
          >
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "start",
                justifyContent: "space-between",
                marginTop: "6px",
                marginRight: "5px",
                height: "10px",
                width: "235px",
              }}
            >
              <Radio name="CA (2.5 inches)" value="ca2" checked={cvr === "ca2"} />
              <Radio
                name="AASHTO LFRD"
                value="aa2"
                checked={cvr === "aa2"}
              />
            </div>
          </RadioGroup>
        </div>
        </Panel>
        <Panel width={480} height={200} marginTop={1} variant="shadow2">
        <div style={{ marginTop: "6px" }}>
          <Grid container>
            <Grid item xs={3}>
              <Typography variant="h1">
                {" "}
                Load Combination for SLS (Permanent Loads)
              </Typography>
            </Grid>
            <Grid item xs={6} paddingLeft="10px">
              <DropList
                itemList={item}
                width="200px"
                defaultValue="Korean"
                value={value}
                onChange={onChangeHandler}
              />
            </Grid>
            <Grid item xs={3}>
              <Typography variant="h1">(5.9.2.3.2b-1)</Typography>
            </Grid>
          </Grid>
        </div>
        <div style={{ display: "flex",flexDirection: "row",alignItems: "start",justifyContent: "space-between" ,width: "600px",height: "120px"}}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            marginTop: "5px",
          }}
        >
          <Grid container>
            <Grid item xs={10}>
              <Typography variant="h1" height="40px" paddingTop="15px">
                <input
                  type="file"
                  accept=".xlsx, .xls"
                  onChange={handleFileUpload}
                />
              </Typography>
            </Grid>
            {/* <Grid item xs={2}>
            <img
          src={Image} // Use the imported image
          alt="Description of the image"
          style={{ width: '100%', height: 'auto' }} // Inline styles for responsiveness
        />
            </Grid> */}
          </Grid>
          {/*  */}
         
          <Grid container>
          <Grid container direction="row">
            <Grid item xs={8}>
              <Typography>Maximum aggregate size(ag) (in inches)</Typography>
            </Grid>
            <Grid item xs={2}>
              <TextField
                value={ag}
                onChange={handleAgChange}
                placeholder=""
                //   title="Maximum aggregate size(ag)"
                width="70px"
              />
               {/* <Grid item xs={4}>
            <img
          src={Image} // Use the imported image
          alt="Description of the image"
          style={{ width: '100%', height: 'auto' }} // Inline styles for responsiveness
        />
            </Grid> */}
            </Grid>
            </Grid>
            <Grid container direction="row">
            <Grid item xs={8} marginTop={0}>
              <Typography size="small">
              <span dangerouslySetInnerHTML={{ __html: 'Maximum distance between the layers of longitudinal crack control reinforcement (s<sub>xe</sub>) (in inches)' }} />
              </Typography>
            </Grid>
            <Grid item xs={2} marginTop={0.5}>
              <TextField
                value={sg}
                onChange={handleSgChange}
                placeholder=""
                //   title="title"
                width="70px"
              />
            </Grid>
          </Grid>
          <Grid item xs={2}>
            {/* <img
          src={Image} // Use the imported image
          alt="Description of the image"
          style={{ width: '100%', height: 'auto' }} // Inline styles for responsiveness
        /> */}
            </Grid>
          </Grid>
          </div>
          <Grid container>
          <Grid item xs={4}>
               <img
          src={Image} // Use the imported image
          alt="Description of the image"
          style={{ width: '105%', height: '90%' }} // Inline styles for responsiveness
        />
        </Grid>
          </Grid>
       
          {/* </Grid>
                  </Grid> */}
        </div>
        </Panel>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            margin: "0px",
            marginTop: "10px",
            marginBottom: "30px",
          }}
        >
          {/* {Buttons.NormalButton("contained", "Import Report", () => importReport())} */}
          {/* {Buttons.MainButton("contained", "Update Report", () => updatedata())}  */}
          {Buttons.MainButton("contained", buttonText, handleFileDownload)}
          {check && <AlertDialogModal />}
        </div>
      </Panel>
    );
  };