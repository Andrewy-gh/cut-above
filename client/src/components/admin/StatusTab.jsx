import { theme } from '../../styles/styles';

const tabStyle = {
  cursor: 'pointer',
  padding: '.65rem',
  borderRadius: '12.5px',
  outline: `solid ${theme.palette.secondary.dark}`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '1rem',
  flexWrap: 'wrap',
};

export default function StatusTab({ handleClick, name, data }) {
  return (
    <div className="body1" style={tabStyle} onClick={handleClick}>
      <div>{name.charAt(0).toUpperCase() + name.slice(1)}</div>
      <h5 style={{ margin: 0, color: theme.palette.primary.dark }}>
        {data.length}
      </h5>
    </div>
  );
}
