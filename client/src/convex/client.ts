import {
  ConvexProvider,
  ConvexReactClient,
  useConvex,
  useMutation,
  useQuery,
} from "convex/react";

import { CONVEX_URL } from "./env";

export const convexClient = new ConvexReactClient(CONVEX_URL);

export { ConvexProvider, useConvex, useMutation, useQuery };
