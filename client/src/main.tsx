import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';

// @ts-expect-error TS(2307): Cannot find module '@/App.jsx' or its correspondin... Remove this comment to see the full error message
import App from '@/App.jsx';
import '@/index.css';

// @ts-expect-error TS(2307): Cannot find module '@/app/store.js' or its corresp... Remove this comment to see the full error message
import { store, persistor } from '@/app/store.js';
import { Provider } from 'react-redux';

import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { CssBaseline, ThemeProvider, responsiveFontSizes } from '@mui/material';

// @ts-expect-error TS(2307): Cannot find module '@/styles/styles.js' or its cor... Remove this comment to see the full error message
import { theme } from '@/styles/styles.js';

import { PersistGate } from 'redux-persist/integration/react';


// @ts-expect-error TS(2345): Argument of type 'HTMLElement | null' is not assig... Remove this comment to see the full error message
ReactDOM.createRoot(document.getElementById('root')).render(
  <StrictMode>
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
  </StrictMode>
);
