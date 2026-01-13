import { apiSlice } from '../app/api/apiSlice';

export const emailSlice = apiSlice.injectEndpoints({
  endpoints: (builder: any) => ({
    sendPasswordReset: builder.mutation({
      query: (email: any) => ({
        url: '/api/email/reset-pw',
        method: 'POST',
        body: email
      }),
    }),

    sendMessageResponse: builder.mutation({
      query: (email: any) => ({
        url: '/api/email/new-message',
        method: 'POST',
        body: email
      }),
    })
  }),
});

export const { useSendPasswordResetMutation, useSendMessageResponseMutation } =
  emailSlice;
