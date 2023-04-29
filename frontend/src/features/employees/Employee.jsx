import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import { useSelector } from 'react-redux';
import { useGetEmployeesQuery } from './employeeSlice';
import { selectEmployeeById } from './employeeSlice';
import CircleProgress from '../../components/Loading/CircleProgress';

const selectedFont = {
  color: '#1A2027',
};

const Employee = ({ selected, employeeId }) => {
  const { isLoading, isSuccess, isError, error } = useGetEmployeesQuery();
  const employee = useSelector((state) =>
    selectEmployeeById(state, employeeId)
  );

  if (!employee) {
    return <p>Loading...</p>;
  }

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
        <Typography variant="body1" style={selected ? selectedFont : null}>
          {employee.firstName}
        </Typography>
      </>
    );
  } else if (isError) {
    content = <p>{error}</p>;
  }

  return <>{content}</>;
};

export default Employee;
