import { Request, Response } from 'express';
import { catchAsync } from '../utils/catchAsync';
import { MedicationService } from '../services/medication.service';

export const createMedication = catchAsync(async (req: Request, res: Response) => {
  const facilityId = req.user.facilityId;
  const medication = await MedicationService.createMedication(facilityId, req.body);
  
  res.status(201).json({
    success: true,
    data: medication,
    message: 'Medication created successfully'
  });
});

export const logAdministration = catchAsync(async (req: Request, res: Response) => {
  const facilityId = req.user.facilityId;
  const log = await MedicationService.logAdministration(facilityId, {
    ...req.body,
    medicationId: req.params.id,
    caretakerId: req.user.id,
  });
  
  res.status(201).json({
    success: true,
    data: log,
    message: 'Medication administration logged'
  });
});

export const getMedications = catchAsync(async (req: Request, res: Response) => {
  const facilityId = req.user.facilityId;
  const { residentId, search } = req.query as Record<string, string>;
  const medications = await MedicationService.getMedications(facilityId, residentId, search);
  
  res.status(200).json({
    success: true,
    data: medications
  });
});

export const getMedicationById = catchAsync(async (req: Request, res: Response) => {
  const facilityId = req.user.facilityId;
  const medication = await MedicationService.getMedicationById(facilityId, req.params.id);
  
  res.status(200).json({
    success: true,
    data: medication
  });
});

export const updateMedication = catchAsync(async (req: Request, res: Response) => {
  const facilityId = req.user.facilityId;
  const medication = await MedicationService.updateMedication(facilityId, req.params.id, req.body);
  
  res.status(200).json({
    success: true,
    data: medication,
    message: 'Medication updated successfully'
  });
});

export const deleteMedication = catchAsync(async (req: Request, res: Response) => {
  const facilityId = req.user.facilityId;
  await MedicationService.deleteMedication(facilityId, req.params.id);
  
  res.status(200).json({
    success: true,
    message: 'Medication deleted successfully'
  });
});

export const getMedicationLogs = catchAsync(async (req: Request, res: Response) => {
  const facilityId = req.user.facilityId;
  const { residentId } = req.query as Record<string, string>;
  const logs = await MedicationService.getMedicationLogs(facilityId, req.params.id, residentId);
  
  res.status(200).json({
    success: true,
    data: logs
  });
});
