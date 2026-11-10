import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  CalendarCheck,
  DollarSign,
  Search,
  Trash2,
  RefreshCw,
  Plane,
  Users,
  TrendingUp,
  Phone,
  Mail,
  Clock,
  ChevronLeft,
} from "lucide-react";
import { Link } from "wouter";

interface DashboardData {
  kpis: {
    totalBookings: number;
    todaysBookings: number;
    revenue: number;
  };
  recentBookings: any[];
  chartData: { day: string; Bookings: number }[];
}

export function AdminPage() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"dashboard" | "bookings">("dashboard");

  const { data, isLoading, error } = useQuery<DashboardData>({
    queryKey: ["adminDashboard"],
    queryFn: async () => {
      const res = await fetch("/api/admin/dashboard/stats");
      if (!res.ok) throw new Error("Failed to load");
      return res.json();
    },
    refetchInterval: 10000,
  });

  const { data: bookings = [], isLoading: bookingsLoading } = useQuery<any[]>({
    queryKey: ["adminBookings", searchQuery],
    queryFn: async () => {
      const url = searchQuery
        ? `/api/admin/bookings?q=${encodeURIComponent(searchQuery)}`
        : "/api/admin/bookings";
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    enabled: activeTab === "bookings",
  });

  const deleteBooking = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/bookings/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminBookings"] });
      queryClient.invalidateQueries({ queryKey: ["adminDashboard"] });
    },
  });

  const kpis = data?.kpis;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-slate-400 hover:text-white transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </Link>
            <Plane className="w-6 h-6 text-blue-400 animate-pulse" />
            <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
              JetWithFly.com ADMIN
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                queryClient.invalidateQueries({ queryKey: ["adminDashboard"] });
                queryClient.invalidateQueries({ queryKey: ["adminBookings"] });
              }}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors text-slate-400 hover:text-white"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="flex gap-1 mb-8 bg-white/5 rounded-xl p-1 w-fit">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${
              activeTab === "dashboard"
                ? "bg-blue-600 text-white shadow-lg shadow-blue-500/25"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab("bookings")}
            className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${
              activeTab === "bookings"
                ? "bg-blue-600 text-white shadow-lg shadow-blue-500/25"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            All Bookings
          </button>
        </div>

        {activeTab === "dashboard" && (
          <div className="space-y-8">
            {/* Welcome */}
            <div className="bg-gradient-to-r from-blue-600/10 to-indigo-600/10 border border-white/10 rounded-2xl p-6">
              <h1 className="text-2xl font-extrabold tracking-tight mb-1">Welcome Back, Admin</h1>
              <p className="text-slate-400 text-sm">Live operational overview of bookings and enquiries.</p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                {
                  title: "Total Bookings",
                  value: kpis?.totalBookings ?? 0,
                  sub: `+${kpis?.todaysBookings ?? 0} today`,
                  icon: CalendarCheck,
                  gradient: "from-emerald-600 to-teal-500",
                },
                {
                  title: "Today's Bookings",
                  value: kpis?.todaysBookings ?? 0,
                  sub: "New enquiries today",
                  icon: Users,
                  gradient: "from-blue-600 to-cyan-500",
                },
                {
                  title: "Est. Revenue",
                  value: `$${((kpis?.revenue ?? 0) / 100).toLocaleString()}`,
                  sub: "From confirmed bookings",
                  icon: DollarSign,
                  gradient: "from-amber-500 to-orange-600",
                },
              ].map((card) => (
                <div
                  key={card.title}
                  className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-5 group hover:bg-white/[0.08] transition-all"
                >
                  <div className={`absolute top-0 right-0 w-24 h-24 rounded-full bg-gradient-to-br ${card.gradient} opacity-10 -translate-y-6 translate-x-6 group-hover:opacity-20 transition-opacity`} />
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{card.title}</span>
                    <card.icon className="w-5 h-5 text-slate-500" />
                  </div>
                  <p className="text-3xl font-black tracking-tight">
                    {isLoading ? <span className="animate-pulse bg-white/10 rounded w-20 h-8 block" /> : card.value}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">{card.sub}</p>
                </div>
              ))}
            </div>

            {/* Chart */}
            {data?.chartData && data.chartData.length > 0 && (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-400" />
                  Last 7 Days — Bookings
                </h3>
                <div className="flex items-end gap-2 h-40">
                  {data.chartData.map((d, i) => {
                    const max = Math.max(...data.chartData.map((x) => x.Bookings), 1);
                    const height = Math.max((d.Bookings / max) * 100, 4);
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1">
                        <span className="text-xs font-bold text-white/80">{d.Bookings}</span>
                        <div
                          className="w-full rounded-t-lg bg-gradient-to-t from-blue-600 to-cyan-400 transition-all duration-500"
                          style={{ height: `${height}%` }}
                        />
                        <span className="text-[10px] text-slate-500 mt-1 truncate w-full text-center">{d.day}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Recent Bookings Table */}
            <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
              <div className="p-5 border-b border-white/10">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <CalendarCheck className="w-5 h-5 text-emerald-400" />
                  Recent Bookings
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-white/5">
                      <th className="px-5 py-3">Passenger</th>
                      <th className="px-5 py-3">Contact</th>
                      <th className="px-5 py-3">Route</th>
                      <th className="px-5 py-3">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                      Array.from({ length: 5 }).map((_, i) => (
                        <tr key={i} className="border-b border-white/5">
                          <td className="px-5 py-3"><span className="animate-pulse bg-white/10 rounded w-32 h-4 block" /></td>
                          <td className="px-5 py-3"><span className="animate-pulse bg-white/10 rounded w-40 h-4 block" /></td>
                          <td className="px-5 py-3"><span className="animate-pulse bg-white/10 rounded w-24 h-4 block" /></td>
                          <td className="px-5 py-3"><span className="animate-pulse bg-white/10 rounded w-20 h-4 block" /></td>
                        </tr>
                      ))
                    ) : data?.recentBookings?.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-5 py-12 text-center text-slate-500">
                          No bookings yet. They will appear here once customers submit enquiries.
                        </td>
                      </tr>
                    ) : (
                      data?.recentBookings?.slice(0, 10).map((b: any) => (
                        <tr key={b.id} className="border-b border-white/5 hover:bg-white/[0.03] transition-colors">
                          <td className="px-5 py-3 font-semibold">{b.passengerName || "—"}</td>
                          <td className="px-5 py-3">
                            <div className="flex flex-col gap-0.5">
                              {b.email && (
                                <span className="flex items-center gap-1 text-slate-400 text-xs">
                                  <Mail className="w-3 h-3" /> {b.email}
                                </span>
                              )}
                              {b.phone && (
                                <span className="flex items-center gap-1 text-slate-400 text-xs">
                                  <Phone className="w-3 h-3" /> {b.phone}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-5 py-3 text-slate-300">
                            {b.origin || b.flightId || "—"} → {b.destination || ""}
                          </td>
                          <td className="px-5 py-3 text-slate-500 text-xs">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {b.createdAt ? new Date(b.createdAt).toLocaleDateString() : "—"}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === "bookings" && (
          <div className="space-y-6">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search by name, email, or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
              />
            </div>

            {/* Bookings Table */}
            <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-white/10">
                      <th className="px-5 py-3">Passenger</th>
                      <th className="px-5 py-3">Email</th>
                      <th className="px-5 py-3">Phone</th>
                      <th className="px-5 py-3">Passport</th>
                      <th className="px-5 py-3">Date</th>
                      <th className="px-5 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookingsLoading ? (
                      Array.from({ length: 5 }).map((_, i) => (
                        <tr key={i} className="border-b border-white/5">
                          {Array.from({ length: 6 }).map((__, j) => (
                            <td key={j} className="px-5 py-3"><span className="animate-pulse bg-white/10 rounded w-24 h-4 block" /></td>
                          ))}
                        </tr>
                      ))
                    ) : bookings.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-5 py-12 text-center text-slate-500">
                          {searchQuery ? "No results found." : "No bookings yet."}
                        </td>
                      </tr>
                    ) : (
                      bookings.map((b: any) => (
                        <tr key={b.id} className="border-b border-white/5 hover:bg-white/[0.03] transition-colors">
                          <td className="px-5 py-3 font-semibold">{b.passengerName || "—"}</td>
                          <td className="px-5 py-3 text-slate-400">{b.email || "—"}</td>
                          <td className="px-5 py-3 text-slate-400">{b.phone || "—"}</td>
                          <td className="px-5 py-3 text-slate-500 text-xs font-mono">{b.passportDetails || "—"}</td>
                          <td className="px-5 py-3 text-slate-500 text-xs">
                            {b.createdAt ? new Date(b.createdAt).toLocaleString() : "—"}
                          </td>
                          <td className="px-5 py-3">
                            <button
                              onClick={() => {
                                if (confirm("Are you sure you want to delete this booking?")) {
                                  deleteBooking.mutate(b.id);
                                }
                              }}
                              className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all"
                              title="Delete booking"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-center text-red-400">
            Failed to load dashboard data. Check database connection.
          </div>
        )}
      </div>
    </div>
  );
}
