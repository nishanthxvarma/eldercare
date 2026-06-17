import { Request, Response } from 'express';
import { catchAsync } from '../utils/catchAsync';
import { Resident } from '../models/Resident';
import { User } from '../models/User';
import { Medication } from '../models/Medication';
import { Notification } from '../models/Notification';
import { HealthRecord } from '../models/HealthRecord';
import { DailyCareLog } from '../models/DailyCareLog';
import { MedicationLog } from '../models/MedicationLog';

export const getAdminAnalytics = catchAsync(async (req: Request, res: Response) => {
  const facilityId = req.user.facilityId;
  const currentUserId = req.user.id;

  const [totalResidents, totalCaretakers, activeMedications, pendingNotifications, recentAdmissions] = await Promise.all([
    Resident.countDocuments({ facilityId, isDeleted: false }),
    User.countDocuments({ facilityId, role: 'CARETAKER', isActive: true, isDeleted: false }),
    Medication.countDocuments({ facilityId, isActive: true, isDeleted: false }),
    Notification.countDocuments({ userId: currentUserId, isRead: false }),
    Resident.find({ facilityId, isDeleted: false }).sort({ admissionDate: -1 }).limit(5).select('firstName lastName roomNumber admissionDate'),
  ]);

  res.status(200).json({
    success: true,
    data: {
      totalResidents,
      totalCaretakers,
      activeMedications,
      pendingNotifications,
      recentAdmissions,
    }
  });
});

export const getWeeklyTrends = catchAsync(async (req: Request, res: Response) => {
  const facilityId = req.user.facilityId;
  const days: { name: string; admissions: number; careLogs: number }[] = [];

  for (let i = 6; i >= 0; i--) {
    const startOfDay = new Date();
    startOfDay.setDate(startOfDay.getDate() - i);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(startOfDay);
    endOfDay.setHours(23, 59, 59, 999);

    const dayName = startOfDay.toLocaleDateString('en-US', { weekday: 'short' });

    const [admissions, careLogs] = await Promise.all([
      Resident.countDocuments({ facilityId, admissionDate: { $gte: startOfDay, $lte: endOfDay } }),
      DailyCareLog.countDocuments({ createdAt: { $gte: startOfDay, $lte: endOfDay } }),
    ]);

    days.push({ name: dayName, admissions, careLogs });
  }

  res.status(200).json({ success: true, data: days });
});

export const getCaretakerAnalytics = catchAsync(async (req: Request, res: Response) => {
  const currentUserId = req.user.id;

  const user = await User.findById(currentUserId).select('assignedResidents');
  const assignedResidentsCount = user?.assignedResidents?.length || 0;

  const startOfDay = new Date(); startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(); endOfDay.setHours(23, 59, 59, 999);

  const [completedTasksToday, pendingMedications] = await Promise.all([
    DailyCareLog.countDocuments({
      caretakerId: currentUserId,
      createdAt: { $gte: startOfDay, $lte: endOfDay }
    }),
    Medication.countDocuments({
      residentId: { $in: user?.assignedResidents || [] },
      isActive: true,
    }),
  ]);

  // tasksDueToday = pending medications + 1 care log per resident
  const tasksDueToday = pendingMedications + assignedResidentsCount;

  res.status(200).json({
    success: true,
    data: {
      assignedResidentsCount,
      tasksDueToday,
      completedTasksToday,
    }
  });
});

export const getFamilyAnalytics = catchAsync(async (req: Request, res: Response) => {
  const currentUserId = req.user.id;
  const user = await User.findById(currentUserId).select('familyRelations');

  if (!user || !user.familyRelations || user.familyRelations.length === 0) {
    res.status(200).json({ success: true, data: null });
    return;
  }

  const residentId = user.familyRelations[0].residentId;

  const [recentHealth, recentLogs, totalLogs, administeredLogs] = await Promise.all([
    HealthRecord.find({ residentId }).sort({ recordedAt: -1 }).limit(5),
    DailyCareLog.find({ residentId }).sort({ createdAt: -1 }).limit(5).populate('caretakerId', 'firstName lastName'),
    MedicationLog.countDocuments({ residentId }),
    MedicationLog.countDocuments({ residentId, status: 'ADMINISTERED' }),
  ]);

  const medicationAdherencePercentage = totalLogs > 0
    ? Math.round((administeredLogs / totalLogs) * 100)
    : 0;

  res.status(200).json({
    success: true,
    data: {
      medicationAdherencePercentage,
      recentHealthUpdates: recentHealth,
      latestCareLogs: recentLogs,
    }
  });
});
