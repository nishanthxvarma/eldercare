import mongoose, { Schema, Document } from 'mongoose';

export interface IHealthRecord extends Document {
  residentId: mongoose.Types.ObjectId;
  caretakerId: mongoose.Types.ObjectId;
  vitals: {
    bloodPressure?: { systolic: number; diastolic: number };
    heartRate?: number;
    temperature?: number;
    bloodSugar?: number;
    oxygenLevel?: number;
  };
  notes?: string;
  recordedAt: Date;
  source: 'MANUAL' | 'DEVICE';
}

const HealthRecordSchema = new Schema(
  {
    residentId: { type: Schema.Types.ObjectId, ref: 'Resident', required: true, index: true },
    caretakerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    vitals: {
      bloodPressure: { systolic: Number, diastolic: Number },
      heartRate: { type: Number },
      temperature: { type: Number },
      bloodSugar: { type: Number },
      oxygenLevel: { type: Number },
    },
    notes: { type: String },
    recordedAt: { type: Date, required: true, index: true },
    source: { type: String, enum: ['MANUAL', 'DEVICE'], default: 'MANUAL' },
  },
  { timestamps: true }
);

export const HealthRecord = mongoose.model<IHealthRecord>('HealthRecord', HealthRecordSchema);
