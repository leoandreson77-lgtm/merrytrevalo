"use client";

import React, { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  PhoneCall, PhoneIncoming, PhoneMissed, Phone, Plus, RefreshCw,
  Download, Link2, Check, X, Zap, Users, DollarSign, Activity,
  Shield, Clock, Settings, AlertTriangle, Play, Pause, ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";

/* ──────────────────────────────────────────── */
/* Types                                         */
/* ──────────────────────────────────────────── */
interface CallLog {
  _id: string;
  createdAt: string;
  numberDialed: string;
  duration: number;
  status: string;
  recordingUrl?: string;
  visitorIp?: string;
  twilioCallSid?: string;
  clientId?: { name: string; forwardNumber: string };
  leadId?: { name: string; email?: string; phone?: string };
}

interface Client {
  _id: string;
  name: string;
  email?: string;
  forwardNumber: string;
  ratePerCall: number;
  minDuration: number;
  maxCallsPerDay: number;
  allowedHoursStart: string;
  allowedHoursEnd: string;
  isActive: boolean;
  totalCallsToday: number;
  totalCallsAllTime: number;
  totalEarnings: number;
}

interface TFN {
  _id: string;
  number: string;
  friendlyName: string;
  status: "active" | "standby" | "blocked" | "released";
  callsToday: number;
  callsTotal: number;
  isDefault: boolean;
  campaign?: string;
  clientId?: { name: string };
}

/* ──────────────────────────────────────────── */
/* Custom Inline Audio Player Component          */
/* ──────────────────────────────────────────── */
function CustomAudioPlayer({ url }: { url: string }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const togglePlay = () => {
    if (!audioRef.current) {
      audioRef.current = new Audio(url);
      audioRef.current.addEventListener("ended", () => setIsPlaying(false));
    }

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  return (
    <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/50 px-3 py-1.5 rounded-full w-fit shadow-inner">
      <button
        onClick={togglePlay}
        className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
          isPlaying
            ? "bg-green-500 text-white dark:text-slate-950 shadow-lg shadow-green-500/20"
            : "bg-blue-600 text-white hover:bg-blue-500 shadow-md"
        }`}
        title={isPlaying ? "Pause Recording" : "Play Recording"}
      >
        {isPlaying ? (
          <Pause className="w-3.5 h-3.5 fill-current" />
        ) : (
          <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
        )}
      </button>
      <span className="text-[10px] font-black tracking-widest text-slate-500 dark:text-slate-400 uppercase">
        {isPlaying ? "PLAYING" : "LISTEN"}
      </span>
      <div className="w-12 h-2 flex items-center gap-0.5 px-1">
        <span className={`w-1 h-2 bg-blue-500/40 rounded-full ${isPlaying ? "animate-pulse" : ""}`} />
        <span className={`w-1 h-3 bg-blue-500/60 rounded-full ${isPlaying ? "animate-pulse delay-75" : ""}`} />
        <span className={`w-1 h-1.5 bg-blue-500/40 rounded-full ${isPlaying ? "animate-pulse delay-150" : ""}`} />
      </div>
      <a
        href={url}
        download
        className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-700/30 hover:bg-slate-300 dark:hover:bg-slate-700/60 flex items-center justify-center transition-colors border border-slate-300 dark:border-slate-700"
        title="Download MP3"
      >
        <Download className="w-3 h-3 text-slate-600 dark:text-slate-300" />
      </a>
    </div>
  );
}

import dynamic from "next/dynamic";

/* ──────────────────────────────────────────── */
/* Main Component                               */
/* ──────────────────────────────────────────── */
function TelephonyDashboard() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [addClientOpen, setAddClientOpen] = useState(false);
  const [addTFNOpen, setAddTFNOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  /* ── Data Fetching ── */
  const { data: calls = [], isLoading: callsLoading, refetch } = useQuery<CallLog[]>({
    queryKey: ["callsLog"],
    queryFn: async () => {
      const res = await fetch("/api/admin/calls");
      if (!res.ok) throw new Error("Failed to load call logs");
      return res.json();
    },
    refetchInterval: 8000,
  });

  const { data: clients = [], isLoading: clientsLoading } = useQuery<Client[]>({
    queryKey: ["clients"],
    queryFn: async () => {
      const res = await fetch("/api/admin/clients");
      if (!res.ok) throw new Error("Failed to load clients");
      return res.json();
    },
  });

  const { data: tfns = [], isLoading: tfnsLoading } = useQuery<TFN[]>({
    queryKey: ["tfns"],
    queryFn: async () => {
      const res = await fetch("/api/admin/tfn");
      if (!res.ok) throw new Error("Failed to load TFNs");
      return res.json();
    },
  });

  /* ── Mutations ── */
  const addClientMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch("/api/admin/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error((await res.json()).message);
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "✅ Client Added!" });
      setAddClientOpen(false);
      queryClient.invalidateQueries({ queryKey: ["clients"] });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const addTFNMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch("/api/admin/tfn", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error((await res.json()).message);
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "✅ TFN Added!" });
      setAddTFNOpen(false);
      queryClient.invalidateQueries({ queryKey: ["tfns"] });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const switchTFNMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await fetch("/api/admin/tfn", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      if (!res.ok) throw new Error("Failed to switch TFN");
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "🔄 TFN Status Updated!" });
      queryClient.invalidateQueries({ queryKey: ["tfns"] });
    },
  });

  /* ── Stats ── */
  const totalCalls = calls.length;
  const completed = calls.filter((c) => c.status === "Completed").length;
  const missed = calls.filter((c) => c.status === "Missed" || c.status === "Failed").length;
  const totalRevenue = clients.reduce((sum, c) => sum + c.totalEarnings, 0);
  const activeTFN = tfns.find((t) => t.status === "active");

  /* ── Handlers ── */
  const handleAddClient = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    addClientMutation.mutate(Object.fromEntries(fd.entries()));
  };

  const handleAddTFN = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    addTFNMutation.mutate(Object.fromEntries(fd.entries()));
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 md:p-6 bg-transparent rounded-3xl min-h-screen">
      {/* ── Premium Header ── */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-6 md:p-8 shadow-md dark:shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-transparent to-emerald-500/5 pointer-events-none" />
        <div className="absolute -right-20 -top-20 w-60 h-60 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 text-xs font-black uppercase tracking-widest bg-blue-500/10 border border-blue-500/20 px-3.5 py-1.5 rounded-full w-fit mb-3">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping" />
              Telephony Hub Active
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-slate-950 dark:text-white tracking-tight flex items-center gap-3">
              <PhoneCall className="w-8 h-8 text-blue-500" />
              Call Tracking Console
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-2 max-w-xl">
              Allocate marketing phone numbers, route calls directly to destination client desks, and listen to recordings.
            </p>
          </div>

          <div className="flex items-center gap-3 self-stretch md:self-auto">
            <Button
              onClick={() => refetch()}
              variant="outline"
              className="flex-1 md:flex-initial border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900/40 text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80 rounded-2xl h-12 font-bold"
            >
              <RefreshCw className="w-4 h-4 mr-2" /> Sync Logs
            </Button>
            {activeTFN && (
              <div className="hidden lg:flex flex-col justify-end items-end text-right bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 px-4 py-2.5 rounded-2xl">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Active Number</span>
                <span className="text-sm font-black text-slate-950 dark:text-white font-mono">{activeTFN.number}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Redesigned KPI Grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: "Total Calls", value: totalCalls, subtitle: "Total call tracking hits", icon: PhoneCall, color: "from-blue-600 to-indigo-700", shadow: "shadow-blue-500/5 dark:shadow-blue-500/10" },
          { title: "Completed", value: completed, subtitle: "Billable forward answers", icon: PhoneIncoming, color: "from-emerald-500 to-teal-600", shadow: "shadow-emerald-500/5 dark:shadow-emerald-500/10" },
          { title: "Missed / Busy", value: missed, subtitle: "Unanswered connections", icon: PhoneMissed, color: "from-rose-500 to-red-600", shadow: "shadow-rose-500/5 dark:shadow-rose-500/10" },
          { title: "Total Earnings", value: `$${totalRevenue.toFixed(0)}`, subtitle: "$28 rate per valid call", icon: DollarSign, color: "from-amber-500 to-orange-600", shadow: "shadow-amber-500/5 dark:shadow-amber-500/10" },
        ].map((card, i) => (
          <div
            key={i}
            className={`group relative overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-xl ${card.shadow}`}
          >
            {/* Hover color accent */}
            <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${card.color} opacity-80`} />
            
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">{card.title}</p>
                <h3 className="text-3xl font-black text-slate-950 dark:text-white mt-2 font-mono tracking-tight">{card.value}</h3>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">{card.subtitle}</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-950/40 flex items-center justify-center border border-slate-100 dark:border-slate-800/80 group-hover:scale-105 transition-transform">
                <card.icon className="w-5 h-5 text-slate-400 dark:text-slate-400 group-hover:text-blue-500 dark:group-hover:text-white transition-colors" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Main Interface Tab Control ── */}
      <Tabs defaultValue="calls" className="w-full">
        <TabsList className="bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 p-1.5 rounded-2xl mb-6">
          <TabsTrigger value="calls" className="rounded-xl px-6 py-2.5 data-[state=active]:bg-blue-600 data-[state=active]:text-white text-xs font-extrabold flex items-center gap-2 text-slate-600 dark:text-slate-400">
            <Activity className="w-3.5 h-3.5" /> Call Logs
          </TabsTrigger>
          <TabsTrigger value="tfn" className="rounded-xl px-6 py-2.5 data-[state=active]:bg-blue-600 data-[state=active]:text-white text-xs font-extrabold flex items-center gap-2 text-slate-600 dark:text-slate-400">
            <Phone className="w-3.5 h-3.5" /> TFN Pool
          </TabsTrigger>
          <TabsTrigger value="clients" className="rounded-xl px-6 py-2.5 data-[state=active]:bg-blue-600 data-[state=active]:text-white text-xs font-extrabold flex items-center gap-2 text-slate-600 dark:text-slate-400">
            <Users className="w-3.5 h-3.5" /> Clients
          </TabsTrigger>
          <TabsTrigger value="setup" className="rounded-xl px-6 py-2.5 data-[state=active]:bg-blue-600 data-[state=active]:text-white text-xs font-extrabold flex items-center gap-2 text-slate-600 dark:text-slate-400">
            <Settings className="w-3.5 h-3.5" /> Setup Guide
          </TabsTrigger>
        </TabsList>

        {/* ── CALL LOGS TAB ── */}
        <TabsContent value="calls">
          <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/20 rounded-3xl overflow-hidden shadow-sm dark:shadow-none">
            <CardHeader className="border-b border-slate-100 dark:border-slate-800/60 py-5">
              <CardTitle className="text-slate-950 dark:text-white text-lg font-black flex items-center gap-2">
                Live Routing Stream
              </CardTitle>
              <CardDescription className="text-xs text-slate-500 dark:text-slate-400">
                Incoming calls routed to assigned buyers. Real-time updates.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-slate-50 dark:bg-slate-950/40">
                    <TableRow className="border-slate-200 dark:border-slate-800/80 hover:bg-transparent">
                      <TableHead className="text-slate-500 dark:text-slate-400 text-[10px] uppercase font-black tracking-widest py-4 pl-6">Time / Date</TableHead>
                      <TableHead className="text-slate-500 dark:text-slate-400 text-[10px] uppercase font-black tracking-widest py-4">TFN Dialed</TableHead>
                      <TableHead className="text-slate-500 dark:text-slate-400 text-[10px] uppercase font-black tracking-widest py-4">Caller</TableHead>
                      <TableHead className="text-slate-500 dark:text-slate-400 text-[10px] uppercase font-black tracking-widest py-4">Forwarded To</TableHead>
                      <TableHead className="text-slate-500 dark:text-slate-400 text-[10px] uppercase font-black tracking-widest py-4">Duration</TableHead>
                      <TableHead className="text-slate-500 dark:text-slate-400 text-[10px] uppercase font-black tracking-widest py-4">Status</TableHead>
                      <TableHead className="text-slate-500 dark:text-slate-400 text-[10px] uppercase font-black tracking-widest py-4 pr-6">Call Audio Recording</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {callsLoading ? (
                      Array.from({ length: 4 }).map((_, i) => (
                        <TableRow key={i} className="border-slate-200 dark:border-slate-800/50">
                          {Array.from({ length: 7 }).map((_, j) => (
                            <TableCell key={j} className="py-4"><Skeleton className="h-4 w-20 bg-slate-200 dark:bg-slate-800" /></TableCell>
                          ))}
                        </TableRow>
                      ))
                    ) : calls.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-20 text-slate-450 dark:text-slate-500">
                          <PhoneCall className="w-12 h-12 mx-auto mb-4 opacity-20 animate-bounce" />
                          <p className="font-extrabold text-slate-800 dark:text-white text-base">No Call Activity Logged</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                            Setup a tracking number in the TFN Pool tab and configure Twilio webhooks to handle real calls.
                          </p>
                        </TableCell>
                      </TableRow>
                    ) : calls.map((c) => {
                      const displayNum = c.numberDialed.replace(/^\+1/, "+1 ").replace(/(\d{3})(\d{3})(\d{4})$/, "$1 $2 $3");
                      const clientName = c.clientId?.name || "Global Fallback";
                      const clientForward = c.clientId?.forwardNumber || "—";
                      
                      return (
                        <TableRow key={c._id} className="border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-900/20">
                          <TableCell className="py-4 pl-6 text-xs text-slate-500 dark:text-slate-400">
                            <span className="font-bold text-slate-850 dark:text-white">
                              {mounted ? new Date(c.createdAt).toLocaleTimeString() : "—"}
                            </span>
                            <span className="block text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                              {mounted ? new Date(c.createdAt).toLocaleDateString() : "—"}
                            </span>
                          </TableCell>
                          <TableCell className="py-4 text-xs font-mono font-black text-slate-800 dark:text-slate-200">
                            {displayNum}
                          </TableCell>
                          <TableCell className="py-4 text-xs text-slate-650 dark:text-slate-400 font-mono">
                            {c.leadId?.phone ? (
                              <span className="font-black text-slate-800 dark:text-white block">{c.leadId.phone}</span>
                            ) : null}
                            <span className="text-[10px] text-slate-400 dark:text-slate-500 block mt-0.5">
                              {c.leadId?.name || c.visitorIp || "Unknown Caller"}
                            </span>
                          </TableCell>
                          <TableCell className="py-4 text-xs">
                            <span className="font-bold text-slate-700 dark:text-slate-300 block">{clientName}</span>
                            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono mt-0.5">{clientForward}</span>
                          </TableCell>
                          <TableCell className="py-4">
                            <span className="text-xs font-bold text-slate-800 dark:text-white font-mono bg-slate-105 dark:bg-slate-955/60 border border-slate-200 dark:border-slate-800 px-2 py-1 rounded-lg">
                              {c.duration || 0}s
                            </span>
                          </TableCell>
                          <TableCell className="py-4">
                            <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full border ${
                              c.status === "Completed" ? "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20"
                              : c.status === "Missed" || c.status === "Failed" ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
                              : "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20 animate-pulse"
                            }`}>
                              {c.status}
                            </span>
                          </TableCell>
                          <TableCell className="py-4 pr-6">
                            {c.recordingUrl ? (
                              <CustomAudioPlayer url={c.recordingUrl} />
                            ) : (
                              <span className="text-xs text-slate-400 dark:text-slate-600 font-bold uppercase tracking-widest pl-2">NO AUDIO</span>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── TFN POOL TAB ── */}
        <TabsContent value="tfn">
          <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/20 rounded-3xl">
            <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 dark:border-slate-800/60 py-5">
              <div>
                <CardTitle className="text-slate-950 dark:text-white text-lg font-black flex items-center gap-2">
                  Dynamic Number Inventory
                </CardTitle>
                <CardDescription className="text-xs text-slate-500 dark:text-slate-400">
                  Assign routing configurations to incoming US toll-free lines.
                </CardDescription>
              </div>
              <Dialog open={addTFNOpen} onOpenChange={setAddTFNOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold h-10 px-5 shadow-lg shadow-blue-500/20">
                    <Plus className="w-4 h-4 mr-1.5" /> Provision TFN
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-950 dark:text-white max-w-sm rounded-3xl">
                  <DialogHeader>
                    <DialogTitle>Provision Tracking Number</DialogTitle>
                    <DialogDescription className="text-slate-500 dark:text-slate-400">
                      Add a purchased Twilio toll-free number to begin call routing.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleAddTFN} className="space-y-4 mt-2">
                    <div className="space-y-1">
                      <Label className="text-slate-700 dark:text-slate-300">TFN Phone Number *</Label>
                      <Input required name="number" placeholder="+18005550199" className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-950 dark:text-white rounded-xl focus:border-blue-500" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-slate-700 dark:text-slate-300">Friendly Name</Label>
                      <Input name="friendlyName" placeholder="Google Ads Desk #1" className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-950 dark:text-white rounded-xl focus:border-blue-500" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-slate-700 dark:text-slate-300">UTM Campaign</Label>
                      <Input name="campaign" placeholder="US Flights Campaign" className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-950 dark:text-white rounded-xl focus:border-blue-500" />
                    </div>
                    <div className="flex items-center gap-2 pt-2">
                      <input type="checkbox" name="isDefault" id="isDefault" className="accent-blue-500 w-4 h-4" />
                      <Label htmlFor="isDefault" className="text-slate-700 dark:text-slate-300 cursor-pointer">Set as fallback default TFN</Label>
                    </div>
                    <DialogFooter className="pt-2">
                      <Button type="submit" disabled={addTFNMutation.isPending} className="w-full bg-blue-600 hover:bg-blue-500 text-white rounded-xl">
                        {addTFNMutation.isPending ? "Configuring..." : "Add to Active Pool"}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent className="p-6">
              {tfnsLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-20 bg-slate-200 dark:bg-slate-800 rounded-3xl" />)}
                </div>
              ) : tfns.length === 0 ? (
                <div className="text-center py-10 text-slate-550 dark:text-slate-500">
                  <Phone className="w-12 h-12 mx-auto mb-4 opacity-20" />
                  <p className="font-extrabold text-slate-800 dark:text-white text-base">TFN Pool Empty</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Configure your first toll-free lines using the provision button.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {tfns.map((tfn) => {
                    const displayNum = tfn.number.replace(/^\+1/, "+1 ").replace(/(\d{3})(\d{3})(\d{4})$/, "$1 $2 $3");
                    return (
                      <div
                        key={tfn._id}
                        className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 rounded-3xl border transition-all ${
                          tfn.status === "active"
                            ? "border-green-500/30 bg-green-500/5"
                            : tfn.status === "blocked"
                            ? "border-rose-500/30 bg-rose-500/5"
                            : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/30"
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center border-4 ${
                            tfn.status === "active" ? "bg-green-400 border-green-500/20 animate-pulse"
                            : tfn.status === "blocked" ? "bg-rose-400 border-rose-500/20"
                            : "bg-slate-500 border-slate-600"
                          }`} />
                          <div>
                            <p className="font-black text-slate-950 dark:text-white font-mono text-xl">{displayNum}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-bold">
                              {tfn.friendlyName || "Un-named desk"} · {tfn.callsToday} today · {tfn.callsTotal} total
                              {tfn.clientId && ` · Forwarding to: ${(tfn.clientId as any).name}`}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 mt-4 sm:mt-0">
                          <span className={`text-[10px] font-black uppercase px-3 py-1.5 rounded-xl border ${
                            tfn.status === "active" ? "border-green-500/30 text-green-600 dark:text-green-400 bg-green-500/5"
                            : tfn.status === "blocked" ? "border-rose-500/30 text-rose-600 dark:text-rose-400 bg-rose-500/5"
                            : "border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-450 bg-slate-50 dark:bg-slate-950/20"
                          }`}>
                            {tfn.status}
                          </span>
                          
                          {tfn.status !== "active" && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 text-slate-750 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white rounded-xl h-8 text-xs font-bold"
                              onClick={() => switchTFNMutation.mutate({ id: tfn._id, status: "active" })}
                            >
                              <Zap className="w-3.5 h-3.5 mr-1" /> Make Active
                            </Button>
                          )}
                          
                          {tfn.status === "active" && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-rose-300 dark:border-rose-900 bg-slate-50 dark:bg-slate-900/60 text-rose-600 dark:text-rose-400 hover:bg-rose-950/30 rounded-xl h-8 text-xs font-bold"
                              onClick={() => switchTFNMutation.mutate({ id: tfn._id, status: "blocked" })}
                            >
                              <AlertTriangle className="w-3.5 h-3.5 mr-1" /> Flag Blocked
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── CLIENTS TAB ── */}
        <TabsContent value="clients">
          <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/20 rounded-3xl">
            <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 dark:border-slate-800/60 py-5">
              <div>
                <CardTitle className="text-slate-950 dark:text-white text-lg font-black flex items-center gap-2">
                  Pay-Per-Call Buyers
                </CardTitle>
                <CardDescription className="text-xs text-slate-500 dark:text-slate-400">
                  Manage forwarding destinations, dynamic caps, and rates.
                </CardDescription>
              </div>
              <Dialog open={addClientOpen} onOpenChange={setAddClientOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold h-10 px-5 shadow-lg shadow-blue-500/20">
                    <Plus className="w-4 h-4 mr-1.5" /> Register Client
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-950 dark:text-white max-w-md rounded-3xl">
                  <DialogHeader>
                    <DialogTitle>Register Buyer Profile</DialogTitle>
                    <DialogDescription className="text-slate-500 dark:text-slate-400">
                      Setup forwarding destinations and $28 rate structures.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleAddClient} className="space-y-4 mt-2">
                    <div className="space-y-1">
                      <Label className="text-slate-700 dark:text-slate-300">Client Name *</Label>
                      <Input required name="name" placeholder="US Air Travel Agency" className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-950 dark:text-white rounded-xl focus:border-blue-500" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-slate-700 dark:text-slate-300">Email Address</Label>
                        <Input name="email" type="email" placeholder="accounting@travel.com" className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-950 dark:text-white rounded-xl focus:border-blue-500" />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-slate-700 dark:text-slate-300">Forward Number *</Label>
                        <Input required name="forwardNumber" placeholder="+919876543210" className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-950 dark:text-white rounded-xl focus:border-blue-500" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-slate-700 dark:text-slate-300">Payout per Call ($)</Label>
                        <Input name="ratePerCall" type="number" defaultValue="28" className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-950 dark:text-white rounded-xl focus:border-blue-500" />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-slate-700 dark:text-slate-300">Min Call Duration (sec)</Label>
                        <Input name="minDuration" type="number" defaultValue="60" className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-950 dark:text-white rounded-xl focus:border-blue-500" />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <Label className="text-slate-700 dark:text-slate-300 text-xs">Max Calls/Day</Label>
                        <Input name="maxCallsPerDay" type="number" defaultValue="100" className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-950 dark:text-white rounded-xl focus:border-blue-500" />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-slate-700 dark:text-slate-300 text-xs">Active From</Label>
                        <Input name="allowedHoursStart" type="time" defaultValue="08:00" className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-950 dark:text-white rounded-xl focus:border-blue-500" />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-slate-700 dark:text-slate-300 text-xs">Active To</Label>
                        <Input name="allowedHoursEnd" type="time" defaultValue="20:00" className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-950 dark:text-white rounded-xl focus:border-blue-500" />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-slate-700 dark:text-slate-300">Accounting Notes</Label>
                      <Input name="notes" placeholder="e.g., Weekly payments via wire" className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-950 dark:text-white rounded-xl focus:border-blue-500" />
                    </div>
                    <DialogFooter className="pt-2">
                      <Button type="submit" disabled={addClientMutation.isPending} className="w-full bg-blue-600 hover:bg-blue-500 text-white rounded-xl">
                        {addClientMutation.isPending ? "Creating Profile..." : "Confirm Buyer Registration"}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent className="p-6">
              {clientsLoading ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-32 bg-slate-200 dark:bg-slate-800 rounded-3xl" />)}
                </div>
              ) : clients.length === 0 ? (
                <div className="text-center py-10 text-slate-550 dark:text-slate-500">
                  <Users className="w-12 h-12 mx-auto mb-4 opacity-20" />
                  <p className="font-extrabold text-slate-800 dark:text-white text-base">No Registered Buyers</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Add client profiles to set payout rates and forwarding numbers.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {clients.map((client) => {
                    const displayFwd = client.forwardNumber.startsWith("+91")
                      ? client.forwardNumber.replace(/^\+91/, "+91 ").replace(/(\d{5})(\d{5})$/, "$1 $2")
                      : client.forwardNumber.replace(/^\+1/, "+1 ").replace(/(\d{3})(\d{3})(\d{4})$/, "$1 $2 $3");

                    return (
                      <div
                        key={client._id}
                        className="group relative overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 p-6 space-y-4 hover:border-slate-350 dark:hover:border-slate-700 transition-all duration-300 shadow-sm dark:shadow-none"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-black text-slate-950 dark:text-white text-lg group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{client.name}</h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-1 font-bold">Forward: {displayFwd}</p>
                          </div>
                          <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-xl border ${
                            client.isActive ? "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20"
                            : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
                          }`}>
                            {client.isActive ? "Accepting calls" : "Paused"}
                          </span>
                        </div>

                        <div className="grid grid-cols-3 gap-3 bg-slate-50 dark:bg-slate-950/30 p-3 rounded-2xl border border-slate-100 dark:border-slate-800/40">
                          <div className="text-center">
                            <p className="text-amber-500 dark:text-amber-400 font-black text-xl font-mono">${client.ratePerCall}</p>
                            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase mt-0.5">Rate</p>
                          </div>
                          <div className="text-center border-x border-slate-200 dark:border-slate-800/60">
                            <p className="text-blue-600 dark:text-blue-400 font-black text-xl font-mono">{client.totalCallsToday}</p>
                            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase mt-0.5">Calls Today</p>
                          </div>
                          <div className="text-center">
                            <p className="text-green-600 dark:text-green-400 font-black text-xl font-mono">${client.totalEarnings.toFixed(0)}</p>
                            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase mt-0.5">Revenue</p>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-x-4 gap-y-2 text-[10px] text-slate-450 dark:text-slate-500 font-bold border-t border-slate-100 dark:border-slate-850 pt-3">
                          <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400"><Clock className="w-3.5 h-3.5" /> Min Duration: {client.minDuration}s</span>
                          <span>·</span>
                          <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400"><Settings className="w-3.5 h-3.5" /> Cap: {client.maxCallsPerDay}/day</span>
                          <span>·</span>
                          <span className="text-slate-500 dark:text-slate-400">🕐 {client.allowedHoursStart}–{client.allowedHoursEnd}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── SETUP GUIDE TAB ── */}
        <TabsContent value="setup">
          <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/20 rounded-3xl">
            <CardHeader className="border-b border-slate-100 dark:border-slate-800/60 py-5">
              <CardTitle className="text-slate-950 dark:text-white text-lg font-black flex items-center gap-2">
                Webhook Integration Details
              </CardTitle>
              <CardDescription className="text-xs text-slate-500 dark:text-slate-400">
                Setup Twilio callback endpoints to route incoming connections.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-55 dark:bg-slate-955/40 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl">
                  <h4 className="text-xs font-black uppercase text-blue-600 dark:text-blue-400 tracking-wider mb-2">1. Inbound Voice Webhook</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-3">
                    Triggered when your US Toll-Free TFN is dialed. Executes forwarding to client with recording enabled.
                  </p>
                  <code className="text-[11px] text-green-600 dark:text-green-400 font-mono bg-slate-55 dark:bg-slate-950 p-3.5 rounded-2xl block border border-slate-200 dark:border-slate-800/80 break-all select-all">
                    {mounted ? window.location.origin : "https://yourdomain.com"}/api/twilio/inbound
                  </code>
                </div>

                <div className="bg-slate-55 dark:bg-slate-955/40 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl">
                  <h4 className="text-xs font-black uppercase text-blue-600 dark:text-blue-400 tracking-wider mb-2">2. Status / Billing Callback</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-3">
                    Triggered when calls conclude. Records duration and increments client $28 payout models.
                  </p>
                  <code className="text-[11px] text-green-600 dark:text-green-400 font-mono bg-slate-55 dark:bg-slate-955 p-3.5 rounded-2xl block border border-slate-200 dark:border-slate-800/80 break-all select-all">
                    {mounted ? window.location.origin : "https://yourdomain.com"}/api/twilio/status
                  </code>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-950/20 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl space-y-3">
                <h4 className="text-sm font-black text-slate-850 dark:text-white flex items-center gap-2">
                  <Shield className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                  Active Security Checks
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Our system verifies each Twilio request cryptographically using your <code>TWILIO_AUTH_TOKEN</code>.
                  Any spoofed or invalid requests attempting to log fake calls will automatically receive a <code>403 Forbidden</code> response.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

const TelephonyPage = dynamic(() => Promise.resolve(TelephonyDashboard), {
  ssr: false,
});

export default TelephonyPage;
