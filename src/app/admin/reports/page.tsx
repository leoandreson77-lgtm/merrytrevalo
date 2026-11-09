"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import {
  BarChart3,
  FileSpreadsheet,
  FileText,
  Download,
  RefreshCw,
  TrendingUp,
  PhoneCall,
  DollarSign,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import "jspdf-autotable";

interface ReportsData {
  leads: any[];
  calls: any[];
  bookings: any[];
}

export default function ReportsPage() {
  const { toast } = useToast();

  const { data, isLoading, refetch } = useQuery<ReportsData>({
    queryKey: ["reportsData"],
    queryFn: async () => {
      const res = await fetch("/api/admin/reports/data");
      if (!res.ok) throw new Error("Failed to compile reports");
      return res.json();
    },
  });

  const exportExcel = (dataset: any[], filename: string) => {
    if (!dataset || dataset.length === 0) {
      toast({ title: "Export Failed", description: "No records found in this dataset.", variant: "destructive" });
      return;
    }
    const ws = XLSX.utils.json_to_sheet(dataset);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Report");
    XLSX.writeFile(wb, `${filename}_${Date.now()}.xlsx`);
    toast({ title: "Excel Dispatched", description: `File ${filename}.xlsx has been downloaded.` });
  };

  const exportPDF = (dataset: any[], title: string, filename: string) => {
    if (!dataset || dataset.length === 0) {
      toast({ title: "Export Failed", description: "No records found in this dataset.", variant: "destructive" });
      return;
    }

    const doc = new jsPDF() as any;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text(title, 14, 20);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleDateString()} | JetWithFly Enterprise`, 14, 26);

    const headers = Object.keys(dataset[0]);
    const rows = dataset.map((item) => headers.map((key) => String(item[key] ?? "")));

    doc.autoTable({
      head: [headers],
      body: rows,
      startY: 32,
      theme: "grid",
      headStyles: { fillColor: [59, 130, 246] },
      styles: { fontSize: 8 },
    });

    doc.save(`${filename}_${Date.now()}.pdf`);
    toast({ title: "PDF Dispatched", description: `File ${filename}.pdf is saved.` });
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900 border border-slate-800 p-6 rounded-3xl relative overflow-hidden">
        <div>
          <h1 className="text-2xl font-extrabold text-white mb-1 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-primary" />
            Operational Reporting Engine
          </h1>
          <p className="text-slate-400 text-sm">Download conversion spreadsheets, telephony logs, and revenue metrics in Excel or PDF formats.</p>
        </div>
        <Button onClick={() => refetch()} variant="outline" className="border-slate-800 text-slate-300">
          <RefreshCw className="w-4 h-4 mr-2" /> Refresh Datasets
        </Button>
      </div>

      {/* Grid of Report Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Leads report card */}
        <Card className="border-slate-850 bg-slate-900/40 text-slate-100 flex flex-col justify-between h-72">
          <CardHeader>
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-2">
              <TrendingUp className="w-5 h-5 text-blue-400" />
            </div>
            <CardTitle className="text-lg font-extrabold text-white">Leads & Enquiries Conversion</CardTitle>
            <CardDescription className="text-slate-400 text-xs">
              Includes UTM tags, routing categories, priorities, assignments, and conversion states.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 pb-6">
            <div className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-2">
              Total compilation: {isLoading ? "..." : data?.leads.length || 0} records
            </div>
            <div className="flex gap-2">
              <Button
                disabled={isLoading}
                onClick={() => exportExcel(data?.leads || [], "crm_leads_conversion")}
                className="flex-1 text-xs border-slate-800 bg-slate-950 text-slate-300 hover:bg-slate-900"
                variant="outline"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 mr-1 text-emerald-500" /> Excel
              </Button>
              <Button
                disabled={isLoading}
                onClick={() => exportPDF(data?.leads || [], "CRM Leads Conversion Audit", "crm_leads_conversion")}
                className="flex-1 text-xs border-slate-800 bg-slate-950 text-slate-300 hover:bg-slate-900"
                variant="outline"
              >
                <FileText className="w-3.5 h-3.5 mr-1 text-red-500" /> PDF
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Telephony report card */}
        <Card className="border-slate-850 bg-slate-900/40 text-slate-100 flex flex-col justify-between h-72">
          <CardHeader>
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-2">
              <PhoneCall className="w-5 h-5 text-purple-400" />
            </div>
            <CardTitle className="text-lg font-extrabold text-white">Telephony & Call Connections</CardTitle>
            <CardDescription className="text-slate-400 text-xs">
              Tracks click-to-call browser hits, durations, Twilio CallSIDs, and visitor IPs.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 pb-6">
            <div className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-2">
              Total compilation: {isLoading ? "..." : data?.calls.length || 0} records
            </div>
            <div className="flex gap-2">
              <Button
                disabled={isLoading}
                onClick={() => exportExcel(data?.calls || [], "telephony_call_logs")}
                className="flex-1 text-xs border-slate-800 bg-slate-950 text-slate-300 hover:bg-slate-900"
                variant="outline"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 mr-1 text-emerald-500" /> Excel
              </Button>
              <Button
                disabled={isLoading}
                onClick={() => exportPDF(data?.calls || [], "Telephony Connection Logs", "telephony_call_logs")}
                className="flex-1 text-xs border-slate-800 bg-slate-950 text-slate-300 hover:bg-slate-900"
                variant="outline"
              >
                <FileText className="w-3.5 h-3.5 mr-1 text-red-500" /> PDF
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Revenue report card */}
        <Card className="border-slate-850 bg-slate-900/40 text-slate-100 flex flex-col justify-between h-72">
          <CardHeader>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-2">
              <DollarSign className="w-5 h-5 text-emerald-400" />
            </div>
            <CardTitle className="text-lg font-extrabold text-white">Bookings & Revenue estimates</CardTitle>
            <CardDescription className="text-slate-400 text-xs">
              Lists final ticket checkout amounts, route targets, agents, and date timestamps.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 pb-6">
            <div className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-2">
              Total compilation: {isLoading ? "..." : data?.bookings.length || 0} records
            </div>
            <div className="flex gap-2">
              <Button
                disabled={isLoading}
                onClick={() => exportExcel(data?.bookings || [], "bookings_revenue_audit")}
                className="flex-1 text-xs border-slate-800 bg-slate-950 text-slate-300 hover:bg-slate-900"
                variant="outline"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 mr-1 text-emerald-500" /> Excel
              </Button>
              <Button
                disabled={isLoading}
                onClick={() => exportPDF(data?.bookings || [], "Bookings & Revenue Transactions Audit", "bookings_revenue_audit")}
                className="flex-1 text-xs border-slate-800 bg-slate-950 text-slate-300 hover:bg-slate-900"
                variant="outline"
              >
                <FileText className="w-3.5 h-3.5 mr-1 text-red-500" /> PDF
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
