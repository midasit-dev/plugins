import React, { useEffect, useState, useCallback } from "react";
import { GuideBox, Typography, Panel, TextFieldV2, DropList, Button, Check, Font, } from '@midasit-dev/moaui';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { elementDataState } from './variables';
import { ReactP5Wrapper } from "react-p5-wrapper";
import { sketch } from './Subsheet/sketch';
import Inputdetails from './Subsheet/detailinput';
import useBuoyancyCalculator from './Subsheet/buoyancycalculator';

import {
  constructionDataState,
  coverDepthState,
  waterDepthState,
  soilDensityState,
  submergedSoilWeightState,
  internalFrictionAngleState,
  waterDensityState,
  waterproofThicknessState,
  waterproofUnitsDryWeightState,
  waterproofUnitsSubWeightState,
  addedLoadThicknessState,
  addedLoadUnitsWeightState,
  consideringSoilFrictionState,
  consideringShearkeyState
} from './variables';
import {
  Dialog,
} from '@mui/material'
import { useSnackbar } from "notistack";
import { loadelementinformation, defaultloadelement } from '../utils_pyscript';
import StagesetDialog from './Subsheet/stagesetdialog';

interface Row {
  id: string;
  name: string;
  top: string;
  bottom: string;
  extWall: string;
  intStr: string;
}

function MainWindow() {
  // BuoyancyCalculator에서 계산된 값 가져오기
  const calculateBuoyancy = useBuoyancyCalculator();
  const [buoyancyResult, setBuoyancyResult] = useState<{ R: number, U: number, FS: number, W1?: number, W2?: number, Ps?: number , sk?: number}>({ R: 0, U: 0, FS: 0 });
  const handleCalculateBuoyancy = useCallback(() => {
    const result = calculateBuoyancy();
    setBuoyancyResult(result);
  }, [calculateBuoyancy]);

  const soilDensity = useRecoilValue(soilDensityState);
  const submergedSoilWeight = useRecoilValue(submergedSoilWeightState);
  const internalFrictionAngle = useRecoilValue(internalFrictionAngleState);
  const waterDensity = useRecoilValue(waterDensityState);
  const waterproofThickness = useRecoilValue(waterproofThicknessState);
  const waterproofUnitsDryWeight = useRecoilValue(waterproofUnitsDryWeightState);
  const waterproofUnitsSubWeight = useRecoilValue(waterproofUnitsSubWeightState);
  const addedLoadThickness = useRecoilValue(addedLoadThicknessState);
  const addedLoadUnitsWeight = useRecoilValue(addedLoadUnitsWeightState);

  const setElementData = useSetRecoilState(elementDataState);
  const [openDetailInput, setOpenDetailInput] = useState(false);
  const [sketchData, setSketchData] = useState(null);
  const [coverDepth, setCoverDepth] = useRecoilState(coverDepthState);
  const [waterDepth, setWaterDepth] = useRecoilState(waterDepthState);
  const [updateTrigger, ] = useState(0);
  const handleCoverDepthChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setCoverDepth((e.target.value));
  }, [setCoverDepth]);

  const handleWaterDepthChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setWaterDepth((e.target.value));
  }, [setWaterDepth]);

  const handleOpenDetailInput = () => {
    setOpenDetailInput(true);
  };

  const handleCloseDetailInput = () => {
    setOpenDetailInput(false);
  };

  const rows = useRecoilValue<Row[]>(constructionDataState);
  const [selectedValue, setSelectedValue] = useState<string | null>(null);

  const onChangeHandler = (event: any) => {
    const newValue = event.target.value;
    setSelectedValue(newValue);
    handleLoad(newValue);
  };

  const [open, setOpen] = React.useState(false);

  const { enqueueSnackbar } = useSnackbar();

  const items: [string, string | number][] = rows.map((row: Row) => [row.name, row.id]);

  const handleLoad = async (selectedValue: string, useDefaultLoad: boolean = false) => {
    // console.log("selectedValue ",selectedValue)

    if (!selectedValue) {
      enqueueSnackbar('Please select an element.', { variant: 'warning' });
      return;
    }

    const selectedElement = rows.find(row => row.id.toString().includes(selectedValue));
    // console.log(selectedElement)
    if (!selectedElement) {
      enqueueSnackbar('Selected element not found.', { variant: 'error' });
      return;
    }

    try {
      let data;
      if (useDefaultLoad) {
        data = await defaultloadelement();
      } else {
        data = await loadelementinformation(
          selectedValue,
          selectedElement.top,
          selectedElement.bottom,
          selectedElement.extWall,
          selectedElement.intStr
        );
      }

      if (data === null) {
        throw new Error('Failed to load element data');
      }
      // console.log(data)
      setElementData(data); // Recoil 상태 업데이트
      setSketchData(data); // Sketch 데이터 설정

      handleCalculateBuoyancy();

    } catch (error) {
      console.error('Error loading data:', error);
      if (error instanceof Error) {
        enqueueSnackbar(`Error loading data: ${error.message}`, { variant: 'error' });
      } else {
        enqueueSnackbar('An unknown error occurred', { variant: 'error' });
      }
    }
  };

  // -----------------------------------------------------------------------------------------------------------------------------------

  const [userInput, setUserInput] = useState<string>('1.2');
  const [comparisonSymbol, setComparisonSymbol] = useState('<');
  const [comparisonResult, setComparisonResult] = useState<string>('O.K');
  const [openRight, setOpenRight] = useState(false);
  const [constructionData, setConstructionData] = useRecoilState(constructionDataState);
  const [consideringSoilFriction, setConsideringSoilFriction] = useRecoilState<boolean>(consideringSoilFrictionState);
  const [consideringShearkey, setconsideringShearkey] = useRecoilState(consideringShearkeyState);
  const handleSoilFrictionChange = (event: React.SyntheticEvent, checked: boolean) => {
    setConsideringSoilFriction(checked);
  };
  const handleSherKeyChange = (event: React.SyntheticEvent, checked: boolean) => {
    setconsideringShearkey(checked);
  };

  useEffect(() => {
    const loadDefaultElement = async () => {
      try {
        const defaultData = await defaultloadelement();
        if (defaultData) {
          setElementData(defaultData);
          setSketchData(defaultData);
          console.log("defaultData",defaultData)
          // defaultData를 constructionDataState 형식으로 변환
          const constructionDataFormat = {
            id: (constructionData.length + 1).toString(), // id를 문자열로 변환
            name: 'Default Construction',
            top: defaultData.ele_top_slb ? Object.keys(defaultData.ele_top_slb).join(',') : '',
            bottom: defaultData.ele_bot_slb ? Object.keys(defaultData.ele_bot_slb).join(',') : '',
            extWall: defaultData.ele_outsid_wall ? Object.keys(defaultData.ele_outsid_wall).join(',') : '',
            intStr: defaultData.ele_insid_wall ? Object.keys(defaultData.ele_insid_wall).join(',') : ''
          };

          // constructionDataState 업데이트
          setConstructionData((prevData: any) => {
            const newData = [...prevData];
            const existingIndex = newData.findIndex(item => item.name === 'Default Construction');
            if (existingIndex !== -1) {
              // 이미 존재하는 경우 업데이트
              newData[existingIndex] = constructionDataFormat;
            } else {
              // 존재하지 않는 경우 새로 추가
              newData.push(constructionDataFormat);
            }
            return newData;
          });

          // DropList의 첫 번째 항목을 선택 상태로 만듭니다.
          setSelectedValue(constructionDataFormat.id);
          enqueueSnackbar('Default element data loaded successfully.', { variant: 'success' });
        }
      } catch (error: any) {
        enqueueSnackbar(`Error loading default element data: ${error.message}`, { variant: 'error' });
      }
    };

    loadDefaultElement();

  }, []);

  useEffect(() => {
    if (sketchData) {
      handleCalculateBuoyancy();
    }

  }, [

    JSON.stringify(sketchData),
    coverDepth,
    waterDepth,
    soilDensity,
    submergedSoilWeight,
    internalFrictionAngle,
    waterDensity,
    waterproofThickness,
    waterproofUnitsDryWeight,
    waterproofUnitsSubWeight,
    addedLoadThickness,
    addedLoadUnitsWeight,
    consideringSoilFriction,
    consideringShearkey,
  ]);

  useEffect(() => {

    const numericInput = parseFloat(userInput);
    if (!isNaN(numericInput) && numericInput !== 0) {
      if (buoyancyResult.R / buoyancyResult.U > numericInput) {
        setComparisonSymbol('>');
        setComparisonResult('∴O.K');
      } else if (buoyancyResult.R / buoyancyResult.U < numericInput) {
        setComparisonSymbol('<');
        setComparisonResult('∴N.G');
      } else {
        setComparisonSymbol('=');
        setComparisonResult('∴N.G');
      }
    } else {
      setComparisonSymbol('');
      setComparisonResult('');
    }
  }, [buoyancyResult.R, buoyancyResult.U, userInput]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setUserInput(value);
  };

  // const rows = useRecoilValue(constructionDataState); // 여기에서 Recoil 상태를 가져옵니다.
  const handleStageSetAdded = () => {
    if (rows.length > 0) {
      const firstItemId = rows[0].id.toString();
      setSelectedValue(firstItemId);
      handleLoad(firstItemId);
    }
  };

  useEffect(() => {
    handleStageSetAdded();
    enqueueSnackbar('Successfully loaded the data.', { variant: 'success' });
  }, [rows]);



  return (
    <GuideBox row width={580} height={560} >
      <GuideBox width="auto" spacing={1.5} marginTop={1} marginBottom={3} marginLeft={1} marginRight={3} height={560} >
        {/* ----------------------------------------------------------------------------------------------------------------------- */}
        <Typography variant="h1" margin={1} color="primary">
          1. Define Construction Stage
        </Typography>
        <GuideBox row marginLeft={0} horLeft width={500} height='auto' spacing={2.4} marginBottom={3} >
          <GuideBox width="auto" spacing={1.5} marginTop={1} marginBottom={1} marginLeft={0} marginRight={0}>
            <DropList
              itemList={items}
              width="400px"
              defaultValue="Non"
              value={selectedValue ?? ""}
              onChange={onChangeHandler}
            />
          </GuideBox>

          <GuideBox row marginLeft={0} horCenter width={350} height='auto' spacing={1} marginBottom={3.5} >
            <>
              <Button width="130px" color="negative" onClick={() => setOpen(true)}>Add Stage Set</Button>
              <StagesetDialog
                open={open}
                setOpen={setOpen}
                onStageSetAdded={handleStageSetAdded}
                onComplete={handleCalculateBuoyancy} // callback 함수로 전달
              />
            </>
          </GuideBox>


        </GuideBox>

        <Typography variant="h1" margin={1} color="primary">
          2. Buoyancy Stability Condition
        </Typography>

        <GuideBox row marginLeft={0} width={500} height='auto' spacing={1}>
          {/* ------------------ select botton------------------------------------------------------------------------------------ */}
          <Panel width={380}>

            <GuideBox column marginLeft={0} horLeft width={175} height='auto' spacing={1}>
            <Check
                name="Considering Shearkey"
                onChange={handleSherKeyChange}
                checked={consideringShearkey}
                // disabled={buoyancyResult.sk === 0}
              />

              <Check
                name="Considering Friction of Soil"
                onChange={handleSoilFrictionChange}
                checked={consideringSoilFriction}
              />
            </GuideBox>
          </Panel>

          {/* ----------------------------------------------------------------------------------------------------------------------- */}
          {/* -------------------input depth--------------------------------------------------------------------------------------- */}
          <Panel width={360} height={77} marginLeft={0} >
            <GuideBox row marginLeft={0} width={340} height='auto' spacing={1} horLeft>
              <GuideBox row horLeft marginLeft={0} width={200} height={30} spacing={0}>
                <GuideBox column horLeft marginLeft={0} width={220} height={24} spacing={0}>

                  <GuideBox row marginLeft={0} width={200} height='auto' >
                    <GuideBox row horLeft marginLeft={0}>
                      <GuideBox width={110} horLeft marginLeft={0}>
                        <Typography margin={1} color="primary">
                          Cover depth (m)    :
                        </Typography>
                      </GuideBox>
                      <GuideBox width={30}>
                      </GuideBox>
                      <GuideBox>
                        <TextFieldV2 value={coverDepth} onChange={handleCoverDepthChange} width={40} />
                      </GuideBox>
                    </GuideBox>
                  </GuideBox>
                  <GuideBox row marginLeft={0} width={200} height='auto' >
                    <Typography margin={1} color="primary">
                      Water depth GL(-) (m) :
                    </Typography>
                    <TextFieldV2 value={waterDepth} onChange={handleWaterDepthChange} width={40} />
                  </GuideBox>
                </GuideBox>
              </GuideBox>


              <Button
                width="130px"
                color="negative"
                onClick={handleOpenDetailInput}
              >
                Input Details
              </Button>
              <Dialog
                open={openDetailInput}
                onClose={handleCloseDetailInput}
                fullWidth
                maxWidth="md"
              >
                <Inputdetails
                  open={openDetailInput}
                  onClose={handleCloseDetailInput}
                  setOpen={setOpenDetailInput}
                />
              </Dialog>


            </GuideBox>
          </Panel>
        </GuideBox>




        {/* ----------------------------------------------------------------------------------------------------------------------- */}
        <Typography variant="h1" margin={1} color="primary">
          3. Buoyancy Stability Result
        </Typography>
        <Panel width={560}>
          <Panel variant="strock" width={540} style={{ border: '1px solid #ccc', padding: '5px', borderRadius: '4px', ...Font, fontSize: '12px', color: 'rgb(75, 85, 99)' }} marginBottom={1}>
            <GuideBox row verCenter marginLeft={0} horCenter width={540} height='auto' spacing={1}>
              <ReactP5Wrapper
                sketch={sketch}
                data={sketchData}
                coverdepth={coverDepth}
                waterdepth={waterDepth}
                updateTrigger={updateTrigger}
                internalFrictionAngle={internalFrictionAngle}
                consideringSoilFriction={consideringSoilFriction}
                consideringSherkey={consideringShearkey}
                W1={buoyancyResult.W1}
                W2={buoyancyResult.W2}
                Ps={buoyancyResult.Ps}
                U={buoyancyResult.U} F
                style={{ width: '600px', height: '600px' }}
              />
            </GuideBox>
          </Panel>

          {/* ----------------------------------------------------------------------------------------------------------------------- */}
          <Panel width={540} variant="shadow" style={{ border: '1px solid #ccc', padding: '5px', borderRadius: '4px', ...Font, fontSize: '12px', color: 'rgb(75, 85, 99)' }}>
            <GuideBox center>
              <GuideBox row verCenter marginLeft={0} horCenter width={330} height='auto' spacing={1}>
                {buoyancyResult.FS === Infinity ? (
                  <Typography variant="h1">--- Buoyancy check not required ---</Typography>
                ) : (
                  <>
                    <Typography variant="body1">Safety Factor Check</Typography>
                    <Typography variant="body1">=</Typography>
                    <GuideBox column marginLeft={0} horCenter width='auto' height='auto' spacing={0}>
                      <Typography variant="body1">&nbsp;R&nbsp;</Typography>
                      <div style={{ borderTop: '1px solid black', width: '100%' }} />
                      <Typography variant="body1">&nbsp;U&nbsp;</Typography>
                    </GuideBox>
                    <Typography variant="body1">&nbsp;=&nbsp;</Typography>
                    <Typography variant="body1">
                      {buoyancyResult.FS !== 0 ? buoyancyResult.FS.toFixed(2) : 'N/A'}
                    </Typography>
                    <Typography variant="body1">{comparisonSymbol}</Typography>
                    <TextFieldV2
                      placeholder="직접 입력"
                      value={userInput}
                      onChange={handleInputChange}
                      inputAlign="center"
                      width={`${4}ch`}
                    />
                    <Typography variant="body1">(F.S)</Typography>
                    <Typography variant="body1">{comparisonResult}</Typography>
                  </>
                )}
              </GuideBox>
            </GuideBox>
          </Panel>
        </Panel>

        {/* <Button onClick={() => setOpenCalcSheet(true)}>View Calculation Sheet</Button>
      <CalculationSheet
        open={openCalcSheet}
        onClose={() => setOpenCalcSheet(false)}
        calculationData={calculationResult}
      /> */}

      </GuideBox>
      {openRight && (
        <Inputdetails
          open={openRight}
          onClose={() => setOpenRight(false)}
          setOpen={setOpenRight}
        />
      )}

      {/* -------------test------------------------------------------------------------------------------------------------- */}


    </GuideBox>
  );
}

export default MainWindow;
