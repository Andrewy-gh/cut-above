import { Suspense } from 'react';
import { useLocation, Navigate, Outlet } from 'react-router-dom';

// @ts-expect-error TS(2307): Cannot find module '@/components/LoadingSpinner' o... Remove this comment to see the full error message
import LoadingSpinner from '@/components/LoadingSpinner';
import { useAuth } from '../../hooks/useAuth';

// @ts-expect-error TS(7016): Could not find a declaration file for module 'prop... Remove this comment to see the full error message
import PropTypes from 'prop-types';

export default function RequireAuth({
  requiredRole
}: any) {
  const { role, user } = useAuth();
  const location = useLocation();
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole && role !== requiredRole) {
    throw new Error('Not authorized');
  }

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Outlet />
    </Suspense>
  );
}

RequireAuth.propTypes = {
  requiredRole: PropTypes.string,
};
