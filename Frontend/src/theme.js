import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#222222',
    },
    secondary: {
      main: '#c82021',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          backgroundColor: 'transparent',
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: 'rgba(0, 0, 0, 0.23)',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: 'rgba(0, 0, 0, 0.87)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          '&.MuiMenu-paper': {
            backgroundColor: 'transparent',
            backdropFilter: 'blur(8px)',
          },
        },
      },
    },
    MuiSlider: {
      styleOverrides: {
        root: {
          color: '#222222',
          backgroundColor: 'transparent',
        },
        thumb: {
          height: 16,
          width: 16,
          backgroundColor: '#fff',
          border: '2px solid currentColor',
          '&:hover': {
            boxShadow: '0 0 0 8px rgba(34, 34, 34, 0.16)',
          },
        },
        track: {
          height: 4,
          backgroundColor: 'currentColor',
        },
        rail: {
          height: 4,
          opacity: 0.5,
          backgroundColor: '#bfbfbf',
        },
        valueLabel: {
          backgroundColor: '#222222',
        },
      },
    },
  },
});

export default theme;