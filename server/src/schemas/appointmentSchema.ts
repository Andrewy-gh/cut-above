import * as v from 'valibot';

export const bookingSchema = v.pipe(
  v.object({
    date: v.pipe(v.string(), v.isoDate()),
    start: v.pipe(v.string(), v.isoDate()),
    end: v.pipe(v.string(), v.isoDate()),
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
