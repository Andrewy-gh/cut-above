import { Request, Response } from 'express';
import {
  getPublicSchedules,
  getPrivateSchedules,
  createSchedules,
} from '../services/scheduleService.js';

/**
 * @description retrieve all public schedules for booking page includes only employee id
 * @route /api/schedules
 * @method GET
 */
export const getAllSchedulesPublic = async (_: Request, res: Response) => {
  const schedules = await getPublicSchedules();
  res.json(schedules);
};

/**
 * @description retrieve all schedules with client and employee infromation
 * @route /api/schedules/dashboard
 * @method GET
 */
export const getAllSchedulesPrivate = async (_: Request, res: Response) => {
  const schedules = await getPrivateSchedules();
  res.json(schedules);
};

/**
 * @description create a single or multiple schedules
 * @route /api/schedules
 * @method POST
 */
export const createNewSchedule = async (req: Request, res: Response) => {
  const { dates, open, close } = req.body;
  const savedSchedules = await createSchedules(dates, open, close);
  res.status(201).json({
    success: true,
    message: 'New schedule added',
    data: savedSchedules,
  });
};
