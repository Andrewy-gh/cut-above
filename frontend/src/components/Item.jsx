import Paper from '@mui/material/Paper';
import { styled } from '@mui/material/styles';
import { theme } from '../styles/styles';

const StyledPaper = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
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

const Item = ({ children }) => {
  return <StyledPaper>{children}</StyledPaper>;
};

export default Item;
