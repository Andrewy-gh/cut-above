import { useState, useMemo, useCallback } from 'react';
import { Link } from 'react-router';
import { useScheduleQuery } from '../../hooks/useScheduleQuery';
import ScheduleCard from './ScheduleCard';
import styles from './styles.module.css';
import { Schedule } from '@/types';

type ViewFilter = 'upcoming' | 'past' | 'all';

export default function DashboardSchedule() {
  const { schedules, upcomingSchedules, pastSchedules } = useScheduleQuery(
    undefined,
    { scope: 'private' }
  );

  const [view, setView] = useState<ViewFilter>('upcoming');
  const [search, setSearch] = useState('');

  const totalAppointments = useMemo(
    () =>
      (schedules || []).reduce(
        (sum, s) => sum + s.appointments.length,
        0
      ),
    [schedules]
  );

  const filterSchedules = useCallback(
    (list: Schedule[]) => {
      if (!search.trim()) return list;
      const q = search.toLowerCase();
      return list.filter((s) => {
        const dateStr = s.date || s.open || '';
        return dateStr.toLowerCase().includes(q);
      });
    },
    [search]
  );

  const displaySchedules = useMemo(() => {
    if (view === 'upcoming') return filterSchedules(upcomingSchedules);
    if (view === 'past') return filterSchedules(pastSchedules);
    return filterSchedules(schedules || []);
  }, [view, filterSchedules, schedules, upcomingSchedules, pastSchedules]);

  const isEmpty = !schedules || schedules.length === 0;

  return (
    <div className={styles.page}>
      <Link to="/account" className={styles.back_link}>
        <span className={styles.back_arrow}>&larr;</span> Account
      </Link>

      <div className={styles.page_header}>
        <h4 className={styles.page_title}>Schedules</h4>
        {!isEmpty && (
          <span className={styles.schedule_count}>
            {schedules!.length} total
          </span>
        )}
      </div>

      {isEmpty ? (
        <div className={styles.empty_state}>
          <div className={styles.empty_heading}>No schedules yet</div>
          <div className={styles.empty_text}>
            Create a schedule to start managing appointments.
          </div>
        </div>
      ) : (
        <>
          {/* Stats strip */}
          <div className={styles.stats_strip}>
            <div className={`${styles.stat_card} ${styles.stat_card_accent}`}>
              <span className={styles.stat_value}>{schedules!.length}</span>
              <span className={styles.stat_label}>Total Schedules</span>
            </div>
            <div className={styles.stat_card}>
              <span className={styles.stat_value}>{totalAppointments}</span>
              <span className={styles.stat_label}>Appointments</span>
            </div>
            <div className={styles.stat_card}>
              <span className={styles.stat_value}>
                {upcomingSchedules.length}
              </span>
              <span className={styles.stat_label}>Upcoming</span>
            </div>
            <div className={styles.stat_card}>
              <span className={styles.stat_value}>
                {pastSchedules.length}
              </span>
              <span className={styles.stat_label}>Past</span>
            </div>
          </div>

          {/* Filters bar */}
          <div className={styles.filters_bar}>
            <input
              type="text"
              className={styles.search_input}
              placeholder="Search by date..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <div className={styles.view_toggle}>
              {(['upcoming', 'past', 'all'] as ViewFilter[]).map((v) => (
                <button
                  key={v}
                  className={`${styles.toggle_btn} ${
                    view === v ? styles.toggle_btn_active : ''
                  }`}
                  onClick={() => setView(v)}
                >
                  {v.charAt(0).toUpperCase() + v.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Schedule cards */}
          {view === 'all' ? (
            <>
              {filterSchedules(upcomingSchedules).length > 0 && (
                <>
                  <div className={styles.section_label}>Upcoming</div>
                  <div className={styles.cards_grid}>
                    {filterSchedules(upcomingSchedules).map(
                      (schedule: Schedule) => (
                        <ScheduleCard key={schedule.id} schedule={schedule} />
                      )
                    )}
                  </div>
                </>
              )}
              {filterSchedules(pastSchedules).length > 0 && (
                <>
                  <div className={styles.section_label}>Past</div>
                  <div className={styles.cards_grid}>
                    {filterSchedules(pastSchedules).map(
                      (schedule: Schedule) => (
                        <ScheduleCard
                          key={schedule.id}
                          schedule={schedule}
                          isPast
                        />
                      )
                    )}
                  </div>
                </>
              )}
            </>
          ) : (
            <>
              {displaySchedules.length === 0 ? (
                <div className={styles.empty_state}>
                  <div className={styles.empty_text}>
                    No {view} schedules
                    {search ? ` matching "${search}"` : ''}.
                  </div>
                </div>
              ) : (
                <div className={styles.cards_grid}>
                  {displaySchedules.map((schedule: Schedule) => (
                    <ScheduleCard
                      key={schedule.id}
                      schedule={schedule}
                      isPast={view === 'past'}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
