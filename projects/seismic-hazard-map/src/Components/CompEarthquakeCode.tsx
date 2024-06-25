import {
    Alert,
    Button,
    GuideBox,
    Radio,
    RadioGroup,
    Panel,
    TextField,
    Typography,
    Color,
    DropList,
} from "@midasit-dev/moaui"
import CompTypographyAndDropList from "./TypographyAndDropList";
import { useRecoilState, useRecoilValue } from 'recoil';
import React from 'react';
import { debounce } from 'lodash';
import {
    VarEarthquakeCode,
    VarEarthquakeCodeList,
    VarLocationType,
    VarMessage,
    VarLatitude,
    VarLongitude,
    VarResultText,
    VarCalculated,
    VarPeriod,
    VarPeriodList,
    VarCalcType,
    VarCalcTypeList
} from './variables';
import { get_earthquake_coeff } from '../utils_pyscript';
import CompTypographyAndTextField from "./TypographyAndTextField";

import { Accel_4800 } from './Accel_4800';
import { Accel_2400 } from './Accel_2400';
import { Accel_1000 } from "./Accel_1000";
import { Accel_500 } from "./Accel_500";
import { Accel_200 } from "./Accel_200";
import { Accel_100 } from "./Accel_100";
import { Accel_50 } from './Accel_50';


const ComponentEarthquakeCode = () => {
    const [earthquake_code, setEarthquakeCode] = useRecoilState(VarEarthquakeCode);
    const earthquake_code_list = useRecoilValue(VarEarthquakeCodeList);
    const [location_type, setLocationType] = useRecoilState(VarLocationType);
    const [message, setMessage] = useRecoilState(VarMessage);
    const [latitude, setLatitude] = useRecoilState(VarLatitude);
    const [longitude, setLongitude] = useRecoilState(VarLongitude);
    const [result_text, setResultText] = useRecoilState(VarResultText);
    const [calculated, setCalculated] = useRecoilState(VarCalculated);
    const [period, setPeriod] = useRecoilState(VarPeriod);
    const period_list = useRecoilValue(VarPeriodList);
    const [calc_type, setCalcType] = useRecoilState(VarCalcType);
    const calc_type_list = useRecoilValue(VarCalcTypeList);

    const processing = React.useRef(false);
    const [address, setAddress] = React.useState('');

    const calculate = (value: any) => {
        if(value === null) value = period;
        const geocoder = new kakao.maps.services.Geocoder();
        const callback = function (result: any, status: any) {
            if (status === kakao.maps.services.Status.OK) {
                let x_val = longitude;
                let y_val = latitude;
                if (location_type === '1') {
                    x_val = Number(result[0].x).toFixed(3);
                    y_val = Number(result[0].y).toFixed(3);
                    setLatitude(y_val);
                    setLongitude(x_val);
                }

                let msg_period = '2,400년'
                let dataset = Accel_2400;
                if(value === 7) {
                    dataset = Accel_50;
                    msg_period = '50년';
                } else if(value === 6) {
                    dataset = Accel_100;
                    msg_period = '100년';
                } else if(value === 5) {
                    dataset = Accel_200;
                    msg_period = '200년';
                } else if(value === 4) {
                    dataset = Accel_500;
                    msg_period = '500년';
                } else if(value === 3) {
                    dataset = Accel_1000;
                    msg_period = '1,000년';
                } else if(value === 2) {
                    dataset = Accel_2400;
                    msg_period = '2,400년';
                } else if(value === 1) {
                    dataset = Accel_4800;
                    msg_period = '4,800년';
                }            

                let scatter_data: number[][] = [];
                let scatter_value: number[] = [];
                dataset.map((item) => {
                    item.lnglat.forEach((point) => {
                        scatter_data.push([point.lng, point.lat]);
                        scatter_value.push(item.value);
                    });
                });

                const result_val = get_earthquake_coeff(x_val, y_val, scatter_data, scatter_value);

                let address_name = result[0].address_name;
                if (result[0].road_address) address_name = result[0].road_address.address_name;

                const interp_value = result_val["value"][0] / 100;
                const result_text = `유효 지반가속도 : ${interp_value.toFixed(3)}  `;

                setResultText(result_text);
                setCalculated(true);

                setMessage(`
#### ${address_name}  

(위도: ${Number(x_val).toFixed(3)}, 경도: ${Number(y_val).toFixed(3)})  

## 재현주기 ${msg_period}

# ${interp_value.toFixed(3)}(g)
`);
            } else {
                setMessage('No results found');
                setCalculated(false);
            }
        };

        if (location_type === '1') {
            geocoder.addressSearch(address, callback);
        }
        else if (location_type === '2') {
            const coord = new kakao.maps.LatLng(Number(latitude), Number(longitude));
            geocoder.coord2Address(coord.getLng(), coord.getLat(), callback);
        }

    }

    const onChangePeriod = (e: any) => {
        setPeriod(e.target.value);       
        calculate(e.target.value);
    };

    const onClear = () => {        
        setCalculated(false);        
        setResultText('');
        setMessage('');
        setAddress('');
    };

    const handleSearch = (e: any) => {
        if (location_type === '1' && !address) {
            setMessage("Please enter the location");
            return;
        }

        if (processing.current) return;

        processing.current = true;
        calculate(null);
        processing.current = false;
    };

    //for 디바운스!
    React.useEffect(() => {
        const debounceSetValue = debounce((newValue) => {
            setAddress(newValue);
        }, 500);

        debounceSetValue(address);

        // Cleanup the debounce function on component unmount
        return () => {
            debounceSetValue.cancel();
        };
    }, [address, setAddress]);

    const handleChange = (event: React.ChangeEvent, state: string) => {
        setLocationType(state);
    };

    return (
        <GuideBox width="100%" spacing={2}>
            <GuideBox width='100%' spacing={0.5} padding={1}>
                <CompTypographyAndDropList title="설계기준" state={earthquake_code} setState={setEarthquakeCode} blueTitle droplist={earthquake_code_list} width={200} />
                <GuideBox width="inherit" row horSpaceBetween verCenter height={30}>
                    <Typography
                        verCenter
                        variant="h1"
                        height={30}
                        color={Color.secondary.main}
                    >
                        재현주기
                    </Typography>
                    <DropList
                        width={200}
                        itemList={new Map<string, number>(period_list as [string, number][])}
                        defaultValue={period}
                        value={period}
                        onChange={onChangePeriod}
                        listWidth={200}
                    />
                </GuideBox>


                {/* <CompTypographyAndDropList title="지진/풍속/설하중" state={calc_type} setState={setCalcType} blueTitle droplist={calc_type_list} width={200} /> */}
            </GuideBox>
            <GuideBox width="100%" row spacing={1} padding={1}>
                <RadioGroup row
                    onChange={handleChange}
                    text="Graph Type"
                    value={location_type}
                >
                    <Radio
                        name="By Address"
                        value="1"
                    />
                    <Radio
                        name="By Latitude/Longitude"
                        value="2"
                        marginLeft={10}
                    />
                </RadioGroup>
            </GuideBox>
            <GuideBox width="100%" row horSpaceBetween>
                {location_type === '1' &&
                    <GuideBox width={300} row spacing={2}>
                        {/* <CompTypographyAndTextField title="Address" placeholder="Input Address" state={address} setState={setAddress} width={230} /> */}
                        <GuideBox width="100%" row horSpaceBetween>
                            <GuideBox width="inherit" row horSpaceBetween verCenter height={30}>
                                <Typography
                                    verCenter
                                    height={30}
                                    color={Color.text.primary}
                                >
                                    Address
                                </Typography>
                                <TextField                                    
                                    width={230}
                                    height={30}
                                    placeholder="Input Address"
                                    onChange={(e: any) => setAddress(e.target.value)}
                                    value={address}
                                />
                            </GuideBox>
                        </GuideBox>
                    </GuideBox>
                }
                {location_type === '2' &&
                    <GuideBox width={300} row spacing={2}>
                        <CompTypographyAndTextField title="Lat." state={latitude} setState={setLatitude} width={100} />
                        <CompTypographyAndTextField title="Long." state={longitude} setState={setLongitude} width={100} />
                    </GuideBox>
                }
                <Button onClick={handleSearch} width="20%" variant="contained" color='negative' >Search</Button>
            </GuideBox>
            <GuideBox width="100%">
                <Button onClick={onClear} width="100%">Reset</Button>
            </GuideBox>
        </GuideBox>
    )
}

export default ComponentEarthquakeCode;