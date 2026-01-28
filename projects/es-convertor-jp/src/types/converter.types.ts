// Converter types and interfaces

import { MCTData } from './mct.types';

// Conversion context - shared data between converters
export interface ConversionContext {
  // Target Civil NX version (2025 or 2026)
  version: number;

  // Node mappings: original name/id -> MCT number
  nodeMapping: Map<string, number>;
  // Material mappings: name -> MCT number
  materialMapping: Map<string, number>;
  // Section mappings: name -> MCT number
  sectionMapping: Map<string, number>;
  // Element mappings: original id -> MCT number
  elementMapping: Map<string, number>;
  // Hinge property mappings: name -> MCT number
  hingePropertyMapping: Map<string, number>;
  // Spring property mappings: name -> MCT number
  springPropertyMapping: Map<string, number>;
  // GSpring type mappings: name -> MCT number
  gSpringTypeMapping: Map<string, number>;
  // Load case mappings: name -> index
  loadCaseMapping: Map<string, number>;

  // Section to material mapping
  sect2Material: Map<string, string>;
  // Element to material number mapping
  elemNo2MaterialNo: Map<number, number>;
  // Material number to type (S or RC) mapping
  matNo2SorRC: Map<number, string>;

  // ES node coordinates (in Civil NX coordinate system)
  esNodeCoords: Map<number, { x: number; y: number; z: number }>;
  // Original node coordinates for reference
  originalNodeCoords: Map<string, { x: number; y: number; z: number }>;

  // Element angles (elemNo -> angle or [angle, flag])
  elementAngles: Map<number, number | number[]>;
  // Element nodes (elemNo -> node numbers)
  elementNodes: Map<number, { node1: number; node2: number }>;
  // Element node names (elemName -> node names) for load processing
  elemNodeNames: Map<string, { nodeI: string; nodeJ: string }>;

  // Rigid element data
  rigidElements: Map<number, { masterNode: number; slaveNodes: number[] }>;
  // Rigid element name -> master node name mapping
  rigidMasterNode: Map<string, string>;

  // Spring component data
  springCompData: Map<string, SpringCompData>;

  // Spring properties that use reference elements (VBA m_dicSpgRef)
  springRefElements: Set<string>;

  // Long name management for materials (max 13 chars)
  longMaterialNames: Map<string, string>;
  longMaterialNameUsed: Set<string>;

  // Long name management for hinges (max 20 chars)
  longHingeNames: Map<string, string>;
  longHingeNameUsed: Set<string>;

  // Maximum numbers for auto-generation
  maxNodeNo: number;
  maxElementNo: number;
  maxMaterialNo: number;
  maxSectionNo: number;
  maxHingeNo: number;
  maxSpringPropNo: number;
  maxGSpringTypeNo: number;

  // Double point nodes for spring elements
  doublePointNodes: Set<string>;
}

export interface SpringCompData {
  angle?: number;
  components: SpringComponentData[];
}

export interface SpringComponentData {
  componentIndex: number; // 1-6 for xl, yl, zl, rxl, ryl, rzl
  componentType: number; // 0: Symmetric, 1: Asymmetric, 2: Other
  subType: number;
  propertyName: string;
  rotate: number;
  mctHyst: string;
  mctHyst2: string;
  mctSym: number;
  mctType: number;
  mctSFType: number;
  mctStiff: number;
  category: string[];
  data: string[];
  tensionData?: { d: number; k: number; f: number }[][];
}

// Coordinate transformation
export interface Point3D {
  x: number;
  y: number;
  z: number;
}

// Converter interface
export interface IConverter<TInput, TOutput> {
  convert(input: TInput, context: ConversionContext): TOutput;
}

// Conversion result
export interface ConversionResult {
  success: boolean;
  mctData: MCTData | null;
  mctText: string;
  errors: string[];
  warnings: string[];
}

// Conversion options
export interface ConversionOptions {
  version: number; // 2025 or 2026 (Civil NX version)
  includeComments: boolean;
  validateInput: boolean;
}

// Validation result
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

// Progress callback
export type ProgressCallback = (progress: number, message: string) => void;

// Create empty conversion context
export function createConversionContext(version: number = 2025): ConversionContext {
  return {
    version,
    nodeMapping: new Map(),
    materialMapping: new Map(),
    sectionMapping: new Map(),
    elementMapping: new Map(),
    hingePropertyMapping: new Map(),
    springPropertyMapping: new Map(),
    gSpringTypeMapping: new Map(),
    loadCaseMapping: new Map(),

    sect2Material: new Map(),
    elemNo2MaterialNo: new Map(),
    matNo2SorRC: new Map(),

    esNodeCoords: new Map(),
    originalNodeCoords: new Map(),

    elementAngles: new Map(),
    elementNodes: new Map(),
    elemNodeNames: new Map(),

    rigidElements: new Map(),
    rigidMasterNode: new Map(),
    springCompData: new Map(),
    springRefElements: new Set(),

    longMaterialNames: new Map(),
    longMaterialNameUsed: new Set(),
    longHingeNames: new Map(),
    longHingeNameUsed: new Set(),

    maxNodeNo: 0,
    maxElementNo: 0,
    maxMaterialNo: 0,
    maxSectionNo: 0,
    maxHingeNo: 0,
    maxSpringPropNo: 0,
    maxGSpringTypeNo: 0,

    doublePointNodes: new Set(),
  };
}
