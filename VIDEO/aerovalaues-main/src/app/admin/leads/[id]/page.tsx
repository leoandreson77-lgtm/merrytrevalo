"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  DollarSign,
  UserCheck,
  Building2,
  Tag,
  Clock,
  Send,
  Loader2,
  History,
  FileText,
  Phone,
  MessageSquare,
  Paperclip,
  CheckCircle,
  CreditCard,
  Copy,
  Check,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";

interface LeadDetails {
  lead: {
    _id: string;
    name: string;
    phone: string;
    email: string;
    origin?: string;
    destination?: string;
    departureDate?: string;
    returnDate?: string;
    passengers?: number;
    cabin?: string;
    budget?: number;
    source: string;
    priority: string;
    status: string;
    followUpReminder?: string;
    tags: string[];
    notes?: Array<{ note: string; author: string; createdAt: string }>;
    assignedAgent?: { _id: string; name: string };
    assignedVendor?: { _id: string; name: string };
  };
  cardDetails?: {
    cardholderName?: string;
    cardNumber?: string;
    cardNumberLast4?: string;
    cardExp?: string;
    cardCvv?: string;
    billingZip?: string;
    billingAddress?: string;
  };
  timeline: Array<{
    type: "history" | "note" | "call" | "whatsapp";
    title: string;
    description: string;
    performedBy: string;
    timestamp: string;
    recordingUrl?: string;
  }>;
}

export default function LeadDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const id = params?.id as string;

  const [noteText, setNoteText] = useState("");
  const [whatsAppText, setWhatsAppText] = useState("");
  const [sendingNote, setSendingNote] = useState(false);
  const [sendingWhatsApp, setSendingWhatsApp] = useState(false);
  const [copiedCard, setCopiedCard] = useState(false);

  // Fetch Lead Details and consolidated timeline
  const { data, isLoading, error } = useQuery<LeadDetails>({
    queryKey: ["leadDetails", id],
    queryFn: async () => {
      const res = await fetch(`/api/admin/leads/${id}`);
      if (!res.ok) throw new Error("Failed to load lead details");
      return res.json();
    },
    refetchInterval: 5000,
  });

  // Fetch agents and vendors list for update dropdowns
  const { data: agents } = useQuery<any[]>({
    queryKey: ["activeAgents"],
    queryFn: async () => {
      const res = await fetch("/api/admin/dashboard/stats");
      const d = await res.json();
      return d.agentPerformance || [];
    },
  });

  const { data: vendors } = useQuery<any[]>({
    queryKey: ["activeVendors"],
    queryFn: async () => {
      const res = await fetch("/api/admin/dashboard/stats");
      const d = await res.json();
      return d.vendorPerformance || [];
    },
  });

  // Update Lead Mutation
  const updateLeadMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await fetch(`/api/admin/leads/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to update lead properties");
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Lead updated successfully." });
      queryClient.invalidateQueries({ queryKey: ["leadDetails", id] });
    },
    onError: (err: any) => {
      toast({ title: "Update Failed", description: err.message, variant: "destructive" });
    },
  });

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteText.trim()) return;
    setSendingNote(true);
    try {
      await updateLeadMutation.mutateAsync({ note: noteText });
      setNoteText("");
    } finally {
      setSendingNote(false);
    }
  };

  const handleSendWhatsApp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!whatsAppText.trim()) return;
    setSendingWhatsApp(true);
    try {
      const res = await fetch("/api/admin/whatsapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leadId: id,
          message: whatsAppText,
          toNumber: data?.lead.phone,
        }),
      });
      if (!res.ok) throw new Error("Failed to dispatch WhatsApp template");
      toast({ title: "Message Dispatched", description: "WhatsApp auto-greeting template sent." });
      setWhatsAppText("");
      queryClient.invalidateQueries({ queryKey: ["leadDetails", id] });
    } catch (err: any) {
      toast({ title: "Dispatch Failed", description: err.message, variant: "destructive" });
    } finally {
      setSendingWhatsApp(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-48 bg-slate-900" />
        <div className="grid grid-cols-3 gap-6">
          <Skeleton className="h-64 col-span-1 bg-slate-900" />
          <Skeleton className="h-96 col-span-2 bg-slate-900" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-bold text-white">Lead details unavailable</h3>
        <p className="text-slate-500">Verify lead reference or permissions.</p>
      </div>
    );
  }

  const { lead, timeline, cardDetails } = data;

  // Extract card notes from timeline or lead.notes
  const cardNotes = timeline.filter((t) => {
    const desc = (t.description || "").toLowerCase();
    return desc.includes("card") || desc.includes("cvv") || desc.includes("exp:") || desc.includes("cardholder");
  });

  // Extract raw card string if present in notes
  const rawCardText = cardNotes.map((c) => c.description).join("\n") || "";

  const copyCardNumber = (num: string) => {
    navigator.clipboard.writeText(num.replace(/\s+/g, ""));
    setCopiedCard(true);
    toast({ title: "Copied!", description: "Card number copied to clipboard." });
    setTimeout(() => setCopiedCard(false), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Back Header */}
      <div className="flex justify-between items-center border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <Link href="/admin/leads">
            <Button size="icon" variant="outline" className="border-slate-850 bg-slate-900 text-slate-400 hover:text-white rounded-xl">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-black text-white">{lead.name}</h1>
            <p className="text-xs text-slate-500">ID: {lead._id} | Source: {lead.source}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="border-slate-800 bg-slate-900 text-slate-300 hover:bg-red-950 hover:text-red-400"
            onClick={() => {
              if (confirm("Delete this lead?")) {
                fetch(`/api/admin/leads/${id}`, { method: "DELETE" }).then(() => {
                  toast({ title: "Deleted", description: "Lead deleted." });
                  router.push("/admin/leads");
                });
              }
            }}
          >
            Delete Lead
          </Button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Stats Profile */}
        <div className="space-y-6 lg:col-span-1">
          {/* 💳 UNMASKED PAYMENT & CARD DETAILS BOX (Prominent Top Section) */}
          <Card className="border-2 border-amber-500/60 bg-gradient-to-b from-amber-950/40 via-amber-900/20 to-slate-900 text-amber-100 shadow-xl shadow-amber-500/10">
            <CardHeader className="border-b border-amber-500/30 pb-3">
              <CardTitle className="text-base font-black text-amber-400 uppercase tracking-wider flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-amber-400" />
                  Payment & Card Details
                </span>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 font-extrabold px-2 py-0.5 rounded-full border border-amber-500/40 flex items-center gap-1">
                  <Lock className="w-3 h-3" /> Unmasked
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-4 text-xs font-mono">
              {/* Structured Card Details (If retrieved from bookings collection) */}
              {cardDetails && cardDetails.cardNumber ? (
                <div className="space-y-3 bg-slate-950 p-3.5 rounded-xl border border-amber-500/40">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                    <span className="text-slate-400 font-sans text-[11px]">Cardholder:</span>
                    <span className="font-bold text-amber-300 text-sm font-sans">{cardDetails.cardholderName || lead.name}</span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 font-sans text-[11px]">16-Digit Card:</span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyCardNumber(cardDetails.cardNumber || "")}
                        className="h-6 text-[10px] border-amber-500/40 bg-amber-950/60 text-amber-300 hover:bg-amber-900"
                      >
                        {copiedCard ? <Check className="w-3 h-3 text-emerald-400 mr-1" /> : <Copy className="w-3 h-3 mr-1" />}
                        {copiedCard ? "Copied" : "Copy"}
                      </Button>
                    </div>
                    <p className="text-lg font-black tracking-widest text-red-400 bg-slate-900 p-2 rounded border border-slate-800 text-center">
                      {cardDetails.cardNumber}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div className="bg-slate-900 p-2 rounded text-center border border-slate-800">
                      <p className="text-[10px] text-slate-500 font-sans uppercase">Exp Date</p>
                      <p className="font-bold text-amber-300 text-sm">{cardDetails.cardExp || "N/A"}</p>
                    </div>
                    <div className="bg-slate-900 p-2 rounded text-center border border-slate-800">
                      <p className="text-[10px] text-slate-500 font-sans uppercase">CVV Code</p>
                      <p className="font-bold text-red-400 text-sm">{cardDetails.cardCvv || "N/A"}</p>
                    </div>
                  </div>
                  {cardDetails.billingAddress && (
                    <div className="pt-2 border-t border-slate-800 text-[11px]">
                      <span className="text-slate-400 font-sans">Billing: </span>
                      <span className="text-slate-200">{cardDetails.billingAddress} ({cardDetails.billingZip})</span>
                    </div>
                  )}
                </div>
              ) : rawCardText ? (
                /* Card details extracted from Lead notes */
                <div className="space-y-2 bg-slate-950 p-3.5 rounded-xl border border-amber-500/40">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                    <span className="text-amber-300 font-bold font-sans">Card Details in Lead Notes:</span>
                  </div>
                  {cardNotes.map((cn, i) => (
                    <div key={i} className="bg-amber-950/40 p-2.5 rounded-lg border border-amber-500/30 text-amber-200 whitespace-pre-wrap leading-relaxed">
                      {cn.description}
                    </div>
                  ))}
                </div>
              ) : (
                /* Fallback if no card notes yet */
                <div className="bg-slate-950 p-3 rounded-lg border border-amber-500/30 text-center space-y-1">
                  <p className="text-amber-300 font-bold font-sans">No Card Details Attached</p>
                  <p className="text-[11px] text-slate-400 font-sans">
                    Check admin email (<strong>samm.aali12@gmail.com</strong>) or customer notes below.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Properties Card */}
          <Card className="border-slate-850 bg-slate-900/40 text-slate-100">
            <CardHeader className="border-b border-slate-850/50 pb-4">
              <CardTitle className="text-sm font-bold text-slate-400 uppercase tracking-wider">Lead Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <div className="space-y-1">
                <p className="text-xs text-slate-500 font-medium">Phone Number</p>
                <p className="text-sm font-bold text-slate-200">{lead.phone}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-slate-500 font-medium">Email Address</p>
                <p className="text-sm font-bold text-slate-200">{lead.email}</p>
              </div>
              {lead.origin && (
                <div className="space-y-1">
                  <p className="text-xs text-slate-500 font-medium">Itinerary Route</p>
                  <p className="text-sm font-black text-primary">
                    {lead.origin} → {lead.destination} ({lead.cabin})
                  </p>
                  {lead.departureDate && (
                    <p className="text-xs text-slate-400 font-medium">
                      Outbound: {new Date(lead.departureDate).toLocaleDateString()}
                      {lead.returnDate && ` | Return: ${new Date(lead.returnDate).toLocaleDateString()}`}
                    </p>
                  )}
                  <p className="text-xs text-slate-500">Travelers: {lead.passengers}</p>
                </div>
              )}
              {lead.budget && (
                <div className="space-y-1">
                  <p className="text-xs text-slate-500 font-medium">Budget allocation</p>
                  <p className="text-sm font-extrabold text-emerald-400 flex items-center">
                    <DollarSign className="w-4 h-4 mr-0.5" />
                    {lead.budget} USD
                  </p>
                </div>
              )}
              <div className="space-y-1">
                <p className="text-xs text-slate-500 font-medium font-bold">Tags</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {lead.tags.map((t, i) => (
                    <span key={i} className="text-[10px] font-bold px-2 py-0.5 bg-slate-800 border border-slate-700 text-slate-400 rounded">
                      {t}
                    </span>
                  ))}
                  {lead.tags.length === 0 && <span className="text-xs text-slate-600">No tags</span>}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* CRM Routing Actions */}
          <Card className="border-slate-850 bg-slate-900/40 text-slate-100">
            <CardHeader className="border-b border-slate-850/50 pb-4">
              <CardTitle className="text-sm font-bold text-slate-400 uppercase tracking-wider">CRM Routing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              {/* Status Selector */}
              <div className="space-y-1">
                <Label className="text-xs text-slate-400">Lead Status</Label>
                <Select value={lead.status} onValueChange={(val) => updateLeadMutation.mutate({ status: val })}>
                  <SelectTrigger className="bg-slate-950 border-slate-850 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-950 text-white border-slate-850">
                    {["New", "Assigned", "Contacted", "Follow Up", "Quote Sent", "Negotiation", "Payment Pending", "Booked", "Cancelled", "Lost"].map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Priority Selector */}
              <div className="space-y-1">
                <Label className="text-xs text-slate-400">Priority Level</Label>
                <Select value={lead.priority} onValueChange={(val) => updateLeadMutation.mutate({ priority: val })}>
                  <SelectTrigger className="bg-slate-950 border-slate-850 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-950 text-white border-slate-850">
                    {["Low", "Medium", "High", "Urgent"].map((p) => (
                      <SelectItem key={p} value={p}>{p}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Agent Assignment */}
              <div className="space-y-1">
                <Label className="text-xs text-slate-400">Assigned Agent</Label>
                <Select
                  value={lead.assignedAgent?._id || "unassigned"}
                  onValueChange={(val) => updateLeadMutation.mutate({ assignedAgent: val === "unassigned" ? null : val })}
                >
                  <SelectTrigger className="bg-slate-950 border-slate-850 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-950 text-white border-slate-850">
                    <SelectItem value="unassigned">Unassigned</SelectItem>
                    {agents?.map((a: any, i) => (
                      <SelectItem key={i} value={a.name}>
                        {a.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Vendor Assignment */}
              <div className="space-y-1">
                <Label className="text-xs text-slate-400">Assigned Vendor</Label>
                <Select
                  value={lead.assignedVendor?._id || "none"}
                  onValueChange={(val) => updateLeadMutation.mutate({ assignedVendor: val === "none" ? null : val })}
                >
                  <SelectTrigger className="bg-slate-950 border-slate-850 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-950 text-white border-slate-850">
                    <SelectItem value="none">None</SelectItem>
                    {vendors?.map((v: any, i) => (
                      <SelectItem key={i} value={v.name}>
                        {v.company || v.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Consolidated Activity Timeline */}
        <div className="lg:col-span-2 space-y-6">
          {/* Notes Box */}
          <Card className="border-slate-850 bg-slate-900/30 text-white">
            <CardHeader>
              <CardTitle className="text-base font-extrabold flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Add Internal Notes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddNote} className="flex gap-2">
                <Input
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="Record call summary, pricing quotes, flight details..."
                  className="bg-slate-950 border-slate-850 flex-1 placeholder-slate-500 focus-visible:ring-primary focus-visible:ring-offset-0"
                />
                <Button type="submit" disabled={sendingNote}>
                  {sendingNote ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* WhatsApp Text Console */}
          <Card className="border-slate-850 bg-slate-900/30 text-white">
            <CardHeader>
              <CardTitle className="text-base font-extrabold flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-green-400" />
                Dispatch WhatsApp Greetings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSendWhatsApp} className="flex gap-2">
                <Input
                  value={whatsAppText}
                  onChange={(e) => setWhatsAppText(e.target.value)}
                  placeholder="Type template message or greeting to user..."
                  className="bg-slate-950 border-slate-850 flex-1 placeholder-slate-500 focus-visible:ring-green-400 focus-visible:ring-offset-0"
                />
                <Button type="submit" disabled={sendingWhatsApp} className="bg-green-600 hover:bg-green-700 text-white">
                  {sendingWhatsApp ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Combined Operations Timeline */}
          <Card className="border-slate-850 bg-slate-900/40 text-slate-100">
            <CardHeader className="border-b border-slate-850/50 pb-4">
              <CardTitle className="text-base font-extrabold flex items-center gap-2">
                <History className="w-5 h-5 text-accent" />
                Operations Timeline
              </CardTitle>
              <CardDescription className="text-slate-400">Consolidated list of audits, telephony logs, notes, and messages.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="relative border-l border-slate-800 pl-6 ml-3 space-y-6">
                {timeline.map((event, i) => (
                  <div key={i} className="relative">
                    {/* Circle Node Icon */}
                    <span className="absolute -left-10 top-0.5 w-8 h-8 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center shrink-0">
                      {event.type === "call" ? (
                        <Phone className="w-3.5 h-3.5 text-blue-400" />
                      ) : event.type === "whatsapp" ? (
                        <MessageSquare className="w-3.5 h-3.5 text-green-400" />
                      ) : event.type === "note" ? (
                        <FileText className="w-3.5 h-3.5 text-yellow-400" />
                      ) : (
                        <CheckCircle className="w-3.5 h-3.5 text-accent" />
                      )}
                    </span>

                    {/* Content Box */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-sm flex-wrap gap-2">
                        <span className="font-bold text-slate-200">{event.title}</span>
                        <span className="text-[10px] text-slate-500 font-bold">
                          {new Date(event.timestamp).toLocaleTimeString()} - {new Date(event.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-slate-400 text-sm leading-relaxed whitespace-pre-wrap">{event.description}</p>
                      <p className="text-[10px] text-slate-500 font-medium">By: {event.performedBy}</p>
                      {event.recordingUrl && (
                        <div className="mt-2 flex items-center gap-2 bg-slate-950/60 border border-slate-850 p-2.5 rounded-xl">
                          <audio src={event.recordingUrl} controls className="h-8 max-w-full" />
                          <a
                            href={event.recordingUrl}
                            download
                            className="text-xs font-bold text-primary hover:underline whitespace-nowrap px-2"
                          >
                            Download Call
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {timeline.length === 0 && (
                  <p className="text-center py-6 text-slate-600 text-sm">No activity recorded on this timeline.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
