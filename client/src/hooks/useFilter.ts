import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Dayjs } from 'dayjs';
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
import { Slot } from '@/types';

export function useFilter() {
  const dispatch = useDispatch();

  const { employees } = useEmployeesQuery();
  const [selection, setSelection] = useState<Slot | Record<string, never>>({});
  const date = useSelector(selectDate);
  const employee = useSelector(selectEmployee);
  const service = useSelector(selectService);

  const handleDateChange = (newDate: Dayjs) => {
    dispatch(setDate(newDate.toISOString()));
  };

  const handleEmployeeChange = (id: string) => {
    const selectedEmployee = id === 'any' ? 'any' : employees.find((e: any) => e._id === id);
    dispatch(setEmployee(selectedEmployee));
  };

  const handleSelectionChange = (data: Slot) => {
    setSelection(data);
  };

  const handleServiceChange = (serviceId: number) => {
    const service = services.find((service: any) => service.id === serviceId);
    if (service) {
      const { name, duration } = service;
      dispatch(setService({ id: serviceId, name, duration }));
    }
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
