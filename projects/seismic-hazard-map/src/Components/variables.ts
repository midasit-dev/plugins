import { atom } from 'recoil';

export const VarEarthquakeCode = atom({
	key: 'VarEarthquakeCode',
	default: 1,
});

export const earthquakeCodes: Array<[string, number]> = [
	[ "KDS 17 10 00 :2024", 1 ],
]

export const VarEarthquakeCodeList = atom({
	key: 'VarEarthquakeCodeList',
	default: earthquakeCodes,
});

export const getEarthquakeCodeName = (index: number): string => {
	const codeNames = earthquakeCodes;
	if (codeNames.length !== 0 && codeNames[index - 1]) {
		return codeNames[index - 1][0];
	} else {
		return '';
	}
}

export const VarPeriod = atom({
	key: 'VarPeriods',
	default: 2,
});

const periodCodes: Array<[string, number]> = [	
	[ "4,800년", 1 ],	
	[ "2,400년", 2 ],	
	[ "1,000년", 3 ],	
	[ "500년", 4 ],	
	[ "200년", 5 ],	
	[ "100년", 6 ],
	[ "50년", 7 ],
]
export const VarPeriodList = atom({
	key: 'VarPeriodList',
	default: periodCodes,
});

export const getPeriodName = (index: number): string => {
	const codeNames = periodCodes;
	if (codeNames.length !== 0 && codeNames[index - 1]) {
		return codeNames[index - 1][0];
	} else {
		return '';
	}
}

export const VarCalcType = atom({
	key: 'VarClacType',
	default: 1,
});

const calcTypeCodes: Array<[string, number]> = [
	[ "국가 지진 재해도", 1 ],
	[ "기본 지상 설하중", 2 ],
	[ "기본 풍속", 3 ],
]
export const VarCalcTypeList = atom({
	key: 'VarCalcTypeList',
	default: calcTypeCodes,
});

export const getCalcTypeName = (index: number): string => {
	const codeNames = calcTypeCodes;
	if (codeNames.length !== 0 && codeNames[index - 1]) {
		return codeNames[index - 1][0];
	} else {
		return '';
	}
}

export const VarLocationType = atom({
	key: 'VarLocationType',
	default: '1',
});

export const VarMessage = atom({
	key: 'VarMessage',
	default: '',
});

export const VarLatitude = atom({
	key: 'VarLatitude',
	default: '0',
});

export const VarLongitude = atom({
	key: 'VarLongitude',
	default: '0',
});

export const VarResultText = atom({
	key: 'VarResultText',
	default: '',
});

export const VarCalculated = atom({
	key: 'VarCalculated',
	default: false,
});


