"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Briefcase,
  DollarSign,
  TrendingUp,
  Percent,
  Activity,
  Key,
  Copy,
  Users,
  ChevronRight,
  TrendingDown,
  LogOut,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { signOut } from "next-auth/react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface VendorData {
  vendor: {
    name: string;
    company: string;
    commissionRate: number;
    apiKey: string;
  };
  stats: {
    totalLeads: number;
    todaysLeads: number;
    totalBookings: number;
    revenue: number;
    commission: number;
    conversionRate: number;
  };
  recentLeads: Array<{
    _id: string;
    name: string;
    email: string;
    phone: string;
    status: string;
    budget: number;
    createdAt: string;
  }>;
  chartData: Array<{
    month: string;
    Leads: number;
    Bookings: number;
  }>;
}

export default function VendorDashboard() {
  const { toast } = useToast();

  const { data, isLoading, error } = useQuery<VendorData>({
    queryKey: ["vendorStats"],
    queryFn: async () => {
      const res = await fetch("/api/vendor/stats");
      if (!res.ok) throw new Error("Failed to load vendor profile details");
      return res.json();
    },
    refetchInterval: 5000,
  });

  const handleCopyKey = () => {
    if (!data?.vendor.apiKey) return;
    navigator.clipboard.writeText(data.vendor.apiKey);
    toast({ title: "API Key Copied", description: "Use this key to insert leads via endpoints." });
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-slate-300 px-4">
        <TrendingDown className="w-16 h-16 text-red-500 mb-4 animate-bounce" />
        <h3 className="text-xl font-bold">Failed to load Vendor Dashboard</h3>
        <p className="text-sm text-slate-500 mb-4">Please make sure your account is mapped to a valid Vendor profile.</p>
        <Button onClick={() => signOut({ callbackUrl: "/login" })} variant="outline" className="border-slate-800">
          <LogOut className="w-4 h-4 mr-2" /> Log Out
        </Button>
      </div>
    );
  }

  const stats = data?.stats;

  const kpiCards = [
    {
      title: "Shared Leads",
      value: stats?.totalLeads ?? 0,
      sub: `+${stats?.todaysLeads ?? 0} today`,
      icon: Users,
      color: "from-blue-600 to-cyan-500",
    },
    {
      title: "Booked Checkouts",
      value: stats?.totalBookings ?? 0,
      sub: `${stats?.conversionRate ?? 0}% conversion`,
      icon: Briefcase,
      color: "from-emerald-600 to-teal-500",
    },
    {
      title: "Ticket Revenue",
      value: `$${((stats?.revenue ?? 0) / 100).toLocaleString()}`,
      sub: "Routed total price",
      icon: DollarSign,
      color: "from-amber-500 to-orange-600",
    },
    {
      title: "My Commission Share",
      value: `$${((stats?.commission ?? 0) / 100).toLocaleString()}`,
      sub: `${data?.vendor.commissionRate ?? 0}% commission rate`,
      icon: Percent,
      color: "from-purple-500 to-pink-600",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Header */}
      <header className="h-16 border-b border-slate-900 bg-slate-900/50 flex items-center justify-between px-8">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center">
            <Briefcase className="w-4 h-4 text-primary" />
          </div>
          <span className="font-extrabold text-sm tracking-tight text-white uppercase">
            {isLoading ? "Loading Partner..." : `${data?.vendor.company || data?.vendor.name} Portal`}
          </span>
        </div>
        <Button onClick={() => signOut({ callbackUrl: "/login" })} variant="ghost" className="text-slate-400 hover:text-red-400">
          <LogOut className="w-4 h-4 mr-2" /> Log Out
        </Button>
      </header>

      {/* Content */}
      <div className="flex-1 p-8 max-w-7xl w-full mx-auto space-y-8">
        {/* Banner */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900 border border-slate-800 p-6 rounded-3xl relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent z-0" />
          <div className="relative z-10">
            <h1 className="text-2xl font-black text-white mb-1">Welcome Partner</h1>
            <p className="text-slate-400 text-sm">Track flight booking referrals, commission shares, and lead statistics in real time.</p>
          </div>
          <div className="relative z-10 flex gap-2 w-full md:w-auto">
            <Button onClick={handleCopyKey} size="sm" variant="outline" className="border-slate-800 bg-slate-950 text-slate-300 w-full md:w-auto">
              <Key className="w-4 h-4 mr-2 text-primary" /> Copy API Key
            </Button>
          </div>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => (
                <Card key={i} className="border-slate-850 bg-slate-900/50">
                  <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                    <Skeleton className="h-4 w-24 bg-slate-800" />
                    <Skeleton className="h-8 w-8 rounded-full bg-slate-800" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-8 w-16 bg-slate-800 mb-2" />
                    <Skeleton className="h-3 w-32 bg-slate-800" />
                  </CardContent>
                </Card>
              ))
            : kpiCards.map((card, i) => (
                <Card key={i} className="border-slate-850 bg-slate-900/40 hover:bg-slate-900/70 transition-all duration-300 group overflow-hidden relative">
                  <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${card.color}`} />
                  <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                    <CardTitle className="text-xs font-bold text-slate-400 uppercase tracking-wider">{card.title}</CardTitle>
                    <card.icon className="w-4 h-4 text-slate-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-black text-white mb-1">{card.value}</div>
                    <p className="text-xs text-slate-500 font-bold">{card.sub}</p>
                  </CardContent>
                </Card>
              ))}
        </div>

        {/* Layout stats list */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Monthly flow */}
          <Card className="lg:col-span-2 border-slate-850 bg-slate-900/30">
            <CardHeader>
              <CardTitle className="text-base font-extrabold text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Referral Flow (Last 6 Months)
              </CardTitle>
            </CardHeader>
            <CardContent className="h-72">
              {isLoading ? (
                <Skeleton className="w-full h-full bg-slate-800" />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data?.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="vendorColorLeads" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="month" stroke="#64748b" fontSize={11} tickLine={false} />
                    <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", color: "#fff" }} />
                    <Area type="monotone" dataKey="Leads" stroke="#3b82f6" strokeWidth={2.5} fillOpacity={1} fill="url(#vendorColorLeads)" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Scoped Leads */}
          <Card className="border-slate-850 bg-slate-900/30 text-white">
            <CardHeader>
              <CardTitle className="text-base font-extrabold flex items-center gap-2">
                <Activity className="w-5 h-5 text-accent" />
                Recent Routed Referrals
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-10 w-full bg-slate-850" />
                  <Skeleton className="h-10 w-full bg-slate-850" />
                </div>
              ) : (
                <div className="space-y-4">
                  {data?.recentLeads.map((l, i) => (
                    <div key={i} className="flex justify-between items-center text-sm border-b border-slate-850/50 pb-3 last:border-0 last:pb-0">
                      <div>
                        <p className="font-bold text-slate-200">{l.name}</p>
                        <p className="text-xs text-slate-500">{new Date(l.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <span
                          className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                            l.status === "Booked"
                              ? "bg-green-500/10 text-green-400"
                              : "bg-slate-800 text-slate-400"
                          }`}
                        >
                          {l.status}
                        </span>
                        {l.budget && <p className="text-xs font-bold text-slate-400 mt-1">${l.budget}</p>}
                      </div>
                    </div>
                  ))}
                  {(!data?.recentLeads || data.recentLeads.length === 0) && (
                    <p className="text-center text-slate-500 text-sm py-6">No routed leads yet.</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* API documentation */}
        <Card className="border-slate-850 bg-slate-900/40 text-slate-100">
          <CardHeader>
            <CardTitle className="text-sm font-bold text-slate-400 uppercase tracking-wider">Leads Referral API Integration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-slate-400 leading-relaxed">
              Integrate your call-tracking, forms, or flight searches to push leads directly to our platform.
            </p>
            <div className="space-y-2">
              <p className="text-xs font-bold text-slate-300">Endpoint URL:</p>
              <code className="block bg-slate-950 border border-slate-850 p-3 rounded-xl text-xs text-primary font-mono select-all">
                POST http://localhost:3000/api/leads
              </code>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-bold text-slate-300 font-mono">Header Authorization:</p>
              <code className="block bg-slate-950 border border-slate-850 p-3 rounded-xl text-xs text-slate-300 font-mono">
                Authorization: Bearer {data?.vendor.apiKey || "vnd_api_key"}
              </code>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
