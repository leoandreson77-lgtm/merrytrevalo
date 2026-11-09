import mongoose, { Schema, Document, Model } from "mongoose";

export interface ILeadNote {
  note: string;
  author: string;
  createdAt: Date;
}

export interface ILeadHistory {
  action: string;
  performedBy: string;
  details?: string;
  timestamp: Date;
}

export interface ILeadAttachment {
  fileName: string;
  fileUrl: string;
  uploadedAt: Date;
}

export interface ILead extends Document {
  name: string;
  phone: string;
  email: string;
  origin?: string;
  destination?: string;
  departureDate?: Date;
  returnDate?: Date;
  passengers?: number;
  cabin?: string;
  budget?: number;
  source: "Website" | "Landing Page" | "Flight Search" | "Contact Forms" | "Call Tracking" | "WhatsApp" | "API" | "Manual Entry";
  landingPage?: string;
  campaign?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  referrer?: string;
  device?: string;
  browser?: string;
  country?: string;
  notes: ILeadNote[];
  tags: string[];
  priority: "Low" | "Medium" | "High" | "Urgent";
  assignedAgent?: mongoose.Types.ObjectId;
  assignedVendor?: mongoose.Types.ObjectId;
  status: "New" | "Assigned" | "Contacted" | "Follow Up" | "Quote Sent" | "Negotiation" | "Payment Pending" | "Booked" | "Cancelled" | "Lost";
  history: ILeadHistory[];
  followUpReminder?: Date;
  attachments: ILeadAttachment[];
  createdAt: Date;
  updatedAt: Date;
}

const LeadSchema: Schema<ILead> = new Schema(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true, index: true },
    email: { type: String, required: true, index: true },
    origin: { type: String, default: "" },
    destination: { type: String, default: "" },
    departureDate: { type: Date },
    returnDate: { type: Date },
    passengers: { type: Number, default: 1 },
    cabin: { type: String, default: "Economy" },
    budget: { type: Number },
    source: {
      type: String,
      enum: [
        "Website",
        "Landing Page",
        "Flight Search",
        "Contact Forms",
        "Call Tracking",
        "WhatsApp",
        "API",
        "Manual Entry",
      ],
      required: true,
      index: true,
    },
    landingPage: { type: String, default: "" },
    campaign: { type: String, default: "" },
    utmSource: { type: String, default: "" },
    utmMedium: { type: String, default: "" },
    utmCampaign: { type: String, default: "" },
    referrer: { type: String, default: "" },
    device: { type: String, default: "" },
    browser: { type: String, default: "" },
    country: { type: String, default: "" },
    notes: [
      {
        note: { type: String, required: true },
        author: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    tags: [{ type: String }],
    priority: {
      type: String,
      enum: ["Low", "Medium", "High", "Urgent"],
      default: "Medium",
    },
    assignedAgent: { type: Schema.Types.ObjectId, ref: "User", default: null },
    assignedVendor: {
      type: Schema.Types.ObjectId,
      ref: "Vendor",
      default: null,
    },
    status: {
      type: String,
      enum: [
        "New",
        "Assigned",
        "Contacted",
        "Follow Up",
        "Quote Sent",
        "Negotiation",
        "Payment Pending",
        "Booked",
        "Cancelled",
        "Lost",
      ],
      default: "New",
      index: true,
    },
    history: [
      {
        action: { type: String, required: true },
        performedBy: { type: String, required: true },
        details: { type: String },
        timestamp: { type: Date, default: Date.now },
      },
    ],
    followUpReminder: { type: Date },
    attachments: [
      {
        fileName: { type: String, required: true },
        fileUrl: { type: String, required: true },
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

// Indexes for CRM search optimizations
LeadSchema.index({ createdAt: -1 });
LeadSchema.index({ assignedAgent: 1, status: 1 });
LeadSchema.index({ assignedVendor: 1, status: 1 });

export const Lead: Model<ILead> =
  mongoose.models.Lead || mongoose.model<ILead>("Lead", LeadSchema);
