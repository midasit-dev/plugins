import React from "react";

interface IconProps {
  width?: number;
  height?: number;
}

const CustomIcon: React.FC<IconProps> = ({ width = 28, height = 28 }) => (
  <svg width={width} height={height} viewBox="0 0 28 28" fill="none">
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M19.222 23.7428L24.3642 19.3352C25.1396 18.6706 24.6696 17.4 23.6484 17.4H19.3506V18.6H23.378L19.3506 22.0521V23C19.3506 23.2607 19.3053 23.5108 19.222 23.7428ZM16.9506 18.6H10.7399C10.4057 18.6 10.0825 18.7196 9.82874 18.9371L5.3221 22.8H5V21.4956L9.04778 18.026C9.51902 17.6221 10.1192 17.4 10.7399 17.4H16.9506V18.6Z"
      fill="#F4F7FB"
    />
    <path
      d="M9.7998 5C9.7998 4.44772 10.2475 4 10.7998 4H23.1504C23.7027 4 24.1504 4.44772 24.1504 5V18H9.7998V5Z"
      stroke="#F4F7FB"
      strokeWidth="1.2"
      strokeLinecap="round"
    />
    <path
      d="M3.7998 11C3.7998 10.4477 4.24752 10 4.7998 10H17.1504C17.7027 10 18.1504 10.4477 18.1504 11V23C18.1504 23.5523 17.7027 24 17.1504 24H4.7998C4.24752 24 3.7998 23.5523 3.7998 23V11Z"
      stroke="#98BBEF"
      strokeWidth="1.2"
      strokeLinecap="round"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M10.74 3.40002C10.1193 3.40002 9.51915 3.62205 9.04791 4.02598L3.63605 8.66485C3.3848 8.88021 3.26432 9.15918 3.25098 9.43794C3.64858 9.04361 4.19591 8.80002 4.80013 8.80002H5.32223L9.82887 4.93708C10.0826 4.71958 10.4058 4.60002 10.74 4.60002H23.3782L18.1803 9.05533C18.5422 9.2473 18.844 9.5373 19.0505 9.88993L24.3644 5.33521C25.1398 4.67059 24.6698 3.40002 23.6485 3.40002H10.74Z"
      fill="#F4F7FB"
    />
  </svg>
);

export default CustomIcon;
