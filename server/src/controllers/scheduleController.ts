import { Request, Response } from 'express';
import {
  getPublicSchedules,
  getPrivateSchedules,
  createSchedules,
} from '../services/scheduleService.js';
import { sendProblem } from '../utils/problemDetails.js';

/**
 * @description retrieve all public schedules for booking page includes only employee id
 * @route /api/schedules
 * @method GET
 */
export const getAllSchedulesPublic = async (req: Request, res: Response) => {
  const result = await getPublicSchedules();
  return result.match({
    ok: (schedules) => res.json(schedules),
    err: (error) => sendProblem(res, req, error),
  });
};

/**
 * @description retrieve all schedules with client and employee infromation
 * @route /api/schedules/dashboard
 * @method GET
 */
export const getAllSchedulesPrivate = async (req: Request, res: Response) => {
  const result = await getPrivateSchedules();
  return result.match({
    ok: (schedules) => res.json(schedules),
    err: (error) => sendProblem(res, req, error),
  });
};

/**
 * @description create a single or multiple schedules
 * @route /api/schedules
 * @method POST
 */
export const createNewSchedule = async (req: Request, res: Response) => {
  const { dates, open, close } = req.body;
  const result = await createSchedules(dates, open, close);
  return result.match({
    ok: (savedSchedules) =>
      res.status(201).json({
        success: true,
        message: 'New schedule added',
        data: savedSchedules,
      }),
    err: (error) => sendProblem(res, req, error),
  });
};
