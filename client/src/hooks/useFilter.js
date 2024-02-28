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
} from '@/features/filterSlice';
import { useEmployeesQuery } from './useEmployeesQuery';
import { services } from '@/data/data';

export function useFilter() {
  const dispatch = useDispatch();
  const { employees } = useEmployeesQuery();
  const [selection, setSelection] = useState({});
  const date = useSelector(selectDate);
  const employee = useSelector(selectEmployee);
  const service = useSelector(selectService);

  const handleDateChange = (newDate) => {
    dispatch(setDate(newDate.toISOString()));
  };

  const handleEmployeeChange = (id) => {
    const employee = id === 'any' ? 'any' : employees.find((e) => e.id === id);
    dispatch(setEmployee(employee));
  };

  const handleSelectionChange = (data) => {
    setSelection(data);
  };

  const handleServiceChange = (serviceId) => {
    const service = services.find((service) => service.id === serviceId);
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
