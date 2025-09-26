import { hasError, loadData } from "../utils";
import { DBVARIANT } from "./dictionary";

export const DataLoader = async (user) => {
	let DBNAME = DBVARIANT.LOAD_COMBINATION;
	const type = user[0];
	const active = user[1];
	const lcType = user[2];
	switch (type) {
		case "General":
			DBNAME = "LCOM-GEN";
			break;
		case "Steel Design":
			DBNAME = "LCOM-STEEL";
			break;
		case "Concrete Design":
			DBNAME = "LCOM-CONC";
			break;
		case "SRC Design":
			DBNAME = "LCOM-SRC";
			break;
		case "Composite Steel Girder Design":
			DBNAME = "LCOM-STLCOMP";
			break;
		case "Seismic":
			DBNAME = "LCOM-SEISMIC";
			break;
	}
	let lcTypeIndex = -1;
	if (lcType && lcType != "All") {
		switch (lcType) {
			case "Add":
				lcTypeIndex = 0;
				break;
			case "Envelope":
				lcTypeIndex = 1;
				break;
			case "ABS":
				lcTypeIndex = 2;
				break;
			case "SRSS":
				lcTypeIndex = 3;
				break;
		}

	}

	const rawData = await loadData(DBVARIANT.PATH + DBNAME);
	if (hasError(rawData)) return [];
	if (rawData[DBNAME] === undefined) return [];
	//if (!Array.isArray(rawData[DBNAME])) return [];
	//if (rawData[DBNAME].length === 0) return [];

	let registeredItems = [];
	const dbData = rawData[DBNAME];

	const checkEnv = (targetData, dbData) => {
		if (targetData.iTYPE == 1)
			return true;
		for (const vComb of targetData.vCOMB) {
			if (vComb.ANAL == "MV")
				return true;
			if (vComb.ANAL == "SM")
				return true;
			if (vComb.ANAL.startsWith("CB")) {
				//const index = dbData.findIndex(item => item.NAME === vComb.LCNAME);
				let index = -1;
				for(let i = 0; i < dbData.length; i++) {
					if(dbData[i].NAME === vComb.LCNAME) {
						index = i;
						break;
					}
				}
				if(dbData[index]){
					if(checkEnv(dbData[index],dbData))
						return true;
				}

			}
		}
		return false;

	};

	for (const value in dbData) {
		const targetData = dbData[value];
		// const findResult = user.findIndex((value) => (value.NAME === targetData.NAME));
		// if (findResult === -1)
		if (targetData.ACTIVE == active) {

			if (lcTypeIndex != -1) {
				const iType = targetData.iTYPE;
				if (iType != lcTypeIndex)
					continue;
			}

			//if (targetData["iTYPE"] == 1) {
			if (checkEnv(targetData, dbData)) {
				registeredItems.push("[Min]" + targetData.NAME);
				registeredItems.push("[Max]" + targetData.NAME);
				registeredItems.push("[All]" + targetData.NAME);
			}
			else {
				registeredItems.push(targetData.NAME);
			}

		}
		// else if (!user[findResult].markAsRemoved)
		// 	registeredItems.push(user[findResult]);
	}

	return registeredItems;
};

DataLoader.defaultProps = { user: [] };

export const DataRawLoader = async ({ user }) => {
	const DBNAME = DBVARIANT.LOAD_COMBINATION;
	const rawData = await loadData(DBVARIANT.PATH + DBNAME);
	if (hasError(rawData)) return [];
	if (rawData[DBNAME] === undefined) return [];

	let registeredItems = [];
	const dbData = rawData[DBNAME];

	for (const value in dbData) {
		const targetData = dbData[value];
		registeredItems.push({ key: value, ...targetData, isPending: true });
	}

	if (user.length > 0) {
		for (const value of user) {
			const findResult = registeredItems.findIndex((registeredItem) => (registeredItem.key === value.key));
			if (findResult === -1) {
				if (value.markAsRemoved) continue;
				else registeredItems.push(value);
			} else {
				if (value.markAsRemoved) registeredItems.splice(findResult, 1);
				else registeredItems[findResult] = value;
			}
		}
	}

	return registeredItems;
};

DataRawLoader.defaultProps = { user: [] };