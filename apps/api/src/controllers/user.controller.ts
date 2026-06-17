import { Request, Response } from 'express';
import { catchAsync } from '../utils/catchAsync';
import { User } from '../models/User';
import { Resident } from '../models/Resident';
import bcrypt from 'bcryptjs';
import { ApiError } from '../utils/ApiError';

export const getUsers = catchAsync(async (req: Request, res: Response) => {
  const facilityId = req.user.facilityId;
  const currentUserId = req.user.id;
  const { role, search } = req.query as Record<string, string>;

  const query: any = {
    facilityId,
    _id: { $ne: currentUserId },
    isDeleted: false,
  };

  if (role) query.role = role;
  if (search) {
    query.$or = [
      { firstName: { $regex: search, $options: 'i' } },
      { lastName: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }

  const users = await User.find(query)
    .select('-passwordHash')
    .populate('assignedResidents', 'firstName lastName roomNumber')
    .populate('familyRelations.residentId', 'firstName lastName roomNumber')
    .sort({ firstName: 1 });

  res.status(200).json({ success: true, data: users });
});

export const createUser = catchAsync(async (req: Request, res: Response) => {
  const facilityId = req.user.facilityId;
  const { email, password, firstName, lastName, phone, role, shift, employeeId, familyRelations } = req.body;

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) throw new ApiError(409, 'A user with this email already exists');

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await User.create({
    facilityId,
    email,
    passwordHash,
    firstName,
    lastName,
    phone,
    role,
    shift,
    employeeId,
    familyRelations: familyRelations || [],
  });

  const userObj = user.toObject() as any;
  delete userObj.passwordHash;

  res.status(201).json({ success: true, data: userObj, message: 'User created successfully' });
});

export const getUserById = catchAsync(async (req: Request, res: Response) => {
  const facilityId = req.user.facilityId;
  const user = await User.findOne({ _id: req.params.id, facilityId, isDeleted: false })
    .select('-passwordHash')
    .populate('assignedResidents', 'firstName lastName roomNumber')
    .populate('familyRelations.residentId', 'firstName lastName roomNumber');

  if (!user) throw new ApiError(404, 'User not found');
  res.status(200).json({ success: true, data: user });
});

export const updateUser = catchAsync(async (req: Request, res: Response) => {
  const facilityId = req.user.facilityId;
  const { password, ...rest } = req.body;

  const updateData: any = { ...rest };
  if (password) {
    updateData.passwordHash = await bcrypt.hash(password, 12);
  }

  const user = await User.findOneAndUpdate(
    { _id: req.params.id, facilityId, isDeleted: false },
    { $set: updateData },
    { new: true, runValidators: true }
  ).select('-passwordHash');

  if (!user) throw new ApiError(404, 'User not found');
  res.status(200).json({ success: true, data: user, message: 'User updated successfully' });
});

export const deleteUser = catchAsync(async (req: Request, res: Response) => {
  const facilityId = req.user.facilityId;
  const user = await User.findOneAndUpdate(
    { _id: req.params.id, facilityId, isDeleted: false },
    { $set: { isDeleted: true, isActive: false } },
    { new: true }
  );

  if (!user) throw new ApiError(404, 'User not found');
  res.status(200).json({ success: true, message: 'User deactivated successfully' });
});

export const assignResidents = catchAsync(async (req: Request, res: Response) => {
  const facilityId = req.user.facilityId;
  const { residentIds } = req.body;

  // Verify all residents belong to facility
  const residents = await Resident.find({ _id: { $in: residentIds }, facilityId, isDeleted: false });
  if (residents.length !== residentIds.length) {
    throw new ApiError(400, 'One or more residents not found in this facility');
  }

  const user = await User.findOneAndUpdate(
    { _id: req.params.id, facilityId, role: 'CARETAKER', isDeleted: false },
    { $set: { assignedResidents: residentIds } },
    { new: true }
  ).select('-passwordHash').populate('assignedResidents', 'firstName lastName roomNumber');

  if (!user) throw new ApiError(404, 'Caretaker not found');
  res.status(200).json({ success: true, data: user, message: 'Residents assigned successfully' });
});
