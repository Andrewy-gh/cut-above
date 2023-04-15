import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import { theme } from '../../styles/styles';
import { useSelector } from 'react-redux';
import { useGetEmployeesQuery } from './employeeSlice';
import { selectEmployeeById } from './employeeSlice';
import CircleProgress from '../../components/Loading/CircleProgress';

const Employee = ({ employeeId }) => {
  const { isLoading, isSuccess, isError, error } = useGetEmployeesQuery();
  const employee = useSelector((state) =>
    selectEmployeeById(state, employeeId)
  );
  console.log(employee);

  let content;
  if (isLoading) {
    content = <CircleProgress />;
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

  return <>{content}</>;
};

export default Employee;
