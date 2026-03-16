import { describe, it, expect, vi, beforeEach } from 'vitest';
import { act, renderHook } from '@testing-library/react';

import { useBooking } from './useBooking';

const mocks = vi.hoisted(() => ({
  addMutation: vi.fn(),
  modifyMutation: vi.fn(),
  modifyManagedMutation: vi.fn(),
  handleEndRescheduling: vi.fn(),
  handleFilterReset: vi.fn(),
  handleSuccess: vi.fn(),
  handleError: vi.fn(),
}));

vi.mock('@/features/appointments/apptApiSlice', () => ({
  useAddAppointmentMutation: () => [mocks.addMutation],
  useModifyAppointmentMutation: () => [mocks.modifyMutation],
  useModifyManagedAppointmentMutation: () => [mocks.modifyManagedMutation],
}));

vi.mock('@/hooks/useAppointment', () => ({
  useAppointment: () => ({
    handleEndRescheduling: mocks.handleEndRescheduling,
  }),
}));

vi.mock('@/hooks/useFilter', () => ({
  useFilter: () => ({
    handleFilterReset: mocks.handleFilterReset,
  }),
}));

vi.mock('@/hooks/useNotification', () => ({
  useNotification: () => ({
    handleSuccess: mocks.handleSuccess,
    handleError: mocks.handleError,
  }),
}));

const baseBooking = {
  start: '2025-01-01T15:00:00.000Z',
  end: '2025-01-01T16:00:00.000Z',
  service: 'Cut',
  employee: { id: 'emp-1', firstName: 'Pat' },
};

describe('useBooking', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('surfaces schedule conflict errors', async () => {
    const error = new Error('Time slot conflicts with existing appointment');
    mocks.addMutation.mockRejectedValueOnce(error);

    const { result } = renderHook(() => useBooking());

    await act(async () => {
      await result.current.handleBooking(baseBooking);
    });

    expect(mocks.handleError).toHaveBeenCalledWith(error);
  });

  it('surfaces invalid employee selection errors', async () => {
    const error = new Error('Invalid employee');
    mocks.addMutation.mockRejectedValueOnce(error);

    const { result } = renderHook(() => useBooking());

    await act(async () => {
      await result.current.handleBooking(baseBooking);
    });

    expect(mocks.handleError).toHaveBeenCalledWith(error);
  });

  it('surfaces unauthorized booking errors', async () => {
    const error = new Error('Not authenticated');
    mocks.addMutation.mockRejectedValueOnce(error);

    const { result } = renderHook(() => useBooking());

    await act(async () => {
      await result.current.handleBooking(baseBooking);
    });

    expect(mocks.handleError).toHaveBeenCalledWith(error);
  });

  it('uses the scoped mutation when a manage token is provided', async () => {
    mocks.modifyManagedMutation.mockResolvedValueOnce({
      success: true,
      message: 'Appointment successfully updated',
    });

    const { result } = renderHook(() => useBooking());

    await act(async () => {
      await result.current.handleBooking({
        ...baseBooking,
        token: 'a'.repeat(64),
      });
    });

    expect(mocks.modifyManagedMutation).toHaveBeenCalledWith({
      token: 'a'.repeat(64),
      ...baseBooking,
    });
    expect(mocks.handleSuccess).toHaveBeenCalledWith(
      'Appointment successfully updated'
    );
  });
});
