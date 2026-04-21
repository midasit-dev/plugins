/**
 * @fileoverview 3D 뷰어의 평면도 / 정면도 / 측면도 화면을 오프스크린 Three.js 렌더러로
 * 그려 base64 PNG로 추출합니다. 엑셀 계산서의 1.2절 말뚝 배치 이미지에 사용됩니다.
 *
 * - 화면에 부착된 `<canvas>`에 의존하지 않도록 독립된 offscreen 렌더러를 사용합니다.
 * - 3D 뷰어(usePileViewer)와 동일한 데이터 빌더(calcPileBasic / calcPileData /
 *   createCanvasText / createDimText)를 재사용하여 시각적 일관성을 유지합니다.
 */

import * as THREE from "three";

import {
  calBaseTopLevel,
  calcPileBasic,
  calcPileData,
  createCanvasText,
  createDimText,
} from "./pileViewerCalculator";
import {
  CanvasTextState,
  PileCylinderData,
} from "../../types/typePileViewer";
import { PileBasicDim, PileDataItem } from "../../types/typePileDomain";

export type CaptureView = "top" | "front" | "side";

export interface CaptureOptions {
  width?: number;
  height?: number;
  background?: string;
}

const DEFAULT_WIDTH = 500;
const DEFAULT_HEIGHT = 360;

// 2D Canvas 기반 텍스트 스프라이트 생성 (offscreen에서도 값싸게 안티앨리어싱된 텍스트 표시 가능)
const createTextSprite = (text: string, size: number): THREE.Sprite | null => {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  const padding = 8;
  ctx.font = "20px Arial";
  const metrics = ctx.measureText(text);
  const textWidth = Math.ceil(metrics.width);
  const textHeight = 24;

  canvas.width = textWidth + padding * 2;
  canvas.height = textHeight + padding * 2;

  // 새 context는 font를 다시 설정해야 함 (canvas resize 시 초기화)
  ctx.font = "20px Arial";
  ctx.fillStyle = "#000000";
  ctx.textBaseline = "middle";
  ctx.textAlign = "center";
  ctx.fillText(text, canvas.width / 2, canvas.height / 2);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  const material = new THREE.SpriteMaterial({ map: texture, transparent: true });
  const sprite = new THREE.Sprite(material);

  const aspect = canvas.width / canvas.height;
  sprite.scale.set(size * aspect, size, 1);

  return sprite;
};

// 말뚝 그룹 데이터를 THREE.Group으로 변환
const buildPileMeshGroup = (pileGroups: PileCylinderData[]): THREE.Group => {
  const group = new THREE.Group();
  pileGroups.forEach((pileGroup) => {
    pileGroup.pile_data.forEach((pile) => {
      const geometry = new THREE.CylinderGeometry(
        pile.radius,
        pile.radius,
        pile.height,
        32
      );
      const material = new THREE.MeshStandardMaterial({
        color: new THREE.Color(pile.color),
        opacity: 1,
        transparent: false,
      });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(pile.position[0], pile.position[1], pile.position[2]);
      mesh.rotation.set(pile.rotation[0], pile.rotation[1], pile.rotation[2]);
      group.add(mesh);
    });
  });
  return group;
};

// 기초(foundation plane) + force point sphere
const buildBasicMeshGroup = (
  pileDataList: PileDataItem[],
  pileBasicDim: PileBasicDim
): THREE.Group => {
  const group = new THREE.Group();
  const { foundation, forcePoint } = calcPileBasic(pileDataList, pileBasicDim);

  // foundation plane
  {
    const geometry = new THREE.PlaneGeometry(
      foundation.planegeometry[0],
      foundation.planegeometry[1]
    );
    const material = new THREE.MeshStandardMaterial({
      color: new THREE.Color(foundation.color),
      transparent: true,
      opacity: 0.5,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(
      foundation.position[0],
      foundation.position[1],
      foundation.position[2]
    );
    mesh.rotation.set(
      foundation.rotation[0],
      foundation.rotation[1],
      foundation.rotation[2]
    );
    group.add(mesh);
  }

  // force point sphere
  {
    const geometry = new THREE.SphereGeometry(forcePoint.radius, 24, 24);
    const material = new THREE.MeshStandardMaterial({
      color: new THREE.Color(forcePoint.color),
      transparent: true,
      opacity: 0.8,
      depthWrite: false,
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(
      forcePoint.position[0],
      forcePoint.position[1],
      forcePoint.position[2]
    );
    group.add(mesh);
  }

  return group;
};

// 평면도(top 뷰)에서만 노출되는 치수 객체 추가
const buildPlaneDimGroup = (
  pileBasicDim: PileBasicDim,
  baseTopLevel: number
): THREE.Group => {
  const group = new THREE.Group();
  const { coneObject, cylinderObject } = createDimText(pileBasicDim, baseTopLevel);

  coneObject.forEach((cone) => {
    const geometry = new THREE.ConeGeometry(cone.radius, cone.height, 24);
    const material = new THREE.MeshStandardMaterial({
      color: new THREE.Color(cone.color),
      transparent: true,
      opacity: cone.opacity,
      depthWrite: false,
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(cone.position[0], cone.position[1], cone.position[2]);
    mesh.rotation.set(cone.rotation[0], cone.rotation[1], cone.rotation[2]);
    group.add(mesh);
  });

  cylinderObject.forEach((cyl) => {
    const geometry = new THREE.CylinderGeometry(cyl.radius, cyl.radius, cyl.height, 24);
    const material = new THREE.MeshStandardMaterial({
      color: new THREE.Color(cyl.color),
      transparent: true,
      opacity: cyl.opacity,
      depthWrite: false,
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(cyl.position[0], cyl.position[1], cyl.position[2]);
    mesh.rotation.set(cyl.rotation[0], cyl.rotation[1], cyl.rotation[2]);
    group.add(mesh);
  });

  return group;
};

// 텍스트 라벨 (CanvasTextState → Sprite)
const buildTextLabelGroup = (texts: CanvasTextState[]): THREE.Group => {
  const group = new THREE.Group();
  texts.forEach((t) => {
    const sprite = createTextSprite(t.text, t.fontSize * 1.6);
    if (!sprite) return;
    sprite.position.set(t.position[0], t.position[1], t.position[2]);
    group.add(sprite);
  });
  return group;
};

// 카메라 frustum / 위치 / up 벡터 설정
const applyCameraForView = (
  camera: THREE.OrthographicCamera,
  view: CaptureView,
  bbox: {
    size: THREE.Vector3;
    center: THREE.Vector3;
  },
  aspect: number
) => {
  const { size, center } = bbox;
  const margin = 1.25;
  let frustumSize = 1;
  switch (view) {
    case "top":
      frustumSize = Math.max(size.x, size.z) * margin;
      break;
    case "front":
      frustumSize = Math.max(size.y, size.z) * margin;
      break;
    case "side":
      frustumSize = Math.max(size.x, size.y) * margin;
      break;
  }

  camera.left = (-frustumSize * aspect) / 2;
  camera.right = (frustumSize * aspect) / 2;
  camera.top = frustumSize / 2;
  camera.bottom = -frustumSize / 2;
  camera.near = 0.1;
  camera.far = Math.max(frustumSize * 10, 1000);

  const distance = frustumSize * 2;
  switch (view) {
    case "top":
      camera.position.set(center.x, center.y + distance, center.z);
      camera.up.set(1, 0, 0);
      break;
    case "front":
      camera.position.set(center.x - distance, center.y, center.z);
      camera.up.set(0, 1, 0);
      break;
    case "side":
      camera.position.set(center.x, center.y, center.z + distance);
      camera.up.set(0, 1, 0);
      break;
  }
  camera.lookAt(center);
  camera.updateProjectionMatrix();
};

// 단일 뷰를 캡처
const captureSingleView = (
  view: CaptureView,
  pileDataList: PileDataItem[],
  pileBasicDim: PileBasicDim,
  options: CaptureOptions
): string => {
  const width = options.width ?? DEFAULT_WIDTH;
  const height = options.height ?? DEFAULT_HEIGHT;
  const background = options.background ?? "#FFFFFF";

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    preserveDrawingBuffer: true,
    alpha: true,
  });
  renderer.setPixelRatio(window.devicePixelRatio || 1);
  renderer.setSize(width, height, false);
  renderer.setClearColor(new THREE.Color(background), 1);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(background);
  scene.add(new THREE.AmbientLight(0xffffff, 0.9));
  const dir = new THREE.DirectionalLight(0xffffff, 0.7);
  dir.position.set(10, 10, 5);
  scene.add(dir);

  const baseTopLevel = calBaseTopLevel(pileDataList);
  const pileMeshes = buildPileMeshGroup(calcPileData(pileDataList, pileBasicDim));
  const basicMeshes = buildBasicMeshGroup(pileDataList, pileBasicDim);

  scene.add(basicMeshes);
  scene.add(pileMeshes);

  if (view === "top") {
    scene.add(buildPlaneDimGroup(pileBasicDim, baseTopLevel));
    const labels = createCanvasText(pileBasicDim, baseTopLevel);
    scene.add(buildTextLabelGroup(labels));
  }

  const bbox = new THREE.Box3().setFromObject(scene);
  const size = bbox.getSize(new THREE.Vector3());
  const center = bbox.getCenter(new THREE.Vector3());

  const camera = new THREE.OrthographicCamera();
  applyCameraForView(camera, view, { size, center }, width / height);

  renderer.render(scene, camera);
  const dataURL = canvas.toDataURL("image/png");
  const base64 = dataURL.split(",")[1] ?? "";

  // 리소스 정리
  scene.traverse((obj: any) => {
    if (obj.geometry) obj.geometry.dispose?.();
    if (obj.material) {
      if (Array.isArray(obj.material)) obj.material.forEach((m: any) => m.dispose?.());
      else obj.material.dispose?.();
    }
    if (obj.material?.map) obj.material.map.dispose?.();
  });
  renderer.dispose();

  return base64;
};

// 평면도 / 정면도 / 측면도 3개 모두 캡처
export const capturePileViewerImages = (
  pileDataList: PileDataItem[],
  pileBasicDim: PileBasicDim,
  options: CaptureOptions = {}
): { plan: string; front: string; side: string } => {
  return {
    plan: captureSingleView("top", pileDataList, pileBasicDim, options),
    front: captureSingleView("front", pileDataList, pileBasicDim, options),
    side: captureSingleView("side", pileDataList, pileBasicDim, options),
  };
};
