const scheduleRouter = require('express').Router();
const Schedule = require('../models/Schedule');

scheduleRouter.get('/', async (request, response) => {
  const schedule = await Schedule.find({}).populate(
    'available',
    'id email firstName image'
  );
  response.json(schedule);
});

module.exports = scheduleRouter;
