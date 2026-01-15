import { useSelector } from 'react-redux';
import {
  selectAllUsers,
  selectUserById,
  useGetUsersQuery,
} from '@/features/userSlice';
import type { RootState } from '@/app/store';

export function useUsersQuery(userId: string) {
  const { data } = useGetUsersQuery();
  const users = useSelector(selectAllUsers);
  const user = useSelector((state: RootState) => selectUserById(state, userId));

  return { user };
}
