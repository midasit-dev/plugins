import {
  getBaseUrlAsync,
  getMapiKey,
} from "@midasit-dev/moaui/Authentication/VerifyUtil";

interface STLDObject {
  [key: string]: {
    NAME: string;
    DESC: string;
    NO: 1;
    TYPE: string;
  };
}

export async function fetchSTLD(): Promise<Array<[string, number]> | null> {
  const baseUrl = await getBaseUrlAsync();
  const mapiKey = getMapiKey();

  const response = await fetch(`${baseUrl}/db/stld`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "MAPI-Key": mapiKey,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch load cases (STLD)!.");
  }

  const dataObject = (await response.json()).STLD as STLDObject;
  if (!dataObject) {
    return [];
  }

  const dataNameArray = Object.entries(dataObject).map(
    ([key, value]) => [value.NAME, Number(key)] as [string, number]
  );

  return dataNameArray;
}

interface SELECTObject {
  NODE_LIST: Array<number>;
  ELEM_LIST: Array<number>;
}

export async function fetchSelect() {
  const baseUrl = await getBaseUrlAsync();
  const mapiKey = getMapiKey();

  const response = await fetch(`${baseUrl}/view/select`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "MAPI-Key": mapiKey,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch select!.");
  }

  const dataObject = (await response.json()).SELECT as SELECTObject;
  if (!dataObject || !dataObject.NODE_LIST || !dataObject.ELEM_LIST) {
    throw new Error("It is not exist! (Select)");
  }

  return {
    nodes: dataObject.NODE_LIST,
    elems: dataObject.ELEM_LIST,
  };
}
