import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, screen } from '@testing-library/react';

import { render } from '@/test/test-utils';
import EmployeeAvailability from './index';

const mockAuthState = {
  role: 'admin' as string | null,
};

const mockEmployees = [
  {
    id: 'employee-1',
    firstName: 'Pat',
    lastName: 'Barber',
  },
];

const mockAvailabilityData = {
  employee: {
    id: 'employee-1',
    firstName: 'Pat',
    lastName: 'Barber',
  },
  defaultHours: {
    startTime: '09:00',
    endTime: '17:00',
  },
  weekly: [],
  breaks: [],
  dateBreaks: [],
  dateBreakPolicies: [],
  overrides: [
    {
      id: 'override-1',
      date: '2026-02-09',
      isWorking: false,
      reason: 'Vacation',
    },
  ],
};

vi.mock('./AdminDateViewSection', () => ({
  default: () => <div>Admin date view</div>,
}));

vi.mock('./RecurringBreaksSection', () => ({
  default: () => <div>Recurring breaks</div>,
}));

vi.mock('./DateBreaksSection', () => ({
  default: () => <div>Date-specific blocks</div>,
}));

const mutationMock = vi.fn().mockResolvedValue({ success: true });

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => mockAuthState,
}));

vi.mock('@/hooks/useEmployeesQuery', () => ({
  useEmployeesQuery: () => ({
    employees: mockEmployees,
    isLoading: false,
  }),
}));

vi.mock('@/hooks/useNotification', () => ({
  useNotification: () => ({
    handleSuccess: vi.fn(),
    handleError: vi.fn(),
  }),
}));

vi.mock('@/convex/client', () => ({
  useQuery: () => mockAvailabilityData,
  useMutation: () => mutationMock,
}));

describe('EmployeeAvailability', () => {
  beforeEach(() => {
    mockAuthState.role = 'admin';
    mutationMock.mockClear();
  });

  it('shows the selected employee full name and lets overrides enter edit mode', () => {
    render(<EmployeeAvailability />);

    expect(screen.getAllByText('Pat Barber')).toHaveLength(2);
    fireEvent.click(screen.getByRole('button', { name: /edit/i }));

    expect(screen.getByDisplayValue('2026-02-09')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /update override/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel edit/i })).toBeInTheDocument();
    expect(screen.getByDisplayValue('Vacation')).toBeInTheDocument();
  });

  it('blocks non-employee, non-admin users', () => {
    mockAuthState.role = 'client';

    render(<EmployeeAvailability />);

    expect(screen.getByText(/not allowed/i)).toBeInTheDocument();
  });
});
