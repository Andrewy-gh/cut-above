import { useMemo } from 'react';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import { useQuery } from '@/convex/client';
import { BUSINESS_TIME_ZONE } from '@/utils/date';

import { api } from '../../../convex/_generated/api';

dayjs.extend(utc);
dayjs.extend(timezone);

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
        start: dayjs.utc(slot.start).tz(BUSINESS_TIME_ZONE),
        end: dayjs.utc(slot.end).tz(BUSINESS_TIME_ZONE),
      })),
    [availabilityData]
  );

  return {
    schedule: availabilityData?.schedule ?? null,
    timeSlots,
    isLoading: Boolean(date) && availabilityData === undefined,
  };
}
