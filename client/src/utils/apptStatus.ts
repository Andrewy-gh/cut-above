import { Appointment, AppointmentStatusGroup } from '@/types';

export const filterByApptStatus = (apptObj: Appointment[]): AppointmentStatusGroup[] => {
  const scheduled = apptObj.filter((appt) => appt.status === 'scheduled');
  const checkedIn = apptObj.filter((appt) => appt.status === 'checked-in');
  const completed = apptObj.filter((appt) => appt.status === 'completed');
  const statuses: AppointmentStatusGroup[] = [
    { id: 1, name: 'scheduled', data: scheduled },
    { id: 2, name: 'checked-in', data: checkedIn },
    { id: 3, name: 'completed', data: completed },
  ];
  return statuses;
};
