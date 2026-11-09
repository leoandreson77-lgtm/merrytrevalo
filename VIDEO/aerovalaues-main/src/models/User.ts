import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  role: "admin" | "agent" | "vendor" | "customer";
  vendorId?: mongoose.Types.ObjectId;
  status: "active" | "inactive";
  tokenVersion?: number;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema<IUser> = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: ["admin", "agent", "vendor", "customer"],
      default: "customer",
    },
    vendorId: { type: Schema.Types.ObjectId, ref: "Vendor", default: null },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    tokenVersion: { type: Number, default: 0 },
    resetPasswordToken: { type: String, default: null },
    resetPasswordExpires: { type: Date, default: null },
  },
  { timestamps: true }
);

export const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
