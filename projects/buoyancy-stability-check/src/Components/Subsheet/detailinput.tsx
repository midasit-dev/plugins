import React from 'react';
import { GuideBox, Panel, Typography,TextFieldV2,Dialog,Button  } from '@midasit-dev/moaui';
import { useRecoilState } from 'recoil';
import { soilDensityState,
    submergedSoilWeightState,
    internalFrictionAngleState,
    waterDensityState,
    waterproofThicknessState,
    waterproofUnitsDryWeightState,
    waterproofUnitsSubWeightState,
    addedLoadThicknessState,
    addedLoadUnitsWeightState,
    } from '../variables';
import { useSnackbar } from "notistack";

    interface InputdetailsProps {
        open: boolean;
        onClose: () => void;
        setOpen: React.Dispatch<React.SetStateAction<boolean>>;
      }


function Inputdetails({ open, onClose, setOpen }: InputdetailsProps) {
    const [soilDensity, setSoilDensity] = useRecoilState(soilDensityState);
    const [submergedSoilWeight, setSubmergedSoilWeight] = useRecoilState(submergedSoilWeightState);
    const [internalFrictionAngle, setInternalFrictionAngle] = useRecoilState(internalFrictionAngleState);
    const [waterDensity, setWaterDensity] = useRecoilState(waterDensityState);
    const [waterproofThickness, setWaterproofThickness] = useRecoilState(waterproofThicknessState);
    const [waterproofUnitsDryWeight, setWaterproofUnitsDryWeight] = useRecoilState(waterproofUnitsDryWeightState);
    const [waterproofUnitsSubWeight, setWaterproofUnitsSubWeight] = useRecoilState(waterproofUnitsSubWeightState);
    const [addedLoadThickness, setAddedLoadThickness] = useRecoilState(addedLoadThicknessState);
    const [addedLoadUnitsWeight, setAddedLoadUnitsWeight] = useRecoilState(addedLoadUnitsWeightState);
    const { enqueueSnackbar } = useSnackbar();    
    const columnWidth = 310;
    const rowWidth = 250;
    const innerWidth = 240;
    const textFieldWidth = 40;
    const unitWidth = 50;
    const placeholder = "type here ...";
    
    const handleClose = () => {
        enqueueSnackbar('Successfully loaded Detail Data.', { variant: 'success' });
        onClose();
      };      
      return (
        <Dialog
          open={open}
          setOpen={setOpen}
          headerTitle="Input Details "
          onClose={handleClose}
        >
    <GuideBox horCenter height={445} width ={325} padding={1} spacing={1}>
      <Panel height={180} width ={300} >
        <Typography variant="h1"  color="primary">
        Soil Input
        </Typography>
{/* input----------------------------------------------------------------------------------------------------------------- */}
    <GuideBox column margin={1} spacing={1} horLeft marginBottom={3}>
        {/* ------column------------------------------------------------------------------------------------------------------------ */}
        <GuideBox column width={columnWidth}>
            <GuideBox row width={rowWidth} horLeft verCenter>
                <GuideBox width={innerWidth} marginTop={0.6}>
                    <Typography horLeft>{"Soil Density"}</Typography>
                </GuideBox>
                <GuideBox width={textFieldWidth}>
                    <TextFieldV2
                        width={textFieldWidth}
                        placeholder={placeholder}
                        value={soilDensity.toString()}
                        onChange = {(e:any) => {setSoilDensity(e.target.value);}}
                        inputAlign="center"
                    />

                </GuideBox>
                <GuideBox width={unitWidth} marginLeft={0.5} marginTop={0.6}>
                    <Typography horLeft>{"kN/m³"}</Typography>
                </GuideBox>
            </GuideBox>
        </GuideBox>
        {/* ----------------------------------------------------------------------------------------------------------------------- */}
        <GuideBox column width={columnWidth}>
            <GuideBox row width={rowWidth} horLeft verCenter>
                <GuideBox width={innerWidth} marginTop={0.6}>
                    <Typography horLeft>{"Submerged soil weight"}</Typography>
                </GuideBox>
                <GuideBox width={textFieldWidth}>
                    <TextFieldV2
                        width={textFieldWidth}
                        placeholder={placeholder}
                        value={submergedSoilWeight.toString()}
                        onChange = {(e:any) => {setSubmergedSoilWeight(e.target.value);}}
                        inputAlign="center"
                    />
                </GuideBox>
                <GuideBox width={unitWidth} marginLeft={0.5} marginTop={0.6}>
                    <Typography horLeft>{"kN/m³"}</Typography>
                </GuideBox>
            </GuideBox>
        </GuideBox>
        {/* ----------------------------------------------------------------------------------------------------------------------- */}
        <GuideBox column width={columnWidth}>
            <GuideBox row width={rowWidth} horLeft verCenter>
                <GuideBox width={innerWidth} marginTop={0.6}>
                    <Typography horLeft>{"Internal friction angle"}</Typography>
                </GuideBox>
                <GuideBox width={textFieldWidth}>
                    <TextFieldV2
                        width={textFieldWidth}
                        placeholder={''}
                        value={internalFrictionAngle.toString()}
                        onChange = {(e:any) => {setInternalFrictionAngle(e.target.value);}}
                        inputAlign="center"
                    />
                </GuideBox>
                <GuideBox width={unitWidth} marginLeft={0.5} marginTop={0.6}>
                    <Typography horLeft>{""}</Typography>
                </GuideBox>
            </GuideBox>
        </GuideBox>
        {/* ----------------------------------------------------------------------------------------------------------------------- */}
        <GuideBox column width={columnWidth}>
            <GuideBox row width={rowWidth} horLeft verCenter>
                <GuideBox width={innerWidth} marginTop={0.6}>
                    <Typography horLeft>{"Water density"}</Typography>
                </GuideBox>
                <GuideBox width={textFieldWidth}>
                    <TextFieldV2
                        width={textFieldWidth}
                        placeholder={placeholder}
                        value={waterDensity.toString()}
                        onChange = {(e:any) => {setWaterDensity(e.target.value);}}
                        inputAlign="center"
                    />
                </GuideBox>
                <GuideBox width={unitWidth} marginLeft={0.5} marginTop={0.6}>
                    <Typography horLeft>{"kN/m³"}</Typography>
                </GuideBox>
            </GuideBox>
        </GuideBox>
        {/* ----------------------------------------------------------------------------------------------------------------- */}
    </GuideBox>
    </Panel>
    <Panel height={320} width ={300} >
    {/* input----------------------------------------------------------------------------------------------------------------- */}
    <Typography variant="h1" color="primary">
        Added Load Input
    </Typography>
    {/* input----------------------------------------------------------------------------------------------------------------- */}
    <GuideBox column margin={1} spacing={1} horLeft>
        {/* ------column------------------------------------------------------------------------------------------------------------ */}
        <GuideBox column width={columnWidth}>
            <GuideBox row width={rowWidth} horLeft verCenter>
                <GuideBox width={innerWidth} marginTop={0.6}>
                    <Typography horLeft>{"Waterproof Thickness"}</Typography>
                </GuideBox>
                <GuideBox width={textFieldWidth}>
                    <TextFieldV2
                        width={textFieldWidth}
                        placeholder={placeholder}
                        value={waterproofThickness.toString()}
                        onChange = {(e:any) => {setWaterproofThickness(e.target.value);}}
                        inputAlign="center"
                    />
                </GuideBox>
                <GuideBox width={unitWidth} marginLeft={0.5} marginTop={0.6}>
                    <Typography horLeft>{"m"}</Typography>
                </GuideBox>
            </GuideBox>
        </GuideBox>
        {/* ----------------------------------------------------------------------------------------------------------------------- */}
        <GuideBox column width={columnWidth}>
            <GuideBox row width={rowWidth} horLeft verCenter>
                <GuideBox width={innerWidth} marginTop={0.6}>
                    <Typography horLeft>{"Waterproof units dry weight"}</Typography>
                </GuideBox>
                <GuideBox width={textFieldWidth}>
                    <TextFieldV2
                        width={textFieldWidth}
                        placeholder={placeholder}
                        value={waterproofUnitsDryWeight.toString()}
                        onChange = {(e:any) => {setWaterproofUnitsDryWeight(e.target.value);}}
                        inputAlign="center"
                    />
                </GuideBox>
                <GuideBox width={unitWidth} marginLeft={0.5} marginTop={0.6}>
                    <Typography horLeft>{"kN/m³"}</Typography>
                </GuideBox>
            </GuideBox>
        </GuideBox>
        {/* ----------------------------------------------------------------------------------------------------------------------- */}
        <GuideBox column width={columnWidth}>
            <GuideBox row width={rowWidth} horLeft verCenter>
                <GuideBox width={innerWidth} marginTop={0.6}>
                    <Typography horLeft>{"Waterproof units Sub weight"}</Typography>
                </GuideBox>
                <GuideBox width={textFieldWidth}>
                    <TextFieldV2
                        width={textFieldWidth}
                        placeholder={placeholder}
                        value={waterproofUnitsSubWeight.toString()}
                        onChange = {(e:any) => {setWaterproofUnitsSubWeight(e.target.value);}}
                        inputAlign="center"
                    />
                </GuideBox>
                <GuideBox width={unitWidth} marginLeft={0.5} marginTop={0.6}>
                    <Typography horLeft>{"kN/m³"}</Typography>
                </GuideBox>
            </GuideBox>
        </GuideBox>
        {/* ----------------------------------------------------------------------------------------------------------------------- */}
        <GuideBox column width={columnWidth}>
            <GuideBox row width={rowWidth} horLeft verCenter>
                <GuideBox width={innerWidth} marginTop={0.6}>
                    <Typography horLeft>{"Added load Thickness"}</Typography>
                </GuideBox>
                <GuideBox width={textFieldWidth}>
                    <TextFieldV2
                        width={textFieldWidth}
                        placeholder={placeholder}
                        value={addedLoadThickness.toString()}
                        onChange = {(e:any) => {setAddedLoadThickness(e.target.value);}}
                        inputAlign="center"
                    />
                </GuideBox>
                <GuideBox width={unitWidth} marginLeft={0.5} marginTop={0.6}>
                    <Typography horLeft>{"m"}</Typography>
                </GuideBox>
            </GuideBox>
        </GuideBox>
        {/* ----------------------------------------------------------------------------------------------------------------------- */}
        <GuideBox column width={columnWidth}>
            <GuideBox row width={rowWidth} horLeft verCenter>
                <GuideBox width={innerWidth} marginTop={0.6}>
                    <Typography horLeft>{"Added load units weight"}</Typography>
                </GuideBox>
                <GuideBox width={textFieldWidth}>
                    <TextFieldV2
                        width={textFieldWidth}
                        placeholder={placeholder}
                        value={addedLoadUnitsWeight.toString()}
                        onChange = {(e:any) => {
                            setAddedLoadUnitsWeight(e.target.value);
                        }}
                        inputAlign="center"
                    />
                </GuideBox>
                <GuideBox width={unitWidth} marginLeft={0.5} marginTop={0.6}>
                    <Typography horLeft>{"kN/m³"}</Typography>
                </GuideBox>
            </GuideBox>
        </GuideBox>
        {/* ----------------------------------------------------------------------------------------------------------------- */}
            </GuideBox>
      </Panel>
           <Button width="130px" color="negative" onClick={handleClose}>Apply</Button>
    </GuideBox>
    </Dialog>
  );
}

export default Inputdetails;
