import { getAuthConfigProvider } from "@convex-dev/better-auth/auth-config";
import type { AuthConfig } from "convex/server";

const authConfig = {
  providers: [
    getAuthConfigProvider(),
    {
      applicationID: "convex",
      domain: process.env.CONVEX_SITE_URL!,
    },
  ],
} satisfies AuthConfig;

export default authConfig;
