// App.tsx
import React, { useRef, useEffect, useMemo, useState } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, OrthographicCamera } from "@react-three/drei";
import { Paper } from "@mui/material";
import { usePileViewer } from "../../hooks";
import {
  TopViewIcon,
  FrontViewIcon,
  SideViewIcon,
  ISOViewIcon,
} from "../../SVGs";
import * as THREE from "three";
import CustomToggleButton from "../../components/CustomToggleButton";

/*
 * Canvas 사이즈를 상수로 미리 기록해두어, 카메라 위치 계산에 참조하여 사용
 */
const CANVAS_WIDTH = 420;
const CANVAS_HEIGHT = 244;

/*
 * 동적으로 자식 객체들의 바운딩 박스를 계산하여 카메라와 OrbitControls의 위치 및
 * 투영을 자동으로 조정하는 컴포넌트
 * - 각 카메라 뷰(대각선, 측면, 상단, 전면)에 따라 frustumSize(투영 평면 크기)를
 *   다르게 계산하여,객체가 항상 적당한 크기로 보이도록 조정
 * - 바운딩 박스의 중심을 기준으로 카메라 위치와 lookAt, OrbitControls의 target을
 *   동기화
 * - 카메라 변경 시마다 카메라의 up 벡터, 위치, 투영 행렬을 갱신
 */
function DynamicBoundingBox({
  children,
  currentCamera,
  controlsRef,
}: {
  children: React.ReactNode;
  currentCamera: string;
  controlsRef: React.RefObject<any>;
}) {
  const { camera } = useThree();
  const groupRef = useRef<THREE.Group>(null);

  // 바운딩 박스 계산: 자식 객체 전체를 감싸는 3D 박스를 계산
  const boundingBox = useMemo(() => {
    if (!groupRef.current) return null;

    const box = new THREE.Box3();
    box.setFromObject(groupRef.current);

    const size = box.getSize(new THREE.Vector3()); // 바운딩 박스의 크기
    const center = box.getCenter(new THREE.Vector3()); // 바운딩 박스의 중심
    const min = box.min;
    const max = box.max;

    // 각 카메라 뷰에 따라 2D 평면상에서 frustumSize(투영 평면 크기)를 다르게 계산
    let frustumSize = 1;
    const margin = 1.2; // 여유 마진 (사용자 따라 조정)
    switch (currentCamera) {
      case "top": // 평면뷰(y축에서 바라봄) → x, z 평면
        frustumSize = Math.max(size.x, size.z) * margin;
        break;
      case "front": // 전면뷰(x축에서 바라봄) → y, z 평면
        frustumSize = Math.max(size.y, size.z) * margin;
        break;
      case "side": // 측면뷰(z축에서 바라봄) → x, y 평면
        frustumSize = Math.max(size.x, size.y) * margin;
        break;
      default: // ISO 뷰
        frustumSize = Math.max(size.x, size.y, size.z) * margin;
        break;
    }

    // 디버깅용 콘솔 출력
    console.log("Dynamic bounding box:", {
      min: min.toArray(),
      max: max.toArray(),
      size: size.toArray(),
      center: center.toArray(),
      frustumSize,
      currentCamera,
    });

    return { size, center, frustumSize, min, max };
  }, [currentCamera]);

  // 바운딩 박스 재계산을 위한 상태
  const [boundingBoxUpdateTrigger, setBoundingBoxUpdateTrigger] = useState(0);

  // 자식 객체가 변경될 때마다 바운딩 박스 재계산 트리거
  React.useEffect(() => {
    setBoundingBoxUpdateTrigger((prev) => prev + 1);
  }, [children]);

  // 바운딩 박스 재계산
  const recalculatedBoundingBox = useMemo(() => {
    if (!groupRef.current) return null;

    const box = new THREE.Box3();
    box.setFromObject(groupRef.current);

    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const min = box.min;
    const max = box.max;

    let frustumSize = 1.0;
    const margin = 1.2;
    switch (currentCamera) {
      case "top":
        frustumSize = Math.max(size.x, size.z) * margin;
        break;
      case "front":
        frustumSize = Math.max(size.y, size.z) * margin;
        break;
      case "side":
        frustumSize = Math.max(size.x, size.y) * margin;
        break;
      default:
        frustumSize = Math.max(size.x, size.y, size.z) * margin;
    }

    console.log("Recalculated bounding box:", {
      min: min.toArray(),
      max: max.toArray(),
      size: size.toArray(),
      center: center.toArray(),
      frustumSize,
      currentCamera,
      trigger: boundingBoxUpdateTrigger,
    });

    return { size, center, frustumSize, min, max };
  }, [currentCamera, boundingBoxUpdateTrigger]);

  // 최종 바운딩 박스 결정 (재계산된 것이 있으면 사용, 없으면 기본 계산 사용)
  const finalBoundingBox = recalculatedBoundingBox || boundingBox;

  // 카메라 및 OrbitControls의 위치/투영/target을 바운딩 박스에 맞게 동기화
  useEffect(() => {
    if (finalBoundingBox) {
      const { frustumSize, center } = finalBoundingBox;
      const aspect = CANVAS_WIDTH / CANVAS_HEIGHT; // 화면 비율

      // OrthographicCamera의 투영 평면(left, right, top, bottom) 동적 설정
      (camera as any).left = (-frustumSize * aspect) / 2;
      (camera as any).right = (frustumSize * aspect) / 2;
      (camera as any).top = frustumSize / 2;
      (camera as any).bottom = -frustumSize / 2;
      (camera as any).near = 0.1;
      (camera as any).far = 1000;

      // 각 카메라 뷰에 따라 카메라 위치 및 up 벡터 설정
      const distance = frustumSize * 1.0; // 적당한 거리 (사용자 따라 조정)

      switch (currentCamera) {
        case "iso":
          // 대각선 뷰
          camera.position.set(
            center.x - distance,
            center.y + distance,
            center.z - distance
          );
          camera.up.set(0, 1, 0);
          break;
        case "top":
          // 상단 뷰 (Y축에서 바라봄), up 벡터를 x축으로 설정
          camera.position.set(center.x, center.y + distance, center.z);
          camera.up.set(1, 0, 0);
          break;
        case "front":
          // 전면 뷰 (X축에서 바라봄)
          camera.position.set(center.x - distance, center.y, center.z);
          camera.up.set(0, 1, 0);
          break;
        case "side":
          // 측면 뷰 (Z축에서 바라봄)
          camera.position.set(center.x, center.y, center.z + distance);
          camera.up.set(0, 1, 0);
          break;
      }
      // 카메라가 항상 바운딩 박스 중심을 바라보도록 설정
      camera.lookAt(center);

      // OrbitControls의 target도 바운딩 박스 중심으로 동기화
      if (controlsRef.current) {
        controlsRef.current.target.copy(center);
        controlsRef.current.update();
      }

      // 투영 행렬 갱신
      camera.updateProjectionMatrix();
    }
  }, [finalBoundingBox, camera, currentCamera, controlsRef]);

  // groupRef로 자식 객체 전체를 감싸서 바운딩 박스 계산에 활용
  return <group ref={groupRef}>{children}</group>;
}

/*
 * 3D 씬을 구성하는 컴포넌트
 * - 카메라 뷰 변경 시 자동으로 카메라 위치/투영/target을 바운딩 박스에 맞게 동기화
 * - 카메라 뷰 변경 시 OrbitControls 상태 초기화
 * - 카메라 뷰 변경 시 카메라 위치/투영/target을 바운딩 박스에 맞게 동기화
 * - 카메라 뷰 변경 시 OrbitControls 상태 초기화
 */

function Scene({
  currentCamera,
  cameraChangeTrigger,
}: {
  currentCamera: string;
  cameraChangeTrigger: number;
}) {
  const controlsRef = useRef<any>(null);

  // 카메라 변경 시 OrbitControls 상태 초기화
  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.reset();
    }
  }, [cameraChangeTrigger]);

  // usePileViewer 훅 사용
  const { baseTopLevel, renderObjects, renderPlaneDim } = usePileViewer();

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />

      {/* 기본 카메라 하나만 사용 */}
      <OrthographicCamera makeDefault zoom={1} near={0.1} far={1000} />

      <DynamicBoundingBox
        currentCamera={currentCamera}
        controlsRef={controlsRef}
      >
        {renderObjects}
        {currentCamera === "top" && renderPlaneDim}
      </DynamicBoundingBox>

      <OrbitControls
        ref={controlsRef}
        enableRotate={currentCamera === "iso"}
        enablePan={true}
        enableZoom={true}
        enableDamping={true}
        dampingFactor={0.05}
      />
      <axesHelper args={[5]} position={[0, baseTopLevel + 0.002, 0]} />
    </>
  );
}

// 컴포넌트
// 상단의 설정 함수는 따로 구성이 어려워 코드가 길어지더라도, 여기서 구성
const PileViewer: React.FC = () => {
  const [currentCamera, setCurrentCamera] = useState("iso");
  const [cameraChangeTrigger, setCameraChangeTrigger] = useState(0);

  // 카메라 변경 및 OrbitControls 초기화 함수 (onChange에서만 실행)
  const handleCameraChange = (_: any, value: string) => {
    if (value) {
      setCurrentCamera(value);
      setCameraChangeTrigger((v) => v + 1);
    }
  };

  return (
    <>
      <Paper
        elevation={2}
        sx={{
          width: CANVAS_WIDTH,
          height: CANVAS_HEIGHT,
          position: "relative",
        }}
      >
        <CustomToggleButton
          buttons={[
            { value: "iso", icon: <ISOViewIcon width={18} height={18} /> },
            { value: "top", icon: <TopViewIcon width={18} height={18} /> },
            { value: "front", icon: <FrontViewIcon width={18} height={18} /> },
            { value: "side", icon: <SideViewIcon width={18} height={18} /> },
          ]}
          value={currentCamera}
          onChange={handleCameraChange}
          sx={{ mb: 2, position: "absolute", top: 2, right: 2, zIndex: 1000 }}
        />
        <Canvas style={{ width: "100%", height: "100%" }}>
          <Scene
            currentCamera={currentCamera}
            cameraChangeTrigger={cameraChangeTrigger}
          />
        </Canvas>
      </Paper>
    </>
  );
};

export default PileViewer;
