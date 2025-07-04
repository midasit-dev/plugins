import { VerifyUtil } from "@midasit-dev/moaui";

/**
 * @description API
 */

export async function midasAPI(method: string, subURL: string, body: any) {
  const baseURL = await VerifyUtil.getBaseUrlAsync();
  const mapiKey = VerifyUtil.getMapiKey();
  const response = await fetch(`${baseURL}${subURL}`, {
    method: method,
    headers: {
      "Content-Type": "application/json",
      "MAPI-Key": mapiKey,
    },
    body: method === "GET" ? undefined : JSON.stringify(body),
  });
  return response.json();
}
