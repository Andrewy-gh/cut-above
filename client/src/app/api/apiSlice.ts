
// @ts-expect-error TS(2307): Cannot find module '@reduxjs/toolkit/query/react' ... Remove this comment to see the full error message
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// @ts-expect-error TS(2307): Cannot find module '@/features/auth/authSlice' or ... Remove this comment to see the full error message
import { logoutUser } from '@/features/auth/authSlice';

// @ts-expect-error TS(2307): Cannot find module '@/features/notificationSlice' ... Remove this comment to see the full error message
import { clearMessage, setError } from '@/features/notificationSlice';

const baseUrl =

  // @ts-expect-error TS(2591): Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
  // eslint-disable-next-line no-undef
  process.env.NODE_ENV === 'production'
    ? 'https://cutaboveshop.fly.dev'
    : '';

const baseQuery = fetchBaseQuery({
  baseUrl: baseUrl,
  credentials: 'include',
});

const baseQueryWithReauth = async (args: any, api: any, extraOptions: any) => {
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
