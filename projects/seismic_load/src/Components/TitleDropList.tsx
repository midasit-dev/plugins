import React from 'react';

import { GuideBox, Typography, DropList } from "@midasit-dev/moaui";

const TitleDropList = ({
	width = 300,
	height = 30,
	title = 'Title',
	dropListwidth = 150,
	droplistDisabled = false,
	items = [ 
		['Korean', 	 1],
		['American', 2],
		['Asia', 		 3],
		['Midas', 	 4],
	],
	defaultValue = 1,
	value = undefined,
	onChange = undefined,
	show = false,
}: any) => {
	const [valueLocal, setValueLocal] = React.useState(defaultValue);
	let onChangeLocal = (e: any) => {
		setValueLocal(e.target.value);
	}

	return (
		<GuideBox show={show} width={width} height={height} row horSpaceBetween>
			<Typography center height={height}>{title}</Typography>
			<DropList 
				itemList={items} 
				width={dropListwidth} 
				disabled={droplistDisabled}
				defaultValue={defaultValue}
				value={value || valueLocal}
				onChange={onChange || onChangeLocal}
			/>
		</GuideBox>
	)
};

export default TitleDropList;