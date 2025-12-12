import { loadData, hasError, isDemo } from "../utils";

export const DataLoader = async () => {
	const rawData = await loadData("/VIEW/SELECT");
	if (hasError(rawData)) return [];
	if (rawData["SELECT"] === undefined) return [];

	let registeredNames = [];
	const dbData = rawData["SELECT"];
	// for (const value in dbData) {
	// 	const targetData = dbData[value];
	// 	if (targetData.TYPE !== "CS") registeredNames.push(targetData.NAME);
	// }

	return dbData;
};
