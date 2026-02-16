import styles from './styles.module.css';

const statusClassMap: Record<string, string> = {
  scheduled: styles.tab_scheduled,
  'checked-in': styles.tab_checked_in,
  completed: styles.tab_completed,
};

const dotClassMap: Record<string, string> = {
  scheduled: styles.dot_scheduled,
  'checked-in': styles.dot_checked_in,
  completed: styles.dot_completed,
};

const labelMap: Record<string, string> = {
  scheduled: 'Scheduled',
  'checked-in': 'Checked In',
  completed: 'Completed',
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
  const tabClass = [
    styles.tab,
    active ? styles.tab_active : '',
    active ? statusClassMap[name] || '' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={tabClass} onClick={handleClick}>
      <span className={`${styles.status_dot} ${dotClassMap[name] || ''}`} />
      <span className={styles.tab_label}>
        {labelMap[name] || name.charAt(0).toUpperCase() + name.slice(1)}
      </span>
      <span className={styles.tab_count}>{total}</span>
    </div>
  );
}
