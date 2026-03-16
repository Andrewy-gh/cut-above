import { useState, useMemo } from 'react';
import { Link, useParams } from 'react-router';
import { useScheduleQuery } from '@/hooks/useScheduleQuery';
import StatusColumn from './StatusColumn';
import StatusTab from './StatusTab';
import { formatDateFull, formatDateToTime, sortAndFormatApptByStartTime } from '@/utils/date';
import { filterByApptStatus } from '@/utils/apptStatus';
import styles from './styles.module.css';

const SERVICES = [
  'Haircut',
  'Beard Trim',
  'Straight Razor Shave',
  'Cut and Shave Package',
  'The Full Package',
];

const EMPLOYEES = ['Andre', 'Obi', 'Salah'];

export default function DashboardAppointment() {
  const { id } = useParams<{ id: string }>();
  const { schedule, appointments } = useScheduleQuery(id, { scope: 'private' });
  const formatTimeAppt = sortAndFormatApptByStartTime(appointments || []);
  const [status, setStatus] = useState('scheduled');

  // Filters
  const [serviceFilter, setServiceFilter] = useState('');
  const [employeeFilter, setEmployeeFilter] = useState('');
  const [clientSearch, setClientSearch] = useState('');

  const hasFilters = serviceFilter || employeeFilter || clientSearch;

  const clearFilters = () => {
    setServiceFilter('');
    setEmployeeFilter('');
    setClientSearch('');
  };

  // Apply filters to appointments before status grouping
  const filteredAppts = useMemo(() => {
    let result = formatTimeAppt;

    if (serviceFilter) {
      result = result.filter((a) => a.service === serviceFilter);
    }

    if (employeeFilter) {
      result = result.filter((a) => {
        if (a.employee && typeof a.employee === 'object') {
          return a.employee.firstName === employeeFilter;
        }
        return false;
      });
    }

    if (clientSearch.trim()) {
      const q = clientSearch.toLowerCase();
      result = result.filter((a) => {
        if (a.client && typeof a.client === 'object') {
          const name = a.client.firstName?.toLowerCase() || '';
          return name.includes(q);
        }
        return false;
      });
    }

    return result;
  }, [formatTimeAppt, serviceFilter, employeeFilter, clientSearch]);

  const statuses = filterByApptStatus(filteredAppts);

  // Also get unfiltered totals for summary
  const allStatuses = filterByApptStatus(formatTimeAppt);

  const currentStatusData = statuses.find((st) => st.name === status);
  const filteredAppointments = currentStatusData ? currentStatusData.data : [];

  // Summary counts from unfiltered data
  const totalCount = formatTimeAppt.length;
  const scheduledCount =
    allStatuses.find((s) => s.name === 'scheduled')?.data.length || 0;
  const checkedInCount =
    allStatuses.find((s) => s.name === 'checked-in')?.data.length || 0;
  const completedCount =
    allStatuses.find((s) => s.name === 'completed')?.data.length || 0;

  const hasAppts = appointments && formatTimeAppt.length > 0;

  // Schedule time info
  const openTime = schedule ? formatDateToTime(schedule.open) : '';
  const closeTime = schedule ? formatDateToTime(schedule.close) : '';

  return (
    <main className={styles.page}>
      <Link to="../dashboard" className={styles.back_link}>
        <span className={styles.back_arrow}>&larr;</span> Schedules
      </Link>

      {!hasAppts ? (
        <div className={styles.empty_state}>
          <div className={styles.empty_heading}>No Appointments</div>
          <div className={styles.empty_text}>
            No appointments have been made for this schedule.
          </div>
        </div>
      ) : (
        <>
          {/* Day header */}
          <div className={styles.day_header}>
            <h4 className={styles.day_title}>
              {formatDateFull(formatTimeAppt[0].date)}
            </h4>
            {openTime && (
              <div className={styles.day_subtitle}>
                {openTime} &ndash; {closeTime}
              </div>
            )}
          </div>

          {/* Summary strip */}
          <div className={styles.summary_strip}>
            <div
              className={`${styles.summary_card} ${styles.summary_total}`}
            >
              <span className={styles.summary_value} style={{ color: '#E6B953' }}>
                {totalCount}
              </span>
              <span className={styles.summary_label}>Total</span>
            </div>
            <div
              className={`${styles.summary_card} ${styles.summary_scheduled}`}
            >
              <span className={styles.summary_value}>{scheduledCount}</span>
              <span className={styles.summary_label}>Scheduled</span>
            </div>
            <div
              className={`${styles.summary_card} ${styles.summary_checked}`}
            >
              <span className={styles.summary_value}>{checkedInCount}</span>
              <span className={styles.summary_label}>Checked In</span>
            </div>
            <div
              className={`${styles.summary_card} ${styles.summary_completed}`}
            >
              <span className={styles.summary_value}>{completedCount}</span>
              <span className={styles.summary_label}>Completed</span>
            </div>
          </div>

          {/* Filters bar */}
          <div className={styles.filters_bar}>
            <input
              type="text"
              className={styles.search_input}
              placeholder="Search client name..."
              value={clientSearch}
              onChange={(e) => setClientSearch(e.target.value)}
            />
            <select
              className={styles.filter_select}
              value={serviceFilter}
              onChange={(e) => setServiceFilter(e.target.value)}
            >
              <option value="">All Services</option>
              {SERVICES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <select
              className={styles.filter_select}
              value={employeeFilter}
              onChange={(e) => setEmployeeFilter(e.target.value)}
            >
              <option value="">All Barbers</option>
              {EMPLOYEES.map((e) => (
                <option key={e} value={e}>
                  {e}
                </option>
              ))}
            </select>
            {hasFilters && (
              <button
                className={styles.clear_filters_btn}
                onClick={clearFilters}
              >
                Clear
              </button>
            )}
          </div>

          {/* Status tabs */}
          <div className={styles.status_tabs}>
            {statuses.map((st) => (
              <StatusTab
                key={st.id}
                handleClick={() => setStatus(st.name)}
                name={st.name}
                total={st.data.length}
                active={status === st.name}
              />
            ))}
          </div>

          {/* Appointments */}
          <StatusColumn appointments={filteredAppointments} status={status} />
        </>
      )}
    </main>
  );
}
