import { createSlice } from '@reduxjs/toolkit';

interface AuthState {
  user: string | null;
  role: string | null;
}

const initialState: AuthState = { user: null, role: null };

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: { payload: { user: string; role: string | null } }) => {
      const { user, role } = action.payload;
      state.user = user;
      state.role = role;
    },
    logoutUser: (state) => {
      state.user = null;
      state.role = null;
    },
    updateUserDetails: (state, action: { payload: { user: string; role: string | null } }) => {
      const { user, role } = action.payload;
      state.user = user;
      state.role = role;
    },
  },
});

export const { setCredentials, logoutUser, updateUserDetails } =
  authSlice.actions;

export default authSlice.reducer;

export const selectCurrentUser = (state: { auth: AuthState }) => state.auth.user;
export const selectCurrentUserRole = (state: { auth: AuthState }) => state.auth.role;
