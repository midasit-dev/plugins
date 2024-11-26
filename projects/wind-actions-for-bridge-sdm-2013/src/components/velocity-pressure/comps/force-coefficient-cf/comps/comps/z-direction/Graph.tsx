import { useEffect, useState } from "react";
import Plot from "react-plotly.js";
import _ from "lodash";

interface PlotWithFixedAnnotationProps {
  basePoints: Plotly.Data[];
  fixedX?: number;
  fixedY?: number;
  width: number;
  height: number;
}

export default function Graph(props: PlotWithFixedAnnotationProps) {
  // 특정 x값과 해당 y값
  const [xy, setXy] = useState<Array<number>>([0.0, 0.75]);
  useEffect(() => {
    const debounce = setTimeout(() => {
      setXy([props?.fixedX ?? 0, props?.fixedY ?? 0.75]);
    }, 100);

    return () => clearTimeout(debounce);
  }, [props?.fixedX, props?.fixedY]);

  return (
    <Plot
      data={[
        ...props.basePoints,

        // 교차점, 점 표시
        {
          name: "point",
          x: [xy[0]], // 특정 x 좌표
          y: [xy[1]], // 특정 y 좌표
          type: "scatter",
          mode: "markers",
          marker: {
            color: "black",
            size: 8,
            symbol: "circle",
          },
          hoverinfo: "none",
        },
      ]}
      layout={{
        hovermode: false,
        dragmode: false, // 드래그 모드 비활성화

        // title: "Titles",
        width: props?.width ?? 300,
        height: props?.height ?? 400,
        shapes: [],
        yaxis: {
          fixedrange: true,
          range: [0, 1.0], // Y축 범위 설정
          tickmode: "array", // 배열 기반의 tick 값 설정
          tickvals: [0, 0.2, 0.4, 0.6, 0.8, 1.0],
          ticktext: ["0", "0.2", "0.4", "0.6", "0.8", "1.0"],
          tickfont: {
            size: 10,
          },
          ticklen: 5,
        },
        xaxis: {
          fixedrange: true,
          range: [0, 22],
          tickmode: "array",
          tickvals: [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22],
          ticktext: [
            "0",
            "2.0",
            "4.0",
            "6.0",
            "8.0",
            "10.0",
            "12.0",
            "14.0",
            "16.0",
            "18.0",
            "20.0",
            "22.0",
          ],
          tickfont: {
            size: 10,
          },
          ticklen: 5,
        },
        margin: {
          l: 30,
          r: 20,
          t: 20,
          b: 50,
        },
        annotations: [
          // Y축 표기
          {
            x: 0.02, // X축에서의 위치 (왼쪽)
            y: 1, // Y축에서의 위치 (중앙)
            text: "Cf,z", // Y축 제목
            showarrow: false, // 화살표 비활성화
            xref: "paper",
            yref: "paper",
            font: {
              size: 10,
              weight: 700,
            },
          },

          // X축 표기
          {
            x: 1, // X축에서의 위치 (왼쪽)
            y: 0.02, // Y축에서의 위치 (중앙)
            text: "b/dtot", // Y축 제목
            showarrow: false, // 화살표 비활성화
            xref: "paper",
            yref: "paper",
            font: {
              size: 10,
              weight: 700,
            },
          },

          // 교차점에 (3, 13) 표기
          {
            x: xy[0],
            y: xy[1],
            xref: "x",
            yref: "y",
            text: `(${xy[0].toFixed(2)}, ${xy[1].toFixed(2)})`,

            ax: xy[0] + 1.8,
            ay: xy[1] + 0.1,
            axref: "x",
            ayref: "y",
            startstandoff: 0,
            standoff: 10,

            font: {
              size: 12,
              color: "black",
              weight: 700,
            },

            showarrow: true,
            arrowhead: 0,
            arrowsize: 0,
            arrowwidth: 0,
            arrowcolor: "white",
          },
        ],
        showlegend: true,
        legend: {
          orientation: "h", // 'h': horizontal, 'v': vertical
          y: -0.2, // y 위치 (아래로 이동)
          x: 0.5, // x 위치 (중앙 정렬)
          xanchor: "center", // x 기준점
          yanchor: "top", // y 기준점
          font: {
            size: 10,
          },
        },
      }}
      config={{
        responsive: true,
        displayModeBar: false,
      }}
    />
  );
}
