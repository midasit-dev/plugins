import React from "react";

interface IconProps {
  width?: number;
  height?: number;
}

const CustomIcon: React.FC<IconProps> = ({ width = 28, height = 28 }) => (
  <svg width={width} height={height} viewBox="0 0 28 28" fill="none">
    <path
      d="M9.43807 18.4815C9.80055 18.1708 10.2622 18 10.7397 18H23.6482C24.1124 18 24.326 18.5775 23.9736 18.8796L18.5615 23.5185C18.1991 23.8292 17.7374 24 17.26 24H4.3516C3.8874 24 3.67376 23.4225 4.0262 23.1204L9.43807 18.4815Z"
      stroke="#F4F7FB"
      strokeWidth="1.2"
      strokeLinecap="round"
    />
    <path
      d="M9.43807 4.4815C9.80055 4.17079 10.2622 4 10.7397 4H23.6482C24.1124 4 24.326 4.57753 23.9736 4.87963L18.5615 9.51851C18.1991 9.82922 17.7374 10 17.26 10H4.3516C3.8874 10 3.67376 9.42248 4.0262 9.12038L9.43807 4.4815Z"
      stroke="#98BBEF"
      strokeWidth="1.2"
      strokeLinecap="round"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M9.2002 18V11.2H10.4002V17.4H23.5508V6.82282L24.7508 5.79425V18V18.6H24.1508H9.8002H9.2002V18Z"
      fill="#F4F7FB"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M3.2002 10.7572V23C3.2002 23.8836 3.91654 24.6 4.80019 24.6H17.9008C18.3702 24.6 18.7508 24.2194 18.7508 23.75V10.8317C18.3793 11.0272 17.9716 11.1484 17.5508 11.1868V23.4H4.80019C4.57928 23.4 4.4002 23.2209 4.4002 23V11.2H4.35199C3.88373 11.2 3.49046 11.0271 3.2002 10.7572Z"
      fill="#F4F7FB"
    />
  </svg>
);

export default CustomIcon;
