import React from "react";
import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
  Paper,
} from "@mui/material";
import { SelectChangeEvent } from "@mui/material/Select";

import {
  AngleSettingProps,
  DEFAULT_SETTINGS_ANGLESETTING,
} from "../types/panels";

const AngleSetting: React.FC<AngleSettingProps> = ({
  value = DEFAULT_SETTINGS_ANGLESETTING,
  onChange,
}) => {
  const handleChange = (event: SelectChangeEvent<number>) => {
    onChange({
      angle: event.target.value as number,
    });
  };

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
        Angle Setting
      </Typography>
      <FormControl>
        <InputLabel id="angle-select-label">Angle</InputLabel>
        <Select
          labelId="angle-select-label"
          id="angle-select"
          value={value.angle}
          label="Angle"
          onChange={handleChange}
          size="small"
        >
          <MenuItem value={0}>0°</MenuItem>
          <MenuItem value={90}>90°</MenuItem>
        </Select>
      </FormControl>
    </Paper>
  );
};

export default AngleSetting;
