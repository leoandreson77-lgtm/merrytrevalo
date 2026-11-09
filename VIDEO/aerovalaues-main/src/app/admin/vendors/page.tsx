"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Settings,
  Plus,
  RefreshCw,
  Copy,
  Eye,
  Percent,
  TrendingUp,
  FileText,
  DollarSign,
  Briefcase,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";

interface VendorItem {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  companyName?: string;
  commissionRate: number;
  apiKey: string;
  status: string;
  createdAt: string;
}

export default function AdminVendorsPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [createOpen, setCreateOpen] = useState(false);
  const [selectedVendorStats, setSelectedVendorStats] = useState<any | null>(null);
  const [statsOpen, setStatsOpen] = useState(false);

  // Fetch all vendors
  const { data: vendors, isLoading, refetch } = useQuery<VendorItem[]>({
    queryKey: ["vendors"],
    queryFn: async () => {
      const res = await fetch("/api/admin/vendors");
      if (!res.ok) throw new Error("Failed to load vendors");
      return res.json();
    },
  });

  // Create Vendor Mutation
  const createVendorMutation = useMutation({
    mutationFn: async (newVendor: any) => {
      const res = await fetch("/api/admin/vendors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newVendor),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to create vendor");
      }
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Vendor Created", description: "Vendor has been registered successfully." });
      setCreateOpen(false);
      queryClient.invalidateQueries({ queryKey: ["vendors"] });
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const handleCreateVendor = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    createVendorMutation.mutate(data);
  };

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    toast({ title: "Copied", description: "API Key copied to clipboard." });
  };

  const handleViewPerformance = async (vendorId: string) => {
    try {
      const res = await fetch(`/api/vendor/stats?vendorId=${vendorId}`);
      if (!res.ok) throw new Error("Failed to fetch vendor performance");
      const d = await res.json();
      setSelectedVendorStats(d);
      setStatsOpen(true);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900 border border-slate-800 p-6 rounded-3xl relative overflow-hidden">
        <div>
          <h1 className="text-2xl font-extrabold text-white mb-1 flex items-center gap-2">
            <Settings className="w-6 h-6 text-primary" />
            Vendor Management System
          </h1>
          <p className="text-slate-400 text-sm">Register travel vendors, define commission shares, and track routed bookings.</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => refetch()} variant="outline" className="border-slate-800 text-slate-300">
            <RefreshCw className="w-4 h-4 mr-2" /> Refresh
          </Button>

          {/* Create Vendor Dialog */}
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" /> Register Vendor
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-950 text-white border-slate-800">
              <DialogHeader>
                <DialogTitle>Register New Travel Vendor</DialogTitle>
                <DialogDescription className="text-slate-400">
                  Fill in vendor contact information and commissions. A secure API key will be auto-generated.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateVendor} className="space-y-4">
                <div className="space-y-1">
                  <Label>Vendor Representative Name *</Label>
                  <Input required name="name" placeholder="Agent Rep Name" className="bg-slate-900 border-slate-800" />
                </div>
                <div className="space-y-1">
                  <Label>Company Name</Label>
                  <Input name="companyName" placeholder="Agency Inc." className="bg-slate-900 border-slate-800" />
                </div>
                <div className="space-y-1">
                  <Label>Contact Email *</Label>
                  <Input required name="email" type="email" placeholder="vendor@agency.com" className="bg-slate-900 border-slate-800" />
                </div>
                <div className="space-y-1">
                  <Label>Contact Phone</Label>
                  <Input name="phone" placeholder="+123456789" className="bg-slate-900 border-slate-800" />
                </div>
                <div className="space-y-1">
                  <Label>Commission Rate (%)</Label>
                  <Input name="commissionRate" type="number" step="0.1" defaultValue="10" className="bg-slate-900 border-slate-800" />
                </div>
                <DialogFooter className="pt-2">
                  <Button type="submit" className="w-full">Create Vendor Profile</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Vendors Table */}
      <div className="border border-slate-850 bg-slate-900/10 rounded-2xl overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-900/60">
            <TableRow className="border-slate-850 hover:bg-transparent">
              <TableHead className="text-slate-400 font-bold text-xs uppercase">Vendor Details</TableHead>
              <TableHead className="text-slate-400 font-bold text-xs uppercase">Company</TableHead>
              <TableHead className="text-slate-400 font-bold text-xs uppercase">Commission Rate</TableHead>
              <TableHead className="text-slate-400 font-bold text-xs uppercase">Integration API Key</TableHead>
              <TableHead className="text-slate-400 font-bold text-xs uppercase">Status</TableHead>
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
                  <TableCell><Skeleton className="h-4 w-28 bg-slate-800" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-12 bg-slate-800" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-48 bg-slate-800" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-16 bg-slate-800" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-8 bg-slate-800" /></TableCell>
                </TableRow>
              ))
            ) : vendors?.map((vendor) => (
              <TableRow key={vendor._id} className="border-slate-850/50 hover:bg-slate-900/30">
                <TableCell>
                  <div className="font-bold text-slate-100">{vendor.name}</div>
                  <div className="text-xs text-slate-500">{vendor.email} | {vendor.phone || "No phone"}</div>
                </TableCell>
                <TableCell className="font-semibold text-slate-300">
                  {vendor.companyName || "N/A"}
                </TableCell>
                <TableCell className="font-bold text-primary">
                  {vendor.commissionRate}%
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2 max-w-xs">
                    <code className="text-xs font-mono bg-slate-950 border border-slate-850 px-2 py-1 rounded truncate select-all">
                      {vendor.apiKey}
                    </code>
                    <Button size="icon" variant="ghost" onClick={() => handleCopyKey(vendor.apiKey)} className="hover:bg-slate-800 shrink-0">
                      <Copy className="w-3.5 h-3.5 text-slate-400" />
                    </Button>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-xs font-bold bg-green-500/10 text-green-400 border border-green-500/20 px-2.5 py-0.5 rounded-full">
                    {vendor.status}
                  </span>
                </TableCell>
                <TableCell>
                  <Button size="sm" variant="outline" onClick={() => handleViewPerformance(vendor._id)} className="border-slate-800 hover:bg-slate-800 text-xs">
                    <Eye className="w-3.5 h-3.5 mr-1" /> Analytics
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Performance Analytics Modal */}
      <Dialog open={statsOpen} onOpenChange={setStatsOpen}>
        <DialogContent className="bg-slate-950 text-white border-slate-800 max-w-xl">
          <DialogHeader>
            <DialogTitle>Vendor Performance Analytics</DialogTitle>
            <DialogDescription className="text-slate-400">
              Operational conversion logs for {selectedVendorStats?.vendor.company || selectedVendorStats?.vendor.name}
            </DialogDescription>
          </DialogHeader>
          {selectedVendorStats && (
            <div className="grid grid-cols-2 gap-4 py-4">
              <Card className="bg-slate-900 border-slate-850 text-slate-100">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-bold text-slate-500">Total Leads Shared</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-black text-white">{selectedVendorStats.stats.totalLeads}</div>
                  <p className="text-[10px] text-slate-500 font-bold">+{selectedVendorStats.stats.todaysLeads} today</p>
                </CardContent>
              </Card>
              <Card className="bg-slate-900 border-slate-850 text-slate-100">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-bold text-slate-500">Bookings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-black text-white">{selectedVendorStats.stats.totalBookings}</div>
                  <p className="text-[10px] text-green-400 font-bold">{selectedVendorStats.stats.conversionRate}% conversion</p>
                </CardContent>
              </Card>
              <Card className="bg-slate-900 border-slate-850 text-slate-100">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-bold text-slate-500">Total Revenue</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xl font-black text-emerald-400 flex items-center">
                    <DollarSign className="w-4 h-4" />
                    {((selectedVendorStats.stats.revenue || 0) / 100).toLocaleString()}
                  </div>
                  <p className="text-[10px] text-slate-500">Ticket checkout budgets</p>
                </CardContent>
              </Card>
              <Card className="bg-slate-900 border-slate-850 text-slate-100">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-bold text-slate-500">Vendor Commissions ({selectedVendorStats.vendor.commissionRate}%)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xl font-black text-primary flex items-center">
                    <DollarSign className="w-4 h-4" />
                    {((selectedVendorStats.stats.commission || 0) / 100).toLocaleString()}
                  </div>
                  <p className="text-[10px] text-slate-500">Routing commission share</p>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
