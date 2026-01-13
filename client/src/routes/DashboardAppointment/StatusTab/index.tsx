import { theme } from '../../../styles/styles';

// @ts-expect-error TS(2307): Cannot find module './styles.module.css' or its co... Remove this comment to see the full error message
import styles from './styles.module.css';

// @ts-expect-error TS(7016): Could not find a declaration file for module 'prop... Remove this comment to see the full error message
import PropTypes from 'prop-types';

const outlineStyle = {
  outline: `solid ${theme.palette.secondary.dark}`,
};

export default function StatusTab({
  handleClick,
  name,
  total
}: any) {
  return (
    <div
      className={`body1 ${styles.tab}`}
      style={outlineStyle}
      onClick={handleClick}
    >
      <div>{name.charAt(0).toUpperCase() + name.slice(1)}</div>
      <h5 style={{ margin: 0, color: theme.palette.primary.dark }}>{total}</h5>
    </div>
  );
}

StatusTab.propTypes = {
  handleClick: PropTypes.func.isRequired,
  name: PropTypes.string.isRequired,
  total: PropTypes.number.isRequired,
};
