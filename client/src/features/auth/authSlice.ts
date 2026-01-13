import { createSlice } from '@reduxjs/toolkit';

const authSlice = createSlice({
  name: 'auth',
  initialState: { user: null, role: null },
  reducers: {
    setCredentials: (state, action) => {
      const { user, role } = action.payload;
      state.user = user;
      state.role = role;
    },
    logoutUser: (state) => {
      state.user = null;
      state.role = null;
    },
    updateUserDetails: (state, action) => {
      const { user, role } = action.payload;
      state.user = user;
      state.role = role;
    },
  },
});

export const { setCredentials, logoutUser, updateUserDetails } =
  authSlice.actions;

export default authSlice.reducer;

export const selectCurrentUser = (state: any) => state.auth.user;
export const selectCurrentUserRole = (state: any) => state.auth.role;
