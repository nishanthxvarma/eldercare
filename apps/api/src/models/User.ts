import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  facilityId: mongoose.Types.ObjectId;
  email: string;
  profilePhotoUrl?: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: 'ADMIN' | 'CARETAKER' | 'FAMILY';
  employeeId?: string;
  shift?: 'MORNING' | 'EVENING' | 'NIGHT';
  assignedResidents?: mongoose.Types.ObjectId[];
  familyRelations?: {
    residentId: mongoose.Types.ObjectId;
    relationshipType: string;
  }[];
  isActive: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema(
  {
    facilityId: { type: Schema.Types.ObjectId, ref: 'Facility', required: true, index: true },
    email: { type: String, required: true, unique: true, lowercase: true, index: true },
    passwordHash: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    phone: { type: String, required: true },
    profilePhotoUrl: { type: String },
    role: { type: String, enum: ['ADMIN', 'CARETAKER', 'FAMILY'], required: true, index: true },
    
    // Caretaker specific fields
    employeeId: { type: String },
    shift: { type: String, enum: ['MORNING', 'EVENING', 'NIGHT'] },
    assignedResidents: [{ type: Schema.Types.ObjectId, ref: 'Resident' }],
    
    // Family specific fields
    familyRelations: [
      {
        residentId: { type: Schema.Types.ObjectId, ref: 'Resident' },
        relationshipType: { type: String },
      },
    ],
    
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

UserSchema.pre(/^find/, function (this: any, next: any) {
  this.find({ isDeleted: { $ne: true } });
  next();
});

export const User = mongoose.model<IUser>('User', UserSchema);
