import React, { useState, useEffect } from "react";
// import { GuideBox } from "@midasit-dev/moaui";
import { Panel,Typography, TextField, Button } from "@midasit-dev/moaui"; 
import { DropList } from '@midasit-dev/moaui';
import { midasAPI,getBaseURL, getMapiKey } from "./Function/Common";
import  ComponentsTableBundle  from "./Function/ComponentsTableBundle";
import { iterativeResponseSpectrum } from "./utils_pyscript";
let globalStructureGroups: { [key: number]: string } = {};
let globalBoundaryGroups: { [key: number]: string } = {};
let globalRsLoadCases: { [key: number]: string } = {};
const App = () => {
  const [structureGroups, setStructureGroups] = useState<Map<string, number>>(new Map());
  const [boundaryGroups, setBoundaryGroups] = useState<Map<string, number>>(new Map());
  const [rsLoadCases, setRsLoadCases] = useState<Map<string, number>>(new Map());
  const [selectedStructureGroup, setSelectedStructureGroup] = useState("");
  const [selectedBoundaryGroup, setSelectedBoundaryGroup] = useState("");
  const [selectedRsLoadCase, setSelectedRsLoadCase] = useState("");
  const [tolerance, setTolerance] = useState(0.01);
  const [iterations, setIterations] = useState([]);
  const [results, setResults] = useState({});
  const [selectedIteration, setSelectedIteration] = useState(null);
  const [tableData, setTableData] = useState([]);
  const [data, setData] = useState(null);
  // Fetch data for dropdowns
  useEffect(() => {
    const fetchData = async () => {
      try {
        const structureResponse = await midasAPI("GET","/db/GRUP",{});
        const boundaryResponse = await midasAPI("GET","/db/BNGR",{});
        const rsLoadCaseResponse = await midasAPI("GET","/db/SPLC",{});
		    const grupData = structureResponse.GRUP;
        const bngData = boundaryResponse.BNGR;
		    const splcData = rsLoadCaseResponse.SPLC;
        const mappedItems = new Map<string, number>(
			Object.keys(grupData).map((key) => {
			  const group = grupData[key];
			  return [group.NAME, parseInt(key)];  // You can adjust this as needed
			})
		  );
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
		 globalStructureGroups = Object.keys(grupData).reduce((acc, key) => {
          acc[parseInt(key)] = grupData[key].NAME;
          return acc;
        }, {} as { [key: number]: string });

        globalBoundaryGroups = Object.keys(bngData).reduce((acc, key) => {
          acc[parseInt(key)] = bngData[key].NAME;
          return acc;
        }, {} as { [key: number]: string });

        globalRsLoadCases = Object.keys(splcData).reduce((acc, key) => {
          acc[parseInt(key)] = splcData[key].NAME;
          return acc;
        }, {} as { [key: number]: string });
  

        setStructureGroups(mappedItems);
        setBoundaryGroups(mappedItems_bng);   
        setRsLoadCases(mappedItems_splc);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);
 
  // Update table when iteration changes
  useEffect(() => {
    if (selectedIteration && results[selectedIteration]) {
      setTableData(results[selectedIteration]); 
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
const items = new Map<string, number>([ 
	['Korean', 1], 
	['American', 2], 
	['Asia', 3], 
	['Midas', 4] 
]);
const handleRunAnalysis = async () => {
    try {
		console.log(
			globalStructureGroups[parseInt(selectedStructureGroup)],
			globalBoundaryGroups[parseInt(selectedBoundaryGroup)],
			globalRsLoadCases[parseInt(selectedRsLoadCase)],
			tolerance
		  );
      const result = await iterativeResponseSpectrum(
        globalStructureGroups[parseInt(selectedStructureGroup)],
		globalBoundaryGroups[parseInt(selectedBoundaryGroup)],
		globalRsLoadCases[parseInt(selectedRsLoadCase)],
		tolerance
      );
      setResults(result);
      console.log("Analysis results:", result);
    } catch (error) {
      console.error("Error running analysis:", error);
    }
  };
  
  return (
    <Panel width="700px" height="500px" marginTop={3}>
		<Panel width="680px" height="50px" variant="box">
		<Typography variant="h1" color="primary" center={true} size="large">
      Iterative Response Spectrum
    </Typography>
		</Panel>
			<Panel width="680px" height="430px" variant="box" flexItem>
				<Panel width="250px" height="430px" variant="box">
			<Panel width="250px" height="80px" variant="strock" >
			<Typography>Select Structure Group</Typography>
			<DropList 
			itemList={structureGroups} 
			width="220px" 
			defaultValue="Korean"
			value={selectedStructureGroup}
			onChange={onChangeHandler_sg}  
		/>
		</Panel>
		<Panel width="250px" height="80px" variant="strock" marginTop={1}>
		<Typography>Select Boundary Group</Typography>
		<DropList 
			itemList={boundaryGroups} 
			width="220px" 
			defaultValue="Korean"
			value={selectedBoundaryGroup}
			onChange={onChangeHandler_bn}  
		/>
		</Panel>
		<Panel width="250px" height="80px" variant="strock"marginTop={1} >
		<Typography>Select Response Spectrum Load Case</Typography>
		<DropList 
			itemList={rsLoadCases} 
			width="220px" 
			defaultValue="Korean"
			value={selectedRsLoadCase}
			onChange={onChangeHandler_rs}  
		/>
		</Panel>
		<Panel width="250px" height="80px" variant="strock" marginTop={1}>
		<Typography>Percentage of Tolerance</Typography>
		<TextField 
			width="220px"
			placeholder=""
			title=""
			titlePosition="left"
			disabled={false}
			defaultValue=""
			value={tolerance.toString()}
			onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
				const value = parseFloat(e.target.value);
				if (!isNaN(value)) {
					setTolerance(value);
				}
			}}
			error={false}
		/>
		</Panel>
		<Panel width="250px" height="80px" variant="box" marginTop={1} marginLeft={6}>
		<Button
  color="normal"
  onClick={handleRunAnalysis}
  width="auto" 
>
Run Analysis
</Button> </Panel>
 
</Panel>
<Panel width="400px" height="410px" variant="strock" marginX="20px" >
<Typography variant="h1">Results</Typography>
<Panel width="380px" height="60px" variant="box">   
			<Typography>Select Iteration step</Typography>
			<DropList 
			itemList={items} 
			width="360px" 
			defaultValue="Korean"
			value={selectedStructureGroup}
			onChange={onChangeHandler_rs}  
		/>
		</Panel>
		<Panel width="380px" height="330px" variant="box">
			<ComponentsTableBundle/>
		</Panel>
		
</Panel>
		</Panel>
		</Panel>
  );
};

export default App;
