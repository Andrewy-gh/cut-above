import { useSelector } from 'react-redux';
import { selectUserById } from './userSlice';
import CircleProgress from '../../components/Loading/CircleProgress';

const User = ({ userId }) => {
  const user = useSelector((state) => selectUserById(state, userId));

  if (!user) {
    return <p>Loading...</p>;
  }

  return <>{user.email}</>;
};

export default User;
