import React from 'react';
import {
    TemplatesFunctionalComponentsValidCheckDialog,
    Color,
} from "@midasit-dev/moaui";
import { useSnackbar } from 'notistack';
import { useRecoilState, useRecoilValue } from "recoil";
import {
    VarValids,
    VarRiseTime,
    VarLevelTime,
    VarTotalTime,
    VarMaxIteration,
    VarDampingRatio,
    VarRandomSeedChk,
    VarRandomSeed,    
    VarMaxAccelChk,
    VarMaxAccel,   
    VarMaximumPeriod,
    VarChartData,
    VarCalcDS,
    VarCalcAE,
    VarDesignSpectrumOption,
    designSpectrumOptions,
} from "./variables";
import { calculate_artificial_motion } from '../utils_pyscript';

const ComputeAE = (props: any) => {
    const { open, setOpen } = props;
    const maximum_period = useRecoilValue(VarMaximumPeriod);
    const rise_time = useRecoilValue(VarRiseTime);
    const level_time = useRecoilValue(VarLevelTime);
    const total_time = useRecoilValue(VarTotalTime);
    const max_iteration = useRecoilValue(VarMaxIteration);
    const damping_ratio = useRecoilValue(VarDampingRatio);
    const random_seed_chk = useRecoilValue(VarRandomSeedChk);
    const [random_seed, setRandomSeed] = useRecoilState(VarRandomSeed);
    const max_accel_chk = useRecoilValue(VarMaxAccelChk);
    const max_accel = useRecoilValue(VarMaxAccel);
    
    const [chartData, setChartData] = useRecoilState(VarChartData);
    const calcDS = useRecoilValue(VarCalcDS);
    const [calcAE, setCalcAE] = useRecoilState(VarCalcAE);

    //for CheckList
    const [checkList, setCheckList] = React.useState<any>([]);
    const processing = React.useRef(false);

    const { enqueueSnackbar } = useSnackbar();
    //Create CheckList
    const valids = useRecoilValue(VarValids);

    const spectrumOption = useRecoilValue(VarDesignSpectrumOption);

    let nIndex = 0;
    for (const [key, value] of designSpectrumOptions) {
        if (value === spectrumOption) break;
        nIndex++;
    }

    React.useEffect(() => {
        setCheckList([
            { title: "Design Spectrum Available", value: calcDS, error: !valids.VarCalcDS(calcDS), reason: "" },
        ]);
    }, [chartData, valids]);

    return (
        <TemplatesFunctionalComponentsValidCheckDialog
            open={open}
            setOpen={setOpen}
            checkList={checkList}
            buttonText="Calculate Design Spectrum"
            buttonClick={() => {
                if (processing.current) return;
                setTimeout(() => {
                    try {
                        processing.current = true;

                        const ds_len = chartData[nIndex].data.length;
                        const ds_periods = chartData[nIndex].data.map((item: any) => Number(item.x));
                        const ds = chartData[nIndex].data.map((item: any) => Number(item.y));

                        const seed = random_seed_chk ? random_seed : new Date().getTime();
                        setRandomSeed(String(seed));
                        const max_g = max_accel_chk ? max_accel : 0.0;

                        const result = calculate_artificial_motion(
                            Number(seed),
                            Number(rise_time),
                            Number(level_time),
                            Number(total_time),
                            Number(damping_ratio),
                            Number(max_iteration),
                            Number(max_g),
                            Number(ds_len),
                            ds_periods,
                            ds
                        );

                        const periods = result["period"];
                        const rs_acc = result["rs_acc"];
                        const dts = result["dts"];
                        const accel = result["accel"];

                        const data_of_rs = [];
                        for (let i = 0; i < periods.length; i++) {
                            data_of_rs.push({ x: periods[i], y: rs_acc[i] });
                        }
                        const data_of_accel = [];
                        for (let i = 0; i < accel.length; i++) {
                            data_of_accel.push({ x: dts[i], y: accel[i] });
                        }

                        const new_chartdata = [ chartData[0], chartData[1], chartData[2], chartData[3],
                        {
                            id: 'Artificial Spectrum',
                            color: '#00ff00',
                            data: data_of_rs
                        }, 
                        {
                            id: 'Artificial Acceleration',
                            color: '#ff0000',
                            data: data_of_accel
                        }, 
                        ];

                        setChartData(new_chartdata);
                        setCalcAE(true);

                    } catch (e: any) {
                        console.error(e);
                    } finally {
                        enqueueSnackbar("Calculate artificial acceleration graph data successfully", {
                            variant: "success",
                            autoHideDuration: 1000,
                        });

                        processing.current = false;
                    }
                }, 500);
            }

            }
            maxPanelRows={8}
        />
    )
}

export default ComputeAE;
