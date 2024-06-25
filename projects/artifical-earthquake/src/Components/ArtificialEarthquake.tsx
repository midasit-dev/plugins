import React from 'react';
import {
    Panel,
    GuideBox,
    Button,
    Check,
    TextField,
    RadioGroup,
    Radio,
} from "@midasit-dev/moaui";
import { useRecoilState, useRecoilValue } from "recoil";
import CompTypographyAndTextField from "./TypographyAndTextField";
import {
    VarRiseTime,
    VarLevelTime,
    VarTotalTime,
    VarMaxIteration,
    VarDampingRatio,
    VarRandomSeedChk,
    VarRandomSeed,
    VarMaxAccelChk,
    VarMaxAccel,
    VarCalcDS,
    VarGraphType,
} from "./variables";

import {
    VarDesignSpectrum,
} from "./variables";
import ComputeDS from './ComputeDS'
import ComputeAE from './ComputeAE';

const ArtificalEarthquake = (props: any) => {

    const [rise_time, setRiseTime] = useRecoilState(VarRiseTime);
    const [level_time, setLevelTime] = useRecoilState(VarLevelTime);
    const [total_time, setTotalTime] = useRecoilState(VarTotalTime);
    const [max_iteration, setMaxIteration] = useRecoilState(VarMaxIteration);
    const [damping_ratio, setDampingRatio] = useRecoilState(VarDampingRatio);
    const [random_seed_chk, setRandomSeedChk] = useRecoilState(VarRandomSeedChk);
    const [random_seed, setRandomSeed] = useRecoilState(VarRandomSeed);
    const [max_accel_chk, setMaxAccelChk] = useRecoilState(VarMaxAccelChk);
    const [max_accel, setMaxAccel] = useRecoilState(VarMaxAccel);
    const calcDS = useRecoilState(VarCalcDS);

    const design_spectrum = useRecoilValue(VarDesignSpectrum);
    const [graph_type, setGraphType] = useRecoilState(VarGraphType);

    //for Dialog
    const [openDS, setOpenDS] = React.useState(false);
    const [openAE, setOpenAE] = React.useState(false);

    const handleChange = (event: React.ChangeEvent, state: string) => {
        setGraphType(state);
    };

    return (
        <GuideBox width="100%" spacing={0.5}>
            <Panel variant="strock" width="100%" padding={2} border="1px solid #ddd">
                <GuideBox width="100%" verSpaceBetween>
                    <CompTypographyAndTextField title="Rise Time (sec)" state={rise_time} setState={setRiseTime} width={120} />
                    <CompTypographyAndTextField title="Level Time (sec)" state={level_time} setState={setLevelTime} width={120} />
                    <CompTypographyAndTextField title="Total Time (sec)" state={total_time} setState={setTotalTime} width={120} />
                    {/* <CompTypographyAndTextField title="Max. Iterations" state={max_iteration} setState={setMaxIteration} width={120} /> */}
                    <CompTypographyAndTextField title="Damping Ratio" state={damping_ratio} setState={setDampingRatio} width={120} />
                    <GuideBox width="100%" row horSpaceBetween>
                        <GuideBox width="inherit" row horSpaceBetween verCenter height={30}>
                            <Check name="Random Seed" checked={random_seed_chk} onChange={function noRefCheck(e: any) {
                                setRandomSeedChk(e.target.checked);
                                if (e.target.checked) {
                                    const new_seed = String(new Date().getTime());
                                    setRandomSeed(new_seed);
                                }
                            }} />
                            <TextField
                                width={120}
                                height={30}
                                placeholder="Input value ..."
                                onChange={(e: any) => setRandomSeed(e.target.value)}
                                value={random_seed}
                                disabled={!random_seed_chk}
                            />
                        </GuideBox>
                    </GuideBox>
                    <GuideBox width="100%" row horSpaceBetween>
                        <GuideBox width="inherit" row horSpaceBetween verCenter height={30}>
                            <Check name="Max. Accel. [g]" checked={max_accel_chk} onChange={function noRefCheck(e: any) {
                                setMaxAccelChk(e.target.checked);
                            }} />
                            <TextField
                                width={120}
                                height={30}
                                placeholder="Input value ..."
                                onChange={(e: any) => setMaxAccel(e.target.value)}
                                value={max_accel}
                                disabled={!max_accel_chk}
                            />
                        </GuideBox>
                    </GuideBox>
                </GuideBox>
            </Panel>

            <Panel variant="strock" width="100%" padding={1} border="1px solid #ddd">
                <GuideBox width="100%" row horSpaceBetween spacing={1} padding={1}>
                    <RadioGroup row
                        onChange={handleChange}
                        text="Graph Type"
                        value={graph_type}
                    >
                        <Radio
                            name="Spectrum Graph"
                            value="1"
                        />
                        <Radio
                            name="Acceleration Graph"
                            value="2"
                            marginLeft={5}
                        />
                    </RadioGroup>
                </GuideBox>

                <GuideBox width="100%" row horSpaceBetween spacing={1} padding={1}>
                    <Button color='negative' onClick={() => setOpenDS(true)}>Calc. Design Spectrum</Button>
                    {
                        <ComputeDS open={openDS} setOpen={setOpenDS} design_spectrum={design_spectrum} />
                    }
                    <Button color='negative' onClick={() => setOpenAE(true)}>Calc. Artificial Earthquake</Button>
                    {
                        calcDS &&
                        <ComputeAE open={openAE} setOpen={setOpenAE} />
                    }
                </GuideBox>
            </Panel>            
        </GuideBox >
    )
}

export default ArtificalEarthquake;

