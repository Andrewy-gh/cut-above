import { Link } from 'react-router-dom';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardMedia from '@mui/material/CardMedia';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { useDispatch, useSelector } from 'react-redux';
import {
  selectEmployeeById,
  selectEmployeeIds,
  useGetEmployeesQuery,
} from './employeeSlice';
import SkeletonImage from '../../components/Loading/SkeletonImage';
import { setEmployee } from '../filter/filterSlice';

const Profile = ({ employeeId }) => {
  const dispatch = useDispatch();
  const employee = useSelector((state) =>
    selectEmployeeById(state, employeeId)
  );
  return (
    <Grid item xs={12} sm={6} md={4} sx={{ marginInline: 'auto' }}>
      <Card
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <CardMedia
          component="img"
          image={employee.image}
          alt={employee.firstName}
          sx={{
            aspectRatio: '9 / 16',
          }}
        />
        <CardContent sx={{ flexGrow: 1 }}>
          <Typography gutterBottom component="h4" variant="h5" align="center">
            {employee.firstName}
          </Typography>
          <Typography variant="body2" align="center">
            {employee.profile}
          </Typography>
        </CardContent>
        <CardActions sx={{ marginInline: 'auto', mb: 2 }}>
          <Link
            to="/reserve"
            // state={{ employee: employee.id }}
            onClick={() => dispatch(setEmployee(employeeId))}
          >
            <Button
              size="small"
              variant="contained"
            >{`Book with ${employee.firstName}`}</Button>
          </Link>
        </CardActions>
      </Card>
    </Grid>
  );
};

const EmployeeShowcase = () => {
  const { isLoading, isSuccess, isError, error } = useGetEmployeesQuery();

  const employees = useSelector(selectEmployeeIds);

  let content;
  if (isLoading) {
    content = Array.from(new Array(3)).map((a, i) => (
      <Grid
        item
        xs={12}
        sm={6}
        md={4}
        sx={{ marginInline: 'auto' }}
        key={`skeleton-element-${i}`}
      >
        <SkeletonImage />
      </Grid>
    ));
  } else if (isSuccess) {
    content = employees.map((employeeId) => (
      <Profile employeeId={employeeId} key={employeeId} />
    ));
  } else if (isError) {
    content = <p>{error}</p>;
  }
  return (
    <Container sx={{ py: 8 }}>
      <Typography component="h3" variant="h4" align="center" gutterBottom>
        Our Team
      </Typography>
      <Grid container spacing={4}>
        {content}
      </Grid>
    </Container>
  );
};

export default EmployeeShowcase;
