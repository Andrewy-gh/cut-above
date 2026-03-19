import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';

import type { EmployeeAvailabilityOverride } from '@/types';

import styles from './styles.module.css';

export default function DateOverridesSection({
  overrideDraft,
  overrides,
  defaultHours,
  editingOverrideDate,
  onDraftChange,
  onSave,
  onCancelEdit,
  onEdit,
  onDelete,
}: {
  overrideDraft: Omit<EmployeeAvailabilityOverride, 'id'>;
  overrides: EmployeeAvailabilityOverride[];
  defaultHours: { startTime: string; endTime: string };
  editingOverrideDate: string | null;
  onDraftChange: (next: Omit<EmployeeAvailabilityOverride, 'id'>) => void;
  onSave: () => void;
  onCancelEdit: () => void;
  onEdit: (override: EmployeeAvailabilityOverride) => void;
  onDelete: (date: string) => void;
}) {
  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <div>
          <h4>Date overrides</h4>
          <p className={styles.subtle}>Use this for days off or one-off shift changes.</p>
        </div>
        <div className={styles.actions}>
          {editingOverrideDate && (
            <Button variant="outlined" onClick={onCancelEdit}>
              Cancel edit
            </Button>
          )}
          <Button variant="contained" onClick={onSave}>
            {editingOverrideDate ? 'Update override' : 'Save override'}
          </Button>
        </div>
      </div>

      <div className={styles.overrideEditor}>
        <TextField
          label="Date"
          type="date"
          value={overrideDraft.date}
          onChange={(event) => onDraftChange({ ...overrideDraft, date: event.target.value })}
          InputLabelProps={{ shrink: true }}
        />
        <label className={styles.checkbox}>
          <input
            type="checkbox"
            checked={overrideDraft.isWorking}
            onChange={(event) =>
              onDraftChange({ ...overrideDraft, isWorking: event.target.checked })
            }
          />
          Working that day
        </label>
        <TextField
          label="Start"
          type="time"
          value={overrideDraft.startTime ?? defaultHours.startTime}
          onChange={(event) =>
            onDraftChange({ ...overrideDraft, startTime: event.target.value })
          }
          disabled={!overrideDraft.isWorking}
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          label="End"
          type="time"
          value={overrideDraft.endTime ?? defaultHours.endTime}
          onChange={(event) => onDraftChange({ ...overrideDraft, endTime: event.target.value })}
          disabled={!overrideDraft.isWorking}
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          label="Reason"
          value={overrideDraft.reason ?? ''}
          onChange={(event) => onDraftChange({ ...overrideDraft, reason: event.target.value })}
        />
      </div>

      <div className={styles.overrideList}>
        {overrides.length === 0 ? (
          <p className={styles.subtle}>No overrides saved.</p>
        ) : (
          overrides.map((override) => (
            <div
              key={override.id}
              className={`${styles.overrideItem} ${
                editingOverrideDate === override.date ? styles.overrideItemActive : ''
              }`}
            >
              <div>
                <strong>{override.date}</strong>
                <div className={styles.subtle}>
                  {override.isWorking
                    ? `${override.startTime} - ${override.endTime}`
                    : 'Not working'}
                  {override.reason ? ` • ${override.reason}` : ''}
                </div>
              </div>
              <div className={styles.actions}>
                <Button onClick={() => onEdit(override)}>Edit</Button>
                <Button onClick={() => onDelete(override.date)}>Delete</Button>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
