import React from "react";
import { useRecoilState } from "recoil";
import { VarSuperType, VarStructType, VarDeckSurfType, VarDeckSurfThick, VarHeightSeaLevel } from "./variables";
import { GuideBox, Typography, TextField, TextFieldV2, DropList, Panel, Icon } from "@midasit-dev/moaui";
import { HelpSuperstructType, HelpStructType, HelpSurfType } from "./Help";

const BasicInput = () => {
	
	// UI 크기
	const fieldwidth = 120;
	const fieldwidthWide = 150;
	const marginInput = 1;

	// Input 정리
	// Superstructure Type
	const [superType, setSuperType] = useRecoilState(VarSuperType);
	const superTypeList = new Map<string, number>([
		['Type 1', 1],
		['Type 2', 2],
		['Type 3', 3]
	]);

	// Structure Type
	const [structType, setStructType] = useRecoilState(VarStructType);
	const structTypeList = new Map<string, string>([
		['Normal', 'Normal'],
		['Minor', 'Minor']
	]);

	// Deck Surfacing Type
	const [deckSurfType, setDeckSurfType] = useRecoilState(VarDeckSurfType);
	const deckSurfTypeList = new Map<string, string>([
		['Plain', 'plain'],
		['Trafficked', 'trafficked'],
		['Waterproofed', 'waterproofed'],
		['Thickness', 'thickness']
	]);

	// Deck Surfacing Thickness
	const [deckSurfThick, setDeckSurfThick] = useRecoilState(VarDeckSurfThick);

	// Height above Sea Level
	const [heightSeaLevel, setHeightSeaLevel] = useRecoilState(VarHeightSeaLevel);

	// Deck Surfacing Type이 Thickness일 때만 Deck Surfacing Thickness를 입력할 수 있도록 설정
	const [deckSurfThickDisabled, setDeckSurfThickDisabled] = React.useState(false);
	React.useEffect(() => {
		setDeckSurfThickDisabled(deckSurfType !== 'thickness');
	},[deckSurfType])

	// Help Dialog
	const [open1, setOpen1] = React.useState(false);
	const [open2, setOpen2] = React.useState(false);
	const [open3, setOpen3] = React.useState(false);

	return (
		<GuideBox width='100%' column spacing={10}>
			<Panel variant="shadow2" width="100%">
				<GuideBox width="100%" column spacing={1}>
					{/* Input Title */}
					<Typography variant="h1">
						Basic Input
					</Typography>
					{/* Superstructure Type */}
					<GuideBox width="100%" row horSpaceBetween verCenter>
						<Typography marginLeft={marginInput}>
							Superstructure Type
						</Typography>
						<GuideBox width={fieldwidthWide} row horSpaceBetween verCenter>
							<DropList
								itemList={superTypeList}
								width={fieldwidth}
								value={superType}
								onChange={(e: any) => setSuperType(e.target.value)}
							/>
							<Icon iconName="HelpOutline" toButton onClick={() => setOpen1(true)} />
							{HelpSuperstructType(open1, setOpen1)}
						</GuideBox>
					</GuideBox>
					{/* Structure Type */}
					<GuideBox width="100%" row horSpaceBetween verCenter>
						<Typography marginLeft={marginInput}>
							Structure Type
						</Typography>
						<GuideBox width={fieldwidthWide} row horSpaceBetween verCenter>
							<DropList
								itemList={structTypeList}
								width={fieldwidth}
								value={structType}
								onChange={(e: any) => setStructType(e.target.value)}
							/>
							<Icon iconName="HelpOutline" toButton onClick={() => setOpen2(true)} />
							{HelpStructType(open2, setOpen2)}
						</GuideBox>
					</GuideBox>
					{/* Deck Surfacing Type */}
					<GuideBox width="100%" row horSpaceBetween verCenter>
						<Typography marginLeft={marginInput}>
							Deck Surfacing Type
						</Typography>
						<GuideBox width={fieldwidthWide} row horSpaceBetween verCenter>
							<DropList
								itemList={deckSurfTypeList}
								width={fieldwidth}
								value={deckSurfType}
								onChange={(e: any) => setDeckSurfType(e.target.value)}
							/>
							<Icon iconName="HelpOutline" toButton onClick={() => setOpen3(true)} />
							{HelpSurfType(open3, setOpen3)}
						</GuideBox>
					</GuideBox>
					{/* Deck Surfacing Thickness */}
					<GuideBox width="100%" row horSpaceBetween verCenter>
						<Typography marginLeft={marginInput}>
							Deck Surfacing Thickness
						</Typography>
						<GuideBox width={fieldwidthWide} row horSpaceBetween verCenter>
							<TextFieldV2
								type="number"
								width={fieldwidth}
								defaultValue={deckSurfThick.toString()}
								onChange={(e: any) => setDeckSurfThick(Number(e.target.value))}
								numberOptions={{
									min: 0,
									step: 1,
									onlyInteger: false,
									condition: {
										min: "greaterEqual"
									}
								}}
								disabled={deckSurfThickDisabled}
							/>
							<Typography>
								mm
							</Typography>
						</GuideBox>
					</GuideBox>
					{/* Height above Sea Level */}
					<GuideBox width="100%" row horSpaceBetween verCenter>
						<Typography marginLeft={marginInput}>
							Height above Sea Level
						</Typography>
						<TextField
							type="number"
							width={fieldwidth}
							defaultValue={heightSeaLevel.toString()}
							onChange={(e: any) => setHeightSeaLevel(Number(e.target.value))}
							wrappedWidth={fieldwidthWide}
							title="m"
							titlePosition="right"
						/>
					</GuideBox>
				</GuideBox>
			</Panel>
		</GuideBox>
	);
};

export default BasicInput;
