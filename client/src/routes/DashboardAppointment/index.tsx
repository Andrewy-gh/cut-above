import { useState } from 'react';
import { Link, useParams } from 'react-router';
import { useScheduleQuery } from '@/hooks/useScheduleQuery';
import StatusColumn from './StatusColumn';
import StatusTab from './StatusTab';
import { formatDateFull, sortAndFormatApptByStartTime } from '@/utils/date';
import { filterByApptStatus } from '@/utils/apptStatus';
import styles from './styles.module.css';

export default function DashboardAppointment() {
  const { id } = useParams<{ id: string }>();
  const { appointments } = useScheduleQuery(id);
  const formatTimeAppt = sortAndFormatApptByStartTime(appointments || []);
  const [status, setStatus] = useState('scheduled');
  const statuses = filterByApptStatus(formatTimeAppt);

  const currentStatusData = statuses.find((st) => st.name === status);
  const filteredAppointments = currentStatusData ? currentStatusData.data : [];

  let content;
  if (!appointments || formatTimeAppt.length < 1) {
    content = <h5>No Appointments made</h5>;
  } else {
    content = (
      <>
        <h5>{formatDateFull(formatTimeAppt[0].date)}</h5>
        <div className={styles.flex}>
          {statuses.map((st) => (
            <StatusTab
              key={st.id}
              handleClick={() => setStatus(st.name)}
              name={st.name}
              total={st.data.length}
            />
          ))}
        </div>
        <StatusColumn appointments={filteredAppointments} status={status} />
      </>
    );
  }

  return (
    <main className="container-lg mb-16">
      <div className="mt-4">
        <Link to="../dashboard">Back to Schedule Dashboard </Link>
      </div>
      {content}
    </main>
  );
}
