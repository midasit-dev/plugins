import {SetRecoilState, atom, selector,DefaultValue} from 'recoil';
import {FoundationCoordinates, CalculatePileCoordinates, ExtractNumbers, CalculatePileCenterCoordinates} from '../utils_pyscript';
/** App variables */

export const ProjectName = atom({
    key: 'ProjectName',
    default: 'Project'
});

// -----------------------------------------------------------------------------------------------------------------------------------------


export const addusersetstate = atom({
    key: 'adduserset',
    default: [] as any
})

export const addtopslabstate = atom({
    key: 'addtopslab',
    default: [] as any
})

export const addbottomslabstate = atom({
    key: 'addbottomslab',
    default: [] as any
})

export const addexternalwallstate = atom({
    key: 'addexternalwall',
    default: [] as any
})

export const addinternalwallstate = atom({
    key: 'addinternalwall',
    default: [] as any
})

// -----------------------------------------------------------------------------------------------------------------------------------------
// Soil Density
export const soilDensityState = atom<number>({
    key: 'soilDensityState',
    default: 20,
  });
  
  // Submerged Soil Weight
  export const submergedSoilWeightState = atom<number>({
    key: 'submergedSoilWeightState',
    default: 11,
  });
  
  // Internal Friction Angle
  export const internalFrictionAngleState = atom<number>({
    key: 'internalFrictionAngleState',
    default: 33,
  });
  
  // Water Density
  export const waterDensityState = atom<number>({
    key: 'waterDensityState',
    default: 10,
  });
  
  // Waterproof Thickness
  export const waterproofThicknessState = atom<number>({
    key: 'waterproofThicknessState',
    default: 0.05,
  });
  
  // Waterproof Units Dry Weight
  export const waterproofUnitsDryWeightState = atom<number>({
    key: 'waterproofUnitsDryWeightState',
    default: 21,
  });
  
  // Waterproof Units Sub Weight
  export const waterproofUnitsSubWeightState = atom<number>({
    key: 'waterproofUnitsSubWeightState',
    default: 11,
  });
  
  // Added Load Thickness
  export const addedLoadThicknessState = atom<number>({
    key: 'addedLoadThicknessState',
    default: 0.5,
  });
  
  // Added Load Units Weight
  export const addedLoadUnitsWeightState = atom<number>({
    key: 'addedLoadUnitsWeightState',
    default: 23,
  });

  // Coverdepth
  export const coverDepthState = atom<string>({
    key: 'coverDepthState',
    default: "1",
  });
  

    // waterdepth
    export const waterDepthState  = atom<string>({
        key: 'waterDepthState',
        default: "0",
      });


// ----stage set------------------------------------------------------------------------------------------------------------------------------

    export const allelementstate =atom<any>({
        key : 'allelementstate',
        default : []     
    })

      export const constructionDataState =atom<any>({
        key : 'constructionDataState',
        default : []     
      })

      export const topelementstate =atom({
        key : 'topelementstate',
        default : ""
      })
      export const bottomelementstate =atom({
        key : 'bottomelementstate',
        default : ""
      })
      export const exwallelementstate =atom({
        key : 'exwallelementstate',
        default : ""
      })

      export const inwallelementstate =atom({
        key : 'inwallelementstate',
        default : ""
      })

      export const elementDataState = atom({
        key: 'elementDataState', // 고유 키
        default: null, // 초기 상태 값
      });
      export const consideringSoilFrictionState = atom<boolean>({
        key: 'consideringSoilFrictionState',
        default: false, 
      });
      
      export const consideringShearkeyState = atom<boolean>({
        key: 'consideringShearkeyState',
        default: false, 
      });

      export const setvaluestate = atom({
        key:'setvaluestate',
        default:null,
      });