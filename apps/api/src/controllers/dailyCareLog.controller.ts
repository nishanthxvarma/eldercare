import { Request, Response } from 'express';
import { catchAsync } from '../utils/catchAsync';
import { DailyCareLogService } from '../services/dailyCareLog.service';

export const createCareLog = catchAsync(async (req: Request, res: Response) => {
  const caretakerId = req.user.id;
  const log = await DailyCareLogService.createCareLog(caretakerId, req.body);
  
  res.status(201).json({
    success: true,
    data: log,
    message: 'Care log created successfully'
  });
});

export const getCareLogs = catchAsync(async (req: Request, res: Response) => {
  const { residentId, type } = req.query as Record<string, string>;
  const logs = await DailyCareLogService.getCareLogs(residentId, type);
  
  res.status(200).json({
    success: true,
    data: logs
  });
});

export const getCareLogById = catchAsync(async (req: Request, res: Response) => {
  const log = await DailyCareLogService.getCareLogById(req.params.id);
  
  res.status(200).json({
    success: true,
    data: log
  });
});
