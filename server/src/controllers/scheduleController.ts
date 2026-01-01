import { Request, Response } from 'express';
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
export const getAllSchedulesPublic = async (_: Request, res: Response): Promise<void> => {
  const schedules = await getPublicSchedules();
  res.json(schedules);
};

/**
 * @description retrieve all schedules with client and employee infromation
 * @route /api/schedules/dashboard
 * @method GET
 */
export const getAllSchedulesPrivate = async (_: Request, res: Response): Promise<void> => {
  const schedules = await getPrivateSchedules();
  res.json(schedules);
};

/**
 * @description create a single or multiple schedules
 * @route /api/schedules
 * @method POST
 */
export const createNewSchedule = async (req: Request, res: Response): Promise<void> => {
  const { dates, open, close } = req.body;
  const dateRangeToSchedule = generateRange(dates, open, close);
  const newSchedules = dateRangeToSchedule.map((s) => {
    return Schedule.create({
      date: s.date.toDate(),
      open: s.open.toDate(),
      close: s.close.toDate(),
    });
  });
  const savedSchedules = await Promise.all(newSchedules);
  res.status(201).json({
    success: true,
    message: 'New schedule added',
    data: savedSchedules,
  });
};
