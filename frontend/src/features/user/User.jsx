import { useSelector } from 'react-redux';
import { useGetUsersQuery, selectUserById } from './userSlice';
import CircleProgress from '../../components/Loading/CircleProgress';

const User = ({ userId }) => {
  const { isLoading, isSuccess, isError, error } = useGetUsersQuery();
  const user = useSelector((state) => selectUserById(state, userId));

  if (!user) {
    return <p>Loading...</p>;
  }

  return <>{user.email}</>;
};

export default User;
