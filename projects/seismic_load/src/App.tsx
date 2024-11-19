import React from 'react';
import { 
	GuideBox, 
	Panel,
	Typography,
	TextField,
	DropList,
	Separator
} from '@midasit-dev/moaui';
import { useRecoilState } from 'recoil';
import { TsValue, DampingRatio, RegionFactor, SeismicFactor, RiskFactor_Operating, RiskFactor_SafeShutdown,
SValue_Operating, SValue_SafeShutdown, MDResult
} from './Components/variables';
import TitleDropList from './Components/TitleDropList';
import TitleTextField from './Components/TitleTextField';
import Decimal from 'decimal.js';
import { useEffect } from 'react';
import InputWindow from './InputWindow';
import MDReport from './MDReport';
import {Box, Button, Accordion, AccordionSummary, AccordionDetails} from '@mui/material'
import KeyboardDoubleArrowRightIcon from '@mui/icons-material/KeyboardDoubleArrowRight';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import {GenerateReport} from './utils_pyscript'
const App = () => {
	const [mDResult, setMDResult] = useRecoilState(MDResult);
	const exampleMarkdown = `
  # 1. Test Chapter

  (1) Test Paragraph  
  Test Line : 11  

  # 2. Test Chapter2
    `;

		const handleCalculation = () => {
			const result = GenerateReport()
			setMDResult(result)
		}

	return (
		
	<GuideBox row spacing={2} padding={2} >
		<GuideBox>
			<GuideBox height={40} row width={350} horSpaceBetween verCenter>
				<Typography variant='h1' size = 'medium' color='#86B6F6'>INPUT</Typography>
				<Button size = 'small' startIcon = {<KeyboardDoubleArrowRightIcon/>} variant = 'outlined' onClick = {handleCalculation}> Calculate </Button>
			</GuideBox>
			<div
			style={{
				height: '700px',
				width: '370px',
				overflowY : 'scroll',
				overflowX : 'hidden',
			}}>
				<Box	sx = {{	width: '370px',	height: '700px',	bgcolor: '',	}} padding={1}>
					<GuideBox spacing={1}>
						<Accordion defaultExpanded sx = {{width : '340px'}}>
							<AccordionSummary
							sx = {{backgroundColor : '#EEF5FF', width : '340px'}}
							expandIcon={<ArrowDropDownIcon />}>
								<Typography variant='h1' color=''> 지반 운동 </Typography>
							</AccordionSummary>
							<AccordionDetails>
								<InputWindow />
							</AccordionDetails>

						</Accordion>
						<Accordion defaultExpanded sx = {{width : '340px'}}>
							<AccordionSummary
							sx = {{backgroundColor : '#EEF5FF', width : '340px'}}
							expandIcon={<ArrowDropDownIcon />}>
								<Typography variant='h1' color=''> Select Element </Typography>

							</AccordionSummary>
							<AccordionDetails>
								<InputWindow />
							</AccordionDetails>
						</Accordion>
					</GuideBox>
				</Box>
			</div>
			
			
		</GuideBox>
		

		
		<Separator direction = 'vertical'/>
		<MDReport></MDReport>

	</GuideBox> 
	);

}

export default App;