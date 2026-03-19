import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';

import { useMutation, useQuery } from '@/convex/client';
import { useAuth } from '@/hooks/useAuth';
import { useEmployeesQuery } from '@/hooks/useEmployeesQuery';
import { useNotification } from '@/hooks/useNotification';
import AccessDenied from '@/routes/RequireAuth/AccessDenied';
import type { EmployeeAvailabilityOverride, EmployeeAvailabilityWeeklyEntry } from '@/types';
import { api } from '../../../../convex/_generated/api';
import AdminDateViewSection from './AdminDateViewSection';
import AvailabilityHeroCard from './AvailabilityHeroCard';
import DateOverridesSection from './DateOverridesSection';
import DateBreaksSection from './DateBreaksSection';
import RecurringBreaksSection from './RecurringBreaksSection';
import WeeklyScheduleSection from './WeeklyScheduleSection';
import {
  buildOverrideDraft,
  buildWeeklyDraft,
  cloneOverrideDraft,
  createEmptyWeeklyDraft,
  formatEmployeeName,
} from './shared';

import styles from './styles.module.css';

export default function EmployeeAvailability() {
  const { role } = useAuth();
  const isAdmin = role === 'admin';
  const isEmployee = role === 'employee';
  const { employees } = useEmployeesQuery();
  const { handleSuccess, handleError } = useNotification();
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [weeklyDraft, setWeeklyDraft] = useState<EmployeeAvailabilityWeeklyEntry[]>([]);
  const [overrideDraft, setOverrideDraft] = useState<
    Omit<EmployeeAvailabilityOverride, 'id'>
  >({
    date: new Date().toISOString().slice(0, 10),
    isWorking: false,
    startTime: '09:00',
    endTime: '17:00',
    reason: '',
  });
  const [editingOverrideDate, setEditingOverrideDate] = useState<string | null>(null);

  const availabilityData = useQuery(
    api.availability.getAvailability,
    isAdmin ? (selectedEmployeeId ? { employeeId: selectedEmployeeId } : 'skip') : {}
  );

  const saveWeeklyAvailability = useMutation(api.availability.saveWeeklyAvailability);
  const upsertAvailabilityOverride = useMutation(
    api.availability.upsertAvailabilityOverride
  );
  const deleteAvailabilityOverride = useMutation(
    api.availability.deleteAvailabilityOverride
  );

  useEffect(() => {
    if (!isAdmin || selectedEmployeeId || employees.length === 0) {
      return;
    }
    setSelectedEmployeeId(employees[0].id);
  }, [employees, isAdmin, selectedEmployeeId]);

  useEffect(() => {
    if (!availabilityData) {
      return;
    }
    setWeeklyDraft(buildWeeklyDraft(availabilityData));
    setOverrideDraft(buildOverrideDraft(availabilityData));
    setEditingOverrideDate(null);
  }, [availabilityData]);

  if (!isAdmin && !isEmployee) {
    return <AccessDenied requiredRole="employee" />;
  }

  if (isAdmin && employees.length === 0) {
    return (
      <main className="container-lg">
        <div className="mt-4">
          <Link to="/account">Back to account page</Link>
        </div>
        <h3 className={styles.header}>Availability</h3>
        <p>No employees found.</p>
      </main>
    );
  }

  const handleWeeklyChange = (
    weekday: number,
    field: keyof EmployeeAvailabilityWeeklyEntry,
    value: boolean | string
  ) => {
    setWeeklyDraft((current) =>
      current.map((entry) =>
        entry.weekday === weekday ? { ...entry, [field]: value } : entry
      )
    );
  };

  const handleSaveWeekly = async () => {
    try {
      await saveWeeklyAvailability({
        ...(isAdmin ? { employeeId: selectedEmployeeId } : {}),
        weekly: weeklyDraft,
      });
      handleSuccess('Availability updated');
    } catch (error) {
      handleError(error);
    }
  };

  const handleResetWeekly = () => {
    if (!availabilityData) {
      return;
    }
    setWeeklyDraft(createEmptyWeeklyDraft(availabilityData.defaultHours));
  };

  const resetOverrideDraft = () => {
    if (!availabilityData) {
      return;
    }
    setOverrideDraft(buildOverrideDraft(availabilityData));
    setEditingOverrideDate(null);
  };

  const handleSaveOverride = async () => {
    try {
      await upsertAvailabilityOverride({
        ...(isAdmin ? { employeeId: selectedEmployeeId } : {}),
        override: overrideDraft,
      });
      handleSuccess('Availability override saved');
      resetOverrideDraft();
    } catch (error) {
      handleError(error);
    }
  };

  const handleDeleteOverride = async (date: string) => {
    try {
      await deleteAvailabilityOverride({
        ...(isAdmin ? { employeeId: selectedEmployeeId } : {}),
        date,
      });
      handleSuccess('Availability override removed');
      if (editingOverrideDate === date) {
        resetOverrideDraft();
      }
    } catch (error) {
      handleError(error);
    }
  };

  const handleEditOverride = (override: EmployeeAvailabilityOverride) => {
    setOverrideDraft(
      cloneOverrideDraft({
        date: override.date,
        isWorking: override.isWorking,
        startTime: override.startTime,
        endTime: override.endTime,
        reason: override.reason ?? '',
      })
    );
    setEditingOverrideDate(override.date);
  };

  return (
    <main className={`container-lg ${styles.page}`}>
      <div className="mt-4">
        <Link to="/account">Back to account page</Link>
      </div>
      <h3 className={styles.header}>Manage availability</h3>
      <p className={styles.subtle}>
        Weekly hours define the default. Date overrides handle vacation, time off, or
        special shifts.
      </p>

      {isAdmin && (
        <TextField
          select
          label="Employee"
          value={selectedEmployeeId}
          onChange={(event) => setSelectedEmployeeId(event.target.value)}
          className={styles.employeeSelect}
        >
          {employees.map((employee) => (
            <MenuItem key={employee.id} value={employee.id}>
              {formatEmployeeName(employee)}
            </MenuItem>
          ))}
        </TextField>
      )}

      {!availabilityData ? (
        <p>Loading availability...</p>
      ) : (
        <>
          <AvailabilityHeroCard
            employee={availabilityData.employee}
            defaultHours={availabilityData.defaultHours}
          />

          <RecurringBreaksSection
            breaks={availabilityData.breaks}
            employeeId={isAdmin ? selectedEmployeeId : undefined}
          />

          <DateBreaksSection
            dateBreaks={availabilityData.dateBreaks}
            dateBreakPolicies={availabilityData.dateBreakPolicies.map((policy) => ({
              date: policy.date,
              mode: policy.mode === 'replace' ? 'replace' : 'add',
            }))}
            employeeId={isAdmin ? selectedEmployeeId : undefined}
          />

          <WeeklyScheduleSection
            weeklyDraft={weeklyDraft}
            defaultHours={availabilityData.defaultHours}
            onReset={handleResetWeekly}
            onSave={handleSaveWeekly}
            onChange={handleWeeklyChange}
            showEmptyHint={availabilityData.weekly.length === 0}
          />

          <DateOverridesSection
            overrideDraft={overrideDraft}
            overrides={availabilityData.overrides}
            defaultHours={availabilityData.defaultHours}
            editingOverrideDate={editingOverrideDate}
            onDraftChange={setOverrideDraft}
            onSave={handleSaveOverride}
            onCancelEdit={resetOverrideDraft}
            onEdit={handleEditOverride}
            onDelete={handleDeleteOverride}
          />

          {isAdmin && <AdminDateViewSection />}
        </>
      )}
    </main>
  );
}
