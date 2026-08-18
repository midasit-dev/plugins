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
import { chartFontFamily } from "./chartTheme";

// 제목/범례/눈금 등 canvas 안의 모든 텍스트에 적용된다.
ChartJS.defaults.font.family = chartFontFamily;

/** chart.js 전역 등록. GraphChart에서 한 번 import 하면 된다. */
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
