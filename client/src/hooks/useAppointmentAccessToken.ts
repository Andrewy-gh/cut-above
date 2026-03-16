import { useLocation } from 'react-router';

const isPlausibleToken = (value: string | null) =>
  Boolean(value && /^[a-f0-9]{64}$/i.test(value));

export function useAppointmentAccessToken() {
  const location = useLocation();
  const token = new URLSearchParams(location.search).get('token');
  return isPlausibleToken(token) ? token : null;
}
