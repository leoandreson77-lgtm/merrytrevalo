"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Users,
  PhoneCall,
  CalendarCheck,
  DollarSign,
  Search,
  Percent,
  Activity,
  TrendingUp,
  UserCheck,
  Target,
  ArrowRight,
  TrendingDown,
  Phone,
  Save,
  KeyRound,
  AlertTriangle,
  Database,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface DashboardData {
  dbStatus?: string;
  dbMessage?: string;
  kpis: {
    totalLeads: number;
    todaysLeads: number;
    totalCalls: number;
    todaysCalls: number;
    totalBookings: number;
    todaysBookings: number;
    revenue: number;
    flightSearches: number;
    conversionRate: number;
    activeUsers: number;
  };
  agentPerformance: Array<{
    name: string;
    leads: number;
    booked: number;
    conversion: number;
  }>;
  vendorPerformance: Array<{
    name: string;
    company: string;
    leads: number;
    booked: number;
    revenue: number;
  }>;
  lpPerformance: Array<{
    name: string;
    leads: number;
    booked: number;
  }>;
  campaignStats: {
    googleLeads: number;
    googleBookings: number;
    metaLeads: number;
    metaBookings: number;
  };
  recentActivities: Array<{
    type: string;
    description: string;
    time: string;
    status: string;
  }>;
  chartData: Array<{
    day: string;
    Leads: number;
    Bookings: number;
  }>;
}

export default function AdminDashboard() {
  const queryClient = useQueryClient();
  const { data, isLoading, error } = useQuery<DashboardData>({
    queryKey: ["dashboardStats"],
    queryFn: async () => {
      const res = await fetch("/api/admin/dashboard/stats");
      if (!res.ok) throw new Error("Failed to load dashboard data");
      return res.json();
    },
    refetchInterval: 5000,
  });

  // Settings state
  const [callNumber, setCallNumber] = useState("");
  const [callLabel, setCallLabel] = useState("Call Now");
  const [googleTagId, setGoogleTagId] = useState("");
  const [settingsLoaded, setSettingsLoaded] = useState(false);

  useQuery({
    queryKey: ["globalSettings"],
    queryFn: async () => {
      const res = await fetch("/api/settings");
      const json = await res.json();
      if (!settingsLoaded) {
        setCallNumber(json.callNumber ?? "+18555106415");
        setCallLabel(json.callLabel ?? "Call Now");
        setGoogleTagId(json.googleTagId ?? "AW-18305273332");
        setSettingsLoaded(true);
      }
      return json;
    },
  });

  const saveSettings = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ callNumber, callLabel, googleTagId }),
      });
      if (!res.ok) throw new Error("Failed to save");
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["globalSettings"] }),
  });

  const kpis = data?.kpis;

  const cards = [
    {
      title: "Total Leads",
      value: kpis?.totalLeads ?? 0,
      sub: `+${kpis?.todaysLeads ?? 0} today`,
      icon: Users,
      color: "from-blue-600 to-cyan-500",
    },
    {
      title: "Today's Calls",
      value: kpis?.todaysCalls ?? 0,
      sub: `${kpis?.totalCalls ?? 0} total clicks`,
      icon: PhoneCall,
      color: "from-purple-600 to-pink-500",
    },
    {
      title: "Bookings",
      value: kpis?.totalBookings ?? 0,
      sub: `+${kpis?.todaysBookings ?? 0} today`,
      icon: CalendarCheck,
      color: "from-emerald-600 to-teal-500",
    },
    {
      title: "Revenue",
      value: `$${((kpis?.revenue ?? 0) / 100).toLocaleString()}`,
      sub: "Checkout estimates",
      icon: DollarSign,
      color: "from-amber-500 to-orange-600",
    },
    {
      title: "Flight Searches",
      value: kpis?.flightSearches ?? 0,
      sub: "Total queries tracked",
      icon: Search,
      color: "from-indigo-600 to-violet-500",
    },
    {
      title: "Conversion Rate",
      value: `${kpis?.conversionRate ?? 0}%`,
      sub: "Leads to Booked",
      icon: Percent,
      color: "from-rose-500 to-red-600",
    },
  ];

  return (
    <div className="space-y-8">
      {/* MongoDB Connection Status Alert */}
      {(data?.dbStatus === "disconnected" || error) && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-amber-200">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-amber-300">
                MongoDB Offline or Pending Connection
              </p>
              <p className="text-xs text-amber-400/80 leading-relaxed mt-0.5">
                Dashboard is running in offline mode. Live lead & call stats require an active MongoDB connection.
              </p>
            </div>
          </div>
          <Link
            href="/admin/env"
            className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 text-slate-950 font-bold text-xs rounded-xl hover:bg-amber-400 transition-colors shadow-sm flex-shrink-0"
          >
            <Database className="w-4 h-4" />
            Configure Database
          </Link>
        </div>
      )}

      {/* Top Header Card */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl relative overflow-hidden shadow-sm">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent z-0" />
        <div className="relative z-10">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-2">Welcome Back, Executive</h1>
          <p className="text-slate-500 dark:text-slate-400">Here's your live operational overview of searches, calls, bookings, and agents.</p>
        </div>
        <div className="flex items-center gap-3 relative z-10">
          <Link
            href="/admin/settings"
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-amber-500 text-slate-950 font-extrabold text-xs shadow-md hover:bg-amber-400 transition-all"
          >
            <KeyRound className="w-4 h-4" />
            Change Password / Logout All
          </Link>
          <div className="flex items-center gap-3 bg-slate-100 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 px-4 py-2.5 rounded-2xl">
            <Activity className="w-5 h-5 text-green-500 animate-pulse" />
            <div className="text-xs">
              <p className="text-slate-500 dark:text-slate-500 font-bold uppercase tracking-wider">Active Visitors</p>
              <p className="text-sm font-extrabold text-slate-900 dark:text-white">{kpis?.activeUsers ?? 0} concurrent</p>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <Skeleton className="h-4 w-24 bg-slate-200 dark:bg-slate-800" />
                  <Skeleton className="h-8 w-8 rounded-full bg-slate-200 dark:bg-slate-800" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-16 bg-slate-200 dark:bg-slate-800 mb-2" />
                  <Skeleton className="h-3 w-32 bg-slate-200 dark:bg-slate-800" />
                </CardContent>
              </Card>
            ))
          : cards.map((card, i) => (
              <Card key={i} className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 hover:bg-slate-50 dark:hover:bg-slate-900/70 transition-all duration-300 group overflow-hidden relative shadow-sm">
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${card.color}`} />
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-sm font-bold text-slate-500 dark:text-slate-400">{card.title}</CardTitle>
                  <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <card.icon className="w-4 h-4 text-slate-500 dark:text-slate-300" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-black text-slate-900 dark:text-white mb-1">{card.value}</div>
                  <p className="text-xs text-slate-500 font-medium">{card.sub}</p>
                </CardContent>
              </Card>
            ))}
      </div>

      {/* Main Charts & Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Leads Chart */}
        <Card className="lg:col-span-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/30 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Operational Flow (Last 7 Days)
            </CardTitle>
            <CardDescription className="text-slate-500 dark:text-slate-400">Comparison of incoming leads vs final checkouts.</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            {isLoading ? (
              <Skeleton className="w-full h-full bg-slate-800" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data?.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorBookings" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="day" stroke="#64748b" fontSize={12} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={12} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", color: "#fff" }} />
                  <Area type="monotone" dataKey="Leads" stroke="#3b82f6" strokeWidth={2.5} fillOpacity={1} fill="url(#colorLeads)" />
                  <Area type="monotone" dataKey="Bookings" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorBookings)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Campaign & Ads performance */}
        <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/30 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Target className="w-5 h-5 text-accent" />
              Ad Campaigns (UTM)
            </CardTitle>
            <CardDescription className="text-slate-500 dark:text-slate-400">Leads generated via Google Ads vs Meta Ads.</CardDescription>
          </CardHeader>
          <CardContent className="h-80 flex flex-col justify-between">
            {isLoading ? (
              <Skeleton className="w-full h-full bg-slate-800" />
            ) : (
              <div className="space-y-6 my-auto">
                {[
                  {
                    name: "Google Ads",
                    leads: data?.campaignStats.googleLeads || 0,
                    bookings: data?.campaignStats.googleBookings || 0,
                    color: "bg-blue-500",
                  },
                  {
                    name: "Meta Ads (Facebook/Insta)",
                    leads: data?.campaignStats.metaLeads || 0,
                    bookings: data?.campaignStats.metaBookings || 0,
                    color: "bg-pink-500",
                  },
                ].map((item, i) => {
                  const total = (data?.campaignStats.googleLeads || 0) + (data?.campaignStats.metaLeads || 0);
                  const pct = total > 0 ? ((item.leads / total) * 100).toFixed(0) : "0";
                  return (
                    <div key={i} className="space-y-2">
                      <div className="flex justify-between items-center text-sm">
                        <span className="font-bold text-slate-200">{item.name}</span>
                        <span className="text-slate-400 font-medium">
                          {item.leads} leads ({pct}%)
                        </span>
                      </div>
                      <div className="h-3 rounded-full bg-slate-850 overflow-hidden flex">
                        <div className={`h-full ${item.color}`} style={{ width: `${pct}%` }} />
                      </div>
                      <p className="text-xs text-slate-500 font-bold">Checkouts Completed: {item.bookings}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Performance Grid - Agent & Vendors */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Agent Conversion list */}
        <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/30 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-primary" />
              Agent Performance
            </CardTitle>
            <CardDescription className="text-slate-500 dark:text-slate-400">Assigned leads conversion ratios.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-10 w-full bg-slate-200 dark:bg-slate-800" />
                <Skeleton className="h-10 w-full bg-slate-200 dark:bg-slate-800" />
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {data?.agentPerformance.map((agent, i) => (
                  <div key={i} className="py-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{agent.name}</p>
                      <p className="text-xs text-slate-500">{agent.leads} total leads</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-extrabold text-slate-900 dark:text-white">{agent.booked} booked</p>
                      <p className="text-xs text-green-600 dark:text-green-400 font-bold">{agent.conversion}% conv.</p>
                    </div>
                  </div>
                ))}
                {(!data?.agentPerformance || data.agentPerformance.length === 0) && (
                  <p className="text-slate-400 text-sm text-center py-4">No active agents configured.</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Operations log */}
        <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/30 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-accent" />
              Recent Operations Log
            </CardTitle>
            <CardDescription className="text-slate-500 dark:text-slate-400">Live operational timeline feed.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-10 w-full bg-slate-200 dark:bg-slate-800" />
                <Skeleton className="h-10 w-full bg-slate-200 dark:bg-slate-800" />
              </div>
            ) : (
              <div className="space-y-4">
                {data?.recentActivities.map((act, i) => (
                  <div key={i} className="flex gap-4 items-start text-sm">
                    <div className="mt-1 w-2.5 h-2.5 rounded-full bg-primary shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-slate-700 dark:text-slate-300 leading-snug break-words">{act.description}</p>
                      <p className="text-xs text-slate-500 font-medium mt-1">
                        {new Date(act.time).toLocaleTimeString()} - {new Date(act.time).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
                {(!data?.recentActivities || data.recentActivities.length === 0) && (
                  <p className="text-slate-400 text-sm text-center py-4">No recent activity detected.</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      {/* Site Settings Card */}
      <div className="mt-2">
        <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-green-500/10 flex items-center justify-center">
                <Phone className="w-4 h-4 text-green-500 dark:text-green-400" />
              </div>
              <div>
                <CardTitle className="text-slate-900 dark:text-white text-base">Call Now Button Settings</CardTitle>
                <CardDescription className="text-slate-500 dark:text-slate-400 text-xs">Edit the phone number shown on the booking page Call Now button</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Phone Number</label>
                <input
                  type="tel"
                  value={callNumber}
                  onChange={e => setCallNumber(e.target.value)}
                  placeholder="+18555106415"
                  className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-colors"
                />
                <p className="text-xs text-slate-500">Include country code, e.g. +18555106415</p>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Button Label</label>
                <input
                  type="text"
                  value={callLabel}
                  onChange={e => setCallLabel(e.target.value)}
                  placeholder="Call Now"
                  className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-colors"
                />
                <p className="text-xs text-slate-500">Label shown below the phone icon</p>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Tracking / Analytics ID (Optional)</label>
                <input
                  type="text"
                  value={googleTagId}
                  onChange={e => setGoogleTagId(e.target.value)}
                  placeholder="AW-18305273332"
                  className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-colors"
                />
                <p className="text-xs text-slate-500">Google Ads/Analytics ID (e.g., AW-18305273332)</p>
              </div>
            </div>
            <button
              onClick={() => saveSettings.mutate()}
              disabled={saveSettings.isPending}
              className="mt-4 flex items-center gap-2 bg-green-600 hover:bg-green-500 disabled:opacity-60 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors"
            >
              <Save className="w-4 h-4" />
              {saveSettings.isPending ? "Saving…" : saveSettings.isSuccess ? "Saved ✓" : "Save Settings"}
            </button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
