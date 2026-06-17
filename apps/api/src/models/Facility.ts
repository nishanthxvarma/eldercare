import mongoose, { Schema, Document } from 'mongoose';

export interface IFacility extends Document {
  name: string;
  address?: string;
  contactEmail?: string;
  contactPhone?: string;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const FacilitySchema = new Schema(
  {
    name: { type: String, required: true },
    address: { type: String },
    contactEmail: { type: String },
    contactPhone: { type: String },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

FacilitySchema.pre(/^find/, function (this: any, next: any) {
  this.find({ isDeleted: { $ne: true } });
  next();
});

export const Facility = mongoose.model<IFacility>('Facility', FacilitySchema);
