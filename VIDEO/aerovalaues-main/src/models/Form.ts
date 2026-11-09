import mongoose, { Schema, Document, Model } from "mongoose";

export interface IFormField {
  id: string;
  type: "text" | "phone" | "email" | "dropdown" | "checkbox" | "radio" | "date" | "file" | "textarea";
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[]; // For dropdown, checkbox, radio options
}

export interface IForm extends Document {
  title: string;
  description?: string;
  fields: IFormField[];
  submitButtonText: string;
  redirectUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const FormSchema: Schema<IForm> = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, default: "" },
    fields: [
      {
        id: { type: String, required: true },
        type: {
          type: String,
          enum: [
            "text",
            "phone",
            "email",
            "dropdown",
            "checkbox",
            "radio",
            "date",
            "file",
            "textarea",
          ],
          required: true,
        },
        label: { type: String, required: true },
        placeholder: { type: String, default: "" },
        required: { type: Boolean, default: false },
        options: [{ type: String }],
      },
    ],
    submitButtonText: { type: String, default: "Submit" },
    redirectUrl: { type: String, default: "" },
  },
  { timestamps: true }
);

export const Form: Model<IForm> =
  mongoose.models.Form || mongoose.model<IForm>("Form", FormSchema);
