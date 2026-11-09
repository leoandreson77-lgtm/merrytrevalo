"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  MessageSquare,
  Send,
  Plus,
  Settings,
  RefreshCw,
  Copy,
  UserCheck,
  CheckCircle,
  FileText,
  HelpCircle,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

interface TemplateItem {
  id: string;
  name: string;
  category: string;
  body: string;
}

export default function WhatsAppPage() {
  const { toast } = useToast();

  const [toNumber, setToNumber] = useState("");
  const [selectedTemplateBody, setSelectedTemplateBody] = useState("");
  const [customMsg, setCustomMsg] = useState("");
  const [sending, setSending] = useState(false);

  const [addTemplateOpen, setAddTemplateOpen] = useState(false);

  // Initial templates
  const [templates, setTemplates] = useState<TemplateItem[]>([
    {
      id: "welcome_greeting_01",
      name: "Auto Welcome Greeting",
      category: "Utility",
      body: "Hello! Thanks for contacting JetWithFly Flights. We've received your request and an agent will follow up with custom flight quotes shortly.",
    },
    {
      id: "quote_followup_02",
      name: "Flight Quote Follow Up",
      category: "Marketing",
      body: "Hi! Following up on your flight search from {{Origin}} to {{Destination}}. We have found fares from {{Price}} starting today. Would you like us to hold this seat for you?",
    },
    {
      id: "booking_confirmation_03",
      name: "Booking Confirmed Alert",
      category: "Alerts",
      body: "Great news! Your booking reference {{Ref}} has been confirmed. Your e-tickets are ready for download in your travel portal. Have a safe flight!",
    },
  ]);

  // Initial WhatsApp swap numbers
  const [whatsappNumbers, setWhatsappNumbers] = useState([
    { name: "Global WhatsApp Support", number: "+1 (800) 554-2500", active: true },
    { name: "Europe Operations", number: "+44 20 7946 0958", active: true },
  ]);

  const handleAddTemplate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const category = formData.get("category") as string;
    const body = formData.get("body") as string;

    if (!name || !body) return;

    setTemplates((prev) => [
      ...prev,
      {
        id: `tpl_${Date.now()}`,
        name,
        category,
        body,
      },
    ]);
    toast({ title: "Template Saved", description: `Template ${name} is registered.` });
    setAddTemplateOpen(false);
  };

  const handleSendWhatsApp = async (e: React.FormEvent) => {
    e.preventDefault();
    const message = customMsg || selectedTemplateBody;
    if (!toNumber || !message) {
      toast({ title: "Missing Inputs", description: "Provide recipient number and message content.", variant: "destructive" });
      return;
    }

    setSending(true);
    try {
      // Dispatch mock send to CRM outbox
      const res = await fetch("/api/admin/whatsapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leadId: "64fdcb7a5f102ca14", // Mock fallback lead link
          message,
          toNumber,
        }),
      });

      if (!res.ok) throw new Error("Failed to send WhatsApp message");

      toast({ title: "Message Sent", description: `WhatsApp message pushed to ${toNumber}.` });
      setToNumber("");
      setCustomMsg("");
      setSelectedTemplateBody("");
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  const handleSelectTemplate = (body: string) => {
    setSelectedTemplateBody(body);
    setCustomMsg(body); // Pre-populate edit box
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900 border border-slate-800 p-6 rounded-3xl relative overflow-hidden">
        <div>
          <h1 className="text-2xl font-extrabold text-white mb-1 flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-green-400" />
            WhatsApp CRM Integration
          </h1>
          <p className="text-slate-400 text-sm">Configure automatic message triggers, auto-greeting templates, and click-to-chat links.</p>
        </div>
        <div className="flex gap-2">
          {/* Add Template Dialog */}
          <Dialog open={addTemplateOpen} onOpenChange={setAddTemplateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" /> Register Template
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-950 text-white border-slate-800">
              <DialogHeader>
                <DialogTitle>Register WhatsApp Message Template</DialogTitle>
                <DialogDescription className="text-slate-400">
                  Define static and dynamic fields for campaign outbox logs.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddTemplate} className="space-y-4">
                <div className="space-y-1">
                  <Label>Template Name *</Label>
                  <Input required name="name" placeholder="Summer Promo Greeting" className="bg-slate-900 border-slate-800" />
                </div>
                <div className="space-y-1">
                  <Label>Category</Label>
                  <Input name="category" placeholder="Marketing / Alerts / Utility" className="bg-slate-900 border-slate-800" />
                </div>
                <div className="space-y-1">
                  <Label>Message Body *</Label>
                  <Textarea required name="body" placeholder="Hi! We have found cheap fares for {{Origin}}..." rows={4} className="bg-slate-900 border-slate-800" />
                </div>
                <DialogFooter className="pt-2">
                  <Button type="submit" className="w-full">Save Template</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Outbox form */}
        <Card className="border-slate-850 bg-slate-900/30 text-white lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base font-extrabold flex items-center gap-2">
              <Send className="w-5 h-5 text-primary" />
              WhatsApp Outbox
            </CardTitle>
            <CardDescription className="text-slate-400">Directly dispatch template updates to customers.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSendWhatsApp} className="space-y-4">
              <div className="space-y-1">
                <Label className="text-slate-400 text-xs">Recipient Phone *</Label>
                <Input
                  required
                  value={toNumber}
                  onChange={(e) => setToNumber(e.target.value)}
                  placeholder="e.g. +123456789"
                  className="bg-slate-950 border-slate-850"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-slate-400 text-xs">Pick Message Template</Label>
                <div className="grid grid-cols-1 gap-2 max-h-36 overflow-y-auto">
                  {templates.map((tpl) => (
                    <button
                      key={tpl.id}
                      type="button"
                      onClick={() => handleSelectTemplate(tpl.body)}
                      className="text-left text-xs p-2 rounded-lg border border-slate-850 hover:bg-slate-800/80 truncate font-semibold"
                    >
                      {tpl.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-slate-400 text-xs">Message Text</Label>
                <Textarea
                  value={customMsg}
                  onChange={(e) => setCustomMsg(e.target.value)}
                  placeholder="Type WhatsApp message contents here..."
                  rows={4}
                  className="bg-slate-950 border-slate-850 placeholder-slate-650"
                />
              </div>

              <Button type="submit" disabled={sending} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold h-11">
                {sending ? "Sending..." : "Send Message"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Configurations and swap numbers */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-slate-850 bg-slate-900/30 text-white">
            <CardHeader>
              <CardTitle className="text-base font-extrabold flex items-center gap-2">
                <Users className="w-5 h-5 text-green-400" />
                Provisioned WhatsApp Business Numbers
              </CardTitle>
            </CardHeader>
            <CardContent className="divide-y divide-slate-850">
              {whatsappNumbers.map((num, i) => (
                <div key={i} className="py-3 flex justify-between items-center text-sm">
                  <div>
                    <p className="font-extrabold text-slate-200">{num.name}</p>
                    <p className="text-xs text-slate-500 font-mono">{num.number}</p>
                  </div>
                  <span className="text-xs font-bold bg-green-500/10 text-green-400 border border-green-500/20 px-2.5 py-0.5 rounded-full">
                    Active routing
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-slate-850 bg-slate-900/30 text-white">
            <CardHeader>
              <CardTitle className="text-base font-extrabold flex items-center gap-2">
                <Settings className="w-5 h-5 text-accent" />
                Template Registry Catalog
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {templates.map((tpl) => (
                <div key={tpl.id} className="p-3 bg-slate-950/50 rounded-xl border border-slate-850 text-xs">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="font-extrabold text-slate-200">{tpl.name}</span>
                    <span className="text-[10px] font-bold bg-slate-800 text-slate-400 px-2 py-0.5 rounded uppercase">
                      {tpl.category}
                    </span>
                  </div>
                  <p className="text-slate-400 font-mono bg-slate-900/60 p-2 rounded border border-slate-850/50 leading-relaxed">
                    {tpl.body}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
