import { useEffect, useState } from 'react';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';

import { useMutation } from '@/convex/client';
import { useNotification } from '@/hooks/useNotification';
import type { Weekday } from '@/types';
import { api } from '../../../../convex/_generated/api';

import styles from './styles.module.css';

const weekdayLabels = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

type BreakDraft = {
  id?: string;
  weekday: Weekday;
  startTime: string;
  endTime: string;
  label?: string;
};

const createInitialBreakDraft = (): BreakDraft => ({
  weekday: 1,
  startTime: '12:00',
  endTime: '12:30',
  label: '',
});

export default function RecurringBreaksSection({
  breaks,
  employeeId,
}: {
  breaks: Array<{
    id: string;
    weekday: number;
    startTime: string;
    endTime: string;
    label?: string;
  }>;
  employeeId?: string;
}) {
  const { handleSuccess, handleError } = useNotification();
  const upsertAvailabilityBreak = useMutation(api.availability.upsertAvailabilityBreak);
  const deleteAvailabilityBreak = useMutation(api.availability.deleteAvailabilityBreak);
  const [draft, setDraft] = useState<BreakDraft>(createInitialBreakDraft());

  useEffect(() => {
    setDraft(createInitialBreakDraft());
  }, [breaks]);

  const resetDraft = () => {
    setDraft(createInitialBreakDraft());
  };

  const handleSave = async () => {
    try {
      await upsertAvailabilityBreak({
        ...(employeeId ? { employeeId } : {}),
        break: draft,
      });
      handleSuccess('Recurring break saved');
      resetDraft();
    } catch (error) {
      handleError(error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteAvailabilityBreak({
        ...(employeeId ? { employeeId } : {}),
        id,
      });
      handleSuccess('Recurring break removed');
      if (draft.id === id) {
        resetDraft();
      }
    } catch (error) {
      handleError(error);
    }
  };

  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <div>
          <h4>Recurring breaks</h4>
          <p className={styles.subtle}>Lunch, cleanup, or any blocked time inside a shift.</p>
        </div>
        <div className={styles.actions}>
          {draft.id && (
            <Button variant="outlined" onClick={resetDraft}>
              Cancel edit
            </Button>
          )}
          <Button variant="contained" onClick={handleSave}>
            {draft.id ? 'Update break' : 'Save break'}
          </Button>
        </div>
      </div>

      <div className={styles.overrideEditor}>
        <TextField
          select
          label="Weekday"
          value={draft.weekday}
          onChange={(event) =>
            setDraft((current) => ({
              ...current,
              weekday: Number(event.target.value) as Weekday,
            }))
          }
        >
          {weekdayLabels.map((label, weekday) => (
            <MenuItem key={label} value={weekday}>
              {label}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          label="Start"
          type="time"
          value={draft.startTime}
          onChange={(event) =>
            setDraft((current) => ({ ...current, startTime: event.target.value }))
          }
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          label="End"
          type="time"
          value={draft.endTime}
          onChange={(event) =>
            setDraft((current) => ({ ...current, endTime: event.target.value }))
          }
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          label="Label"
          value={draft.label ?? ''}
          onChange={(event) =>
            setDraft((current) => ({ ...current, label: event.target.value }))
          }
        />
      </div>

      <div className={styles.overrideList}>
        {breaks.length === 0 ? (
          <p className={styles.subtle}>No recurring breaks saved.</p>
        ) : (
          breaks.map((entry) => (
            <div key={entry.id} className={styles.overrideItem}>
              <div>
                <strong>{weekdayLabels[entry.weekday]}</strong>
                <div className={styles.subtle}>
                  {entry.startTime} - {entry.endTime}
                  {entry.label ? ` • ${entry.label}` : ''}
                </div>
              </div>
              <div className={styles.actions}>
                <Button
                  onClick={() =>
                    setDraft({
                      id: entry.id,
                      weekday: entry.weekday as Weekday,
                      startTime: entry.startTime,
                      endTime: entry.endTime,
                      label: entry.label,
                    })
                  }
                >
                  Edit
                </Button>
                <Button onClick={() => handleDelete(entry.id)}>Delete</Button>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
