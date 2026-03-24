import { useState } from 'react';
import { Link } from 'react-router';
import {
  useDashboardSchedulesQuery,
  type DashboardScheduleView,
} from '@/hooks/useDashboardSchedulesQuery';
import ScheduleCard from './ScheduleCard';
import styles from './styles.module.css';

export default function DashboardSchedule() {
  const [view, setView] = useState<DashboardScheduleView>('upcoming');
  const [search, setSearch] = useState('');
  const {
    stats,
    schedules,
    upcomingSchedules,
    pastSchedules,
    upcomingStatus,
    pastStatus,
    loadMoreUpcoming,
    loadMorePast,
    isLoading,
  } = useDashboardSchedulesQuery(view, search);

  const isEmpty = !stats || stats.totalSchedules === 0;
  const hasVisibleSchedules =
    view === 'all'
      ? upcomingSchedules.length > 0 || pastSchedules.length > 0
      : schedules.length > 0;

  const renderLoadMoreButton = (
    status: typeof upcomingStatus,
    handleLoadMore: (numItems: number) => void,
    label: string
  ) =>
    status === 'CanLoadMore' ? (
      <div className={styles.load_more_wrap}>
        <button
          className={styles.load_more_btn}
          onClick={() => handleLoadMore(12)}
          type="button"
        >
          {label}
        </button>
      </div>
    ) : null;

  const emptyMessage =
    search.trim().length > 0
      ? `No ${view === 'all' ? '' : `${view} `}schedules matching "${search}".`
      : `No ${view === 'all' ? '' : `${view} `}schedules.`;

  if (isLoading && !stats) {
    return (
      <div className={styles.page}>
        <Link to="/account" className={styles.back_link}>
          <span className={styles.back_arrow}>&larr;</span> Account
        </Link>
        <div className={styles.empty_state}>
          <div className={styles.empty_text}>Loading schedules...</div>
        </div>
      </div>
    );
  }

  const totalSchedules = stats?.totalSchedules ?? 0;
  const totalAppointments = stats?.totalAppointments ?? 0;
  const upcomingCount = stats?.upcomingSchedules ?? 0;
  const pastCount = stats?.pastSchedules ?? 0;

  const renderCards = (items: typeof schedules, past = false) => (
    <>
      <div className={styles.cards_grid}>
        {items.map((schedule) => (
          <ScheduleCard key={schedule.id} schedule={schedule} isPast={past} />
        ))}
      </div>
      {renderLoadMoreButton(
        past ? pastStatus : upcomingStatus,
        past ? loadMorePast : loadMoreUpcoming,
        past ? 'Load more past schedules' : 'Load more schedules'
      )}
    </>
  );

  return (
    <div className={styles.page}>
      <Link to="/account" className={styles.back_link}>
        <span className={styles.back_arrow}>&larr;</span> Account
      </Link>

      <div className={styles.page_header}>
        <h4 className={styles.page_title}>Schedules</h4>
        {!isEmpty && (
          <span className={styles.schedule_count}>
            {totalSchedules} total
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
              <span className={styles.stat_value}>{totalSchedules}</span>
              <span className={styles.stat_label}>Total Schedules</span>
            </div>
            <div className={styles.stat_card}>
              <span className={styles.stat_value}>{totalAppointments}</span>
              <span className={styles.stat_label}>Appointments</span>
            </div>
            <div className={styles.stat_card}>
              <span className={styles.stat_value}>{upcomingCount}</span>
              <span className={styles.stat_label}>Upcoming</span>
            </div>
            <div className={styles.stat_card}>
              <span className={styles.stat_value}>{pastCount}</span>
              <span className={styles.stat_label}>Past</span>
            </div>
          </div>

          {/* Filters bar */}
          <div className={styles.filters_bar}>
            <input
              type="text"
              className={styles.search_input}
              aria-label="Search schedules by date"
              placeholder="Search dates: 2026-02 or 02-03"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <div className={styles.view_toggle}>
              {(['upcoming', 'past', 'all'] as DashboardScheduleView[]).map((v) => (
                <button
                  type="button"
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
              {upcomingSchedules.length > 0 && (
                <>
                  <div className={styles.section_label}>Upcoming</div>
                  {renderCards(upcomingSchedules)}
                </>
              )}
              {pastSchedules.length > 0 && (
                <>
                  <div className={styles.section_label}>Past</div>
                  {renderCards(pastSchedules, true)}
                </>
              )}
              {!hasVisibleSchedules && (
                <div className={styles.empty_state}>
                  <div className={styles.empty_text}>{emptyMessage}</div>
                </div>
              )}
            </>
          ) : (
            <>
              {!hasVisibleSchedules ? (
                <div className={styles.empty_state}>
                  <div className={styles.empty_text}>{emptyMessage}</div>
                </div>
              ) : (
                renderCards(schedules, view === 'past')
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
