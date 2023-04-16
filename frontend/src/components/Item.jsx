import Paper from '@mui/material/Paper';
import { styled } from '@mui/material/styles';
import { theme } from '../styles/styles';

const StyledPaper = styled(Paper)(({ selected, theme }) => ({
  // backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
  backgroundColor: selected ? theme.palette.secondary.light : '#1A2027',
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: 'center',
  color: theme.palette.text.secondary,
  cursor: 'pointer',
  marginTop: theme.spacing(1),
  marginBottom: theme.spacing(1),
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  gap: '2rem',
}));

const Item = ({ selected, children }) => {
  return <StyledPaper selected={selected}>{children}</StyledPaper>;
};

export default Item;
