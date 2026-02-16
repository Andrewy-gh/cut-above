import { Navigate, useParams } from 'react-router';

export default function LegacyRescheduleRedirect() {
  const { id } = useParams<{ id: string }>();
  if (!id) return <Navigate to="/bookings" replace />;
  return <Navigate to={`/account/appointments/${id}/reschedule`} replace />;
}

