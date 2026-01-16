import { useSelector } from 'react-redux';
import {
  selectUserById,
  useGetUsersQuery,
} from '@/features/userSlice';
import type { RootState } from '@/app/store';

export function useUsersQuery(userId: string) {
  useGetUsersQuery();
  const user = useSelector((state: RootState) => selectUserById(state, userId));

  return { user };
}
