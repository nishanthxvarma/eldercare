import mongoose, { Schema, Document } from 'mongoose';

export interface IMedicationLog extends Document {
  scheduleId?: mongoose.Types.ObjectId;
  medicationId: mongoose.Types.ObjectId;
  residentId: mongoose.Types.ObjectId;
  caretakerId: mongoose.Types.ObjectId;
  status: 'ADMINISTERED' | 'MISSED' | 'REFUSED';
  administeredAt: Date;
  notes?: string;
}

const MedicationLogSchema = new Schema(
  {
    scheduleId: { type: Schema.Types.ObjectId, ref: 'MedicationSchedule' },
    medicationId: { type: Schema.Types.ObjectId, ref: 'Medication', required: true },
    residentId: { type: Schema.Types.ObjectId, ref: 'Resident', required: true, index: true },
    caretakerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['ADMINISTERED', 'MISSED', 'REFUSED'], required: true },
    administeredAt: { type: Date, required: true, index: true },
    notes: { type: String },
  },
  { timestamps: true }
);

export const MedicationLog = mongoose.model<IMedicationLog>('MedicationLog', MedicationLogSchema);
