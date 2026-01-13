import { createApi, fetchBaseQuery, BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query/react';
import { logoutUser } from '@/features/auth/authSlice';
import { clearMessage, setError } from '@/features/notificationSlice';

const baseUrl = import.meta.env.PROD
  ? 'https://cutaboveshop.fly.dev'
  : '';

const baseQuery = fetchBaseQuery({
  baseUrl: baseUrl,
  credentials: 'include',
});

const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);
  if (result?.error?.data && (result.error.data as any).error === 'Session expired, please log in') {
    api.dispatch(logoutUser());
    api.dispatch(setError((result.error.data as any).error));
    api.dispatch(clearMessage());
  }
  return result;
};

export const apiSlice = createApi({
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Appointment', 'Employee', 'Schedule', 'User'] as const,
  endpoints: () => ({}),
});
