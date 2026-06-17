import mongoose, { Schema, Document } from 'mongoose';

export interface IResident extends Document {
  facilityId: mongoose.Types.ObjectId;
  firstName: string;
  lastName: string;
  profilePhotoUrl?: string;
  dateOfBirth: Date;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  roomNumber: string;
  admissionDate: Date;
  allergies?: string[];
  medicalHistory?: {
    condition: string;
    diagnosedDate?: Date;
    notes?: string;
  }[];
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ResidentSchema = new Schema(
  {
    facilityId: { type: Schema.Types.ObjectId, ref: 'Facility', required: true, index: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    profilePhotoUrl: { type: String },
    dateOfBirth: { type: Date, required: true },
    gender: { type: String, enum: ['MALE', 'FEMALE', 'OTHER'], required: true },
    roomNumber: { type: String, required: true, index: true },
    admissionDate: { type: Date, required: true },
    allergies: [{ type: String }],
    medicalHistory: [
      {
        condition: String,
        diagnosedDate: Date,
        notes: String,
      },
    ],
    emergencyContact: {
      name: { type: String, required: true },
      phone: { type: String, required: true },
      relationship: { type: String, required: true },
    },
    isDeleted: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

ResidentSchema.pre(/^find/, function (this: any, next: any) {
  this.find({ isDeleted: { $ne: true } });
  next();
});

export const Resident = mongoose.model<IResident>('Resident', ResidentSchema);
