import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { screen } from '@testing-library/react';
import { render } from '@/test/test-utils';
import { Routes, Route } from 'react-router-dom';

// Public route components
import Home from '@/routes/Home';
import Login from '@/routes/Login';
import Register from '@/routes/Register';
import BookingPage from '@/routes/BookingPage';

// Protected route components
import RequireAuth from '@/routes/RequireAuth';
import Account from '@/routes/Account';

// Suppress console.error for expected errors
const originalError = console.error;
beforeEach(() => {
  console.error = (...args: unknown[]) => {
    const msg = args[0]?.toString() || '';
    if (
      msg.includes('Not authorized') ||
      msg.includes('Consider adding an error boundary')
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});
afterEach(() => {
  console.error = originalError;
});

// Mock RTK Query hooks to prevent API calls
vi.mock('@/features/auth/authApiSlice', () => ({
  useLoginMutation: () => [vi.fn(), { isLoading: false }],
  useLogoutMutation: () => [vi.fn(), { isLoading: false }],
  useRegisterAccountMutation: () => [vi.fn(), { isLoading: false }],
  useChangeUserEmailMutation: () => [vi.fn(), { isLoading: false }],
  useChangeUserPasswordMutation: () => [vi.fn(), { isLoading: false }],
  useDeleteUserMutation: () => [vi.fn(), { isLoading: false }],
  useResetUserPasswordMutation: () => [vi.fn(), { isLoading: false }],
}));

vi.mock('@/features/emailSlice', () => ({
  useSendPasswordResetMutation: () => [vi.fn(), { isLoading: false }],
  useSendMessageResponseMutation: () => [vi.fn(), { isLoading: false }],
}));

vi.mock('@/features/employeeSlice', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/features/employeeSlice')>();
  return {
    ...actual,
    useGetEmployeesQuery: () => ({ data: [], isLoading: false, isSuccess: true }),
    useGetEmployeesProfilesQuery: () => ({ data: [], isLoading: false, isSuccess: true }),
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
    const TestRoutes = () => (
      <Routes>
        <Route element={<RequireAuth />}>
          <Route path="/account" element={<Account />} />
        </Route>
      </Routes>
    );

    render(<TestRoutes />, {
      route: '/account',
      preloadedState: {
        auth: { user: 'test@example.com', role: 'user' },
      },
    });

    expect(screen.getByText(/welcome test@example.com/i)).toBeInTheDocument();
    expect(screen.getByText(/account page/i)).toBeInTheDocument();
  });

  it('shows admin links for admin users', () => {
    const TestRoutes = () => (
      <Routes>
        <Route element={<RequireAuth />}>
          <Route path="/account" element={<Account />} />
        </Route>
      </Routes>
    );

    render(<TestRoutes />, {
      route: '/account',
      preloadedState: {
        auth: { user: 'admin@example.com', role: 'admin' },
      },
    });

    expect(screen.getByText(/schedule dashboard/i)).toBeInTheDocument();
    expect(screen.getByText(/add a new schedule/i)).toBeInTheDocument();
  });

  it('hides admin links for non-admin users', () => {
    const TestRoutes = () => (
      <Routes>
        <Route element={<RequireAuth />}>
          <Route path="/account" element={<Account />} />
        </Route>
      </Routes>
    );

    render(<TestRoutes />, {
      route: '/account',
      preloadedState: {
        auth: { user: 'user@example.com', role: 'user' },
      },
    });

    expect(screen.queryByText(/schedule dashboard/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/add a new schedule/i)).not.toBeInTheDocument();
  });
});

describe('Admin Routes', () => {
  it('throws error for non-admin accessing admin routes', () => {
    const TestRoutes = () => (
      <Routes>
        <Route element={<RequireAuth requiredRole="admin" />}>
          <Route path="/dashboard" element={<div>Dashboard</div>} />
        </Route>
      </Routes>
    );

    expect(() => {
      render(<TestRoutes />, {
        route: '/dashboard',
        preloadedState: {
          auth: { user: 'user@example.com', role: 'user' },
        },
      });
    }).toThrow('Not authorized');
  });

  it('allows admin to access admin routes', () => {
    const TestRoutes = () => (
      <Routes>
        <Route element={<RequireAuth requiredRole="admin" />}>
          <Route path="/dashboard" element={<div>Dashboard Content</div>} />
        </Route>
      </Routes>
    );

    render(<TestRoutes />, {
      route: '/dashboard',
      preloadedState: {
        auth: { user: 'admin@example.com', role: 'admin' },
      },
    });

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
    const TestRoutes = () => (
      <Routes>
        <Route element={<RequireAuth />}>
          <Route path="/account" element={<Account />} />
        </Route>
      </Routes>
    );

    render(<TestRoutes />, {
      route: '/account',
      preloadedState: {
        auth: { user: 'test@example.com', role: 'user' },
      },
    });

    expect(screen.getByRole('link', { name: /account settings/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /view your appointments/i })).toBeInTheDocument();
  });
});
