import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
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
import { Slot, Employee } from '@/types';

export function useFilter() {
  const dispatch = useAppDispatch();

  const { employees } = useEmployeesQuery();
  const [selection, setSelection] = useState<Slot | Record<string, never>>({});
  const date = useAppSelector(selectDate);
  const employee = useAppSelector(selectEmployee);
  const service = useAppSelector(selectService);

  const handleDateChange = (newDate: Dayjs) => {
    dispatch(setDate(newDate.toISOString()));
  };

  const handleEmployeeChange = (id: string | undefined) => {
    const selectedEmployee = id ? (employees as Employee[]).find((e) => e.id === id) : undefined;
    dispatch(setEmployee(selectedEmployee));
  };

  const handleSelectionChange = (data: Slot) => {
    setSelection(data);
  };

  const handleServiceChange = (serviceId: number) => {
    const svc = services.find((s) => s.id === serviceId);
    if (svc) {
      const { name, duration } = svc;
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
