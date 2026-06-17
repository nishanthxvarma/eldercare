import { DailyCareLog, IDailyCareLog } from '../models/DailyCareLog';
import { ApiError } from '../utils/ApiError';

export class DailyCareLogService {
  static async createCareLog(caretakerId: string, data: Partial<IDailyCareLog>) {
    const log = await DailyCareLog.create({ ...data, caretakerId });
    return log;
  }

  static async getCareLogs(residentId?: string, type?: string) {
    const query: any = {};
    if (residentId) query.residentId = residentId;
    if (type) query.type = type;

    const logs = await DailyCareLog.find(query)
      .sort({ timestamp: -1 })
      .populate('caretakerId', 'firstName lastName');
    return logs;
  }

  static async getCareLogById(id: string) {
    const log = await DailyCareLog.findById(id).populate('caretakerId', 'firstName lastName');
    if (!log) {
      throw new ApiError(404, 'Care log not found');
    }
    return log;
  }
}
