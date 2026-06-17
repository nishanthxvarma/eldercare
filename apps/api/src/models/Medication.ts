import mongoose, { Schema, Document } from 'mongoose';

export interface IMedication extends Document {
  facilityId: mongoose.Types.ObjectId;
  residentId: mongoose.Types.ObjectId;
  name: string;
  dosage: string;
  frequency: 'ONCE_DAILY' | 'TWICE_DAILY' | 'THREE_TIMES_DAILY' | 'FOUR_TIMES_DAILY' | 'AS_NEEDED' | 'WEEKLY' | 'MONTHLY';
  schedule?: string[];
  instructions?: string;
  prescribedBy: string;
  startDate: Date;
  endDate?: Date;
  isActive: boolean;
  isDeleted: boolean;
}

const MedicationSchema = new Schema(
  {
    facilityId: { type: Schema.Types.ObjectId, ref: 'Facility', required: true, index: true },
    residentId: { type: Schema.Types.ObjectId, ref: 'Resident', required: true, index: true },
    name: { type: String, required: true },
    dosage: { type: String, required: true },
    frequency: {
      type: String,
      enum: ['ONCE_DAILY', 'TWICE_DAILY', 'THREE_TIMES_DAILY', 'FOUR_TIMES_DAILY', 'AS_NEEDED', 'WEEKLY', 'MONTHLY'],
      default: 'ONCE_DAILY',
    },
    schedule: [{ type: String }],
    instructions: { type: String },
    prescribedBy: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

MedicationSchema.pre(/^find/, function (this: any, next: any) {
  this.find({ isDeleted: { $ne: true } });
  next();
});

export const Medication = mongoose.model<IMedication>('Medication', MedicationSchema);
