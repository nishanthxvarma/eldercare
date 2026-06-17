import { Medication, IMedication } from '../models/Medication';
import { MedicationLog } from '../models/MedicationLog';
import { Resident } from '../models/Resident';
import { ApiError } from '../utils/ApiError';

export class MedicationService {
  static async createMedication(facilityId: string, data: Partial<IMedication>) {
    // Verify resident belongs to this facility
    const resident = await Resident.findOne({ _id: data.residentId, facilityId, isDeleted: false });
    if (!resident) throw new ApiError(404, 'Resident not found in this facility');

    const medication = await Medication.create({ ...data, facilityId });
    return medication.populate('residentId', 'firstName lastName roomNumber');
  }

  static async getMedications(facilityId: string, residentId?: string, search?: string) {
    const query: any = { facilityId, isDeleted: false };
    if (residentId) query.residentId = residentId;
    if (search) query.name = { $regex: search, $options: 'i' };

    const medications = await Medication.find(query)
      .populate('residentId', 'firstName lastName roomNumber')
      .sort({ createdAt: -1 });
    return medications;
  }

  static async getMedicationById(facilityId: string, id: string) {
    const medication = await Medication.findOne({ _id: id, facilityId, isDeleted: false })
      .populate('residentId', 'firstName lastName roomNumber');
    if (!medication) throw new ApiError(404, 'Medication not found');
    return medication;
  }

  static async updateMedication(facilityId: string, id: string, data: Partial<IMedication>) {
    const medication = await Medication.findOneAndUpdate(
      { _id: id, facilityId, isDeleted: false },
      { $set: data },
      { new: true, runValidators: true }
    ).populate('residentId', 'firstName lastName roomNumber');

    if (!medication) throw new ApiError(404, 'Medication not found');
    return medication;
  }

  static async deleteMedication(facilityId: string, id: string) {
    const medication = await Medication.findOneAndUpdate(
      { _id: id, facilityId, isDeleted: false },
      { $set: { isDeleted: true, isActive: false } },
      { new: true }
    );

    if (!medication) throw new ApiError(404, 'Medication not found');
    return true;
  }

  static async logAdministration(facilityId: string, data: any) {
    const med = await Medication.findOne({ _id: data.medicationId, facilityId, isDeleted: false });
    if (!med) throw new ApiError(404, 'Medication not found');

    const log = await MedicationLog.create({
      medicationId: data.medicationId,
      residentId: med.residentId,
      caretakerId: data.caretakerId,
      status: data.status,
      administeredAt: data.administeredAt || new Date(),
      notes: data.notes,
    });

    return log;
  }

  static async getMedicationLogs(facilityId: string, medicationId?: string, residentId?: string) {
    const med = medicationId
      ? await Medication.findOne({ _id: medicationId, facilityId, isDeleted: false })
      : null;

    const query: any = {};
    if (medicationId) {
      if (!med) throw new ApiError(404, 'Medication not found');
      query.medicationId = medicationId;
    }
    if (residentId) query.residentId = residentId;

    const logs = await MedicationLog.find(query)
      .populate('caretakerId', 'firstName lastName')
      .populate('medicationId', 'name dosage')
      .sort({ administeredAt: -1 })
      .limit(50);

    return logs;
  }
}
