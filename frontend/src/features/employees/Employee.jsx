import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import { useSelector } from 'react-redux';
import { useGetEmployeesQuery } from './employeeSlice';
import { selectEmployeeById } from './employeeSlice';

const Item = styled(Paper)(({ theme }) => ({
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

const Employee = ({ employeeId }) => {
  const { isLoading, isSuccess, isError, error } = useGetEmployeesQuery();
  const employee = useSelector((state) =>
    selectEmployeeById(state, employeeId)
  );

  let content;
  if (isLoading) {
    content = <p>Loading...</p>;
  } else if (isSuccess) {
    content = (
      <>
        <Avatar
          alt={`${employee.firstName} avatar`}
          src={employee.image}
          sx={{ width: 56, height: 56 }}
        />
        <Typography variant="body1">{employee.firstName}</Typography>
      </>
    );
  } else if (isError) {
    content = <p>{error}</p>;
  }

  return <Item>{content}</Item>;
};

export default Employee;
