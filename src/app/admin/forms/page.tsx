"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  FileText,
  Plus,
  RefreshCw,
  Eye,
  Trash2,
  Settings,
  PlusCircle,
  X,
  EyeIcon,
  CheckSquare,
  Heading,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

interface FormField {
  id: string;
  type: "text" | "phone" | "email" | "dropdown" | "textarea" | "checkbox";
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
}

interface FormItem {
  _id: string;
  title: string;
  description?: string;
  fields: FormField[];
  submitButtonText: string;
  redirectUrl?: string;
  createdAt: string;
}

export default function AdminFormsPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [createOpen, setCreateOpen] = useState(false);
  const [fields, setFields] = useState<FormField[]>([]);
  const [previewForm, setPreviewForm] = useState<FormItem | null>(null);

  // Field designer state
  const [fieldType, setFieldType] = useState<any>("text");
  const [fieldLabel, setFieldLabel] = useState("");
  const [fieldPlaceholder, setFieldPlaceholder] = useState("");
  const [fieldRequired, setFieldRequired] = useState(true);
  const [fieldOptionsText, setFieldOptionsText] = useState("");

  // Fetch all forms
  const { data: forms, isLoading, refetch } = useQuery<FormItem[]>({
    queryKey: ["forms"],
    queryFn: async () => {
      const res = await fetch("/api/admin/forms");
      if (!res.ok) throw new Error("Failed to load forms");
      return res.json();
    },
  });

  // Create Form Mutation
  const createFormMutation = useMutation({
    mutationFn: async (newForm: any) => {
      const res = await fetch("/api/admin/forms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newForm),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to save form structure");
      }
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Form Saved", description: "Form layout configured successfully." });
      setCreateOpen(false);
      setFields([]);
      queryClient.invalidateQueries({ queryKey: ["forms"] });
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const handleAddField = () => {
    if (!fieldLabel) return;
    const cleanId = fieldLabel.toLowerCase().trim().replace(/[^a-z0-9]/g, "_") + `_${Date.now()}`;
    const options = fieldOptionsText
      ? fieldOptionsText.split(",").map((s) => s.trim())
      : undefined;

    setFields((prev) => [
      ...prev,
      {
        id: cleanId,
        type: fieldType,
        label: fieldLabel,
        placeholder: fieldPlaceholder,
        required: fieldRequired,
        options,
      },
    ]);

    setFieldLabel("");
    setFieldPlaceholder("");
    setFieldOptionsText("");
    toast({ title: "Field Added", description: `Field ${fieldLabel} added to layout.` });
  };

  const handleRemoveField = (id: string) => {
    setFields((prev) => prev.filter((f) => f.id !== id));
  };

  const handleCreateForm = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (fields.length === 0) {
      toast({ title: "No fields", description: "Please add at least one field to your form.", variant: "destructive" });
      return;
    }
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    createFormMutation.mutate({
      title: data.title,
      description: data.description,
      submitButtonText: data.submitButtonText || "Submit",
      redirectUrl: data.redirectUrl || "",
      fields,
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900 border border-slate-800 p-6 rounded-3xl relative overflow-hidden">
        <div>
          <h1 className="text-2xl font-extrabold text-white mb-1 flex items-center gap-2">
            <FileText className="w-6 h-6 text-primary" />
            CRM Form Builder
          </h1>
          <p className="text-slate-400 text-sm">Design drag-and-drop form structures, dynamic checkouts, and custom collection templates.</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => refetch()} variant="outline" className="border-slate-800 text-slate-300">
            <RefreshCw className="w-4 h-4 mr-2" /> Refresh
          </Button>

          {/* Form Designer Dialog */}
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" /> Design Form
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-950 text-white border-slate-800 max-w-xl max-h-[85vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Form Builder console</DialogTitle>
                <DialogDescription className="text-slate-400">
                  Build custom fields and configure auto lead matching fields.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateForm} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1 col-span-2">
                    <Label>Form Title *</Label>
                    <Input required name="title" placeholder="Contact Support Form" className="bg-slate-900 border-slate-800" />
                  </div>
                  <div className="space-y-1 col-span-2">
                    <Label>Description</Label>
                    <Input name="description" placeholder="Fill in inputs below..." className="bg-slate-900 border-slate-800" />
                  </div>
                  <div className="space-y-1">
                    <Label>Submit Label</Label>
                    <Input name="submitButtonText" defaultValue="Submit Request" className="bg-slate-900 border-slate-800" />
                  </div>
                  <div className="space-y-1">
                    <Label>Redirect Success URL</Label>
                    <Input name="redirectUrl" placeholder="/booking-success" className="bg-slate-900 border-slate-800" />
                  </div>
                </div>

                {/* Field Designer panel */}
                <div className="border border-slate-850 p-4 rounded-2xl bg-slate-900/50 space-y-3">
                  <h4 className="font-extrabold text-xs text-primary uppercase tracking-wider">Field layout designer</h4>
                  <div className="grid grid-cols-2 gap-3 items-end">
                    <div className="space-y-1 col-span-2 sm:col-span-1">
                      <Label className="text-xs text-slate-400">Field Label *</Label>
                      <Input
                        value={fieldLabel}
                        onChange={(e: any) => setFieldLabel(e.target.value)}
                        placeholder="e.g. Departure Date"
                        className="bg-slate-950 border-slate-850 h-9 text-xs"
                      />
                    </div>
                    <div className="space-y-1 col-span-2 sm:col-span-1">
                      <Label className="text-xs text-slate-400">Input Type</Label>
                      <Select value={fieldType} onValueChange={setFieldType}>
                        <SelectTrigger className="bg-slate-950 border-slate-850 h-9 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-950 text-white border-slate-850">
                          {["text", "phone", "email", "dropdown", "textarea", "date"].map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1 col-span-2 sm:col-span-1">
                      <Label className="text-xs text-slate-400">Placeholder Hint</Label>
                      <Input
                        value={fieldPlaceholder}
                        onChange={(e: any) => setFieldPlaceholder(e.target.value)}
                        placeholder="e.g. Select date"
                        className="bg-slate-950 border-slate-850 h-9 text-xs"
                      />
                    </div>
                    <div className="space-y-1 col-span-2 sm:col-span-1">
                      <Label className="text-xs text-slate-400">Dropdown options (Comma separated)</Label>
                      <Input
                        disabled={fieldType !== "dropdown"}
                        value={fieldOptionsText}
                        onChange={(e: any) => setFieldOptionsText(e.target.value)}
                        placeholder="e.g. Economy, Business, First"
                        className="bg-slate-950 border-slate-850 h-9 text-xs"
                      />
                    </div>
                    <div className="col-span-2 flex justify-between items-center pt-2">
                      <div className="flex items-center gap-1.5 text-xs text-slate-300">
                        <input
                          type="checkbox"
                          checked={fieldRequired}
                          onChange={(e) => setFieldRequired(e.target.checked)}
                          className="rounded bg-slate-950 border-slate-800"
                        />
                        <span>Required Input Field</span>
                      </div>
                      <Button type="button" onClick={handleAddField} size="sm" variant="outline" className="border-slate-800">
                        <PlusCircle className="w-3.5 h-3.5 mr-1" /> Insert Field
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Fields Summary */}
                {fields.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-slate-400 text-xs">Form Layout Preview</Label>
                    <div className="border border-slate-850 p-3 rounded-xl divide-y divide-slate-850 bg-slate-950/30">
                      {fields.map((f, i) => (
                        <div key={f.id} className="py-2.5 flex justify-between items-center text-xs">
                          <div>
                            <span className="font-extrabold text-slate-200">{f.label}</span>
                            <span className="text-[10px] text-slate-500 ml-2 font-mono">({f.type}) {f.required && "*"}</span>
                          </div>
                          <Button size="icon" variant="ghost" onClick={() => handleRemoveField(f.id)} className="h-6 w-6 text-red-400 hover:text-red-300">
                            <X className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <DialogFooter className="pt-2">
                  <Button type="submit" className="w-full">Save and Deploy Form</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Forms Table */}
      <div className="border border-slate-850 bg-slate-900/10 rounded-2xl overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-900/60">
            <TableRow className="border-slate-850 hover:bg-transparent">
              <TableHead className="text-slate-400 font-bold text-xs uppercase">Form Name</TableHead>
              <TableHead className="text-slate-400 font-bold text-xs uppercase">Fields Count</TableHead>
              <TableHead className="text-slate-400 font-bold text-xs uppercase">Submit label</TableHead>
              <TableHead className="text-slate-400 font-bold text-xs uppercase">Redirect path</TableHead>
              <TableHead className="text-slate-400 font-bold text-xs uppercase">Integration ID</TableHead>
              <TableHead className="w-24"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <TableRow key={i} className="border-slate-850/50">
                  <TableCell>
                    <Skeleton className="h-4 w-32 bg-slate-800 mb-1" />
                    <Skeleton className="h-3 w-40 bg-slate-800" />
                  </TableCell>
                  <TableCell><Skeleton className="h-4 w-12 bg-slate-800" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20 bg-slate-800" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-28 bg-slate-800" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-32 bg-slate-800" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-8 bg-slate-800" /></TableCell>
                </TableRow>
              ))
            ) : forms?.map((f) => (
              <TableRow key={f._id} className="border-slate-850/50 hover:bg-slate-900/30">
                <TableCell>
                  <div className="font-bold text-slate-100">{f.title}</div>
                  <div className="text-xs text-slate-500 max-w-sm truncate">{f.description || "No description"}</div>
                </TableCell>
                <TableCell className="font-semibold text-slate-300">
                  {f.fields.length} inputs
                </TableCell>
                <TableCell className="font-semibold text-slate-400">
                  {f.submitButtonText}
                </TableCell>
                <TableCell className="font-mono text-xs text-slate-500">
                  {f.redirectUrl || "None"}
                </TableCell>
                <TableCell>
                  <code className="text-xs font-mono bg-slate-950 border border-slate-850 px-2 py-0.5 rounded select-all text-primary">
                    {f._id}
                  </code>
                </TableCell>
                <TableCell>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setPreviewForm(f)}
                    className="border-slate-800 hover:bg-slate-800 text-xs"
                  >
                    <EyeIcon className="w-3.5 h-3.5 mr-1" /> Preview
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Form Preview Dialog */}
      <Dialog open={previewForm !== null} onOpenChange={() => setPreviewForm(null)}>
        <DialogContent className="bg-slate-950 text-white border-slate-800 max-w-md">
          {previewForm && (
            <div className="space-y-6">
              <DialogHeader>
                <DialogTitle>{previewForm.title}</DialogTitle>
                <DialogDescription className="text-slate-400">
                  {previewForm.description || "Form input preview"}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                {previewForm.fields.map((field) => (
                  <div key={field.id} className="space-y-1 text-left">
                    <Label className="text-xs text-slate-400 font-bold">
                      {field.label} {field.required && "*"}
                    </Label>
                    <Input disabled placeholder={field.placeholder || "Placeholder text"} className="bg-slate-900 border-slate-850 h-10 text-xs" />
                  </div>
                ))}
                <Button disabled className="w-full h-11 font-bold mt-2">
                  {previewForm.submitButtonText}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
