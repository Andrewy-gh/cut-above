import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import Notification from '@/components/Notification';
import LoadingSpinner from '@/components/LoadingSpinner';
import styles from './styles.module.css';

export default function Layout() {
  return (
    <>
      <div className={styles.container}>
        <NavBar />
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
