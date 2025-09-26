import { hasError, loadData } from "../utils";

export const DataLoader = async (cmdUrl) => {
	const rawData = await loadData(cmdUrl);
	if (hasError(rawData)) return [];
	if (rawData === undefined) return [];

	const firstValue = Object.values(rawData)[0];
	if (Object.keys(firstValue).length === 0) {
		return [];
	}
	return rawData;
};
