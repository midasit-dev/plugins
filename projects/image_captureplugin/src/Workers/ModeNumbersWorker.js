import { hasError, loadData } from "../utils";
import { DBVARIANT } from "./dictionary";

export const DataLoader = async () => {
	const DBNAME = "EIGV";
	const rawData = await loadData(DBVARIANT.PATH + DBNAME);
	if (hasError(rawData)) return [];
	if (rawData[DBNAME] === undefined) return [];
	if (!Array.isArray(rawData[DBNAME])) return [];
	if (rawData[DBNAME].length === 0) return [];

	let registeredNames = [];
	const freq = rawData[DBNAME][1]["iFREQ"];
	for (let i = 1; i <= freq; i++) {
		registeredNames.push("Mode " + i);
	}

	return registeredNames;
};
