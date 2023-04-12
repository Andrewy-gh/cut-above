import { useState } from 'react';
import Box from '@mui/material/Box';
import ConfirmDialog from '../../components/ConfirmDialog';
import Container from '@mui/material/Container';
import DatePicker from '../../components/Datepicker';
import TimeSlots from '../../components/TimeSlots';
import TimeSlotDetail from '../../components/TimeSlotDetail';
import dateServices from '../date/date';
import {
  selectAllSchedule,
  selectScheduleById,
  useGetScheduleQuery,
} from './scheduleSlice';
import { useDispatch, useSelector } from 'react-redux';
import {
  selectDate,
  selectDateDisabled,
  selectEmployee,
  setDate,
  setEmployee,
} from '../filter/filterSlice';
import { selectEmployeeById } from '../employees/employeeSlice';
import EmployeeSelect from '../employees/EmployeeSelect';
import DateDisabledSwitch from '../filter/DateDisabledSwitch';
import dayjs from 'dayjs';
import Employee from '../employees/Employee';
const BookingPage = () => {
  const dispatch = useDispatch();
  const date = useSelector(selectDate);
  const employeePref = useSelector(selectEmployee);
  const convertedDate = dayjs(date);
  const dateDisabled = useSelector(selectDateDisabled);
  const [confirmDisabled, setConfirmDisabled] = useState(true);
  const [selected, setSelected] = useState({
    slot: null,
    employee: null,
  });
  const employee = useSelector((state) =>
    selectEmployeeById(state, selected.employee)
  );
  const slotInfo = useSelector((state) =>
    selectScheduleById(state, selected.slot)
  );

  if (employeePref !== 'any') {
    setEmployee({ ...selected, employee: employeePref });
  }

  console.log('selected slot:', selected.slot);
  // console.log(
  //   'employeePref:',
  //   employeePref,
  //   'selected employee:',
  //   selected.employee,
  //   'selected slot:',
  //   selected.slot,
  //   'slot info:',
  //   slotInfo
  // );

  // Change selected on select change
  // Employee option: disabled = false

  const { isLoading, isSuccess, isError, error } = useGetScheduleQuery();

  const schedule = useSelector(selectAllSchedule);

  const handleDateChange = (newDate) => {
    dispatch(setDate(newDate.toISOString()));
  };

  const timeSlots = schedule.filter(
    (s) => dateServices.dateHyphen(s.date) === dateServices.dateHyphen(date)
  );

  const reserveDialog = {
    button: 'Reserve Now',
    title: 'Would you like to reserve this appointment?',
    content: `With ${employee?.firstName} on ${dateServices.dateSlash(
      slotInfo?.date
    )} on ${dateServices.time(slotInfo?.time)}?`,
  };

  let content;
  if (isLoading) {
    content = <p>Loading...</p>;
  } else if (isSuccess) {
    content = (
      <Container>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            // flexDirection: { sm: 'row', md: 'column' },
            alignItems: 'center',
            gap: 1,
            mb: 3,
          }}
        >
          <EmployeeSelect
            setConfirmDisabled={setConfirmDisabled}
            selected={selected}
            setSelected={setSelected}
          />
          <DateDisabledSwitch />
          <DatePicker
            date={convertedDate}
            handleDateChange={handleDateChange}
            dateDisabled={dateDisabled}
          />
          <TimeSlots
            timeSlots={timeSlots}
            selected={selected}
            setConfirmDisabled={setConfirmDisabled}
            setSelected={setSelected}
          />
          {selected.slot && employeePref === 'any' && (
            <TimeSlotDetail
              key={selected.slot}
              selected={selected}
              setConfirmDisabled={setConfirmDisabled}
              setSelected={setSelected}
            />
          )}
          {employeePref !== 'any' && <Employee employeeId={employeePref} />}
          <ConfirmDialog disabled={confirmDisabled} dialog={reserveDialog} />
        </Box>
      </Container>
    );
  } else if (isError) {
    content = <p>{error}</p>;
  }

  return <main>{content}</main>;
};

export default BookingPage;
