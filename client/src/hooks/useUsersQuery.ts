import { useSelector } from 'react-redux';
import {
  selectAllUsers,
  selectUserById,
  useGetUsersQuery,
} from '@/features/userSlice';

export function useUsersQuery(userId: string) {
  const { data } = useGetUsersQuery();
  const users = useSelector(selectAllUsers);
  const user = useSelector((state) => selectUserById(state, userId));

  return { user };
}
