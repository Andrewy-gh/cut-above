import { cronJobs } from "convex/server";

import { internal } from "./_generated/api";

const crons = cronJobs();

crons.interval(
  "process email outbox",
  { seconds: 30 },
  internal.emailOutboxActions.processOutbox,
  {}
);

export default crons;
