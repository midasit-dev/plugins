import * as React from "react";
import { GuideBox, Panel } from "@midasit-dev/moaui";
import Sep from "@midasit-dev/moaui/Components/Separator";
import { useSnackbar, SnackbarProvider } from "notistack";
import * as Buttons from "./Components/Buttons";
import { midasAPI } from "./Function/Common";
import { VerifyUtil, VerifyDialog } from "@midasit-dev/moaui";


import { useEffect } from "react";
import { useState } from "react";
import UpdateExcel from "./UpdateExcel";
import { Updatereport } from "./Updatereport";
import AlertDialogModal from "./AlertDialogModal";

function Separator() {
  return (
    <div width="100%">
      <Sep direction="vertical" />
    </div>
  );
}

function App() {
  const [showDialog, setDialogShowState] = useState(false);
  const [selectedCheckboxes, setSelectedCheckboxes] = useState(["Fx"]);
  const [all, setAll] = useState(false);
  const [comb, setComb] = useState({});
  const [elem, setelement] = useState({});
  const [firstSelectedElement, setFirstSelectedElement] = useState(null);
  const { enqueueSnackbar } = useSnackbar();
  const [selectedRadio, setSelectedRadio] = useState("");
  const [newLoadCaseName, setNewLoadCaseName] = useState("");
  const [selectedObject, setSelectedObject] = useState(null);
  const [selectedPart, setSelectedPart] = useState("I"); // Default to "i" or set initial value as needed
  let successfulEndpoint = null;
  const [selectedRange, setSelectedRange] = useState(["max"]);

  useEffect(() => {
    if (
      !VerifyUtil.isExistQueryStrings("redirectTo") &&
      !VerifyUtil.isExistQueryStrings("mapiKey")
    ) {
      setDialogShowState(true);
    }
  }, []);
  // const { enqueueSnackbar } = useSnackbar();
  const combArray = Object.values(comb);
  const elementArray = Object.values(elem);
  // console.log(elementArray);

  return (
    <div className="App">
      {/* {showDialog && <MKeyDialog />} */}
      {showDialog && <VerifyDialog />}
      <GuideBox padding={2} center>
        {/* <Panel width={520} height={400} variant="shadow2"> */}
          {/* <Panel width={500} height={100} marginX={1} marginTop={2}>
            </Panel> */}
          {/* <UpdateExcel /> */}
          <Updatereport />

         

        {/* </Panel> */}
      </GuideBox>
    </div>
  );
}
function AppWithSnackbar() {
  return (
    <SnackbarProvider maxSnack={1} autoHideDuration={50000000}>
      <App />
    </SnackbarProvider>
  );
}
export default AppWithSnackbar;
