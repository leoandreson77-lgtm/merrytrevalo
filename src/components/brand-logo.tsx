import Link from "next/link";
import { Plane } from "lucide-react";

export function BrandLogo({
  variant = "dark",
  showSubtitle = true,
  className = "",
}: {
  variant?: "dark" | "light";
  showSubtitle?: boolean;
  className?: string;
}) {
  const isLight = variant === "light";
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black shadow-md shadow-blue-600/30 flex-shrink-0">
        <Plane className="w-5 h-5 -rotate-45" />
      </div>
      <div className="flex flex-col">
        <span
          className={`font-black text-lg sm:text-xl tracking-tight leading-none ${
            isLight ? "text-white" : "text-slate-900"
          }`}
        >
          JetWithFly<span className="text-blue-600">.</span>
        </span>
        {showSubtitle && (
          <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase mt-0.5">
            Flights & Travel
          </span>
        )}
      </div>
    </div>
  );
}

