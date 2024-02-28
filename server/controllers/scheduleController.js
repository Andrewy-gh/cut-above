import { Schedule } from '../models/index.js';
import { generateRange } from '../utils/dateTime.js';
import {
  getPublicSchedules,
  getPrivateSchedules,
} from '../services/scheduleService.js';

/**
 * @description retrieve all public schedules for booking page includes only employee id
 * @route /api/schedules
 * @method GET
 */
export const getAllSchedulesPublic = async (_, res) => {
  const schedules = await getPublicSchedules();
  res.json(schedules);
};

/**
 * @description retrieve all schedules with client and employee infromation
 * @route /api/schedules/dashboard
 * @method GET
 */
export const getAllSchedulesPrivate = async (_, res) => {
  const schedules = await getPrivateSchedules();
  res.json(schedules);
};

/**
 * @description create a single or multiple schedules
 * @route /api/schedules
 * @method POST
 */
export const createNewSchedule = async (req, res) => {
  const { dates, open, close } = req.body;
  const dateRangeToSchedule = generateRange(dates, open, close);
  const newSchedules = dateRangeToSchedule.map((s) => {
    return Schedule.create({
      date: s.date,
      open: s.open,
      close: s.close,
    });
  });
  const savedSchedules = await Promise.all(newSchedules);
  res.status(201).json({
    success: true,
    message: 'New schedule added',
    data: savedSchedules,
  });
};
