import { useState } from 'react';
import Box from '@mui/material/Box';
import ConfirmDialog from '../../components/ConfirmDialog';
import Container from '@mui/material/Container';
import DatePicker from '../../components/Datepicker';
import TimeSlots from '../../components/TimeSlots';
import TimeSlotDetail from '../../components/TimeSlotDetail';
import dateServices from '../date/date';
import {
  selectScheduleByFilter,
  selectScheduleById,
  useGetScheduleQuery,
  useUpdateScheduleMutation,
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
import { useAddAppointmentMutation } from '../appointments/appointmentSlice';
import { useSendConfirmationMutation } from '../email/emailSlice';

const BookingPage = () => {
  const dispatch = useDispatch();
  const date = useSelector(selectDate);
  const employeePref = useSelector(selectEmployee);
  const convertedDate = dayjs(date);
  const dateDisabled = useSelector(selectDateDisabled);
  const [addAppointment] = useAddAppointmentMutation();
  const [updateSchedule] = useUpdateScheduleMutation();
  const [sendConfirmation] = useSendConfirmationMutation();
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

  const { isLoading, isSuccess, isError, error } = useGetScheduleQuery();

  const handleDateChange = (newDate) => {
    setSelected({ ...selected, slot: null });
    dispatch(setDate(newDate.toISOString()));
  };

  const timeSlots = useSelector(selectScheduleByFilter);

  const reserveDialog = {
    button: 'Reserve Now',
    title: 'Would you like to reserve this appointment?',
    content: `With ${employee?.firstName} on ${dateServices.dateSlash(
      slotInfo?.date
    )} on ${dateServices.time(slotInfo?.time)}?`,
  };

  // TODO: check if I need to repopulate
  const handleBooking = async () => {
    try {
      const { id, date, time } = slotInfo;
      const newAppt = await addAppointment({
        date,
        time,
        employee: employee.id,
      }).unwrap();
      await updateSchedule({
        id,
        appointment: newAppt.data.id,
        employee: employee.id,
      });
      const sentConfirmation = await sendConfirmation({
        employee: employee.firstName,
        date: dateServices.dateSlash(date),
        time: dateServices.time(time),
      });
      console.log('sentConfirmtaion response:', sentConfirmation);
    } catch (error) {
      console.error('Error booking your appointment:', error);
    }
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
            minDate={dayjs()}
            maxDate={dayjs().add(1, 'month')}
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
          <ConfirmDialog
            disabled={confirmDisabled}
            dialog={reserveDialog}
            agreeHandler={handleBooking}
          />
        </Box>
      </Container>
    );
  } else if (isError) {
    content = <p>{error}</p>;
  }

  return <main>{content}</main>;
};

export default BookingPage;
