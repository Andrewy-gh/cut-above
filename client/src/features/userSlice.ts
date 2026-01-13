import { createSelector, createEntityAdapter } from '@reduxjs/toolkit';
import { apiSlice } from '../app/api/apiSlice';

export interface User {
  _id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: string;
}

const userAdapter = createEntityAdapter<User>({
  selectId: (user) => user._id,
});

const initialState = userAdapter.getInitialState();

export const extendedApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getUsers: builder.query<ReturnType<typeof userAdapter.getInitialState>, void>({
      query: () => '/api/user',
      transformResponse: (responseData: User[]) => {
        return userAdapter.setAll(initialState, responseData);
      },
    })
  }),
});

export const { useGetUsersQuery } = extendedApiSlice;

export const selectUsersResult = extendedApiSlice.endpoints.getUsers.select();

const selectUsersData = createSelector(
  selectUsersResult,
  (userResult) => userResult.data
);

export const {
  selectAll: selectAllUsers,
  selectById: selectUserById,
  selectIds: selectUserIds,
} = userAdapter.getSelectors((state: any) => selectUsersData(state) ?? initialState);
