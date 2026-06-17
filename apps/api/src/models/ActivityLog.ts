import mongoose, { Schema, Document } from 'mongoose';

export interface IActivityLog extends Document {
  facilityId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  action: string;
  entityId?: mongoose.Types.ObjectId;
  entityModel?: string;
  details?: any;
  ipAddress?: string;
  createdAt: Date;
}

const ActivityLogSchema = new Schema(
  {
    facilityId: { type: Schema.Types.ObjectId, ref: 'Facility', index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    action: { type: String, required: true },
    entityId: { type: Schema.Types.ObjectId },
    entityModel: { type: String },
    details: { type: Schema.Types.Mixed },
    ipAddress: { type: String },
    createdAt: { type: Date, expires: '90d', default: Date.now },
  }
);

export const ActivityLog = mongoose.model<IActivityLog>('ActivityLog', ActivityLogSchema);
