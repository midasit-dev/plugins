/**
 * @fileoverview
 * 시스템 단위 설정을 위한 패널 컴포넌트.
 * 힘(Force)과 거리(Distance) 단위를 설정할 수 있는 UI를 제공합니다.
 * MUI의 Paper 컴포넌트를 기반으로 구현되었으며,
 * FormControl과 Select 컴포넌트를 사용합니다.
 */

import {
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Box,
} from "@mui/material";
import { useEffect, useState } from "react";
import { SystemUnitProps, DEFAULT_SETTINGS_SYSTEMUNIT } from "../types/panels";

const SystemUnit: React.FC<SystemUnitProps> = ({
  value = DEFAULT_SETTINGS_SYSTEMUNIT,
  onChange,
}) => {
  // 로컬 상태 관리
  const [force, setForce] = useState(value.force);
  const [distance, setDistance] = useState(value.distance);

  // props 변경 시 로컬 상태 동기화
  useEffect(() => {
    setForce(value.force);
    setDistance(value.distance);
  }, [value]);

  // 힘 단위 변경 핸들러
  const handleForceChange = (e: any) => {
    const newForce = e.target.value;
    setForce(newForce);
    onChange({
      force: newForce,
      distance,
    });
  };

  // 거리 단위 변경 핸들러
  const handleDistanceChange = (e: any) => {
    const newDistance = e.target.value;
    setDistance(newDistance);
    onChange({
      force,
      distance: newDistance,
    });
  };

  // 거리 단위 선택 옵션
  const distanceOptions = ["mm", "cm", "m", "in", "ft"];

  // 힘 단위 선택 옵션
  const forceOptions = ["kgf", "tonf", "N", "kN", "lbf", "kips"];

  return (
    <Paper
      sx={{
        display: "flex",
        flexDirection: "column",
        p: 2,
        height: "100%",
      }}
    >
      <Typography variant="h2" sx={{ mb: 4 }}>
        Units
      </Typography>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <FormControl>
          <InputLabel id="force-select-label">Force</InputLabel>
          <Select
            labelId="force-select-label"
            value={force}
            label="Force"
            onChange={handleForceChange}
            size="small"
          >
            {forceOptions.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl>
          <InputLabel id="distance-select-label">Distance</InputLabel>
          <Select
            labelId="distance-select-label"
            value={distance}
            label="Distance"
            onChange={handleDistanceChange}
            size="small"
          >
            {distanceOptions.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
    </Paper>
  );
};

export default SystemUnit;
