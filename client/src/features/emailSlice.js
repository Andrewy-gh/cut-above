import { apiSlice } from '../app/api/apiSlice';

export const emailSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    sendConfirmation: builder.mutation({
      query: (email) => ({
        url: '/api/email/confirmation',
        method: 'POST',
        body: email,
      }),
    }),
    sendModification: builder.mutation({
      query: (email) => ({
        url: '/api/email/modification',
        method: 'POST',
        body: email,
      }),
    }),
    sendCancellation: builder.mutation({
      query: (email) => ({
        url: '/api/email/cancellation',
        method: 'POST',
        body: email,
      }),
    }),
    sendPasswordReset: builder.mutation({
      query: (email) => ({
        url: '/api/email/reset-pw',
        method: 'POST',
        body: email,
      }),
    }),
    sendMessageResponse: builder.mutation({
      query: (email) => ({
        url: '/api/email/new-message',
        method: 'POST',
        body: email,
      }),
    }),
  }),
});

export const {
  useSendConfirmationMutation,
  useSendModificationMutation,
  useSendCancellationMutation,
  useSendPasswordResetMutation,
  useSendMessageResponseMutation,
} = emailSlice;
