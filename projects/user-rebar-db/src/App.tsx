import {
  Panel,
  DataGrid,
  Typography,
  GuideBox,
  Button,
  VerifyUtil,
} from "@midasit-dev/moaui";
import { useEffect, useState } from "react";

// material 데이터 변환
function transformInputToResult(input: any) {
  if (!Array.isArray(input)) return [];

  // 기존 데이터 변환
  const converted = input.map((item: any, index: any) => ({
    id: index + 1,
    matlname: item.MATLNAME || "",
    elast: item.ELAST || 0,
    densidy: item.DENSIDY || 0,
    fy: item.FY || 0,
  }));

  // 마지막에 빈 행 추가
  const emptyRow = {
    id: converted.length + 1,
    matlname: "",
    elast: "",
    densidy: "",
    fy: "",
  };

  return [...converted, emptyRow];
}

// 역방향 material 데이터 변환
function transformResultToInput(result: any) {
  return {
    MATLNAME: String(result.matlname) || "",
    ELAST: Number(result.elast) || 0,
    DENSIDY: Number(result.densidy) || 0,
    FY: Number(result.fy) || 0,
  };
}

// Diameter 변환 함수
function transformDiameter(input: any) {
  if (!Array.isArray(input)) return [];

  // 기존 데이터 변환
  const converted = input.map((item: any, index: any) => ({
    id: index + 1,
    dianame: item.DIANAME || "",
    dia: item.DIA || 0,
    area: item.AREA || 0,
    unitweight: item.UNITWEIGHT || 0,
  }));

  // 마지막에 빈 행 추가
  const emptyRow = {
    id: converted.length + 1,
    dianame: "",
    dia: "",
    area: "",
    unitweight: "",
  };

  return [...converted, emptyRow];
}

// 역방향 Diameter 변환 함수
function transformDiameterToInput(result: any) {
  return {
    DIANAME: String(result.dianame) || 0, // dianame -> DIANAME
    DIA: Number(result.dia) || 0, // dia -> DIA
    AREA: Number(result.area) || 0, // area -> AREA
    UNITWEIGHT: Number(result.unitweight) || 0, // unitweight -> UNITWEIGHT
  };
}

// 파일 상단에 인터페이스 추가
interface MdgnVarType {
  [key: string]: {
    vMATL: any[];
    vDIA: any[];
  };
}

const ComponentsDataGridPagination = () => {
  const [mdgnVar, setMdgnVar] = useState<MdgnVarType>({});

  const [rowMaterials, setRowMaterials] = useState({});
  const [rowDiameter, setRowDiameter] = useState({});

  useEffect(() => {
    async function getUserRebarDB() {
      const endPoint = (await VerifyUtil.getBaseUrlAsync()) + "/db/mdgn";
      const mapiKey = VerifyUtil.getMapiKey();
      const response = await fetch(endPoint, {
        headers: {
          "Content-Type": "application/json",
          "MAPI-Key": mapiKey,
        },
      });
      if (!response.ok) {
        console.error("error", response.statusText);
      }

      const data = await response.json();
      if ("error" in data) {
        console.error("error", data.error);
        return;
      }

      let rawData;
      try {
        rawData = data["MDGN"];
        setMdgnVar(rawData);

        const realMaterial = transformInputToResult(rawData["1"]["vMATL"]);
        setRowMaterials(realMaterial);
        const realDiameter = transformDiameter(rawData["1"]["vDIA"]);
        setRowDiameter(realDiameter);
      } catch (error) {
        console.error("Error parsing data:", error);
        return;
      }
    }

    getUserRebarDB();
  }, []);

  const handleSend = async () => {
    const endPoint = (await VerifyUtil.getBaseUrlAsync()) + "/db/mdgn";
    const mapiKey = VerifyUtil.getMapiKey();

    const response = await fetch(endPoint, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "MAPI-Key": mapiKey,
      },
      body: JSON.stringify({
        Assign: mdgnVar,
      }),
    });

    if (!response.ok) {
      console.error("error", response.statusText);
    } else {
      console.log("Data successfully sent");
    }
  };

  return (
    <Panel>
      <GuideBox spacing={5} padding={2} horRight>
        <GuideBox spacing={2}>
          <Typography variant="h1" size="large">
            Material
          </Typography>
          <Panel width={"100%"} height={300} variant="shadow2">
            <DataGrid
              rows={
                Object.keys(rowMaterials).length === 0
                  ? emptyRowsMatl
                  : (rowMaterials as any)
              }
              columns={columnsMatl}
              hideFooter
              processRowUpdate={(newRow: any, oldRow: any) => {
                // 현재 행이 마지막 행인지 확인
                const isLastRow =
                  newRow.id === Object.keys(rowMaterials).length;

                setMdgnVar((prevMdgnVar) => {
                  const updatedMdgnVar = { ...prevMdgnVar };
                  updatedMdgnVar["1"]["vMATL"][newRow.id - 1] =
                    transformResultToInput(newRow);
                  return updatedMdgnVar;
                });

                // 마지막 행이 수정된 경우 새로운 빈 행 추가
                if (isLastRow) {
                  setRowMaterials((prev: any) => {
                    const emptyRow = {
                      id: prev.length + 1,
                      matlname: "",
                      elast: "",
                      densidy: "",
                      fy: "",
                    };
                    return [...prev, emptyRow];
                  });
                }

                return newRow;
              }}
              onProcessRowUpdateError={(error: any) => {
                console.error("Error updating row:", error);
              }}
            />
          </Panel>
        </GuideBox>

        <GuideBox spacing={2}>
          <Typography variant="h1" size="large">
            Diameter
          </Typography>
          <Panel width={"100%"} height={300} variant="shadow2">
            <DataGrid
              rows={
                Object.keys(rowDiameter).length === 0
                  ? emptyRowsDia
                  : (rowDiameter as any)
              }
              columns={columnsDia}
              hideFooter
              processRowUpdate={(newRow: any, oldRow: any) => {
                // 현재 행이 마지막 행인지 확인
                const isLastRow = newRow.id === Object.keys(rowDiameter).length;

                setMdgnVar((prevMdgnVar) => {
                  const updatedMdgnVar = { ...prevMdgnVar };
                  updatedMdgnVar["1"]["vDIA"][newRow.id - 1] =
                    transformDiameterToInput(newRow);
                  return updatedMdgnVar;
                });

                // 마지막 행이 수정된 경우 새로운 빈 행 추가
                if (isLastRow) {
                  setRowDiameter((prev: any) => {
                    const emptyRow = {
                      id: prev.length + 1,
                      dianame: "",
                      dia: "",
                      area: "",
                      unitweight: "",
                    };
                    return [...prev, emptyRow];
                  });
                }

                return newRow;
              }}
              onProcessRowUpdateError={(error: any) => {
                console.error("Error updating row:", error);
              }}
            />
          </Panel>
        </GuideBox>

        <Button color="negative" onClick={handleSend}>
          Send
        </Button>
      </GuideBox>
    </Panel>
  );
};

export default ComponentsDataGridPagination;

const columnsMatl = [
  { field: "matlname", headerName: "MATLNAME", width: 100, editable: true },
  { field: "elast", headerName: "ELAST", width: 100, editable: true },
  { field: "densidy", headerName: "DENSIDY", width: 100, editable: true },
  { field: "fy", headerName: "FY", width: 100, editable: true },
];

const emptyRowsMatl = [
  { id: 1, matlname: "", elast: null, densidy: null, fy: null },
  { id: 2, matlname: "", elast: null, densidy: null, fy: null },
  { id: 3, matlname: "", elast: null, densidy: null, fy: null },
];

const rowsMatl = [
  { id: 1, matlname: "Steel", elast: 200000, densidy: 7850, fy: 250 },
  { id: 2, matlname: "Concrete", elast: 30000, densidy: 2400, fy: 40 },
  { id: 3, matlname: "Aluminum", elast: 70000, densidy: 2700, fy: 150 },
  { id: 4, matlname: "Wood", elast: 11000, densidy: 600, fy: 30 },
  { id: 5, matlname: "Glass", elast: 72000, densidy: 2500, fy: 10 },
  { id: 6, matlname: "Rubber", elast: 100, densidy: 1500, fy: 5 },
  { id: 7, matlname: "Copper", elast: 110000, densidy: 8960, fy: 70 },
  { id: 8, matlname: "Titanium", elast: 116000, densidy: 4500, fy: 140 },
  { id: 9, matlname: "Brass", elast: 97000, densidy: 8500, fy: 90 },
  { id: 10, matlname: "Carbon Fiber", elast: 70000, densidy: 1600, fy: 500 },
];

const columnsDia = [
  { field: "dianame", headerName: "DIANAME", width: 100, editable: true },
  { field: "dia", headerName: "DIA", width: 100, editable: true },
  { field: "area", headerName: "AREA", width: 100 },
  { field: "unitweight", headerName: "UNITWEIGHT", width: 100 },
];

const emptyRowsDia = [
  { id: 1, dianame: "", dia: null, area: null, unitweight: null },
  { id: 2, dianame: "", dia: null, area: null, unitweight: null },
  { id: 3, dianame: "", dia: null, area: null, unitweight: null },
];

const rowsDia = [
  { id: 1, dianame: "uD4", dia: 4.23, area: 14.05, unitweight: 0.0010787315 },
  { id: 2, dianame: "uD6", dia: 6.35, area: 31.67, unitweight: 0.002432 },
  { id: 3, dianame: "uD8", dia: 8.0, area: 50.27, unitweight: 0.00395 },
  { id: 4, dianame: "uD10", dia: 10.16, area: 81.07, unitweight: 0.00635 },
  { id: 5, dianame: "uD12", dia: 12.7, area: 126.68, unitweight: 0.0099 },
  { id: 6, dianame: "uD16", dia: 16.0, area: 201.06, unitweight: 0.0158 },
  { id: 7, dianame: "uD20", dia: 20.32, area: 324.29, unitweight: 0.0254 },
  { id: 8, dianame: "uD25", dia: 25.4, area: 506.71, unitweight: 0.0397 },
  { id: 9, dianame: "uD32", dia: 32.0, area: 804.25, unitweight: 0.0628 },
  { id: 10, dianame: "uD40", dia: 40.0, area: 1256.64, unitweight: 0.098 },
];
