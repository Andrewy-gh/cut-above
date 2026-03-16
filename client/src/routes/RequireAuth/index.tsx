import { Suspense } from 'react';
import { useLocation, Navigate, Outlet } from 'react-router';

import LoadingSpinner from '@/components/LoadingSpinner';
import { useAuth } from '../../hooks/useAuth';
import AccessDenied from './AccessDenied';

interface RequireAuthProps {
  requiredRole?: string;
}

export default function RequireAuth({ requiredRole }: RequireAuthProps) {
  const { role, user, isAuthLoading } = useAuth();
  const location = useLocation();

  if (isAuthLoading) {
    return (
      <Suspense fallback={<LoadingSpinner />}>
        <LoadingSpinner />
      </Suspense>
    );
  }
  if (!user) {
    const returnTo = `${location.pathname}${location.search}${location.hash}`;
    const loginTo = `/login?returnTo=${encodeURIComponent(returnTo)}`;
    return <Navigate to={loginTo} state={{ from: returnTo }} replace />;
  }

  if (requiredRole && role !== requiredRole) {
    return <AccessDenied requiredRole={requiredRole} />;
  }

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Outlet />
    </Suspense>
  );
}
