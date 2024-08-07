import React from 'react';
import { 
	GuideBox, 
	Panel,
	Typography,
	TextField,
	DropList,
	Separator,
  
} from '@midasit-dev/moaui';
import { useRecoilState } from 'recoil';
import { TsValue, DampingRatio, RegionFactor, SeismicFactor, RiskFactor_Operating, RiskFactor_SafeShutdown,
SValue_Operating, SValue_SafeShutdown, MDResult, CDValue_Operating, CDValue_SafeShutdown, SvValue_Operating, SvValue_SafeShutdown
} from './Components/variables';
import TitleDropList from './Components/TitleDropList';
import TitleTextField from './Components/TitleTextField';
import Decimal from 'decimal.js';
import { useEffect } from 'react';
import {Box, Button} from '@mui/material'


const InputWindow = () => {

  const [tsValue, setTsValue] = useRecoilState(TsValue);
	const [dampingRatio, setDampingRatio] = useRecoilState(DampingRatio);
	const [regionFactor, setRegionFactor] = useRecoilState(RegionFactor);
	const [seismicFactor, setSeismicFactor] = useRecoilState(SeismicFactor);
	const [riskFactor_Operating, setRiskFactor_Operating] = useRecoilState(RiskFactor_Operating);
	const [riskFactor_SafeShutdown, setRiskFactor_SafeShutdown] = useRecoilState(RiskFactor_SafeShutdown);
	const [sValue_Operating, setSValue_Operating] = useRecoilState(SValue_Operating);
	const [sValue_SafeShutdown, setSValue_SafeShutdown] = useRecoilState(SValue_SafeShutdown);

  const [cdValue_Operating, setCDValue_Operating] = useRecoilState(CDValue_Operating);
	const [cdValue_SafeShutdown, setCDValue_SafeShutdown] = useRecoilState(CDValue_SafeShutdown);
	const [svValue_Operating, setSvValue_Operating] = useRecoilState(SvValue_Operating);
	const [svValue_SafeShutdown, setSvValue_SafeShutdown] = useRecoilState(SvValue_SafeShutdown);

	const [sValue, setSValue] = React.useState(0);
	const DampingRatio_List = new Map<string, number>([
		['기능수행수준', 10],
		['붕괴방지수준', 20]
	])

	const RegionFactor_List = new Map<string, number>([
		['Ⅰ구역', 0.11],
		['Ⅱ구역', 0.07],
	])

	const SeismicFactor_List = new Map<string, number>([
		['Ⅰ등급', 1],
		['Ⅱ등급', 2],
		['내진특등급', 3]
	])

	
	const handleChangeRegionFactor = (e: any) => {
		setRegionFactor(e.target.value);
	}

	const handleChangeSeismicFactor = (e: any) => {
		setSeismicFactor(e.target.value);
	}


	useEffect(() => {
		if (seismicFactor === 1){
			setRiskFactor_Operating(0.57);
			setRiskFactor_SafeShutdown(1.4);
		}
		else if (seismicFactor === 2){
			setRiskFactor_Operating(0.4);
			setRiskFactor_SafeShutdown(1.0);
		}
		else if (seismicFactor === 3){
			setRiskFactor_Operating(0.73);
			setRiskFactor_SafeShutdown(2.0);
		}
	}, [seismicFactor])

	useEffect(() => {
		const operating = new Decimal(riskFactor_Operating).mul(regionFactor);
		const safeShutdown = new Decimal(riskFactor_SafeShutdown).mul(regionFactor);
		setSValue_Operating(operating.toNumber());
		setSValue_SafeShutdown(safeShutdown.toNumber());
	}, [riskFactor_Operating, riskFactor_SafeShutdown, regionFactor])

	// 표층지반 고유주기 Ts 에 따른 감쇠보정계수 Cd 및 스펙트럼 속도 Sv 계산
	useEffect(() => {
		let CD_Operating = 0
		let CD_SafeShutdown = 0
		try{
			if (Number(tsValue) === 0){
				CD_Operating = 1
				CD_SafeShutdown = 1
			}
			else if ((0<Number(tsValue)) && (Number(tsValue) <=0.06)){
				CD_Operating = 1+((Math.pow((6.42/(1.42+10)),0.48)-1)/0.06)*Number(tsValue)
				CD_SafeShutdown = 1+((Math.pow((6.42/(1.42+20)),0.48)-1)/0.06)*Number(tsValue)
			}
			else if (0.06 <= Number(tsValue)){
				CD_Operating = Math.pow((6.42/(1.42+10)),0.48)
				CD_SafeShutdown = Math.pow((6.42/(1.42+20)),0.48)
			}
			else{
				CD_Operating = 1
				CD_SafeShutdown = 1
			}
		}
		catch(e){
			console.log(e)
		}
		setCDValue_Operating(CD_Operating)
		setCDValue_SafeShutdown(CD_SafeShutdown)

		let Sv_Operating = 0
		let Sv_SafeShutdown = 0
		try{
			if (Number(tsValue) === 0){
				Sv_Operating = 0
				Sv_SafeShutdown = 0
			}
			else if ((0<Number(tsValue)) && (Number(tsValue) <=0.06)){
				Sv_Operating = (1+30*Number(tsValue)) * sValue_Operating * 9.81 * CD_Operating * Number(tsValue) / (2* Math.PI)
				Sv_SafeShutdown = (1+30*Number(tsValue)) * sValue_SafeShutdown * 9.81 * CD_SafeShutdown * Number(tsValue) / (2* Math.PI)
			}
			else if ((0.06 <= Number(tsValue)) && (Number(tsValue) <=0.3)){
				Sv_Operating = 2.8 * sValue_Operating * 9.81 * CD_Operating * Number(tsValue) / (2* Math.PI)
				Sv_SafeShutdown = 2.8 * sValue_SafeShutdown * 9.81 * CD_SafeShutdown * Number(tsValue) / (2* Math.PI)
			}
			else if ((0.3 <= Number(tsValue)) && (Number(tsValue) <=3)){
				Sv_Operating = 0.84/Number(tsValue) * sValue_Operating * 9.81 * CD_Operating * Number(tsValue) / (2* Math.PI)
				Sv_SafeShutdown = 0.84/Number(tsValue) * sValue_SafeShutdown * 9.81 * CD_SafeShutdown * Number(tsValue) / (2* Math.PI)
			}
			else {
				Sv_Operating = 0
				Sv_SafeShutdown = 0
			}
		}
		catch(e){
			console.log(e)
		}
		setSvValue_Operating(Sv_Operating)
		setSvValue_SafeShutdown(Sv_SafeShutdown)
	},[tsValue])


	return (
		<GuideBox width={350}>
			<GuideBox spacing={1} margin={1}>
				<TitleDropList 
				title = '지진구역'
				items = {RegionFactor_List}
				width = {300}
				dropListwidth = {150}
				value = {regionFactor}
				onChange = {handleChangeRegionFactor}
				/>
				<TitleDropList
				title = '내진등급'
				items = {SeismicFactor_List}
				width = {300}
				dropListwidth = {150}
				value = {seismicFactor}
				onChange = {handleChangeSeismicFactor}
				/>
				<Typography variant='h1'>유효수평지반가속도 S (g)</Typography>
				<GuideBox row spacing={1}verCenter>
					<TitleTextField 
					title = '기능수행수준'
					value = {sValue_Operating.toFixed(3).toString()}
					width = {150}
					textFieldWidth = {75}
					textAlign = 'right'
					disabled
					/>
					<TitleTextField
					title = '붕괴방지수준'
					value = {sValue_SafeShutdown.toFixed(3).toString()}
					width = {150}
					textFieldWidth = {75}
					textAlign = 'right'
					disabled
					/>
				</GuideBox>
				
			</GuideBox>
			<GuideBox width={310}>
				<Separator/>
			</GuideBox>
			

			<GuideBox spacing={1} margin={1}>
				<Typography variant='h1'>표층지반 설계고유주기</Typography>
				<TitleTextField 
					title = {<span dangerouslySetInnerHTML={{ __html: 'T<sub>s</sub>' }} />}
					unit = 'sec'
					value = {tsValue}
					onChange = {(e: any) => setTsValue(e.target.value)}
					width = {300}
				/>
			</GuideBox>

			<GuideBox width={310}>
				<Separator/>
			</GuideBox>

			<GuideBox spacing={1} margin={1}>
				<Typography variant='h1'>기반면에서의 설계속도 응답스펙트럼</Typography>

				<GuideBox row spacing={1} verCenter>
					<Typography variant='body1'> 감쇠보정계수 </Typography>
					<span dangerouslySetInnerHTML={{ __html: 'C<sub>D</sub>' }} style={{ fontSize: '0.7rem' }}/>
				</GuideBox>
				<GuideBox row spacing={1} verCenter>
					<TitleTextField 
						title = '기능수행수준'
						value = {cdValue_Operating.toFixed(3).toString()}
						disabled
						width = {150}
						textFieldWidth = {75}
						textAlign = 'right'
					/>
					<TitleTextField 
						title = '붕괴방지수준'
						value = {cdValue_SafeShutdown.toFixed(3).toString()}
						disabled
						width = {150}
						textFieldWidth = {75}
						textAlign = 'right'
					/>
				</GuideBox>
				
				<GuideBox row spacing={1} verCenter paddingTop={1}>
					<Typography variant='body1'> 스펙트럼 속도 </Typography>
					<span dangerouslySetInnerHTML={{ __html: 'S<sub>V</sub> (m/s)' }} style={{ fontSize: '0.7rem' }}/>
				</GuideBox>
				<GuideBox row spacing={1} verCenter>
					<TitleTextField 
						title = '기능수행수준'
						value = {svValue_Operating.toFixed(4).toString()}
						disabled
						width = {150}
						textFieldWidth = {75}
						textAlign = 'right'
					/>
					<TitleTextField 
						title = '붕괴방지수준'
						value = {svValue_SafeShutdown.toFixed(4).toString()}
						disabled
						width = {150}
						textFieldWidth = {75}
						textAlign = 'right'
					/>
				</GuideBox>
			</GuideBox>
    </GuideBox>
  )
}

export default InputWindow;