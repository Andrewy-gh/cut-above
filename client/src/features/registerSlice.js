import { apiSlice } from '../app/api/apiSlice';

export const registerSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    registerAccount: builder.mutation({
      query: (register) => ({
        url: '/signup',
        method: 'POST',
        body: register,
      }),
    }),
  }),
});

export const { useRegisterAccountMutation } = registerSlice;
