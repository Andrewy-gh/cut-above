import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import ButtonDialog from '../ButtonDialog';
import Container from '@mui/material/Container';
import DatePicker from '../Datepicker';
import CircleProgress from '../Loading/CircleProgress';
import TimeSlots from './TimeSlots';
import TimeSlotDetail from './TimeSlotDetail';
import dateServices from '../../features/date/date';
import {
  selectAllSchedule,
  selectScheduleByDate,
  selectScheduleByFilter,
  selectScheduleById,
  useGetScheduleQuery,
  useUpdateScheduleMutation,
} from '../../features/schedule/scheduleSlice';
import { useDispatch, useSelector } from 'react-redux';
import {
  clearSavedSelections,
  selectDate,
  selectDateDisabled,
  selectEmployee,
  selectHoldStatus,
  selectSavedSelections,
  setDate,
  setEmployee,
  setSavedSelections,
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
import { useCancelAppointmentMutation } from '../../features/appointments/apptApiSlice';
import {
  setError,
  setSuccess,
} from '../../features/notification/notificationSlice';
import { selectCurrentToken } from '../../features/auth/authSlice';
import ServiceSelect from './ServiceSelect';
import { selectService } from '../../features/filter/filterSlice';

// TODO: backend
// TODO: cohesive time formatting
const Search = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const date = useSelector(selectDate);
  const employeePref = useSelector(selectEmployee);
  const rescheduling = useSelector(selectRescheduling);
  const cancelId = useSelector(selectCancelId);
  const holding = useSelector(selectHoldStatus);
  const savedSelections = useSelector(selectSavedSelections);
  const service = useSelector(selectService);
  const convertedDate = dayjs(date);
  const dateDisabled = useSelector(selectDateDisabled);
  const token = useSelector(selectCurrentToken);
  const [addAppointment] = useAddAppointmentMutation();
  const [cancelAppointment] = useCancelAppointmentMutation();
  const [updateSchedule] = useUpdateScheduleMutation();
  const [sendConfirmation] = useSendConfirmationMutation();
  const [confirmDisabled, setConfirmDisabled] = useState(true);
  const [selected, setSelected] = useState({
    slot: savedSelections.slot,
    employee: savedSelections.employee,
  });
  const convertTimeFormat = (time) => dayjs(time, 'HH:mm').format('h:mma');

  const employee = useSelector((state) =>
    selectEmployeeById(state, selected.employee)
  );

  useEffect(() => {
    if (employeePref !== 'any') {
      setSelected({ ...selected, employee: employeePref });
    }
  }, [employeePref]);

  const { isLoading, isSuccess, isError, error } = useGetScheduleQuery();

  const handleDateChange = (newDate) => {
    setSelected({ ...selected, slot: null });
    dispatch(setDate(newDate.toISOString()));
  };

  const scheduleByDate = useSelector(selectScheduleByDate);
  const timeSlots = useSelector(selectScheduleByFilter);

  const slotInfo = timeSlots.find((ts) => ts.id === selected.slot);

  const bookDialog = {
    button: 'Book Now',
    title: 'Would you like to book this appointment?',
    content: `${service.name} with ${
      employee?.firstName
    } on ${dateServices.dateSlash(date)} from ${convertTimeFormat(
      slotInfo?.start
    )} to ${convertTimeFormat(slotInfo?.end)}?`,
  };

  let openDialog = false;
  if (holding) {
    openDialog = true;
  }

  const handleCancel = () => {
    dispatch(clearSavedSelections());
    openDialog = false;
  };

  console.log('employee', selected.employee);
  const handleBooking = async () => {
    try {
      if (!token) {
        navigate('/login');
        const { slot, employee } = selected;
        dispatch(setSavedSelections({ slot, employee }));
        return;
      }
      const dateToBook = dateServices.dateHyphen(date);
      const { start, end } = slotInfo;
      const newAppt = await addAppointment({
        date: dateToBook,
        start: `${dateToBook} ${start}`,
        end: `${dateToBook} ${end}`,
        service: service.name,
        employee: employee.id,
      }).unwrap();
      await updateSchedule({
        id: scheduleByDate.id,
        appointment: newAppt.data.id,
      });
      if (rescheduling && cancelId) {
        await cancelAppointment({ id: cancelId });
        dispatch(endRescheduling());
      }
      // await sendConfirmation({
      //   employee: employee.firstName,
      //   date: dateServices.dateSlash(date),
      //   time: dateServices.time(time),
      // });
      dispatch(clearSavedSelections());
      dispatch(setSuccess(newAppt.message));
    } catch (error) {
      dispatch(setError(`Error booking your appointment: ${error}`));
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
            gap: 2,
            mb: 3,
          }}
        >
          <ServiceSelect />
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
            closeHandler={handleCancel}
            openDialog={openDialog}
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
