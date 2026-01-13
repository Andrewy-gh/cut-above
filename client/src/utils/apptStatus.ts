export const filterByApptStatus = (apptObj: any) => {
  const scheduled = apptObj.filter((appt: any) => appt.status === 'scheduled');
  const checkedIn = apptObj.filter((appt: any) => appt.status === 'checked-in');
  const completed = apptObj.filter((appt: any) => appt.status === 'completed');
  const statuses = [
    { id: 1, name: 'scheduled', data: scheduled },
    { id: 2, name: 'checked-in', data: checkedIn },
    { id: 3, name: 'completed', data: completed },
  ];
  return statuses;
};
