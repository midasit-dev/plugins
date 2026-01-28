// Excel data types for ES (Engineer Studio) data

export interface NodeData {
  id: string;
  x: number;
  y: number;
  z: number;
}

export interface FrameData {
  id: string;
  node1: string;
  node2: string;
  materialName: string;
  sectionName: string;
  angle: number;
  refNode?: string;
  refVector?: { x: number; y: number; z: number };
}

export interface PlaneElementData {
  id: string;
  nodes: string[];
  materialName: string;
  sectionName: string;
  type: string;
}

export interface RigidData {
  id: string;
  masterNode: string;
  slaveNodes: string[];
  type: string;
  dof: string[];
}

export interface MaterialData {
  name: string;
  type: string;
  category: string;
  strength: number;
  elasticModulus: number;
  density: number;
  thermalCoeff: number;
  poissonRatio?: number;
}

export interface SectionData {
  name: string;
  type: string;
  shape: string;
  area?: number;
  iyy?: number;
  izz?: number;
  ixx?: number;
  asy?: number;
  asz?: number;
  cy?: number;
  cz?: number;
  dimensions?: Record<string, number>;
  materialName?: string;
}

export interface SectionElementData {
  elementId: string;
  iSectionName: string;
  jSectionName: string;
}

export interface PlnSectData {
  name: string;
  thickness: number;
  type: string;
}

export interface HingePropertyData {
  name: string;
  type: string;
  direction: string;
  materialType: string;
  data: Record<string, number | string>;
  curve?: { x: number; y: number }[];
}

export interface HingeAssignData {
  elementId: string;
  hingeNameI: string;
  hingeNameJ: string;
  directionI: string;
  directionJ: string;
}

export interface SpringElementData {
  id: string;
  node1: string;
  node2: string;
  propertyName: string;
  type: string;
  angle?: number;
  refDirection?: string;
}

export interface SpringPropertyData {
  name: string;
  component: number;
  type: number;
  hystType: string;
  isSymmetric: boolean;
  stiffness: number;
  data: {
    tension?: { d: number; k: number; f: number }[];
    compression?: { d: number; k: number; f: number }[];
  };
}

export interface FulcrumData {
  nodeId: string;
  type: string;
  constraints: string[];
  springType?: string;
}

export interface FulcrumDetailData {
  name: string;
  type: string;
  sdx?: number;
  sdy?: number;
  sdz?: number;
  srx?: number;
  sry?: number;
  srz?: number;
}

export interface NodalMassData {
  nodeId: string;
  mx: number;
  my: number;
  mz: number;
  mrx?: number;
  mry?: number;
  mrz?: number;
}

export interface LoadCaseData {
  name: string;
  type: string;
  description?: string;
}

export interface ConcentratedLoadData {
  loadCase: string;
  nodeId: string;
  fx?: number;
  fy?: number;
  fz?: number;
  mx?: number;
  my?: number;
  mz?: number;
}

export interface SupportDisplacementData {
  loadCase: string;
  nodeId: string;
  dx?: number;
  dy?: number;
  dz?: number;
  rx?: number;
  ry?: number;
  rz?: number;
}

export interface BeamLoadData {
  loadCase: string;
  elementId: string;
  type: string;
  direction: string;
  value1: number;
  value2?: number;
  distance1?: number;
  distance2?: number;
}

export interface TemperatureLoadData {
  loadCase: string;
  elementId: string;
  temperature: number;
  gradient?: number;
}

export interface InternalForceData {
  elementId: string;
  loadCase: string;
  forces: {
    fxi?: number;
    fyi?: number;
    fzi?: number;
    mxi?: number;
    myi?: number;
    mzi?: number;
    fxj?: number;
    fyj?: number;
    fzj?: number;
    mxj?: number;
    myj?: number;
    mzj?: number;
  };
}

// Complete Excel data structure
export interface ESExcelData {
  nodes: NodeData[];
  frames: FrameData[];
  planeElements: PlaneElementData[];
  rigidElements: RigidData[];
  materials: MaterialData[];
  sections: SectionData[];
  sectionElements: SectionElementData[];
  plnSections: PlnSectData[];
  hingeProperties: HingePropertyData[];
  hingeAssigns: HingeAssignData[];
  springElements: SpringElementData[];
  springProperties: SpringPropertyData[];
  fulcrums: FulcrumData[];
  fulcrumDetails: FulcrumDetailData[];
  nodalMasses: NodalMassData[];
  loadCases: LoadCaseData[];
  concentratedLoads: ConcentratedLoadData[];
  supportDisplacements: SupportDisplacementData[];
  beamLoads: BeamLoadData[];
  temperatureLoads: TemperatureLoadData[];
  internalForces: InternalForceData[];
}
