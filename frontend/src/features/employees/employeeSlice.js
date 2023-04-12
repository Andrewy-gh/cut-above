import { createSelector, createEntityAdapter } from '@reduxjs/toolkit';
import { apiSlice } from '../../app/api/apiSlice';

const employeeAdapter = createEntityAdapter({});

const initialState = employeeAdapter.getInitialState();

export const extendedApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getEmployees: builder.query({
      query: () => '/employee',
      transformResponse: (responseData) => {
        return employeeAdapter.setAll(initialState, responseData);
      },
      keepUnusedDataFor: 5,
    }),
  }),
});

export const { useGetEmployeesQuery } = extendedApiSlice;

export const selectEmployeesResult =
  extendedApiSlice.endpoints.getEmployees.select();

const selectEmployeesData = createSelector(
  selectEmployeesResult,
  (employeeResult) => employeeResult.data // normalized state object with ids & entities
);

export const { selectAll: selectAllEmployees, selectById: selectEmployeeById } =
  employeeAdapter.getSelectors(
    (state) => selectEmployeesData(state) ?? initialState
  );
