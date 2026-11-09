"use client";

import React from "react";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export function SignOutButton() {
  return (
    <Button
      variant="ghost"
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="w-full flex items-center justify-start gap-3 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl px-4 py-3 h-auto font-semibold text-sm transition-all"
    >
      <LogOut className="w-5 h-5 text-slate-400 group-hover:text-red-400" />
      Log Out
    </Button>
  );
}
