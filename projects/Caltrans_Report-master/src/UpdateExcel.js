import { DropList, Grid, Panel, Typography } from '@midasit-dev/moaui';
import { Radio, RadioGroup } from "@midasit-dev/moaui";
import React, { useState } from 'react';
import * as Buttons from "./Components/Buttons";
import * as XLSX from 'xlsx';

const UpdateExcel = () => {
    const [file, setFile] = useState(null);
    let names = [];
    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    function createReport() {
        if (!file) {
            alert('Please select an Excel file first.');
            return;
        }

        const reader = new FileReader();

        reader.onload = (e) => {
            const data = new Uint8Array(e.target.result);
            const file = XLSX.read(data, { type: 'array', cellStyles: true });

            // Select the first sheet
            const sheetname = '81_I';
            const worksheet = file.Sheets[sheetname];
            console.log(worksheet);
            //to find cell name
            names = file.Workbook.Names; // to store all the names saved in sheet1;
            for (let i = 0; i < names.length; i++) {
                console.log(names[i]);
                if (names[i].Name == 'Phi') {
                    let arr = names[i].Ref.split("$");
                    let celladd = arr[1] + arr[2];
                    if (cast === "inplace") {
                        worksheet[celladd] = { t: 's', v: 0.9 };
                    }
                    else {
                        worksheet[celladd] = { t: 's', v: 1 };
                    }
                    console.log(arr, celladd);
                }
            }


            // const cellAddress = 'check';
            // const newValue = 'Updated Value';
            // console.log('entry1',file.Workbook.Names, file.Workbook.Names[0].Ref.split("$"), worksheet);
            // console.log('entry1', file.Workbook.Names);

            // const name=file.Workbook.Names[0].Ref.split;

            // if (!worksheet[cellAddress]) {
            //     // console.log('entry1', worksheet['J11']);
            //     worksheet[cellAddress] = { t: 's', v: newValue };
            // } else {
            //     worksheet[cellAddress].v = newValue;
            // }

            // Convert the workbook to binary array
            const updatedData = XLSX.write(file, { bookType: 'xlsx', type: 'array' });
            console.log(updatedData);

            // Create a Blob from the binary array and create a download link
            const blob = new Blob([updatedData], { type: 'application/octet-stream' });
            console.log(blob);
            const url = URL.createObjectURL(blob);
            console.log(url);
            const a = document.createElement('a');
            console.log(a);
            a.href = url;
            a.download = 'updated_file.xlsx';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        };

        reader.readAsArrayBuffer(file);
    };
    const [cast, setCast] = useState("inplace");
    const [sp, setSp] = useState("ca1");
    const [cvr, setCvr] = useState("ca2");

    const [value, setValue] = useState(1);

    function onChangeHandler(event) {
        setValue(event.target.value);
    }
    const items = new Map([
        ['Korean', 1],
        ['American', 2],
        ['Asia', 3],
        ['Midas', 4]
    ]);

    function importReport() {

    }
    function updateReport() {

    }

    // console.log(cast, sp, cvr);
    return (
        <Panel width={520} height={400} marginTop={3} padding={2} variant="shadow2">
            <div >
                <Typography variant="h1"  > Casting Method</Typography>

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
            </div >

            <div style={{ marginTop: "25px" }}>

                <Grid container>
                    <Grid item xs={9}>
                        <Typography variant="h1"  >  Maximum Spacing of Transverse Reinforcement:</Typography>
                    </Grid>
                    <Grid item xs={3}>
                        <Typography variant="h1"  > (5.7.2.6.-1)</Typography>
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
                        <Radio
                            name="CA (18 inches)"
                            value="ca1"
                            checked={sp === "ca1"}
                        />
                        <Radio
                            name="AASHTO LFRD (24 inches)"
                            value="aa1"
                            checked={sp === "aa1"}
                        />
                    </div>
                </RadioGroup>
            </div >

            <div style={{ marginTop: "25px" }}>

                <Grid container>
                    <Grid item xs={9}>
                        <Typography variant="h1"  > Clear Concrete Cover:</Typography>
                    </Grid>
                    <Grid item xs={3}>
                        <Typography variant="h1"  > (5.6.7-1)</Typography>
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
                            width: "300px",
                        }}
                    >
                        <Radio
                            name="CA (2.5 inches)"
                            value="ca2"
                            checked={cvr === "ca2"}
                        />
                        <Radio
                            name="AASHTO LFRD (1.8 inches)"
                            value="aa2"
                            checked={cvr === "aa2"}
                        />
                    </div>
                </RadioGroup>
            </div >
            <div style={{ marginTop: "25px" }}>
                <Grid container>
                    <Grid item xs={3}>
                        <Typography variant="h1"  > Load Case for SLS (Permanent Loads)</Typography>
                    </Grid>
                    <Grid item xs={6} paddingLeft="10px">
                        <DropList
                            itemList={items}
                            width="200px"
                            defaultValue="Korean"
                            value={value}
                            onChange={onChangeHandler}
                        />
                    </Grid>
                    <Grid item xs={3}>
                        <Typography variant="h1"  >(5.9.2.3.2b-1)</Typography>
                    </Grid>
                </Grid>
            </div>

            <div
                style={{ display: "flex", justifyContent: "space-between", marginTop: "35px" }}
            >
                <Grid container>
                    <Grid item xs={6}>
                        <Typography variant="h1" height="40px" paddingTop="15px"  >
                            <input type="file" accept=".xlsx, .xls" onChange={handleFileChange} />
                        </Typography>
                    </Grid>

                    <Grid item xs={6}>
                        <div
                            style={{
                                borderBottom: "1px solid gray",
                                height: "40px",
                                width: "200px",
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                            }}
                        >
                            <div style={{ fontSize: "12px", paddingBottom: "2px" }}>
                                {/* {firstSelectedElement} */}
                            </div>
                        </div>
                    </Grid>
                </Grid>
            </div>


            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    margin: "0px",
                    marginTop: "30px",
                    marginBottom: "30px",
                }}
            >
                {Buttons.NormalButton("contained", "Import Report", () => importReport())}
                {/* {Buttons.MainButton("contained", "Update Report", () => updateReport())} */}
                {Buttons.MainButton("contained", "Create Report", () => createReport())}
            </div>
        </Panel>
    );
};

export default UpdateExcel;
