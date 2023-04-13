import { apiSlice } from '../../app/api/apiSlice';

export const emailSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    sendConfirmation: builder.mutation({
      query: (email) => ({
        url: '/send/confirmation',
        method: 'POST',
        body: email,
      }),
    }),
  }),
});

export const { useSendConfirmationMutation } = emailSlice;
