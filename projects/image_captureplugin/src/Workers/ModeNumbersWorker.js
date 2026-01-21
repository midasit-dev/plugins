import { hasError, loadData } from "../utils";
import { DBVARIANT } from "./dictionary";

export const DataLoader = async () => {
	const DBNAME = "EIGV";
	const rawData = await loadData(DBVARIANT.PATH + DBNAME);
	if (hasError(rawData)) return [];
	if (rawData[DBNAME] === undefined) return [];

	// EIGV는 객체 형태로 반환됨 (배열 아님)
	const eigvData = rawData[DBNAME][1];
	if (!eigvData || eigvData["iFREQ"] === undefined) return [];

	let registeredNames = [];
	const freq = eigvData["iFREQ"];
	for (let i = 1; i <= freq; i++) {
		registeredNames.push("Mode " + i);
	}

	return registeredNames;
};
