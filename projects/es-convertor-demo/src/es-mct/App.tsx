import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './theme';
import { ConverterProvider } from './context/ConverterContext';
import { AppLayout } from './components/layout';

export default function EsMctApp() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ConverterProvider>
        <AppLayout />
      </ConverterProvider>
    </ThemeProvider>
  );
}
