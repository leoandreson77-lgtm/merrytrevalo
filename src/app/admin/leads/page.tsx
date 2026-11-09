"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Users,
  Search,
  Filter,
  Plus,
  Trash2,
  UserCheck,
  Building2,
  RefreshCw,
  Eye,
  AlertTriangle,
  Merge,
  ChevronLeft,
  ChevronRight,
  Phone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";

interface LeadItem {
  _id: string;
  name: string;
  phone: string;
  email: string;
  origin?: string;
  destination?: string;
  source: string;
  status: string;
  priority: string;
  createdAt: string;
  assignedAgent?: { _id: string; name: string };
  assignedVendor?: { _id: string; name: string; companyName?: string };
}

export default function LeadsPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Filter States
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");
  const [source, setSource] = useState("");
  const [page, setPage] = useState(1);

  // Selection & Dialog States
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  const [createOpen, setCreateOpen] = useState(false);
  const [assignAgentOpen, setAssignAgentOpen] = useState(false);
  const [assignVendorOpen, setAssignVendorOpen] = useState(false);
  const [mergeOpen, setMergeOpen] = useState(false);
  const [dialingLeadId, setDialingLeadId] = useState<string | null>(null);

  // Outbound Dialing Mutation
  const outboundCallMutation = useMutation({
    mutationFn: async (customerPhone: string) => {
      const res = await fetch("/api/twilio/call-outbound", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerPhone }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to initiate call");
      }
      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "📞 Dialing Connecting...",
        description: data.message || "First picking up your agent phone to bridge with lead.",
      });
      setDialingLeadId(null);
    },
    onError: (err: any) => {
      toast({
        title: "Dialer Failed",
        description: err.message,
        variant: "destructive",
      });
      setDialingLeadId(null);
    },
  });

  const handleCallLead = (phone: string, id: string) => {
    if (dialingLeadId) return;
    setDialingLeadId(id);
    outboundCallMutation.mutate(phone);
  };

  // Assignee selection
  const [selectedAgentId, setSelectedAgentId] = useState("");
  const [selectedVendorId, setSelectedVendorId] = useState("");

  // Merge ids
  const [primaryLeadId, setPrimaryLeadId] = useState("");
  const [duplicateLeadId, setDuplicateLeadId] = useState("");

  // Fetch Leads Query
  const { data, isLoading, refetch } = useQuery<{ leads: LeadItem[]; pagination: any }>({
    queryKey: ["leads", search, status, priority, source, page],
    queryFn: async () => {
      const params = new URLSearchParams({
        search,
        status,
        priority,
        source,
        page: String(page),
        limit: "10",
      });
      const res = await fetch(`/api/admin/leads?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch leads");
      return res.json();
    },
  });

  // Fetch active agents and vendors for dropdowns
  const { data: agents } = useQuery<any[]>({
    queryKey: ["activeAgents"],
    queryFn: async () => {
      const res = await fetch("/api/admin/dashboard/stats"); // stats returns agents performance
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

  // Create Manual Lead Mutation
  const createLeadMutation = useMutation({
    mutationFn: async (newLead: any) => {
      const res = await fetch("/api/admin/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newLead),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to create lead");
      }
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Lead Created", description: "Lead has been created and auto-assigned." });
      setCreateOpen(false);
      queryClient.invalidateQueries({ queryKey: ["leads"] });
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  // Merge Leads Mutation
  const mergeLeadsMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await fetch("/api/admin/leads/merge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to merge leads");
      }
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Leads Merged", description: "Leads have been successfully consolidated." });
      setMergeOpen(false);
      setPrimaryLeadId("");
      setDuplicateLeadId("");
      queryClient.invalidateQueries({ queryKey: ["leads"] });
    },
    onError: (err: any) => {
      toast({ title: "Merge Failed", description: err.message, variant: "destructive" });
    },
  });

  const handleCreateLead = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    createLeadMutation.mutate(data);
  };

  const handleMergeLeads = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    mergeLeadsMutation.mutate({ primaryLeadId, duplicateLeadId });
  };

  const handleSelectLead = (id: string) => {
    setSelectedLeads((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSelectAllLeads = () => {
    if (!data?.leads) return;
    if (selectedLeads.length === data.leads.length) {
      setSelectedLeads([]);
    } else {
      setSelectedLeads(data.leads.map((x) => x._id));
    }
  };

  const handleBulkAssignAgent = async () => {
    if (!selectedAgentId) return;
    setAssignAgentOpen(false);
    try {
      await Promise.all(
        selectedLeads.map((id) =>
          fetch(`/api/admin/leads/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ assignedAgent: selectedAgentId }),
          })
        )
      );
      toast({ title: "Leads Assigned", description: "Successfully updated agent assignments." });
      setSelectedLeads([]);
      queryClient.invalidateQueries({ queryKey: ["leads"] });
    } catch {
      toast({ title: "Error", description: "Failed to assign leads.", variant: "destructive" });
    }
  };

  const handleBulkAssignVendor = async () => {
    if (!selectedVendorId) return;
    setAssignVendorOpen(false);
    try {
      await Promise.all(
        selectedLeads.map((id) =>
          fetch(`/api/admin/leads/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ assignedVendor: selectedVendorId }),
          })
        )
      );
      toast({ title: "Leads Shared", description: "Successfully routed leads to vendor." });
      setSelectedLeads([]);
      queryClient.invalidateQueries({ queryKey: ["leads"] });
    } catch {
      toast({ title: "Error", description: "Failed to share leads.", variant: "destructive" });
    }
  };

  const handleBulkDelete = async () => {
    if (!confirm("Are you sure you want to delete these leads?")) return;
    try {
      await Promise.all(
        selectedLeads.map((id) =>
          fetch(`/api/admin/leads/${id}`, {
            method: "DELETE",
          })
        )
      );
      toast({ title: "Leads Deleted", description: "Successfully deleted selected records." });
      setSelectedLeads([]);
      queryClient.invalidateQueries({ queryKey: ["leads"] });
    } catch {
      toast({ title: "Error", description: "Failed to delete leads.", variant: "destructive" });
    }
  };

  // ── Filter reset helpers — must be ABOVE return ──
  function usePriorityFilter(val: string) {
    setPriority(val === "all_priority_reset" ? "" : val);
    setPage(1);
  }
  function useSourceFilter(val: string) {
    setSource(val === "all_source_reset" ? "" : val);
    setPage(1);
  }
  function useStatusFilter(val: string) {
    setStatus(val === "all_status_reset" ? "" : val);
    setPage(1);
  }

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900 border border-slate-800 p-6 rounded-3xl relative overflow-hidden">
        <div>
          <h1 className="text-2xl font-extrabold text-white mb-1 flex items-center gap-2">
            <Users className="w-6 h-6 text-primary" />
            CRM Lead Management
          </h1>
          <p className="text-slate-400 text-sm">Review incoming flight search logs, bookings, manual entries, and routing assignments.</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => refetch()} variant="outline" className="border-slate-800 text-slate-300">
            <RefreshCw className="w-4 h-4 mr-2" /> Refresh
          </Button>

          {/* Merge Dialog Button */}
          <Dialog open={mergeOpen} onOpenChange={setMergeOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="border-slate-800 text-slate-300">
                <Merge className="w-4 h-4 mr-2" /> Merge Duplicates
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-950 text-white border-slate-800">
              <DialogHeader>
                <DialogTitle>Merge CRM Leads</DialogTitle>
                <DialogDescription className="text-slate-400">
                  Consolidate details, internal notes, and activity records between duplicate leads.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleMergeLeads} className="space-y-4">
                <div className="space-y-2">
                  <Label>Primary Lead ID (Keeps all core credentials)</Label>
                  <Input
                    required
                    name="primaryLeadId"
                    value={primaryLeadId}
                    onChange={(e) => setPrimaryLeadId(e.target.value)}
                    placeholder="e.g. 64fdcb7a5f102ca14"
                    className="bg-slate-900 border-slate-800"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Duplicate Lead ID (This record will be merged and DELETED)</Label>
                  <Input
                    required
                    name="duplicateLeadId"
                    value={duplicateLeadId}
                    onChange={(e) => setDuplicateLeadId(e.target.value)}
                    placeholder="e.g. 64fdcb8b5f102ca28"
                    className="bg-slate-900 border-slate-800"
                  />
                </div>
                <div className="bg-yellow-500/10 border border-yellow-500/20 p-3 rounded-xl flex gap-3 text-yellow-300 text-xs">
                  <AlertTriangle className="w-5 h-5 shrink-0" />
                  <p>Merging will combine notes, attachments, and histories. The duplicate lead is permanently deleted. This action cannot be undone.</p>
                </div>
                <DialogFooter>
                  <Button type="submit" variant="default" className="w-full">
                    Confirm Merge consolidation
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          {/* Create Manual Lead Dialog */}
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" /> Add Enquiry
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-950 text-white border-slate-800 max-w-lg overflow-y-auto max-h-[85vh]">
              <DialogHeader>
                <DialogTitle>Add CRM Enquiry Lead</DialogTitle>
                <DialogDescription className="text-slate-400">
                  Enter new manual enquiry details. Round-robin assignment will apply automatically.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateLead} className="grid grid-cols-2 gap-4">
                <div className="space-y-1 col-span-2">
                  <Label>Passenger Name *</Label>
                  <Input required name="name" placeholder="John Doe" className="bg-slate-900 border-slate-800" />
                </div>
                <div className="space-y-1">
                  <Label>Phone *</Label>
                  <Input required name="phone" placeholder="+123456789" className="bg-slate-900 border-slate-800" />
                </div>
                <div className="space-y-1">
                  <Label>Email *</Label>
                  <Input required name="email" type="email" placeholder="john@example.com" className="bg-slate-900 border-slate-800" />
                </div>
                <div className="space-y-1">
                  <Label>Origin Airport</Label>
                  <Input name="origin" placeholder="JFK" className="bg-slate-900 border-slate-800" />
                </div>
                <div className="space-y-1">
                  <Label>Destination Airport</Label>
                  <Input name="destination" placeholder="LAX" className="bg-slate-900 border-slate-800" />
                </div>
                <div className="space-y-1">
                  <Label>Departure Date</Label>
                  <Input name="departureDate" type="date" className="bg-slate-900 border-slate-800" />
                </div>
                <div className="space-y-1">
                  <Label>Return Date</Label>
                  <Input name="returnDate" type="date" className="bg-slate-900 border-slate-800" />
                </div>
                <div className="space-y-1">
                  <Label>Passengers</Label>
                  <Input name="passengers" type="number" defaultValue="1" className="bg-slate-900 border-slate-800" />
                </div>
                <div className="space-y-1">
                  <Label>Budget ($)</Label>
                  <Input name="budget" type="number" placeholder="500" className="bg-slate-900 border-slate-800" />
                </div>
                <div className="space-y-1">
                  <Label>Cabin Class</Label>
                  <Select name="cabin" defaultValue="Economy">
                    <SelectTrigger className="bg-slate-900 border-slate-800">
                      <SelectValue placeholder="Cabin" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-950 text-white border-slate-800">
                      <SelectItem value="Economy">Economy</SelectItem>
                      <SelectItem value="Premium Economy">Premium Economy</SelectItem>
                      <SelectItem value="Business">Business</SelectItem>
                      <SelectItem value="First">First Class</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label>Priority</Label>
                  <Select name="priority" defaultValue="Medium">
                    <SelectTrigger className="bg-slate-900 border-slate-800">
                      <SelectValue placeholder="Priority" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-950 text-white border-slate-800">
                      <SelectItem value="Low">Low</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="High">High</SelectItem>
                      <SelectItem value="Urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1 col-span-2">
                  <Label>Internal Note / Requirement Details</Label>
                  <Input name="notes" placeholder="Enquiry notes or itinerary parameters..." className="bg-slate-900 border-slate-800" />
                </div>
                <DialogFooter className="col-span-2 pt-2">
                  <Button type="submit" className="w-full">Submit and Assign</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Advanced Filters */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 items-end">
        <div className="space-y-2">
          <Label className="text-slate-400 text-xs">Search Leads</Label>
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Name, phone, IATA code..."
              className="pl-10 bg-slate-950 border-slate-800"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label className="text-slate-400 text-xs">Filter by Status</Label>
          <Select value={status} onValueChange={useStatusFilter}>
            <SelectTrigger className="bg-slate-950 border-slate-800">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent className="bg-slate-950 text-white border-slate-800">
              <SelectItem value="all_status_reset">All Statuses</SelectItem>
              <SelectItem value="New">New</SelectItem>
              <SelectItem value="Assigned">Assigned</SelectItem>
              <SelectItem value="Contacted">Contacted</SelectItem>
              <SelectItem value="Follow Up">Follow Up</SelectItem>
              <SelectItem value="Quote Sent">Quote Sent</SelectItem>
              <SelectItem value="Negotiation">Negotiation</SelectItem>
              <SelectItem value="Payment Pending">Payment Pending</SelectItem>
              <SelectItem value="Booked">Booked</SelectItem>
              <SelectItem value="Cancelled">Cancelled</SelectItem>
              <SelectItem value="Lost">Lost</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label className="text-slate-400 text-xs">Filter by Priority</Label>
          <Select value={priority} onValueChange={usePriorityFilter}>
            <SelectTrigger className="bg-slate-950 border-slate-800">
              <SelectValue placeholder="All Priorities" />
            </SelectTrigger>
            <SelectContent className="bg-slate-950 text-white border-slate-800">
              <SelectItem value="all_priority_reset">All Priorities</SelectItem>
              <SelectItem value="Low">Low</SelectItem>
              <SelectItem value="Medium">Medium</SelectItem>
              <SelectItem value="High">High</SelectItem>
              <SelectItem value="Urgent">Urgent</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label className="text-slate-400 text-xs">Filter by Source</Label>
          <Select value={source} onValueChange={useSourceFilter}>
            <SelectTrigger className="bg-slate-950 border-slate-800">
              <SelectValue placeholder="All Sources" />
            </SelectTrigger>
            <SelectContent className="bg-slate-950 text-white border-slate-800">
              <SelectItem value="all_source_reset">All Sources</SelectItem>
              <SelectItem value="Website">Website</SelectItem>
              <SelectItem value="Landing Page">Landing Page</SelectItem>
              <SelectItem value="Flight Search">Flight Search</SelectItem>
              <SelectItem value="Contact Forms">Contact Forms</SelectItem>
              <SelectItem value="Call Tracking">Call Tracking</SelectItem>
              <SelectItem value="WhatsApp">WhatsApp</SelectItem>
              <SelectItem value="API">API</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {selectedLeads.length > 0 && (
        <div className="bg-primary/10 border border-primary/20 p-3 rounded-2xl flex items-center justify-between">
          <span className="text-sm font-bold text-slate-200">
            {selectedLeads.length} leads selected
          </span>
          <div className="flex gap-2">
            {/* Bulk Assign Agent */}
            <Dialog open={assignAgentOpen} onOpenChange={setAssignAgentOpen}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline" className="border-slate-800 bg-slate-950 text-slate-300">
                  <UserCheck className="w-4 h-4 mr-2" /> Assign Agent
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-slate-950 text-white border-slate-800">
                <DialogHeader>
                  <DialogTitle>Assign Leads to Agent</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <Label>Select Agent</Label>
                  <Select value={selectedAgentId} onValueChange={setSelectedAgentId}>
                    <SelectTrigger className="bg-slate-900 border-slate-800">
                      <SelectValue placeholder="Select Agent" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-950 text-white border-slate-800">
                      {agents?.map((a: any, i) => (
                        <SelectItem key={i} value={a.name}>
                          {a.name} ({a.leads} leads)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button onClick={handleBulkAssignAgent} className="w-full">Assign Selected</Button>
                </div>
              </DialogContent>
            </Dialog>

            {/* Bulk Share with Vendor */}
            <Dialog open={assignVendorOpen} onOpenChange={setAssignVendorOpen}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline" className="border-slate-800 bg-slate-950 text-slate-300">
                  <Building2 className="w-4 h-4 mr-2" /> Share with Vendor
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-slate-950 text-white border-slate-800">
                <DialogHeader>
                  <DialogTitle>Route Leads to Vendor</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <Label>Select Vendor</Label>
                  <Select value={selectedVendorId} onValueChange={setSelectedVendorId}>
                    <SelectTrigger className="bg-slate-900 border-slate-800">
                      <SelectValue placeholder="Select Vendor" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-950 text-white border-slate-800">
                      {vendors?.map((v: any, i) => (
                        <SelectItem key={i} value={v.name}>
                          {v.company || v.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button onClick={handleBulkAssignVendor} className="w-full">Assign to Vendor</Button>
                </div>
              </DialogContent>
            </Dialog>

            <Button size="sm" variant="destructive" onClick={handleBulkDelete}>
              <Trash2 className="w-4 h-4 mr-2" /> Delete Selected
            </Button>
          </div>
        </div>
      )}

      {/* CRM Leads Table */}
      <div className="border border-slate-850 bg-slate-900/10 rounded-2xl overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-900/60">
            <TableRow className="border-slate-850 hover:bg-transparent">
              <TableHead className="w-12">
                <input
                  type="checkbox"
                  checked={data?.leads && selectedLeads.length === data.leads.length && data.leads.length > 0}
                  onChange={handleSelectAllLeads}
                  className="rounded bg-slate-950 border-slate-800"
                />
              </TableHead>
              <TableHead className="text-slate-400 font-bold text-xs uppercase">Lead Details</TableHead>
              <TableHead className="text-slate-400 font-bold text-xs uppercase">Itinerary</TableHead>
              <TableHead className="text-slate-400 font-bold text-xs uppercase">Source</TableHead>
              <TableHead className="text-slate-400 font-bold text-xs uppercase">Assignees</TableHead>
              <TableHead className="text-slate-400 font-bold text-xs uppercase">Priority / Status</TableHead>
              <TableHead className="w-16"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i} className="border-slate-850/50">
                  <TableCell><Skeleton className="h-4 w-4 bg-slate-800" /></TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-32 bg-slate-800 mb-1" />
                    <Skeleton className="h-3 w-40 bg-slate-800" />
                  </TableCell>
                  <TableCell><Skeleton className="h-4 w-28 bg-slate-800" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16 bg-slate-800" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24 bg-slate-800" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-20 bg-slate-800" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-8 bg-slate-800" /></TableCell>
                </TableRow>
              ))
            ) : data?.leads.map((lead) => (
              <TableRow key={lead._id} className="border-slate-850/50 hover:bg-slate-900/30">
                <TableCell>
                  <input
                    type="checkbox"
                    checked={selectedLeads.includes(lead._id)}
                    onChange={() => handleSelectLead(lead._id)}
                    className="rounded bg-slate-950 border-slate-800"
                  />
                </TableCell>
                <TableCell>
                  <div className="font-bold text-slate-100">{lead.name}</div>
                  <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                    <span className="font-mono">{lead.phone}</span>
                    <button
                      onClick={() => handleCallLead(lead.phone, lead._id)}
                      className={`inline-flex items-center justify-center w-5 h-5 rounded bg-blue-600/10 hover:bg-blue-600 border border-blue-500/25 hover:border-blue-500 text-blue-400 hover:text-white transition-all active:scale-95 ${
                        dialingLeadId === lead._id ? "animate-pulse bg-green-500 text-white" : ""
                      }`}
                      title="Click-to-Call (Callback)"
                      disabled={dialingLeadId !== null}
                    >
                      <Phone className={`w-2.5 h-2.5 ${dialingLeadId === lead._id ? "animate-bounce" : ""}`} />
                    </button>
                    <span className="text-slate-700">|</span>
                    <span>{lead.email}</span>
                  </div>
                </TableCell>
                <TableCell>
                  {lead.origin && lead.destination ? (
                    <span className="font-semibold text-slate-200">
                      {lead.origin} → {lead.destination}
                    </span>
                  ) : (
                    <span className="text-slate-600">N/A</span>
                  )}
                  <div className="text-[10px] text-slate-500">Created: {new Date(lead.createdAt).toLocaleDateString()}</div>
                </TableCell>
                <TableCell>
                  <span className="text-xs font-semibold text-slate-400 bg-slate-800/40 border border-slate-800 px-2.5 py-1 rounded-full">
                    {lead.source}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="text-xs space-y-0.5">
                    <p className="text-slate-300">
                      Agent: <span className="font-bold">{lead.assignedAgent?.name || "Unassigned"}</span>
                    </p>
                    <p className="text-slate-500">
                      Vendor: <span>{lead.assignedVendor?.companyName || lead.assignedVendor?.name || "None"}</span>
                    </p>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2 items-center">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                        lead.priority === "Urgent"
                          ? "bg-red-500/10 border-red-500/20 text-red-400"
                          : lead.priority === "High"
                            ? "bg-orange-500/10 border-orange-500/20 text-orange-400"
                            : "bg-slate-800 border-slate-800 text-slate-400"
                      }`}
                    >
                      {lead.priority}
                    </span>
                    <span
                      className={`text-xs font-black px-2.5 py-1 rounded-xl ${
                        lead.status === "Booked"
                          ? "bg-green-500/10 text-green-400 border border-green-500/20"
                          : lead.status === "New"
                            ? "bg-blue-500/10 text-blue-400 border border-blue-500/20 animate-pulse"
                            : "bg-slate-800 text-slate-300"
                      }`}
                    >
                      {lead.status}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <Link href={`/admin/leads/${lead._id}`}>
                    <Button size="icon" variant="ghost" className="hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg">
                      <Eye className="w-4 h-4" />
                    </Button>
                  </Link>
                </TableCell>
              </TableRow>
            ))}
            {(!data?.leads || data.leads.length === 0) && !isLoading && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-slate-500 font-bold">
                  No enquiries matching current filter criteria.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls */}
      {data?.pagination && data.pagination.totalPages > 1 && (
        <div className="flex justify-between items-center bg-slate-900 border border-slate-800 px-6 py-3 rounded-2xl">
          <span className="text-sm text-slate-400 font-medium">
            Page {data.pagination.page} of {data.pagination.totalPages}
          </span>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="border-slate-800"
            >
              <ChevronLeft className="w-4 h-4 mr-1" /> Previous
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={page === data.pagination.totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="border-slate-800"
            >
              Next <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
