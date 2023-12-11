import styles from './styles.module.css';

export default function Overlay({ children }) {
  return (
    <div className={styles.container}>
      <div className={styles.overlay}></div>
      <div className={styles.content}>{children}</div>
    </div>
  );
}
