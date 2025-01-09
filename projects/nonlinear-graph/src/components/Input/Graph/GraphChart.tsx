import { memo, useEffect, useState, useCallback, useRef } from "react";
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
import { Grid } from "@midasit-dev/moaui";
import { useRecoilValue } from "recoil";
import {
  filteredTableListState,
  TableChangeState,
  TableTypeState,
  CheckBoxState,
} from "../../../values/RecoilValue";
import { isEmpty } from "lodash";
import { setDatasets } from "react-chartjs-2/dist/utils";
import { useTranslation } from "react-i18next";
import {
  ALL_HistoryType_LNG,
  eSubType,
  getBinlinearCase,
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

  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<any>(null);
  const [yHeight, setYHeight] = useState(0);
  const [xWidth, setXWidth] = useState(0);
  const [xyPoint, setxyPoint] = useState<object[]>([]);
  const [dataList, setyDataList] = useState<any[]>([]);

  useEffect(() => {
    console.log("xyPoint", xyPoint);
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
          callbacks: function (value: any) {
            console.log("annotaion function ", value);
          },
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
      setTimeout(() => {
        chartRef.current.options.plugins.annotation.annotations = annotation;
        chartRef.current.update();
      }, 500);
    }
  }, [xyPoint]);

  useEffect(() => {
    if (filterList === undefined) return;
    console.log(filterList);
    initChart();
  }, [filterList]);

  const initChart = () => {
    setxyPoint([]);
    initDataList();
  };

  const initDataList = () => {
    switch (TableType) {
      case 1:
        setDataGraph();
        break;
      case 2:
        setDataGraph();
        break;
      case 3:
        break;
    }
  };

  const setDataGraph = () => {
    const list = CheckBox.map((checkIdx) => filterList[checkIdx]);
    setyDataList(list);
    list.forEach((value) => {
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
              setxyPoint((preXY) => [...preXY, xyPoint]);
            } else {
              const xyPoint = getBinlinearCase(
                value.DATA,
                TableType,
                HistoryModel,
                eSubType["Bilinear"]
              );
              setxyPoint((preXY) => [...preXY, xyPoint]);
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
              setxyPoint((preXY) => [...preXY, xyPoint]);
            } else {
              const xyPoint = getTrilinearCase(
                value.DATA,
                TableType,
                HistoryModel,
                eSubType["Trilinear"]
              );
              setxyPoint((preXY) => [...preXY, xyPoint]);
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
            setxyPoint((preXY) => [...preXY, xyPoint]);
          }
          break;
        default:
          break;
      }
    });
  };

  const dataSets = {
    datasets: xyPoint.map((list, idx) => {
      return {
        type: "line" as const,
        label: `${dataList[idx].NAME} - ${translate(
          ALL_HistoryType_LNG[dataList[idx].HISTORY_MODEL]
        )}`,
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
            return `point : ${tooltipItems.map((Item: any) => Item.dataIndex)}`;
            const toolItem = Array.from(
              new Set(tooltipItems.map((Item: any) => Item.dataset.label))
            );
            return `Name : ${toolItem}`;
          },
          label: function (tooltipItem: any) {
            if (tooltipItem.raw) {
              return ` X: ${tooltipItem.raw.x},  Y: ${tooltipItem.raw.y}`;
            }
            return "";
          },
          // footer: function () {
          //   return "Custom Footer"; // 툴팁 하단 커스텀 메시지
          // },
        },
      },
      annotation: {
        annotations: {}, // 초기에는 애너테이션 없음
      },
    },
    scales: {
      x: {
        beginAtZero: false,
        min: -3,
        max: 3,
        ticks: {
          color: "gray", // 눈금 색상 설정
          stepSize: 0.5,
          callbacks: function (value: number) {
            return value.toFixed(10); // 소수점
          },
        },
      },
      y: {
        beginAtZero: false,
        min: -3,
        max: 3,
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
    <div ref={chartContainerRef} style={gridStyle}>
      <Chart ref={chartRef} type="scatter" data={dataSets} options={options} />
    </div>
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
