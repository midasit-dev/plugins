import React from 'react';
import {
    TemplatesFunctionalComponentsValidCheckDialog,
    Color,
} from "@midasit-dev/moaui";
import { useSnackbar } from 'notistack';
import { useRecoilState, useRecoilValue } from "recoil";
import {
    VarChartData,
    designSpectrumOptions,
    VarDesignSpectrumOption,
} from "./variables";
import { update_artificial_earthquake } from '../utils_pyscript';

const UpdateAE = (props: any) => {
    const { open, setOpen } = props;
    const [chartData, setChartData] = useRecoilState(VarChartData);
    const [spectrumOption, setSpectrumOption] = useRecoilState(VarDesignSpectrumOption);

    //for CheckList
    const [checkList, setCheckList] = React.useState<any>([]);
    const processing = React.useRef(false);

    const { enqueueSnackbar } = useSnackbar();
        
    let spectrumName = '';
    for (const [key, value] of designSpectrumOptions) {
        if (value === spectrumOption) {
            spectrumName = key;
            break;
        }        
    }

    React.useEffect(() => {
        setCheckList([
            { title: `ASCE7-22 : ${spectrumName}`, value: true, error: false, reason: "" },
        ]);
    }, []);

    return (
        <TemplatesFunctionalComponentsValidCheckDialog
            open={open}
            setOpen={setOpen}
            checkList={checkList}
            buttonText="Update Time History Function"
            buttonClick={() => {
                if (processing.current) return;
                setTimeout(() => {
                    try {
                        processing.current = true;

                        const x_values = chartData[5].data.map((item: any) => Number(item.x));
                        const y_values = chartData[5].data.map((item: any) => Number(item.y));
                        const result = update_artificial_earthquake("ASCE7-22", spectrumName, x_values, y_values);

                    } catch (e: any) {
                        console.error(e);
                    } finally {
                        enqueueSnackbar("Update time history function successfully", {
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

export default UpdateAE;
