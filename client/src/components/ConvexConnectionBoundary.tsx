import type { ReactNode } from 'react';

import { useConvexConnectionState } from 'convex/react';

const MAX_CONNECTION_RETRIES = 3;

export default function ConvexConnectionBoundary({
  children,
}: {
  children: ReactNode;
}) {
  const { connectionRetries, hasEverConnected, isWebSocketConnected } =
    useConvexConnectionState();

  if (
    !isWebSocketConnected &&
    !hasEverConnected &&
    connectionRetries >= MAX_CONNECTION_RETRIES
  ) {
    throw new Error(
      'Convex connection failed. Check CONVEX_DEPLOYMENT_URL and backend status.'
    );
  }

  return children;
}
