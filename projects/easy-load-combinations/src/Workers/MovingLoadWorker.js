import { loadData, hasError, isDemo } from "../utils";
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

  const natlCodeData = isDemo()
    ? {
        MVCD: {
          1: {
            CODE: "EUROCODE",
          },
        },
      }
    : await loadData(DBVARIANT.PATH + DBCODE);
  if (hasError(natlCodeData)) return [];

  const natlCode = natlCodeData[DBCODE][1]["CODE"];

  let natlCodePostFix = "";
  if (NationalDefinitions[natlCode] !== undefined)
    natlCodePostFix = NationalDefinitions[natlCode];

  //국가에 따라 PostFix가 있을 수 있다. (KOREA는 없음)
  const ROOTNAME = DBNAME + natlCodePostFix;

  const rawData = isDemo()
    ? {
        MVLD: {
          1: {
            LCNAME: "Moving Load 1",
          },
          2: {
            LCNAME: "Moving Load 2",
          },
          3: {
            LCNAME: "Moving Load 3",
          },
        },
      }
    : await loadData(DBVARIANT.PATH + ROOTNAME);

  if (hasError(rawData)) return [];
  if (rawData[ROOTNAME] === undefined) return [];

  let registeredNames = [];
  const dbData = rawData[ROOTNAME];
  for (const value in dbData) {
    const targetData = dbData[value];
    registeredNames.push(targetData.LCNAME);
  }

  return registeredNames;
};
