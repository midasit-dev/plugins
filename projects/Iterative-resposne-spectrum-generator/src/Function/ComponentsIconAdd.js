import { Icon } from "@midasit-dev/moaui";
import React from 'react';
import * as XLSX from 'xlsx';
import { useSnackbar, SnackbarProvider } from "notistack";
const ComponentsIconAdd = ({ results, onDownload }) => {
    const { enqueueSnackbar } = useSnackbar();
    const handleIconClick = () => {
        // Create a new workbook
        if (Object.keys(results).length === 0) {
            enqueueSnackbar("Please run analysis first.", {
                variant: "warning",
                anchorOrigin: { vertical: "top", horizontal: "center" },
            });
            return;
        }
        const workbook = XLSX.utils.book_new();

        // Iterate over the results to create multiple sheets
        Object.keys(results).forEach(iteration => {
            const data = [
                ["Node", "Dx", "Dy", "Dz"], // Headers
                ...Object.entries(results[iteration]).map(([node, displacement]) => [
                    node,
                    displacement.Dx !== undefined ? displacement.Dx.toFixed(4) : "0.0000",
                    displacement.Dy !== undefined ? displacement.Dy.toFixed(4) : "0.0000",
                    displacement.Dz !== undefined ? displacement.Dz.toFixed(4) : "0.0000"
                ])
            ];

            // Convert data to a worksheet
            const worksheet = XLSX.utils.aoa_to_sheet(data);

            // Append the worksheet to the workbook
            XLSX.utils.book_append_sheet(workbook, worksheet, `Iteration ${iteration}`);
        });

        // Generate Excel file and create a Blob object
        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });

        // Create a link element and trigger the download
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'Iterations_results.xlsx';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Pass the Blob to the callback function for further processing
        if (onDownload) {
            onDownload(blob);
        }
    };

    return (
        <div onClick={handleIconClick} style={{ cursor: 'pointer' }}>
            <Icon iconName="GetApp" />
        </div>
    );
};

export default ComponentsIconAdd;