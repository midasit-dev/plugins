import { useEffect, useState, useRef } from "react";
import { Chart } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LinearScale,
  CategoryScale,
  BarElement,
  PointElement,
  LineElement,
  Legend,
  Tooltip,
  LineController,
  BarController,
  Title,
} from "chart.js";
import annotationPlugin from "chartjs-plugin-annotation";
import { Alert } from "@mui/material";
import { Grid } from "@midasit-dev/moaui";
import { useRecoilState, useRecoilValue } from "recoil";
import {
  filteredTableListState,
  TableTypeState,
  CheckBoxState,
  TableErrState,
} from "../../../values/RecoilValue";
import { isEmpty } from "lodash";
import { useTranslation } from "react-i18next";
import {
  eSubType,
  getBinlinearCase,
  getMultiCase,
  getSlipCase,
  getTetralinearCase,
  getTrilinearCase,
  TableTypeName,
} from "../../../values/EnumValue";

ChartJS.register(
  LinearScale,
  CategoryScale,
  BarElement,
  PointElement,
  LineElement,
  Legend,
  Tooltip,
  LineController,
  BarController,
  Title,
  annotationPlugin
);

const GraphChart = () => {
  const { t: translate, i18n: internationalization } = useTranslation();
  const filterList = useRecoilValue(filteredTableListState);
  const TableType = useRecoilValue(TableTypeState);
  const CheckBox = useRecoilValue(CheckBoxState);
  const [TableErr, setTableErr] = useRecoilState(TableErrState);

  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<any>(null);
  const [scale, setScale] = useState(0);
  const [xyPoint, setxyPoint] = useState<object[]>([]);
  const [dataList, setyDataList] = useState<any[]>([]);
  const [errmsg, setyErrmsg] = useState<string>("");

  useEffect(() => {
    // 차트 크기 계산
    const [width, height] = xyPoint.reduce(
      (acc: number[], arr: any) => {
        if (arr.length > 0) {
          const maxXY = arr.reduce(
            (mm: number[], point: any) => {
              mm[0] = Math.max(mm[0], point.x);
              mm[1] = Math.max(mm[1], point.y);
              return mm;
            },
            [0, 0]
          );
          const minXY = arr.reduce(
            (mm: number[], point: any) => {
              mm[0] = Math.min(mm[0], point.x);
              mm[1] = Math.min(mm[1], point.y);
              return mm;
            },
            [0, 0]
          );

          acc[0] = Math.max(
            acc[0],
            Math.max(Math.abs(maxXY[0]), Math.abs(minXY[0]))
          );
          acc[1] = Math.max(
            acc[1],
            Math.max(Math.abs(maxXY[1]), Math.abs(minXY[1]))
          );
        }
        return acc;
      },
      [0, 0]
    );
    setScale(Math.max(width, height) + 1);

    // 차트 업데이트
    if (chartRef !== undefined) {
      const annotation = {
        xLine: {
          type: "line" as const,
          scaleID: "x",
          value: 0,
          borderColor: "gray",
          borderWidth: 2,
          label: {
            content: "x=0",
            enabled: true,
            position: "start" as const,
          },
          // callbacks: function (value: any) {
          // },
        },
        yLine: {
          type: "line" as const,
          scaleID: "y",
          value: 0,
          borderColor: "gray",
          borderWidth: 2,
          label: {
            content: "y=0",
            enabled: true,
            position: "start" as const,
          },
        },
      };

      const findZeroX = xyPoint.some((arr: any) =>
        arr.some((point: any) => point.x === 0)
      );
      const findZeroY = xyPoint.some((arr: any) =>
        arr.some((point: any) => point.y === 0)
      );
      if (findZeroX && findZeroY)
        setTimeout(() => {
          chartRef.current.options.plugins.annotation.annotations = annotation;
          chartRef.current.update();
        }, 500);
    }
  }, [xyPoint]);

  useEffect(() => {
    if (filterList === undefined) return;
    initChart();
  }, [filterList, CheckBox]);

  const initChart = () => {
    initDataList();
  };

  const initDataList = () => {
    let errArr: boolean[] = [];

    switch (TableType) {
      case 1:
        errArr = setDataGraph();
        break;
      case 2:
        errArr = setDataGraph();
        break;
      case 3:
        errArr = setMulDataGraph();
        break;
    }

    const bErr = errArr.some((bool) => bool === true);
    if (bErr) setyErrmsg(translate("Graph_err"));
    else setyErrmsg("");
    setTableErr(bErr);
  };

  const setDataGraph = (): boolean[] => {
    const backupXY = [...xyPoint];
    setxyPoint([]);
    let errArr: boolean[] = [];

    const list = CheckBox.map((checkIdx) => filterList[checkIdx]);
    setyDataList(list);
    list.forEach((value, idx) => {
      const HistoryModel = value.HISTORY_MODEL;
      const nPnd = TableType === 1 ? value.DATA.PND : value.DATA.PND + 1;
      switch (nPnd) {
        case 2: // Binlinear
          {
            if (
              HistoryModel === "SLBI" ||
              HistoryModel === "SLBT" ||
              HistoryModel === "SLBC"
            ) {
              const xyPoint = getSlipCase(
                value.DATA,
                TableType,
                HistoryModel,
                eSubType["Bilinear"]
              );
              setxyPoint((preXY) => [
                ...preXY,
                isEmpty(xyPoint) ? backupXY[idx] : xyPoint,
              ]);
              if (isEmpty(xyPoint))
                // set err
                errArr.push(true);
              else errArr.push(false);
            } else {
              const xyPoint = getBinlinearCase(
                value.DATA,
                TableType,
                HistoryModel,
                eSubType["Bilinear"]
              );
              setxyPoint((preXY) => [
                ...preXY,
                isEmpty(xyPoint) ? backupXY[idx] : xyPoint,
              ]);
              if (isEmpty(xyPoint))
                // set err
                errArr.push(true);
              else errArr.push(false);
            }
          }
          break;
        case 3: // Trilinear
          {
            if (
              HistoryModel === "SLTR" ||
              HistoryModel === "SLTT" ||
              HistoryModel === "SLTC"
            ) {
              const xyPoint = getSlipCase(
                value.DATA,
                TableType,
                HistoryModel,
                eSubType["Trilinear"]
              );
              setxyPoint((preXY) => [
                ...preXY,
                isEmpty(xyPoint) ? backupXY[idx] : xyPoint,
              ]);
              if (isEmpty(xyPoint))
                // set err
                errArr.push(true);
              else errArr.push(false);
            } else {
              const xyPoint = getTrilinearCase(
                value.DATA,
                TableType,
                HistoryModel,
                eSubType["Trilinear"]
              );
              setxyPoint((preXY) => [
                ...preXY,
                isEmpty(xyPoint) ? backupXY[idx] : xyPoint,
              ]);
              if (isEmpty(xyPoint))
                // set err
                errArr.push(true);
              else errArr.push(false);
            }
          }
          break;
        case 4: // Tetralinear
          {
            const xyPoint = getTetralinearCase(
              value.DATA,
              TableType,
              HistoryModel,
              eSubType["Tetralinear"]
            );
            setxyPoint((preXY) => [
              ...preXY,
              isEmpty(xyPoint) ? backupXY[idx] : xyPoint,
            ]);
            if (isEmpty(xyPoint))
              // set err
              errArr.push(true);
            else errArr.push(false);
          }
          break;
        default:
          break;
      }
    });
    return errArr;
  };

  const setMulDataGraph = (): boolean[] => {
    const backupXY = [...xyPoint];
    setxyPoint([]);
    let errArr: boolean[] = [];

    const list = CheckBox.map((checkIdx) => filterList[checkIdx]);
    setyDataList(list);
    list.forEach((value, idx) => {
      const HistoryModel = value.HISTORY_MODEL;
      const xyPoint = getMultiCase(value.DATA, TableType, HistoryModel);
      setxyPoint((preXY) => [
        ...preXY,
        isEmpty(xyPoint) ? backupXY[idx] : xyPoint,
      ]);
      if (isEmpty(xyPoint))
        // set err
        errArr.push(true);
      else errArr.push(false);
    });
    return errArr;
  };
  const dataSets = {
    datasets: xyPoint.map((list, idx) => {
      return {
        type: "line" as const,
        label: `${dataList[idx].NAME}`,
        data: xyPoint[idx],
        borderDash:
          lineStyle[
            lineStyle.length <= Math.floor(idx / LineColor.length)
              ? Math.floor(idx / LineColor.length) % lineStyle.length
              : Math.floor(idx / LineColor.length)
          ],
        borderColor:
          LineColor[LineColor.length <= idx ? idx % LineColor.length : idx], //"#8884d8",
        backgroundColor:
          LineColor[LineColor.length <= idx ? idx % LineColor.length : idx], //label color
        borderWidth: 1,
        pointStyle:
          pointerStyle[
            lineStyle.length <=
            Math.floor(idx / (LineColor.length * lineStyle.length))
              ? Math.floor(idx / (LineColor.length * lineStyle.length)) %
                pointerStyle.length
              : Math.floor(idx / (LineColor.length * lineStyle.length))
          ],
        pointRadius: 3, // 포인트 크기
        pointBackgroundColor: "#FFFFFF", // 포인트 내부 배경색
        pointBorderColor:
          LineColor[LineColor.length <= idx ? idx - LineColor.length : idx], // 포인트 테두리 색
        pointBorderWidth: 1, // 포인트 테두리 두께
        pointHoverRadius: 5, // 호버 시 포인트 크기
        pointHoverBackgroundColor: "#FFFFFF", // 호버 시 포인트 배경색
        pointHoverBorderColor:
          LineColor[LineColor.length <= idx ? idx - LineColor.length : idx], // 호버 시 포인트 테두리 색
        pointHoverBorderWidth: 3, // 포인트 테두리 두께
        fill: false, // 라인 그래프에서 영역 채우기 비활성화
      };
    }),
  };

  const options = {
    responsive: true, // 반응형
    maintainAspectRatio: false, // 크기 비율 유지 비활성
    layouts: {
      padding: {
        top: 30,
        bottom: 30,
        left: 20,
        right: 20,
      },
    },
    plugins: {
      title: {
        display: true,
        text: translate(TableTypeName[TableType]),
        position: "left" as const,
      },
      legend: {
        position: "bottom" as const,
        labels: {
          boxWidth: 20, // 범례 아이콘(색상 박스)의 너비
          boxHeight: 10, // 범례 아이콘의 높이 (Chart.js 3.7+)
          color: "black" as const, // 범례 텍스트 색상
          borderDash: [5, 5],
          font: {
            size: 12, // 폰트 크기
            // family: "Arial" as const, // 폰트 패밀리
            // style: "normal" as const, // 폰트 스타일 ('normal', 'italic', 'oblique')
            // weight: "bold" as const, // 폰트 굵기
          },
          usePointStyle: true,
        },
      },
      tooltip: {
        enabled: true, // 툴팁 활성화 여부
        mode: "nearest" as const, // 툴팁 표시 모드: 'nearest', 'index', 'dataset' 등
        intersect: true, // 데이터 포인트와 교차할 때만 표시
        callbacks: {
          title: function (tooltipItems: any) {
            const toolItem = Array.from(
              new Set(tooltipItems.map((Item: any) => Item.dataset.label))
            );
            return `Name : ${toolItem.join(",  ")} `;
          },
          label: function (tooltipItem: any) {
            // if (tooltipItem.raw) {
            //   return ` X: ${tooltipItem.raw.x},  Y: ${tooltipItem.raw.y}`;
            // }
            return "";
          },
          footer: function (tooltipItems: any) {
            const toolItemX = Array.from(
              new Set(tooltipItems.map((Item: any) => Item.raw.x))
            );
            const toolItemY = Array.from(
              new Set(tooltipItems.map((Item: any) => Item.raw.y))
            );
            return ` X: ${toolItemX},  Y: ${toolItemY}`;
          },
        },
      },
      annotation: {
        annotations: {}, // 초기에는 애너테이션 없음
      },
    },
    scales: {
      x: {
        type: "linear" as const,
        beginAtZero: false,
        min: -scale,
        max: scale,
        ticks: {
          color: "gray", // 눈금 색상 설정
          stepSize: 0.5,
          callbacks: function (value: number) {
            return value.toFixed(10); // 소수점
          },
        },
      },
      y: {
        type: "linear" as const,
        beginAtZero: false,
        min: -scale,
        max: scale,
        ticks: {
          color: "gray",
          stepSize: 0.5,
          callbacks: function (value: number) {
            return value.toFixed(10); // 소수점
          },
        },
      },
    },
  };

  return (
    <Grid style={{ width: "100%", height: "100%" }}>
      <Grid
        container
        style={{
          width: "100%",
          height: "10%",
        }}
      >
        {errmsg !== "" && (
          <Alert
            style={{
              width: "100%",
              height: "100%",
              transition: "opacity 0.5s ease-out",
              opacity: errmsg === "" ? 0 : 1,
            }}
            severity="error"
          >
            {errmsg}
          </Alert>
        )}
      </Grid>
      <Grid ref={chartContainerRef} style={gridStyle}>
        <Chart
          ref={chartRef}
          type="scatter"
          data={dataSets}
          options={options}
        />
      </Grid>
    </Grid>
  );
};

const gridStyle: any = {
  width: "80%",
  height: "80%",
  margin: "0 auto",
  border: "1px solid #ddd",
  boxSizing: "border-box",
};

const LineColor: string[] = [
  "#FF0000",
  // "#FF4000",
  // "#FF8000",
  // "#FFBF00",
  "#FFA500", // Red -> Orange
  // "#FFA500",
  // "#FFD100",
  // "#FFF000",
  // "#FFFF00", // Orange -> Yellow
  // "#FFFF00",
  // "#BFFF00",
  // "#80FF00",
  // "#40FF00",
  "#008000", // Yellow -> Green
  // "#008000",
  // "#0066AA",
  // "#004CFF",
  // "#0028FF",
  "#0000FF", // Green -> Blue
  // "#0000FF",
  // "#1A00E6",
  // "#3300CC",
  // "#4B00B2",
  "#4B0082", // Blue -> Indigo
  // "#4B0082",
  // "#7B048C",
  // "#AD1095",
  // "#DD209F",
  "#EE82EE", // Indigo -> Violet
  // "black",
];

const pointerStyle: string[] = [
  "circle",
  "rect",
  "rectRot",
  "triangle",
  "cross",
  "crossRot",
  "star",
];

const lineStyle: number[][] = [
  [0, 0],
  [5, 5],
  [30, 10],
];

export default GraphChart;
