import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';

// @ts-expect-error TS(2307): Cannot find module '@/hooks/useScheduleQuery' or i... Remove this comment to see the full error message
import { useScheduleQuery } from '@/hooks/useScheduleQuery';
import StatusColumn from './StatusColumn';
import StatusTab from './StatusTab';

// @ts-expect-error TS(2307): Cannot find module '@/utils/date' or its correspon... Remove this comment to see the full error message
import { formatDateFull, sortAndFormatApptByStartTime } from '@/utils/date';

// @ts-expect-error TS(2307): Cannot find module '@/utils/apptStatus' or its cor... Remove this comment to see the full error message
import { filterByApptStatus } from '@/utils/apptStatus';

// @ts-expect-error TS(2307): Cannot find module './styles.module.css' or its co... Remove this comment to see the full error message
import styles from './styles.module.css';

export default function DashboardAppointment() {
  const { id } = useParams();
  const { appointments } = useScheduleQuery(id);
  const formatTimeAppt = sortAndFormatApptByStartTime(appointments);
  const [status, setStatus] = useState('scheduled');
  const statuses = filterByApptStatus(formatTimeAppt);
  const filteredAppointments = statuses.find((st: any) => st.name === status).data;

  let content;
  if (formatTimeAppt.length < 1) {
    content = <h5>No Appointments made</h5>;
  } else {
    content = (
      <>
        <h5>{formatDateFull(formatTimeAppt[0].date)}</h5>
        <div className={styles.flex}>
          {statuses.map((status: any) => <StatusTab
            key={status.id}
            handleClick={() => setStatus(status.name)}
            name={status.name}
            total={status.data.length}
          />)}
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
