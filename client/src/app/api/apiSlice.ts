import {
  createApi,
  fetchBaseQuery,
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import { logoutUser } from "@/features/auth/authSlice";
import { clearMessage, setError } from "@/features/notificationSlice";
import { getErrorMessage, isUnauthorized } from "@/utils/apiError";

const baseUrl = import.meta.env.VITE_API_URL || "";

const baseQuery = fetchBaseQuery({
  baseUrl: baseUrl,
  credentials: "include",
});

const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  const result = await baseQuery(args, api, extraOptions);
  if (result?.error && isUnauthorized(result.error)) {
    api.dispatch(logoutUser());
    api.dispatch(setError(getErrorMessage(result.error)));
    api.dispatch(clearMessage());
  }
  return result;
};

export const apiSlice = createApi({
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Appointment", "Employee", "Schedule", "User"] as const,
  endpoints: () => ({}),
});
