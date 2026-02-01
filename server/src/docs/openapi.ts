export const openapiSpec = {
  openapi: '3.0.3',
  info: {
    title: 'Cut Above API',
    version: '1.0.0',
    description:
      'Session-based API for Cut Above barbershop booking, scheduling, and account management.',
  },
  servers: [{ url: '/' }],
  tags: [
    { name: 'Auth', description: 'Authentication and account maintenance.' },
    { name: 'Appointments', description: 'Appointment booking and updates.' },
    { name: 'Schedules', description: 'Schedule visibility and management.' },
    { name: 'Employees', description: 'Employee directory endpoints.' },
    { name: 'Email', description: 'Public email submission endpoints.' },
    { name: 'Users', description: 'Administrative user listings.' },
  ],
  components: {
    securitySchemes: {
      SessionCookie: {
        type: 'apiKey',
        in: 'cookie',
        name: 'cutabove',
        description: 'Session cookie established by /api/auth/login.',
      },
    },
    schemas: {
      ErrorResponse: {
        type: 'object',
        required: ['type', 'title', 'status'],
        properties: {
          type: { type: 'string' },
          title: { type: 'string' },
          status: { type: 'integer', format: 'int32' },
          code: { type: 'string' },
          detail: { type: 'string' },
          invalidParams: {
            type: 'array',
            items: {
              type: 'object',
              required: ['name'],
              properties: {
                name: { type: 'string' },
                reason: { type: 'string' },
              },
            },
          },
        },
      },
      SuccessMessage: {
        type: 'object',
        required: ['success', 'message'],
        properties: {
          success: { type: 'boolean' },
          message: { type: 'string' },
        },
      },
      User: {
        type: 'object',
        required: ['id', 'firstName', 'lastName', 'email', 'role'],
        properties: {
          id: { type: 'string', format: 'uuid' },
          firstName: { type: 'string' },
          lastName: { type: 'string' },
          email: { type: 'string', format: 'email' },
          role: { type: 'string', enum: ['client', 'employee', 'admin'] },
          image: { type: 'string', nullable: true },
          profile: { type: 'string', nullable: true },
        },
      },
      UserPublic: {
        type: 'object',
        required: ['id', 'firstName'],
        properties: {
          id: { type: 'string', format: 'uuid' },
          firstName: { type: 'string' },
        },
      },
      EmployeeProfile: {
        type: 'object',
        required: ['id', 'firstName'],
        properties: {
          id: { type: 'string', format: 'uuid' },
          firstName: { type: 'string' },
          image: { type: 'string', nullable: true },
          profile: { type: 'string', nullable: true },
        },
      },
      LoginRequest: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string', minLength: 8 },
        },
      },
      SignupRequest: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          firstName: { type: 'string' },
          lastName: { type: 'string' },
          email: { type: 'string', format: 'email' },
          password: { type: 'string', minLength: 8 },
        },
      },
      EmailChangeRequest: {
        type: 'object',
        required: ['email'],
        properties: {
          email: { type: 'string', format: 'email' },
        },
      },
      PasswordChangeRequest: {
        type: 'object',
        required: ['password'],
        properties: {
          password: { type: 'string', minLength: 8 },
        },
      },
      PasswordResetRequest: {
        type: 'object',
        required: ['email'],
        properties: {
          email: { type: 'string', format: 'email' },
        },
      },
      NewMessageRequest: {
        type: 'object',
        required: ['contactDetails'],
        properties: {
          contactDetails: {
            type: 'object',
            required: ['email'],
            properties: {
              firstName: { type: 'string' },
              lastName: { type: 'string' },
              email: { type: 'string', format: 'email' },
              message: { type: 'string' },
            },
          },
        },
      },
      AppointmentBookingRequest: {
        type: 'object',
        required: ['start', 'end', 'employee', 'service'],
        properties: {
          start: { type: 'string', format: 'date-time' },
          end: { type: 'string', format: 'date-time' },
          employee: {
            type: 'object',
            required: ['id', 'firstName'],
            properties: {
              id: { type: 'string', format: 'uuid' },
              firstName: { type: 'string' },
            },
          },
          service: {
            type: 'string',
            enum: [
              'Haircut',
              'Beard Trim',
              'Straight Razor Shave',
              'Cut and Shave Package',
              'The Full Package',
            ],
          },
        },
      },
      AppointmentStatusUpdateRequest: {
        type: 'object',
        required: ['status'],
        properties: {
          status: {
            type: 'string',
            enum: ['scheduled', 'checked-in', 'completed', 'no show'],
          },
        },
      },
      Appointment: {
        type: 'object',
        required: ['id', 'start', 'end', 'service', 'status'],
        properties: {
          id: { type: 'string', format: 'uuid' },
          start: { type: 'string', format: 'date-time' },
          end: { type: 'string', format: 'date-time' },
          service: {
            type: 'string',
            enum: [
              'Haircut',
              'Beard Trim',
              'Straight Razor Shave',
              'Cut and Shave Package',
              'The Full Package',
            ],
          },
          status: {
            type: 'string',
            enum: ['scheduled', 'checked-in', 'completed', 'no show'],
          },
          employee: { $ref: '#/components/schemas/UserPublic' },
          client: { $ref: '#/components/schemas/UserPublic' },
        },
      },
      Schedule: {
        type: 'object',
        required: ['id', 'open', 'close', 'appointments'],
        properties: {
          id: { type: 'string', format: 'uuid' },
          open: { type: 'string', format: 'date-time' },
          close: { type: 'string', format: 'date-time' },
          appointments: {
            type: 'array',
            items: { $ref: '#/components/schemas/Appointment' },
          },
        },
      },
      ScheduleCreateRequest: {
        type: 'object',
        required: ['dates', 'open', 'close'],
        properties: {
          dates: {
            type: 'array',
            minItems: 2,
            maxItems: 2,
            items: { type: 'string', format: 'date-time' },
          },
          open: { type: 'string', format: 'time' },
          close: { type: 'string', format: 'time' },
        },
      },
      LoginResponse: {
        type: 'object',
        required: ['success', 'message', 'user'],
        properties: {
          success: { type: 'boolean' },
          message: { type: 'string' },
          user: { $ref: '#/components/schemas/User' },
        },
      },
      UserResponse: {
        type: 'object',
        required: ['success', 'message', 'user'],
        properties: {
          success: { type: 'boolean' },
          message: { type: 'string' },
          user: { $ref: '#/components/schemas/User' },
        },
      },
      ScheduleCreateResponse: {
        type: 'object',
        required: ['success', 'message', 'data'],
        properties: {
          success: { type: 'boolean' },
          message: { type: 'string' },
          data: {
            type: 'array',
            items: { $ref: '#/components/schemas/Schedule' },
          },
        },
      },
    },
  },
  paths: {
    '/api/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Login and start a session.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/LoginRequest' },
            },
          },
        },
        responses: {
          '200': {
            description: 'Authenticated.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/LoginResponse' },
              },
            },
          },
          '400': {
            description: 'Invalid credentials or payload.',
            content: {
              'application/problem+json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          '401': {
            description: 'Unauthorized.',
            content: {
              'application/problem+json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/api/auth/logout': {
      get: {
        tags: ['Auth'],
        summary: 'Logout and destroy session.',
        security: [{ SessionCookie: [] }],
        responses: {
          '204': { description: 'Logged out.' },
          '401': {
            description: 'Session expired.',
            content: {
              'application/problem+json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/api/auth/signup': {
      post: {
        tags: ['Auth'],
        summary: 'Register a new account.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/SignupRequest' },
            },
          },
        },
        responses: {
          '200': {
            description: 'Account created.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/SuccessMessage' },
              },
            },
          },
          '400': {
            description: 'Invalid input.',
            content: {
              'application/problem+json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/api/auth/email': {
      put: {
        tags: ['Auth'],
        summary: 'Change account email.',
        security: [{ SessionCookie: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/EmailChangeRequest' },
            },
          },
        },
        responses: {
          '200': {
            description: 'Email updated.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/UserResponse' },
              },
            },
          },
          '400': {
            description: 'Invalid input.',
            content: {
              'application/problem+json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          '401': {
            description: 'Session expired.',
            content: {
              'application/problem+json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/api/auth/password': {
      put: {
        tags: ['Auth'],
        summary: 'Change account password.',
        security: [{ SessionCookie: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/PasswordChangeRequest' },
            },
          },
        },
        responses: {
          '200': {
            description: 'Password updated.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/SuccessMessage' },
              },
            },
          },
          '400': {
            description: 'Invalid input.',
            content: {
              'application/problem+json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          '401': {
            description: 'Session expired.',
            content: {
              'application/problem+json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/api/auth/validation/{id}/{token}': {
      get: {
        tags: ['Auth'],
        summary: 'Validate password reset token.',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' },
          },
          {
            name: 'token',
            in: 'path',
            required: true,
            schema: { type: 'string', minLength: 64, maxLength: 64 },
          },
        ],
        responses: {
          '200': {
            description: 'Token is valid.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/SuccessMessage' },
              },
            },
          },
          '400': {
            description: 'Invalid token.',
            content: {
              'application/problem+json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/api/auth/reset-pw/{id}/{token}': {
      put: {
        tags: ['Auth'],
        summary: 'Reset password with a valid token.',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' },
          },
          {
            name: 'token',
            in: 'path',
            required: true,
            schema: { type: 'string', minLength: 64, maxLength: 64 },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/PasswordChangeRequest' },
            },
          },
        },
        responses: {
          '200': {
            description: 'Password updated.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/SuccessMessage' },
              },
            },
          },
          '400': {
            description: 'Invalid input.',
            content: {
              'application/problem+json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/api/appointments': {
      get: {
        tags: ['Appointments'],
        summary: 'List appointments for the authenticated user.',
        security: [{ SessionCookie: [] }],
        responses: {
          '200': {
            description: 'Appointments.',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Appointment' },
                },
              },
            },
          },
          '401': {
            description: 'Unauthorized.',
            content: {
              'application/problem+json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
      post: {
        tags: ['Appointments'],
        summary: 'Book a new appointment.',
        security: [{ SessionCookie: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/AppointmentBookingRequest' },
            },
          },
        },
        responses: {
          '200': {
            description: 'Appointment created.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/SuccessMessage' },
              },
            },
          },
          '400': {
            description: 'Invalid input.',
            content: {
              'application/problem+json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          '401': {
            description: 'Unauthorized.',
            content: {
              'application/problem+json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          '409': {
            description: 'Time conflict.',
            content: {
              'application/problem+json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          '410': {
            description: 'No schedule found for date.',
            content: {
              'application/problem+json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/api/appointments/status/{id}': {
      put: {
        tags: ['Appointments'],
        summary: 'Update appointment status (admin/employee).',
        security: [{ SessionCookie: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/AppointmentStatusUpdateRequest',
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Status updated.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/SuccessMessage' },
              },
            },
          },
          '400': {
            description: 'Invalid input.',
            content: {
              'application/problem+json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          '401': {
            description: 'Unauthorized.',
            content: {
              'application/problem+json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          '403': {
            description: 'Forbidden.',
            content: {
              'application/problem+json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/api/appointments/{id}': {
      get: {
        tags: ['Appointments'],
        summary: 'Get appointment details.',
        security: [{ SessionCookie: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' },
          },
        ],
        responses: {
          '200': {
            description: 'Appointment detail.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Appointment' },
              },
            },
          },
          '401': {
            description: 'Unauthorized.',
            content: {
              'application/problem+json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          '404': {
            description: 'Not found.',
            content: {
              'application/problem+json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
      put: {
        tags: ['Appointments'],
        summary: 'Modify an existing appointment.',
        security: [{ SessionCookie: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/AppointmentBookingRequest' },
            },
          },
        },
        responses: {
          '200': {
            description: 'Appointment updated.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/SuccessMessage' },
              },
            },
          },
          '400': {
            description: 'Invalid input.',
            content: {
              'application/problem+json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          '401': {
            description: 'Unauthorized.',
            content: {
              'application/problem+json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          '403': {
            description: 'Forbidden.',
            content: {
              'application/problem+json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          '404': {
            description: 'Not found.',
            content: {
              'application/problem+json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
      delete: {
        tags: ['Appointments'],
        summary: 'Cancel an appointment.',
        security: [{ SessionCookie: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' },
          },
        ],
        responses: {
          '200': {
            description: 'Appointment cancelled.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/SuccessMessage' },
              },
            },
          },
          '401': {
            description: 'Unauthorized.',
            content: {
              'application/problem+json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          '403': {
            description: 'Forbidden.',
            content: {
              'application/problem+json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          '404': {
            description: 'Not found.',
            content: {
              'application/problem+json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/api/schedules': {
      get: {
        tags: ['Schedules'],
        summary: 'List public schedules and appointments.',
        responses: {
          '200': {
            description: 'Schedules.',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Schedule' },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ['Schedules'],
        summary: 'Create schedules.',
        security: [{ SessionCookie: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ScheduleCreateRequest' },
            },
          },
        },
        responses: {
          '201': {
            description: 'Schedules created.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ScheduleCreateResponse' },
              },
            },
          },
          '400': {
            description: 'Invalid input.',
            content: {
              'application/problem+json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          '401': {
            description: 'Unauthorized.',
            content: {
              'application/problem+json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          '403': {
            description: 'Forbidden.',
            content: {
              'application/problem+json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/api/schedules/dashboard': {
      get: {
        tags: ['Schedules'],
        summary: 'List schedules with client and employee details.',
        security: [{ SessionCookie: [] }],
        responses: {
          '200': {
            description: 'Schedules.',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Schedule' },
                },
              },
            },
          },
          '401': {
            description: 'Unauthorized.',
            content: {
              'application/problem+json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          '403': {
            description: 'Forbidden.',
            content: {
              'application/problem+json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/api/employees': {
      get: {
        tags: ['Employees'],
        summary: 'List employees.',
        responses: {
          '200': {
            description: 'Employees.',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/UserPublic' },
                },
              },
            },
          },
        },
      },
    },
    '/api/employees/profiles': {
      get: {
        tags: ['Employees'],
        summary: 'List employee profiles.',
        responses: {
          '200': {
            description: 'Employee profiles.',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/EmployeeProfile' },
                },
              },
            },
          },
        },
      },
    },
    '/api/email/new-message': {
      post: {
        tags: ['Email'],
        summary: 'Send a contact form message.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/NewMessageRequest' },
            },
          },
        },
        responses: {
          '200': {
            description: 'Message accepted.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/SuccessMessage' },
              },
            },
          },
          '400': {
            description: 'Invalid input.',
            content: {
              'application/problem+json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/api/email/reset-pw': {
      post: {
        tags: ['Email'],
        summary: 'Request a password reset email.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/PasswordResetRequest' },
            },
          },
        },
        responses: {
          '200': {
            description: 'Reset email requested.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/SuccessMessage' },
              },
            },
          },
          '400': {
            description: 'Invalid input.',
            content: {
              'application/problem+json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/api/users': {
      get: {
        tags: ['Users'],
        summary: 'List all users (admin only).',
        security: [{ SessionCookie: [] }],
        responses: {
          '200': {
            description: 'Users.',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/User' },
                },
              },
            },
          },
          '401': {
            description: 'Unauthorized.',
            content: {
              'application/problem+json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          '403': {
            description: 'Forbidden.',
            content: {
              'application/problem+json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
  },
} as const;
