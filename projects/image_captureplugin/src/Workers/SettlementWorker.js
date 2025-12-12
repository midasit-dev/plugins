import { hasError, loadData } from "../utils";
import { DBVARIANT } from "./dictionary";

export const DataLoader = async () => {
	const DBNAME = DBVARIANT.SETTLEMENT;
	const rawData = await loadData(DBVARIANT.PATH + DBNAME);
	if (hasError(rawData)) return [];
	if (rawData[DBNAME] === undefined) return [];

	let registeredNames = [];
	const dbData = rawData[DBNAME];
	for (const value in dbData) {
		const targetData = dbData[value];
		registeredNames.push("[Min]" + targetData.LCNAME);
		registeredNames.push("[Max]" + targetData.LCNAME);
		registeredNames.push("[All]" + targetData.LCNAME);
	}
	
	return registeredNames;
};
