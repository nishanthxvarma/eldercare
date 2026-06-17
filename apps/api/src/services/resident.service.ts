import { Resident, IResident } from '../models/Resident';
import { ApiError } from '../utils/ApiError';

export class ResidentService {
  static async createResident(facilityId: string, data: Partial<IResident>) {
    const resident = await Resident.create({ ...data, facilityId });
    return resident;
  }

  static async getResidents(facilityId: string, page: number, limit: number, search?: string, roomNumber?: string, caretakerId?: string) {
    const query: any = { facilityId, isDeleted: false };
    
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } }
      ];
    }

    if (roomNumber) {
      query.roomNumber = { $regex: roomNumber, $options: 'i' };
    }

    if (caretakerId) {
      const { User } = await import('../models/User');
      const caretaker = await User.findOne({ _id: caretakerId, role: 'CARETAKER', facilityId });
      if (caretaker && caretaker.assignedResidents) {
        query._id = { $in: caretaker.assignedResidents };
      } else {
        // Return nothing if caretaker not found or has no assigned residents
        return { residents: [], total: 0, page, pages: 0 };
      }
    }

    const skip = (page - 1) * limit;
    
    const [residents, total] = await Promise.all([
      Resident.find(query).skip(skip).limit(limit).sort({ lastName: 1, firstName: 1 }),
      Resident.countDocuments(query)
    ]);

    return {
      residents,
      total,
      page,
      pages: Math.ceil(total / limit)
    };
  }

  static async getResidentById(facilityId: string, id: string) {
    const resident = await Resident.findOne({ _id: id, facilityId, isDeleted: false });
    if (!resident) {
      throw new ApiError(404, 'Resident not found');
    }
    return resident;
  }

  static async updateResident(facilityId: string, id: string, data: Partial<IResident>) {
    const resident = await Resident.findOneAndUpdate(
      { _id: id, facilityId, isDeleted: false },
      { $set: data },
      { new: true, runValidators: true }
    );

    if (!resident) {
      throw new ApiError(404, 'Resident not found');
    }
    return resident;
  }

  static async deleteResident(facilityId: string, id: string) {
    const resident = await Resident.findOneAndUpdate(
      { _id: id, facilityId, isDeleted: false },
      { $set: { isDeleted: true } },
      { new: true }
    );

    if (!resident) {
      throw new ApiError(404, 'Resident not found');
    }
    return true;
  }
}
