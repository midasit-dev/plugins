import React , { useState } from 'react'
import * as XLSX from 'xlsx';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button } from '@mui/material';



const ExcelReader = () => {
    const [excelData, setExcelData] = useState([]);
  
    // const handleFileUpload = (event) => {
    //   const file = event.target.files[0];
    //   const reader = new FileReader();
  
    //   reader.onload = (e) => {
    //     const binaryStr = e.target.result;
    //     const workbook = XLSX.read(binaryStr, { type: 'binary' });
    //     const firstSheetName = workbook.SheetNames[0];
    //     const worksheet = workbook.Sheets[firstSheetName];
    //     const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    //     setExcelData(jsonData);
    //   };
  
    //   reader.readAsBinaryString(file);
    // };
  
    return (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {/* <input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} style={{ marginBottom: '20px' }} /> */}
        {excelData.length > 0 && (
          <TableContainer component={Paper} style={{ width: '80%', marginTop: '20px' }}>
            <Table>
              <TableHead>
                <TableRow>
                  {excelData[0].map((header, index) => (
                    <TableCell key={index}>{header}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {excelData.slice(1).map((row, index) => (
                  <TableRow key={index}>
                    {row.map((cell, idx) => (
                      <TableCell key={idx}>{cell}</TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </div>
    );
  };
  
  export default ExcelReader;
  
  
