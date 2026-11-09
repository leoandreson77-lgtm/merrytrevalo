import mongoose, { Schema, Document, Model } from "mongoose";

export interface IClient extends Document {
  name: string;
  email?: string;
  phone?: string;
  forwardNumber: string;        // Where to forward calls
  ratePerCall: number;          // $28 per call
  ratePerMinute?: number;       // Optional per-minute rate
  minDuration: number;          // Minimum seconds for valid call
  maxCallsPerDay: number;       // Daily cap
  allowedHoursStart: string;    // "09:00"
  allowedHoursEnd: string;      // "18:00"
  allowedTimezone: string;      // "America/New_York"
  allowedStates: string[];      // ["NY", "CA"] or [] for all
  isActive: boolean;
  totalCallsToday: number;
  totalCallsAllTime: number;
  totalEarnings: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ClientSchema: Schema<IClient> = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, default: "" },
    phone: { type: String, default: "" },
    forwardNumber: { type: String, required: true },
    ratePerCall: { type: Number, default: 28 },
    ratePerMinute: { type: Number, default: 0 },
    minDuration: { type: Number, default: 60 }, // 60 seconds minimum
    maxCallsPerDay: { type: Number, default: 100 },
    allowedHoursStart: { type: String, default: "08:00" },
    allowedHoursEnd: { type: String, default: "20:00" },
    allowedTimezone: { type: String, default: "America/New_York" },
    allowedStates: { type: [String], default: [] },
    isActive: { type: Boolean, default: true, index: true },
    totalCallsToday: { type: Number, default: 0 },
    totalCallsAllTime: { type: Number, default: 0 },
    totalEarnings: { type: Number, default: 0 },
    notes: { type: String, default: "" },
  },
  { timestamps: true }
);

export const Client: Model<IClient> =
  mongoose.models.Client || mongoose.model<IClient>("Client", ClientSchema);
