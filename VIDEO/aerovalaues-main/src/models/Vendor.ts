import mongoose, { Schema, Document, Model } from "mongoose";

export interface IVendor extends Document {
  name: string;
  email: string;
  phone: string;
  companyName: string;
  commissionRate: number; // e.g., percentage like 10 for 10%
  status: "active" | "inactive";
  apiKey: string; // For vendor-wise API leads insertion
  createdAt: Date;
  updatedAt: Date;
}

const VendorSchema: Schema<IVendor> = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    phone: { type: String, default: "" },
    companyName: { type: String, default: "" },
    commissionRate: { type: Number, default: 0 },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    apiKey: { type: String, unique: true, required: true, index: true },
  },
  { timestamps: true }
);

export const Vendor: Model<IVendor> =
  mongoose.models.Vendor || mongoose.model<IVendor>("Vendor", VendorSchema);
