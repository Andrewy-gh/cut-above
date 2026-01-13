import styles from './styles.module.css';
import PropTypes from 'prop-types';

export default function Overlay({ children }) {
  return (
    <div className={styles.container}>
      <div className={styles.overlay}></div>
      <div className={styles.content}>{children}</div>
    </div>
  );
}

Overlay.propTypes = {
  children: PropTypes.object.isRequired,
};
