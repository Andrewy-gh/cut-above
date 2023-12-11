import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import NavBar from '../navbar';
import Footer from '../Footer';
import Notification from '../Notification';
import LoadingSpinner from '../LoadingSpinner';
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
