import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { render } from '@/test/test-utils';
import Login from '.';

const mockAuthState = {
  user: null as string | null,
  handleLogin: vi.fn(),
};

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => mockAuthState,
}));

vi.mock('@/hooks/useNotification', () => ({
  useNotification: () => ({
    handleSuccess: vi.fn(),
    handleError: vi.fn(),
  }),
}));

vi.mock('@/convex/authClient', () => ({
  authClient: {
    requestPasswordReset: vi.fn(),
  },
}));

describe('Login', () => {
  it('switches to the reset-password view through an accessible button', () => {
    render(<Login />);

    fireEvent.click(screen.getByRole('button', { name: /forgot password/i }));

    expect(
      screen.getByRole('heading', { name: /reset password/i })
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^login$/i })).toBeInTheDocument();
  });
});
