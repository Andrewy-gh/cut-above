import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  resetFilter,
  selectDate,
  selectEmployee,
  selectService,
  setDate,
  setEmployee,
  setService,
// @ts-expect-error TS(2307): Cannot find module '@/features/filterSlice' or its... Remove this comment to see the full error message
} from '@/features/filterSlice';
import { useEmployeesQuery } from './useEmployeesQuery';

// @ts-expect-error TS(2307): Cannot find module '@/data/data' or its correspond... Remove this comment to see the full error message
import { services } from '@/data/data';

export function useFilter() {
  const dispatch = useDispatch();

  // @ts-expect-error TS(2554): Expected 1 arguments, but got 0.
  const { employees } = useEmployeesQuery();
  const [selection, setSelection] = useState({});
  const date = useSelector(selectDate);
  const employee = useSelector(selectEmployee);
  const service = useSelector(selectService);

  const handleDateChange = (newDate: any) => {
    dispatch(setDate(newDate.toISOString()));
  };

  const handleEmployeeChange = (id: any) => {

    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    const employee = id === 'any' ? 'any' : employees.find((e: any) => e.id === id);
    dispatch(setEmployee(employee));
  };

  const handleSelectionChange = (data: any) => {
    setSelection(data);
  };

  const handleServiceChange = (serviceId: any) => {
    const service = services.find((service: any) => service.id === serviceId);
    const { name, duration } = service;
    dispatch(setService({ id: serviceId, name, duration }));
  };

  const handleFilterReset = () => {
    dispatch(resetFilter());
  };

  return {
    date,
    employee,
    handleDateChange,
    handleEmployeeChange,
    handleFilterReset,
    handleSelectionChange,
    handleServiceChange,
    selection,
    service,
    services,
  };
}
