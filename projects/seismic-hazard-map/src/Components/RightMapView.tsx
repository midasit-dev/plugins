import React, { useState, useRef } from "react";
import image from "./map_1.png";
import marker from "./marker.png";
import {
  Map,
  useMap,
  MapMarker,
  Polyline,
  CustomOverlayMap,
} from "react-kakao-maps-sdk";
import {
  VarLatitude,
  VarLongitude,
  VarResultText,
  VarCalculated,
  VarPeriod,
} from "./variables";
import { useRecoilValue, useRecoilState } from "recoil";
import { Typography, Icon, Panel, GuideBox } from "@midasit-dev/moaui";
import useKakaoLoader from "./useKakaoLoader";

import { Accel_4800 } from "./Accel_4800";
import { Accel_2400 } from "./Accel_2400";
import { Accel_1000 } from "./Accel_1000";
import { Accel_500 } from "./Accel_500";
import { Accel_200 } from "./Accel_200";
import { Accel_100 } from "./Accel_100";
import { Accel_50 } from "./Accel_50";

import { motion } from 'framer-motion';

const CompMapView = () => {
  useKakaoLoader();

  const [lat_val, setLat] = useRecoilState(VarLatitude);
  const [lng_val, setLng] = useRecoilState(VarLongitude);
  const result_text = useRecoilValue(VarResultText);
  const [calculated, setCalculated] = useRecoilState(VarCalculated);
  const period = useRecoilValue(VarPeriod);

  const map_center = { lat: 37.5, lng: 127.0 };
  const map_level = 14;

  const mapRef = React.useRef<kakao.maps.Map>(null);
  const resetMap = () => {
    const map = mapRef.current;
    if (!map) return;

    map.setLevel(map_level);
    map.setCenter(new kakao.maps.LatLng(map_center.lat, map_center.lng));
    setCalculated(false);
  };

  let dataset = Accel_2400;
  if (period === 7) {
    dataset = Accel_50;
  } else if (period === 6) {
    dataset = Accel_100;
  } else if (period === 5) {
    dataset = Accel_200;
  } else if (period === 4) {
    dataset = Accel_500;
  } else if (period === 3) {
    dataset = Accel_1000;
  } else if (period === 2) {
    dataset = Accel_2400;
  } else if (period === 1) {
    dataset = Accel_4800;
  }

  const latv = parseFloat(lat_val);
  const lngv = parseFloat(lng_val);

  return (
    <React.Fragment>
      <Map // 지도를 표시할 Container
        id="mapContainer"
        center={{
          lat: calculated ? latv : map_center.lat,
          lng: calculated ? lngv : map_center.lng,
        }}
        style={{
          // 지도의 크기
          width: "100%",
          height: "100%",
          borderRadius: "5px",
        }}
        level={calculated ? 11 : map_level} // 지도의 확대 레벨
        ref={mapRef}
      >
        {dataset.map((item, index) => (
          <React.Fragment key={index}>
            <Polyline
              path={item.lnglat.slice(1, item.lnglat.length - 1)} // 선을 구성하는 좌표 배열입니다
              strokeWeight={2} // 선의 두께 입니다
              strokeColor={"#000"} // 선의 색깔입니다
              strokeOpacity={0.5} // 선의 불투명도 입니다 1에서 0 사이의 값이며 0에 가까울수록 투명합니다
              strokeStyle={"solid"} // 선의 스타일입니다
            />

            <CustomOverlayMap // 커스텀 오버레이를 표시할 Container
              // 커스텀 오버레이가 표시될 위치입니다
              position={item.lnglat[0]}
            >
              <Typography
                width="50px"
                variant="h1"
                color="#0000ff"
                size="small"
                horCenter={true}
              >
                {String(item.value)}
              </Typography>
            </CustomOverlayMap>
            <CustomOverlayMap // 커스텀 오버레이를 표시할 Container
              // 커스텀 오버레이가 표시될 위치입니다
              position={item.lnglat[item.lnglat.length - 1]}
            >
              <Typography
                width="30px"
                variant="h1"
                color="#0000ff"
                size="small"
                horCenter={true}
              >
                {String(item.value)}
              </Typography>
            </CustomOverlayMap>
          </React.Fragment>
        ))}

        {result_text !== "" && (
          <MapMarker // 마커를 생성합니다
            opacity={1}
            position={{
              lat: latv,
              lng: lngv,
            }}
          >
						<GuideBox
							width={150}
							height={30}
							center
						>
							<Typography
								variant="h1"
								color="#ff0000"
								size="small"
							>
								{result_text}
							</Typography>
						</GuideBox>
          </MapMarker>
        )}
      </Map>

      <motion.div
        style={{
          position: "absolute",
          bottom: 24,
          right: 24,
          zIndex: 1,
          opacity: 0.7,
          cursor: "pointer",
          backgroundColor: "var(--color-bg, #ffffff)",
          display: "flex",
          boxShadow:
            "var(--elevation-200-canvas, 0px 0px .5px rgba(0, 0, 0, .18), 0px 3px 8px rgba(0, 0, 0, .1), 0px 1px 3px rgba(0, 0, 0, .1))",
					padding: 10,
					borderRadius: 5,
				}}
        whileHover={{ opacity: 1, scale: 1.2, rotate: 360 }}
				whileTap={{ scale: 0.9 }}
        onClick={resetMap}
      >
        <Icon iconName="Refresh" />
      </motion.div>
    </React.Fragment>
  );
};

export default CompMapView;
