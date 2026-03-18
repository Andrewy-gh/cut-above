import { configureStore } from '@reduxjs/toolkit';
import appointmentReducer from '../features/appointments/appointmentSlice';
import appointmentsReducer from '../features/appointments/apptApiSlice';
import authReducer from '../features/auth/authSlice';
import employeesReducer from '../features/employeeSlice';
import filterReducer from '../features/filterSlice';
import notificationReducer from '../features/notificationSlice';

import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { combineReducers } from '@reduxjs/toolkit';

const persistConfig = {
  key: 'auth',
  storage,
};

const rootReducer = combineReducers({
  appointment: appointmentReducer,
  appointments: appointmentsReducer,
  auth: persistReducer(persistConfig, authReducer), // Wrap authReducer with persistReducer
  employees: employeesReducer,
  filter: filterReducer,
  notification: notificationReducer,
});

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
  devTools: import.meta.env.DEV,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const persistor = persistStore(store);
