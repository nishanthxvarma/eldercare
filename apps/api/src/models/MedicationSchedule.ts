import mongoose, { Schema, Document } from 'mongoose';

export interface IMedicationSchedule extends Document {
  medicationId: mongoose.Types.ObjectId;
  residentId: mongoose.Types.ObjectId;
  timeOfDay: string; // e.g. "08:00" in UTC or local
  frequency: 'DAILY' | 'WEEKLY' | 'AS_NEEDED';
  daysOfWeek?: number[];
  isDeleted: boolean;
}

const MedicationScheduleSchema = new Schema(
  {
    medicationId: { type: Schema.Types.ObjectId, ref: 'Medication', required: true },
    residentId: { type: Schema.Types.ObjectId, ref: 'Resident', required: true, index: true },
    timeOfDay: { type: String, required: true },
    frequency: { type: String, enum: ['DAILY', 'WEEKLY', 'AS_NEEDED'], required: true },
    daysOfWeek: [{ type: Number }],
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

MedicationScheduleSchema.pre(/^find/, function (this: any, next: any) {
  this.find({ isDeleted: { $ne: true } });
  next();
});

export const MedicationSchedule = mongoose.model<IMedicationSchedule>('MedicationSchedule', MedicationScheduleSchema);
