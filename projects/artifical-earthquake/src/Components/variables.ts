import { forEach } from 'lodash';
import { atom } from 'recoil';


function isLargerThanZero(value: string) {
	const val = parseFloat(value);
	return val > 0;
}

//if true, it is Valid
export const VarValids = atom({
	key: 'Errors',
	default: {
		VarDesignSpectrum: (value: any) => true,
		VarCalcDS: (value: any) => value,
		VarFindAddress: (value: boolean) => value,
	},
});

export const VarFuncName = atom({
	key: 'VarFuncName',
	default: '',
});

export interface ChartData {
	id: string;
	color: string;
	data: { x: string, y: string }[];
}
const chartData: ChartData[] = [
	// Design Spectrum of Design Spectrum Option
	{
		id: '',
		color: '',
		data: [],
	},
	{
		id: '',
		color: '',
		data: [],
	},
	{
		id: '',
		color: '',
		data: [],
	},
	{
		id: '',
		color: '',
		data: [],
	},
	// Artificial Spectrum
	{
		id: '',
		color: '',
		data: [],
	},
	// Artificial Earthquake Acceleration
	{
		id: '',
		color: '',
		data: [],
	},
];
export const VarChartData = atom({
	key: 'VarChartData',
	default: chartData,
});

export const VarCalcDS = atom({
	key: 'VarCalcDS',
	default: false,
});

export const VarCalcAE = atom({
	key: 'VarCalcAE',
	default: false,
});

const designSpectrumCodes: Array<[string, string]> = [
	["ASCE/SEI 7-22", 'asce7-22'],
	// ["ASCE/SEI 41-17", 'asce41-17'],
	// ["ASCE/SEI 41-23", 'asce41-23'],
]
export const VarDesignSpectrumList = atom({
	key: 'VarDesignSpectrumList',
	default: designSpectrumCodes,
});

export const getDesignSpectrumCodeName = (spectrumName: string): string => {
	for (const [key, value] of designSpectrumCodes) {
		if (value === spectrumName) {
			return key;
		}
	}
	return '';
}

export const VarDesignSpectrum = atom({
	key: 'VarDesignSpectrum',
	default: 'asce7-22',
});

export const VarMaximumPeriod = atom({
	key: 'VarMaximumPeriod',
	default: '10.0',
});

export const VarRiseTime = atom({
	key: 'VarRiseTime',
	default: '1',
});

export const VarLevelTime = atom({
	key: 'VarLevelTime',
	default: '2',
});

export const VarTotalTime = atom({
	key: 'VarTotalTime',
	default: '3',
});

export const VarMaxIteration = atom({
	key: 'VarMaxIteration',
	default: '1',
});

export const VarDampingRatio = atom({
	key: 'VarDampingRatio',
	default: '0.02',
});

export const VarRandomSeedChk = atom({
	key: 'VarRandomSeedChk',
	default: false,
});

export const VarRandomSeed = atom({
	key: 'VarRandomSeed',
	default: String(new Date().getTime()),
});

export const VarMaxAccelChk = atom({
	key: 'VarMaxAccelChk',
	default: false,
});

export const VarMaxAccel = atom({
	key: 'VarMaxAccel',
	default: '0.',
});

export const VarGraphType = atom({
	key: 'VarGraphType',
	default: '1',	// 1: Spectrum, 2: Acceleration
});

export const riskCategoryState = atom<string>({
	key: 'riskCategoryState',
	default: 'I',
});

export const siteClassState = atom<string>({
	key: 'siteClassState',
	default: 'A',
});

export const VarOutputType = atom({
	key: 'VarOutputType',
	default: "By Address",
});

export const designSpectrumOptions: Array<[string, string]> = [
	['Multi Period Design Spectrum', 'multiPeriodDesignSpectrum'],
	['Multi Period MCEr Spectrum', 'multiPeriodMCErSpectrum'],
	['Two Period Design Spectrum', 'twoPeriodDesignSpectrum'],
	['Two Period MCEr Spectrum', 'twoPeriodMCErSpectrum'],
]

export const getDesignSpectrumOptionName = (option: string): string => {
	for (const [key, value] of designSpectrumOptions) {
		if (value === option) {
			return key;
		}
	}
	return '';
}

export const VarDesignSpectrumOptionList = atom({
	key: 'VarDesignSpectrumOptionList',
	default: designSpectrumOptions,
});

export const VarDesignSpectrumOption = atom({
	key: 'VarDesignSpectrumOption',
	default: 'multiPeriodDesignSpectrum',
});

const riskCategory: Array<[string, string]> = [
	['I', 'I'], 
	['II', 'II'], 
	['III', 'III'], 
	['IV', 'IV'],
]

export const VarRiskCategoryList = atom({
	key: 'VarRiskCategoryList',
	default: riskCategory,
});

export const VarRiskCategory = atom({
	key: 'VarRiskCategory',
	default: 'I',
});

const siteSoilClass: Array<[string, string]> = [
	['A-Hard Rock', "A"], 
	['B-Rock', "B"], 
	['BC', "BC"], 
	['C-Very Dense Soil and Soft Rock',"C"],
	['CD', "CD"],
	['D-Stiff Soil', "D"],
	['DE', "DE"],
	['E-Soft Clay Soil', "E"], 
]

export const VarSiteSoilClassList = atom({
	key: 'VarSiteSoilClassList',
	default: siteSoilClass,
});

export const VarSiteSoilClass = atom({
	key: 'VarSiteSoilClass',
	default: 'A',
});

export const VarLongitude = atom({
	key: 'VarLongitude',
	default: '',
})

export const VarLatitude = atom({
	key: 'VarLatitude',
	default: '',
})

export const VarFindAddress = atom({
	key: 'VarFindAddress',
	default: false,
})

export const VarInputAddress = atom({
	key: 'VarInputAddress',
	default: ''
})

export const VarMessage = atom({
	key: 'VarMessage',
	default: '##### [Result Output]',
});
