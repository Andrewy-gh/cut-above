import { apiSlice } from '../../app/api/apiSlice';

export interface AuthResponse {
  success: boolean;
  message: string;
  user: {
    email: string;
    role: string;
  };
}

export interface LoginCredentials {
  email: string;
  password?: string;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
}

export interface ResetPasswordParams {
  id: string;
  token: string;
  password?: string;
}

export const authApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<AuthResponse, LoginCredentials>({
      query: (credentials) => ({
        url: '/api/auth/login',
        method: 'POST',
        body: { ...credentials }
      }),
      invalidatesTags: ['User'],
    }),

    logout: builder.mutation<void, void>({
      query: () => ({
        url: '/api/auth/logout',
      }),
      invalidatesTags: ['User'],
    }),

    registerAccount: builder.mutation<AuthResponse, RegisterData>({
      query: (register) => ({
        url: '/api/auth/signup',
        method: 'POST',
        body: register
      }),
    }),

    changeUserEmail: builder.mutation<AuthResponse, { email: string }>({
      query: (email) => ({
        url: '/api/auth/email',
        method: 'PUT',
        body: email
      }),
      invalidatesTags: ['User'],
    }),

    changeUserPassword: builder.mutation<AuthResponse, { password?: string }>({
      query: (password) => ({
        url: '/api/auth/password',
        method: 'PUT',
        body: password
      }),
      invalidatesTags: ['User'],
    }),

    // ! TODO
    deleteUser: builder.mutation<{ success: boolean; message: string }, void>({
      query: () => ({
        url: '/api/user',
        method: 'DELETE',
      }),
      invalidatesTags: ['User'],
    }),

    validateToken: builder.query<any, { id: string; token: string }>({
      query: (req) => `/api/auth/validation/${req.id}/${req.token}`,
      transformResponse: (responseData: any) => {
        return responseData;
      },
    }),

    resetUserPassword: builder.mutation<AuthResponse, ResetPasswordParams>({
      query: ({
        id,
        token,
        password
      }) => ({
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
