import MoaButton from "@midasit-dev/moaui/Components/Button";
import MoaStack from "@midasit-dev/moaui/Components/Stack";
import Typography from "@midasit-dev/moaui/Components/Typography";
import { useSnackbar } from "notistack";
import * as React from "react";
import { makeObject, setStateUpdate } from "../utils";
import { ListComponent } from "./ListComponent";

import { DropList, GuideBox, Panel, TextField, VerifyUtil } from "@midasit-dev/moaui";
import { useRecoilState } from "recoil";
import { VarLCType, VarLoadCombination, VarSelectLCCS, VarSelectLCStep, VarSelectLCType } from "../Components/var";
import * as CSCS from "../Workers/ConstructStageWorker";
import { DataLoader } from "../Workers/DataLoader";
import * as LCOM from "../Workers/LoadCombinationWorker";
import * as MSHP from "../Workers/ModeNumbersWorker";
import * as MVLD from "../Workers/MovingLoadWorker";
import * as SPLC from "../Workers/ResponseSpectrumWorker";
import * as SMLC from "../Workers/SettlementWorker";
import * as STLD from "../Workers/StaticLoadWorker";
import * as THIS from "../Workers/TimeHistoryWorker";

const awaiter = async (setPending, setListData, func, cmd) => {
	try {
		setPending(true);
		if (VerifyUtil.getMapiKey() !== "") setListData(await func(cmd));
		setPending(false);
	} catch (_) {
		console.log(_);
	}
};


export const SelectLoadCombination = React.forwardRef((props, ref) => {
	const [combData, setCombData] = useRecoilState(VarLoadCombination);
	const [stldList, setStldList] = React.useState([]);
	const [cscsList, setCscsList] = React.useState([]);
	const [mvldList, setMvldList] = React.useState([]);
	const [lcomListIA, setLcomListIA] = React.useState([]);
	const [lcomListActive, setLcomListActive] = React.useState([]);
	const [lcomListStr, setLcomListStr] = React.useState([]);
	const [lcomListSvc, setLcomListSvc] = React.useState([]);
	const [lcomListSpc, setLcomListSpc] = React.useState([]);
	const [lcomListVtc, setLcomListVtc] = React.useState([]);
	const [lcomListStrE, setLcomListStrE] = React.useState([]);
	const [smlcList, setSmlcList] = React.useState([]);
	const [splcList, setSplcList] = React.useState([]);
	const [thisList, setThisList] = React.useState([]);

	const [mdShpList, setMdShpList] = React.useState([]);

	const [doUpdate, setDoUpdate] = React.useState("");
	const [doUpdateLC, setDoUpdateLC] = React.useState("");
	const [lcType, setLcType] = useRecoilState(VarLCType)
	const [mvKeyElem, setMvKeyElem] = React.useState();
	const {
		onSaveClick
	} =
		props;
	const updateKit = { doUpdate: doUpdate, setDoUpdate: setDoUpdate };
	const updateKitLC = { doUpdate: doUpdateLC, setDoUpdate: setDoUpdateLC };
	const { enqueueSnackbar } = useSnackbar();

	const itemsLcType = ["All", "Add", "Envelope", "ABS", "SRSS"]

	const [cs, setCs] = useRecoilState(VarSelectLCCS);
	const [step, setStep] = useRecoilState(VarSelectLCStep);

	const [lcSubType, setLcSubType] = useRecoilState(VarSelectLCType);
	const lcTypeItems = ["General", "Steel Design", "Concrete Design", "SRC Design", "Composite Steel Girder Design", "Seismic"];

	const handleSave = () => {

		let cbStr = "(CB)";
		switch (lcType) {
			case "General":
				cbStr = "(CB)";
				break;
			case "Steel Design":
				cbStr = "(CBS)";
				break;
			case "Concrete Design":
				cbStr = "(CBC)";
				break;
			case "SRC Design":
				cbStr = "(CBR)";
				break;
			case "Composite Steel Girder Design":
				cbStr = "(CBSC)";
				break;
			case "Seismic":
				cbStr = "(CBSM)";
				break;
		}

		try {
			let newAllItems = [
				...makeObject(stldList, "(ST)"),
				...makeObject(cscsList, "(CS)"),
				...makeObject(mvldList, "(MV)"),
				...makeObject(lcomListActive, cbStr),
				...makeObject(lcomListIA, cbStr),
				...makeObject(lcomListStr, cbStr),
				...makeObject(lcomListSvc, cbStr),
				// ...makeObject(lcomListSpc, cbStr),
				// ...makeObject(lcomListVtc, cbStr),
				// ...makeObject(lcomListStrE, cbStr),
				...makeObject(smlcList, "(SM)"),
				...makeObject(splcList, "(RS)"),
				...makeObject(thisList, "(TH)"),
				...makeObject(mdShpList, "(MD)"),
			];

			if (newAllItems.length === 0) {
				enqueueSnackbar("No Load Cases selected.", { variant: "error" });
			} else {
				setCombData(newAllItems);
			}
			let csIndex;
			if (cs && step && itemsCS[cs]) {
				csIndex = itemsCS[cs].indexOf(step) + 1;
			}
			const result = {
				LC: newAllItems.map(x => x.NAME),
				CS: cs,
				Step: csIndex,
				MovingLoadKeyElement: mvKeyElem,
			}
			onSaveClick(result);
		} catch (e) {
			enqueueSnackbar("Error occured while adding checked item to list.", { variant: "error" });
		} finally {

			onSaveClick();
		}
	}

	const handleClose = () => {
		setCombData([]);
		onSaveClick();
	}

	const init = () => {
		setDoUpdate("INIT");
		setDoUpdateLC("INIT");
		setTimeout(() => {
			setDoUpdate("");
			setDoUpdateLC("");
		}, 200);
	};

	const updateLC = () => {
		setDoUpdateLC("INIT");
		setLcomListActive(lcomListActive);
		setTimeout(() => {
			setDoUpdateLC("");
		}, 200);
	};

	const onLcTypeChange = (lcType) => {
		setLcType(lcType);
		updateLC();

	}

	const onLcSubTypeChange = (type) => {
		setLcSubType(type);
		updateLC();

	}

	React.useImperativeHandle(ref, () => ({ init }));

	React.useEffect(() => { }, [lcType]);

	const [isPending, setPending] = React.useState(false);
	const [stag, setStag] = React.useState([]);
	const [nlct, setNlct] = React.useState([]);

	const [itemsCS, setItemsCS] = React.useState({});
	React.useEffect(() => {
		const loadStag = async () => {
			await awaiter(setPending, setStag, DataLoader, "/DB/STAG");
		};
		loadStag();

		const loadNLCT = async () => {
			await awaiter(setPending, setNlct, DataLoader, "/DB/NLCT");
		};
		loadNLCT();
	}, []);

	React.useEffect(() => {
		if (stag && stag["STAG"]) {
			const items = {};
			const map = new Map(Object.entries(stag["STAG"]));
			for (const [key, value] of map) {
				const steps = ["First Step"];
				if (value["ADD_STEP"]) {
					for (let i = 1; i <= value["ADD_STEP"].length; i++) {
						steps.push("User Step: " + i);
					}
				}
				steps.push("Last Step");
				items[value.NAME] = steps;
			}
			items["Min/Max"] = [];
			let postItems = [];
			if (nlct && nlct["NLCT"] && nlct["NLCT"][1]  ) {
				const ntItems = nlct["NLCT"][1]["NEWTON_ITEMS"];
				let max = 0;
				if (ntItems && ntItems.length > 0) {
					for (const item of ntItems) {
						const nStep = item["NUMBER_STEPS"];
						if (nStep > max)
							max = nStep;
					}
				}
				for (let i = 1; i <= max; i++) {
					postItems.push("NL Step: " + i);
				}
			}
			items["PostCS"] = postItems;
			setItemsCS(items);
		}
	}, [stag, nlct]);

	const handleUpload = React.useCallback((json, fileName) => {

		if (json["CS"])
			return;
		setCs(json["CS"]);
		setStep(json["STEP"]);
		setLcType(json["Type"]);
		setLcSubType(json["SubType"]);
		setStldList(json["StaticLoad"]);
		setCscsList(json["CSCS"]);
		setMvldList(json["MV"]);
		setSmlcList(json["SettlementLoad"]);
		setSplcList(json["RS"]);
		setThisList(json["TH"]);
		setMdShpList(json["MD"]);
		setLcomListActive(json["Active"]);
		setLcomListIA(json["Inactive"]);
		setLcomListStr(json["Strength"]);
		setLcomListSvc(json["Service"]);
		setMvKeyElem(json["MVElemKey"]);
	}, []);

	const getDownloadJson = () => {

		const json = {
			CS: cs,
			STEP: step,
			Type: lcType,
			SubType: lcSubType,
			StaticLoad: stldList,
			CSCS: cscsList,
			MV: mvldList,
			SettlementLoad: smlcList,
			RS: splcList,
			TH: thisList,
			MD: mdShpList,
			Active: lcomListActive,
			Inactive: lcomListIA,
			Strength: lcomListStr,
			Service: lcomListSvc,
			MVElemKey: mvKeyElem,
		};
		return json;
	};

	return (
		<Panel
			width="100%"
			variant="shadow2"
			border={
				// isClickedLcomTableCell ? 
				// `1px solid ${Color.primaryNegative.enable_strock}` : 
				'1px solid #eee'
			}
		>
			<GuideBox spacing={2}>
				<MoaStack direction="row" width="100%" height="100%" spacing={1}>
					<MoaStack width="100%" height="100%" spacing={1}>
						<GuideBox row verCenter horSpaceBetween>
							<Typography variant="body2">Load Case</Typography>
							<GuideBox row verCenter spacing={0.25}>
								<DropList itemList={() => {
									const map = new Map(Object.entries(itemsCS));
									const result = new Map();
									for (const [key, value] of map) {
										result.set(key, key);
									}
									return result;
								}} width={'233px'} value={cs} onChange={(e) => setCs(e.target.value)} ></DropList>
								<DropList itemList={() => {
									const result = new Map();
									if (itemsCS && itemsCS[cs]) {
										var items = itemsCS[cs];
										for (const item of items) {
											result.set(item, item);
										}
									}
									return result;
								}} width={'233px'} value={step} onChange={(e) => setStep(e.target.value)} ></DropList>
							</GuideBox>
						</GuideBox>
						<div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
							<MoaStack direction="row" spacing={0.25}>
								<ListComponent
									width="16.5%"
									label={"Static Load"}
									Loader={STLD.DataLoader}
									checkList={stldList}
									setCheckList={(l) => setStateUpdate(setStldList, l)}
									{...updateKit}
								/>
								<ListComponent
									width="16.5%"
									label={"Construction Stage"}
									Loader={CSCS.DataLoader}
									checkList={cscsList}
									setCheckList={(l) => setStateUpdate(setCscsList, l)}
									{...updateKit}
								/>
								<ListComponent
									width="16.5%"
									label={"Moving Load"}
									Loader={MVLD.DataLoader}
									checkList={mvldList}
									setCheckList={(l) => setStateUpdate(setMvldList, l)}
									{...updateKit}
								/>
								<ListComponent
									width="16.5%"
									label={"Settlement Load"}
									Loader={SMLC.DataLoader}
									checkList={smlcList}
									setCheckList={(l) => setStateUpdate(setSmlcList, l)}
									{...updateKit}
								/>
								<ListComponent
									width="16.5%"
									label={"Response Spectrum"}
									Loader={SPLC.DataLoader}
									checkList={splcList}
									setCheckList={(l) => setStateUpdate(setSplcList, l)}
									{...updateKit}
								/>
								<ListComponent
									width="16.5%"
									label={"Time History"}
									Loader={THIS.DataLoader}
									checkList={thisList}
									setCheckList={(l) => setStateUpdate(setThisList, l)}
									{...updateKit}
								/>
								<ListComponent
									width="16.5%"
									label={"Mode Numbers"}
									Loader={MSHP.DataLoader}
									checkList={mdShpList}
									setCheckList={(l) => setStateUpdate(setMdShpList, l)}
									{...updateKit}
								/>
							</MoaStack>
						</div>
					</MoaStack>
				</MoaStack>
				<MoaStack direction="row" width="100%" height="100%" spacing={1}>
					<MoaStack width="100%" height="100%" spacing={1}>
						<GuideBox row verCenter horSpaceBetween>
							<Typography variant="body2">Load Combination</Typography>
							<GuideBox row verCenter spacing={0.25}>
								<DropList itemList={() => {
									let map = new Map();
									for (const value of lcTypeItems) {
										map.set(value, value);
									}
									return map;
								}} width={'233px'} value={lcType} onChange={(e) => onLcTypeChange(e.target.value)} ></DropList>
								<DropList itemList={() => {
									let map = new Map();
									for (const value of itemsLcType) {
										map.set(value, value);
									}
									return map;
								}} width={'233px'} value={lcSubType} onChange={(e) => onLcSubTypeChange(e.target.value)} ></DropList>
							</GuideBox>
						</GuideBox>
						<div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
							<MoaStack direction="row" spacing={0.25}>
								<ListComponent
									width="25%"
									label={"Active"}
									Loader={LCOM.DataLoader}
									userData={[lcType, "ACTIVE", lcSubType]}
									checkList={lcomListActive}
									setCheckList={(l) => setStateUpdate(setLcomListActive, l)}
									{...updateKitLC}
								/>
								<ListComponent
									width="25%"
									label={"Inactive"}
									Loader={LCOM.DataLoader}
									userData={[lcType, "INACTIVE", lcSubType]}
									checkList={lcomListIA}
									setCheckList={(l) => setStateUpdate(setLcomListIA, l)}
									{...updateKitLC}
								/>
								<ListComponent
									width="25%"
									label={"Strength/Stress"}
									Loader={LCOM.DataLoader}
									userData={[lcType, "STRENGTH", lcSubType]}
									checkList={lcomListStr}
									setCheckList={(l) => setStateUpdate(setLcomListStr, l)}
									{...updateKitLC}
								/>
								<ListComponent
									width="25%"
									label={"Serviceability"}
									Loader={LCOM.DataLoader}
									userData={[lcType, "SERVICE", lcSubType]}
									checkList={lcomListSvc}
									setCheckList={(l) => setStateUpdate(setLcomListSvc, l)}
									{...updateKitLC}
								/>
							</MoaStack>
						</div>
						<TextField width={'470px'} title="Moving Load Key Element" titlePosition="left" value={mvKeyElem} onChange={(e) => setMvKeyElem(e.target.value)} />
					</MoaStack>
				</MoaStack>
				<MoaStack direction="row" width="100%" justifyContent="space-between" alignItems="center">
					<MoaStack direction="row" justifyContent="right" spacing={2}>
						{/* <AddFileButton onAfterUpload={handleUpload}>
							Upload File
						</AddFileButton>
						<TemplatesFunctionalComponentsDownloadButton valueToDownload={getDownloadJson()}>
							Download File
						</TemplatesFunctionalComponentsDownloadButton> */}
					</MoaStack>
					<GuideBox row spacing={1}>
						<MoaButton onClick={handleSave}>
							Save
						</MoaButton>
						<MoaButton
							onClick={() => {
								setDoUpdate("DESELECT");
								setDoUpdateLC("DESELECT");
							}}
						>
							Clear
						</MoaButton>
						<MoaButton onClick={handleClose}>
							Close
						</MoaButton>
					</GuideBox>

				</MoaStack>
			</GuideBox>
		</Panel>
	);
});
