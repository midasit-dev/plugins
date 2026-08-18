import { AxisScale } from "./chartScale";
import { LineColor, lineStyle, pointerStyle } from "./chartTheme";

/** 원점 보조선. 모든 곡선이 원점을 지날 때만 차트에 얹는다. */
export const ZERO_AXIS_ANNOTATION = {
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

/** 곡선 순번에 따라 색 -> 선모양 -> 포인트모양 순으로 돌려쓴다. */
const styleOf = (idx: number) => {
  const colorStep = Math.floor(idx / LineColor.length);
  const shapeStep = Math.floor(idx / (LineColor.length * lineStyle.length));

  return {
    color: LineColor[LineColor.length <= idx ? idx % LineColor.length : idx],
    // 포인트 테두리는 선과 같은 색을 쓴다
    pointColor:
      LineColor[LineColor.length <= idx ? idx % LineColor.length : idx],
    dash: lineStyle[
      lineStyle.length <= colorStep ? colorStep % lineStyle.length : colorStep
    ],
    point:
      pointerStyle[
        pointerStyle.length <= shapeStep
          ? shapeStep % pointerStyle.length
          : shapeStep
      ],
  };
};

export function buildDatasets(xyPoint: any[], dataList: any[]) {
  return {
    datasets: xyPoint.map((list, idx) => {
      const style = styleOf(idx);
      return {
        type: "line" as const,
        label: `${dataList[idx].NAME}`,
        data: xyPoint[idx],
        borderDash: style.dash,
        borderColor: style.color,
        backgroundColor: style.color, // label color
        borderWidth: 1,
        pointStyle: style.point,
        pointRadius: 3, // 포인트 크기
        pointBackgroundColor: "#FFFFFF", // 포인트 내부 배경색
        pointBorderColor: style.pointColor, // 포인트 테두리 색
        pointBorderWidth: 1, // 포인트 테두리 두께
        pointHoverRadius: 5, // 호버 시 포인트 크기
        pointHoverBackgroundColor: "#FFFFFF", // 호버 시 포인트 배경색
        pointHoverBorderColor: style.pointColor, // 호버 시 포인트 테두리 색
        pointHoverBorderWidth: 3, // 포인트 테두리 두께
        fill: false, // 라인 그래프에서 영역 채우기 비활성화
      };
    }),
  };
}

export function buildOptions(title: string, scale: AxisScale) {
  const { scaleX, stepX, scaleY, stepY } = scale;

  return {
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
        text: title,
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
        min: -scaleX,
        max: scaleX,
        ticks: {
          color: "gray", // 눈금 색상 설정
          stepSize: stepX,
          callbacks: function (value: number) {
            return value.toFixed(6); // 소수점
          },
        },
      },
      y: {
        type: "linear" as const,
        beginAtZero: false,
        min: -scaleY,
        max: scaleY,
        ticks: {
          color: "gray",
          stepSize: stepY,
          callbacks: function (value: number) {
            return value.toFixed(6); // 소수점
          },
        },
      },
    },
  };
}
