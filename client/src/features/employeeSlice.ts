import { createSelector, createEntityAdapter } from '@reduxjs/toolkit';
import { apiSlice } from '../app/api/apiSlice';

const employeeAdapter = createEntityAdapter({});

const initialState = employeeAdapter.getInitialState();

export const extendedApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getEmployees: builder.query({
      query: () => '/api/employees',
      transformResponse: (responseData) => {
        return employeeAdapter.setAll(initialState, responseData);
      },
      keepUnusedDataFor: 5,
      providesTags: ['Employee'],
    }),
    getEmployeesProfiles: builder.query({
      query: () => '/api/employees/profiles',
      transformResponse: (responseData) => responseData,
    }),
  }),
});

export const { useGetEmployeesQuery, useGetEmployeesProfilesQuery } =
  extendedApiSlice;

export const selectEmployeesResult =
  extendedApiSlice.endpoints.getEmployees.select();

const selectEmployeesData = createSelector(
  selectEmployeesResult,
  (employeeResult) => employeeResult.data
);

export const {
  selectAll: selectAllEmployees,
  selectById: selectEmployeeById,
  selectIds: selectEmployeeIds,
} = employeeAdapter.getSelectors(
  (state) => selectEmployeesData(state) ?? initialState
);
