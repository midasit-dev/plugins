import React, { useRef, useEffect, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Box as DreiBox, Circle, Text, Html } from "@react-three/drei";
import { useRecoilValue } from "recoil";
import {
  pileDataListState,
  pileBasicDimState,
  PileDataItem,
  selectedPileDataIdState,
} from "../states";
import * as THREE from "three";
import {
  calBaseTopLevel,
  PileBasic,
  calcPileBasic,
  calcPileData,
  createCanvasText,
  createDimText,
  CanvasTextState,
} from "../utils";
import { ArrowHelper, Vector3 } from "three";

// 플랜 렌더링 컴포넌트
export interface PlaneMeshState {
  planegeometry: number[];
  position: number[];
  rotation: number[];
  color: string;
  opacity: number;
}

const PlaneMesh = ({ planeMesh }: { planeMesh: PlaneMeshState }) => {
  return (
    <mesh
      rotation={
        new THREE.Euler(
          planeMesh.rotation[0],
          planeMesh.rotation[1],
          planeMesh.rotation[2]
        )
      }
      position={
        new THREE.Vector3(
          planeMesh.position[0],
          planeMesh.position[1],
          planeMesh.position[2]
        )
      }
    >
      <planeGeometry
        args={[planeMesh.planegeometry[0], planeMesh.planegeometry[1]]}
      />
      <meshStandardMaterial
        color={planeMesh.color}
        transparent
        opacity={planeMesh.opacity}
        depthWrite={false}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
};

// 구체 랜더링 컴포넌트
export interface SphereState {
  position: number[];
  radius: number;
  color: string;
  opacity: number;
}

const Sphere = ({ sphere }: { sphere: SphereState }) => {
  return (
    <mesh
      position={
        new THREE.Vector3(
          sphere.position[0],
          sphere.position[1],
          sphere.position[2]
        )
      }
    >
      <sphereGeometry args={[sphere.radius, 32, 32]} />
      <meshStandardMaterial
        color={sphere.color}
        opacity={sphere.opacity}
        transparent
        depthWrite={false}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
};

// 원뿔 랜더링 컴포넌트
export interface ConeState {
  position: number[]; // 원뿔의 위치
  rotation: number[]; // 원뿔의 회전
  radius: number; // 원뿔의 반지름 (기본 원의 반지름)
  height: number; // 원뿔의 높이
  color: string; // 원뿔의 색상
  opacity: number; // 원뿔의 투명도
}

const Cone = ({ cone }: { cone: ConeState[] }) => {
  if (!cone || cone.length === 0) return null;

  return (
    <group>
      {cone.map((cone, index) => (
        <mesh
          key={`cone-${index}`}
          position={
            new THREE.Vector3(
              cone.position[0],
              cone.position[1],
              cone.position[2]
            )
          }
          rotation={
            new THREE.Euler(
              cone.rotation[0],
              cone.rotation[1],
              cone.rotation[2]
            )
          }
        >
          <coneGeometry args={[cone.radius, cone.height, 32]} />
          <meshStandardMaterial
            color={cone.color}
            opacity={cone.opacity}
            transparent
            depthWrite={false}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
  );
};

// 원통 랜더링 컴포넌트
export interface CylinderState {
  position: number[];
  rotation: number[];
  radius: number;
  height: number;
  color: string;
  opacity: number;
}

// 말뚝 렌더링 컴포넌트
const CylinderForPiles = ({
  pileGroup,
  selectedGroupId,
}: {
  pileGroup: any[];
  selectedGroupId: number | null;
}) => {
  if (!pileGroup || pileGroup.length === 0) return null;

  return (
    <group>
      {pileGroup.map((pileGroup: any, groupIndex: number) => {
        const isSelected = selectedGroupId === pileGroup.group_key;

        return (
          <group key={`pile-group-${pileGroup.group_key}`}>
            {pileGroup.pile_data.map((pile: any, pileIndex: number) => (
              <group key={`pile-${pileGroup.group_key}-${pileIndex}`}>
                {/* 기본 말뚝 */}
                <mesh
                  position={[
                    pile.position[0],
                    pile.position[1],
                    pile.position[2],
                  ]}
                  rotation={[
                    pile.rotation[0],
                    pile.rotation[1],
                    pile.rotation[2],
                  ]}
                >
                  <cylinderGeometry
                    args={[pile.radius, pile.radius, pile.height, 32]}
                  />
                  <meshStandardMaterial
                    color={pile.color}
                    opacity={pile.opacity}
                    transparent
                  />
                </mesh>

                {/* 선택된 그룹의 외곽선 */}
                {isSelected && (
                  <mesh
                    position={[
                      pile.position[0],
                      pile.position[1],
                      pile.position[2],
                    ]}
                    rotation={[
                      pile.rotation[0],
                      pile.rotation[1],
                      pile.rotation[2],
                    ]}
                  >
                    <cylinderGeometry
                      args={[
                        pile.radius + 0.02,
                        pile.radius + 0.02,
                        pile.height,
                        32,
                      ]}
                    />
                    <meshStandardMaterial
                      color="#FF0000"
                      opacity={0.3}
                      transparent
                      side={THREE.DoubleSide}
                      depthWrite={false}
                    />
                  </mesh>
                )}
              </group>
            ))}
          </group>
        );
      })}
    </group>
  );
};

const Cylinder = ({ cylinder }: { cylinder: CylinderState[] }) => {
  if (!cylinder || cylinder.length === 0) return null;

  return (
    <group>
      {cylinder.map((cylinder, index) => (
        <mesh
          key={`cylinder-${index}`}
          position={[
            cylinder.position[0],
            cylinder.position[1],
            cylinder.position[2],
          ]}
          rotation={[
            cylinder.rotation[0],
            cylinder.rotation[1],
            cylinder.rotation[2],
          ]}
        >
          <cylinderGeometry
            args={[cylinder.radius, cylinder.radius, cylinder.height, 32]}
          />
          <meshStandardMaterial
            color={cylinder.color}
            opacity={cylinder.opacity}
            transparent
          />
        </mesh>
      ))}
    </group>
  );
};

// 3D 텍스트 컴포넌트 (drei Text 사용)
const Text3D = ({ textGroup }: { textGroup: CanvasTextState[] }) => {
  if (!textGroup || textGroup.length === 0) return null;

  return (
    <group>
      {textGroup.map((text, index) => {
        // 텍스트 데이터 유효성 검사
        if (!text || !text.text || !text.position) {
          return null;
        }

        return (
          <Text
            key={`text-${index}-${text.text}-${text.position.join(",")}`}
            position={text.position}
            rotation={text.rotation}
            fontSize={text.fontSize}
            color={text.color}
            anchorX="center"
            anchorY="middle"
          >
            {text.text}
          </Text>
        );
      })}
    </group>
  );
};

// 렌더링 훅
export const usePileViewer = () => {
  const pileDataList = useRecoilValue(pileDataListState);
  const pileBasicDim = useRecoilValue(pileBasicDimState);
  const selectedGroupId = useRecoilValue(selectedPileDataIdState);

  const baseTopLevel = calBaseTopLevel(pileDataList);
  const { foundation, forcePoint } = calcPileBasic(pileDataList, pileBasicDim);

  const pileGroup = calcPileData(pileDataList, pileBasicDim);

  // 텍스트 데이터를 useMemo로 메모이제이션
  const canvasText = useMemo(() => {
    return createCanvasText(pileBasicDim, baseTopLevel);
  }, [pileBasicDim, baseTopLevel]);

  const { coneObject, cylinderObject } = useMemo(() => {
    return createDimText(pileBasicDim, baseTopLevel);
  }, [pileBasicDim, baseTopLevel]);

  const renderFoundations = useMemo(() => {
    return (
      <>
        <PlaneMesh planeMesh={foundation} />
        <Sphere sphere={forcePoint} />
        <CylinderForPiles
          pileGroup={pileGroup}
          selectedGroupId={selectedGroupId}
        />
      </>
    );
  }, [foundation, forcePoint, pileGroup, selectedGroupId]);

  const renderPlaneDim = useMemo(() => {
    return (
      <>
        {" "}
        <Text3D textGroup={canvasText} />
        <Cone cone={coneObject} />
        <Cylinder cylinder={cylinderObject} />
      </>
    );
  }, [canvasText, coneObject, cylinderObject]);

  return {
    baseTopLevel,
    renderObjects: renderFoundations,
    renderPlaneDim,
  };
};
