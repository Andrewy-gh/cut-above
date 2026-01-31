import { Suspense } from 'react';
import { useLocation, Navigate, Outlet } from 'react-router';

import LoadingSpinner from '@/components/LoadingSpinner';
import { useAuth } from '../../hooks/useAuth';

interface RequireAuthProps {
  requiredRole?: string;
}

export default function RequireAuth({ requiredRole }: RequireAuthProps) {
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
