import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  selectDate,
  selectEmployee,
  selectService,
  setDate,
  setEmployee,
  setService,
} from '../features/filterSlice';
import { services } from '../data/data';

import { formatDate } from '../utils/date';

export function useFilter() {
  const dispatch = useDispatch();
  const [selection, setSelection] = useState({});
  const date = useSelector(selectDate);
  const employee = useSelector(selectEmployee);
  const service = useSelector(selectService);

  const handleDateChange = (newDate) => {
    dispatch(setDate(formatDate(newDate)));
  };

  const handleEmployeeChange = (id) => {
    dispatch(setEmployee(id));
  };
  const handleSelectionChange = (data) => {
    setSelection(data);
  };
  const handleServiceChange = (serviceId) => {
    const service = services.find((service) => service.id === serviceId);
    const { name, duration } = service;
    dispatch(setService({ id: serviceId, name, duration }));
  };
  return {
    date,
    employee,
    handleDateChange,
    handleEmployeeChange,
    handleSelectionChange,
    handleServiceChange,
    selection,
    service,
    services,
  };
}
