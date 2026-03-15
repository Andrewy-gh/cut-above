import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';

import type { EmployeeAvailabilityWeeklyEntry } from '@/types';

import styles from './styles.module.css';
import { weekdayLabels } from './shared';

export default function WeeklyScheduleSection({
  weeklyDraft,
  defaultHours,
  onReset,
  onSave,
  onChange,
  showEmptyHint,
}: {
  weeklyDraft: EmployeeAvailabilityWeeklyEntry[];
  defaultHours: { startTime: string; endTime: string };
  onReset: () => void;
  onSave: () => void;
  onChange: (
    weekday: number,
    field: keyof EmployeeAvailabilityWeeklyEntry,
    value: boolean | string
  ) => void;
  showEmptyHint: boolean;
}) {
  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <div>
          <h4>Weekly schedule</h4>
          {showEmptyHint && (
            <p className={styles.subtle}>
              No custom hours saved yet. Booking currently falls back to shop hours.
            </p>
          )}
        </div>
        <div className={styles.actions}>
          <Button variant="outlined" onClick={onReset}>
            Reset to shop hours
          </Button>
          <Button variant="contained" onClick={onSave}>
            Save weekly hours
          </Button>
        </div>
      </div>

      <div className={styles.grid}>
        {weeklyDraft.map((entry) => (
          <div key={entry.weekday} className={styles.card}>
            <div className={styles.dayRow}>
              <strong>{weekdayLabels[entry.weekday]}</strong>
              <label className={styles.checkbox}>
                <input
                  type="checkbox"
                  checked={entry.isWorking}
                  onChange={(event) => onChange(entry.weekday, 'isWorking', event.target.checked)}
                />
                Working
              </label>
            </div>
            <div className={styles.timeRow}>
              <TextField
                label="Start"
                type="time"
                value={entry.startTime ?? defaultHours.startTime}
                onChange={(event) => onChange(entry.weekday, 'startTime', event.target.value)}
                disabled={!entry.isWorking}
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label="End"
                type="time"
                value={entry.endTime ?? defaultHours.endTime}
                onChange={(event) => onChange(entry.weekday, 'endTime', event.target.value)}
                disabled={!entry.isWorking}
                InputLabelProps={{ shrink: true }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
