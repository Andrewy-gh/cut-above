import type {
  EmployeeAvailabilityOverride,
  EmployeeAvailabilityWeeklyEntry,
  Weekday,
} from '@/types';

export const weekdayLabels = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
] as const;

export const formatEmployeeName = (employee: {
  firstName: string;
  lastName?: string;
}) => [employee.firstName, employee.lastName].filter(Boolean).join(' ');

export const createEmptyWeeklyDraft = (defaultHours: {
  startTime: string;
  endTime: string;
}): EmployeeAvailabilityWeeklyEntry[] =>
  weekdayLabels.map((_, weekday) => ({
    weekday: weekday as Weekday,
    isWorking: true,
    startTime: defaultHours.startTime,
    endTime: defaultHours.endTime,
  }));

export const buildWeeklyDraft = (data: {
  defaultHours: {
    startTime: string;
    endTime: string;
  };
  weekly: Array<{
    weekday: number;
    isWorking: boolean;
    startTime?: string;
    endTime?: string;
  }>;
}): EmployeeAvailabilityWeeklyEntry[] => {
  const byWeekday = new Map(data.weekly.map((entry) => [entry.weekday, entry]));
  return weekdayLabels.map((_, weekday) => {
    const existing = byWeekday.get(weekday as Weekday);
    return {
      weekday: weekday as Weekday,
      isWorking: existing?.isWorking ?? true,
      startTime: existing?.startTime ?? data.defaultHours.startTime,
      endTime: existing?.endTime ?? data.defaultHours.endTime,
    };
  });
};

export const buildOverrideDraft = (data: {
  defaultHours: {
    startTime: string;
    endTime: string;
  };
}): Omit<EmployeeAvailabilityOverride, 'id'> => ({
  date: new Date().toISOString().slice(0, 10),
  isWorking: false,
  startTime: data.defaultHours.startTime,
  endTime: data.defaultHours.endTime,
  reason: '',
});

export const cloneOverrideDraft = (
  override: Omit<EmployeeAvailabilityOverride, 'id'>
): Omit<EmployeeAvailabilityOverride, 'id'> => ({
  date: override.date,
  isWorking: override.isWorking,
  startTime: override.startTime,
  endTime: override.endTime,
  reason: override.reason ?? '',
});
