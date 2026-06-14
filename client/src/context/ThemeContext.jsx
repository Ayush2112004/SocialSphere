import React, { createContext, useState, useMemo } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

export const ColorModeContext = createContext({ toggleColorMode: () => {} });

export const AppThemeProvider = ({ children }) => {
  const [mode, setMode] = useState(localStorage.getItem('themeMode') || 'light');

  const colorMode = useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prevMode) => {
          const newMode = prevMode === 'light' ? 'dark' : 'light';
          localStorage.setItem('themeMode', newMode);
          return newMode;
        });
      },
    }),
    [],
  );

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: {
            main: '#1E88E5',
          },
          background: {
            default: mode === 'light' ? '#F5F7FA' : '#121212',
            paper: mode === 'light' ? '#FFFFFF' : '#1E1E1E',
          },
          text: {
            primary: mode === 'light' ? '#212121' : '#FFFFFF',
            secondary: mode === 'light' ? '#757575' : '#B0B0B0',
          },
          success: {
            main: '#4CAF50',
          },
        },
        typography: {
          fontFamily: '"Inter", "Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
          button: {
            textTransform: 'none',
            fontWeight: 600,
          },
          h6: {
            fontWeight: 700,
          },
        },
        shape: {
          borderRadius: 12,
        },
        components: {
          MuiButton: {
            styleOverrides: {
              root: {
                borderRadius: '24px',
                padding: '6px 16px',
              },
            },
          },
          MuiCard: {
            styleOverrides: {
              root: {
                borderRadius: '18px',
                boxShadow: mode === 'light' ? '0 4px 12px rgba(0,0,0,0.05)' : 'none',
                border: mode === 'dark' ? '1px solid #333' : 'none',
                backgroundImage: 'none',
              },
            },
          },
          MuiAppBar: {
            styleOverrides: {
              root: {
                backgroundImage: 'none',
              }
            }
          }
        },
      }),
    [mode],
  );

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
};
