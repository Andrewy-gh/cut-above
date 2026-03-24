import type { ReactNode } from 'react';
import { Provider } from 'react-redux';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router';
import { describe, expect, it, beforeEach, vi } from 'vitest';
import { ThemeProvider, responsiveFontSizes } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { render, screen } from '@testing-library/react';

import { theme } from '@/styles/styles';
import { createTestStore } from '@/test/test-utils';
import RequireAuth from '.';

const authState = {
  session: { data: null, isPending: false },
  currentUser: null as
    | {
        id: string;
        email: string;
        role: string;
        name?: string;
        firstName?: string;
        lastName?: string;
      }
    | null
    | undefined,
};

vi.mock('@/hooks/authSessionAdapter', () => ({
  authSessionAdapter: {
    useSession: () => authState.session,
    useCurrentUser: () => authState.currentUser,
    signInEmail: vi.fn(),
    signOut: vi.fn(),
    changeEmail: vi.fn(),
    changePassword: vi.fn(),
    deleteUser: vi.fn(),
    resetPassword: vi.fn(),
  },
}));

const renderWithProviders = (ui: ReactNode, route: string, preloadedState = {}) => {
  const store = createTestStore(preloadedState);

  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <Provider store={store}>
        <MemoryRouter initialEntries={[route]}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <ThemeProvider theme={responsiveFontSizes(theme)}>{children}</ThemeProvider>
          </LocalizationProvider>
        </MemoryRouter>
      </Provider>
    );
  }

  return {
    store,
    ...render(<>{ui}</>, { wrapper: Wrapper }),
  };
};

function LoginEcho() {
  const location = useLocation();
  const state = location.state as { from?: string } | null;

  return (
    <div>
      <p>Login Page</p>
      <p data-testid="login-path">
        {location.pathname}
        {location.search}
      </p>
      <p data-testid="login-state">{state?.from ?? 'none'}</p>
    </div>
  );
}

describe('RequireAuth auth/session integration', () => {
  beforeEach(() => {
    authState.session = { data: null, isPending: false };
    authState.currentUser = null;
  });

  it('redirects unauthenticated access to login with a returnTo value', () => {
    renderWithProviders(
      <Routes>
        <Route path="/login" element={<LoginEcho />} />
        <Route element={<RequireAuth />}>
          <Route path="/account" element={<div>Account Page</div>} />
        </Route>
      </Routes>,
      '/account?tab=security#section'
    );

    expect(screen.getByText('Login Page')).toBeInTheDocument();
    expect(screen.getByTestId('login-path')).toHaveTextContent(
      '/login?returnTo=%2Faccount%3Ftab%3Dsecurity%23section'
    );
    expect(screen.getByTestId('login-state')).toHaveTextContent(
      '/account?tab=security#section'
    );
  });

  it('waits for current-user resolution before showing an admin-only route', () => {
    authState.session = {
      data: { user: { email: 'admin@example.com', name: 'Admin User' } },
      isPending: false,
    };
    authState.currentUser = undefined;

    const view = renderWithProviders(
      <Routes>
        <Route element={<RequireAuth requiredRole="admin" />}>
          <Route path="/dashboard" element={<div>Dashboard Content</div>} />
        </Route>
      </Routes>,
      '/dashboard'
    );

    expect(screen.queryByText('Dashboard Content')).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: /not allowed/i })).not.toBeInTheDocument();

    authState.currentUser = {
      id: 'user_1',
      email: 'admin@example.com',
      role: 'admin',
      name: 'Admin User',
      firstName: 'Admin',
      lastName: 'User',
    };

    view.rerender(
      <Routes>
        <Route element={<RequireAuth requiredRole="admin" />}>
          <Route path="/dashboard" element={<div>Dashboard Content</div>} />
        </Route>
      </Routes>
    );

    expect(screen.getByText('Dashboard Content')).toBeInTheDocument();
  });

  it('shows access denied when an authenticated non-admin hits an admin-only route', () => {
    authState.session = {
      data: { user: { email: 'employee@example.com', name: 'Employee User' } },
      isPending: false,
    };
    authState.currentUser = {
      id: 'user_2',
      email: 'employee@example.com',
      role: 'employee',
      name: 'Employee User',
      firstName: 'Employee',
      lastName: 'User',
    };

    renderWithProviders(
      <Routes>
        <Route element={<RequireAuth requiredRole="admin" />}>
          <Route path="/dashboard" element={<div>Dashboard Content</div>} />
        </Route>
      </Routes>,
      '/dashboard'
    );

    expect(screen.getByRole('heading', { name: /not allowed/i })).toBeInTheDocument();
    expect(screen.getByText(/restricted to admin accounts/i)).toBeInTheDocument();
    expect(screen.queryByText('Dashboard Content')).not.toBeInTheDocument();
  });
});
