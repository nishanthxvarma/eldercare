import mongoose, { Schema, Document } from 'mongoose';

export interface IDailyCareLog extends Document {
  residentId: mongoose.Types.ObjectId;
  caretakerId: mongoose.Types.ObjectId;
  type: 'MEAL' | 'HYGIENE' | 'ACTIVITY' | 'MOOD' | 'OTHER';
  description: string;
  timestamp: Date;
}

const DailyCareLogSchema = new Schema(
  {
    residentId: { type: Schema.Types.ObjectId, ref: 'Resident', required: true, index: true },
    caretakerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['MEAL', 'HYGIENE', 'ACTIVITY', 'MOOD', 'OTHER'], required: true, index: true },
    description: { type: String, required: true },
    timestamp: { type: Date, required: true, index: true },
  },
  { timestamps: true }
);

export const DailyCareLog = mongoose.model<IDailyCareLog>('DailyCareLog', DailyCareLogSchema);
