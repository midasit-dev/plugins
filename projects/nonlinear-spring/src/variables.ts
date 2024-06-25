import {SetRecoilState, atom, selector,DefaultValue} from 'recoil';

export const BH_Columns = atom({
  key: 'BH_Columns',
  default: [
    { field: 'Index', headerName: 'Index (m)', width: 100, editable: false },
    { field: 'BH1', headerName: 'BH 1', width: 80, editable: true },
  ]
});

export const BH_Counter = atom({
  key: 'BH_Counter',
  default: 1
});

export const BH_TableRows = atom({
  key: 'BH_TableRows',
  default: [
    { id: 1, Index: 'X Position', BH1: 0},
    { id: 2, Index: 'Ground Level', BH1: 0},
    { id: 3, Index: 'Layer 1', BH1: 0 },
    { id: 4, Index: 'Water Level', BH1: 0 },
  ]
});

export const Layer_Counter = atom({
  key: 'Row_Counter',
  default: 1
});

export const WaterLevelCheck = atom({
  key: 'WaterLevelCheck',
  default: 'Consider'
});

interface LayerDataTypes{
  id : number,
  LayerNo: number,
  SoilType: string,
  KH: number,
  gamma_t: number,
  gamma_sat: number,
  friction_angle: number,
  cohesion: number,
  circumference: number
}

export const LayerData = atom({
  key: 'LayerData',
  default: [
    { id: 1, LayerNo: 1, SoilType: 'Sand', KH: 0, gamma_t: 0, gamma_sat: 0, friction_angle: 0, cohesion: 0, circumference: 0 },
  ] as LayerDataTypes[]
})

export const STGroups = atom({
  key : 'STGroups',
  default : [] as any
})

export const ElemList = atom({
  key : 'ElemList',
  default : [] as any
})