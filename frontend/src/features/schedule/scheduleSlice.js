import { createSelector, createEntityAdapter } from '@reduxjs/toolkit';
import { apiSlice } from '../../app/api/apiSlice';
import {
  selectDate,
  selectDateDisabled,
  selectService,
  selectEmployee,
} from '../filter/filterSlice';
import { selectEmployeeIds } from '../employees/employeeSlice';
import dateServices from '../date/date';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import date from '../date/date';

dayjs.extend(customParseFormat);

const scheduleAdapter = createEntityAdapter({
  sortComparer: (a, b) => a.date.localeCompare(b.date),
});

const initialState = scheduleAdapter.getInitialState();

export const extendedApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getSchedule: builder.query({
      query: () => '/schedule',
      transformResponse: (responseData) => {
        const loadedPosts = responseData.map((s) => {
          const sortedAppointments = s.appointments.sort((a, b) => {
            const dateA = new Date(a.start);
            const dateB = new Date(b.start);
            return dateA.getTime() - dateB.getTime();
          });
          return {
            ...s,
            date: date.dateHyphen(s.date),
            appointments: sortedAppointments,
          };
        });
        console.log('loadedPosts', loadedPosts);
        return scheduleAdapter.setAll(initialState, loadedPosts);
      },
      // keepUnusedDataFor: 5,
      providesTags: ['Schedule'],
    }),
    addSchedule: builder.mutation({
      query: (schedule) => ({
        url: '/schedule',
        method: 'POST',
        body: schedule,
      }),
      invalidatesTags: ['Schedule'],
    }),
    updateSchedule: builder.mutation({
      query: (schedule) => ({
        url: `/schedule/${schedule.id}`,
        method: 'PUT',
        body: schedule,
      }),
      invalidatesTags: ['Schedule'],
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
  (scheduleResult) => scheduleResult.data // normalized state object with ids & entities
);

export const { selectAll: selectAllSchedule, selectById: selectScheduleById } =
  scheduleAdapter.getSelectors(
    (state) => selectScheduleData(state) ?? initialState
  );

export const selectScheduleByDate = createSelector(
  selectAllSchedule,
  selectDate,
  selectDateDisabled,
  (schedule, date, dateDisabled) => {
    console.log('dateDisabled', dateDisabled);
    return !dateDisabled
      ? schedule.find((s) => s.date === dateServices.dateHyphen(date))
      : schedule;
  }
);

export const selectScheduleByFilter = createSelector(
  selectScheduleByDate,
  selectEmployee,
  selectEmployeeIds,
  selectService,
  (schedule, employee, employees, service) => {
    if (!schedule) {
      return [];
    }
    const availableTimeSlots = findAvailableTimeSlots(
      schedule,
      service.duration,
      employees
    );
    return availableTimeSlots;
  }
);

function findAvailableTimeSlots(obj, userInput, employees) {
  const { open, close, appointments } = obj;
  const dateFormat = 'HH:mm';
  const slotDuration = userInput;
  const searchIncrement = 15;
  const slots = [];
  let slotStart = dayjs(open);
  const slotEnd = dayjs(close);

  while (slotStart.isBefore(slotEnd)) {
    const currentSlotEnd = slotStart.add(slotDuration, 'minute');
    const currentSlotStartString = slotStart.format(dateFormat);
    const currentSlotEndString = currentSlotEnd.format(dateFormat);

    if (currentSlotEnd.isAfter(slotEnd)) {
      break;
    }

    const availableEmployees = employees.filter((employeeId) => {
      const employeeAppointments = appointments.filter(
        (appointment) => appointment.employee === employeeId
      );
      const employeeBooked = employeeAppointments.some(
        (appointment) =>
          dayjs(appointment.start).isBefore(currentSlotEnd) &&
          dayjs(appointment.end).isAfter(slotStart)
      );
      return !employeeBooked;
    });

    if (availableEmployees.length > 0) {
      slots.push({
        id: crypto.randomUUID(),
        start: currentSlotStartString,
        end: currentSlotEndString,
        available: availableEmployees,
      });
    }

    slotStart = slotStart.add(searchIncrement, 'minute');
  }

  return slots;
}
