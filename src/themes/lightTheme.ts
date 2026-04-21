import { createTheme } from '@mui/material/styles';

const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#ffab00',
    },
    background: {
      default: '#fafafa',
      paper: '#fff',
    },
  },
});

export default lightTheme;
