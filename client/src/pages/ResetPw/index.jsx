import { useValidateTokenQuery } from '@/features/userSlice';
import Component from './component';
import Error from './error';

// This is the Reset Password page when accessed through email
export default function ResetPw() {
  let [searchParams, setSearchParams] = useSearchParams();

  let token = searchParams.get('token');

  const {
    data: tokenStatus,
    isLoading,
    isSuccess,
    isError,
  } = useValidateTokenQuery({ option: 'reset', token });

  let content;
  if (isLoading) {
    return <p>Loading...</p>;
  } else if (isSuccess && tokenStatus.message === 'Token is valid') {
    content = <Component token={token} />;
  } else if (isError) {
    content = <Error />;
  }
  return <div className="container-sm">{content}</div>;
}
