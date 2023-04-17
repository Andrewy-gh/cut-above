import { useState } from 'react';
import Box from '@mui/material/Box';
import ButtonDialog from '../ButtonDialog';
import Container from '@mui/material/Container';
import DatePicker from '../Datepicker';
import CircleProgress from '../Loading/CircleProgress';
import TimeSlots from './TimeSlots';
import TimeSlotDetail from './TimeSlotDetail';
import dateServices from '../../features/date/date';
import {
  selectScheduleByFilter,
  selectScheduleById,
  useGetScheduleQuery,
  useUpdateScheduleMutation,
} from '../../features/schedule/scheduleSlice';
import { useDispatch, useSelector } from 'react-redux';
import {
  selectDate,
  selectDateDisabled,
  selectEmployee,
  setDate,
  setEmployee,
} from '../../features/filter/filterSlice';
import { selectEmployeeById } from '../../features/employees/employeeSlice';
import EmployeeSelect from '../../features/employees/EmployeeSelect';
import DateDisabledSwitch from '../../features/filter/DateDisabledSwitch';
import dayjs from 'dayjs';
import Employee from '../../features/employees/Employee';
import { useAddAppointmentMutation } from '../../features/appointments/apptApiSlice';
import { useSendConfirmationMutation } from '../../features/email/emailSlice';
import {
  endRescheduling,
  selectCancelId,
  selectRescheduling,
} from '../../features/appointments/appointmentSlice';

const Search = () => {
  const dispatch = useDispatch();
  const date = useSelector(selectDate);
  const employeePref = useSelector(selectEmployee);
  const rescheduling = useSelector(selectRescheduling);
  const cancelId = useSelector(selectCancelId);
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

  const appointment = useSelector(({ appointment }) => appointment);
  console.log('appointment', appointment);

  const bookDialog = {
    button: 'Book Now',
    title: 'Would you like to book this appointment?',
    content: `With ${employee?.firstName} on ${dateServices.dateSlash(
      slotInfo?.date
    )} on ${dateServices.time(slotInfo?.time)}?`,
  };

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
    content = <CircleProgress />;
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
          <ButtonDialog
            disabled={confirmDisabled}
            dialog={bookDialog}
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

export default Search;
