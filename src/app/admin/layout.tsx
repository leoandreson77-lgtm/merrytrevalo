import React from "react";
import type { Metadata } from "next";
import { getServerSession } from "next-auth";

export const metadata: Metadata = {
  title: "Admin Console",
  robots: { index: false, follow: false },
};
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth-options";
import Link from "next/link";
import {
  Plane,
  LayoutDashboard,
  Users,
  PhoneCall,
  MessageSquare,
  FileText,
  MousePointerClick,
  Images,
  BookOpen,
  BarChart3,
  Settings,
  KeyRound,
  ShieldAlert,
  Sliders,
} from "lucide-react";
import { SignOutButton } from "@/components/signout-button";
import { AdminThemeProvider } from "@/components/admin-theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const role = (session.user as any).role;
  if (role !== "admin" && role !== "agent") {
    redirect("/");
  }

  const navItems = [
    { label: "Dashboard",       href: "/admin",                icon: LayoutDashboard },
    { label: "⚙️ Env & Integrations", href: "/admin/env",      icon: Sliders, highlight: true },
    { label: "🔑 Change Password", href: "/admin/settings",    icon: KeyRound },
    { label: "CRM Leads",       href: "/admin/leads",          icon: Users },
    { label: "Vendors",         href: "/admin/vendors",        icon: Settings },
    { label: "Call Tracking",   href: "/admin/telephony",      icon: PhoneCall },
    { label: "WhatsApp CRM",    href: "/admin/whatsapp",       icon: MessageSquare },
    { label: "CMS Settings",    href: "/admin/cms",            icon: FileText },
    { label: "Landing Pages",   href: "/admin/landing-pages",  icon: MousePointerClick },
    { label: "Form Builder",    href: "/admin/forms",          icon: FileText },
    { label: "Media Library",   href: "/admin/media",          icon: Images },
    { label: "Blog CMS",        href: "/admin/blog",           icon: BookOpen },
    { label: "Reports",         href: "/admin/reports",        icon: BarChart3 },
  ];

  return (
    <AdminThemeProvider>
      <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">

        {/* ── Sidebar ── */}
        <aside className="
          w-64 border-r flex flex-col fixed inset-y-0 left-0 z-20
          bg-white dark:bg-slate-900/90 dark:backdrop-blur-md
          border-slate-200 dark:border-slate-800/80
          transition-colors duration-300
        ">
          {/* Logo strip */}
          <div className="
            h-16 flex items-center gap-2 px-6 border-b
            bg-white/80 dark:bg-slate-900/50
            border-slate-200 dark:border-slate-800
            backdrop-blur-sm
          ">
            <div className="flex items-center gap-2">
              <span className="font-black text-base text-slate-900 dark:text-white">JetWithFly</span>
            </div>
            <span className="font-black text-xs px-2 py-0.5 rounded bg-blue-500/10 text-blue-500 border border-blue-500/20">
              ADMIN
            </span>
          </div>

          {/* Nav links */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold
                  transition-all group ${
                    (item as any).highlight
                      ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 hover:bg-amber-500/20"
                      : "text-slate-600 dark:text-slate-350 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-slate-800/60"
                  }
                `}
              >
                <item.icon className={`
                  w-4.5 h-4.5 shrink-0 ${
                    (item as any).highlight
                      ? "text-amber-500"
                      : "text-slate-400 dark:text-slate-500 group-hover:text-blue-600 dark:group-hover:text-blue-400"
                  }
                `} />
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Bottom user strip */}
          <div className="
            p-3 border-t flex flex-col gap-2
            bg-white/60 dark:bg-slate-900/40
            border-slate-200 dark:border-slate-800
          ">
            <div className="px-3 py-2 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Logged in as</p>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate mt-0.5 max-w-[130px]">
                  {session.user?.name}
                </p>
              </div>
              <Link
                href="/admin/settings"
                title="Change Password & Security Settings"
                className="p-2 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 border border-amber-500/20 transition-all flex items-center gap-1 text-xs font-bold"
              >
                <KeyRound className="w-4 h-4" />
              </Link>
            </div>
            <SignOutButton />
          </div>
        </aside>

        {/* ── Main area ── */}
        <main className="flex-1 pl-64 min-h-screen flex flex-col">

          {/* Sticky top header */}
          <header className="
            h-16 border-b flex items-center justify-between px-8 sticky top-0 z-10
            bg-white/80 dark:bg-slate-950/40
            border-slate-200 dark:border-slate-800/60
            backdrop-blur-md
            transition-colors duration-300
          ">
            <div className="flex items-center gap-3">
              <h2 className="font-extrabold text-xl tracking-tight text-slate-900 dark:text-white">
                Management Console
              </h2>
            </div>

            <div className="flex items-center gap-3">
              {/* Direct Change Password & Logout Devices Button */}
              <Link
                href="/admin/settings"
                className="
                  flex items-center gap-2 px-3.5 py-1.5 rounded-xl border text-xs font-extrabold
                  bg-amber-50 dark:bg-amber-500/10
                  border-amber-300 dark:border-amber-500/30
                  text-amber-700 dark:text-amber-400
                  hover:bg-amber-100 dark:hover:bg-amber-500/20 transition-all shadow-sm
                "
              >
                <KeyRound className="w-3.5 h-3.5 text-amber-500" />
                Change Password / Logout All
              </Link>

              {/* Live indicator */}
              <div className="
                flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold
                bg-emerald-50 dark:bg-emerald-500/10
                border-emerald-200 dark:border-emerald-500/20
                text-emerald-700 dark:text-emerald-450
              ">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                System Live
              </div>

              {/* Theme toggle */}
              <ThemeToggle />
            </div>
          </header>

          {/* Page content */}
          <div className="flex-1 p-6 md:p-8 overflow-y-auto bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
            {children}
          </div>
        </main>
      </div>
    </AdminThemeProvider>
  );
}
