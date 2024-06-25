import React from 'react';
import moaui, {
  Button,
  GuideBox,
  DataGrid,
  TabGroup,
  Tab,
  TextField,
  Typography,
} from '@midasit-dev/moaui';
import { checkPyScriptReady } from './utils_pyscript';

//{
//	"id": 1,
//	"Name": "C_CO_1637",
//	"ElemNo": "1637",
//	"Component": "Center",
//	"ForceSign": "+",
//	"Strength": 916800.0000000002,
//	"Check": "-"
//},

// function getSampling() {
// 	const result = {
// 		,
// 		rows: [
// 			{ 
// 				id: 1, 
// 				Name: "C_CO_1591", 
// 				ElemNo: 1591, 
// 				Component: "test", 
// 				ForceSign: "+", 
// 				Strength: 1329, 
// 				Check: "-" 
// 			},
// 		]
// 	}

// 	return result;
// }

const columns = [
  { field: "id", 			  headerName: "id", width: 30, sortable: false },
  { field: "Name", 			headerName: "Name", width: 100, sortable: false },
  { field: "ElemNo", 		headerName: "Elem No.", width: 80, sortable: true, editable: false },
  { field: "Component", headerName: "Component", width: 80, sortable: false, editable: false },
  { field: "ForceSign", headerName: "Sign", width: 50, sortable: false, editable: false },
  { field: "Strength", 	headerName: "Strength", width: 80, sortable: false, editable: false },
  { field: "Check", 		headerName: "Check", width: 80, sortable: false, editable: false },
]

function getPython(): string {
    // The original sequence of numbers
    const sequence = "1592, 1591, 1593, 1594, 1595, 1596";
    
    // Define the maximum allowed length
    const maxLength = 25;
    
    // Check if the length of the sequence exceeds the maximum length
    if (sequence.length > maxLength) {
        // Truncate the sequence to fit within the maximum length including the ellipsis
        return sequence.slice(0, maxLength - 3) + "...";
    }
    
    // If the sequence length is within the limit, return it as is
    return sequence;
}

const App = () => {
  const [ tabValue, setTabValue ] = React.useState("tab1");
  const [ axialRows, setAxialRows ] = React.useState([ { id: 1 }]);
  const [ shearRows, setShearRows ] = React.useState([ { id: 1 }]);
  const [ momentRows, setMomentRows ] = React.useState([ { id: 1 }]);

  const [ unitValue, setUnitValue ] = React.useState('-');

  return (
    <GuideBox width={550} height='auto' center spacing={2} padding={1}>

      <TabGroup 
        width='100%'
        value={tabValue}
        onChange={(e: any, newValue: string) => {
          setTabValue(newValue);
      }}>
        <Tab value="tab1" label="Axial Strength" />
        <Tab value="tab2" label="Shear Strength" />
        <Tab value="tab3" label="Moment Strength" />
      </TabGroup>

      <GuideBox row horSpaceBetween verCenter width='100%'>
        <Button
          onClick={async () => {
            console.log('url', moaui.VerifyUtil.getBaseUri());
            console.log('mapiKey', moaui.VerifyUtil.getMapiKey());
            //UNIT API 요청
            const responseUnit = await fetch(`https://${moaui.VerifyUtil.getBaseUri()}/gen/db/unit`, {
              method: 'GET',
              headers: {
                'MAPI-Key': moaui.VerifyUtil.getMapiKey()
              }
            });
            if (responseUnit.ok) {
              const data = await responseUnit.json();
              const force = data["UNIT"]["1"]["FORCE"];
              const dist = data["UNIT"]["1"]["DIST"];
              console.log(force + " " + dist);
              setUnitValue(force + " " + dist);
            } else {
              console.error('Error:', responseUnit.status, responseUnit.statusText);
            }

            //Python 데이터
            checkPyScriptReady(() => {
              const py_main = pyscript.interpreter.globals.get('py_main');
              const string_result = py_main();
              const rowsData = JSON.parse(string_result);
              console.log(rowsData);
              setAxialRows(rowsData["axial"]);
              setShearRows(rowsData["shear"]);
              setMomentRows(rowsData["moment"]);
            });
          }}
        >Get Yield Strength</Button>

        <Typography>
          Unit {unitValue}
        </Typography>

      </GuideBox>

      <GuideBox
        width="100%"
        height={300}
      >
        <DataGrid
          columns={columns}
          rows={tabValue === 'tab1' ? axialRows : tabValue === 'tab2' ? shearRows : momentRows}
          hideFooter
        />
      </GuideBox>

      <GuideBox row width='100%' horSpaceBetween>
        <TextField 
          disabled
          defaultValue={getPython()}
        />

        <Button>Get Elem No.</Button>
        <Button>Close</Button>
      </GuideBox>

    </GuideBox>
  )
}

export default App;
