import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';

// @ts-expect-error TS(2307): Cannot find module '@/components/Navbar' or its co... Remove this comment to see the full error message
import Navbar from '@/components/Navbar';

// @ts-expect-error TS(2307): Cannot find module '@/components/Footer' or its co... Remove this comment to see the full error message
import Footer from '@/components/Footer';

// @ts-expect-error TS(2307): Cannot find module '@/components/Notification' or ... Remove this comment to see the full error message
import Notification from '@/components/Notification';

// @ts-expect-error TS(2307): Cannot find module '@/components/LoadingSpinner' o... Remove this comment to see the full error message
import LoadingSpinner from '@/components/LoadingSpinner';

// @ts-expect-error TS(2307): Cannot find module './styles.module.css' or its co... Remove this comment to see the full error message
import styles from './styles.module.css';

export default function Layout() {
  return (
    <>
      <div className={styles.container}>
        <Navbar />
        <div className={styles.grow}>
          <Suspense fallback={<LoadingSpinner />}>
            <Outlet />
          </Suspense>
        </div>
        <Footer />
      </div>
      <Notification />
    </>
  );
}
