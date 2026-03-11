import * as v from 'valibot';

import { APPOINTMENT_STATUSES, SERVICE_NAMES } from '../domain/appointment.js';

const isoDatetime = v.pipe(
  v.string(),
  v.isoTimestamp(),
  v.check(
    (val) => val.endsWith('Z'),
    'Must be UTC ISO 8601 timestamp (Z suffix required, timezone offsets not allowed)'
  )
);

export const bookingSchema = v.pipe(
  v.strictObject({
    start: isoDatetime,
    end: isoDatetime,
    employee: v.strictObject({
      id: v.pipe(v.string(), v.uuid()),
      firstName: v.string(),
    }),
    service: v.picklist(SERVICE_NAMES),
  }),
  v.check(
    (value) => new Date(value.end) > new Date(value.start),
    'End time must be after start time'
  )
);

export const statusSchema = v.object({
  status: v.picklist(APPOINTMENT_STATUSES),
});

export const idSchema = v.object({
  id: v.pipe(v.string(), v.uuid()),
});

export type BookingInput = v.InferInput<typeof bookingSchema>;
export type StatusInput = v.InferInput<typeof statusSchema>;
export type IdInput = v.InferInput<typeof idSchema>;
