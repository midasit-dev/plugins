// MCT (MIDAS Civil NX Text) output types

export interface MCTSection {
  keyword: string;
  comments: string[];
  data: string[];
}

export interface MCTNode {
  no: number;
  x: number;
  y: number;
  z: number;
}

export interface MCTElement {
  no: number;
  type: string;
  materialNo: number;
  sectionNo: number;
  nodes: number[];
  angle?: number;
}

export interface MCTMaterial {
  no: number;
  type: string;
  name: string;
  data: string;
}

export interface MCTSectionProp {
  no: number;
  type: string;
  name: string;
  shape?: string;
  data: string;
}

export interface MCTThickness {
  no: number;
  name: string;
  type: string;
  thickness: number;
  materialNo?: number;
}

export interface MCTRigidLink {
  no: number;
  masterNode: number;
  slaveNodes: number[];
  dof: string;
}

export interface MCTConstraint {
  nodeGroup: string;
  dof: string;
  masterNode?: number;
}

export interface MCTHingeProp {
  no: number;
  name: string;
  type: string;
  data: string;
}

export interface MCTHingeAssign {
  elementNo: number;
  hingeNoI?: number;
  hingeNoJ?: number;
  directionI?: string;
  directionJ?: string;
}

export interface MCTNLLink {
  no: number;
  type: string;
  node1: number;
  node2: number;
  propertyNo: number;
  angle?: number;
}

export interface MCTNLProp {
  no: number;
  name: string;
  type: string;
  data: string;
}

export interface MCTGSpring {
  nodeNo: number;
  typeNo: number;
  dx?: number;
  dy?: number;
  dz?: number;
  rx?: number;
  ry?: number;
  rz?: number;
}

export interface MCTGSprType {
  no: number;
  name: string;
  sdx?: number;
  sdy?: number;
  sdz?: number;
  srx?: number;
  sry?: number;
  srz?: number;
}

export interface MCTNodalMass {
  nodeNo: number;
  mx: number;
  my: number;
  mz: number;
  mrx?: number;
  mry?: number;
  mrz?: number;
}

export interface MCTLoadCase {
  name: string;
  type: string;
  description?: string;
}

export interface MCTConLoad {
  loadCase: string;
  nodeNo: number;
  fx?: number;
  fy?: number;
  fz?: number;
  mx?: number;
  my?: number;
  mz?: number;
}

export interface MCTSpDisp {
  loadCase: string;
  nodeNo: number;
  dx?: number;
  dy?: number;
  dz?: number;
  rx?: number;
  ry?: number;
  rz?: number;
}

export interface MCTBeamLoad {
  loadCase: string;
  elementNo: number;
  loadType: string;
  direction: string;
  projType: string;
  data: string;
}

export interface MCTElTemper {
  loadCase: string;
  elementNo: number;
  temperature: number;
  gradient?: number;
}

export interface MCTIniEForce {
  loadCase: string;
  elementNo: number;
  data: string;
}

// Complete MCT data structure
export interface MCTData {
  version: string;
  unit: {
    force: string;
    length: string;
    heat: string;
    temperature: string;
  };
  nodes: MCTNode[];
  elements: MCTElement[];
  materials: MCTMaterial[];
  sections: MCTSectionProp[];
  thicknesses: MCTThickness[];
  rigidLinks: MCTRigidLink[];
  constraints: MCTConstraint[];
  hingeProps: MCTHingeProp[];
  hingeAssigns: MCTHingeAssign[];
  nlLinks: MCTNLLink[];
  nlProps: MCTNLProp[];
  gSprings: MCTGSpring[];
  gSprTypes: MCTGSprType[];
  nodalMasses: MCTNodalMass[];
  loadCases: MCTLoadCase[];
  conLoads: MCTConLoad[];
  spDisps: MCTSpDisp[];
  beamLoads: MCTBeamLoad[];
  elTempers: MCTElTemper[];
  iniEForces: MCTIniEForce[];
}

// MCT output generation options
export interface MCTGeneratorOptions {
  includeComments: boolean;
  includeHeader: boolean;
  version?: number;
}
