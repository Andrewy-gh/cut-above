import * as v from 'valibot';

const isoDateOrDatetime = v.pipe(
  v.string(),
  v.check(
    (val) => {
      // Accept ISO date (YYYY-MM-DD) or ISO datetime (YYYY-MM-DDTHH:mm:ss.sssZ)
      const isoDateRegex = /^\d{4}-\d{2}-\d{2}$/;
      const isoDateTimeRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/;
      return isoDateRegex.test(val) || isoDateTimeRegex.test(val);
    },
    'Must be valid ISO date or datetime'
  )
);

export const bookingSchema = v.pipe(
  v.object({
    date: isoDateOrDatetime,
    start: isoDateOrDatetime,
    end: isoDateOrDatetime,
    employee: v.object({
      id: v.pipe(v.string(), v.uuid()),
      firstName: v.string(),
    }),
    service: v.picklist([
      'Haircut',
      'Beard Trim',
      'Straight Razor Shave',
      'Cut and Shave Package',
      'The Full Package',
    ]),
  }),
  v.check(
    (value) => new Date(value.end) > new Date(value.start),
    'End time must be after start time'
  )
);

export const statusSchema = v.object({
  status: v.picklist(['scheduled', 'checked-in', 'completed', 'no show']),
});

export const idSchema = v.object({
  id: v.pipe(v.string(), v.uuid()),
});

export type BookingInput = v.InferInput<typeof bookingSchema>;
export type StatusInput = v.InferInput<typeof statusSchema>;
export type IdInput = v.InferInput<typeof idSchema>;
