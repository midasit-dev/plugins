import React, { useState, useEffect } from "react";
import { Panel,Typography, TextField, Button, Scrollbars } from "@midasit-dev/moaui"; 
import { DropList } from '@midasit-dev/moaui';
import { midasAPI } from "./Function/Common";
import  ComponentsTableBundle  from "./Function/ComponentsTableBundle";
import { iterativeResponseSpectrum } from "./utils_pyscript";
import { mapi_key } from "./utils_pyscript";
import { useSnackbar, SnackbarProvider } from "notistack";
import ComponentsIconAdd from "./Function/ComponentsIconAdd";
import * as XLSX from 'xlsx';
// import { GuideBox, Alert } from "@midasit-dev/moaui";
// import ComponentsAlertError from "./Function/ComponentsAlertError";

let globalStructureGroups: { [key: number]: string } = {};
let globalBoundaryGroups: { [key: number]: string } = {};
let globalRsLoadCases: { [key: number]: string } = {};
interface Displacement {
    Dx: number;
    Dy: number;
    Dz: number;
}
let globalkey: string = "";
interface IterationResults {
    [key: string]: Displacement;
}

interface Results {
    [key: string]: IterationResults;
}
const App = () => {
  const [structureGroups, setStructureGroups] = useState<Map<string, number>>(new Map());
  const [boundaryGroups, setBoundaryGroups] = useState<Map<string, number>>(new Map());
  const [rsLoadCases, setRsLoadCases] = useState<Map<string, number>>(new Map());
  const [selectedStructureGroup, setSelectedStructureGroup] = useState("");
  const [selectedBoundaryGroup, setSelectedBoundaryGroup] = useState("");
  const [selectedRsLoadCase, setSelectedRsLoadCase] = useState("");
  const [tolerance, setTolerance] = useState("0.01");
  const [iterations, setIterations] = useState<Map<string, number>>(new Map());
  const [results, setResults] = useState({});
  const [selectedIteration, setSelectedIteration] = useState(null);
  const [tableData, setTableData] = useState<{ [key: string]: Displacement }>({});
  const [data, setData] = useState(null);
  const { enqueueSnackbar } = useSnackbar();
  const [csvData, setCsvData] = useState<string>("");
  // Fetch data for dropdowns
  const [triggerFetch, setTriggerFetch] = useState<boolean>(false);

  const resetAndFetchData = () => {
	  // Reset state variables
	//   setStructureGroups(new Map());
	  setBoundaryGroups(new Map());
	  setRsLoadCases(new Map());
	  setIterations(new Map());
	  setSelectedIteration(null);
	  setResults({});
	  setTableData({});
	  setCsvData("");
	  // Trigger fetch
	  setTriggerFetch(prev => !prev);
  };
  useEffect(() => {
    const fetchData = async () => {
      try {
        // const structureResponse = await midasAPI("GET","/db/GRUP",{});
        const boundaryResponse = await midasAPI("GET","/db/BNGR",{});
        const rsLoadCaseResponse = await midasAPI("GET","/db/SPLC",{});
		// const grupData = structureResponse.GRUP;
        const bngData = boundaryResponse.BNGR;
		const splcData = rsLoadCaseResponse.SPLC;
        // const mappedItems = new Map<string, number>(
		// // 	Object.keys(grupData).map((key) => {
		// // 	  const group = grupData[key];
		// // 	  return [group.NAME, parseInt(key)];  // You can adjust this as needed
		// // 	})
		// //   );
		  const mappedItems_bng = new Map<string, number>(
			Object.keys(bngData).map((key) => {
			  const group = bngData[key];
			  return [group.NAME, parseInt(key)];  // You can adjust this as needed
			})
		  );
		  const mappedItems_splc = new Map<string, number>(
			Object.keys(splcData).map((key) => {
			  const group = splcData[key];
			  return [group.NAME, parseInt(key)];  // You can adjust this as needed
			})
		  );
		//  globalStructureGroups = Object.keys(grupData).reduce((acc, key) => {
        //   acc[parseInt(key)] = grupData[key].NAME;
        //   return acc;
        // }, {} as { [key: number]: string });

        globalBoundaryGroups = Object.keys(bngData).reduce((acc, key) => {
          acc[parseInt(key)] = bngData[key].NAME;
          return acc;
        }, {} as { [key: number]: string });

        globalRsLoadCases = Object.keys(splcData).reduce((acc, key) => {
          acc[parseInt(key)] = splcData[key].NAME;
          return acc;
        }, {} as { [key: number]: string });
        // setStructureGroups(mappedItems);
        setBoundaryGroups(mappedItems_bng);   
        setRsLoadCases(mappedItems_splc);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, [triggerFetch]);    
  
 
  // Update table when iteration changes
  useEffect(() => {
	if (selectedIteration && results[selectedIteration]) {
		const formattedData = Object.keys(results[selectedIteration]).reduce((acc: { [key: string]: Displacement }, key) => {
			const displacement = results[selectedIteration][key] as Displacement;
			acc[key] = {
				Dx: displacement.Dx !== undefined ? parseFloat(displacement.Dx.toFixed(4)) : 0,
				Dy: displacement.Dy !== undefined ? parseFloat(displacement.Dy.toFixed(4)) : 0,
				Dz: displacement.Dz !== undefined ? parseFloat(displacement.Dz.toFixed(4)) : 0,
			};
			return acc;
		}, {} as { [key: string]: Displacement });

		setTableData(formattedData);

		// Convert formattedData to CSV string
		const csvRows = [
			["Key", "Dx", "Dy", "Dz"], // Header row
			...Object.entries(formattedData).map(([key, displacement]) => [
				key,
				displacement.Dx,
				displacement.Dy,
				displacement.Dz,
			]),
		];

		const csvString = csvRows.map(row => row.join("\t")).join("\n");
		setCsvData(csvString);
	}
}, [selectedIteration, results]);
  function onChangeHandler_sg(event: any){
	setSelectedStructureGroup(event.target.value);
}
function onChangeHandler_bn(event: any){
	setSelectedBoundaryGroup(event.target.value);
}
function onChangeHandler_rs(event: any){
	setSelectedRsLoadCase(event.target.value);
}
function onChangeHandler_ir(event: any){
	setSelectedIteration(event.target.value);
}

const handleRunAnalysis = async () => {
    try {
		if (!selectedBoundaryGroup && !selectedRsLoadCase) {
			enqueueSnackbar("Please select the required boundary group and Load Case before running the analysis.", {
				variant: "error",
				anchorOrigin: { vertical: "top", horizontal: "center" },
			});
			return;
		}	
		// if (!selectedStructureGroup && !selectedBoundaryGroup) {
		// 	enqueueSnackbar("Please select the required groups before running the analysis.", {
		// 		variant: "error",
		// 		anchorOrigin: { vertical: "top", horizontal: "center" },
		// 	});
		// 	return;
		// }
		// if (!selectedStructureGroup) {
		// 	enqueueSnackbar("Please select the required Structure Group before running the analysis.", {
		// 		variant: "error",
		// 		anchorOrigin: { vertical: "top", horizontal: "center" },
		// 	});
		// 	return;
		// }
		if (!selectedBoundaryGroup) {
			enqueueSnackbar("Please select the required Boundary Group before running the analysis.", {
				variant: "error",
				anchorOrigin: { vertical: "top", horizontal: "center" },
			});
			return;
		}	
		if (!selectedRsLoadCase) {
			enqueueSnackbar("Please select the required Load Case before running the analysis.", {
				variant: "error",
				anchorOrigin: { vertical: "top", horizontal: "center" },
			});
			return;
		}	
		if (tolerance === '' || isNaN(parseFloat(tolerance))) {
			enqueueSnackbar("Please enter a valid tolerance value.", {
				variant: "error",
				anchorOrigin: { vertical: "top", horizontal: "center" },
			});
			return;
		}
		enqueueSnackbar("Please wait while running analysis...", {
			variant: "info",
			anchorOrigin: { vertical: "top", horizontal: "center" },
		  });
		  setTimeout(async () => {
            console.log(
                globalStructureGroups[parseInt(selectedStructureGroup)],
                globalBoundaryGroups[parseInt(selectedBoundaryGroup)],
                globalRsLoadCases[parseInt(selectedRsLoadCase)],
                tolerance
            );
            globalkey = mapi_key;

            try {
                const result = await iterativeResponseSpectrum(
                    globalBoundaryGroups[parseInt(selectedBoundaryGroup)],
                    globalRsLoadCases[parseInt(selectedRsLoadCase)],
                    parseFloat(tolerance),
                    globalkey
                );
                console.log("Analysis results:", result);
                setResults(result);
                const mappedIterations = new Map<string, number>(
                    Object.keys(result).map((key) => {
                        return [key, parseInt(key)];  // Adjust as needed
                    })
                );
                setIterations(mappedIterations);
                console.log("Mapped iterations:", mappedIterations);
                console.log("Analysis results:", result);
                enqueueSnackbar("Analysis completed successfully!", {
                    variant: "success",
                    anchorOrigin: { vertical: "top", horizontal: "center" },
                });
            } catch (error) {
                enqueueSnackbar("Error while running analysis!", {
                    variant: "error",
                    anchorOrigin: { vertical: "top", horizontal: "center" },
                });
                console.error("Error running analysis:", error);
            }
        }, 0);
    } catch (error) {
		enqueueSnackbar("Error while running analysis!", {
			variant: "error",
			anchorOrigin: { vertical: "top", horizontal: "center" },
		  })
      console.error("Error running analysis:", error);
    }
  };
  const handleDownload = () => {
	// Process the downloaded Excel file
	if (Object.keys(results).length === 0) {
		enqueueSnackbar("Please run analysis first.", {
			variant: "warning",
			anchorOrigin: { vertical: "top", horizontal: "center" },
		});
		return;
	}
	// const workbook = XLSX.utils.book_new();
    // const worksheetData = [["Key", "Dx", "Dy", "Dz"]]; // Header row

	// Object.keys(results).forEach(iteration => {
    //     const iterationResults = results[iteration];
    //     Object.keys(iterationResults).forEach(key => {
    //         const displacement = iterationResults[key];
    //         worksheetData.push([
    //             key,
    //             displacement.Dx !== undefined ? displacement.Dx : 0,
    //             displacement.Dy !== undefined ? displacement.Dy : 0,
    //             displacement.Dz !== undefined ? displacement.Dz : 0,
    //         ]);
    //     });
    // });

    // const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    // XLSX.utils.book_append_sheet(workbook, worksheet, "Results");

	// 	// Generate the modified Excel file and create a Blob object
	// 	const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
	// 	const modifiedBlob = new Blob([excelBuffer], { type: 'application/octet-stream' });

	// 	// Trigger the download of the modified Excel file
	// 	const link = document.createElement('a');
	// 	link.href = URL.createObjectURL(modifiedBlob);
	// 	link.download = 'Iterations_result.xlsx';
	// 	document.body.appendChild(link);
	// 	link.click();
	// 	document.body.removeChild(link);
};
  
  return (
    <Panel width="720px" height="460px" marginTop={3}>
		<Panel width="680px" height="50px" variant="box">
		<Typography variant="h1" color="primary" center={true} size="large">
      Iterative Response Spectrum
    </Typography>
		</Panel>
			<Panel width="680px" height="430px" variant="box" flexItem>
				<Panel width="250px" height="430px" variant="box">
			{/* <Panel width="250px" height="80px" variant="strock" >
			<Typography>Select Structure Group</Typography>
			<div style={{ marginTop: '10px' }}>
			<DropList 
			itemList={structureGroups} 
			width="220px" 
			defaultValue="Korean"
			value={selectedStructureGroup}
			onChange={onChangeHandler_sg}  
		/>
		  </div>
		</Panel> */}
		<Panel width="250px" height="90px" variant="strock" marginTop={0}>
		<Typography marginTop={1} variant="body2">Select Boundary Group</Typography>
		<div style={{ marginTop: '15px' }}>
		<DropList 
			itemList={boundaryGroups} 
			width="220px" 
			defaultValue="Korean"
			value={selectedBoundaryGroup}
			onChange={onChangeHandler_bn}  
		/>
	</div>
		</Panel>
		<Panel width="250px" height="90px" variant="strock"marginTop={1} >
		<Typography marginTop={1} variant="body2">Select Response Spectrum Load Case</Typography>
		<div style={{ marginTop: '15px' }}>
		<DropList 
			itemList={rsLoadCases} 
			width="220px" 
			defaultValue="Korean"
			value={selectedRsLoadCase}
			onChange={onChangeHandler_rs}  
		/> </div>
		</Panel>
		<Panel width="250px" height="90px" variant="strock" marginTop={1}>
		<Typography marginTop={1} variant="body2">Tolerance (0.01 to 0.05) </Typography>
		<div style={{ marginTop: '15px' }}>
		<TextField 
			width="220px"
			placeholder=""
			title=""
			titlePosition="left"
			disabled={false}
			defaultValue=""
			value={tolerance}
			onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
				const value = e.target.value;
				if (value === '' || !isNaN(parseFloat(value))) {
					setTolerance(value);
				}
			}}
			error={false}
		/> 
		</div>
		</Panel>
		<Panel flexItem  justifyContent = 'space-between' width="240px" height="80px" variant="box" marginTop={1} marginLeft={1}>
		<Button
  color="normal"
  onClick={handleRunAnalysis}
  width="auto" 
>
Run Analysis
</Button> 
<div style={{width : "10px"}}></div>
<Button
  color="normal"
  onClick={resetAndFetchData} 
  width="auto" 
>
Refresh
</Button> 
</Panel>
</Panel>
<Panel width="430px" height="380px" variant="strock" marginX="20px"marginRight={0}>
<Panel width="420px" height="20px" variant="box" marginX="0px"marginRight={0} flexItem>
<Typography variant="h1" paddingRight={42}>Results</Typography>
<ComponentsIconAdd results={results} onDownload={handleDownload} />
</Panel>
<Panel width="440px" height="60px" variant="box"marginRight="20px">
			<Typography variant="body2">Select Iteration step</Typography>
			<div style={{ marginTop: '6px' }}>
			<DropList 
			itemList={iterations}
			width="400px" 
			defaultValue="Korean"
			value={selectedIteration}
			onChange={onChangeHandler_ir} 
		/>   </div>
		</Panel>
		<Panel width="440px"height="330px" variant="box" marginRight="20px">
			<Scrollbars width="400px" height="245px">
		<ComponentsTableBundle tableData={tableData} />   
		</Scrollbars>
		</Panel>	
</Panel>
		</Panel>
		</Panel>
  );
};

export default App;
