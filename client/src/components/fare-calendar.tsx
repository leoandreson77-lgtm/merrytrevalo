import { useState, useEffect, useCallback } from "react";
import { DayPicker } from "react-day-picker";
import type { DayContentProps } from "react-day-picker";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

// ── helpers ──────────────────────────────────────────────────────────────────

function extractCode(text: string): string {
  const v = String(text || "").trim();
  const m = v.match(/\(([A-Za-z]{3})\)$/) ?? v.match(/^([A-Za-z]{3})$/);
  return m ? m[1].toUpperCase() : "";
}

function fmtPrice(n: number): string {
  if (n >= 100_000) return `${Math.round(n / 1_000)}k`;
  if (n >= 10_000) return `${Math.round(n / 1_000)}k`;
  return n.toLocaleString("en-US");
}

// ── types ─────────────────────────────────────────────────────────────────────

interface FareCalendarProps {
  origin: string;
  destination: string;
  selected?: Date;
  onSelect?: (date: Date | undefined) => void;
  disabled?: (date: Date) => boolean;
  initialFocus?: boolean;
  className?: string;
}

// ── component ────────────────────────────────────────────────────────────────

export function FareCalendar({
  origin,
  destination,
  selected,
  onSelect,
  disabled,
  initialFocus,
  className,
}: FareCalendarProps) {
  const [fares, setFares] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const orig = extractCode(origin);
    const dest = extractCode(destination);
    if (!orig || !dest || orig === dest) return;

    let cancelled = false;
    setLoading(true);
    setFares({});

    fetch(`/api/flights/fare-calendar?origin=${orig}&destination=${dest}`)
      .then((r) => r.json())
      .then((data) => { if (!cancelled) setFares(data ?? {}); })
      .catch(() => { if (!cancelled) setFares({}); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [origin, destination]);

  // Price percentiles for colour coding
  const priceValues = Object.values(fares).filter((p) => p > 0).sort((a, b) => a - b);
  const p33 = priceValues[Math.floor(priceValues.length * 0.33)] ?? Infinity;
  const p66 = priceValues[Math.floor(priceValues.length * 0.66)] ?? Infinity;

  const DayContent = useCallback(
    ({ date }: DayContentProps) => {
      const key = format(date, "yyyy-MM-dd");
      const price = fares[key];
      const colorCls = price
        ? price <= p33
          ? "text-green-600"
          : price <= p66
            ? "text-amber-500"
            : "text-rose-500"
        : "";

      return (
        <div className="flex flex-col items-center justify-start gap-[2px] pt-[2px] pb-[1px]">
          <span className="text-sm leading-none">{date.getDate()}</span>
          {price ? (
            <span className={cn("text-[8px] font-semibold leading-none tabular-nums", colorCls)}>
              ${fmtPrice(price)}
            </span>
          ) : loading ? (
            <span className="text-[8px] leading-none text-muted-foreground/50">·</span>
          ) : (
            <span className="text-[8px] leading-none opacity-0">·</span>
          )}
        </div>
      );
    },
    [fares, loading, p33, p66],
  );

  return (
    <DayPicker
      mode="single"
      selected={selected}
      onSelect={onSelect}
      disabled={disabled}
      initialFocus={initialFocus}
      showOutsideDays
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-sm font-medium",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell: "text-muted-foreground rounded-md w-10 font-normal text-[0.8rem]",
        row: "flex w-full mt-1",
        // taller cells to fit the price label beneath the date number
        cell: "h-[52px] w-10 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-[52px] w-10 p-0 font-normal aria-selected:opacity-100",
        ),
        day_range_end: "day-range-end",
        day_selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        day_today: "bg-accent text-accent-foreground",
        day_outside:
          "day-outside text-muted-foreground aria-selected:bg-accent/50 aria-selected:text-muted-foreground",
        day_disabled: "text-muted-foreground opacity-50",
        day_range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
      }}
      components={{
        IconLeft: ({ className: cls, ...rest }) => (
          <ChevronLeft className={cn("h-4 w-4", cls)} {...rest} />
        ),
        IconRight: ({ className: cls, ...rest }) => (
          <ChevronRight className={cn("h-4 w-4", cls)} {...rest} />
        ),
        DayContent,
      }}
    />
  );
}
