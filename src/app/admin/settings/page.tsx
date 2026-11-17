"use client";

import React, { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { Lock, KeyRound, ShieldCheck, Eye, EyeOff, CheckCircle2, AlertCircle, Loader2, User, LogOut, Laptop, Smartphone, Sliders } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

export default function AdminSettingsPage() {
  const { data: session } = useSession();
  const { toast } = useToast();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoggingOutAll, setIsLoggingOutAll] = useState(false);

  const isLengthValid = newPassword.length >= 6;
  const isMatch = newPassword.length > 0 && newPassword === confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentPassword) {
      toast({ title: "Validation Error", description: "Please enter your current password.", variant: "destructive" });
      return;
    }

    if (!isLengthValid) {
      toast({ title: "Validation Error", description: "New password must be at least 6 characters long.", variant: "destructive" });
      return;
    }

    if (!isMatch) {
      toast({ title: "Validation Error", description: "New passwords do not match.", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/admin/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword,
          newPassword,
          confirmPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to update password");
      }

      toast({
        title: "🔑 Password Changed Successfully",
        description: "Your password has been updated and all other device sessions have been invalidated.",
      });

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      toast({
        title: "Error Changing Password",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogoutAllDevices = async () => {
    if (!confirm("Are you sure you want to log out from ALL active devices? All active browser sessions will be invalidated immediately.")) {
      return;
    }

    setIsLoggingOutAll(true);

    try {
      const res = await fetch("/api/admin/logout-all-devices", {
        method: "POST",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to invalidate sessions");
      }

      toast({
        title: "🚨 Logged Out All Devices",
        description: "All active sessions have been invalidated. Signing out...",
      });

      setTimeout(() => {
        signOut({ callbackUrl: "/login" });
      }, 1000);
    } catch (err: any) {
      toast({
        title: "Logout Error",
        description: err.message,
        variant: "destructive",
      });
      setIsLoggingOutAll(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
          <KeyRound className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          Admin Security & Change Password
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Manage your service credentials, change password, and revoke access across all devices.
        </p>
      </div>

      {/* Quick link banner to Env Configuration */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border border-blue-200 dark:border-blue-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-blue-600 text-white shadow-sm">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-black text-slate-900 dark:text-white">
              Looking to configure SMTP Email, Google Tag, or API keys?
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Manage Gmail App Passwords, payment gateway keys, and phone numbers in Environment Settings.
            </p>
          </div>
        </div>
        <a
          href="/admin/env"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/20 shrink-0 transition-all"
        >
          Open Env & Integrations →
        </a>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Account Profile & Multi-Device Control */}
        <div className="space-y-6 lg:col-span-1">
          {/* User Account Info Card */}
          <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-md">
            <CardHeader className="border-b border-slate-200 dark:border-slate-800 pb-4">
              <CardTitle className="text-base font-bold flex items-center gap-2 text-slate-900 dark:text-white">
                <User className="w-4 h-4 text-blue-600" />
                Active Admin Session
              </CardTitle>
              <CardDescription className="text-xs">Logged-in service account details</CardDescription>
            </CardHeader>
            <CardContent className="pt-5 space-y-4 text-xs font-semibold">
              <div>
                <p className="text-slate-400 uppercase tracking-wider font-bold text-[10px]">Admin Name</p>
                <p className="text-sm font-extrabold text-slate-800 dark:text-slate-200 mt-0.5">
                  {session?.user?.name || "System Admin"}
                </p>
              </div>
              <div>
                <p className="text-slate-400 uppercase tracking-wider font-bold text-[10px]">Service Email</p>
                <p className="text-sm font-bold text-blue-600 dark:text-blue-400 truncate mt-0.5">
                  {session?.user?.email || "admin@merrytravelo.com"}
                </p>
              </div>
              <div>
                <p className="text-slate-400 uppercase tracking-wider font-bold text-[10px]">System Access Role</p>
                <span className="inline-block mt-1 text-[11px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-3 py-1 rounded-full border border-emerald-500/20">
                  {(session?.user as any)?.role || "Administrator"}
                </span>
              </div>
              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                256-Bit PBKDF2 Password Encrypted
              </div>
            </CardContent>
          </Card>

          {/* 🚨 LOGOUT ALL DEVICES CARD */}
          <Card className="border-2 border-red-500/40 bg-red-950/10 dark:bg-red-950/20 shadow-md">
            <CardHeader className="border-b border-red-500/20 pb-3">
              <CardTitle className="text-sm font-extrabold text-red-600 dark:text-red-400 uppercase tracking-wider flex items-center gap-2">
                <LogOut className="w-4 h-4" />
                Multi-Device Security
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-4 text-xs">
              <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300 font-semibold">
                <div className="flex items-center gap-1 text-slate-400">
                  <Laptop className="w-4 h-4" />
                  <Smartphone className="w-4 h-4" />
                </div>
                <span>Revoke active logins on all mobile & desktop browsers.</span>
              </div>
              <Button
                variant="destructive"
                disabled={isLoggingOutAll}
                onClick={handleLogoutAllDevices}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-extrabold py-2.5 rounded-xl shadow-lg shadow-red-600/30 text-xs flex items-center justify-center gap-2 mt-2"
              >
                {isLoggingOutAll ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Invalidating All Sessions...
                  </>
                ) : (
                  <>
                    <LogOut className="w-4 h-4" />
                    Log Out All Active Devices
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Change Password Form */}
        <Card className="lg:col-span-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-md">
          <CardHeader className="border-b border-slate-200 dark:border-slate-800 pb-4">
            <CardTitle className="text-lg font-black flex items-center gap-2 text-slate-900 dark:text-white">
              <Lock className="w-5 h-5 text-blue-600" />
              Change Admin Password
            </CardTitle>
            <CardDescription className="text-xs">
              Enter your current password and set a new secure password for your admin account.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Current Password */}
              <div className="space-y-1.5">
                <Label htmlFor="currentPassword" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Current Password *
                </Label>
                <div className="relative">
                  <Input
                    id="currentPassword"
                    type={showCurrent ? "text" : "password"}
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter existing admin password"
                    className="pr-10 bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 font-semibold"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrent(!showCurrent)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="newPassword" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    New Password *
                  </Label>
                  {newPassword.length > 0 && (
                    <span className={`text-[11px] font-extrabold flex items-center gap-1 ${isLengthValid ? "text-emerald-500" : "text-amber-500"}`}>
                      {isLengthValid ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                      {isLengthValid ? "Strong Password" : "Min 6 characters required"}
                    </span>
                  )}
                </div>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showNew ? "text" : "password"}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new strong password"
                    className="pr-10 bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 font-semibold"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm New Password */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="confirmPassword" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Confirm New Password *
                  </Label>
                  {confirmPassword.length > 0 && (
                    <span className={`text-[11px] font-extrabold flex items-center gap-1 ${isMatch ? "text-emerald-500" : "text-red-500"}`}>
                      {isMatch ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                      {isMatch ? "Passwords Match" : "Passwords Do Not Match"}
                    </span>
                  )}
                </div>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirm ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password to confirm"
                    className="pr-10 bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 font-semibold"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isSubmitting || !isLengthValid || !isMatch}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold py-3 rounded-xl shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Updating Password...
                  </>
                ) : (
                  <>
                    <KeyRound className="w-4 h-4" />
                    Change Admin Password
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
