
// @ts-expect-error TS(2307): Cannot find module '@/components/Overlay' or its c... Remove this comment to see the full error message
import Overlay from '@/components/Overlay';
import { Link } from 'react-router-dom';

export default function Cancellation() {
  return (
    <Overlay>
      <main className="container-sm">
        <h5>Appointment Cancelled</h5>
        <p>
          Your booking has been cancelled. We are sorry to hear you can&apos;t
          make it. For any future needs, we are always here for you.
        </p>
        <p>
          If you need to book another appointment, please click{' '}
          <Link to="../bookings">
            <u>here</u>
          </Link>
          .
        </p>
      </main>
    </Overlay>
  );
}
