import React from 'react';
import { GuideBox, Typography, TextField } from "@midasit-dev/moaui";

const TitleTextField = ({
	width = 300,
	height = 30,
	title = 'Title',
	textFieldWidth = 150,
	placeholder = 'placeholder ...',
	defaultValue = '',
	error = false,
	disabled = false,
	value = undefined,
	onChange = undefined,
	show = false,
  unit = '',
	textAlign = 'center'
}: any) => {
	const [valueLocal, setValueLocal] = React.useState(defaultValue);
	let onChangeLocal = (e: any) => {
		setValueLocal(e.target.value);
	}
	return (
		<GuideBox show={show}  row horSpaceBetween spacing={1}>
      <GuideBox row horSpaceBetween width={width} height={height}>
        <Typography center height={height}>{title}</Typography>
				<GuideBox row>
					<TextField
						width={textFieldWidth}
						height={height}
						placeholder={placeholder}
						error={error}
						disabled={disabled}
						defaultValue={defaultValue}
						value={value || valueLocal}
						onChange={onChange || onChangeLocal}
						textAlign={textAlign}
					/>
					<Typography center height={height}>{unit}</Typography>
				</GuideBox>
        
      </GuideBox>
		</GuideBox>
	)
};

export default TitleTextField;