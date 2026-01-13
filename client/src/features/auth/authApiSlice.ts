import { apiSlice } from '../../app/api/apiSlice';

export const authApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder: any) => ({
    login: builder.mutation({
      query: (credentials: any) => ({
        url: '/api/auth/login',
        method: 'POST',
        body: { ...credentials }
      }),
      providesTags: ['User'],
    }),

    logout: builder.mutation({
      query: () => ({
        url: '/api/auth/logout',
      }),
      invalidatesTags: ['User'],
    }),

    registerAccount: builder.mutation({
      query: (register: any) => ({
        url: '/api/auth/signup',
        method: 'POST',
        body: register
      }),
    }),

    changeUserEmail: builder.mutation({
      query: (email: any) => ({
        url: '/api/auth/email',
        method: 'PUT',
        body: email
      }),
      invalidatesTags: ['User'],
    }),

    changeUserPassword: builder.mutation({
      query: (password: any) => ({
        url: '/api/auth/password',
        method: 'PUT',
        body: password
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
      query: (req: any) => `/api/auth/validation/${req.id}/${req.token}`,
      transformResponse: (responseData: any) => {
        return responseData;
      },
    }),

    resetUserPassword: builder.mutation({
      query: ({
        id,
        token,
        password
      }: any) => ({
        url: `/api/auth/reset-pw/${id}/${token}`,
        method: 'PUT',
        body: { password },
      }),
      invalidatesTags: ['User'],
    })
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
