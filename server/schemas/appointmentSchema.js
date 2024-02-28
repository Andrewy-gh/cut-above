import Joi from 'joi';

export const bookingSchema = Joi.object({
  date: Joi.string().isoDate().required(),
  // ! TODO: add custom validator to make sure end > start
  start: Joi.string().isoDate().required(),
  end: Joi.string().isoDate().required(),
  employee: {
    id: Joi.string().guid().required(),
    firstName: Joi.string().required(),
  },
  service: Joi.string()
    .valid(
      'Haircut',
      'Beard Trim',
      'Straight Razor Shave',
      'Cut and Shave Package',
      'The Full Package'
    )
    .required(),
});

export const statusSchema = Joi.object({
  status: Joi.string()
    .valid('scheduled', 'checked-in', 'completed', 'no show')
    .required(),
});

export const idSchema = Joi.object({
  id: Joi.string().guid().required(),
});
