
// @ts-expect-error TS(2307): Cannot find module './styles.module.css' or its co... Remove this comment to see the full error message
import styles from './styles.module.css';

export default function LoadingSpinner() {
  return (
    <div className={styles.container}>
      <div className={styles.lds_spinner}>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>
    </div>
  );
}
