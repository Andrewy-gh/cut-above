import { useEffect, useState } from 'react';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';

import { useMutation } from '@/convex/client';
import { useNotification } from '@/hooks/useNotification';

import styles from './styles.module.css';
import { api } from '../../../../convex/_generated/api';

type DateBreakDraft = {
  id?: string;
  date: string;
  startTime: string;
  endTime: string;
  label?: string;
  mode: 'add' | 'replace';
};

const createInitialDraft = (): DateBreakDraft => ({
  date: new Date().toISOString().slice(0, 10),
  startTime: '12:00',
  endTime: '12:30',
  label: '',
  mode: 'add',
});

export default function DateBreaksSection({
  dateBreaks,
  dateBreakPolicies,
  employeeId,
}: {
  dateBreaks: Array<{
    id: string;
    date: string;
    startTime: string;
    endTime: string;
    label?: string;
  }>;
  dateBreakPolicies: Array<{
    date: string;
    mode: 'add' | 'replace';
  }>;
  employeeId?: string;
}) {
  const { handleSuccess, handleError } = useNotification();
  const upsertAvailabilityDateBreak = useMutation(api.availability.upsertAvailabilityDateBreak);
  const deleteAvailabilityDateBreak = useMutation(api.availability.deleteAvailabilityDateBreak);
  const [draft, setDraft] = useState<DateBreakDraft>(createInitialDraft());

  useEffect(() => {
    setDraft(createInitialDraft());
  }, [dateBreakPolicies, dateBreaks]);

  const resetDraft = () => {
    setDraft(createInitialDraft());
  };

  const handleSave = async () => {
    try {
      await upsertAvailabilityDateBreak({
        ...(employeeId ? { employeeId } : {}),
        dateBreak: {
          id: draft.id,
          date: draft.date,
          startTime: draft.startTime,
          endTime: draft.endTime,
          label: draft.label,
        },
        mode: draft.mode,
      });
      handleSuccess('Date block saved');
      resetDraft();
    } catch (error) {
      handleError(error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteAvailabilityDateBreak({
        ...(employeeId ? { employeeId } : {}),
        id,
      });
      handleSuccess('Date block removed');
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
          <h4>Date-specific blocks</h4>
          <p className={styles.subtle}>
            Add one-off blocked time for appointments, errands, or custom lunch changes.
          </p>
        </div>
        <div className={styles.actions}>
          {draft.id && (
            <Button variant="outlined" onClick={resetDraft}>
              Cancel edit
            </Button>
          )}
          <Button variant="contained" onClick={handleSave}>
            {draft.id ? 'Update block' : 'Save block'}
          </Button>
        </div>
      </div>

      <div className={styles.overrideEditor}>
        <TextField
          label="Date"
          type="date"
          value={draft.date}
          onChange={(event) =>
            setDraft((current) => ({ ...current, date: event.target.value }))
          }
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          select
          label="Date mode"
          value={draft.mode}
          onChange={(event) =>
            setDraft((current) => ({
              ...current,
              mode: event.target.value as 'add' | 'replace',
            }))
          }
        >
          <MenuItem value="add">Add to recurring breaks</MenuItem>
          <MenuItem value="replace">Replace recurring breaks</MenuItem>
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
        {dateBreaks.length === 0 ? (
          <p className={styles.subtle}>No date-specific blocks saved.</p>
        ) : (
          dateBreaks.map((entry) => (
            <div key={entry.id} className={styles.overrideItem}>
              <div>
                <strong>{entry.date}</strong>
                <div className={styles.subtle}>
                  {entry.startTime} - {entry.endTime}
                  {entry.label ? ` • ${entry.label}` : ''}
                  {` • ${
                    dateBreakPolicies.find((policy) => policy.date === entry.date)?.mode ===
                    'replace'
                      ? 'replaces recurring breaks'
                      : 'adds to recurring breaks'
                  }`}
                </div>
              </div>
              <div className={styles.actions}>
                <Button
                  onClick={() =>
                    setDraft({
                      ...entry,
                      mode:
                        dateBreakPolicies.find((policy) => policy.date === entry.date)?.mode ??
                        'add',
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
