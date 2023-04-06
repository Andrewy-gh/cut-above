import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#629aa4',
      light: '#26C4E0',
      dark: '#037E94',
      contrastText: '#614E23',
    },
    secondary: {
      main: '#E0A00D',
      light: '#E6B953',
      dark: '#614E23',
    },
  },
  typography: {
    allVariants: {
      color: '#E6B953',
    },
    h1: {
      fontFamily: 'Corben',
      fontWeight: 700,
    },
    h2: {
      fontFamily: 'Corben',
      fontWeight: 700,
    },
    h3: {
      fontFamily: 'Corben',
      fontWeight: 700,
    },
    h4: {
      fontFamily: 'Corben',
      fontWeight: 700,
    },
    h5: {
      fontFamily: 'Corben',
      fontWeight: 700,
    },
    h6: {
      fontFamily: 'Corben',
      fontWeight: 700,
    },
    body1: {
      fontFamily: 'Nobile',
      // fontWeight: 500,
    },
    body2: {
      fontFamily: 'Nobile',
      // fontWeight: 500,
    },
    button: {
      fontFamily: 'Corben',
      fontWeight: 700,
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: (themeParam) => `
        a {
          color: inherit;
          text-decoration: none;
        }
        a:visited {
          color: inherit;
          text-decoration: none;
        }
      `,
    },
  },
});
