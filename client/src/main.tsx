import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';

import App from '@/App';
import '@/index.css';

import { store, persistor } from '@/app/store';
import { Provider } from 'react-redux';

import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { CssBaseline, ThemeProvider, responsiveFontSizes } from '@mui/material';

import { theme } from '@/styles/styles';

import { PersistGate } from 'redux-persist/integration/react';
import ErrorBoundary from '@/components/ErrorBoundary';
import ConvexConnectionBoundary from '@/components/ConvexConnectionBoundary';
import { ConvexProvider, convexClient } from '@/convex/client';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <ConvexProvider client={convexClient}>
        <ConvexConnectionBoundary>
          <Provider store={store}>
            <PersistGate loading={null} persistor={persistor}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <ThemeProvider theme={responsiveFontSizes(theme)}>
                  <CssBaseline />
                  <App />
                </ThemeProvider>
              </LocalizationProvider>
            </PersistGate>
          </Provider>
        </ConvexConnectionBoundary>
      </ConvexProvider>
    </ErrorBoundary>
  </StrictMode>
);
