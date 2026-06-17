import { HealthRecord, IHealthRecord } from '../models/HealthRecord';
import { ApiError } from '../utils/ApiError';

export class HealthRecordService {
  static async createHealthRecord(caretakerId: string, data: Partial<IHealthRecord>) {
    const record = await HealthRecord.create({ ...data, caretakerId });
    return record;
  }

  static async getHealthRecords(residentId?: string, startDate?: string, endDate?: string) {
    const query: any = {};
    if (residentId) query.residentId = residentId;
    
    if (startDate || endDate) {
      query.recordedAt = {};
      if (startDate) query.recordedAt.$gte = new Date(startDate);
      if (endDate) query.recordedAt.$lte = new Date(endDate);
    }

    const records = await HealthRecord.find(query)
      .sort({ recordedAt: -1 })
      .populate('caretakerId', 'firstName lastName');
    return records;
  }

  static async getHealthRecordById(id: string) {
    const record = await HealthRecord.findById(id).populate('caretakerId', 'firstName lastName');
    if (!record) {
      throw new ApiError(404, 'Health record not found');
    }
    return record;
  }
}
