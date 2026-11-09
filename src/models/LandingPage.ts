import mongoose, { Schema, Document, Model } from "mongoose";

export interface ILandingPage extends Document {
  slug: string;
  title: string;
  description?: string;
  callPhone?: string;
  seoTitle?: string;
  seoDescription?: string;
  schemaMarkup?: string; // Schema.org custom code
    blocks: Array<{
      type: "hero" | "boarding_pass_hero" | "cta" | "testimonials" | "faq" | "partners" | "videos" | "form" | "reviews" | "features" | "routes_table" | "boarding_pass_routes";
      content: Record<string, any>;
    }>;
    isPublished: boolean;
    createdAt: Date;
    updatedAt: Date;
  }
  
  const LandingPageSchema: Schema<ILandingPage> = new Schema(
    {
      slug: { type: String, required: true, unique: true, index: true },
      title: { type: String, required: true },
      description: { type: String, default: "" },
      callPhone: { type: String, default: "" },
      seoTitle: { type: String, default: "" },
      seoDescription: { type: String, default: "" },
      schemaMarkup: { type: String, default: "" },
      blocks: [
        {
          type: {
            type: String,
            enum: ["hero", "boarding_pass_hero", "cta", "testimonials", "faq", "partners", "videos", "form", "reviews", "features", "routes_table", "boarding_pass_routes"],
            required: true,
          },
          content: { type: Schema.Types.Mixed, default: {} },
        },
      ],
    isPublished: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

if (mongoose.models.LandingPage) {
  delete mongoose.models.LandingPage;
}

export const LandingPage: Model<ILandingPage> =
  mongoose.model<ILandingPage>("LandingPage", LandingPageSchema);
