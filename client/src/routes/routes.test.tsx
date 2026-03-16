import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { screen } from '@testing-library/react';
import { render } from '@/test/test-utils';
import { Routes, Route } from 'react-router';

// Public route components
import Home from '@/routes/Home';
import Login from '@/routes/Login';
import Register from '@/routes/Register';
import BookingPage from '@/routes/BookingPage';

// Protected route components
import RequireAuth from '@/routes/RequireAuth';
import Account from '@/routes/Account';
import Appointments from '@/routes/Appointments';
import AppointmentPage from '@/routes/AppointmentPage';

const mockAuthState = {
  user: null as string | null,
  role: null as string | null,
  isAuthLoading: false,
  handleLogin: vi.fn(),
  handleLogout: vi.fn(),
  handleUserEmailChange: vi.fn(),
  handleUserPasswordChange: vi.fn(),
  handleUserDelete: vi.fn(),
  handleUserPasswordReset: vi.fn(),
};

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => mockAuthState,
}));

// Suppress console.error for expected errors
const originalError = console.error;
beforeEach(() => {
  console.error = (...args: unknown[]) => {
    const msg = args[0]?.toString() || '';
    if (
      msg.includes('Consider adding an error boundary')
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
  mockAuthState.user = null;
  mockAuthState.role = null;
  mockAuthState.isAuthLoading = false;
});
afterEach(() => {
  console.error = originalError;
});

vi.mock('@/convex/client', () => ({
  useMutation: () => vi.fn().mockResolvedValue({ success: true, message: 'ok' }),
  useQuery: () => undefined,
}));

vi.mock('@/features/employeeSlice', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/features/employeeSlice')>();
  return {
    ...actual,
    useGetEmployeesQuery: () => ({ data: [], isLoading: false, isSuccess: true }),
  };
});

vi.mock('@/hooks/useEmployeesQuery', () => ({
  useEmployeesQuery: () => ({ employees: [], isLoading: false }),
}));

vi.mock('@/hooks/useScheduleQuery', () => ({
  useScheduleQuery: () => ({ schedule: null, isLoading: false }),
}));

vi.mock('@/hooks/useFilter', () => ({
  useFilter: () => ({
    date: '2024-01-01',
    employee: 'any',
    selection: {},
    service: { id: 1, name: 'Haircut', duration: 30 },
    services: [
      { id: 1, name: 'Haircut', duration: 30 },
      { id: 2, name: 'Shave', duration: 15 },
    ],
    handleSelectionChange: vi.fn(),
    handleEmployeeChange: vi.fn(),
    handleServiceChange: vi.fn(),
    handleDateChange: vi.fn(),
  }),
}));

vi.mock('@/hooks/useBooking', () => ({
  useBooking: () => ({
    handleBooking: vi.fn(),
  }),
}));

// Mock CSS modules
vi.mock('@/routes/Home/Hero/styles.module.css', () => ({ default: {} }));
vi.mock('@/routes/Home/Services/styles.module.css', () => ({ default: {} }));
vi.mock('@/routes/Home/ContactUs/styles.module.css', () => ({ default: {} }));
vi.mock('@/routes/Home/TeamMembers/styles.module.css', () => ({ default: {} }));
vi.mock('@/routes/Login/styles.module.css', () => ({ default: {} }));
vi.mock('@/routes/Register/styles.module.css', () => ({ default: {} }));
vi.mock('@/routes/BookingPage/styles.module.css', () => ({ default: {} }));
vi.mock('@/routes/Layout/styles.module.css', () => ({ default: {} }));
vi.mock('@/routes/Account/styles.module.css', () => ({ default: {} }));
vi.mock('@/components/Navbar/styles.module.css', () => ({ default: {} }));
vi.mock('@/components/Footer/styles.module.css', () => ({ default: {} }));

describe('Public Routes', () => {
  it('renders Home page', () => {
    render(<Home />);
    expect(screen.getByText(/Experience a Cut Above/i)).toBeInTheDocument();
  });

  it('renders Login page', () => {
    render(<Login />);
    expect(screen.getByRole('heading', { name: /log in/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
  });

  it('renders Register page', () => {
    render(<Register />);
    expect(screen.getByRole('heading', { name: /sign up/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
  });

  it('renders BookingPage', () => {
    render(<BookingPage />);
    expect(screen.getByText(/schedule your appointment/i)).toBeInTheDocument();
  });
});

describe('Protected Routes - Unauthenticated', () => {
  it('redirects to login when not authenticated', () => {
    const TestRoutes = () => (
      <Routes>
        <Route path="/login" element={<div>Login Page</div>} />
        <Route element={<RequireAuth />}>
          <Route path="/account" element={<Account />} />
        </Route>
      </Routes>
    );

    render(<TestRoutes />, { route: '/account' });
    expect(screen.getByText('Login Page')).toBeInTheDocument();
  });
});

describe('Protected Routes - Authenticated', () => {
  it('renders Account page when authenticated', () => {
    mockAuthState.user = 'test@example.com';
    mockAuthState.role = 'user';
    const TestRoutes = () => (
      <Routes>
        <Route element={<RequireAuth />}>
          <Route path="/account" element={<Account />} />
        </Route>
      </Routes>
    );

    render(<TestRoutes />, { route: '/account' });

    expect(screen.getByText(/welcome test@example.com/i)).toBeInTheDocument();
    expect(screen.getByText(/account page/i)).toBeInTheDocument();
  });

  it('shows admin links for admin users', () => {
    mockAuthState.user = 'admin@example.com';
    mockAuthState.role = 'admin';
    const TestRoutes = () => (
      <Routes>
        <Route element={<RequireAuth />}>
          <Route path="/account" element={<Account />} />
        </Route>
      </Routes>
    );

    render(<TestRoutes />, { route: '/account' });

    expect(screen.getByText(/schedule dashboard/i)).toBeInTheDocument();
    expect(screen.getByText(/add a new schedule/i)).toBeInTheDocument();
  });

  it('hides admin links for non-admin users', () => {
    mockAuthState.user = 'user@example.com';
    mockAuthState.role = 'user';
    const TestRoutes = () => (
      <Routes>
        <Route element={<RequireAuth />}>
          <Route path="/account" element={<Account />} />
        </Route>
      </Routes>
    );

    render(<TestRoutes />, { route: '/account' });

    expect(screen.queryByText(/schedule dashboard/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/add a new schedule/i)).not.toBeInTheDocument();
  });
});

describe('Admin Routes', () => {
  it('shows access denied for non-admin accessing admin routes', () => {
    mockAuthState.user = 'user@example.com';
    mockAuthState.role = 'user';
    const TestRoutes = () => (
      <Routes>
        <Route element={<RequireAuth requiredRole="admin" />}>
          <Route path="/dashboard" element={<div>Dashboard</div>} />
        </Route>
      </Routes>
    );

    render(<TestRoutes />, { route: '/dashboard' });
    expect(screen.getByText(/not allowed/i)).toBeInTheDocument();
  });

  it('allows admin to access admin routes', () => {
    mockAuthState.user = 'admin@example.com';
    mockAuthState.role = 'admin';
    const TestRoutes = () => (
      <Routes>
        <Route element={<RequireAuth requiredRole="admin" />}>
          <Route path="/dashboard" element={<div>Dashboard Content</div>} />
        </Route>
      </Routes>
    );

    render(<TestRoutes />, { route: '/dashboard' });

    expect(screen.getByText('Dashboard Content')).toBeInTheDocument();
  });
});

describe('Route Navigation', () => {
  it('Home page has link to bookings', () => {
    render(<Home />);
    const bookingLink = screen.getByRole('link', { name: /schedule an appointment/i });
    expect(bookingLink).toHaveAttribute('href', '/bookings');
  });

  it('Account page has links to settings and appointments', () => {
    mockAuthState.user = 'test@example.com';
    mockAuthState.role = 'client';
    const TestRoutes = () => (
      <Routes>
        <Route element={<RequireAuth />}>
          <Route path="/account" element={<Account />} />
        </Route>
      </Routes>
    );

    render(<TestRoutes />, { route: '/account' });

    expect(screen.getByRole('link', { name: /account settings/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /view your appointments/i })).toBeInTheDocument();
  });

  it('Account page hides appointments link for admin', () => {
    mockAuthState.user = 'admin@example.com';
    mockAuthState.role = 'admin';
    const TestRoutes = () => (
      <Routes>
        <Route element={<RequireAuth />}>
          <Route path="/account" element={<Account />} />
        </Route>
      </Routes>
    );

    render(<TestRoutes />, { route: '/account' });

    expect(
      screen.queryByRole('link', { name: /view your appointments/i })
    ).not.toBeInTheDocument();
  });
});

describe('Admin Restrictions', () => {
  it('prevents admin from viewing client appointments page', () => {
    mockAuthState.user = 'admin@example.com';
    mockAuthState.role = 'admin';

    const TestRoutes = () => (
      <Routes>
        <Route element={<RequireAuth />}>
          <Route path="/account/appointments" element={<Appointments />} />
        </Route>
      </Routes>
    );

    render(<TestRoutes />, { route: '/account/appointments' });
    expect(screen.getByText(/not allowed/i)).toBeInTheDocument();
  });

  it('prevents admin from viewing appointment deep link', () => {
    mockAuthState.user = 'admin@example.com';
    mockAuthState.role = 'admin';

    const TestRoutes = () => (
      <Routes>
        <Route element={<RequireAuth />}>
          <Route path="/appointment/:id" element={<AppointmentPage />} />
        </Route>
      </Routes>
    );

    render(<TestRoutes />, { route: '/appointment/123' });
    expect(screen.getByText(/not allowed/i)).toBeInTheDocument();
  });
});
