"use client";

import React from "react";
import Link from "next/link";
import { Plane, Phone } from "lucide-react";

export interface BoardingPassCardProps {
  title: string;
  slug: string;
  originCode: string;
  originName: string;
  destCode: string;
  destName: string;
  seat: string;
  gate: string;
  priceOff: string;
  callPhone?: string;
  isStatic?: boolean;
  /** Background color of the hole cutouts (match parent bg) */
  holeBg?: string;
}

export function BoardingPassCard({
  title,
  slug,
  originCode,
  originName,
  destCode,
  destName,
  seat,
  gate,
  priceOff,
  callPhone = "+18882566747",
  isStatic = false,
  holeBg = "#f5f7fa",
}: BoardingPassCardProps) {
  return (
    <div
      className="relative bg-slate-900 text-white rounded-3xl border border-slate-800 flex flex-col md:flex-row shadow-xl hover:border-blue-500/30 hover:shadow-blue-500/5 group transition-all duration-300 overflow-hidden"
    >
      {/* Left & Right Ticket Half-Circle Holes */}
      <div className="absolute top-[75%] md:top-1/2 -left-3 w-6 h-6 rounded-full border border-slate-800 z-10 -translate-y-1/2" style={{ background: holeBg }} />
      <div className="absolute top-[75%] md:top-1/2 -right-3 w-6 h-6 rounded-full border border-slate-800 z-10 -translate-y-1/2" style={{ background: holeBg }} />

      {/* Main Ticket Area (Left) */}
      <div className="flex-1 p-6 flex flex-col justify-between space-y-4">
        {/* Header */}
        <div className="flex justify-between items-center pb-2 border-b border-slate-800">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-bold uppercase tracking-widest">
            <Plane className="w-3.5 h-3.5 text-blue-500" />
            <span>JetWithFly VIP Pass</span>
          </div>
          <span className="text-[9px] font-black text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded">
            VIP HOLD
          </span>
        </div>

        {/* Path Codes */}
        <div className="flex justify-between items-center py-2">
          <div>
            <p className="text-2xl font-black tracking-tight">{originCode}</p>
            <p className="text-[10px] text-slate-400 font-semibold">{originName}</p>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center px-4 relative">
            <Plane className="w-3.5 h-3.5 text-blue-500/40 rotate-90" />
            <div className="w-full border-t border-dashed border-slate-800" />
          </div>
          <div className="text-right">
            <p className="text-2xl font-black text-blue-400 tracking-tight">{destCode}</p>
            <p className="text-[10px] text-slate-400 font-semibold">{destName}</p>
          </div>
        </div>

        {/* Info details */}
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800 text-[10px] text-slate-400 font-semibold">
          <div>
            <p className="uppercase text-[8px] text-slate-500">Seat</p>
            <p className="font-extrabold text-white">{seat}</p>
          </div>
          <div>
            <p className="uppercase text-[8px] text-slate-500">Gate</p>
            <p className="font-extrabold text-white">{gate}</p>
          </div>
          <div>
            <p className="uppercase text-[8px] text-slate-500">Contract Rate</p>
            <p className="font-extrabold text-green-400">{priceOff}</p>
          </div>
        </div>
      </div>

      {/* Vertical Dashed Line for Desktop */}
      <div className="hidden md:block w-[1px] border-r border-dashed border-slate-800 relative">
        <div className="absolute -top-3.5 -left-3 w-6 h-6 rounded-full border border-slate-800" style={{ background: holeBg }} />
        <div className="absolute -bottom-3.5 -left-3 w-6 h-6 rounded-full border border-slate-800" style={{ background: holeBg }} />
      </div>

      {/* Horizontal Dashed Line for Mobile */}
      <div className="md:hidden border-t border-dashed border-slate-800 w-full relative h-[1px]">
        <div className="absolute -left-3.5 -top-3 w-6 h-6 rounded-full border border-slate-800" style={{ background: holeBg }} />
        <div className="absolute -right-3.5 -top-3 w-6 h-6 rounded-full border border-slate-800" style={{ background: holeBg }} />
      </div>

      {/* Ticket Stub (Right) */}
      <div className="w-full md:w-[210px] bg-slate-900/40 p-6 flex flex-col justify-between items-stretch border-t md:border-t-0 border-slate-800 md:pl-8">
        <div className="space-y-1 text-center md:text-left mb-4">
          <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Ticket Stub</p>
          <p className="text-sm font-black text-white truncate">{title}</p>
        </div>

        <div className="space-y-4">
          {/* CSS Barcode representation */}
          <div className="bg-white rounded-lg p-2 flex flex-col items-center gap-1 opacity-80 shadow-md">
            <div className="w-full h-7 flex items-center justify-between overflow-hidden px-1">
              {Array.from({ length: 20 }).map((_, b) => {
                const widths = [1, 2, 3];
                const width = widths[b % widths.length];
                const isBlack = (b * 5) % 3 !== 0;
                return (
                  <div
                    key={b}
                    className="h-full bg-slate-950"
                    style={{
                      width: `${width}px`,
                      opacity: isBlack ? 1 : 0
                    }}
                  />
                );
              })}
            </div>
          </div>

          {/* Dynamic Action Button */}
          {isStatic ? (
            <a
              href={`tel:${callPhone}`}
              className="w-full inline-flex items-center justify-center bg-green-500 hover:bg-green-600 active:scale-95 text-white font-extrabold text-xs py-3 px-4 rounded-xl shadow-md transition-all uppercase tracking-wider gap-1.5"
            >
              <Phone className="w-3.5 h-3.5 fill-white" />
              Book Now
            </a>
          ) : (
            <Link
              href={`/lp/${slug}`}
              className="w-full inline-flex items-center justify-center bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-extrabold text-xs py-3 px-4 rounded-xl shadow-md transition-all uppercase tracking-wider"
            >
              Claim Stub ➔
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
