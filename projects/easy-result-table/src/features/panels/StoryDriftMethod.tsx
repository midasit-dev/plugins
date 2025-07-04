import React from "react";
import {
  FormControlLabel,
  Radio,
  RadioGroup,
  Typography,
  Paper,
} from "@mui/material";
import {
  StoryDriftMethodProps,
  StoryDriftMethodSettings,
  DEFAULT_SETTINGS_STORDRIFTMETHOD,
} from "../types/panels";

const StoryDriftMethod: React.FC<StoryDriftMethodProps> = ({
  value = DEFAULT_SETTINGS_STORDRIFTMETHOD,
  onChange,
}) => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange({
      method: event.target.value as StoryDriftMethodSettings["method"],
    });
  };

  return (
    <Paper
      sx={{ display: "flex", flexDirection: "column", p: 2, height: "100%" }}
    >
      <Typography variant="h2" sx={{ mb: 2 }}>
        Story Drift Method
      </Typography>
      <RadioGroup value={value.method} onChange={handleChange}>
        <FormControlLabel
          value="center"
          control={<Radio />}
          label="Drift at the Center of Mass"
        />
        <FormControlLabel
          value="outer"
          control={<Radio />}
          label="Max. Drift of Outer Extreme Points"
        />
        <FormControlLabel
          value="vertical"
          control={<Radio />}
          label="Max. Drift of All Vertical Elements"
        />
      </RadioGroup>
    </Paper>
  );
};

export default StoryDriftMethod;
