import { Request, Response } from 'express';
import { catchAsync } from '../utils/catchAsync';
import { HealthRecordService } from '../services/healthRecord.service';

export const createHealthRecord = catchAsync(async (req: Request, res: Response) => {
  const caretakerId = req.user.id;
  const record = await HealthRecordService.createHealthRecord(caretakerId, req.body);
  
  res.status(201).json({
    success: true,
    data: record,
    message: 'Health record created successfully'
  });
});

export const getHealthRecords = catchAsync(async (req: Request, res: Response) => {
  const { residentId, startDate, endDate } = req.query as Record<string, string>;
  const records = await HealthRecordService.getHealthRecords(residentId, startDate, endDate);
  
  res.status(200).json({
    success: true,
    data: records
  });
});

export const getHealthRecordById = catchAsync(async (req: Request, res: Response) => {
  const record = await HealthRecordService.getHealthRecordById(req.params.id);
  
  res.status(200).json({
    success: true,
    data: record
  });
});
