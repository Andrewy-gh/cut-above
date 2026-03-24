import { fireEvent, screen } from '@testing-library/react';
import { Route, Routes } from 'react-router';
import { describe, expect, it, vi } from 'vitest';
import { render } from '@/test/test-utils';
import DashboardAppointment from '.';

const mockUseScheduleDetailQuery = vi.fn();

vi.mock('@/hooks/useScheduleDetailQuery', () => ({
  useScheduleDetailQuery: (...args: unknown[]) => mockUseScheduleDetailQuery(...args),
}));

vi.mock('./UpdateApptStatus', () => ({
  default: () => <button type="button">mock update status</button>,
}));

vi.mock('@/components/ApptCard/ApptButton/CancelAppointment', () => ({
  default: () => <button type="button">mock cancel</button>,
}));

describe('DashboardAppointment', () => {
  it('shows cancelled appointments in a dedicated admin card', () => {
    mockUseScheduleDetailQuery.mockReturnValue({
      schedule: {
        id: 'schedule-1',
        open: '2026-03-17T12:00:00.000Z',
        close: '2026-03-17T21:00:00.000Z',
      },
      appointments: [
        {
          id: 'appt-scheduled',
          start: '2026-03-17T13:00:00.000Z',
          service: 'Haircut',
          status: 'scheduled',
          client: { id: 'client-1', firstName: 'Jordan' },
          employee: { id: 'emp-1', firstName: 'Andre' },
        },
        {
          id: 'appt-cancelled',
          start: '2026-03-17T14:00:00.000Z',
          service: 'Beard Trim',
          status: 'cancelled',
          client: { id: 'client-2', firstName: 'Chris' },
          employee: { id: 'emp-2', firstName: 'Obi' },
        },
      ],
    });

    render(
      <Routes>
        <Route path="/dashboard/:id" element={<DashboardAppointment />} />
      </Routes>,
      { route: '/dashboard/schedule-1' },
    );

    expect(screen.getByText('Jordan')).toBeInTheDocument();
    expect(
      screen.getByRole('textbox', { name: /search client name/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('combobox', { name: /filter by service/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('combobox', { name: /filter by barber/i })
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /cancelled/i }));

    expect(screen.getByText('Chris')).toBeInTheDocument();
    expect(screen.getByText('No further action')).toBeInTheDocument();
    expect(screen.queryByText('mock update status')).not.toBeInTheDocument();
    expect(screen.queryByText('mock cancel')).not.toBeInTheDocument();
  });
});
