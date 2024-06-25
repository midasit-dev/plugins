import React from 'react';
import { 
	GuideBox, 
	Panel,
	Typography,
	Separator,
	Icon,
	Button,
	TemplatesDualComponentsTypographyTextFieldSpaceBetween,
	RadioGroup,
	Radio
} from '@midasit-dev/moaui';
import {TextField} from '@mui/material'
import { useSnackbar } from 'notistack';
import {getSelectedElements, GenerateNodes} from './utils_pyscript'
import AFTES from './AFTES.svg'
import spring_model from './spring_model.svg'
const NodeFetching = () => {

	const response = getSelectedElements();
  if (response.hasOwnProperty('error')){
    console.error(response['error'])
  }
  if (!response) return [];
  return response;
}

const App = () => {
	const { enqueueSnackbar } = useSnackbar();

	const [selectedElems, setSelectedElems] = React.useState('');
	const [Modulus, setModulus] = React.useState('');
	const [Poisson, setPoisson] = React.useState('');
	const [boundaryCondition, setBoundaryCondition] = React.useState('Hinge');
	const FetchingElems = () => {
    const FetchingResults = NodeFetching();
    if (FetchingResults.length === 0){
      enqueueSnackbar('선택된 요소가 없습니다', {variant: 'error', autoHideDuration: 3000})
    }
    else{
      setSelectedElems(FetchingResults.join(','))
    }
  }

	const handleGenerate = () => {
		if (selectedElems === ''){
			enqueueSnackbar('선택된 요소가 없습니다', {variant: 'error', autoHideDuration: 3000})
			return
		}
		const Generate_Result = GenerateNodes(selectedElems, Modulus, Poisson, boundaryCondition)
		if (Generate_Result == "success"){
			enqueueSnackbar('모델이 생성되었습니다.', {variant: 'success', autoHideDuration: 3000})
		}
		else{
			enqueueSnackbar(Generate_Result, {variant: 'error', autoHideDuration: 3000})
		}
	}
	
	const handleBoundaryChange = (event: any) => {
		setBoundaryCondition(event.target.value);
	};
	return (
		<GuideBox width={510} spacing={2} padding={2}>
			<GuideBox spacing={1}>
				<GuideBox row horSpaceBetween verCenter spacing={1}> 
					<Icon iconName='Help' />
					<Typography variant='h1'>터널 라이닝 모델 생성 가이드</Typography>
				</GuideBox>
				<Typography variant='h1'> ▹ [콘크리트 라이닝 세부 설계기준](한국도로공사, 2016)에 따른 라이닝 모델 생성 </Typography>
				<Typography variant='h1'> ▹ 지반반력계수의 경우 AFTES, 미공병단이론식을 적용합니다. </Typography>
				<Typography variant='h1'> ▹ 단부의 경우 라이닝 축선에 따라 스프링을 적용하거나, 힌지를 생성합니다. </Typography>
				<Typography variant='h1'> ▹ 라이닝 요소를 선택한 뒤, Selected Elements를 클릭하세요. </Typography>
			</GuideBox>

			<Separator direction='horizontal' />

			<GuideBox row horSpaceBetween verCenter> 
				<Typography variant='h1'>Selected Elements : </Typography>
				<TextField
					size = "small"
					value = {selectedElems}
					onChange = {(e:any) => {setSelectedElems(e.target.value)}}
					inputProps = {{onClick:FetchingElems, style:{height:25, fontSize: 12, margin:0, padding:2, verticalAlign: 'middle'}}}
					style={{width: 200, height : 25, marginLeft:4, marginTop : -4, padding: 0, verticalAlign: 'middle'}}
				/>
			</GuideBox>

			<GuideBox>
				<Typography variant='h1'> 1. 지반반력계수 </Typography>
				<GuideBox row spacing={1.5}>
					<GuideBox height={75} width={200} spacing={1} verCenter>
						<TemplatesDualComponentsTypographyTextFieldSpaceBetween
							width={200}
							height={30}
							title = 'Es (MPa)'
							placeholder = 'MPa'
							value = {Modulus}
							onChange = {(e:any) => {setModulus(e.target.value)}}
						/>
						<TemplatesDualComponentsTypographyTextFieldSpaceBetween
							width={200}
							height={30}
							title = 'ν'
							placeholder = '0.3'
							value = {Poisson}
							onChange = {(e:any) => {setPoisson(e.target.value)}}
						/>			
					</GuideBox>
					<GuideBox height={75} verCenter spacing={1}>
						<Typography variant='h1'> ▹ AFTES, 미공병단이론식 </Typography>
						<img src={AFTES} alt='AFTES' width={140} />
					</GuideBox>
					<GuideBox width={130} height={75} verBottom>
						<Typography variant='h1'> Es : 주변지반의 탄성계수</Typography>
						<Typography variant='h1'> R : Lining의 등가반경 </Typography>
						<Typography variant='h1'> L : 부재 사이 길이 </Typography>
						<Typography variant='h1'> ν : 포아송비 </Typography>
					</GuideBox>
				</GuideBox>
			</GuideBox>

			<GuideBox>
				<Typography variant='h1'> 2. 단부 경계조건 </Typography>
				<GuideBox row spacing={1}>
					<GuideBox width={280} spacing={1}>
						<RadioGroup value = {boundaryCondition} onChange={handleBoundaryChange}>
							<Radio name='Hinge' value="Hinge"/>
							<Radio name='Spring' value="Spring"/>								
						</RadioGroup>
						<Typography variant='h1'> * Spring 경계조건의 경우, 단부에 할당된 요소의 폭으로 스프링 강성을 계산합니다. </Typography>
						<Typography variant='h1'> * 요소에 할당된 Section 이 없을 경우 계산되지 않습니다. </Typography>
					</GuideBox>
					<GuideBox show>
						<img src={spring_model} alt='AFTES' width={180} height={100}/>
					</GuideBox>
				</GuideBox>
			</GuideBox>
			<GuideBox width={470} horRight verCenter>
				<Button onClick={handleGenerate} variant='outlined'>
					Create
				</Button>
			</GuideBox>
			
		</GuideBox>
	);
}

export default App;