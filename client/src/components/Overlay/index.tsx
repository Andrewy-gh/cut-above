
// @ts-expect-error TS(2307): Cannot find module './styles.module.css' or its co... Remove this comment to see the full error message
import styles from './styles.module.css';

// @ts-expect-error TS(7016): Could not find a declaration file for module 'prop... Remove this comment to see the full error message
import PropTypes from 'prop-types';

export default function Overlay({
  children
}: any) {
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
