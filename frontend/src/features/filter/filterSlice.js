import { createSlice } from '@reduxjs/toolkit';

const filterSlice = createSlice({
  name: 'filter',
  initialState: {
    date: '',
    employee: 'any',
  },
  reducers: {
    setDate: (state, action) => {
      state.date = action.payload;
    },
    setEmployee: (state, action) => {
      state.employee = action.payload;
    },
  },
});
export const selectDate = (state) => state.filter.date;
export const selectEmployee = (state) => state.filter.employee;
export const { setDate, setEmployee } = filterSlice.actions;
export default filterSlice.reducer;
