import { isRouteErrorResponse } from 'react-router';
import { getPublicErrorMessage } from '@/utils/apiError';

type PublicErrorContent = {
  heading: string;
  message: string;
  details?: string;
};

function safeStringify(value: unknown): string {
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

export function getPublicErrorContent(error: unknown): PublicErrorContent {
  if (isRouteErrorResponse(error)) {
    const status = error.status;
    const heading =
      status === 404
        ? 'Page not found.'
        : status === 401
          ? 'Sign in required.'
          : status === 403
            ? 'Not allowed.'
            : status === 429
              ? 'Too many requests.'
              : 'Something went wrong.';

    const message =
      status === 404
        ? "That page doesn't exist."
        : status === 401
          ? 'Please sign in to continue.'
          : status === 403
            ? "You don't have access to this page."
            : status === 429
              ? 'Please try again in a moment.'
              : 'Please try again.';

    const details = [
      `status: ${error.status}${error.statusText ? ` (${error.statusText})` : ''}`,
      error.data ? `data: ${typeof error.data === 'string' ? error.data : safeStringify(error.data)}` : null,
    ]
      .filter(Boolean)
      .join('\n');

    return { heading, message, details };
  }

  if (error instanceof Error) {
    const publicMessage = getPublicErrorMessage(error, 'Please try again.');
    const heading =
      publicMessage.toLowerCase().includes('sign in')
        ? 'Sign in required.'
        : publicMessage.toLowerCase().includes('permission') ||
            publicMessage.toLowerCase().includes("don't have access")
          ? 'Not allowed.'
          : publicMessage.toLowerCase().includes('could not be found')
            ? 'Not found.'
            : 'Something went wrong.';

    const details = [
      error.name ? `${error.name}: ${error.message}` : error.message,
      error.stack,
    ]
      .filter(Boolean)
      .join('\n');
    return {
      heading,
      message: publicMessage,
      details,
    };
  }

  return {
    heading: 'Something went wrong.',
    message: 'Please try again.',
    details: safeStringify(error),
  };
}
