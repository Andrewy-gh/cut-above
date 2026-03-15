import { Fragment, useMemo, useState } from 'react';
import dayjs from 'dayjs';
import Button from '@mui/material/Button';

import { useQuery } from '@/convex/client';
import { formatDateToTime } from '@/utils/date';
import { api } from '../../../../convex/_generated/api';

import styles from './styles.module.css';
import { formatEmployeeName } from './shared';

const formatCellBreaks = (
  breaks: Array<{ start: string; end: string; label?: string }>
) =>
  breaks
    .map(
      (entry) =>
        `${formatDateToTime(entry.start)}-${formatDateToTime(entry.end)}${
          entry.label ? ` ${entry.label}` : ''
        }`
    )
    .join(', ');

export default function AdminDateViewSection() {
  const [weekStart, setWeekStart] = useState(dayjs().startOf('week').format('YYYY-MM-DD'));
  const summary = useQuery(api.availability.getAvailabilitySummaryRange, {
    startDate: weekStart,
    days: 7,
  });

  const employeeRows = useMemo(() => {
    if (!summary) {
      return [];
    }

    const rowMap = new Map<
      string,
      {
        id: string;
        label: string;
        days: Array<{
          date: string;
          availabilityWindow: { start: string; end: string } | null;
          appointmentCount: number;
          breaks: Array<{ start: string; end: string; label?: string }>;
          breakMode: 'add' | 'replace';
          hasSchedule: boolean;
        }>;
      }
    >();

    summary.days.forEach((day) => {
      day.employees.forEach((employee) => {
        const current = rowMap.get(employee.id) ?? {
          id: employee.id,
          label: formatEmployeeName(employee),
          days: [],
        };
        current.days.push({
          date: day.date,
          availabilityWindow: employee.availabilityWindow,
          appointmentCount: employee.appointmentCount,
          breaks: employee.breaks,
          breakMode: employee.breakMode === 'replace' ? 'replace' : 'add',
          hasSchedule: day.schedule != null,
        });
        rowMap.set(employee.id, current);
      });
    });

    return Array.from(rowMap.values());
  }, [summary]);

  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <div>
          <h4>Availability calendar</h4>
          <p className={styles.subtle}>Week view for staffing, appointments, and break coverage.</p>
        </div>
        <div className={styles.actions}>
          <Button
            variant="outlined"
            onClick={() => setWeekStart(dayjs(weekStart).subtract(7, 'day').format('YYYY-MM-DD'))}
          >
            Previous week
          </Button>
          <Button
            variant="outlined"
            onClick={() => setWeekStart(dayjs(weekStart).add(7, 'day').format('YYYY-MM-DD'))}
          >
            Next week
          </Button>
        </div>
      </div>

      {!summary ? (
        <p className={styles.subtle}>Loading calendar...</p>
      ) : (
        <div className={styles.calendar}>
          <div className={`${styles.calendarCell} ${styles.calendarCorner}`}>Employee</div>
          {summary.days.map((day) => (
            <div key={day.date} className={`${styles.calendarCell} ${styles.calendarHeader}`}>
              <strong>{dayjs(day.date).format('ddd')}</strong>
              <span>{dayjs(day.date).format('MMM D')}</span>
              {day.schedule ? (
                <span className={styles.subtle}>
                  {formatDateToTime(day.schedule.open)}-{formatDateToTime(day.schedule.close)}
                </span>
              ) : (
                <span className={styles.subtle}>No shop schedule</span>
              )}
            </div>
          ))}

          {employeeRows.map((row) => (
            <Fragment key={row.id}>
              <div key={`${row.id}-label`} className={`${styles.calendarCell} ${styles.calendarRowLabel}`}>
                {row.label}
              </div>
              {row.days.map((day) => (
                <div
                  key={`${row.id}-${day.date}`}
                  className={`${styles.calendarCell} ${styles.calendarBodyCell}`}
                >
                  {!day.hasSchedule ? (
                    <div className={styles.subtle}>No shop schedule</div>
                  ) : !day.availabilityWindow ? (
                    <div className={styles.subtle}>Off</div>
                  ) : (
                    <>
                      <div>
                        {formatDateToTime(day.availabilityWindow.start)}-
                        {formatDateToTime(day.availabilityWindow.end)}
                      </div>
                      <div className={styles.subtle}>Booked: {day.appointmentCount}</div>
                      {day.breaks.length > 0 ? (
                        <div className={styles.subtle}>
                          {day.breakMode === 'replace' ? 'Break plan:' : 'Extra breaks:'}{' '}
                          {formatCellBreaks(day.breaks)}
                        </div>
                      ) : (
                        <div className={styles.subtle}>No breaks</div>
                      )}
                    </>
                  )}
                </div>
              ))}
            </Fragment>
          ))}
        </div>
      )}
    </section>
  );
}
