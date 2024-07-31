import { useRecoilValue } from 'recoil';
import {
  soilDensityState,
  submergedSoilWeightState,
  internalFrictionAngleState,
  waterDensityState,
  waterproofThicknessState,
  waterproofUnitsDryWeightState,
  waterproofUnitsSubWeightState,
  addedLoadThicknessState,
  addedLoadUnitsWeightState,
  coverDepthState,
  waterDepthState,
  elementDataState,
  consideringSoilFrictionState,
  consideringShearkeyState
} from '../variables';


const useBuoyancyCalculator = () => {
  const soilDensity = useRecoilValue(soilDensityState);
  const submergedSoilWeight = useRecoilValue(submergedSoilWeightState);
  const internalFrictionAngle = useRecoilValue(internalFrictionAngleState);
  const waterDensity = useRecoilValue(waterDensityState);
  const waterproofThickness = useRecoilValue(waterproofThicknessState);
  const waterproofUnitsDryWeight = useRecoilValue(waterproofUnitsDryWeightState);
  const waterproofUnitsSubWeight = useRecoilValue(waterproofUnitsSubWeightState);
  const addedLoadThickness = useRecoilValue(addedLoadThicknessState);
  const addedLoadUnitsWeight = useRecoilValue(addedLoadUnitsWeightState);
  const coverDepth = useRecoilValue(coverDepthState);
  const waterDepth = useRecoilValue(waterDepthState);
  const elementData = useRecoilValue(elementDataState);
  const consideringSoilFriction = useRecoilValue(consideringSoilFrictionState);
  const consideringShearkey = useRecoilValue(consideringShearkeyState);

  const calculateBuoyancy = () => {
    if (!elementData) {
      console.log("Element data is not available yet");
      return { R: 0, U: 0, FS: 0 };
    }
    const r_w = waterDensity; // water density in kN/m^3
    const δ = (2 / 3) * internalFrictionAngle; // Relative friction angle
    const k_0 = 1 - Math.sin(internalFrictionAngle * (Math.PI / 180)); // coefficient of earth pressure at rest

    const h_topadded1 = addedLoadThickness; // Asphalt thickness in meters
    const r_added1 = addedLoadUnitsWeight; // Asphalt density in kN/m^3
    const h_topadded2 = waterproofThickness; // Mortar thickness in meters
    const r_added_dry2 = waterproofUnitsDryWeight; // Dry density of mortar in kN/m^3
    const r_added_sub2 = waterproofUnitsSubWeight; // Submerged density of mortar in kN/m^3

    let h_shearwater = 0;
    let h_str_rt_shk = 0;


    const extractStructureData = (elementData: any) => {
      let t_top = 0;
      let t_bot = 0;
      let B_bot = 0;
      let B_top = 0;
      let t_wall_bot = 0;
      let t_wall_top = 0;
      let h_wall = 0;
      let B_shear = 0;
      let w_self = 0;
      let sk = 0;
      let dist_wall = 0;
      if (elementData.ele_top_slb && Object.keys(elementData.ele_top_slb).length > 0) {
        const topSlabElement = Object.values(elementData.ele_top_slb)[0] as any;
        t_top = topSlabElement.thickness;
        B_top = Math.max(...Object.values(elementData.ele_top_slb).map((el: any) => el.end_node.x),
          ...Object.values(elementData.ele_top_slb).map((el: any) => el.start_node.x)) -
          Math.min(...Object.values(elementData.ele_top_slb).map((el: any) => el.end_node.x),
            ...Object.values(elementData.ele_top_slb).map((el: any) => el.start_node.x));
      }

      if (elementData.ele_bot_slb) {
        const botSlabElement = Object.values(elementData.ele_bot_slb)[0] as any;
        t_bot = botSlabElement.thickness;
        B_bot = Math.max(...Object.values(elementData.ele_bot_slb).map((el: any) => el.end_node.x),
          ...Object.values(elementData.ele_bot_slb).map((el: any) => el.start_node.x)) -
          Math.min(...Object.values(elementData.ele_bot_slb).map((el: any) => el.end_node.x),
            ...Object.values(elementData.ele_bot_slb).map((el: any) => el.start_node.x));
      }

      if (elementData.ele_outsid_wall) {
        const wallElements = Object.values(elementData.ele_outsid_wall) as any[];
        t_wall_bot = wallElements[0].thickness;
        t_wall_top = wallElements[wallElements.length - 1].thickness;
        h_wall = Math.max(...wallElements.map(el => Math.max(el.start_node.z, el.end_node.z))) - 
          Math.min(...wallElements.map(el => Math.min(el.start_node.z, el.end_node.z)));
    
        const zMin = Math.min(...wallElements.map(el => Math.min(el.start_node.z, el.end_node.z)));
        const leftWall = wallElements.filter(el => Math.min(el.start_node.z, el.end_node.z) === zMin)
                                    .reduce((leftMost, el) => Math.min(leftMost, el.start_node.x, el.end_node.x), Infinity);
        const rightWall = wallElements.filter(el => Math.min(el.start_node.z, el.end_node.z) === zMin)
                                     .reduce((rightMost, el) => Math.max(rightMost, el.start_node.x, el.end_node.x), -Infinity);
    
        dist_wall = rightWall - leftWall;
      }
      w_self = Object.values(elementData).reduce((total: number, elementGroup: any) => {
        return total + Object.values(elementGroup).reduce((groupTotal: number, element: any) => {
          return groupTotal + (element.weight || 0);
        }, 0);
      }, 0);
      // console.log("dist_wall:",dist_wall)
      // B_top과 B_bot 비교하여 sk, B_shear, B_bot 설정
      if (Math.abs(dist_wall - B_bot) < 0.01) { // 부동소수점 비교를 위해 작은 오차 허용
        sk = 0;
        B_shear = 0;
      } else {
        sk = 1;
        B_shear = (B_bot - dist_wall - t_wall_bot) * 0.5;
        B_bot = dist_wall; // B_bot을 B_top과 같게 설정
      }

      return { t_top, t_bot, B_bot, B_top, t_wall_bot, t_wall_top, h_wall, B_shear, w_self, sk, dist_wall };
    };

    const structureData = extractStructureData(elementData);
    const { t_top, t_bot, B_bot, B_top, t_wall_bot, t_wall_top, h_wall, B_shear, w_self, sk} = structureData;


    const dc = parseFloat(coverDepth); // cover depth in meters

    const t_shear = t_bot; // shearkey thickness in meters


    const B_botall = B_bot + t_wall_bot + B_shear * 2;

    let B_topall = 0;
    if ((elementData as any).ele_top_slb && Object.keys((elementData as any).ele_top_slb).length > 0) {
      B_topall = B_top + t_wall_top;
    }
    const h_str = h_wall + (t_top * 0.5) + (t_bot * 0.5);
    const h_all = h_str + dc;
    const h_water = parseFloat(waterDepth);
    const h_water_bot = h_all - h_water;

    const h_str_oboveshear = h_all - t_shear;

    const W1 = w_self;

    // Buoyancy calculation
    const U = Math.max(h_water_bot * B_botall * r_w, 1e-999);

    // Friction of wall
    let Ps = 0;
    if (consideringSoilFriction) {
      let h1: number;
      if (sk === 0) {
        h1 = Math.min(dc, h_water);
      } else {
        h1 = h_water;
      }

      const Ps1 = k_0 * soilDensity * Math.pow(h1, 2) * Math.tan(δ * (Math.PI / 180));

      let h2: number;
      if (sk === 0) {
        h2 = Math.max(0, dc - h_water);
      } else {
        h2 = h_all - t_shear - h1;
      }

      const Ps2 = k_0 * (2 * soilDensity * h1 * h2 + Math.pow(h2, 2) * submergedSoilWeight) * Math.tan(δ * (Math.PI / 180));
      // console.log("w_self:", w_self)
      // console.log("sk:", sk)
      Ps = Ps1 + Ps2;
    }

    // Added weight above top slab
    let w_topadded1=0;
    if (dc > 0) {
      w_topadded1 = h_topadded1 * B_topall * r_added1;
    }else {
      w_topadded1 = 0;
    }

    const r_added2_top = (h_str < h_water_bot) ? r_added_sub2 : r_added_dry2;
    const w_topadded2 = h_topadded2 * B_topall * r_added2_top;

    let h_topwater = Math.max(0, dc - h_water - h_topadded2);
    const w_topwater = h_topwater * B_topall * r_w;

    const h_topsoil = dc - h_topadded1 - h_topadded2;
    const h_soil_rt = h_topsoil - h_topwater;

    const w_soil_rt = h_soil_rt * B_topall * soilDensity;
    const h_soil_sub = h_topwater;
    const w_soil_sub = h_soil_sub * B_topall * submergedSoilWeight;
    // Added weight above shearkey
    let w_added1_shk = 0;
    let w_added2_shk = 0;
    let w_shearwater = 0;
    let w_soil_rt_shk = 0;
    let w_soil_sub_shk = 0;

    if (consideringShearkey) {
      w_added1_shk = h_topadded1 * B_shear * r_added1 * 2;

      const r_added2_shk = (t_shear < h_water_bot) ? r_added_sub2 : r_added_dry2;
      w_added2_shk = h_topadded2 * B_shear * r_added2_shk * 2;

      let h_shearwater = Math.max(0, h_water_bot - t_shear - h_topadded2);
      w_shearwater = h_shearwater * B_shear * r_w * 2;

      const h_str_rt_shk = h_str_oboveshear - h_shearwater - h_topadded1 - h_topadded2;
      w_soil_rt_shk = h_str_rt_shk * B_shear * soilDensity * 2;
      w_soil_sub_shk = h_shearwater * B_shear * submergedSoilWeight * 2;
    }
    
    let W2_uptopslb = 0;
    if ((elementData as any).ele_top_slb && Object.keys((elementData as any).ele_top_slb).length > 0) {
      if (dc > 0) {
        W2_uptopslb = w_topadded2 + w_topwater + w_soil_rt + w_soil_sub;
      } else {
        W2_uptopslb = 0;
      }
    }
    let W2_upshearkey = 0;
    if ((elementData as any).ele_top_slb && Object.keys((elementData as any).ele_top_slb).length > 0) {
      W2_upshearkey = w_added1_shk + w_added2_shk + w_shearwater + w_soil_rt_shk + w_soil_sub_shk
    }
    const W2 = w_topadded1 + W2_uptopslb + W2_upshearkey;

    // console.log("w_soil_sub:", w_soil_sub)

    const R = W1 + W2 + Ps;

    const FS = R / U;

    // console.log("FS:", FS)   
    return {
      R, U, FS, W1, W2, Ps,
      r_w, δ, k_0, h_topadded1, r_added1, h_topadded2, r_added_dry2, r_added_sub2,
      t_top, t_bot, B_bot, B_top, t_wall_bot, t_wall_top, h_wall, B_shear, w_self, sk,
      dc, t_shear, B_botall, B_topall, h_str, h_all, h_water, h_water_bot, internalFrictionAngle, W2_uptopslb, W2_upshearkey, w_topadded1, w_topadded2, w_topwater, w_soil_rt, w_soil_sub,
      w_added1_shk, w_added2_shk, w_shearwater, w_soil_rt_shk, w_soil_sub_shk, h_shearwater, h_topwater, h_soil_rt, h_soil_sub, r_added2_top, h_str_rt_shk, soilDensity
    };
  };

  return calculateBuoyancy;
};

export default useBuoyancyCalculator;