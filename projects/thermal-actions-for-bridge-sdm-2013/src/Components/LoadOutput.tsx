import React from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import { VarTabGroupMain, VarLoadCase_TUH, VarLoadCase_TUC, VarLoadCase_TGH, VarLoadCase_TGC, VarAdjOpt, VarDiffOpt, VarStldlist } from "./variables";
import { VarSuperType, VarStructType, VarDeckSurfType, VarDeckSurfThick, VarHeightSeaLevel } from "./variables";
import { TabGroup, Tab, GuideBox, Panel, Typography, DropList, Icon, Switch, IconButton, FloatingBox, TextFieldV2 } from "@midasit-dev/moaui";
import { checkPyScriptReady } from "../utils_pyscript";
import { enqueueSnackbar } from "notistack";

// UI 크기
const fieldwidth = 150;
const marginInput = 1;

// Uniformr과 Diffrence의 결과값을 보여주는 창이라고 할 수 있겠지?
const ResultsDetail = () => {

	const tempType = useRecoilValue(VarTabGroupMain);
	const superType = useRecoilValue(VarSuperType);
	const structType = useRecoilValue(VarStructType);
	const deckSurfType = useRecoilValue(VarDeckSurfType);
	const deckSurfThick = useRecoilValue(VarDeckSurfThick);
	const heightSeaLevel = useRecoilValue(VarHeightSeaLevel);
	const adjOpt = useRecoilValue(VarAdjOpt);
	const diffOpt = useRecoilValue(VarDiffOpt);

	const [resultTU, setResultTU] = React.useState<any>({
		'output': {
			"adj_height_temps": {
				"Tadj_max": 0,
				"Tadj_min": 0
			},
			"adj_type_temps":{
				"Tadj_max": 4,
				"Tadj_min": 0
			},
			"uni_temps":{
				"Te_max": 55,
				"Te_min": 0
			},
			"final_temp":{
				"Tcon": -30,
				"Texp": 49
			}
		}
	});
	const [resultTG, setResultTG] = React.useState<any>({
		"T1_c": -5,
		"T1_h": 39,
		"T2_h": 21,
		"T3_h": 8,
		"T4_h": 4
	});

	const [sectHeight, setSectHeight] = React.useState(600);
	const [slabHeight, setSlabHeight] = React.useState(200);

	//TU
	const [Te_max, setTe_max] = React.useState(0);
	const [Te_min, setTe_min] = React.useState(0);
	const [Tadj_surf_max, setTadj_surf_max] = React.useState(0);
	const [Tadj_surf_min, setTadj_surf_min] = React.useState(0);
	const [Tadj_height_max, setTadj_height_max] = React.useState(0);
	const [Tadj_height_min, setTadj_height_min] = React.useState(0);
	const [Texp, setTexp] = React.useState(0);
	const [Tcon, setTcon] = React.useState(0);
	// TG - group 1
	const [g1T1_h, setG1T1_h] = React.useState(0);
	const [g1T2_h, setG1T2_h] = React.useState(0);
	const [g1T3_h, setG1T3_h] = React.useState(0);
	const [g1T4_h, setG1T4_h] = React.useState(0);
	const [g1T1_c, setG1T1_c] = React.useState(0);
	// TG - group 2
	const [g2T1_h, setG2T1_h] = React.useState(0);
	const [g2T2_h, setG2T2_h] = React.useState(0);
	const [g2T1_c, setG2T1_c] = React.useState(0);
	const [g2T2_c, setG2T2_c] = React.useState(0);
	const [g2h1_h, setG2h1_h] = React.useState(0);
	const [g2h1_c, setG2h1_c] = React.useState(0);
	// TG - group 3
	const [g3T1_h, setG3T1_h] = React.useState(0);
	const [g3T2_h, setG3T2_h] = React.useState(0);
	const [g3T3_h, setG3T3_h] = React.useState(0);
	const [g3T1_c, setG3T1_c] = React.useState(0);
	const [g3T2_c, setG3T2_c] = React.useState(0);
	const [g3T3_c, setG3T3_c] = React.useState(0);
	const [g3T4_c, setG3T4_c] = React.useState(0);
	const [g3h1_h, setG3h1_h] = React.useState(0);
	const [g3h2_h, setG3h2_h] = React.useState(0);
	const [g3h3_h, setG3h3_h] = React.useState(0);
	const [g3h1_c, setG3h1_c] = React.useState(0);
	const [g3h2_c, setG3h2_c] = React.useState(0);
	const [g3h3_c, setG3h3_c] = React.useState(0);
	const [g3h4_c, setG3h4_c] = React.useState(0);

	// 높이에 따른 결과값 보정
	React.useEffect(() => {
		// Group 2
		setG2h1_h(slabHeight*0.75);
		setG2h1_c(slabHeight*0.60);
		// Group 3
		setG3h1_h(()=>{
			return Math.min(sectHeight*0.4, 150)});
		setG3h2_h(()=>{
			return Math.max(Math.min(sectHeight*0.4, 250), 80)});
		setG3h3_h(()=>{
			let h1 = Math.min(sectHeight*0.4, 150);
			let h2 = Math.max(Math.min(sectHeight*0.4, 250), 80)
			let h3 = 0
			if (deckSurfType === "thickness") {
				h3 = sectHeight*0.1 + deckSurfThick;
			} else {
				h3 = sectHeight*0.1;
			}
			let h3_final = Math.min(h3, sectHeight-h1-h2);
			return h3_final
		});
		setG3h1_c(()=>{
			return Math.min(sectHeight*0.2, 250)});
		setG3h2_c(()=>{
			return Math.max(sectHeight*0.25, 400)});
		setG3h3_c(()=>{
			return Math.max(sectHeight*0.15, 400)});
		setG3h4_c(()=>{
			return Math.min(sectHeight*0.2, 250)});
	},[sectHeight, slabHeight, deckSurfType, deckSurfThick]);

	// 결과값 계산
	React.useEffect(() => {
		checkPyScriptReady(() => {
			let uni_json_input = {
				"super_type": superType,
				"struct_type": structType,
				"deck_surf_type": deckSurfType,
				"deck_surf_thick": deckSurfThick,
				"height_sea_level": heightSeaLevel,
				"adj_option": adjOpt,
			}
			const mainTU = pyscript.interpreter.globals.get('print_result_uniform');
			const resTU = mainTU(JSON.stringify(uni_json_input));
			const resTU_json = JSON.parse(resTU);
			setResultTU(JSON.parse(resTU));
			console.log(resultTU);

			setTe_max(resTU_json['output']['uni_temps']['Te_max']);
			setTe_min(resTU_json['output']['uni_temps']['Te_min']);
			setTadj_surf_max(resTU_json['output']['adj_type_temps']['Tadj_max']);
			setTadj_surf_min(resTU_json['output']['adj_type_temps']['Tadj_min']);
			setTadj_height_max(resTU_json['output']['adj_height_temps']['Tadj_max']);
			setTadj_height_min(resTU_json['output']['adj_height_temps']['Tadj_min']);
			setTexp(resTU_json['output']['final_temp']['Texp']);
			setTcon(resTU_json['output']['final_temp']['Tcon']);

			let diff_json_input = {
				"super_type": superType,
				"deck_surf_type": deckSurfType,
				"deck_surf_thick": deckSurfThick,
				"diff_option": diffOpt,
				"sect_height": sectHeight
			}


			const mainTG = pyscript.interpreter.globals.get('print_result_differ');
			const resTG = mainTG(JSON.stringify(diff_json_input));
			const resTG_json = JSON.parse(resTG);
			setResultTG(JSON.parse(resTG));
			console.log(resultTG);

			if (superType === 1) {
				setG1T1_h(resTG_json['T1_h']);
				setG1T2_h(resTG_json['T2_h']);
				setG1T3_h(resTG_json['T3_h']);
				setG1T4_h(resTG_json['T4_h']);
				setG1T1_c(resTG_json['T1_c']);
			}
			else if (superType === 2) {
				setG2T1_h(resTG_json['T1_h']);
				setG2T2_h(resTG_json['T2_h']);
				setG2T1_c(resTG_json['T1_c']);
				setG2T2_c(resTG_json['T2_c']);
			}
			else if (superType === 3) {
				setG3T1_h(resTG_json['T1_h']);
				setG3T2_h(resTG_json['T2_h']);
				setG3T3_h(resTG_json['T3_h']);
				setG3T1_c(resTG_json['T1_c']);
				setG3T2_c(resTG_json['T2_c']);
				setG3T3_c(resTG_json['T3_c']);
				setG3T4_c(resTG_json['T4_c']);
			}
			
		});
	},[tempType, superType, structType, deckSurfType, deckSurfThick, heightSeaLevel, adjOpt, diffOpt, sectHeight]);
	
	if (tempType === "Uniform") {
		return (
			<>
			<Typography paddingBottom={0.5} ><i>Uniform Bridge Temperature</i></Typography>
			<Typography paddingLeft={1} paddingBottom={1.5}><i>Te,max = {Te_max.toFixed(1)} ℃; &nbsp;&nbsp;&nbsp; Te,min = {Te_min.toFixed(1)}  ℃</i></Typography>
			<Typography paddingBottom={0.5} ><i>Adjustment to Uniform Bridge Temperature</i></Typography>
			<Typography paddingLeft={1} paddingBottom={0.5}><i>Tadj,surf,max = {Tadj_surf_max.toFixed(1)} ℃; &nbsp;&nbsp;&nbsp; Tadj,surf,min = {Tadj_surf_min.toFixed(1)} ℃</i></Typography>
			<Typography paddingLeft={1} paddingBottom={1.5}><i>Tadj,high,max = {Tadj_height_max.toFixed(1)} ℃; &nbsp;&nbsp;&nbsp; Tadj,high,min = {Tadj_height_min.toFixed(1)} ℃</i></Typography>
			<Typography paddingBottom={0.5} ><i>Initial Uniform Bridge Temperature</i></Typography>
			<Typography paddingLeft={1} paddingBottom={1.5}><i>Ti,max = 10.0 ℃; &nbsp;&nbsp;&nbsp; Ti,min = 30.0  ℃</i></Typography>
			<Typography paddingBottom={0.5} ><i>Final Uniform Bridge Temperature</i></Typography>
			<Typography paddingLeft={1} paddingBottom={0.5}><i>ΔTexp = ({Te_max.toFixed(1)} + {Tadj_surf_max.toFixed(1)} + {Tadj_height_max.toFixed(1)}) - 10.0 = {Texp.toFixed(1)} ℃</i></Typography>
			<Typography paddingLeft={1} paddingBottom={0.5}><i>ΔTcon = ({Te_min.toFixed(1)} + {Tadj_surf_min.toFixed(1)} + {Tadj_height_min.toFixed(1)}) - 30.0 = {Tcon.toFixed(1)} ℃</i></Typography>
			</>
		);
	} else if (tempType === "Differ") {
		if (superType === 1) {

			return (
				<>
				<GuideBox width="100%" row horSpaceBetween verCenter>
					<Typography>
						<i>Section Height</i>
					</Typography>
					<GuideBox width={150} row horSpaceBetween verCenter>
						<TextFieldV2
							type="number"
							width={120}
							defaultValue={"600"}
							onChange={(e: any) => setSectHeight(Number(e.target.value))}
							numberOptions={{
								min: 600,
								step: 1,
								onlyInteger: false,
								condition: {
									min: "greater"
								}
							}}
							disabled={true}
						/>
						<Typography>
							mm
						</Typography>
					</GuideBox>
				</GuideBox>
				<Typography paddingBottom={0.5} paddingTop = {1}><i>Heating</i></Typography>
				<Typography paddingLeft={1} paddingBottom={0.5}><i>ΔT1 = {g1T1_h.toFixed(1)} ℃; &nbsp;&nbsp;&nbsp; h1 = 100.0 mm</i></Typography>
				<Typography paddingLeft={1} paddingBottom={0.5}><i>ΔT2 = {g1T2_h.toFixed(1)} ℃; &nbsp;&nbsp;&nbsp; h2 = 200.0 mm</i></Typography>
				<Typography paddingLeft={1} paddingBottom={0.5}><i>ΔT3 = {g1T3_h.toFixed(1)} ℃; &nbsp;&nbsp;&nbsp; h3 = 300.0 mm</i></Typography>
				<Typography paddingLeft={1} paddingBottom={1.5}><i>ΔT4 = {g1T4_h.toFixed(1)} ℃;</i></Typography>
				<Typography paddingBottom={0.5} paddingTop = {1}><i>Cooling</i></Typography>
				<Typography paddingLeft={1} paddingBottom={0.5}><i>ΔT1 = {g1T1_c.toFixed(1)} ℃; &nbsp;&nbsp;&nbsp; h1 = 500.0 mm</i></Typography>
				</>
			);
		} else if (superType === 2) {
			return (
				<>
				<GuideBox width="100%" row horSpaceBetween verCenter>
					<Typography>
						<i>Slab Height</i>
					</Typography>
					<GuideBox width={150} row horSpaceBetween verCenter>
						<TextFieldV2
							type="number"
							width={120}
							defaultValue={"200"}
							onChange={(e: any) => setSlabHeight(Number(e.target.value))}
							numberOptions={{
								min: 0,
								step: 1,
								onlyInteger: false,
								condition: {
									min: "greater"
								}
							}}
							disabled={false}
						/>
						<Typography>
							mm
						</Typography>
					</GuideBox>
				</GuideBox>
				<Typography paddingBottom={0.5} paddingTop = {1}><i>Heating</i></Typography>
				<Typography paddingLeft={1} paddingBottom={0.5}><i>ΔT1 = {g2T1_h.toFixed(1)} ℃; &nbsp;&nbsp;&nbsp; h1 = {g2h1_h.toFixed(1)} mm</i></Typography>
				<Typography paddingLeft={1} paddingBottom={0.5}><i>ΔT2 = {g2T2_h.toFixed(1)} ℃; &nbsp;&nbsp;&nbsp; h2 = 400.0 mm</i></Typography>
				<Typography paddingBottom={0.5} paddingTop = {1}><i>Cooling</i></Typography>
				<Typography paddingLeft={1} paddingBottom={0.5}><i>ΔT1 = {g2T1_c.toFixed(1)} ℃; &nbsp;&nbsp;&nbsp; h1 = {g2h1_c.toFixed(1)} mm</i></Typography>
				<Typography paddingLeft={1} paddingBottom={0.5}><i>ΔT2 = {g2T2_c.toFixed(1)} ℃; &nbsp;&nbsp;&nbsp; h2 = 400.0 mm</i></Typography>
				</>
			);
		} else if (superType === 3) {
			return (
				<>
				<GuideBox width="100%" row horSpaceBetween verCenter>
					<Typography>
						<i>Section Height</i>
					</Typography>
					<GuideBox width={150} row horSpaceBetween verCenter>
						<TextFieldV2
							type="number"
							width={120}
							defaultValue={"600"}
							onChange={(e: any) => setSectHeight(Number(e.target.value))}
							numberOptions={{
								min: 135,
								step: 1,
								onlyInteger: false,
								condition: {
									min: "greater"
								}
							}}
							disabled={false}
						/>
						<Typography>
							mm
						</Typography>
					</GuideBox>
				</GuideBox>
				<Typography paddingBottom={0.5} paddingTop = {1}><i>Heating</i></Typography>
				<Typography paddingLeft={1} paddingBottom={0.5}><i>ΔT1 = {g3T1_h.toFixed(1)} ℃; &nbsp;&nbsp;&nbsp; h1 = {g3h1_h.toFixed(1)} mm</i></Typography>
				<Typography paddingLeft={1} paddingBottom={0.5}><i>ΔT2 = {g3T2_h.toFixed(1)} ℃; &nbsp;&nbsp;&nbsp; h2 = {g3h2_h.toFixed(1)} mm</i></Typography>
				<Typography paddingLeft={1} paddingBottom={1.5}><i>ΔT3 = {g3T3_h.toFixed(1)} ℃; &nbsp;&nbsp;&nbsp; h3 = {g3h3_h.toFixed(1)} mm</i></Typography>
				<Typography paddingBottom={0.5} paddingTop = {1}><i>Cooling</i></Typography>
				<Typography paddingLeft={1} paddingBottom={0.5}><i>ΔT1 = {g3T1_c.toFixed(1)} ℃; &nbsp;&nbsp;&nbsp; h1 = {g3h1_c.toFixed(1)} mm</i></Typography>
				<Typography paddingLeft={1} paddingBottom={0.5}><i>ΔT2 = {g3T2_c.toFixed(1)} ℃; &nbsp;&nbsp;&nbsp; h2 = {g3h2_c.toFixed(1)} mm</i></Typography>
				<Typography paddingLeft={1} paddingBottom={0.5}><i>ΔT3 = {g3T3_c.toFixed(1)} ℃; &nbsp;&nbsp;&nbsp; h3 = {g3h3_c.toFixed(1)} mm</i></Typography>
				<Typography paddingLeft={1} paddingBottom={1.5}><i>ΔT4 = {g3T4_c.toFixed(1)} ℃; &nbsp;&nbsp;&nbsp; h4 = {g3h4_c.toFixed(1)} mm</i></Typography>
				</>
			);
		}
	}
};

// Uniformr과 Diffrence의 공통된 결과 화면
// 입력값 등을 함수로 받아서 처리
const ResultsTemp = (
	loadCaseH: any,
	setLoadCaseH: any,
	loadCaseC: any,
	setLoadCaseC: any,
	opt: any,
	setOpt: any,
	lcList: any,
	getlclist: any,
	loadName: any) => {
	
	return (
		<GuideBox width="100%" column spacing={1}>
			{/* 제목과 계산 옵션을 정하자 */}
			<GuideBox width="100%" row horSpaceBetween verCenter>
				<Typography variant="h1">
					Thermal Action
				</Typography>
				<GuideBox width={150} row horRight verCenter>
					<Typography>{opt ? "Linear Interpolation" : "Ceiling Method"}</Typography>
					<Switch 
						checked={opt}
						onChange={() => setOpt(!opt)}
						// label={opt ? "Linear Interpolation" : "Ceiling Method"}
						disabled={false}
					/>
				</GuideBox>
			</GuideBox>
			<Panel width="100%" height={250} variant="box" relative>
				<FloatingBox
					show fill="2" guideBoxProps={{ padding: 2 }} height='100%' width='100%'
					x={0} y={0}
				>
				{ResultsDetail()}
				</FloatingBox>
			</Panel>
			{/* Load Case를 선택하자 */}
			<GuideBox width="100%" row horSpaceBetween verCenter paddingTop={1}>
				<Typography variant="h1">
					Load Cases to Apply to Select Elements
				</Typography>
				<IconButton onClick={getlclist}>
					<Icon iconName="Refresh" />
				</IconButton>
			</GuideBox>
			<GuideBox width="100%" row horSpaceBetween verCenter>
				<Typography marginLeft={marginInput}>
					{loadName[0]}
				</Typography>
				<DropList
					itemList={lcList}
					width={fieldwidth}
					value={loadCaseH}
					onChange={(e: any) => setLoadCaseH(e.target.value)}
				/>
			</GuideBox>
			<GuideBox width="100%" row horSpaceBetween verCenter>
				<Typography marginLeft={marginInput}>
					{loadName[1]}
				</Typography>
				<DropList
					itemList={lcList}
					width={fieldwidth}
					value={loadCaseC}
					onChange={(e: any) => setLoadCaseC(e.target.value)}
				/>
			</GuideBox>
		</GuideBox>
	);
}

// LoadOutput 컴포넌트
const LoadOutput = () => {
	const [value, setValue] = useRecoilState(VarTabGroupMain);

	// Assigned Load Cases
	const [loadCase_TUH, setLoadCase_TUH] = useRecoilState(VarLoadCase_TUH);
	const [loadCase_TUC, setLoadCase_TUC] = useRecoilState(VarLoadCase_TUC);
	const [loadCase_TGH, setLoadCase_TGH] = useRecoilState(VarLoadCase_TGH);
	const [loadCase_TGC, setLoadCase_TGC] = useRecoilState(VarLoadCase_TGC);

	// 계산 옵션
	const [adjOpt, setAdjOpt] = useRecoilState(VarAdjOpt);
	const [diffOpt, setDiffOpt] = useRecoilState(VarDiffOpt);

	// 하중 케이스 리스트
	const [stldlist, setStldlist] = useRecoilState(VarStldlist);

	// 하중 케이스 리스트를 가져오는 함수
	function getLoadCaseList() {
		checkPyScriptReady(()=>{
			const main = pyscript.interpreter.globals.get('stldlist');
			const result = main();
			const result_json = JSON.parse(result);
			if ("error" in result_json) {
				enqueueSnackbar(result_json["error"]["message"], { variant: "error" });
			} else if ("success" in result_json) {
				enqueueSnackbar(result_json["success"]["message"], { variant: "success" });
				setStldlist(result_json["success"]["stld_list"]);
			}	
		});
	}

	// 하중 케이스 이름
	const lcnameUniform = ["Load Case for Expansion", "Load Case for Contraction"];
	const lcnameDifference = ["Load Case for Heating", "Load Case for Cooling"];

	// 시작할 때 하중 케이스 리스트를 가져오자
	React.useEffect(() => {
		getLoadCaseList();
	},[]);

	return (
		<GuideBox show={false} width='100%'>
			<Panel variant="shadow2" width="100%"> 
				<GuideBox width="100%" column spacing={1}>
					<TabGroup
						// orientation="vertical"
						value={value}
						onChange={(event: React.SyntheticEvent, newValue: string) => setValue(newValue)}
					>
						<Tab value="Uniform" label="Uniform" />
						<Tab value="Differ" label="Differences" />
					</TabGroup>
					{value === "Uniform" && ResultsTemp(loadCase_TUH, setLoadCase_TUH, loadCase_TUC, setLoadCase_TUC, adjOpt, setAdjOpt, stldlist, getLoadCaseList, lcnameUniform)}
					{value === "Differ" && ResultsTemp(loadCase_TGH, setLoadCase_TGH, loadCase_TGC, setLoadCase_TGC, diffOpt, setDiffOpt, stldlist, getLoadCaseList, lcnameDifference)}
				</GuideBox>
			</Panel>
		</GuideBox>
	);
};

export default LoadOutput;
