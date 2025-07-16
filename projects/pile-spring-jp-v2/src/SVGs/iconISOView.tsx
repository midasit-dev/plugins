import React from "react";

interface IconProps {
  width?: number;
  height?: number;
}

const ISOViewIcon: React.FC<IconProps> = ({ width = 28, height = 28 }) => (
  <svg width={width} height={height} viewBox="0 0 28 28" fill="none">
    <path
      d="M9.43807 4.4815C9.80055 4.17079 10.2622 4 10.7397 4H23.6482C24.1124 4 24.326 4.57753 23.9736 4.87963L18.5615 9.51851C18.1991 9.82922 17.7374 10 17.26 10H4.3516C3.8874 10 3.67376 9.42248 4.0262 9.12038L9.43807 4.4815Z"
      stroke="#F4F7FB"
      strokeWidth="1.2"
      strokeLinecap="round"
    />
    <path
      d="M9.43807 18.4815C9.80055 18.1708 10.2622 18 10.7397 18H23.6482C24.1124 18 24.326 18.5775 23.9736 18.8796L18.5615 23.5185C18.1991 23.8292 17.7374 24 17.26 24H4.3516C3.8874 24 3.67376 23.4225 4.0262 23.1204L9.43807 18.4815Z"
      stroke="#F4F7FB"
      strokeWidth="1.2"
      strokeLinecap="round"
    />
    <path
      d="M3.7998 10H18.1504V23.75C18.1504 23.8881 18.0385 24 17.9004 24H4.7998C4.24752 24 3.7998 23.5523 3.7998 23V10Z"
      stroke="#F4F7FB"
      strokeWidth="1.2"
      strokeLinecap="round"
    />
    <path
      d="M9.7998 5C9.7998 4.44772 10.2475 4 10.7998 4H23.1504C23.7027 4 24.1504 4.44772 24.1504 5V18H9.7998V5Z"
      stroke="#F4F7FB"
      strokeWidth="1.2"
      strokeLinecap="round"
    />
  </svg>
);

export default ISOViewIcon;
