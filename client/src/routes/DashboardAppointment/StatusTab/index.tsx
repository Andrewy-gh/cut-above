import { theme } from '../../../styles/styles';
import styles from './styles.module.css';
import PropTypes from 'prop-types';

const outlineStyle = {
  outline: `solid ${theme.palette.secondary.dark}`,
};

export default function StatusTab({ handleClick, name, total }) {
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
