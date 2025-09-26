import { hasError, loadData } from "../utils";
import { DBVARIANT } from "./dictionary";

const NationalDefinitions = {
	TRANS: "TR",
	EUROCODE: "EU",
	CHINA: "CH",
	INDIA: "ID",
	JAPAN: "JP",
	POLAND: "PL",
	BS: "BS",
};

export const DataLoader = async () => {
	const DBNAME = DBVARIANT.MOVING_LOAD;
	const DBCODE = DBVARIANT.MOVING_LOAD_VARIANT;

	const natlCodeData = await loadData(DBVARIANT.PATH + DBCODE);
	if (hasError(natlCodeData)) return [];
	if (!natlCodeData[DBCODE]) return [];
	if (!Array.isArray(natlCodeData[DBCODE])) return [];
	if (natlCodeData[DBCODE].length === 0) return [];
	const natlCode = natlCodeData[DBCODE][1]["CODE"];

	let natlCodePostFix = "";
	if (NationalDefinitions[natlCode] !== undefined)
		natlCodePostFix = NationalDefinitions[natlCode];

	const rawData = await loadData(DBVARIANT.PATH + DBNAME + natlCodePostFix);
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
