"use client";

import React, { useState, useEffect } from "react";
import {
  Mail,
  Send,
  Save,
  CheckCircle2,
  AlertTriangle,
  Eye,
  EyeOff,
  Globe,
  Tag,
  Phone,
  Plane,
  Server,
  ShieldCheck,
  RefreshCw,
  Loader2,
  ExternalLink,
  Code2,
  Sliders,
  Database,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

export default function AdminEnvConfigPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testingEmail, setTestingEmail] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [testEmailAddress, setTestEmailAddress] = useState("");
  const [showEmailPass, setShowEmailPass] = useState(false);

  // Form State
  const [config, setConfig] = useState({
    // Email / SMTP
    emailHost: "smtp.gmail.com",
    emailPort: "587",
    emailSecure: false,
    emailUser: "",
    emailPass: "",
    hasEmailPass: false,
    emailFrom: "",
    emailBookingsTo: "",
    emailOwner: "",
    disableBookingEmails: false,

    // Google Tag & Tracking
    googleTagEnabled: false,
    googleTagId: "",
    gtmId: "",
    googleAdsId: "",
    customHeadScript: "",

    // Brand & Phone
    siteName: "JetWithFly",
    brandName: "JetWithFly Flights",
    siteUrl: "https://jetwithfly.com",
    companyPhone: "+1 877 371 7356",
    supportEmail: "support@jetwithfly.com",

    // APIs
    duffelToken: "",
    amadeusClientId: "",
    amadeusClientSecret: "",
    googleSheetsId: "",
  });

  // Fetch current configs on mount
  useEffect(() => {
    async function loadConfig() {
      try {
        setLoading(true);
        const res = await fetch("/api/admin/env");
        if (!res.ok) throw new Error("Failed to load environment configuration");
        const data = await res.json();
        setConfig(prev => ({
          ...prev,
          ...data,
        }));
        if (data.emailUser && !testEmailAddress) {
          setTestEmailAddress(data.emailUser);
        }
      } catch (err: any) {
        toast({
          title: "Error loading configuration",
          description: err.message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }
    loadConfig();
  }, []);

  const handleChange = (field: string, value: any) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  const handlePresetSelect = (
    preset: "gmail" | "hostinger" | "godaddy" | "godaddy365" | "zoho" | "namecheap" | "cpanel" | "sendgrid" | "resend"
  ) => {
    let host = "";
    let port = "587";
    let secure = false;
    let userPlaceholder = "";
    let guide = "";

    switch (preset) {
      case "hostinger":
        host = "smtp.hostinger.com";
        port = "465";
        secure = true;
        guide = "Hostinger Webmail applied (Port 465 SSL). Enter your full email (e.g. support@jetwithfly.com) and mailbox password.";
        break;
      case "godaddy":
        host = "smtpout.secureserver.net";
        port = "465";
        secure = true;
        guide = "GoDaddy Webmail applied (Port 465 SSL). Enter your full GoDaddy email and password.";
        break;
      case "godaddy365":
        host = "smtp.office365.com";
        port = "587";
        secure = false;
        guide = "Microsoft 365 / GoDaddy M365 applied (Port 587 STARTTLS). Ensure SMTP AUTH is enabled in M365 Admin.";
        break;
      case "zoho":
        host = "smtppro.zoho.com";
        port = "465";
        secure = true;
        guide = "Zoho Webmail applied (Port 465 SSL). Enter your Zoho address and App Password (if 2FA is active).";
        break;
      case "namecheap":
        host = "mail.privateemail.com";
        port = "465";
        secure = true;
        guide = "Namecheap Private Email applied (Port 465 SSL). Enter your full email and password.";
        break;
      case "cpanel":
        host = "mail.jetwithfly.com";
        port = "465";
        secure = true;
        guide = "Custom cPanel / Webmail applied (Port 465 SSL). Set host to mail.yourdomain.com.";
        break;
      case "gmail":
        host = "smtp.gmail.com";
        port = "587";
        secure = false;
        guide = "Gmail / Google Workspace applied (Port 587). Requires 16-character App Password (not your personal password).";
        break;
      case "sendgrid":
        host = "smtp.sendgrid.net";
        port = "587";
        secure = false;
        userPlaceholder = "apikey";
        guide = "SendGrid applied. User is 'apikey' and password is your API key (SG.xxxx).";
        break;
      case "resend":
        host = "smtp.resend.com";
        port = "465";
        secure = true;
        userPlaceholder = "resend";
        guide = "Resend applied. User is 'resend' and password is your API key (re_xxxx).";
        break;
    }

    setConfig(prev => ({
      ...prev,
      emailHost: host,
      emailPort: port,
      emailSecure: secure,
      ...(userPlaceholder ? { emailUser: userPlaceholder } : {}),
    }));

    toast({
      title: `Applied ${preset.toUpperCase()} Preset`,
      description: guide,
    });
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaving(true);
    setTestResult(null);

    try {
      const res = await fetch("/api/admin/env", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to save configuration");

      toast({
        title: "✅ Configuration Saved",
        description: "Environment & tracking settings have been applied successfully.",
      });
    } catch (err: any) {
      toast({
        title: "Save Failed",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleTestEmail = async () => {
    if (!config.emailUser) {
      toast({
        title: "Missing Email",
        description: "Please enter an SMTP username / email address first.",
        variant: "destructive",
      });
      return;
    }

    setTestingEmail(true);
    setTestResult(null);

    try {
      const res = await fetch("/api/admin/email/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: testEmailAddress || config.emailUser,
          host: config.emailHost,
          port: config.emailPort,
          secure: config.emailSecure,
          user: config.emailUser,
          pass: config.emailPass && config.emailPass !== "••••••••••••" ? config.emailPass : undefined,
          sendActualMail: true,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "SMTP verification failed");

      setTestResult({
        success: true,
        message: data.message || "SMTP connection verified! Test email dispatched successfully.",
      });

      toast({
        title: "🎉 Email Test Successful",
        description: "Test email successfully delivered via configured SMTP server.",
      });
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.message,
      });

      toast({
        title: "❌ SMTP Verification Failed",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setTestingEmail(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <p className="text-sm font-bold text-slate-500">Loading system environment configuration...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16">
      {/* ── Top Header Bar ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sliders className="w-6 h-6 text-blue-600" />
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
              Environment & Integrations
            </h1>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Configure backend SMTP email, Google Tag (GTag / GA4), toll-free telephony, and external flight APIs.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center gap-2 px-6 py-2.5 rounded-xl shadow-md shadow-blue-600/20"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{saving ? "Saving Changes..." : "Save Configuration"}</span>
          </Button>
        </div>
      </div>

      {/* ── SECTION 1: SMTP EMAIL CONFIGURATION ── */}
      <Card className="border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-blue-50/50 via-slate-50 to-transparent dark:from-blue-950/20 dark:via-slate-900/40 border-b border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-blue-600 text-white shadow-sm">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <CardTitle className="text-lg font-black text-slate-900 dark:text-white">
                  SMTP Backend Email Configuration
                </CardTitle>
                <CardDescription className="text-xs">
                  Required for automated booking confirmations, customer itineraries, and admin lead alerts.
                </CardDescription>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-black border ${
                config.hasEmailPass
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400"
                  : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-400"
              }`}>
                {config.hasEmailPass ? "✓ SMTP Configured" : "⚠️ Needs Password"}
              </span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {/* Quick Presets */}
          <div>
            <Label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 block">
              Quick Provider Presets:
            </Label>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handlePresetSelect("hostinger")}
                className="text-xs font-bold border-purple-300 dark:border-purple-800 hover:border-purple-500 hover:text-purple-600 dark:hover:text-purple-400"
              >
                🟣 Hostinger Webmail
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handlePresetSelect("godaddy")}
                className="text-xs font-bold border-emerald-300 dark:border-emerald-800 hover:border-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400"
              >
                🟢 GoDaddy Webmail
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handlePresetSelect("godaddy365")}
                className="text-xs font-bold border-blue-300 dark:border-blue-800 hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400"
              >
                🟦 GoDaddy / Microsoft 365
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handlePresetSelect("zoho")}
                className="text-xs font-bold border-amber-300 dark:border-amber-800 hover:border-amber-500 hover:text-amber-600 dark:hover:text-amber-400"
              >
                🟡 Zoho Webmail
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handlePresetSelect("cpanel")}
                className="text-xs font-bold border-slate-300 dark:border-slate-700 hover:border-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              >
                🌐 Custom cPanel
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handlePresetSelect("namecheap")}
                className="text-xs font-bold border-orange-300 dark:border-orange-800 hover:border-orange-500 hover:text-orange-600 dark:hover:text-orange-400"
              >
                🟠 Namecheap Email
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handlePresetSelect("gmail")}
                className="text-xs font-bold border-red-300 dark:border-red-800 hover:border-red-500 hover:text-red-600 dark:hover:text-red-400"
              >
                🔴 Gmail / Google Workspace
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handlePresetSelect("sendgrid")}
                className="text-xs font-bold hover:border-blue-500 hover:text-blue-600"
              >
                🔵 SendGrid
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handlePresetSelect("resend")}
                className="text-xs font-bold hover:border-slate-500"
              >
                ⚫ Resend
              </Button>
            </div>

            {/* Quick Webmail Info Banner */}
            <div className="mt-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              <span className="font-bold text-slate-900 dark:text-white">💡 Webmail Quick Tip:</span> For <strong>Hostinger</strong> & <strong>GoDaddy</strong>, use your full domain email address (e.g. <code>support@jetwithfly.com</code>) as the username and your standard mailbox password. Port 465 requires SSL to be checked.
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <Label htmlFor="emailHost" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                SMTP Host Server
              </Label>
              <Input
                id="emailHost"
                value={config.emailHost}
                onChange={e => handleChange("emailHost", e.target.value)}
                placeholder="smtp.gmail.com"
                className="mt-1.5 font-medium"
              />
              <p className="text-[11px] text-slate-400 mt-1">e.g. smtp.gmail.com or smtp.hostinger.com</p>
            </div>

            <div>
              <Label htmlFor="emailPort" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                SMTP Port
              </Label>
              <Input
                id="emailPort"
                value={config.emailPort}
                onChange={e => handleChange("emailPort", e.target.value)}
                placeholder="587"
                className="mt-1.5 font-medium"
              />
              <p className="text-[11px] text-slate-400 mt-1">Standard: 587 (STARTTLS) or 465 (SSL)</p>
            </div>

            <div>
              <Label htmlFor="emailSecure" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                SSL Security
              </Label>
              <div className="mt-1.5 flex items-center h-10 px-3 border border-slate-200 dark:border-slate-800 rounded-md">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={config.emailSecure}
                    onChange={e => handleChange("emailSecure", e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-blue-600"
                  />
                  <span>Use SSL (Required for Port 465)</span>
                </label>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <Label htmlFor="emailUser" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                SMTP Username / Sender Email (EMAIL_USER)
              </Label>
              <Input
                id="emailUser"
                value={config.emailUser}
                onChange={e => handleChange("emailUser", e.target.value)}
                placeholder="support@jetwithfly.com or your-email@gmail.com"
                className="mt-1.5 font-medium"
              />
            </div>

            <div>
              <Label htmlFor="emailPass" className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                <span>SMTP Password / App Password (EMAIL_PASS)</span>
                {config.hasEmailPass && (
                  <span className="text-[11px] text-emerald-600 font-bold">Saved in .env</span>
                )}
              </Label>
              <div className="relative mt-1.5">
                <Input
                  id="emailPass"
                  type={showEmailPass ? "text" : "password"}
                  value={config.emailPass}
                  onChange={e => handleChange("emailPass", e.target.value)}
                  placeholder="Enter 16-character Gmail App Password"
                  className="pr-10 font-mono text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowEmailPass(!showEmailPass)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  {showEmailPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                For Gmail: Use a 16-character Google App Password from{" "}
                <a href="https://myaccount.google.com/apppasswords" target="_blank" rel="noreferrer" className="text-blue-500 underline">
                  Google Security
                </a>
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div>
              <Label htmlFor="emailBookingsTo" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Admin / Owner Notification Email (EMAIL_BOOKINGS_TO)
              </Label>
              <Input
                id="emailBookingsTo"
                value={config.emailBookingsTo}
                onChange={e => handleChange("emailBookingsTo", e.target.value)}
                placeholder="bookings@jetwithfly.com, owner@gmail.com"
                className="mt-1.5 font-medium"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Where new flight bookings and customer inquiries will be dispatched immediately.
              </p>
            </div>

            <div>
              <Label htmlFor="emailFrom" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Custom From Header (EMAIL_FROM)
              </Label>
              <Input
                id="emailFrom"
                value={config.emailFrom}
                onChange={e => handleChange("emailFrom", e.target.value)}
                placeholder='JetWithFly Flights <support@jetwithfly.com>'
                className="mt-1.5 font-medium"
              />
            </div>
          </div>

          {/* Email Test Box */}
          <div className="mt-6 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
              <Send className="w-4 h-4 text-blue-600" />
              Verify & Test Email Delivery
            </h4>
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <Input
                value={testEmailAddress}
                onChange={e => setTestEmailAddress(e.target.value)}
                placeholder="Send test email to address..."
                className="flex-1 bg-white dark:bg-slate-950 font-medium"
              />
              <Button
                type="button"
                onClick={handleTestEmail}
                disabled={testingEmail}
                variant="outline"
                className="w-full sm:w-auto font-bold border-blue-300 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950"
              >
                {testingEmail ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
                <span>{testingEmail ? "Verifying..." : "Send Test Email"}</span>
              </Button>
            </div>

            {testResult && (
              <div className={`mt-3 p-3 rounded-xl border text-xs font-medium ${
                testResult.success
                  ? "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300"
                  : "bg-red-50 text-red-800 border-red-200 dark:bg-red-950/40 dark:text-red-300"
              }`}>
                <div className="flex items-start gap-2">
                  {testResult.success ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" /> : <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />}
                  <div>
                    <p className="font-bold">{testResult.success ? "Test Passed" : "Connection Error"}</p>
                    <p className="mt-0.5 whitespace-pre-wrap">{testResult.message}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ── SECTION 2: GOOGLE TAG (GTAG) & TRACKING ── */}
      <Card className="border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-emerald-50/50 via-slate-50 to-transparent dark:from-emerald-950/20 dark:via-slate-900/40 border-b border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-600 text-white shadow-sm">
                <Tag className="w-5 h-5" />
              </div>
              <div>
                <CardTitle className="text-lg font-black text-slate-900 dark:text-white">
                  Google Tag (gtag.js) & Tracking Configuration
                </CardTitle>
                <CardDescription className="text-xs">
                  Manage Google Analytics 4 (GA4), Google Ads Conversion Tracking, and Google Tag Manager.
                </CardDescription>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <label className="flex items-center gap-2 cursor-pointer bg-white dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Google Tag:</span>
                <input
                  type="checkbox"
                  checked={config.googleTagEnabled}
                  onChange={e => handleChange("googleTagEnabled", e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-600"
                />
                <span className={`text-xs font-black ${config.googleTagEnabled ? "text-emerald-600" : "text-slate-400"}`}>
                  {config.googleTagEnabled ? "ENABLED" : "DISABLED"}
                </span>
              </label>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-5">
          <div className="p-4 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/40 text-xs text-emerald-900 dark:text-emerald-300 leading-relaxed">
            💡 <strong>How It Works:</strong> When enabled, JetWithFly dynamically injects <code>gtag.js</code> and initializes your measurement ID across all customer pages. You can also disable it anytime with zero code modifications.
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <Label htmlFor="googleTagId" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Google Tag ID (GTag / GA4)
              </Label>
              <Input
                id="googleTagId"
                value={config.googleTagId}
                onChange={e => handleChange("googleTagId", e.target.value)}
                placeholder="G-XXXXXXXXXX or AW-XXXXXXXXX"
                className="mt-1.5 font-mono text-sm"
              />
              <p className="text-[11px] text-slate-400 mt-1">Google Analytics 4 or Google Ads Tag ID</p>
            </div>

            <div>
              <Label htmlFor="gtmId" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Google Tag Manager (GTM)
              </Label>
              <Input
                id="gtmId"
                value={config.gtmId}
                onChange={e => handleChange("gtmId", e.target.value)}
                placeholder="GTM-XXXXXXX"
                className="mt-1.5 font-mono text-sm"
              />
              <p className="text-[11px] text-slate-400 mt-1">GTM Container ID (Optional)</p>
            </div>

            <div>
              <Label htmlFor="googleAdsId" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Google Ads Conversion ID
              </Label>
              <Input
                id="googleAdsId"
                value={config.googleAdsId}
                onChange={e => handleChange("googleAdsId", e.target.value)}
                placeholder="AW-XXXXXXXXX/YYYYYYYYYY"
                className="mt-1.5 font-mono text-sm"
              />
              <p className="text-[11px] text-slate-400 mt-1">Conversion label for booking completions</p>
            </div>
          </div>

          <div>
            <Label htmlFor="customHeadScript" className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Code2 className="w-4 h-4 text-emerald-600" />
              Custom Header Script / Meta Pixel snippet
            </Label>
            <textarea
              id="customHeadScript"
              value={config.customHeadScript}
              onChange={e => handleChange("customHeadScript", e.target.value)}
              placeholder="<!-- Optional: Paste any custom <head> analytics, Meta Pixel, or Clarity scripts here -->"
              rows={3}
              className="mt-1.5 w-full rounded-md border border-input bg-transparent px-3 py-2 text-xs font-mono shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>
        </CardContent>
      </Card>

      {/* ── SECTION 3: TOLL-FREE PHONE & BRAND IDENTITY ── */}
      <Card className="border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-amber-50/50 via-slate-50 to-transparent dark:from-amber-950/20 dark:via-slate-900/40 border-b border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-600 text-white shadow-sm">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-lg font-black text-slate-900 dark:text-white">
                Telephony & Brand Identity
              </CardTitle>
              <CardDescription className="text-xs">
                Toll-free customer hotline, brand names, and public URLs used across headers and emails.
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <Label htmlFor="companyPhone" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Toll-Free Phone (TFN)
              </Label>
              <Input
                id="companyPhone"
                value={config.companyPhone}
                onChange={e => handleChange("companyPhone", e.target.value)}
                placeholder="+1 877 371 7356"
                className="mt-1.5 font-bold text-emerald-600"
              />
              <p className="text-[11px] text-slate-400 mt-1">Appears on Call Desk banners, boarding passes, and receipts.</p>
            </div>

            <div>
              <Label htmlFor="supportEmail" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Customer Support Email
              </Label>
              <Input
                id="supportEmail"
                value={config.supportEmail}
                onChange={e => handleChange("supportEmail", e.target.value)}
                placeholder="support@jetwithfly.com"
                className="mt-1.5 font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <Label htmlFor="brandName" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Brand Display Name
              </Label>
              <Input
                id="brandName"
                value={config.brandName}
                onChange={e => handleChange("brandName", e.target.value)}
                placeholder="JetWithFly Flights"
                className="mt-1.5 font-medium"
              />
            </div>

            <div>
              <Label htmlFor="siteName" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Site Short Name
              </Label>
              <Input
                id="siteName"
                value={config.siteName}
                onChange={e => handleChange("siteName", e.target.value)}
                placeholder="JetWithFly"
                className="mt-1.5 font-medium"
              />
            </div>

            <div>
              <Label htmlFor="siteUrl" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Site Public URL
              </Label>
              <Input
                id="siteUrl"
                value={config.siteUrl}
                onChange={e => handleChange("siteUrl", e.target.value)}
                placeholder="https://jetwithfly.com"
                className="mt-1.5 font-medium"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── SECTION 4: APIS & KEYS ── */}
      <Card className="border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-purple-50/50 via-slate-50 to-transparent dark:from-purple-950/20 dark:via-slate-900/40 border-b border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-600 text-white shadow-sm">
              <Plane className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-lg font-black text-slate-900 dark:text-white">
                Flight Search Engine & Google Sheets APIs
              </CardTitle>
              <CardDescription className="text-xs">
                Duffel live flight search access token, Amadeus credentials, and Google Sheets booking logger.
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <Label htmlFor="duffelToken" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Duffel Access Token (DUFFEL_ACCESS_TOKEN)
              </Label>
              <Input
                id="duffelToken"
                type="password"
                value={config.duffelToken}
                onChange={e => handleChange("duffelToken", e.target.value)}
                placeholder="duffel_test_..."
                className="mt-1.5 font-mono text-sm"
              />
              <p className="text-[11px] text-slate-400 mt-1">Get your token from duffel.com</p>
            </div>

            <div>
              <Label htmlFor="googleSheetsId" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Google Sheets ID (Optional)
              </Label>
              <Input
                id="googleSheetsId"
                value={config.googleSheetsId}
                onChange={e => handleChange("googleSheetsId", e.target.value)}
                placeholder="1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms"
                className="mt-1.5 font-mono text-sm"
              />
              <p className="text-[11px] text-slate-400 mt-1">Logs all bookings to a private spreadsheet.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bottom Save CTA Bar */}
      <div className="flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg sticky bottom-4 z-20">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Settings are saved to .env on disk and applied to active Node.js processes immediately.</span>
        </div>

        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center gap-2 px-8 py-3 rounded-xl shadow-md"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>{saving ? "Saving..." : "Save All Configuration"}</span>
        </Button>
      </div>
    </div>
  );
}

