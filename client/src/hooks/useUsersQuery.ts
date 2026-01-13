import { useSelector } from 'react-redux';
import {
  selectAllUsers,
  selectUserById,
  useGetUsersQuery,
// @ts-expect-error TS(2307): Cannot find module '@/features/userSlice' or its c... Remove this comment to see the full error message
} from '@/features/userSlice';

export function useUsersQuery(userId: any) {
  const { data } = useGetUsersQuery();
  const users = useSelector(selectAllUsers);
  const user = useSelector((state) => selectUserById(state, userId));

  return { user };
}
