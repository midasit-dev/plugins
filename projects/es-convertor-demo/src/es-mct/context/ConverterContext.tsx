import React, { createContext, useContext, useReducer } from 'react';
import type { TabId, TabData, MctResult, GlobalMaps } from '../types';
import { TAB_IDS, createEmptyGlobalMaps } from '../types';

// ── State ──
export interface ConverterState {
  tabData: TabData;
  globalMaps: GlobalMaps;
  mctResult: MctResult | null;
}

function createEmptyTabData(): TabData {
  const data = {} as TabData;
  for (const id of TAB_IDS) {
    data[id] = [];
  }
  return data;
}

const initialState: ConverterState = {
  tabData: createEmptyTabData(),
  globalMaps: createEmptyGlobalMaps(),
  mctResult: null,
};

// ── Actions ──
type ConverterAction =
  | { type: 'SET_TAB_DATA'; tabId: TabId; data: string[][] }
  | { type: 'SET_ALL_TAB_DATA'; data: Partial<TabData> }
  | { type: 'CLEAR_TAB_DATA' }
  | { type: 'SET_GLOBAL_MAPS'; maps: GlobalMaps }
  | { type: 'SET_MCT_RESULT'; result: MctResult | null };

function converterReducer(state: ConverterState, action: ConverterAction): ConverterState {
  switch (action.type) {
    case 'SET_TAB_DATA':
      return {
        ...state,
        tabData: { ...state.tabData, [action.tabId]: action.data },
      };
    case 'SET_ALL_TAB_DATA':
      return {
        ...state,
        tabData: { ...state.tabData, ...action.data },
      };
    case 'CLEAR_TAB_DATA':
      return {
        ...state,
        tabData: createEmptyTabData(),
        globalMaps: createEmptyGlobalMaps(),
        mctResult: null,
      };
    case 'SET_GLOBAL_MAPS':
      return { ...state, globalMaps: action.maps };
    case 'SET_MCT_RESULT':
      return { ...state, mctResult: action.result };
    default:
      return state;
  }
}

// ── Context ──
const ConverterStateContext = createContext<ConverterState | null>(null);
const ConverterDispatchContext = createContext<React.Dispatch<ConverterAction> | null>(null);

export function ConverterProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(converterReducer, initialState);

  return (
    <ConverterStateContext.Provider value={state}>
      <ConverterDispatchContext.Provider value={dispatch}>
        {children}
      </ConverterDispatchContext.Provider>
    </ConverterStateContext.Provider>
  );
}

/** 컨버터 상태 접근 훅 */
export function useConverterState(): ConverterState {
  const ctx = useContext(ConverterStateContext);
  if (!ctx) throw new Error('useConverterState must be used within ConverterProvider');
  return ctx;
}

/** 컨버터 dispatch 접근 훅 */
export function useConverterDispatch(): React.Dispatch<ConverterAction> {
  const ctx = useContext(ConverterDispatchContext);
  if (!ctx) throw new Error('useConverterDispatch must be used within ConverterProvider');
  return ctx;
}
