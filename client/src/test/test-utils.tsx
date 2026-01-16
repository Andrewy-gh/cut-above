import { ReactElement, ReactNode } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { MemoryRouter } from 'react-router-dom';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { ThemeProvider, responsiveFontSizes } from '@mui/material';
import { theme } from '@/styles/styles';

import { apiSlice } from '@/app/api/apiSlice';
import appointmentReducer from '@/features/appointments/appointmentSlice';
import authReducer from '@/features/auth/authSlice';
import filterReducer from '@/features/filterSlice';
import notificationReducer from '@/features/notificationSlice';

interface ExtendedRenderOptions extends Omit<RenderOptions, 'queries'> {
  preloadedState?: Record<string, unknown>;
  route?: string;
}

export function createTestStore(preloadedState: Record<string, unknown> = {}) {
  return configureStore({
    reducer: {
      [apiSlice.reducerPath]: apiSlice.reducer,
      appointment: appointmentReducer,
      auth: authReducer,
      filter: filterReducer,
      notification: notificationReducer,
    },
    preloadedState,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: false,
      }).concat(apiSlice.middleware),
  });
}

// eslint-disable-next-line react-refresh/only-export-components
function AllProviders({
  children,
  store,
  route = '/',
}: {
  children: ReactNode;
  store: ReturnType<typeof createTestStore>;
  route?: string;
}) {
  return (
    <Provider store={store}>
      <MemoryRouter initialEntries={[route]}>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <ThemeProvider theme={responsiveFontSizes(theme)}>
            {children}
          </ThemeProvider>
        </LocalizationProvider>
      </MemoryRouter>
    </Provider>
  );
}

export function renderWithProviders(
  ui: ReactElement,
  {
    preloadedState = {},
    route = '/',
    ...renderOptions
  }: ExtendedRenderOptions = {}
) {
  const store = createTestStore(preloadedState);

  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <AllProviders store={store} route={route}>
        {children}
      </AllProviders>
    );
  }

  return { store, ...render(ui, { wrapper: Wrapper, ...renderOptions }) };
}

// eslint-disable-next-line react-refresh/only-export-components
export * from '@testing-library/react';
export { renderWithProviders as render };
