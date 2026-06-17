import { Request, Response } from 'express';
import { catchAsync } from '../utils/catchAsync';
import { ResidentService } from '../services/resident.service';

export const createResident = catchAsync(async (req: Request, res: Response) => {
  const facilityId = req.user.facilityId;
  const resident = await ResidentService.createResident(facilityId, req.body);
  
  res.status(201).json({
    success: true,
    data: resident,
    message: 'Resident created successfully'
  });
});

export const getResidents = catchAsync(async (req: Request, res: Response) => {
  const facilityId = req.user.facilityId;
  const { page, limit, search, roomNumber, caretakerId } = req.query as Record<string, string>;
  
  const result = await ResidentService.getResidents(facilityId, Number(page) || 1, Number(limit) || 10, search, roomNumber, caretakerId);
  
  res.status(200).json({
    success: true,
    data: result
  });
});

export const getResidentById = catchAsync(async (req: Request, res: Response) => {
  const facilityId = req.user.facilityId;
  const resident = await ResidentService.getResidentById(facilityId, req.params.id);
  
  res.status(200).json({
    success: true,
    data: resident
  });
});

export const updateResident = catchAsync(async (req: Request, res: Response) => {
  const facilityId = req.user.facilityId;
  const resident = await ResidentService.updateResident(facilityId, req.params.id, req.body);
  
  res.status(200).json({
    success: true,
    data: resident,
    message: 'Resident updated successfully'
  });
});

export const deleteResident = catchAsync(async (req: Request, res: Response) => {
  const facilityId = req.user.facilityId;
  await ResidentService.deleteResident(facilityId, req.params.id);
  
  res.status(200).json({
    success: true,
    message: 'Resident deleted successfully'
  });
});
