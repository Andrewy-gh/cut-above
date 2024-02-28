import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import App from '@/App.jsx';
import '@/index.css';
import { store, persistor } from '@/app/store.js';
import { Provider } from 'react-redux';

import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { CssBaseline, ThemeProvider, responsiveFontSizes } from '@mui/material';
import { theme } from '@/styles/styles.js';

import { PersistGate } from 'redux-persist/integration/react';

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
