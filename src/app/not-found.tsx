"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import { Plane, Home, Search, ArrowLeft, Compass, MapPin } from "lucide-react";

export default function NotFound() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Particle / star field canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Stars
    const stars = Array.from({ length: 180 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.5 + 0.2,
      speed: Math.random() * 0.3 + 0.05,
      opacity: Math.random(),
      twinkleSpeed: Math.random() * 0.02 + 0.005,
    }));

    // Floating particles
    const particles = Array.from({ length: 30 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      r: Math.random() * 2 + 1,
      color: Math.random() > 0.5 ? "#3b82f6" : "#8b5cf6",
      opacity: Math.random() * 0.5 + 0.1,
    }));

    let tick = 0;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      tick += 0.01;

      // Gradient background
      const bg = ctx.createRadialGradient(
        canvas.width / 2,
        canvas.height / 2,
        0,
        canvas.width / 2,
        canvas.height / 2,
        Math.max(canvas.width, canvas.height)
      );
      bg.addColorStop(0, "#0a0f1e");
      bg.addColorStop(0.5, "#060a14");
      bg.addColorStop(1, "#020408");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Stars
      stars.forEach((s) => {
        s.opacity += s.twinkleSpeed * (Math.sin(tick + s.x) > 0 ? 1 : -1);
        s.opacity = Math.max(0.05, Math.min(1, s.opacity));
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${s.opacity})`;
        ctx.fill();
      });

      // Particles
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color + Math.floor(p.opacity * 255).toString(16).padStart(2, "0");
        ctx.fill();
      });

      // Grid lines (subtle)
      ctx.strokeStyle = "rgba(59,130,246,0.04)";
      ctx.lineWidth = 1;
      const gridSize = 80;
      for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden flex flex-col items-center justify-center">
      {/* Animated canvas background */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      {/* Glow orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: "4s" }} />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-violet-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: "6s" }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-900/5 rounded-full blur-3xl" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center px-4 max-w-2xl mx-auto">

        {/* Brand badge */}
        <div className="flex items-center gap-2 mb-8 bg-white/95 backdrop-blur-md px-4 py-2 rounded-full shadow-lg">
          <span className="font-black text-sm text-slate-900 tracking-tight">JetWithFly Flights</span>
        </div>

        {/* 404 Giant Number */}
        <div className="relative mb-6 select-none">
          {/* Shadow/glow layer */}
          <div
            className="absolute inset-0 flex items-center justify-center text-[180px] md:text-[240px] font-black text-blue-500/10 blur-2xl"
            aria-hidden
          >
            404
          </div>
          {/* Main number */}
          <h1
            className="text-[140px] md:text-[200px] font-black leading-none tracking-tighter"
            style={{
              background: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 40%, #06b6d4 80%, #3b82f6 100%)",
              backgroundSize: "200% 200%",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              animation: "gradientShift 4s ease infinite",
            }}
          >
            404
          </h1>
        </div>

        {/* Plane divider animation */}
        <div className="relative w-full h-16 mb-4 overflow-hidden flex items-center">
          <div className="h-px w-full bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
          <div
            className="absolute"
            style={{
              animation: "planeFly 5s ease-in-out infinite",
              top: "50%",
              transform: "translateY(-50%)",
            }}
          >
            <div className="relative">
              <Plane className="w-8 h-8 text-blue-400 drop-shadow-[0_0_12px_rgba(59,130,246,0.8)]" />
              {/* Contrail */}
              <div
                className="absolute top-1/2 -translate-y-1/2 right-full mr-1 h-0.5 w-24 opacity-50"
                style={{
                  background: "linear-gradient(to left, rgba(59,130,246,0.8), transparent)",
                }}
              />
            </div>
          </div>
        </div>

        {/* Text content */}
        <div className="space-y-3 mb-8">
          <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">
            Flight Not Found
          </h2>
          <p className="text-slate-400 text-base md:text-lg leading-relaxed max-w-md">
            Looks like this page got lost in the clouds. The route you're searching for doesn't exist or has been rerouted.
          </p>
        </div>

        {/* Radar / status card */}
        <div className="w-full max-w-sm bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-5 mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
              <Compass className="w-4 h-4 text-blue-400 animate-spin" style={{ animationDuration: "8s" }} />
            </div>
            <span className="text-sm font-bold text-slate-300">Navigation Status</span>
          </div>
          <div className="space-y-2.5">
            {[
              { label: "Flight Path", value: "UNKNOWN", status: "error" },
              { label: "Destination", value: "NOT FOUND", status: "error" },
              { label: "Radar Signal", value: "SEARCHING…", status: "loading" },
              { label: "Alternative Routes", value: "3 AVAILABLE", status: "ok" },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">{item.label}</span>
                <span
                  className={`font-black tracking-wider flex items-center gap-1.5 ${
                    item.status === "error"
                      ? "text-red-400"
                      : item.status === "loading"
                      ? "text-amber-400"
                      : "text-emerald-400"
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      item.status === "error"
                        ? "bg-red-400"
                        : item.status === "loading"
                        ? "bg-amber-400 animate-pulse"
                        : "bg-emerald-400"
                    }`}
                  />
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm">
          <Link
            href="/"
            className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white font-bold py-3.5 px-6 rounded-2xl transition-all duration-300 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-0.5 text-sm"
          >
            <Home className="w-4 h-4" />
            Back to Home
          </Link>
          <Link
            href="/search"
            className="flex-1 flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white font-bold py-3.5 px-6 rounded-2xl transition-all duration-300 hover:-translate-y-0.5 text-sm backdrop-blur-sm"
          >
            <Search className="w-4 h-4 text-blue-400" />
            Search Flights
          </Link>
        </div>

        {/* Quick links */}
        <div className="mt-8 flex flex-wrap gap-2 justify-center">
          {[
            { label: "Home", href: "/" },
            { label: "Flight Search", href: "/search" },
            { label: "About Us", href: "/about" },
            { label: "Contact", href: "/contact" },
            { label: "Blog", href: "/blog" },
          ].map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-xs text-slate-500 hover:text-blue-400 transition-colors px-3 py-1.5 rounded-lg hover:bg-white/5 border border-transparent hover:border-white/10"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Error code */}
        <p className="mt-8 text-[10px] text-slate-700 font-mono tracking-widest">
          ERROR_CODE: PAGE_NOT_FOUND • HTTP_STATUS: 404 • JETWITHFLY_NAVIGATION_ENGINE
        </p>
      </div>

      {/* CSS animations */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes planeFly {
          0% { left: -40px; }
          100% { left: calc(100% + 40px); }
        }
      `}} />
    </div>
  );
}
