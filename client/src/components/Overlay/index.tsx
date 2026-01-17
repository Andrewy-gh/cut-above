import { ReactNode } from 'react';
import styles from './styles.module.css';

interface OverlayProps {
  children: ReactNode;
}

export default function Overlay({ children }: OverlayProps) {
  return (
    <div className={styles.container}>
      <div className={styles.overlay}></div>
      <div className={styles.content}>{children}</div>
    </div>
  );
}
