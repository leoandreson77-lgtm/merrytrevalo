import mongoose, { Schema, Document, Model } from "mongoose";

export interface IWhatsApp extends Document {
  fromNumber: string;
  toNumber: string;
  message: string;
  direction: "incoming" | "outgoing";
  templateId?: string; // If template message was used
  timestamp: Date;
  leadId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const WhatsAppSchema: Schema<IWhatsApp> = new Schema(
  {
    fromNumber: { type: String, required: true },
    toNumber: { type: String, required: true },
    message: { type: String, required: true },
    direction: { type: String, enum: ["incoming", "outgoing"], required: true },
    templateId: { type: String, default: "" },
    timestamp: { type: Date, default: Date.now },
    leadId: { type: Schema.Types.ObjectId, ref: "Lead", required: true, index: true },
  },
  { timestamps: true }
);

export const WhatsApp: Model<IWhatsApp> =
  mongoose.models.WhatsApp || mongoose.model<IWhatsApp>("WhatsApp", WhatsAppSchema);
