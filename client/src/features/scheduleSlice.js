import { createSelector, createEntityAdapter } from '@reduxjs/toolkit';
import { apiSlice } from '../app/api/apiSlice';
import { selectEmployeeIds } from './employeeSlice';
import { selectDate, selectEmployee, selectService } from './filterSlice';
import { findAvailableTimeSlots, formatDate } from '../utils/date';

// import dayjs from 'dayjs';
// import customParseFormat from 'dayjs/plugin/customParseFormat';
// dayjs.extend(customParseFormat);

const scheduleAdapter = createEntityAdapter({});

const initialState = scheduleAdapter.getInitialState();

export const extendedApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getSchedule: builder.query({
      query: () => '/api/schedule',
      transformResponse: (responseData) => {
        const loadedPosts = responseData;
        return scheduleAdapter.setAll(initialState, loadedPosts);
      },
      // keepUnusedDataFor: 5,
      providesTags: ['Schedule'],
    }),
    addSchedule: builder.mutation({
      query: (schedule) => ({
        url: '/api/schedule',
        method: 'POST',
        body: schedule,
      }),
      invalidatesTags: ['Appointment', 'Schedule'],
    }),
    updateSchedule: builder.mutation({
      query: (schedule) => ({
        url: `/api/schedule/${schedule.id}`,
        method: 'PUT',
        body: schedule,
      }),
      invalidatesTags: ['Appointment', 'Schedule'],
    }),
  }),
});

export const {
  useGetScheduleQuery,
  useAddScheduleMutation,
  useUpdateScheduleMutation,
} = extendedApiSlice;

export const selectScheduleResult =
  extendedApiSlice.endpoints.getSchedule.select();

const selectScheduleData = createSelector(
  selectScheduleResult,
  (scheduleResult) => scheduleResult.data
);

export const { selectAll: selectAllSchedule, selectById: selectScheduleById } =
  scheduleAdapter.getSelectors(
    (state) => selectScheduleData(state) ?? initialState
  );

export const selectScheduleByDate = createSelector(
  selectAllSchedule,
  selectDate,
  // selectDateDisabled,
  // add dateDisabled to below
  (schedule, date) => {
    // console.log('slice by date', schedule, date);
    return schedule.find(
      (s) =>
        formatDate(s.date) ===
        // dayjs(date).format('YYYY-MM-DD')
        formatDate(date)
    );
  }
);

export const selectScheduleByFilter = createSelector(
  selectScheduleByDate,
  selectService,
  selectEmployeeIds,
  selectEmployee,
  (schedule, service, employees, employee) => {
    // console.log('slice by filter:', schedule, service, employees);
    if (!schedule) {
      return [];
    }
    const availableTimeSlots = findAvailableTimeSlots(
      schedule,
      service.duration,
      employees,
      employee
    );
    return availableTimeSlots;
  }
);

// const findAvailableTimeSlots = (schedule, duration, employees) => {
//   const { open, close, appointments } = schedule;
//   const timeFormat = 'HH:mm';
//   const searchIncrement = 15;
//   const slots = [];
//   let slotStart = dayjs(open);
//   const slotEnd = dayjs(close);

//   while (slotStart.isBefore(slotEnd)) {
//     const currentSlotEnd = slotStart.add(duration, 'minute');
//     const currentSlotStartString = slotStart.format(timeFormat);
//     const currentSlotEndString = currentSlotEnd.format(timeFormat);

//     if (currentSlotEnd.isAfter(slotEnd)) {
//       break;
//     }

//     const availableEmployees = employees.filter((employeeId) => {
//       const employeeAppointments = appointments.filter(
//         (appointment) => appointment.employee === employeeId
//       );
//       const employeeBooked = employeeAppointments.some(
//         (appointment) =>
//           dayjs(appointment.start).isBefore(currentSlotEnd) &&
//           dayjs(appointment.end).isAfter(slotStart)
//       );
//       return !employeeBooked;
//     });

//     if (availableEmployees.length > 0) {
//       slots.push({
//         id: crypto.randomUUID(),
//         start: currentSlotStartString,
//         end: currentSlotEndString,
//         available: availableEmployees,
//       });
//     }

//     slotStart = slotStart.add(searchIncrement, 'minute');
//   }

//   return slots;
// };
