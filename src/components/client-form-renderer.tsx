"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CheckCircle2 } from "lucide-react";

interface FormField {
  id: string;
  type: "text" | "phone" | "email" | "dropdown" | "checkbox" | "radio" | "date" | "file" | "textarea";
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
}

interface FormSchema {
  _id: string;
  title: string;
  fields: FormField[];
  submitButtonText: string;
  redirectUrl?: string;
}

export default function ClientFormRenderer({ form }: { form: FormSchema }) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const { register, handleSubmit, setValue } = useForm();

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      // Gather device details dynamically to log in CRM Lead
      const visitorDetails = {
        ...data,
        visitorIp: "", // Resolved on server webhook/handler
        browser: navigator.userAgent,
        device: navigator.platform,
        referrer: document.referrer,
        landingPage: window.location.pathname,
      };

      const res = await fetch(`/api/forms/${form._id}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(visitorDetails),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to submit lead");
      }

      const result = await res.json();
      setSuccess(true);
      toast({ title: "Enquiry Registered", description: "Your travel request has been logged." });

      if (result.redirectUrl) {
        setTimeout(() => {
          window.location.href = result.redirectUrl;
        }, 1500);
      }
    } catch (err: any) {
      toast({ title: "Submission Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center py-6 space-y-3 bg-green-500/10 border border-green-500/20 p-6 rounded-2xl">
        <CheckCircle2 className="w-12 h-12 text-green-400 mx-auto animate-bounce" />
        <h4 className="text-lg font-bold text-white">Thank You!</h4>
        <p className="text-sm text-slate-300">Your enquiry has been successfully logged. An expert will follow up shortly.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-left">
      {form.fields.map((field) => (
        <div key={field.id} className="space-y-1.5">
          <Label className="text-sm font-semibold text-slate-200">
            {field.label} {field.required && <span className="text-red-400">*</span>}
          </Label>

          {field.type === "textarea" ? (
            <Textarea
              id={field.id}
              placeholder={field.placeholder}
              required={field.required}
              className="bg-slate-900 border-slate-800 text-white placeholder-slate-500"
              {...register(field.id)}
            />
          ) : field.type === "dropdown" ? (
            <Select onValueChange={(val: string) => setValue(field.id, val)} required={field.required}>
              <SelectTrigger className="bg-slate-900 border-slate-800 text-white">
                <SelectValue placeholder={field.placeholder || "Select option"} />
              </SelectTrigger>
              <SelectContent className="bg-slate-950 text-white border-slate-800">
                {field.options?.map((opt) => (
                  <SelectItem key={opt} value={opt}>
                    {opt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <Input
              id={field.id}
              type={field.type === "phone" ? "tel" : field.type === "email" ? "email" : field.type === "date" ? "date" : "text"}
              placeholder={field.placeholder}
              required={field.required}
              className="bg-slate-900 border-slate-800 text-white placeholder-slate-500"
              {...register(field.id)}
            />
          )}
        </div>
      ))}

      <Button type="submit" disabled={loading} className="w-full font-bold h-11 text-base">
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Submitting...
          </>
        ) : (
          form.submitButtonText || "Submit"
        )}
      </Button>
    </form>
  );
}
