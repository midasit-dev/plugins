import React from "react";
import m from "@midasit-dev/moaui";
import HelpButton from "./Help";
import { QueryClient, QueryClientProvider, useQuery } from "react-query";
import { motion, AnimatePresence } from "framer-motion";
import { useSnackbar } from "notistack";

const queryClient = new QueryClient();

const WrappingReactQuery = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  );
};

export default WrappingReactQuery;

/** ---------------------------------------------
 *  API: /view/select
 * --------------------------------------------- */
const fetchData = async () => {
  const url = await m.VerifyUtil.getBaseUrlAsync();
  const endpoint = url + "/view/select";
  const mapiKey = m.VerifyUtil.getMapiKey();
  const headers = {
    "Content-Type": "application/json",
    "MAPI-KEY": mapiKey,
  };

  const resGet = await fetch(endpoint, { method: "GET", headers });
  if (resGet.ok) return await resGet.json();

  console.error("error", resGet.statusText);
  return undefined;
};

/** ---------------------------------------------
 *  Excel Copy Helpers (TSV with HEADER)
 * --------------------------------------------- */
const sanitizeForTSV = (v: any) => {
  if (v === null || v === undefined) return "";
  return String(v).replace(/\t/g, " ").replace(/\r?\n/g, " ");
};

const buildTSVWithHeader = (rows: any[], columnNames: string[]) => {
  const header = columnNames.join("\t");
  const body = rows
    .map((r) =>
      columnNames
        .map((_, i) => sanitizeForTSV(r?.[`Col${i + 1}`]))
        .join("\t")
    )
    .join("\n");
  return `${header}\n${body}`;
};

const App = () => {
  const { enqueueSnackbar } = useSnackbar();

  const { data, refetch } = useQuery("getSelect", fetchData, {
    enabled: false,
  });

  const [selectedElems, setSelectedElems] = React.useState<string>("");
  const [selElemCounts, setSelElemCounts] = React.useState<number>(0);
  const [rows, setRows] = React.useState<any[]>([]);
  const [units, setUnits] = React.useState<string>("");
  const [singleRow, setSingleRow] = React.useState<any[][]>([]);
  const [openDetail, setOpenDetail] = React.useState<boolean>(false);
  const [loading, setLoading] = React.useState<boolean>(false);

  // 페이지가 focus 되었을 때 refetch 실행
  React.useEffect(() => {
    const handleFocus = () => refetch();
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [refetch]);

  React.useEffect(() => {
    if (data) setLoading(true);
  }, [data]);

  React.useEffect(() => {
    const init = async () => {
      const getFetching = async (path: string): Promise<any> => {
        const url = await m.VerifyUtil.getBaseUrlAsync();
        const mapiKey = m.VerifyUtil.getMapiKey();
        const res = await fetch(`${url}${path}`, {
          headers: { "Content-Type": "application/json", "MAPI-Key": mapiKey },
        });
        if (res.ok) return await res.json();
        console.error("fetching error", path, res.statusText);
        return {};
      };

      const postFetching = async (path: string, body: any): Promise<any> => {
        const url = await m.VerifyUtil.getBaseUrlAsync();
        const mapiKey = m.VerifyUtil.getMapiKey();
        const res = await fetch(`${url}${path}`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "MAPI-Key": mapiKey },
          body: JSON.stringify(body),
        });
        if (res.ok) return await res.json();
        console.error("fetching error", path, res.statusText);
        return {};
      };

      try {
        const selElemArr = (data?.["SELECT"]?.["ELEM_LIST"] ?? []) as number[];
        setSelectedElems(selElemArr.join(",").toString());
        setSelElemCounts(selElemArr.length);

        const allElemData = (await getFetching("/db/elem"))?.["ELEM"] ?? {};
        const allMatlData = (await getFetching("/db/matl"))?.["MATL"] ?? {};
        const allSectData = (await getFetching("/db/sect"))?.["SECT"] ?? {};

        const ewtRes = await postFetching("/post/table", {
          Argument: { TABLE_NAME: "EWT", TABLE_TYPE: "ELEMENTWEIGHT" },
        });
        const allElemWeightData = ewtRes?.["EWT"] ?? {};
        setUnits(
          `${allElemWeightData?.["FORCE"] ?? ""} ${allElemWeightData?.["DIST"] ?? ""}`
        );

        const headers: string[] = allElemWeightData?.["HEAD"] ?? [];
        const indexElemID = 1;
        const indexLAV = headers.indexOf("Value");
        const indexWeightU = headers.indexOf("Unit Weight");
        const indexWeightT = headers.indexOf("Total Weight");

        const allBeamEndRelease = (await getFetching("/db/frls"))?.["FRLS"] ?? {};

        const resultRows = selElemArr.map((elementID: number, index: number) => {
          const elem = allElemData?.[elementID];

          const nodeConnectvity =
            elem?.["NODE"]?.filter((num: number) => num !== 0)?.toString() ?? "-";

          const elementType = elem?.["TYPE"] ?? "-";

          const matlName = allMatlData?.[elem?.["MATL"]]
            ? allMatlData[elem["MATL"]]["NAME"]
            : "-";

          const sectName = allSectData?.[elem?.["SECT"]]
            ? allSectData[elem["SECT"]]["SECT_NAME"]
            : "-";

          const curWeightTBRow = (allElemWeightData?.["DATA"] ?? []).filter(
            (row: any) => Number(row?.[indexElemID]) === elementID
          )[0];

          let beamEndRelease = "";
          if (elementType === "BEAM") {
            const bers = allBeamEndRelease?.[String(elementID)]?.ITEMS?.[0];
            if (!bers) {
              beamEndRelease = "F-F";
            } else {
              const is_fixed_I = String(bers["FLAG_I"] ?? "")
                .split("")
                .every((char: string) => char === "0");
              const str_i = is_fixed_I ? "F" : "P";

              const is_fixed_J = String(bers["FLAG_J"] ?? "")
                .split("")
                .every((char: string) => char === "0");
              const str_j = is_fixed_J ? "F" : "P";

              beamEndRelease = `${str_i}-${str_j}`;
            }
          }

          return {
            id: index + 1,
            Col1: elementID,
            Col2: nodeConnectvity,
            Col3: elementType,
            Col4: matlName,
            Col5: sectName,
            Col6: curWeightTBRow && indexLAV >= 0 ? curWeightTBRow[indexLAV] : "",
            Col7: curWeightTBRow && indexWeightU >= 0 ? curWeightTBRow[indexWeightU] : "",
            Col8: curWeightTBRow && indexWeightT >= 0 ? curWeightTBRow[indexWeightT] : "",
            Col9: beamEndRelease,
          };
        });

        setRows(resultRows);
        setOpenDetail(false);
        setSingleRow([]);
      } catch (err) {
        console.error("main logic error", err);
      } finally {
        setLoading(false);
      }
    };

    if (data && loading) init();
  }, [data, loading]);

  /** ---------------------------------------------
   *  Copy to Excel (HEADER ALWAYS INCLUDED)
   * --------------------------------------------- */
  const handleCopyToExcel = async () => {
    try {
      if (!rows || rows.length === 0) {
        enqueueSnackbar("No rows to copy. Please select elements first.", {
          variant: "warning",
        });
        return;
      }

      const tsv = buildTSVWithHeader(rows, columnNames);

      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(tsv);
      } else {
        // fallback
        const ta = document.createElement("textarea");
        ta.value = tsv;
        ta.style.position = "fixed";
        ta.style.left = "-9999px";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }

      enqueueSnackbar(`Copied (with header) ${rows.length} row(s). Paste into Excel.`, {
        variant: "success",
      });
    } catch (e) {
      console.error("Copy failed", e);
      enqueueSnackbar("Copy failed. Please try again.", { variant: "error" });
    }
  };

  return (
    <AnimatePresence>
      <m.GuideBox width="auto" spacing={2} padding={2} loading={loading}>
        <m.VerifyDialog />

        <m.GuideBox width="100%" row horSpaceBetween verCenter>
          <m.GuideBox row spacing={1} verCenter horSpaceBetween>
            <m.Typography variant="h1">
              Selected Elements ({selElemCounts.toString()})
            </m.Typography>

            <div onFocus={() => refetch()}>
              <m.TextField value={selectedElems} disabled />
            </div>

            <div style={{ position: "relative", zIndex: 999 }}>
              <m.Switch
                checked={openDetail}
                label="Detail"
                onChange={(e: any, checked: boolean) => setOpenDetail(checked)}
              />

              {openDetail && (
                <motion.div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 80,
                    background: m.Color.primaryNegative.main,
                    width: "auto",
                    height: "auto",
                    borderRadius: 4,
                  }}
                  initial={{ opacity: 0, y: -50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <m.Panel variant="box">
                    {singleRow.length === 0 && (
                      <m.Typography color={m.Color.primary.white} width={200}>
                        Please select a row ...
                      </m.Typography>
                    )}

                    {singleRow.length !== 0 && (
                      <m.GuideBox spacing={1}>
                        {singleRow.map((row: any, index: number) => (
                          <m.GuideBox
                            key={`${index}`}
                            row
                            horSpaceBetween
                            verCenter
                            width={200}
                          >
                            <m.Typography variant="h1" color={m.Color.primary.white}>
                              {row[0]}
                            </m.Typography>

                            {row[1] !== undefined && row[1] !== null && (
                              <motion.div
                                initial={{ opacity: 0, x: -100 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.05 * index }}
                              >
                                <m.Typography color={m.Color.primary.white}>
                                  {String(row[1])}
                                </m.Typography>
                              </motion.div>
                            )}
                          </m.GuideBox>
                        ))}
                      </m.GuideBox>
                    )}
                  </m.Panel>
                </motion.div>
              )}
            </div>
          </m.GuideBox>

          <m.GuideBox row spacing={1} verCenter>
            <m.Typography>{units}</m.Typography>
            <HelpButton />
          </m.GuideBox>
        </m.GuideBox>

        <m.GuideBox width="100%" height="auto" spacing={1}>
          <m.Panel width="100%" height={280} padding={0}>
            <m.DataGrid
              hideFooter
              rows={rows}
              columns={columnNames.map((colName: string, index: number) =>
                column(`Col${index + 1}`, colName)
              )}
              onCellClick={(params: any) => {
                const rowData = columnNames.map((colName: string, index: number) => {
                  return [colName, params["row"][`Col${index + 1}`]];
                });
                setSingleRow(rowData);
              }}
            />
          </m.Panel>
        </m.GuideBox>

        {/* ✅ Copy to Excel */}
        <m.GuideBox width="100%" row horSpaceBetween verCenter>
          <m.GuideBox row spacing={1} verCenter>
            <m.Typography variant="body2">
              {`Rows: ${rows.length}`}
            </m.Typography>
          </m.GuideBox>
          
          <m.GuideBox row spacing={1} verCenter>
            <m.Button
              onClick={handleCopyToExcel}
              disabled={loading || rows.length === 0}
            >
              Copy to Excel
            </m.Button>
          </m.GuideBox>

        </m.GuideBox>

      </m.GuideBox>
    </AnimatePresence>
  );
};

const column = (field: string, headerName: string, width = 80) => {
  return { field, headerName, width, sortable: false };
};

const columnNames: string[] = [
  "Elem ID",
  "Node Con",
  "Type",
  "Material",
  "Section",
  "L/A/V",
  "Weight(U)",
  "Weight(T)",
  "BER",
];
