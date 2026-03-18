import { ReactElement, ReactNode } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { MemoryRouter } from 'react-router';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { ThemeProvider, responsiveFontSizes } from '@mui/material';
import { theme } from '@/styles/styles';

import appointmentReducer from '@/features/appointments/appointmentSlice';
import appointmentsReducer from '@/features/appointments/apptApiSlice';
import authReducer from '@/features/auth/authSlice';
import employeesReducer from '@/features/employeeSlice';
import filterReducer from '@/features/filterSlice';
import notificationReducer from '@/features/notificationSlice';

interface ExtendedRenderOptions extends Omit<RenderOptions, 'queries'> {
  preloadedState?: Record<string, unknown>;
  route?: string;
}

export function createTestStore(preloadedState: Record<string, unknown> = {}) {
  const rootReducer = combineReducers({
    appointment: appointmentReducer,
    appointments: appointmentsReducer,
    auth: authReducer,
    employees: employeesReducer,
    filter: filterReducer,
    notification: notificationReducer,
  });

  return configureStore({
    reducer: rootReducer,
    preloadedState,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: false,
      }),
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
