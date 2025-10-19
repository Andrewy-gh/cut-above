import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { logoutUser } from '@/features/auth/authSlice';
import { clearMessage, setError } from '@/features/notificationSlice';

const baseUrl =
  // eslint-disable-next-line no-undef
  process.env.NODE_ENV === 'production'
    ? 'https://cutaboveshop.fly.dev'
    : '';

const baseQuery = fetchBaseQuery({
  baseUrl: baseUrl,
  credentials: 'include',
});

const baseQueryWithReauth = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);
  if (result?.error?.data?.error === 'Session expired, please log in') {
    api.dispatch(logoutUser());
    api.dispatch(setError(result?.error?.data?.error));
    api.dispatch(clearMessage());
  }
  return result;
};

export const apiSlice = createApi({
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Appointment', 'Employee', 'Schedule', 'User'],
  endpoints: () => ({}),
});
