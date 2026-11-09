import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICall extends Document {
  clickTimestamp?: Date;
  visitorIp?: string;
  browser?: string;
  device?: string;
  landingPage?: string;
  referrer?: string;
  sessionId?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  numberDialed?: string; // Number dialed or clicked (e.g. US Local, Toll-Free)
  duration?: number; // In seconds
  twilioCallSid?: string; // Twilio unique identifier
  status: "Clicked" | "Ringing" | "Answered" | "Completed" | "Missed" | "Failed";
  recordingUrl?: string;
  notes?: string;
  leadId?: mongoose.Types.ObjectId; // CRM lead link
  vendorId?: mongoose.Types.ObjectId; // Routing link
  createdAt: Date;
  updatedAt: Date;
}

const CallSchema: Schema<ICall> = new Schema(
  {
    clickTimestamp: { type: Date, default: Date.now },
    visitorIp: { type: String, default: "" },
    browser: { type: String, default: "" },
    device: { type: String, default: "" },
    landingPage: { type: String, default: "" },
    referrer: { type: String, default: "" },
    sessionId: { type: String, default: "" },
    utmSource: { type: String, default: "" },
    utmMedium: { type: String, default: "" },
    utmCampaign: { type: String, default: "" },
    numberDialed: { type: String, default: "" },
    duration: { type: Number, default: 0 },
    twilioCallSid: { type: String, default: "", index: true },
    status: {
      type: String,
      enum: [
        "Clicked",
        "Ringing",
        "Answered",
        "Completed",
        "Missed",
        "Failed",
      ],
      default: "Clicked",
      index: true,
    },
    recordingUrl: { type: String, default: "" },
    notes: { type: String, default: "" },
    leadId: { type: Schema.Types.ObjectId, ref: "Lead", default: null, index: true },
    vendorId: { type: Schema.Types.ObjectId, ref: "Vendor", default: null, index: true },
  },
  { timestamps: true }
);

export const Call: Model<ICall> =
  mongoose.models.Call || mongoose.model<ICall>("Call", CallSchema);
