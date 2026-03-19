import { useMemo } from 'react';
import dayjs from 'dayjs';
import { useQuery } from '@/convex/client';

import { api } from '../../../convex/_generated/api';

export function useBookingAvailabilityQuery(
  date: string,
  serviceDuration: number,
  employeeId?: string
) {
  const availabilityData = useQuery(
    api.bookingAvailability.getPublicBookingAvailability,
    date
      ? {
          date,
          serviceDuration,
          ...(employeeId ? { employeeId } : {}),
        }
      : 'skip'
  );

  const timeSlots = useMemo(
    () =>
      (availabilityData?.slots ?? []).map((slot) => ({
        ...slot,
        start: dayjs(slot.start),
        end: dayjs(slot.end),
      })),
    [availabilityData]
  );

  return {
    schedule: availabilityData?.schedule ?? null,
    timeSlots,
    isLoading: Boolean(date) && availabilityData === undefined,
  };
}
