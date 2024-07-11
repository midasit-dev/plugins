import React from 'react';
import { 
	GuideBox, 
	Panel,
	Typography,
	Icon,
	Button,
	TemplatesDualComponentsTypographyTextFieldSpaceBetween,
	RadioGroup,
	Radio,
	Chip,
	VerifyUtil,
} from '@midasit-dev/moaui';
import {TextField} from '@mui/material'
import { useSnackbar } from 'notistack';
import {GenerateNodes} from './utils_pyscript'
import AFTES from './AFTES.svg'
import spring_model from './spring_model.svg'

import { QueryClient, QueryClientProvider } from 'react-query';
import { useQuery } from 'react-query';

import { motion } from 'framer-motion';

const queryClient = new QueryClient();
const WrappingReactQuery = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  );
}

export default WrappingReactQuery;

const fetchData = async () => {
	const url = await VerifyUtil.getBaseUrlAsync();
	const endpoint = url + '/view/select';
	const mapiKey = VerifyUtil.getMapiKey();
	const headers = {
		'Content-Type': 'application/json',
		'MAPI-KEY': mapiKey
	}

	const resGet = await fetch(endpoint, { method: 'GET', headers });
	if (resGet.ok) {
		const data = await resGet.json();
		return data;
	} else {
		console.error('error', resGet.statusText);
	}
}

const App = () => {
	const { enqueueSnackbar } = useSnackbar();

	const [selectedElems, setSelectedElems] = React.useState('');
	const [selectedElemCount, setSelectedElemsCount] = React.useState(0);
	const [Modulus, setModulus] = React.useState('');
	const [Poisson, setPoisson] = React.useState('');
	const [boundaryCondition, setBoundaryCondition] = React.useState('Hinge');

	const [isLoading, setIsLoading] = React.useState(false);

	React.useEffect(() => {
		if (isLoading) {
			setTimeout(() => {
				try {
					if (selectedElems === ''){
						enqueueSnackbar('선택된 요소가 없습니다', {variant: 'error', autoHideDuration: 3000})
						return
					}
					const Generate_Result = GenerateNodes(selectedElems, Modulus, Poisson, boundaryCondition);
					console.log(Generate_Result);
					if (Generate_Result === "success"){
						enqueueSnackbar('모델이 생성되었습니다.', {variant: 'success', autoHideDuration: 3000})
					}
					else{
						enqueueSnackbar(Generate_Result, {variant: 'error', autoHideDuration: 3000})
					}
				} catch (err) {
					console.error(err);
				} finally {
					setIsLoading(false);
				}
			}, 1000);
		}
	}, [isLoading, enqueueSnackbar, selectedElems, Modulus, Poisson, boundaryCondition]);

	const handleBoundaryChange = (event: any) => setBoundaryCondition(event.target.value);

	const { data, refetch } = useQuery('getSelect', fetchData, {
    enabled: false,  // 컴포넌트가 마운트될 때 자동으로 실행되지 않도록 설정
  });

	// 페이지가 focus 되었을 때 refetch 실행
	React.useEffect(() => {
		const handleFocus = () => refetch();
		window.addEventListener('focus', handleFocus);
		return () => {
			window.removeEventListener('focus', handleFocus);
		};
	}, [refetch]);

	// refetch에 의해 data 변경 시 마다 선택 엘리먼트 상태 업데이트
	React.useEffect(() => {
		if (data) {
			const elems = data["SELECT"]["ELEM_LIST"];
			if (elems.length === 0) {
				enqueueSnackbar('선택된 요소가 없습니다', {variant: 'error', autoHideDuration: 3000});
				setSelectedElems('');
				return;
			}

			setSelectedElems(elems.toString());
		}
	}, [data, enqueueSnackbar]);

	const [effect, setEffect] = React.useState(false);

	// 선택 엘리먼트 상태 업데이트에 따른 선택 엘리먼트 개수 업데이트
	React.useEffect(() => {
		setEffect(!effect);

		if (selectedElems !== '') {
			const selNodeIdsArr = selectedElems.split(',');
			const filteredSelNodeIdsArr = selNodeIdsArr.filter(id => id !== '');
			setSelectedElemsCount(filteredSelNodeIdsArr.length);
			return;
		}

		setSelectedElemsCount(0);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [selectedElems]);

	return (
		<GuideBox width={600} spacing={4} padding={2}>
			<GuideBox spacing={2} width="100%" padding={2} borderRadius={1} opacity={.8}>
				<GuideBox row verCenter spacing={1}>
					<Icon iconName='Help' />
					<Typography variant='h1' size='medium'>터널 라이닝 모델 생성 가이드</Typography>
				</GuideBox>
				<GuideBox spacing={1}>
					<Typography variant='h1'> ▹ [콘크리트 라이닝 세부 설계기준] (한국도로공사, 2016)에 따른 라이닝 모델 생성 </Typography>
					<Typography variant='h1'> ▹ 지반반력계수의 경우 AFTES, 미공병단이론식을 적용합니다. </Typography>
					<Typography variant='h1'> ▹ 단부의 경우 라이닝 축선에 따라 스프링을 적용하거나, 힌지를 생성합니다. </Typography>
					<Typography variant='h1'> ▹ 라이닝 요소를 선택하고 값을 입력한 뒤 Create 버튼을 눌러주세요. </Typography>
				</GuideBox>
			</GuideBox>

			<GuideBox width="100%" spacing={2}>
				<GuideBox row horRight verCenter width="100%" spacing={2} opacity={.9}>
					<motion.div
						key={effect ? 1 : 2}
						initial={{ scale: 0.8 }}
						animate={{ scale: 1 }}
						transition={{ 
							type: "spring", 
							stiffness: 300, 
							damping: 10, 
						}}
					>
						<Chip label={`Selected Elements (${selectedElemCount})`} size='small' bgColor='#ff5722' color="white" />
					</motion.div>
					<TextField
						size = "small"
						value = {selectedElems}
						onChange = {(e:any) => {setSelectedElems(e.target.value)}}
						inputProps = {{onClick: () => refetch(), style:{height:25, fontSize: 12, margin:0, padding:2, verticalAlign: 'middle'}}}
						style={{width: 200, height : 25, padding: 0, verticalAlign: 'middle', marginTop: -5}}
					/>
				</GuideBox>

				<Typography variant='h1' size='medium'>1. 지반반력계수</Typography>
				<Panel width="100%" variant='shadow2' padding={2}>
					<GuideBox width='100%' row horSpaceBetween>
						<GuideBox height={75} spacing={1} verCenter>
							<TemplatesDualComponentsTypographyTextFieldSpaceBetween
								width={200}
								textFieldWidth={120}
								height={30}
								title = 'Es (MPa)'
								placeholder = 'MPa'
								value = {Modulus}
								onChange = {(e:any) => {setModulus(e.target.value)}}
							/>
							<TemplatesDualComponentsTypographyTextFieldSpaceBetween
								width={200}
								textFieldWidth={120}
								height={30}
								title = 'ν'
								placeholder = '0.3'
								value = {Poisson}
								onChange = {(e:any) => {setPoisson(e.target.value)}}
							/>			
						</GuideBox>
						<GuideBox row spacing={2}>
							<GuideBox height={75} verCenter spacing={1}>
								<Typography variant='h1'> ▹ AFTES, 미공병단이론식 </Typography>
								<img src={AFTES} alt='AFTES' width={140} />
							</GuideBox>
							<GuideBox height={75} verBottom>
								<Typography variant='h1'> Es : 주변지반의 탄성계수</Typography>
								<Typography variant='h1'> R : Lining의 등가반경 </Typography>
								<Typography variant='h1'> L : 부재 사이 길이 </Typography>
								<Typography variant='h1'> ν : 포아송비 </Typography>
							</GuideBox>
						</GuideBox>
					</GuideBox>
				</Panel>
			</GuideBox>

			<GuideBox width="100%" spacing={2}>
				<Typography variant='h1' size='medium'> 2. 단부 경계조건 </Typography>
				<Panel width="100%" variant='shadow2' padding={2}>
					<GuideBox width="100%" row spacing={1} horSpaceBetween>
						<GuideBox spacing={2}>
							<RadioGroup value = {boundaryCondition} onChange={handleBoundaryChange}>
								<Radio name='Hinge' value="Hinge" />
								<Radio name='Spring' value="Spring"/>								
							</RadioGroup>
							<GuideBox show fill="#f1f1f1" borderRadius={1} padding={1} spacing={1.5} width="100%">
								<GuideBox spacing={0.5}>
									<Typography variant='h1'> * Spring 경계조건의 경우,</Typography>
									<Typography variant='h1'> 단부에 할당된 요소의 폭으로 스프링 강성을 계산합니다. </Typography>
								</GuideBox>
								<Typography variant='h1'> * 요소에 할당된 Section 이 없을 경우 계산되지 않습니다. </Typography>
							</GuideBox>
						</GuideBox>
						<GuideBox show fill='#f1f1f1' borderRadius={1} padding={1}>
							<img src={spring_model} alt='AFTES' width={180} height={100}/>
						</GuideBox>
					</GuideBox>
				</Panel>
				<GuideBox width="100%" horRight verCenter>
					<Button onClick={() => setIsLoading(true)} color='negative' loading={isLoading}>
						Create
					</Button>
				</GuideBox>
			</GuideBox>
			
		</GuideBox>
	);
}