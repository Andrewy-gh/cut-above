import { describe, expect, it } from 'vitest';
import {
  getErrorMessage,
  getPublicErrorMessage,
  getInvalidParams,
  isUnauthorized,
} from '@/utils/apiError';

describe('apiError helpers', () => {
  it('prefers detail from problem+json payloads', () => {
    const err = {
      data: {
        type: 'error:ValidationError',
        title: 'Bad Request',
        status: 400,
        detail: 'Email required',
      },
    };

    expect(getErrorMessage(err)).toBe('Email required');
  });

  it('falls back to title when detail is missing', () => {
    const err = {
      type: 'status:401',
      title: 'Unauthorized',
      status: 401,
    };

    expect(getErrorMessage(err)).toBe('Unauthorized');
  });

  it('detects unauthorized responses', () => {
    const err = {
      data: {
        type: 'error:SessionError',
        title: 'Unauthorized',
        status: 401,
      },
    };

    expect(isUnauthorized(err)).toBe(true);
  });

  it('returns invalid params when present', () => {
    const err = {
      type: 'error:ValidationError',
      title: 'Bad Request',
      status: 400,
      invalidParams: [{ name: 'email', reason: 'Required' }],
    };

    expect(getInvalidParams(err)).toEqual([
      { name: 'email', reason: 'Required' },
    ]);
  });

  it('sanitizes Convex wrapper errors (no request id / function names)', () => {
    const err = new Error(
      'Error: [CONVEX M(appointments:createAppointment)] [Request ID: eeaa2110631495ac] Server Error Uncaught ConvexError: Time slot conflicts with existing appointment Called by client'
    );

    const msg = getPublicErrorMessage(err);
    expect(msg.toLowerCase()).toContain('no longer available');
    expect(msg.toLowerCase()).not.toContain('request id');
    expect(msg.toLowerCase()).not.toContain('convex');
    expect(msg.toLowerCase()).not.toContain('appointments:createappointment');
  });
});
