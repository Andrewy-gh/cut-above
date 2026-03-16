import { createAuthClient } from "better-auth/react";
import { convexClient, crossDomainClient } from "@convex-dev/better-auth/client/plugins";

import { CONVEX_SITE_URL, CONVEX_URL } from "./env";

export const authClient = createAuthClient({
  baseURL: CONVEX_SITE_URL || CONVEX_URL,
  plugins: [crossDomainClient(), convexClient()],
});
