import mongoose, { Schema, Document, Model } from "mongoose";

export interface ITFN extends Document {
  number: string;               // +18001234567
  friendlyName: string;        // "Main TFN - Flights"
  twilioSid?: string;          // Twilio Phone Number SID
  status: "active" | "standby" | "blocked" | "released";
  clientId?: mongoose.Types.ObjectId;
  landingPageSlug?: string;    // Which landing page uses this TFN
  campaign?: string;           // "Google Ads - Flights"
  callsToday: number;
  callsTotal: number;
  isDefault: boolean;          // Main fallback TFN
  blockedAt?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const TFNSchema: Schema<ITFN> = new Schema(
  {
    number: { type: String, required: true, unique: true },
    friendlyName: { type: String, default: "" },
    twilioSid: { type: String, default: "" },
    status: {
      type: String,
      enum: ["active", "standby", "blocked", "released"],
      default: "standby",
      index: true,
    },
    clientId: { type: Schema.Types.ObjectId, ref: "Client", default: null },
    landingPageSlug: { type: String, default: "" },
    campaign: { type: String, default: "" },
    callsToday: { type: Number, default: 0 },
    callsTotal: { type: Number, default: 0 },
    isDefault: { type: Boolean, default: false },
    blockedAt: { type: Date, default: null },
    notes: { type: String, default: "" },
  },
  { timestamps: true }
);

export const TFN: Model<ITFN> =
  mongoose.models.TFN || mongoose.model<ITFN>("TFN", TFNSchema);
