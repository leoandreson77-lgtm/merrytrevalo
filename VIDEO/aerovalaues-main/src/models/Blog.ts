import mongoose, { Schema, Document, Model } from "mongoose";

export interface IBlog extends Document {
  title: string;
  slug: string;
  content: string; // Markdown or Rich Text HTML
  featuredImage?: string;
  category: string;
  tags: string[];
  seoTitle?: string;
  seoDescription?: string;
  status: "Draft" | "Published" | "Scheduled";
  publishAt: Date;
  author: string;
  createdAt: Date;
  updatedAt: Date;
}

const BlogSchema: Schema<IBlog> = new Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    content: { type: String, required: true },
    featuredImage: { type: String, default: "" },
    category: { type: String, required: true, index: true },
    tags: [{ type: String, index: true }],
    seoTitle: { type: String, default: "" },
    seoDescription: { type: String, default: "" },
    status: {
      type: String,
      enum: ["Draft", "Published", "Scheduled"],
      default: "Draft",
      index: true,
    },
    publishAt: { type: Date, default: Date.now, index: true },
    author: { type: String, required: true },
  },
  { timestamps: true }
);

export const Blog: Model<IBlog> =
  mongoose.models.Blog || mongoose.model<IBlog>("Blog", BlogSchema);
