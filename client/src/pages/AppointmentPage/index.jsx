import { useParams, useSearchParams } from 'react-router-dom';
import { useGetSingleAppointmentQuery } from '@/features/appointments/apptApiSlice';
import { useValidateTokenQuery } from '@/features/userSlice';
import Component from './component';
import Error from './error';

// This is the single Appontment page shown when accessing through email
export default function AppointmentPage() {
  const { id } = useParams();
  let [searchParams, setSearchParams] = useSearchParams();
  let token = searchParams.get('token');
  const {
    data: tokenStatus,
    isLoading: isTokenStatusLoading,
    isSuccess: isTokenStatusSuccess,
    isError: isTokenStatusError,
  } = useValidateTokenQuery({ option: 'email', token });
  const {
    data: appointment,
    isLoading,
    isSuccess,
    isError,
  } = useGetSingleAppointmentQuery(id, { skip: isTokenStatusError });
  let content;
  if (isLoading || isTokenStatusLoading) {
    return <p>Loading...</p>;
  } else if (
    isSuccess &&
    isTokenStatusSuccess &&
    tokenStatus.message === 'Token is valid'
  ) {
    content = <Component appointment={appointment} token={token} />;
  } else if (isError || isTokenStatusError) {
    content = <Error />;
  }
  return <div className="container-lg">{content}</div>;
}
