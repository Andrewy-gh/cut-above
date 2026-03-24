import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createBookingOrchestrator } from './useBooking';

const baseBooking = {
  start: '2025-01-01T15:00:00.000Z',
  end: '2025-01-01T16:00:00.000Z',
  service: 'Cut',
  employee: { id: 'emp-1', firstName: 'Pat' },
};

describe('useBooking', () => {
  const createDeps = () => ({
    addAppointment: vi.fn(),
    modifyAppointment: vi.fn(),
    modifyManagedAppointment: vi.fn(),
    handleEndRescheduling: vi.fn(),
    handleFilterReset: vi.fn(),
    handleSuccess: vi.fn(),
    handleError: vi.fn(),
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('clears filters after a successful new booking', async () => {
    const deps = createDeps();
    deps.addAppointment.mockResolvedValueOnce({
      success: true,
      message: 'Appointment successfully created',
    });

    const booking = createBookingOrchestrator(deps);

    await booking.handleBooking(baseBooking);

    expect(deps.handleSuccess).toHaveBeenCalledWith(
      'Appointment successfully created'
    );
    expect(deps.handleFilterReset).toHaveBeenCalledOnce();
    expect(deps.handleEndRescheduling).not.toHaveBeenCalled();
  });

  it('ends rescheduling after a successful token-based booking update', async () => {
    const deps = createDeps();
    deps.modifyManagedAppointment.mockResolvedValueOnce({
      success: true,
      message: 'Appointment successfully updated',
    });

    const booking = createBookingOrchestrator(deps);

    await booking.handleBooking({
      ...baseBooking,
      token: 'a'.repeat(64),
    });

    expect(deps.handleSuccess).toHaveBeenCalledWith(
      'Appointment successfully updated'
    );
    expect(deps.handleEndRescheduling).toHaveBeenCalledOnce();
    expect(deps.handleFilterReset).not.toHaveBeenCalled();
  });

  it('surfaces schedule conflict errors', async () => {
    const deps = createDeps();
    const error = new Error('Time slot conflicts with existing appointment');
    deps.addAppointment.mockRejectedValueOnce(error);

    const booking = createBookingOrchestrator(deps);

    await booking.handleBooking(baseBooking);

    expect(deps.handleError).toHaveBeenCalledWith(error);
  });
});
