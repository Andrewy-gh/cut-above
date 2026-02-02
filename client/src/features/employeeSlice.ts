import { createEntityAdapter, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../app/store';
import { useEffect } from 'react';
import { useQuery } from '@/convex/client';
import { api } from '../../../convex/_generated/api';
import { useAppDispatch } from '@/app/hooks';

export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: string;
  bio?: string;
}

const employeeAdapter = createEntityAdapter<Employee>();

const initialState = employeeAdapter.getInitialState();

const employeeSlice = createSlice({
  name: 'employees',
  initialState,
  reducers: {
    setEmployees: (state, action: PayloadAction<Employee[]>) => {
      employeeAdapter.setAll(state, action.payload);
    },
    clearEmployees: (state) => {
      employeeAdapter.removeAll(state);
    },
  },
});

export const { setEmployees, clearEmployees } = employeeSlice.actions;
export default employeeSlice.reducer;

export const {
  selectAll: selectAllEmployees,
  selectById: selectEmployeeById,
  selectIds: selectEmployeeIds,
} = employeeAdapter.getSelectors(
  (state: RootState) => state.employees ?? initialState
);

export const useGetEmployeesQuery = () => {
  const dispatch = useAppDispatch();
  const data = useQuery(api.employees.getEmployees, {});

  useEffect(() => {
    if (data) {
      dispatch(setEmployees(data));
    }
  }, [data, dispatch]);

  return {
    data,
    isLoading: data === undefined,
    isSuccess: Boolean(data),
    isError: false,
  };
};

export const useGetEmployeesProfilesQuery = () => {
  const data = useQuery(api.employees.getEmployeeProfiles, {});

  return {
    data,
    isLoading: data === undefined,
    isSuccess: Boolean(data),
    isError: false,
  };
};
