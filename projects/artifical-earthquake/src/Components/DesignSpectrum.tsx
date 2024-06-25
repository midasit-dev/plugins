import React, { useState } from 'react';
import {
  GuideBox,
  Panel,
  Typography,
  Dialog,
  IconButton,
  Icon
} from '@midasit-dev/moaui';
import { useRecoilState, useRecoilValue } from 'recoil';
import CompOutputType from './OutputType';
import CompAddressSearch from './AddressSearch';
import CompLatLongSearch from './LatLongSearch';
import { VarFindAddress, VarOutputType } from './variables';
import CompTypographyAndDropList from './TypographyAndDropList';
import {
  VarCalcDS,  
  VarRiskCategory,
  VarRiskCategoryList,
  VarSiteSoilClass,
  VarSiteSoilClassList,
  VarDesignSpectrumOption,
  VarDesignSpectrumOptionList,
} from './variables';

const DesignSpectrum = (props: any) => {
  const output_type = useRecoilValue(VarOutputType);
  const visible = false;
  const [riskCategory, setRiskCategory] = useRecoilState(VarRiskCategory);
  const riskCategoryList = useRecoilValue(VarRiskCategoryList);
  const [siteSoilClass, setSiteSoilClass] = useRecoilState(VarSiteSoilClass);
  const siteSoilClassList = useRecoilValue(VarSiteSoilClassList);
  const [designSpectrumOption, setDesignSpectrumOption] = useRecoilState(VarDesignSpectrumOption);
  const designSpectrumOptionList = useRecoilValue(VarDesignSpectrumOptionList);
  const findAddress = useRecoilValue(VarFindAddress);
  const [calcDS, setCalcDS] = useRecoilState(VarCalcDS);

  return (
    <GuideBox width="100%" horSpaceBetween>
      <GuideBox show={visible} spacing={2}>
        <CompOutputType />
        {output_type === "By Address" && <CompAddressSearch />}
        {output_type === "By Lat/Long" && <CompLatLongSearch />}
        <GuideBox show fill="1" width="100%" center padding={1} borderRadius={1} row>
          <Typography variant="h1">Seismic Data</Typography>
          <CompInfoDialog />
        </GuideBox>
        <GuideBox show={visible} spacing={1} width="100%" horSpaceBetween>
          <CompTypographyAndDropList disabled={!findAddress} title="Risk Category" state={riskCategory} setState={setRiskCategory} droplist={riskCategoryList} width={200} reSetType={1} />
          <CompTypographyAndDropList disabled={!findAddress} title="Site Class" state={siteSoilClass} setState={setSiteSoilClass} droplist={siteSoilClassList} width={200} reSetType={1} />
          <CompTypographyAndDropList disabled={!calcDS} title="Design Spectrum Option" state={designSpectrumOption} setState={setDesignSpectrumOption} droplist={designSpectrumOptionList} width={200} reSetType={2} />
        </GuideBox>
      </GuideBox>
      <GuideBox show={visible} spacing={1} width="100%" >
      </GuideBox>
    </GuideBox>
  )
}

export default DesignSpectrum;

const CompInfoDialog = () => {
	const [open, setOpen] = React.useState(false);

	return (
		<GuideBox>
			<IconButton onClick={() => setOpen(true)} transparent>
				<Icon iconName="InfoOutlined" />
			</IconButton>
			<Dialog
				open={open}
				setOpen={setOpen}
				headerIcon={<Icon iconName="InfoOutlined" />}
				headerTitle='Seismic Data : ASCE/SEI 7-22'
			>
				<GuideBox spacing={2}>
					<GuideBox spacing={1}>
						<GuideBox row spacing={0.7}>
							<Typography variant='h1'>- Risk Category :</Typography>
							<Typography variant='body1' color='third'>Refer to Table1.5-1 of ASCE/SEI 7-22</Typography>
						</GuideBox>
					</GuideBox>
          <GuideBox spacing={1}>
						<GuideBox row spacing={0.7}>
							<Typography variant='h1'>- Site Class :</Typography>
							<Typography variant='body1' color='third'>Refer to Chapter 20 of  ASCE/SEI 7-22</Typography>
						</GuideBox>
            <GuideBox paddingLeft={1}>
							<Typography variant='body1'>A : Hard Rock</Typography>
							<Typography variant='body1'>B : Medium Hard Rock</Typography>
							<Typography variant='body1'>BC: Soft rock</Typography>
              <Typography variant='body1'>C : Very Dense Sand or hard clay</Typography>
							<Typography variant='body1'>CD: Dense sand or very stiff clay</Typography>
              <Typography variant='body1'>D : Medium dense sand or stiff clay</Typography>
							<Typography variant='body1'>DE: Loose sand or medium stiff clay</Typography>
              <Typography variant='body1'>E : Very loose sand or soft clay</Typography>
						</GuideBox>
					</GuideBox>
				</GuideBox>
			</Dialog>
		</GuideBox>
	)
}