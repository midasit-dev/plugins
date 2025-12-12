/**
 * @fileoverview
 * 시스템 스타일 설정을 위한 패널 컴포넌트.
 * 표시 스타일(Default, Fixed 등)과 소수점 자릿수를 설정할 수 있는
 * UI를 제공합니다. MUI의 Paper 컴포넌트를 기반으로 구현되었으며,
 * FormControl과 TextField 컴포넌트를 사용합니다.
 */

import {
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Box,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import {
  SystemStyleProps,
  DEFAULT_SETTINGS_SYSTEMSTYLE,
} from "../types/panels";

const SystemStyle: React.FC<SystemStyleProps> = ({
  value = DEFAULT_SETTINGS_SYSTEMSTYLE,
  onChange,
}) => {
  // 로컬 상태 관리
  const [style, setStyle] = useState(value.style);
  const [decimalPlaces, setDecimalPlaces] = useState(value.decimalPlaces);

  // props 변경 시 로컬 상태 동기화
  useEffect(() => {
    setStyle(value.style);
    setDecimalPlaces(value.decimalPlaces);
  }, [value]);

  // 스타일 변경 핸들러
  const handleStyleChange = (e: any) => {
    const newStyle = e.target.value;
    setStyle(newStyle);
    onChange({
      style: newStyle,
      decimalPlaces,
    });
  };

  // 소수점 자릿수 변경 핸들러
  const handleDecimalPlacesChange = (e: any) => {
    const newDecimalPlaces = parseInt(e.target.value) || 0;
    setDecimalPlaces(newDecimalPlaces);
    onChange({
      style,
      decimalPlaces: newDecimalPlaces,
    });
  };

  // 스타일 선택 옵션 정의
  const styleOptions = ["Default", "Fixed", "Scientific", "General"];

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
        Styles
      </Typography>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <FormControl>
          <InputLabel id="style-select-label">Style</InputLabel>
          <Select
            labelId="style-select-label"
            value={style}
            label="Style"
            onChange={handleStyleChange}
            size="small"
          >
            {styleOptions.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          label="Decimal Places"
          type="number"
          value={decimalPlaces}
          onChange={handleDecimalPlacesChange}
          size="small"
          InputProps={{
            inputProps: {
              min: 0,
              max: 10,
            },
          }}
        />
      </Box>
    </Paper>
  );
};

export default SystemStyle;
