import React from "react";
import {
  FormControlLabel,
  Radio,
  RadioGroup,
  Typography,
  Paper,
} from "@mui/material";
import {
  StoryStiffnessMethodProps,
  StoryStiffnessMethodSettings,
  DEFAULT_SETTINGS_STORYSTIFFNESSMETHOD,
} from "../types/panels";

const StoryStiffnessMethod: React.FC<StoryStiffnessMethodProps> = ({
  value = DEFAULT_SETTINGS_STORYSTIFFNESSMETHOD,
  onChange,
}) => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange({
      method: event.target.value as StoryStiffnessMethodSettings["method"],
    });
  };

  return (
    <Paper
      sx={{ display: "flex", flexDirection: "column", p: 2, height: "100%" }}
    >
      <Typography variant="h2" sx={{ mb: 2 }}>
        Story Stiffness Method
      </Typography>
      <RadioGroup value={value.method} onChange={handleChange}>
        <FormControlLabel
          value="1 / story drift ratio"
          control={<Radio />}
          label="1 / Story Drift Ratio"
        />
        <FormControlLabel
          value="story shear / story drift"
          control={<Radio />}
          label="Story Shear / Story Drift"
        />
      </RadioGroup>
    </Paper>
  );
};

export default StoryStiffnessMethod;
