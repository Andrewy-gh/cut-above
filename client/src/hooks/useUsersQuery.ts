import { useAppSelector } from '@/app/hooks';
import {
  selectUserById,
  useGetUsersQuery,
} from '@/features/userSlice';
export function useUsersQuery(userId: string) {
  useGetUsersQuery();
  const user = useAppSelector((state) => selectUserById(state, userId));

  return { user };
}
