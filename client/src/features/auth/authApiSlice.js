import { apiSlice } from '../../app/api/apiSlice';

export const authApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (credentials) => ({
        url: '/login',
        method: 'POST',
        body: { ...credentials },
      }),
      providesTags: ['User'],
    }),
    logout: builder.mutation({
      query: () => ({
        url: '/logout',
      }),
      invalidatesTags: ['User'],
    }),
    registerAccount: builder.mutation({
      query: (register) => ({
        url: '/signup',
        method: 'POST',
        body: register,
      }),
    }),
    changeUserEmail: builder.mutation({
      query: (email) => ({
        url: '/email',
        method: 'PUT',
        body: email,
      }),
      invalidatesTags: ['User'],
    }),
    changeUserPassword: builder.mutation({
      query: (password) => ({
        url: '/password',
        method: 'PUT',
        body: password,
      }),
      invalidatesTags: ['User'],
    }),
    // ! TODO
    deleteUser: builder.mutation({
      query: () => ({
        url: '/api/user',
        method: 'DELETE',
      }),
      invalidatesTags: ['User'],
    }),
    validateToken: builder.query({
      query: (req) => `/validation/${req.id}/${req.token}`,
      transformResponse: (responseData) => {
        return responseData;
      },
    }),
    resetUserPassword: builder.mutation({
      query: ({ id, token, password }) => ({
        url: `/reset-pw/${id}/${token}`,
        method: 'PUT',
        body: { password },
      }),
      invalidatesTags: ['User'],
    }),
  }),
});

export const {
  useLoginMutation,
  useLogoutMutation,
  useRegisterAccountMutation,
  useChangeUserEmailMutation,
  useChangeUserPasswordMutation,
  useDeleteUserMutation,
  useResetUserPasswordMutation,
  useValidateTokenQuery,
} = authApiSlice;
