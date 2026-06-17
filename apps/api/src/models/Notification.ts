import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  message: string;
  type: 'ALERT' | 'INFO' | 'REMINDER' | 'EMERGENCY';
  isRead: boolean;
  link?: string;
  createdAt: Date;
}

const NotificationSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: { type: String, enum: ['ALERT', 'INFO', 'REMINDER', 'EMERGENCY'], required: true },
    isRead: { type: Boolean, default: false, index: true },
    link: { type: String },
    createdAt: { type: Date, expires: '30d', default: Date.now },
  }
);

export const Notification = mongoose.model<INotification>('Notification', NotificationSchema);
