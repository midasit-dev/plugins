import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Box } from '@mui/material';

interface CalculationSheetProps {
  open: boolean;
  onClose: () => void;
  calculationData: any;
}

const CalculationStep: React.FC<{ label: string; calculation: string; result: number | string | undefined }> = ({ label, calculation, result }) => (
  <Box display="flex" alignItems="center" my={1}>
    <Typography variant="body1" style={{ minWidth: '150px' }}>{label} =</Typography>
    <Typography variant="body1" style={{ flexGrow: 1, marginLeft: '10px', marginRight: '10px' }}>{calculation}</Typography>
    <Typography variant="body1" style={{ minWidth: '100px' }}>= {typeof result === 'number' ? result.toFixed(4) : result || 'N/A'}</Typography>
  </Box>
);

const CalculationSheet: React.FC<CalculationSheetProps> = ({ open, onClose, calculationData }) => {
  const {
    r_w = 0, δ = 0, k_0 = 0, h_topadded1 = 0, r_added1 = 0, h_topadded2 = 0, r_added_dry2 = 0, r_added_sub2 = 0,
    t_top = 0, t_bot = 0, B_bot = 0, B_top = 0, t_wall_bot = 0, t_wall_top = 0, h_wall = 0, B_shear = 0, w_self = 0, sk = 0,
    dc = 0, t_shear = 0, B_botall = 0, B_topall = 0, h_str = 0, h_all = 0, h_water = 0, h_water_bot = 0,
    U = 0, Ps = 0, W1 = 0, W2 = 0, R = 0, FS = 0, soilDensity = 0, submergedSoilWeight = 0, internalFrictionAngle = 0,
    W2_uptopslb = 0, W2_upshearkey = 0, w_topadded1 = 0, w_topadded2 = 0, w_topwater = 0, w_soil_rt = 0, w_soil_sub = 0,
    w_added1_shk = 0, w_added2_shk = 0, w_shearwater = 0, w_soil_rt_shk = 0, w_soil_sub_shk = 0, h_shearwater = 0, h_topwater = 0, h_soil_rt = 0,
    h_soil_sub = 0, r_added2_top = 0, h_str_rt_shk = 0
  } = calculationData || {};

  const safeNumber = (value: any) => {
    const num = Number(value);
    return isNaN(num) ? 0 : num;
  };

  const safeInternalFrictionAngle = safeNumber(internalFrictionAngle);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>Detailed Buoyancy Calculation</DialogTitle>
      <DialogContent>
        <Typography variant="h6">Input Parameters</Typography>
        <CalculationStep label="r_w" calculation="Water density" result={r_w} />
        <CalculationStep label="δ" calculation={`(2/3) × ${safeInternalFrictionAngle.toFixed(2)}°`} result={δ} />
        <CalculationStep label="k_0" calculation={`1 - sin(${safeInternalFrictionAngle.toFixed(2)}°)`} result={k_0} />

        <Typography variant="h6" mt={2}>Structure Dimensions</Typography>
        <CalculationStep label="t_top" calculation="Top slab thickness" result={t_top} />
        <CalculationStep label="t_bot" calculation="Bottom slab thickness" result={t_bot} />
        <CalculationStep label="B_bot" calculation="Bottom slab width" result={B_bot} />
        <CalculationStep label="B_top" calculation="Top slab width" result={B_top} />
        <CalculationStep label="t_wall_bot" calculation="Wall thickness at bottom" result={t_wall_bot} />
        <CalculationStep label="t_wall_top" calculation="Wall thickness at top" result={t_wall_top} />
        <CalculationStep label="h_wall" calculation="Wall height" result={h_wall} />
        <CalculationStep label="B_shear" calculation="Shearkey width" result={B_shear} />

        <Typography variant="h6" mt={2}>Intermediate Calculations</Typography>
        <CalculationStep label="B_botall" calculation={`${B_bot.toFixed(4)} + ${t_wall_bot.toFixed(4)} + 2 × ${B_shear.toFixed(4)}`} result={B_botall} />
        <CalculationStep label="B_topall" calculation={`${B_top.toFixed(4)} + ${t_wall_top.toFixed(4)}`} result={B_topall} />
        <CalculationStep label="h_str" calculation={`${h_wall.toFixed(4)} + 0.5 × ${t_top.toFixed(4)} + 0.5 × ${t_bot.toFixed(4)}`} result={h_str} />
        <CalculationStep label="h_all" calculation={`${h_str.toFixed(4)} + ${dc.toFixed(4)}`} result={h_all} />
        <CalculationStep label="h_water_bot" calculation={`${h_all.toFixed(4)} - ${h_water.toFixed(4)}`} result={h_water_bot} />

        <Typography variant="h6" mt={2}>Buoyancy Force (U)</Typography>
        <CalculationStep label="U" calculation={`${h_water_bot.toFixed(4)} × ${B_botall.toFixed(4)} × ${r_w.toFixed(4)}`} result={U} />

        <Typography variant="h6" mt={2}>Soil Friction (Ps)</Typography>
        {Ps > 0 && (
          <>
            <CalculationStep
              label="h1"
              calculation={`Min(${dc.toFixed(4)}, ${h_water.toFixed(4)})`}
              result={Math.min(dc, h_water)}
            />
            <CalculationStep
              label="h2"
              calculation={`Max(0, ${h_all.toFixed(4)} - ${t_shear.toFixed(4)} - ${Math.min(dc, h_water).toFixed(4)})`}
              result={Math.max(0, h_all - t_shear - Math.min(dc, h_water))}
            />
            <CalculationStep
              label="Ps1"
              calculation={`${k_0.toFixed(4)} × ${soilDensity.toFixed(4)} × (${Math.min(dc, h_water).toFixed(4)})² × tan(${δ.toFixed(2)}°)`}
              result={k_0 * soilDensity * Math.pow(Math.min(dc, h_water), 2) * Math.tan(δ * (Math.PI / 180))}
            />
            <CalculationStep
              label="Ps2"
              calculation={`${k_0.toFixed(4)} × (2 × ${soilDensity.toFixed(4)} × ${Math.min(dc, h_water).toFixed(4)} × ${Math.max(0, h_all - t_shear - Math.min(dc, h_water)).toFixed(4)} + (${Math.max(0, h_all - t_shear - Math.min(dc, h_water)).toFixed(4)})² × ${submergedSoilWeight.toFixed(4)}) × tan(${δ.toFixed(2)}°)`}
              result={k_0 * (2 * soilDensity * Math.min(dc, h_water) * Math.max(0, h_all - t_shear - Math.min(dc, h_water)) + Math.pow(Math.max(0, h_all - t_shear - Math.min(dc, h_water)), 2) * submergedSoilWeight) * Math.tan(δ * (Math.PI / 180))}
            />
            <CalculationStep
              label="Ps"
              calculation="Ps1 + Ps2"
              result={Ps}
            />
          </>
        )}

        <Typography variant="h6" mt={2}>Added Weight (W2) Calculations</Typography>
        <CalculationStep label="w_topadded1" calculation={`${h_topadded1.toFixed(4)} × ${B_topall.toFixed(4)} × ${r_added1.toFixed(4)}`} result={w_topadded1} />
        <CalculationStep label="w_topadded2" calculation={`${h_topadded2.toFixed(4)} × ${B_topall.toFixed(4)} × ${r_added2_top.toFixed(4)}`} result={w_topadded2} />
        <CalculationStep label="w_topwater" calculation={`${h_topwater.toFixed(4)} × ${B_topall.toFixed(4)} × ${r_w.toFixed(4)}`} result={w_topwater} />
        <CalculationStep label="w_soil_rt" calculation={`${h_soil_rt.toFixed(4)} × ${B_topall.toFixed(4)} × ${soilDensity.toFixed(4)}`} result={w_soil_rt} />
        <CalculationStep label="w_soil_sub" calculation={`${h_soil_sub.toFixed(4)} × ${B_topall.toFixed(4)} × ${submergedSoilWeight.toFixed(4)}`} result={w_soil_sub} />
        <CalculationStep label="W2 (above top slab)" calculation={`${w_topadded2.toFixed(4)} + ${w_topwater.toFixed(4)} + ${w_soil_rt.toFixed(4)} + ${w_soil_sub.toFixed(4)}`} result={W2_uptopslb} />

        <CalculationStep label="w_added1_shk" calculation={`${h_topadded1.toFixed(4)} × ${B_shear.toFixed(4)} × ${r_added1.toFixed(4)} × 2`} result={w_added1_shk} />
        <CalculationStep label="w_added2_shk" calculation={`${h_topadded2.toFixed(4)} × ${B_shear.toFixed(4)} × ${r_added2_top.toFixed(4)} × 2`} result={w_added2_shk} />
        <CalculationStep label="w_shearwater" calculation={`${h_shearwater.toFixed(4)} × ${B_shear.toFixed(4)} × ${r_w.toFixed(4)} × 2`} result={w_shearwater} />
        <CalculationStep label="w_soil_rt_shk" calculation={`${h_str_rt_shk.toFixed(4)} × ${B_shear.toFixed(4)} × ${soilDensity.toFixed(4)} × 2`} result={w_soil_rt_shk} />
        <CalculationStep label="w_soil_sub_shk" calculation={`${h_shearwater.toFixed(4)} × ${B_shear.toFixed(4)} × ${submergedSoilWeight.toFixed(4)} × 2`} result={w_soil_sub_shk} />
        <CalculationStep label="W2 (above shearkey)" calculation={`${w_added1_shk.toFixed(4)} + ${w_added2_shk.toFixed(4)} + ${w_shearwater.toFixed(4)} + ${w_soil_rt_shk.toFixed(4)} + ${w_soil_sub_shk.toFixed(4)}`} result={W2_upshearkey} />

        <CalculationStep label="W2 (total)" calculation={`${w_topadded1.toFixed(4)} + ${W2_uptopslb.toFixed(4)} + ${W2_upshearkey.toFixed(4)}`} result={W2} />

        <Typography variant="h6" mt={2}>Final Results</Typography>
        <CalculationStep label="W1" calculation="Structure self-weight" result={W1} />
        <CalculationStep label="W2" calculation="Added soil and water weight" result={W2} />
        <CalculationStep label="Ps" calculation="Soil friction" result={Ps} />
        <CalculationStep label="R" calculation={`${W1.toFixed(4)} + ${W2.toFixed(4)} + ${Ps.toFixed(4)}`} result={R} />
        <CalculationStep label="U" calculation={`${h_water_bot.toFixed(4)} × ${B_botall.toFixed(4)} × ${r_w.toFixed(4)}`} result={U} />
        <CalculationStep label="FS" calculation={`${R.toFixed(4)} ÷ ${U.toFixed(4)}`} result={FS} />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default CalculationSheet;