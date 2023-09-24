import { createSlice } from '@reduxjs/toolkit';

const authSlice = createSlice({
  name: 'auth',
  initialState: { user: null, token: null, role: null },
  reducers: {
    setCredentials: (state, action) => {
      const { user, role, token } = action.payload;
      state.user = user;
      state.role = role;
      state.token = token;
    },
    logoutUser: (state) => {
      state.user = null;
      state.role = null;
      state.token = null;
    },
    updateUserDetails: (state, action) => {
      state.user = action.payload;
    },
  },
});

export const { setCredentials, logoutUser, updateUserDetails } =
  authSlice.actions;

export default authSlice.reducer;

export const selectCurrentUser = (state) => state.auth.user;
export const selectCurrentUserRole = (state) => state.auth.role;
export const selectCurrentToken = (state) => state.auth.token;
