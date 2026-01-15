import { createSelector, createEntityAdapter, EntityState } from '@reduxjs/toolkit';
import { apiSlice } from '../app/api/apiSlice';
import { EmployeeProfile } from '@/types';
import type { RootState } from '../app/store';

export interface Employee {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: string;
  bio?: string;
}

const employeeAdapter = createEntityAdapter<Employee>({
  selectId: (employee) => employee._id,
});

const initialState = employeeAdapter.getInitialState();

export const extendedApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getEmployees: builder.query<EntityState<Employee>, void>({
      query: () => '/api/employees',
      transformResponse: (responseData: Employee[]) => {
        return employeeAdapter.setAll(initialState, responseData);
      },
      keepUnusedDataFor: 5,
      providesTags: ['Employee'],
    }),

    getEmployeesProfiles: builder.query<EmployeeProfile[], void>({
      query: () => '/api/employees/profiles',
      transformResponse: (responseData: EmployeeProfile[]) => responseData,
    })
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
  (state: RootState) => selectEmployeesData(state) ?? initialState
);
