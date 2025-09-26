//worker

//library
import {
	VerifyUtil
} from "@midasit-dev/moaui";
import * as React from "react";

//component

//icon

import './Popup.css';
import { SelectLoadCombination } from "./SelectLoadCombination";

const typeValueOptions = [
	{ value: 0, label: "Add" },
	{ value: 1, label: "Envelope" },
	{ value: 2, label: "ABS" },
	{ value: 3, label: "SRSS" },
];
const activeValueOptions = ["ACTIVE", "INACTIVE"];

const defaultCombValues = {
	type: 0,
	name: "New Comb",
	number: 0,
	active: "ACTIVE",
	data: [],
};

const LCComponents = ({ onClose }) => {
	// const ref = React.useRef({});
	// const { enqueueSnackbar } = useSnackbar();
	// const gridRef = useGridApiRef();

	// const [lcomList, setLcomList] = React.useState([]);
	// const [userLcomList, setUserLcomList] = React.useState([]);
	// //const [requestData, setRequestData] = React.useState(false);

	// // const [numberPadLeft, setNumberPadLeft] = React.useState(1);

	// //States	
	// const [combActive, setCombActive] = React.useState(defaultCombValues.active);
	// const [combType, setCombType] = React.useState(defaultCombValues.type);
	// const [combName, setCombName] = React.useState(defaultCombValues.name);
	// const [combNameLocked, setCombNameLocked] = React.useState(false);
	// const [combNumber, setCombNumber] = React.useState(defaultCombValues.number);
	const [openFormDlg, setOpenFormDlg] = React.useState(false);

	// const [isModifyMode, setModifyMode] = React.useState(false);
	// const [isLcomLoading, setLcomLoading] = React.useState(false);

	// const isPortrate = mui.useMediaQuery('(orientation: portrait)');

	// const loadLcom = React.useCallback(async () => {
	// 	setLcomLoading(true);
	// 	const result = await LCOM.DataRawLoader({ user: userLcomList });
	// 	setLcomLoading(false);
	// 	if (!result) return;
	// 	setLcomList(result);
	// }, [userLcomList]);

	React.useEffect(() => {
		if (!VerifyUtil.isExistQueryStrings('redirectTo') && !VerifyUtil.isExistQueryStrings('mapiKey')) {
			setOpenFormDlg(true);
		}
	}, []);

	// React.useEffect(() => {
	// 	if (VerifyUtil.isExistQueryStrings('mapiKey')) loadLcom();
	// }, [loadLcom]);

	// React.useEffect(() => {
	// 	try {
	// 		if (VerifyUtil.isExistQueryStrings('mapiKey')) {
	// 			const newLcomList = [...lcomList];

	// 			if (newLcomList.length === 0) {
	// 				setCombNumber(1);
	// 				setCombName(`${defaultCombValues.name} 1`);
	// 			}

	// 			if (newLcomList.length > 0) {
	// 				const lcomListLength = newLcomList.length;
	// 				const lastItem = newLcomList[lcomListLength - 1];
	// 				const lastItemNumber = lastItem.key * 1 + 1;
	// 				setCombNumber(lastItemNumber);
	// 				// setNumberPadLeft(String(lcomListLength).length);
	// 				setCombName(`${defaultCombValues.name} ${lastItemNumber}`);
	// 			}
	// 		}
	// 	} catch (_) { }
	// }, [lcomList, userLcomList]);

	// // const setCombValue = React.useCallback((props) => {
	// // 	const { name, type, number, active, locked } = props;
	// // 	setCombName(name);
	// // 	setCombType(type);
	// // 	setCombNumber(number);
	// // 	setCombActive(active);
	// // 	setCombNameLocked(locked);

	// // 	if (props?.data) setCombData(props?.data);
	// // }, []);

	// // setCombValue.defaultProps = defaultCombValues;

	// // const handleEdit = React.useCallback((params) => {
	// // 	let combValue = { data: [] };

	// // 	try {
	// // 		const vComb = params.row.vCOMB;
	// // 		combValue.data = vComb.map((value) => makeCombData(value));

	// // 		let name = params.row.NAME;
	// // 		combValue.name = name;
	// // 		combValue.type = params.row.iTYPE;
	// // 		combValue.number = params.row.key;
	// // 		combValue.active = params.row.ACTIVE;
	// // 		combValue.locked = true;
	// // 	} catch (_) {
	// // 		console.log(_);
	// // 	}

	// // 	setModifyMode(true);
	// // 	setIsAddCombinationStatus(false);
	// // 	setIsClickedLcomTableCell(true);
	// // 	setCombValue(combValue);
	// // }, [setCombValue]);

	// // const handleCopy = React.useCallback(
	// // 	(params) => {
	// // 		let combValue = { data: [] };

	// // 		try {
	// // 			const vCombData = params.row.vCOMB;
	// // 			combValue.data = vCombData.map((value) => makeCombData(value));

	// // 			const rawName = params.row.NAME;
	// // 			let newCombName = processToken({ name: rawName });

	// // 			combValue.name = newCombName;
	// // 			combValue.type = params.row.iTYPE;
	// // 			combValue.number = lcomList.length + 1;
	// // 			combValue.active = params.row.ACTIVE;
	// // 		} catch (_) {
	// // 			console.log(_);
	// // 		}

	// // 		setCombValue(combValue);
	// // 	},
	// // 	[lcomList.length, setCombValue]
	// // );

	// const handleRemove = React.useCallback(
	// 	(params) => {
	// 		let newUserLcomList = [...userLcomList];
	// 		const findResult = newUserLcomList.findIndex(
	// 			(value) => value.key === params.row.key
	// 		);
	// 		const newCombData = { ...params.row, markAsRemoved: true };
	// 		if (findResult !== -1) newUserLcomList[findResult] = newCombData;
	// 		else newUserLcomList.push(newCombData);

	// 		setUserLcomList(newUserLcomList);
	// 	},
	// 	[userLcomList]
	// );

	// // const initializeCombInput = React.useCallback(() => {
	// // 	setCombValue(defaultCombValues);
	// // 	setModifyMode(true);
	// // }, [setCombValue]);

	// // const refreshLocalComponent = React.useCallback(() => {
	// // 	ref.current.init();
	// // 	loadLcom();
	// // 	initializeCombInput();
	// // 	setModifyMode(false);
	// // 	gridRef.current.selectRow(-1, false, true);
	// // 	setIsAddCombinationStatus(false);
	// // 	setIsClickedLcomTableCell(false);
	// // }, [gridRef, initializeCombInput, loadLcom]);

	// // const handleNew = React.useCallback(() => {
	// // 	refreshLocalComponent();
	// // 	setModifyMode(false);
	// // 	setCombNumber(defaultCombValues.number);
	// // }, [refreshLocalComponent]);

	// // const handleRefreshData = React.useCallback(() => {
	// // 	setUserLcomList([]);
	// // 	ref.current.init();
	// // 	initializeCombInput();
	// // 	setModifyMode(false);
	// // 	gridRef.current.selectRow(-1, false, true);
	// // 	setIsAddCombinationStatus(false);
	// // 	setIsClickedLcomTableCell(false);
	// // }, [gridRef, initializeCombInput]);

	// const handleRegisterLcom = React.useCallback(() => {
	// 	if (combData.length === 0) {
	// 		enqueueSnackbar("No Load Case(s) in New Combination Panel.", {
	// 			variant: "error",
	// 		});
	// 		return;
	// 	}

	// 	const newUserLcomList = [...userLcomList];

	// 	if (!isModifyMode && newUserLcomList.find((value) => value.NAME === combName)) {
	// 		enqueueSnackbar(`"${combName}" already exists.`, { variant: "error" });
	// 		return;
	// 	}

	// 	let userLcomListItem = {
	// 		key: String(combNumber),
	// 		NAME: combName,
	// 		ACTIVE: combActive,
	// 		iTYPE: combType,
	// 	};

	// 	userLcomListItem.vCOMB = combData.map((value) => {
	// 		const name = value.NAME;

	// 		const startIdx = name.lastIndexOf("(");
	// 		const endIdx = name.lastIndexOf(")");

	// 		const analysisType = name.substring(startIdx + 1, endIdx);
	// 		const loadCaseName = name.substring(0, startIdx);

	// 		return { ANAL: analysisType, LCNAME: loadCaseName, FACTOR: value.FACTOR };
	// 	});

	// 	newUserLcomList.push(userLcomListItem);
	// 	setUserLcomList(newUserLcomList);
	// 	refreshLocalComponent();

	// 	enqueueSnackbar(`"${combName}" is added.`, { variant: "success", autoHideDuration: 1500 });
	// }, [combActive, combData, combName, combNumber, combType, enqueueSnackbar, isModifyMode, refreshLocalComponent, userLcomList]);

	// const handleReflectDataIntoCivil = React.useCallback(() => {
	// 	const awaiter = async () => {
	// 		const dataObject = {
	// 			Assign: {},
	// 		};

	// 		for (const value of lcomList) {
	// 			dataObject["Assign"][value.key] = { ...value };
	// 		}

	// 		const bodyString = JSON.stringify(dataObject);
	// 		const targetUrl = "/db/LCOM-GEN";
	// 		await sendData(targetUrl, bodyString, "PUT");
	// 	};

	// 	awaiter();
	// }, [lcomList]);

	// const handleOverwriteDataIntoCivil = React.useCallback(() => {
	// 	const awaiter = async () => {
	// 		//delete LCOM-GEN
	// 		await sendData("/db/LCOM-GEN", "", "DELETE");

	// 		//put LCOM-GEN
	// 		const dataObject = { Assign: {} };
	// 		for (const value of lcomList) dataObject["Assign"][value.key] = { ...value };
	// 		await sendData('/db/LCOM-GEN', JSON.stringify(dataObject), "PUT");

	// 		setOverwriteDlgOpen(false);

	// 		handleReflectDataIntoCivil();
	// 	};

	// 	awaiter();
	// }, [handleReflectDataIntoCivil, lcomList]);

	// const [overwriteDlgOpen, setOverwriteDlgOpen] = React.useState(false);
	// const [isAddCombinationStatus, setIsAddCombinationStatus] = React.useState(false);
	// const [isClickedLcomTableCell, setIsClickedLcomTableCell] = React.useState(false);


	const handleSaveClick = (selected) => {
		onClose(selected);

	}
	return (
		<div style={{ width: "100%", height: '100%', display: "flex", justifyContent: "center" }}>
			<div className="popup-overlay" >
				<div className="popup-content">
					<SelectLoadCombination
						//combData={combData}
						//setDataRequested={setRequestData}
						//updateCombData={setCombData}
						//additionalData={{ LCOM: userLcomList }}
						//setIsAddCombinationStatus={setIsAddCombinationStatus}
						//isModifyMode={isModifyMode}
						onSaveClick={handleSaveClick}
					//isClickedLcomTableCell={isClickedLcomTableCell}
					//ref={ref}							
					/>
				</div>
			</div>
		</div>
	);
}

export default LCComponents;
