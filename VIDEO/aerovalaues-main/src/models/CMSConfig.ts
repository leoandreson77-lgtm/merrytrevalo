import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICMSConfig extends Document {
  key: string; // e.g. "global_settings"
  value: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const CMSConfigSchema: Schema<ICMSConfig> = new Schema(
  {
    key: { type: String, required: true, unique: true, index: true },
    value: { type: Schema.Types.Mixed, required: true },
  },
  { timestamps: true }
);

export const CMSConfig: Model<ICMSConfig> =
  mongoose.models.CMSConfig || mongoose.model<ICMSConfig>("CMSConfig", CMSConfigSchema);
