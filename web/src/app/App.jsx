import './App.css';

import ThemeOptions from './theme';
import { Container, CssBaseline, createTheme } from '@mui/material';
import { ThemeProvider } from '@emotion/react';
import { Outlet } from 'react-router-dom';
import AppHeader from '../components/AppHeader';
import ApplicationProviders from '../providers/ApplicationProvider'

const lightTheme = createTheme(ThemeOptions("light"))

function App() {
  return (
    <ThemeProvider theme={lightTheme}>
      <ApplicationProviders>
        <Container>
          <CssBaseline />
          <AppHeader />
          <Container sx={{ pt: 20 }}>
            <Outlet />
          </Container>
        </Container>
      </ApplicationProviders>
    </ThemeProvider>
  );
}

export default App;
