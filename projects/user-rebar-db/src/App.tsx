import { Panel, DataGrid, Typography, GuideBox } from "@midasit-dev/moaui";

const ComponentsDataGridPagination = () => {
	return (
		<Panel>
			<GuideBox spacing={5} padding={2}>
				<GuideBox spacing={2}>
					<Typography variant="h1" size="large">Material</Typography>
					<DataGrid 
						rows={rowsMatl}
						columns={columnsMatl}
						hideFooter
					/>
				</GuideBox>

				<GuideBox spacing={2}>
					<Typography variant="h1" size="large">Diameter</Typography>
					<DataGrid 
						rows={rowsDia}
						columns={columnsDia}
						hideFooter
					/>
				</GuideBox>
			</GuideBox>
		</Panel>
	);
}

export default ComponentsDataGridPagination;

	const columnsMatl = [
		{ field: 'matlname', headerName: 'MATLNAME', width: 100, editable: true, },
		{ field: 'elast', headerName: 'ELAST', width: 100, editable: true },
		{ field: 'densidy', headerName: 'DENSIDY', width: 100, editable: true,  },
		{ field: 'fy', headerName: 'FY', width: 100, editable: true,  },
	];

	const rowsMatl = [
    { id: 1, matlname: 'Steel', elast: 200000, densidy: 7850, fy: 250 },
    { id: 2, matlname: 'Concrete', elast: 30000, densidy: 2400, fy: 40 },
    { id: 3, matlname: 'Aluminum', elast: 70000, densidy: 2700, fy: 150 },
    { id: 4, matlname: 'Wood', elast: 11000, densidy: 600, fy: 30 },
    { id: 5, matlname: 'Glass', elast: 72000, densidy: 2500, fy: 10 },
    { id: 6, matlname: 'Rubber', elast: 100, densidy: 1500, fy: 5 },
    { id: 7, matlname: 'Copper', elast: 110000, densidy: 8960, fy: 70 },
    { id: 8, matlname: 'Titanium', elast: 116000, densidy: 4500, fy: 140 },
    { id: 9, matlname: 'Brass', elast: 97000, densidy: 8500, fy: 90 },
    { id: 10, matlname: 'Carbon Fiber', elast: 70000, densidy: 1600, fy: 500 },
	];

const columnsDia = [
    { field: 'dianame', headerName: 'DIANAME', width: 100, editable: true },
    { field: 'dia', headerName: 'DIA', width: 100, editable: true },
    { field: 'area', headerName: 'AREA', width: 100 },
    { field: 'unitweight', headerName: 'UNITWEIGHT', width: 100 },
];

const rowsDia = [
    { id: 1, dianame: 'uD4', dia: 4.23, area: 14.05, unitweight: 0.0010787315 },
    { id: 2, dianame: 'uD6', dia: 6.35, area: 31.67, unitweight: 0.002432 },
    { id: 3, dianame: 'uD8', dia: 8.00, area: 50.27, unitweight: 0.00395 },
    { id: 4, dianame: 'uD10', dia: 10.16, area: 81.07, unitweight: 0.00635 },
    { id: 5, dianame: 'uD12', dia: 12.70, area: 126.68, unitweight: 0.0099 },
    { id: 6, dianame: 'uD16', dia: 16.00, area: 201.06, unitweight: 0.0158 },
    { id: 7, dianame: 'uD20', dia: 20.32, area: 324.29, unitweight: 0.0254 },
    { id: 8, dianame: 'uD25', dia: 25.40, area: 506.71, unitweight: 0.0397 },
    { id: 9, dianame: 'uD32', dia: 32.00, area: 804.25, unitweight: 0.0628 },
    { id: 10, dianame: 'uD40', dia: 40.00, area: 1256.64, unitweight: 0.098 },
];
