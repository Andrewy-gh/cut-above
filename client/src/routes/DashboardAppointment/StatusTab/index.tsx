import styles from './styles.module.css';

const statusClassMap: Record<string, string> = {
  scheduled: styles.tab_scheduled,
  'checked-in': styles.tab_checked_in,
  completed: styles.tab_completed,
  cancelled: styles.tab_cancelled,
};

const dotClassMap: Record<string, string> = {
  scheduled: styles.dot_scheduled,
  'checked-in': styles.dot_checked_in,
  completed: styles.dot_completed,
  cancelled: styles.dot_cancelled,
};

const labelMap: Record<string, string> = {
  scheduled: 'Scheduled',
  'checked-in': 'Checked In',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

interface StatusTabProps {
  handleClick: () => void;
  name: string;
  total: number;
  active: boolean;
}

export default function StatusTab({
  handleClick,
  name,
  total,
  active,
}: StatusTabProps) {
  const label = labelMap[name] || name.charAt(0).toUpperCase() + name.slice(1);
  const tabClass = [
    styles.tab,
    active ? styles.tab_active : '',
    active ? statusClassMap[name] || '' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type="button"
      className={tabClass}
      onClick={handleClick}
      aria-pressed={active}
    >
      <span className={`${styles.status_dot} ${dotClassMap[name] || ''}`} />
      <span className={styles.tab_label}>{label}</span>
      <span className={styles.tab_count}>{total}</span>
    </button>
  );
}
