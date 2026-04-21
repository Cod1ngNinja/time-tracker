import { createTheme } from '@mui/material/styles';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#ffab00',
    },
    background: {
      default: '#121212',
      paper: '#181818',
    },
  },
});

export default darkTheme;
