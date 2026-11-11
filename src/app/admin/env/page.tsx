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
  Plus,
  Trash2,
  Copy,
  Check,
  Key,
  Lock,
  Sparkles,
  FileText,
  ChevronDown,
  ChevronUp,
  BookOpen,
  HelpCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

interface CustomVar {
  key: string;
  value: string;
}

export default function AdminEnvConfigPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Email test state
  const [testingEmail, setTestingEmail] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [testEmailAddress, setTestEmailAddress] = useState("");
  const [showEmailPass, setShowEmailPass] = useState(false);

  // MongoDB test state
  const [testingDb, setTestingDb] = useState(false);
  const [dbTestResult, setDbTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [showMongoUri, setShowMongoUri] = useState(false);

  // Secret visibility & generator
  const [showNextAuthSecret, setShowNextAuthSecret] = useState(false);
  const [copiedEnv, setCopiedEnv] = useState(false);
  const [showRawEnv, setShowRawEnv] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  // Main Form State
  const [config, setConfig] = useState({
    // 1. Database
    mongodbUri: "",
    databaseUrl: "",

    // 2. Auth & Security
    nextauthUrl: "https://jetwithfly.com",
    nextauthSecret: "",

    // 3. Email / SMTP
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

    // 4. Google Tag & Tracking
    googleTagEnabled: false,
    googleTagId: "",
    gtmId: "",
    googleAdsId: "",
    customHeadScript: "",

    // 5. Brand & Phone
    siteName: "JetWithFly",
    brandName: "JetWithFly Flights",
    siteUrl: "https://jetwithfly.com",
    companyPhone: "+1 855 510 6415",
    supportEmail: "support@jetwithfly.com",

    // 6. External Flight APIs
    duffelToken: "",
    duffelApiKey: "",
    amadeusClientId: "",
    amadeusClientSecret: "",

    // 7. Third-Party Integrations
    googleSheetsId: "",
    googleServiceAccountEmail: "",
    googlePrivateKey: "",
    upstashRedisUrl: "",
    upstashRedisToken: "",
    twilioAccountSid: "",
    twilioAuthToken: "",
    whatsappSenderNumber: "",
  });

  // Dynamic Custom Environment Variables
  const [customVariables, setCustomVariables] = useState<CustomVar[]>([]);

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

        if (Array.isArray(data.customVariables)) {
          setCustomVariables(data.customVariables);
        }

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

  // Custom Variables Management
  const handleAddCustomVar = () => {
    setCustomVariables(prev => [...prev, { key: "", value: "" }]);
  };

  const handleUpdateCustomVar = (index: number, field: "key" | "value", val: string) => {
    setCustomVariables(prev => {
      const next = [...prev];
      if (field === "key") {
        // Enforce UPPERCASE and valid variable format
        next[index] = { ...next[index], key: val.toUpperCase().replace(/[^A-Z0-9_]/g, "_") };
      } else {
        next[index] = { ...next[index], value: val };
      }
      return next;
    });
  };

  const handleRemoveCustomVar = (index: number) => {
    setCustomVariables(prev => prev.filter((_, i) => i !== index));
  };

  // SMTP Provider Presets
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

  // Generate random NextAuth Secret
  const handleGenerateSecret = () => {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+~=";
    let secret = "";
    for (let i = 0; i < 48; i++) {
      secret += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    handleChange("nextauthSecret", secret);
    toast({
      title: "Generated Random Secret",
      description: "A secure 48-character NextAuth secret has been generated.",
    });
  };

  // Save All Configurations
  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaving(true);
    setTestResult(null);

    // Filter out custom variables with empty keys
    const validCustomVars = customVariables.filter(v => v.key.trim().length > 0);

    const payload = {
      ...config,
      customVariables: validCustomVars,
    };

    try {
      const res = await fetch("/api/admin/env", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to save configuration");

      if (data.dbSaved === false) {
        toast({
          title: "⚠️ Saved Locally (Database Sync Pending)",
          description: data.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "✅ Configuration Saved",
          description: data.message || `Saved successfully to .env and database! ${validCustomVars.length} custom variable(s) synced.`,
        });
      }
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

  // Test MongoDB Connection
  const handleTestDatabase = async () => {
    if (!config.mongodbUri) {
      toast({
        title: "Missing URI",
        description: "Please enter a MongoDB connection string first.",
        variant: "destructive",
      });
      return;
    }

    setTestingDb(true);
    setDbTestResult(null);

    try {
      const res = await fetch("/api/admin/db/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uri: config.mongodbUri }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to connect to MongoDB cluster");
      }

      if (data.cleanedUri && data.hadAngleBrackets) {
        setConfig(prev => ({
          ...prev,
          mongodbUri: data.cleanedUri,
          databaseUrl: prev.databaseUrl ? data.cleanedUri : prev.databaseUrl,
        }));
      }

      setDbTestResult({
        success: true,
        message: data.message || "Successfully connected to MongoDB cluster!",
      });

      toast({
        title: "🎉 MongoDB Connected",
        description: data.message,
      });
    } catch (err: any) {
      setDbTestResult({
        success: false,
        message: err.message,
      });

      toast({
        title: "❌ Connection Failed",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setTestingDb(false);
    }
  };

  // Test SMTP Email
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

  // Generate Raw .env string for quick copy
  const generateRawEnv = (): string => {
    const lines: string[] = [
      "# ==============================================================================",
      "# JETWITHFLY FLIGHTS - PRODUCTION ENVIRONMENT VARIABLES",
      "# ==============================================================================",
      "",
      "# 1. Brand Identity & URLs",
      `NEXT_PUBLIC_SITE_NAME="${config.siteName || "JetWithFly"}"`,
      `NEXT_PUBLIC_BRAND_NAME="${config.brandName || "JetWithFly Flights"}"`,
      `NEXT_PUBLIC_SITE_URL="${config.siteUrl || "https://jetwithfly.com"}"`,
      `NEXT_PUBLIC_COMPANY_PHONE="${config.companyPhone || "+1 855 510 6415"}"`,
      `NEXT_PUBLIC_SUPPORT_EMAIL="${config.supportEmail || "support@jetwithfly.com"}"`,
      `SUPPORT_EMAIL="${config.supportEmail || "support@jetwithfly.com"}"`,
      "",
      "# 2. Database Connection",
      `MONGODB_URI="${config.mongodbUri || ""}"`,
      `DATABASE_URL="${config.databaseUrl || config.mongodbUri || ""}"`,
      "",
      "# 3. Authentication & Security",
      `NEXTAUTH_URL="${config.nextauthUrl || "https://jetwithfly.com"}"`,
      `NEXTAUTH_SECRET="${config.nextauthSecret || ""}"`,
      "",
      "# 4. Backend Email & SMTP",
      `EMAIL_HOST="${config.emailHost || "smtp.gmail.com"}"`,
      `EMAIL_PORT=${config.emailPort || 587}`,
      `EMAIL_SECURE=${config.emailSecure ? "true" : "false"}`,
      `EMAIL_USER="${config.emailUser || ""}"`,
      config.emailPass && config.emailPass !== "••••••••••••" ? `EMAIL_PASS="${config.emailPass}"` : `# EMAIL_PASS="[SAVED_PASSWORD]"`,
      `EMAIL_FROM="${config.emailFrom || `JetWithFly Flights <${config.emailUser || "support@jetwithfly.com"}>`}"`,
      `EMAIL_BOOKINGS_TO="${config.emailBookingsTo || config.emailUser || ""}"`,
      `EMAIL_OWNER="${config.emailOwner || config.emailUser || ""}"`,
      `DISABLE_BOOKING_EMAILS="${config.disableBookingEmails ? "true" : "false"}"`,
      "",
      "# 5. Google Tag & Analytics",
      `NEXT_PUBLIC_GOOGLE_TAG_ENABLED="${config.googleTagEnabled ? "true" : "false"}"`,
      `NEXT_PUBLIC_GOOGLE_TAG_ID="${config.googleTagId || ""}"`,
      `NEXT_PUBLIC_GTM_ID="${config.gtmId || ""}"`,
      `NEXT_PUBLIC_GOOGLE_ADS_ID="${config.googleAdsId || ""}"`,
      config.customHeadScript ? `CUSTOM_HEAD_SCRIPT="${config.customHeadScript.replace(/"/g, '\\"')}"` : "",
      "",
      "# 6. Flight Search APIs",
      `DUFFEL_ACCESS_TOKEN="${config.duffelToken || ""}"`,
      `DUFFEL_API_KEY="${config.duffelApiKey || config.duffelToken || ""}"`,
      `AMADEUS_CLIENT_ID="${config.amadeusClientId || ""}"`,
      `AMADEUS_CLIENT_SECRET="${config.amadeusClientSecret || ""}"`,
      "",
      "# 7. Integrations (Optional)",
      `GOOGLE_SHEETS_ID="${config.googleSheetsId || ""}"`,
      `UPSTASH_REDIS_REST_URL="${config.upstashRedisUrl || ""}"`,
      `UPSTASH_REDIS_REST_TOKEN="${config.upstashRedisToken || ""}"`,
      `TWILIO_ACCOUNT_SID="${config.twilioAccountSid || ""}"`,
      `TWILIO_AUTH_TOKEN="${config.twilioAuthToken || ""}"`,
      `WHATSAPP_SENDER_NUMBER="${config.whatsappSenderNumber || ""}"`,
    ];

    if (customVariables.length > 0) {
      lines.push("");
      lines.push("# 8. Custom Dynamic Variables");
      for (const cv of customVariables) {
        if (cv.key) {
          lines.push(`${cv.key}="${cv.value.replace(/"/g, '\\"')}"`);
        }
      }
    }

    return lines.filter(l => l !== undefined).join("\n");
  };

  const handleCopyEnv = () => {
    const raw = generateRawEnv();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(raw);
    }
    setCopiedEnv(true);
    setTimeout(() => setCopiedEnv(false), 2500);
    toast({
      title: "Copied to Clipboard",
      description: "Full .env file format copied. Ready to paste into Vercel or server terminal.",
    });
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
    <div className="space-y-8 max-w-6xl mx-auto pb-20">
      {/* ── Top Header Bar ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sliders className="w-6 h-6 text-blue-600" />
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
              Environment Variables & Integrations
            </h1>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Manage all environment variables, MongoDB database connection, SMTP email, APIs, and add custom dynamic keys.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowGuide(!showGuide)}
            className={`flex items-center gap-2 text-xs font-bold border-blue-300 dark:border-blue-800 ${
              showGuide ? "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300" : "text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950"
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>{showGuide ? "Hide Format Guide" : "📖 Format Guide & Examples"}</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={handleCopyEnv}
            className="flex items-center gap-2 text-xs font-bold border-slate-300 dark:border-slate-700"
          >
            {copiedEnv ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            <span>{copiedEnv ? "Copied .env" : "Copy Full .env"}</span>
          </Button>

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

      {/* ── INTERACTIVE FORMAT GUIDE & EXAMPLES DRAWER ── */}
      {showGuide && (
        <Card className="border-blue-300 dark:border-blue-800 bg-gradient-to-r from-blue-50/70 via-indigo-50/50 to-slate-50 dark:from-blue-950/40 dark:via-indigo-950/30 dark:to-slate-900 shadow-md animate-in fade-in duration-200">
          <CardHeader className="pb-3 border-b border-blue-200/60 dark:border-blue-900/40">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-blue-600 text-white rounded-lg">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <CardTitle className="text-base font-black text-slate-900 dark:text-white">
                    📖 Configuration Format & Examples Guide (Kaise Add Karein)
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Quick reference for correct formats, live values, and common syntax pitfalls.
                  </CardDescription>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowGuide(false)}
                className="text-xs text-slate-500 hover:text-slate-800"
              >
                Close Guide ✕
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-5 space-y-4 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Card 1: MongoDB Format */}
              <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
                <div className="flex items-center gap-2 font-black text-blue-600 dark:text-blue-400">
                  <Database className="w-4 h-4" />
                  <span>1. MongoDB URI Format</span>
                </div>
                <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
                  Atlas gives <code>mongodb+srv://&lt;username&gt;:&lt;password&gt;@cluster0...</code>. <strong>Replace the entire &lt;password&gt;</strong> (including brackets!).
                </p>
                <div className="p-2.5 rounded bg-slate-50 dark:bg-slate-950 font-mono text-[11px] border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 break-all">
                  <span className="text-emerald-600 font-bold">✓ SAHI:</span><br />
                  mongodb+srv://leoandreson77_db_user:Sameer123@cluster0.20c8rgm.mongodb.net/jetwithfly?retryWrites=true&w=majority
                </div>
                <div className="p-2 rounded bg-red-50 dark:bg-red-950/40 font-mono text-[11px] text-red-600 border border-red-200 dark:border-red-900">
                  <span className="font-bold">✗ GALAT:</span> :&lt;Sameer123&gt;@ (Do NOT keep brackets!)
                </div>
              </div>

              {/* Card 2: Email SMTP Format */}
              <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
                <div className="flex items-center gap-2 font-black text-emerald-600 dark:text-emerald-400">
                  <Mail className="w-4 h-4" />
                  <span>2. SMTP Email Formats</span>
                </div>
                <div className="space-y-1.5 text-[11px] text-slate-600 dark:text-slate-400">
                  <p><strong>🔴 Gmail / Google:</strong></p>
                  <ul className="list-disc pl-4 space-y-0.5">
                    <li>Host: <code>smtp.gmail.com</code> | Port: <code>587</code></li>
                    <li>SSL Checkbox: <strong>Unchecked</strong></li>
                    <li>Pass: 16-character App Password (e.g. <code>onzgmyhxlirwxces</code>)</li>
                  </ul>
                  <p className="pt-1"><strong>🟣 Hostinger / GoDaddy:</strong></p>
                  <ul className="list-disc pl-4 space-y-0.5">
                    <li>Host: <code>smtp.hostinger.com</code> | Port: <code>465</code></li>
                    <li>SSL Checkbox: <strong>CHECKED</strong></li>
                    <li>Pass: Webmail Mailbox Password</li>
                  </ul>
                </div>
              </div>

              {/* Card 3: Custom Variables */}
              <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
                <div className="flex items-center gap-2 font-black text-purple-600 dark:text-purple-400">
                  <Key className="w-4 h-4" />
                  <span>3. Custom Dynamic Variables</span>
                </div>
                <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
                  Keys are automatically formatted as UPPERCASE alphanumeric with underscores.
                </p>
                <div className="space-y-1.5 font-mono text-[11px]">
                  <div className="p-1.5 rounded bg-slate-50 dark:bg-slate-950 border">
                    <span className="text-blue-600 font-bold">KEY:</span> STRIPE_SECRET_KEY<br />
                    <span className="text-slate-400">VAL:</span> sk_live_51M9xxx...
                  </div>
                  <div className="p-1.5 rounded bg-slate-50 dark:bg-slate-950 border">
                    <span className="text-blue-600 font-bold">KEY:</span> CRM_WEBHOOK_URL<br />
                    <span className="text-slate-400">VAL:</span> https://crm.company.com/webhook
                  </div>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-blue-100/70 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900 text-slate-800 dark:text-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <span className="text-xs">
                💡 <strong>Important Note on Saving:</strong> After filling in or changing values, remember to click the blue <strong>&quot;Save Configuration&quot;</strong> button at top-right or bottom-right. The &quot;Test&quot; buttons only verify connections without permanently saving.
              </span>
              <Button
                size="sm"
                onClick={handleSave}
                disabled={saving}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shrink-0 self-start sm:self-auto"
              >
                {saving ? "Saving..." : "Save Now"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── SECTION 1: DATABASE CONFIGURATION (MONGODB) ── */}
      <Card className="border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-blue-50/50 via-slate-50 to-transparent dark:from-blue-950/20 dark:via-slate-900/40 border-b border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-blue-600 text-white shadow-sm">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <CardTitle className="text-lg font-black text-slate-900 dark:text-white">
                  Database Configuration (MongoDB Atlas)
                </CardTitle>
                <CardDescription className="text-xs">
                  Primary database for flight bookings, customer leads, landing page CMS, and call records.
                </CardDescription>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-black border ${
                config.mongodbUri
                  ? "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-400"
                  : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-400"
              }`}>
                {config.mongodbUri ? "MONGODB SET" : "NOT SET"}
              </span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-5">
          <div className="p-4 rounded-xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-800/40 text-xs text-blue-900 dark:text-blue-300 leading-relaxed">
            💡 <strong>Connection Tip:</strong> Paste your MongoDB Atlas URI below. Format: <code>mongodb+srv://username:password@cluster0.xxxx.mongodb.net/jetwithfly?retryWrites=true&w=majority</code>.
            Ensure you have added <strong>0.0.0.0/0</strong> (Allow access from anywhere) in MongoDB Atlas &gt; Network Access.
          </div>

          <div>
            <Label htmlFor="mongodbUri" className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
              <span>MongoDB Connection URI (MONGODB_URI)</span>
              <button
                type="button"
                onClick={() => setShowMongoUri(!showMongoUri)}
                className="text-xs text-blue-600 hover:underline flex items-center gap-1 font-bold"
              >
                {showMongoUri ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5 text-blue-600" />}
                <span>{showMongoUri ? "Hide String" : "Reveal String"}</span>
              </button>
            </Label>
            <div className="relative mt-1.5">
              <Input
                id="mongodbUri"
                type={showMongoUri ? "text" : "password"}
                value={config.mongodbUri}
                onChange={e => handleChange("mongodbUri", e.target.value)}
                placeholder="mongodb+srv://username:password@cluster0.mongodb.net/jetwithfly?retryWrites=true&w=majority"
                className="font-mono text-xs pr-10"
              />
            </div>

            {config.mongodbUri.includes("<") && config.mongodbUri.includes(">") && (
              <div className="mt-2.5 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-300 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>
                    <strong>Angle brackets <code>&lt; &gt;</code> detected!</strong> MongoDB Atlas placeholder brackets around your password (e.g. <code>&lt;password&gt;</code>) must be removed.
                  </span>
                </div>
                <Button
                  type="button"
                  size="sm"
                  onClick={() => {
                    const cleaned = config.mongodbUri.replace(/:<([^>]+)>@/, ":$1@").replace(/\/\/<([^>]+):/, "//$1:");
                    handleChange("mongodbUri", cleaned);
                    if (config.databaseUrl) {
                      handleChange("databaseUrl", config.databaseUrl.replace(/:<([^>]+)>@/, ":$1@").replace(/\/\/<([^>]+):/, "//$1:"));
                    }
                    toast({
                      title: "Cleaned MongoDB URI",
                      description: "Removed '<' and '>' brackets from your password.",
                    });
                  }}
                  className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shrink-0 self-start sm:self-auto h-7 px-3 rounded-lg"
                >
                  ⚡ Remove &lt; &gt; Automatically
                </Button>
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="databaseUrl" className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Database URL Alias (DATABASE_URL - Optional)
            </Label>
            <Input
              id="databaseUrl"
              type={showMongoUri ? "text" : "password"}
              value={config.databaseUrl}
              onChange={e => handleChange("databaseUrl", e.target.value)}
              placeholder="Defaults to same as MONGODB_URI"
              className="mt-1.5 font-mono text-xs"
            />
            <p className="text-[11px] text-slate-400 mt-1">If left blank, it will automatically mirror MONGODB_URI.</p>
          </div>

          {/* Test DB Connection Box */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <Database className="w-4 h-4 text-blue-600" />
                  Test MongoDB Connection
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Verifies database connectivity, cluster DNS resolution, and credentials.
                </p>
              </div>

              <Button
                type="button"
                onClick={handleTestDatabase}
                disabled={testingDb || !config.mongodbUri}
                variant="outline"
                className="font-bold border-blue-300 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950 shrink-0"
              >
                {testingDb ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <RefreshCw className="w-4 h-4 mr-2" />}
                <span>{testingDb ? "Testing Connection..." : "Test Connection Now"}</span>
              </Button>
            </div>

            {dbTestResult && (
              <div className={`mt-3 p-3.5 rounded-xl border text-xs font-medium ${
                dbTestResult.success
                  ? "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300"
                  : "bg-red-50 text-red-800 border-red-200 dark:bg-red-950/40 dark:text-red-300"
              }`}>
                <div className="flex items-start gap-2">
                  {dbTestResult.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <p className="font-bold">{dbTestResult.success ? "MongoDB Connected Successfully!" : "Connection Error"}</p>
                    <p className="mt-0.5 whitespace-pre-wrap">{dbTestResult.message}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ── SECTION 2: AUTHENTICATION & SECURITY (NEXTAUTH) ── */}
      <Card className="border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-indigo-50/50 via-slate-50 to-transparent dark:from-indigo-950/20 dark:via-slate-900/40 border-b border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-600 text-white shadow-sm">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-lg font-black text-slate-900 dark:text-white">
                Authentication & Session Security (NextAuth)
              </CardTitle>
              <CardDescription className="text-xs">
                Secret key for admin JWT encryption and canonical public URL for authentication redirects.
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <Label htmlFor="nextauthUrl" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Canonical Auth URL (NEXTAUTH_URL)
              </Label>
              <Input
                id="nextauthUrl"
                value={config.nextauthUrl}
                onChange={e => handleChange("nextauthUrl", e.target.value)}
                placeholder="https://jetwithfly.com or http://localhost:3000"
                className="mt-1.5 font-medium"
              />
              <p className="text-[11px] text-slate-400 mt-1">Production URL used to validate authentication redirects.</p>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <Label htmlFor="nextauthSecret" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  NextAuth Secret (NEXTAUTH_SECRET)
                </Label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleGenerateSecret}
                    className="text-xs text-indigo-600 hover:underline font-bold flex items-center gap-1"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Generate Secret</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowNextAuthSecret(!showNextAuthSecret)}
                    className="text-xs text-slate-500 hover:text-slate-700 font-bold ml-2"
                  >
                    {showNextAuthSecret ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
              <Input
                id="nextauthSecret"
                type={showNextAuthSecret ? "text" : "password"}
                value={config.nextauthSecret}
                onChange={e => handleChange("nextauthSecret", e.target.value)}
                placeholder="32+ character random secret string"
                className="mt-1.5 font-mono text-xs"
              />
              <p className="text-[11px] text-slate-400 mt-1">Used to encrypt session tokens. Keep strictly confidential.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── SECTION 3: SMTP EMAIL CONFIGURATION ── */}
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

            <div className="mt-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              <span className="font-bold text-slate-900 dark:text-white">💡 Webmail Quick Tip:</span> For <strong>Hostinger</strong> & <strong>GoDaddy</strong>, use your full domain email address (e.g. <code>support@jetwithfly.com</code>) as the username and your standard mailbox password. Port 465 requires SSL to be checked.
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <Label htmlFor="emailHost" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                SMTP Host Server (EMAIL_HOST)
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
                SMTP Port (EMAIL_PORT)
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
                SSL Security (EMAIL_SECURE)
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
                  placeholder="Enter 16-character Gmail App Password or Mailbox Password"
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
                Admin Notification Email (EMAIL_BOOKINGS_TO)
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

      {/* ── SECTION 4: GOOGLE TAG (GTAG) & TRACKING ── */}
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

      {/* ── SECTION 5: TOLL-FREE PHONE & BRAND IDENTITY ── */}
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
                placeholder="+1 855 510 6415"
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

      {/* ── SECTION 6: FLIGHT SEARCH ENGINE & INTEGRATIONS ── */}
      <Card className="border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-purple-50/50 via-slate-50 to-transparent dark:from-purple-950/20 dark:via-slate-900/40 border-b border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-600 text-white shadow-sm">
              <Plane className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-lg font-black text-slate-900 dark:text-white">
                Flight Search Engine & External Integrations
              </CardTitle>
              <CardDescription className="text-xs">
                Duffel live flight search access token, Amadeus credentials, Google Sheets, Upstash Redis, and Twilio.
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
                className="mt-1.5 font-mono text-xs"
              />
              <p className="text-[11px] text-slate-400 mt-1">Get your live or test token from duffel.com</p>
            </div>

            <div>
              <Label htmlFor="googleSheetsId" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Google Sheets ID (GOOGLE_SHEETS_ID - Optional)
              </Label>
              <Input
                id="googleSheetsId"
                value={config.googleSheetsId}
                onChange={e => handleChange("googleSheetsId", e.target.value)}
                placeholder="1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms"
                className="mt-1.5 font-mono text-xs"
              />
              <p className="text-[11px] text-slate-400 mt-1">Logs all bookings automatically to a Google Sheet.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-3 border-t border-slate-100 dark:border-slate-800">
            <div>
              <Label htmlFor="amadeusClientId" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Amadeus Client ID (AMADEUS_CLIENT_ID - Optional)
              </Label>
              <Input
                id="amadeusClientId"
                value={config.amadeusClientId}
                onChange={e => handleChange("amadeusClientId", e.target.value)}
                placeholder="Amadeus API Key"
                className="mt-1.5 font-mono text-xs"
              />
            </div>

            <div>
              <Label htmlFor="amadeusClientSecret" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Amadeus Client Secret (AMADEUS_CLIENT_SECRET - Optional)
              </Label>
              <Input
                id="amadeusClientSecret"
                type="password"
                value={config.amadeusClientSecret}
                onChange={e => handleChange("amadeusClientSecret", e.target.value)}
                placeholder="Amadeus API Secret"
                className="mt-1.5 font-mono text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-3 border-t border-slate-100 dark:border-slate-800">
            <div>
              <Label htmlFor="upstashRedisUrl" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Upstash Redis URL (Optional)
              </Label>
              <Input
                id="upstashRedisUrl"
                value={config.upstashRedisUrl}
                onChange={e => handleChange("upstashRedisUrl", e.target.value)}
                placeholder="https://...upstash.io"
                className="mt-1.5 font-mono text-xs"
              />
            </div>

            <div>
              <Label htmlFor="twilioAccountSid" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Twilio Account SID (Optional)
              </Label>
              <Input
                id="twilioAccountSid"
                value={config.twilioAccountSid}
                onChange={e => handleChange("twilioAccountSid", e.target.value)}
                placeholder="AC..."
                className="mt-1.5 font-mono text-xs"
              />
            </div>

            <div>
              <Label htmlFor="whatsappSenderNumber" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                WhatsApp Sender Number (Optional)
              </Label>
              <Input
                id="whatsappSenderNumber"
                value={config.whatsappSenderNumber}
                onChange={e => handleChange("whatsappSenderNumber", e.target.value)}
                placeholder="+14155238886"
                className="mt-1.5 font-mono text-xs"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── SECTION 7: DYNAMIC CUSTOM ENVIRONMENT VARIABLES ── */}
      <Card className="border-blue-200 dark:border-blue-900/60 shadow-sm overflow-hidden bg-gradient-to-b from-white to-blue-50/20 dark:from-slate-900 dark:to-blue-950/10">
        <CardHeader className="bg-gradient-to-r from-blue-100/60 via-indigo-50/40 to-transparent dark:from-blue-950/40 dark:via-slate-900/60 border-b border-blue-200/60 dark:border-blue-900/40">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-blue-600 text-white shadow-sm">
                <Key className="w-5 h-5" />
              </div>
              <div>
                <CardTitle className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <span>Custom Environment Variables</span>
                  <span className="px-2 py-0.5 rounded-full text-xs font-extrabold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                    {customVariables.length} custom
                  </span>
                </CardTitle>
                <CardDescription className="text-xs">
                  Add, edit, or delete any new dynamic environment variable. Variables are written to .env, loaded into process.env, and synced to MongoDB.
                </CardDescription>
              </div>
            </div>

            <Button
              type="button"
              onClick={handleAddCustomVar}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 rounded-xl px-4 py-2 self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Add Variable</span>
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-4">
          <div className="p-3.5 rounded-xl bg-blue-50/80 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 text-xs text-blue-900 dark:text-blue-300 flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Dynamic Variable Rules:</p>
              <p className="mt-0.5">
                Variable keys are automatically converted to uppercase alphanumeric format (e.g., <code>STRIPE_API_KEY</code>, <code>CRM_WEBHOOK_URL</code>).
                When saved, they are immediately accessible in your application code via <code>process.env[KEY]</code>.
              </p>
            </div>
          </div>

          {customVariables.length === 0 ? (
            <div className="text-center py-10 px-4 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
              <Key className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
              <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">No Custom Variables Yet</h4>
              <p className="text-xs text-slate-400 max-w-md mx-auto mt-1 mb-4">
                Need to add a custom API key, webhook secret, or feature flag? Click &quot;Add Variable&quot; to create dynamic environment variables.
              </p>
              <Button
                type="button"
                onClick={handleAddCustomVar}
                variant="outline"
                className="text-xs font-bold border-blue-300 text-blue-600 hover:bg-blue-50"
              >
                <Plus className="w-4 h-4 mr-1.5" />
                <span>Add Your First Custom Variable</span>
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="hidden sm:grid grid-cols-12 gap-3 px-3 text-[11px] font-black uppercase tracking-wider text-slate-400">
                <div className="col-span-5">Variable Key (KEY)</div>
                <div className="col-span-6">Value (VALUE)</div>
                <div className="col-span-1 text-right">Action</div>
              </div>

              {customVariables.map((cv, idx) => (
                <div
                  key={idx}
                  className="flex flex-col sm:grid sm:grid-cols-12 gap-2 sm:gap-3 p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm items-center"
                >
                  <div className="w-full sm:col-span-5">
                    <Label className="sm:hidden text-[10px] font-bold uppercase text-slate-400 mb-1 block">
                      Variable Key
                    </Label>
                    <Input
                      value={cv.key}
                      onChange={e => handleUpdateCustomVar(idx, "key", e.target.value)}
                      placeholder="e.g. STRIPE_SECRET_KEY"
                      className="font-mono text-xs uppercase font-bold"
                    />
                  </div>

                  <div className="w-full sm:col-span-6">
                    <Label className="sm:hidden text-[10px] font-bold uppercase text-slate-400 mb-1 block">
                      Value
                    </Label>
                    <Input
                      value={cv.value}
                      onChange={e => handleUpdateCustomVar(idx, "value", e.target.value)}
                      placeholder="e.g. sk_live_51M..."
                      className="font-mono text-xs"
                    />
                  </div>

                  <div className="w-full sm:col-span-1 flex justify-end">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveCustomVar(idx)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/50 p-2 h-9 w-9 rounded-lg"
                      title="Delete variable"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}

              <div className="pt-2 flex justify-start">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddCustomVar}
                  className="text-xs font-bold border-dashed border-blue-300 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40"
                >
                  <Plus className="w-3.5 h-3.5 mr-1.5" />
                  <span>Add Another Variable</span>
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── SECTION 8: FULL .ENV FILE RAW PREVIEW ── */}
      <Card className="border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <CardHeader
          className="cursor-pointer bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800"
          onClick={() => setShowRawEnv(!showRawEnv)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <CardTitle className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <span>View Compiled .env File</span>
                  <span className="text-xs font-medium text-slate-400">
                    (Click to {showRawEnv ? "collapse" : "expand"})
                  </span>
                </CardTitle>
                <CardDescription className="text-xs">
                  Inspect the formatted environment file ready to copy for production deployments.
                </CardDescription>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCopyEnv();
                }}
                className="text-xs font-bold"
              >
                {copiedEnv ? <Check className="w-3.5 h-3.5 text-emerald-600 mr-1" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
                <span>{copiedEnv ? "Copied" : "Copy Raw"}</span>
              </Button>
              {showRawEnv ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
            </div>
          </div>
        </CardHeader>

        {showRawEnv && (
          <CardContent className="p-4 bg-slate-950 text-slate-200 font-mono text-xs overflow-x-auto">
            <pre className="whitespace-pre p-2 leading-relaxed text-slate-300 selection:bg-blue-600 selection:text-white">
              {generateRawEnv()}
            </pre>
          </CardContent>
        )}
      </Card>

      {/* ── STICKY BOTTOM SAVE BAR ── */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl sticky bottom-4 z-20">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            Changes are saved to .env file on disk, synced to database CMSConfig, and applied immediately.
          </span>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button
            type="button"
            variant="outline"
            onClick={handleCopyEnv}
            className="text-xs font-bold border-slate-300 dark:border-slate-700 flex-1 sm:flex-none"
          >
            {copiedEnv ? <Check className="w-4 h-4 text-emerald-600 mr-1.5" /> : <Copy className="w-4 h-4 mr-1.5" />}
            <span>{copiedEnv ? "Copied" : "Copy .env"}</span>
          </Button>

          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center justify-center gap-2 px-8 py-2.5 rounded-xl shadow-md flex-1 sm:flex-none"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{saving ? "Saving..." : "Save All Configuration"}</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
