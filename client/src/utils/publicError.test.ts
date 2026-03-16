import { describe, expect, it } from 'vitest';
import { getPublicErrorContent } from '@/utils/publicError';

describe('getPublicErrorContent', () => {
  it('does not leak Error.message into the public message', () => {
    const content = getPublicErrorContent(new Error('super secret'));
    expect(content.message.toLowerCase()).not.toContain('secret');
    expect(content.heading.toLowerCase()).not.toContain('secret');
    expect(content.details?.toLowerCase()).toContain('secret');
  });

  it('maps 404 route errors to a safe message', () => {
    // Minimal shape; react-router type guard checks for these fields.
    const routeErr = {
      status: 404,
      statusText: 'Not Found',
      data: 'nope',
      internal: true,
    };
    const content = getPublicErrorContent(routeErr);
    expect(content.heading.toLowerCase()).toContain('not found');
    expect(content.message.toLowerCase()).not.toContain('nope');
    expect(content.details?.toLowerCase()).toContain('status: 404');
  });
});
