import { cronJobs } from "convex/server";

import { internal } from "./_generated/api";

const crons = cronJobs();

crons.interval(
  "process email outbox",
  { seconds: 30 },
  internal.emailOutbox.processOutbox
);

export default crons;
