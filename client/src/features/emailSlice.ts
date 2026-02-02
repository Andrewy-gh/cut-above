import { apiSlice } from '../app/api/apiSlice';

export interface EmailResponse {
  success: boolean;
  message: string;
}

export interface ContactDetails {
  firstName: string;
  lastName: string;
  email: string;
  message: string;
}

export const emailSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    sendMessageResponse: builder.mutation<EmailResponse, { contactDetails: ContactDetails }>({
      query: (email) => ({
        url: '/api/email/new-message',
        method: 'POST',
        body: email
      }),
    })
  }),
});

export const { useSendMessageResponseMutation } =
  emailSlice;
