"use client";

import { Sun, Moon } from "lucide-react";
import { useAdminTheme } from "./admin-theme-provider";

export function ThemeToggle() {
  const { isDark, toggle, theme } = useAdminTheme();

  return (
    <button
      id="admin-theme-toggle"
      onClick={toggle}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      title={`Switch to ${isDark ? "light" : "dark"} mode`}
      className={`
        relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold
        transition-all duration-300 overflow-hidden group
        ${isDark
          ? "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white"
          : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 shadow-sm"
        }
      `}
    >
      {/* Sliding pill background */}
      <span
        className={`
          absolute inset-0 rounded-xl transition-transform duration-300 ease-spring
          ${isDark
            ? "bg-gradient-to-r from-violet-600/10 to-blue-600/10"
            : "bg-gradient-to-r from-amber-100/60 to-orange-100/60"
          }
        `}
      />

      {/* Icons with cross-fade */}
      <span className="relative flex items-center gap-1.5">
        {isDark ? (
          <>
            <Sun className="w-3.5 h-3.5 text-amber-400 transition-all duration-300" />
            <span className="hidden sm:inline">Light</span>
          </>
        ) : (
          <>
            <Moon className="w-3.5 h-3.5 text-violet-500 transition-all duration-300" />
            <span className="hidden sm:inline">Dark</span>
          </>
        )}
      </span>
    </button>
  );
}
