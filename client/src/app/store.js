import { configureStore } from '@reduxjs/toolkit';
import { apiSlice } from './api/apiSlice';
import appointmentReducer from '../features/appointments/appointmentSlice';
import authReducer from '../features/auth/authSlice';
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
  [apiSlice.reducerPath]: apiSlice.reducer,
  appointment: appointmentReducer,
  auth: persistReducer(persistConfig, authReducer), // Wrap authReducer with persistReducer
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
    }).concat(apiSlice.middleware),
  // eslint-disable-next-line no-undef
  devTools: process.env.NODE_ENV !== 'production',
});

export const persistor = persistStore(store);
