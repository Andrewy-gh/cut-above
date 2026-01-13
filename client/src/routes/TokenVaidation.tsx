import { Suspense } from 'react';
import { useParams, Outlet } from 'react-router-dom';

// @ts-expect-error TS(2307): Cannot find module '@/features/auth/authApiSlice' ... Remove this comment to see the full error message
import { useValidateTokenQuery } from '@/features/auth/authApiSlice';

// @ts-expect-error TS(2307): Cannot find module '@/components/LoadingSpinner' o... Remove this comment to see the full error message
import LoadingSpinner from '@/components/LoadingSpinner';

export default function TokenValidation() {
  const { token, id } = useParams();
  if (!id) {
    throw new Error('no id');
  }
  if (!token) {
    throw new Error('no token');
  }
  const {
    data: tokenStatus,
    isLoading,
    isSuccess,
    isError,
  } = useValidateTokenQuery({ id, token });
  if (isLoading) {
    return <p>Loading...</p>;
  } else if (isSuccess && tokenStatus.message === 'Token is valid') {
    return (
      <Suspense fallback={<LoadingSpinner />}>
        <Outlet />
      </Suspense>
    );
  } else if (isError) {
    throw new Error('Token is not valid');
  }
}
